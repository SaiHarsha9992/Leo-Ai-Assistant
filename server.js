const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const pg = require('pg');


const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use('/images', express.static('images'));

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "leoai",
    password: "99926142",
    port: 5432,
  });

const port = 5000;

let username = "";
app.post('/username', (req, res) => {
  username = req.body.username;
});


app.get("/", (req, res)=>{
    res.render('index.ejs', { Username: username});
});
app.post("/login", (req, res) => {
    res.redirect('http://localhost:3000');
});
app.listen(port, ()=>{
  console.log("Server is running on"+port);
});