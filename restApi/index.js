const express = require("express");
const app = express();
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const dotenv = require("dotenv");
const router = require("./routes/index");
const pool = require("./config/database");

dotenv.config();

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(morgan("common"));
app.use(cors());

app.use(router);

//creating a local server
app.listen(process.env.PORT, () => {
  console.log(`server is up and running`);
});
