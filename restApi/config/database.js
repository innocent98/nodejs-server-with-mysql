const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config();

//DB connection pool
const connection = mysql.createConnection({
  connectionLimit: 100,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

//connect to DB
connection.connect((err, connection) => {
  if (err) {
    throw err;
  }
  console.log("coonected to DB");
});

module.exports = connection;
