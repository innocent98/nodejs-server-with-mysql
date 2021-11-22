const router = require("express").Router();
const dbService = require("../config/database");
const dotenv = require("dotenv");

dotenv.config();

//register a new book
router.post("/register", async (req, res) => {
  try {
    const createdAT = new Date();
    const book = await new Promise((resolve, reject) => {
      const query =
        "INSERT INTO books (bookTitle, email, author, description, bookCover, price, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?);";

      dbService.query(
        query,
        [
          req.body.bookTitle,
          req.body.email,
          req.body.author,
          req.body.description,
          req.body.bookCover,
          req.body.price,
          createdAT,
        ],
        (err, result) => {
          if (err) reject(err);
          resolve(result);
        }
      );
    });
    res.status(200).json(book);
  } catch (err) {
    console.log(err);
  }
});

//ADD A BOOK TO FAVORITE LIST
router.post("/favorites/:book_id", async (req, res) => {
  try {
    const book_id = req.params.book_id;
    const user_id = req.body.user_id;
    const book = await new Promise((resolve, reject) => {
      const findBook =
        "SELECT * FROM favourites WHERE book_id = ? AND user_id = ?";
      dbService.query(findBook, [book_id, user_id], (err, result) => {
        if (err) reject(err);
        if (result.length == 0) {
          const query =
            "INSERT INTO favourites (book_id, user_id) VALUES (?, ?);";
          dbService.query(query, [book_id, user_id], (err, result) => {
            if (err) reject(err);
            resolve(result);
          });
        } else {
          res.status(403).json("Book added to favorite already!");
        }
      });
    });
    res.status(200).json("Book saved as favorite");
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET USER FAVORITE LISTS
router.get("/favorites/:user_id", async (req, res) => {
  try {
    const user_id = req.params.user_id;
    // const user_id = req.body.user_id;
    // const book_id = req.body.book_id;
    const user = await new Promise((resolve, reject) => {
      const query = "SELECT * FROM favourites WHERE user_id = ?;";
      dbService.query(query, [user_id], (err, result) => {
        if (err) reject(err);
        if (result.length == 0) {
          res.status(404).json("Your favorite list is empty!");
        } else {
          resolve(result);
        }
      });
    });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//REMOVE FROM FAVORITE LIST
router.delete("/unfavorites/:book_id", async (req, res) => {
  try {
    const user_id = req.body.user_id;
    const book_id = req.params.book_id;
    const book = await new Promise((resolve, reject) => {
      const findBook = "SELECT * FROM favourites WHERE book_id = ?;";
      dbService.query(findBook, [book_id], (err, result) => {
        if (err) console.log(err);
        if (result.length != 0) {
          const deleteQuery =
            "DELETE FROM favourites WHERE book_id = ? AND user_id = ?;";
          dbService.query(deleteQuery, [book_id, user_id], (err, result) => {
            if (err) reject(err);
            resolve(result);
          });
        } else {
          res.status(404).json("Book not in your favorite list");
        }
      });
    });
    res.status(200).json("Book successfully removed from your favorite list");
  } catch (err) {
    console.log(err);
    // res.status(500).json(err);
  }
});

module.exports = router;
