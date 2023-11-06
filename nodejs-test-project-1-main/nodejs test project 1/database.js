const mysql = require('mysql');


const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'appointmentapp',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ', err);
    return;
  }
  console.log('Connected to the database');
});

var globalvar;

const retrieve = (req, res) => {
  const query = 'SELECT * FROM appointmentapp';
  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error executing query: ', error);
      res.status(500).json({ error: 'Error retrieving users' });
    }
    else
    {
      res.json(results);
    }
    
  });
};

const create = (req, res) => {
    const { sellingprice, productname, items} = req.body;
  
    const query = 'INSERT INTO appointmentapp (sellingprice, productname, category) VALUES (?, ?, ?)';
    connection.query(query, [sellingprice, productname, items], (error, results) => {
      if (error) {
        console.error('Error executing query: ', error);
        res.status(500).json({ error: 'Error creating user' });
      } else {
        const insertedId = results.insertId;
        console.log('Data created successfully');
        res.json({ message: 'User created', insertedId });
      }
    });
  };

  const deleteuser = (req, res) => {
    const appointmentId = req.params.id; // Assuming you pass the appointment ID in the URL parameter

    const query = 'DELETE FROM appointmentapp WHERE id = ?';
    connection.query(query, [appointmentId], (error, results) => {
        if (error) {
            console.error('Error executing delete query: ', error);
            res.status(500).json({ error: 'Error deleting appointment' });
        } else {
            console.log('Appointment deleted successfully');
            res.json({ message: 'Appointment deleted' });
        }
    });
};




module.exports = {
  retrieve,
  create,
  deleteuser,
  // updateuser,
}
