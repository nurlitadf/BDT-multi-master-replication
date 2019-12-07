const mysql = require('mysql');

const db = mysql.createConnection({
    host: "192.168.16.92",
    port: 4000,
    user: "root",
    password: "",
    database: "forest"
  });

db.connect((err) => {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = db;