const express = require('express');
const app = express();
const database = require('./database');
const showleaderboard = require('./showleaderboard')
const sendemail = require('./sendemail');

const path = require('path');
// const { showleaderboard } = require('./test/showleaderboard');

var currentDirPath = __dirname;

app.use(express.json()); // Add this line to parse JSON data

app.use(express.static(currentDirPath));


app.get('/', (req, res) => {
  const indexfile = path.join(currentDirPath, 'signup.html')
  res.sendFile(indexfile);
});

//upto above correct;

app.post('/signup-create', database.signupcreate);

app.post('/login-create', database.login);

app.post('/add-expense', database.addExpense);

app.get('/readexpense', database.fetchExpenses);

app.delete('/deleteuserexpense/:id', database.deleteuserexpense);

app.post('/createorder', database.createorder);

// In your server code (e.g., database.js or wherever you define your routes)
app.post('/update-order-status', database.updateorderstatus);

app.post('/ispremium', database.check_user_is_premium);

app.post('/showleaderboard', showleaderboard.showleaderboard);

app.post('/password/forgotpassword', sendemail.sendemail);


app.listen(3000, () => {
  console.log('Server started on port 3000');
});