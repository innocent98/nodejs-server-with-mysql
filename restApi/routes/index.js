const router = require("express").Router();

const authRoute = require("./auth");
const userRoute = require("./user");
const bookRoute = require("./books");

router.use("/api/auth", authRoute);
router.use("/api/user", userRoute);
router.use("/api/books", bookRoute);

module.exports = router;
