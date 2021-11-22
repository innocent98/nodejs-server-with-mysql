const router = require("express").Router();
const bcrypt = require("bcrypt");
const dbService = require("../config/database");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

//token verification
const verify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_KEY, (err, user) => {
      if (err) {
        return res.status(403).json("token is not valid");
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json("you are not authenticated");
  }
};

//GET ALL USERS
router.get("/user", async (req, res) => {
  try {
    const user = await new Promise((resolve, reject) => {
      const query = "SELECT * FROM user;";

      dbService.query(query, (err, results) => {
        if (err) reject(err);
        if (results.length == 0) {
          res.status(404).json("No user found!");
        } else {
          resolve(results);
        }
      });
    });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER BY ID
router.get("/user/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await new Promise((resolve, reject) => {
      const query = "SELECT * FROM user WHERE id = ?;";
      dbService.query(query, [id], (err, results) => {
        if (err) reject(err);
        if (results.length == 0) {
          res.status(404).json("user does not exist");
        } else {
          resolve(results);
        }
      });
    });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER BY USERNAME
router.get("/user/username/:username", async (req, res) => {
  try {
    const username = req.params.username;
    const user = await new Promise((resolve, reject) => {
      const query = "SELECT * FROM user WHERE username = ?;";
      dbService.query(query, [username], (err, results) => {
        if (err) reject(err);
        if (results.length == 0) {
          res.status(404).json("user does not exist");
        } else resolve(results);
      });
    });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE A USER BY ID
router.delete("/delete/:id", verify, async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const id = req.params.id;
      const userId = req.body.userId || req.body.isAdmin;
      const user = await new Promise((resolve, reject) => {
        const query = "DELETE FROM user WHERE id = ?;";

        dbService.query(query, [id, userId], (err, results) => {
          if (err) reject(err);
          if (results.affectedRows == 0) {
            return res.status(404).json({ data: "account does not exist" });
          } else {
            resolve(results);
          }
        });
      });

      res.status(200).json("account deleted successfully");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(404).json("you can only delete your account!");
  }
});

//UPDATE USER
router.put("/update/:id", verify, async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const updatedAT = new Date();
      const id = req.params.id;
      const userId = req.body.userId || req.body.isAdmin;
      const user = await new Promise((resolve, reject) => {
        const query =
          "UPDATE user SET firstName = ?, updatedAt = ? WHERE id = ?;";

        dbService.query(
          query,
          [req.body.firstName, updatedAT, id, userId],
          (err, result) => {
            if (err) reject(new Error(err));
            if (result.affectedRows == 0) {
              res.status(404).json("user not exist");
            } else {
              resolve(result);
            }
          }
        );
      });
      res.status(200).json("Account updated successfully");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(404).json("you can only update your account!");
  }
});

//UPDATE USER USERNAME
router.put("/update-username/:id", verify, async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      const updatedAT = new Date();
      const id = req.params.id;
      const userId = req.body.userId || req.body.isAdmin;
      const user = await new Promise((resolve, reject) => {
        const findUsername = "SELECT * FROM user WHERE username = ?";
        dbService.query(findUsername, [req.body.username], (err, result) => {
          if (err) reject(err);
          if (result.length == 0) {
            const query =
              "UPDATE user SET username = ?, updatedAt = ? WHERE id = ?;";

            dbService.query(
              query,
              [req.body.username, updatedAT, id, userId],
              (err, result) => {
                if (err) reject(new Error(err));
                if (result.affectedRows == 0) {
                  res.status(404).json("user not exist");
                } else {
                  resolve(result);
                }
              }
            );
          } else {
            res.status(403).json("username taken, please try another");
          }
        });
      });
      res.status(200).json("Username updated successfully");
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(404).json("you can only update your account!");
  }
});

//UPDATE USER PASSWORD
router.put("/password-reset/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    try {
      //generate new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password, salt);
      // const password = hashedPassword;

      const updatedAT = new Date();

      const id = req.params.id;
      const userId = req.body.userId || req.body.isAdmin;
      const user = await new Promise((resolve, reject) => {
        const query =
          "UPDATE user SET password = ?, updatedAt = ? WHERE id = ?;";

        dbService.query(
          query,
          [(req.body.password = hashedPassword), updatedAT, id, userId],
          (err, result) => {
            if (err) reject(new Error(err));
            if (result.affectedRows == 0) {
              res.status(404).json("user not exist");
            } else {
              resolve(result);
            }
          }
        );
      });
      res.status(200).json(user);
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(404).json("you can only update your account password!");
  }
});

module.exports = router;
