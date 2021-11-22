const router = require("express").Router();
const bcrypt = require("bcrypt");
const dbService = require("../config/database");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

//create a new user
router.post("/register", async (req, res) => {
  try {
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //create a new user
    const createdAT = new Date();
    const updatedAT = new Date();
    const password = hashedPassword;
    const isAdmin = req.body.isAdmin;
    const user = await new Promise((resolve, reject) => {
      const findUser = "SELECT * FROM user WHERE email = ?";
      dbService.query(findUser, [req.body.email], (err, result) => {
        if (err) reject(err);
        if (result.length == 0) {
          const query =
            "INSERT INTO user (firstName, lastName, email, password, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?);";

          dbService.query(
            query,
            [
              req.body.firstName,
              req.body.lastName,
              req.body.email,
              (req.body.password = password),
              createdAT,
              updatedAT,
            ],
            (err, result) => {
              if (err) reject(err);
              resolve(result);
            }
          );
        } else {
          res.status(403).json("email exist, try another one.");
        }
      });
    });
    res.status(200).json(user);
  } catch (err) {
    // console.log(err);
    res.status(500).json(err);
  }
});

//login user
router.post("/login", async (req, res) => {
  try {
    const user = await new Promise((resolve, reject) => {
      const email = req.body.email;
      const query = "SELECT * FROM user WHERE email = ?;";
      dbService.query(query, [email], (err, result) => {
        if (err) reject(err);
        if (result.length == 0) {
          return res.status(403).json({
            success: 0,
            data: "email does not exist",
          });
        }
        const hashedPassword = bcrypt.compareSync(
          req.body.password,
          result[0].password
        );
        if (hashedPassword) {
          result.password = undefined;
          //generate an access token
          const accessToken = jwt.sign(
            { hashedPassword: result },
            process.env.JWT_KEY,
            { expiresIn: "3600s" }
          );
          return res.status(200).json({
            message: "login successfully",
            user: result,
            token: accessToken,
          });
        } else {
          return res.status(403).json({
            data: "invalid credentials",
          });
        }
      });
    });
    res.status(200).json(user);
  } catch (err) {
    // console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
