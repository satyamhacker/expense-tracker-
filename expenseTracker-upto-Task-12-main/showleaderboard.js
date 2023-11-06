const mysql = require('mysql');

const jwtmiddleware = require('./jwtmiddleware');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'expensetracker',
});


connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ', err);
    return;
  }
  console.log('Connected to the database');
});





const showleaderboard = (req, res) => {
  const { jwttoken } = req.body;

  let jwttokendecoded = jwtmiddleware.jwt_decode(jwttoken);
  let userid = jwttokendecoded.userId;

  const selectTotalexpenseQuery = 'SELECT name, totalexpense FROM expensetrackersignup';

  // Execute the SQL SELECT query using the database connection
  connection.query(selectTotalexpenseQuery, (error, results) => {
    if (error) {
      console.error('Error fetching user data: ', error);
      return res.status(500).json({ error: 'Error fetching user data' });
    }

    //console.log(results);

    // Assuming you want to return the user data as a JSON response
    // Modify this part according to your response format
    return res.status(200).json({ leaderboardData: results });
  });
};


module.exports = {
  showleaderboard,

}