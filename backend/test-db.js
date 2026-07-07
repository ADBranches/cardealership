require("dotenv").config();

const pool = require("./config/db");

pool.query("SELECT NOW()", (err, res) => {
  if (err) {
    console.error("Database Error:", err);
  } else {
    console.log("Database Connected!");
    console.log(res.rows);
  }

  process.exit();
});