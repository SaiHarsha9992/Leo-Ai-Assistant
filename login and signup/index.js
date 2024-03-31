const path = require('path');
const { fileURLToPath } = require('url');
const express = require('express');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const pg = require('pg');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static("public"));
app.use('/images', express.static('images'));

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "leoai",
  password: "99926142",
  port: 5432,
});

app.get("/", (req, res, next)=>{
    res.render('login.ejs', {message: ""});
   
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

    try {
        const client = await pool.connect();
        const result = await client.query(
            'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING user_id',
            [username, email]
        );
        const userId = result.rows[0].user_id;

        
        await client.query(
            'INSERT INTO credentials (user_id, password_hash) VALUES ($1, $2)',
            [userId, hashedPassword]
        );

        client.release();
        res.render('login.ejs', { message: "You are successfully registered" });
    } catch (err) {
        console.error('Error during registration:', err);
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const client = await pool.connect();
        const result = await client.query(
            'SELECT users.user_id, users.username, users.email, credentials.password_hash FROM users JOIN credentials ON users.user_id = credentials.user_id WHERE email = $1',
            [email]
        );
        const user = result.rows[0];
        console.log(email, password);
        
        const dataToSend = {
            username: user.username,
          };
          
          
          const serverUrl = 'http://localhost:5000/username';
          
        
          axios.post(serverUrl, (dataToSend))
            .then(response => {
              console.log('Response from server:', response.data);
            })
            .catch(error => {
              console.error('Error sending data:', error);
            });



        if (!user) {
            res.render('login.ejs', { message: "Invalid Email/Password" });
            client.release(); 
            return;
        }

        const passwordMatch = await bcrypt.compare(password, user.password_hash);

        if (!passwordMatch) {
            res.render('login.ejs', { message: "Invalid Email/Password" });
            console.log("THIS IS 2");
            client.release();
            return;
        }
        res.redirect('http://localhost:5000');
      
        
        
        client.release(); 
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).send('Error during login');
    }
});


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});