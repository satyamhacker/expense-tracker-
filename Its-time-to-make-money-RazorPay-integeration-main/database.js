const mysql = require('mysql');
const bcrypt = require('bcrypt');

const Razorpay = require('razorpay');

const jwtmiddleware = require('./jwtmiddleware');

// const connection = mysql.createConnection({
//   host: 'localhost',
//   user: 'root',
//   password: '',
//   database: 'expensetracker',
// });


const razorpay = new Razorpay({
  key_id:'rzp_test_GvKETarsa8KLZ9',                        //'YOUR_KEY_ID',
  key_secret:'oswl6NYZ7tStIF5PUlbwkvHZ',                   //'YOUR_KEY_SECRET',
});

// connection.connect((err) => {
//   if (err) {
//     console.error('Error connecting to the database: ', err);
//     return;
//   }
//   console.log('Connected to the database');
// });

////for razorpay;

const createorder = async (req, res) => {
  try {
    const options = {
      amount: 1000, // Amount in paise (example: 1000 paise = ₹10)
      currency: 'INR',
      receipt: 'order_receipt_123',
    };
    
    const order = await razorpay.orders.create(options);
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
}

const updateorderstatus = (req, res) => {
  const { orderId, status } = req.body;

    console.log(orderId);
    console.log(status)

  // Update the order status in your database or perform other actions as needed
  // For demonstration purposes, we'll simply respond with the updated status
  const updatedStatus = 'updated'; // Modify this based on your implementation

  res.json({ status: updatedStatus });
}









//for signup;

// const signupcreate = (req, res) => {
//   const { name, email, password } = req.body;

//   // Validate input
//   if (!name || !email || !password) {
//     return res.status(400).json({ message: 'name, email, password are required' });
//   }

//   const checkEmailQuery = 'SELECT COUNT(*) as count FROM expensetracker WHERE email = ?';

//   connection.query(checkEmailQuery, [email], async (error, emailResults) => {
//     if (error) {
//       console.error('Error executing email query: ', error);
//       return res.status(500).json({ error: 'Error executing query' });
//     }

//     const emailCount = emailResults[0].count;

//     if (emailCount > 0) {
//       console.log('Email address already exists');
//       return res.status(400).json({ message: 'Email already exists' });
//     } else {
//       try {
//         // Hash the password before inserting into the database
//         const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of bcrypt rounds

//         const insertQuery = 'INSERT INTO expensetracker (name, email, password) VALUES (?, ?, ?)';

//         connection.query(insertQuery, [name, email, hashedPassword], (error, createResults) => {
//           if (error) {
//             console.error('Error creating user: ', error);
//             return res.status(500).json({ error: 'Error creating user' });
//           }

//           const insertedId = createResults.insertId;
//           console.log('User created successfully');
//           console.log(insertedId);
//           return res.status(201).json({ message: 'User created', insertedId });
//         });
//       } catch (error) {
//         console.error('Error hashing password: ', error);
//         return res.status(500).json({ error: 'Error hashing password' });
//       }
//     }
//   });
// };

// ///for login;

// var loginuserid;

// const login = (req, res) => {
//   // Destructure email and password from the request body
//   const { email, password } = req.body;

//   // Validate input: Check if both email and password are provided
//   if (!email || !password) {
//     return res.status(400).json({ message: 'Email and password are required' });
//   }

//   // SQL query to select the user's id and hashed password from the database
//   const selectQuery = 'SELECT id, password FROM expensetracker WHERE email = ?';

//   // Execute the SQL SELECT query using the database connection
//   connection.query(selectQuery, [email], async (error, results) => {
//     if (error) {
//       console.error('Error fetching user data: ', error);
//       return res.status(500).json({ error: 'Error fetching user data' });
//     }

//     // Check if the user was found in the database
//     if (results.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Extract the stored hashed password from the query results
//     const storedPassword = results[0].password;

//     try {
//       // Compare the provided password with the stored hashed password using bcrypt
//       const passwordMatches = await bcrypt.compare(password, storedPassword);

//       // If passwords do not match, return an unauthorized status
//       if (!passwordMatches) {
//         return res.status(401).json({ message: 'Wrong password' });
//       }

//       // If login is successful, log a message and return the user's id
//       console.log('Login successful');
//       const userId = results[0].id;////////user id is shown here;

//       //calling jwt function to encode userid;

//       let encoded_jwt_token =  jwtmiddleware.jwt_encode(userId)   //jwt_encode(userId);
      
//       loginuserid = userId;

//       return res.status(200).json({ message: 'Login successful', encoded_jwt_token });
//     } catch (error) {
//       console.error('Error comparing passwords: ', error);
//       return res.status(500).json({ error: 'Error comparing passwords' });
//     }
//   });
// };

// const addExpense = (req, res) => {
//   const { id, expenseamount, description, category, jwt_encoded_token } = req.body;

//   //console.log(jwt_encoded_token);

//   let jwt_decoded_token =  jwtmiddleware.jwt_decode(jwt_encoded_token);            //jwt_decode(jwt_encoded_token);

//   // console.log(jwt_decoded_token);
//   // console.log(jwt_decoded_token.userId);

//   console.log(loginuserid)

//   const insertExpenseQuery = 'INSERT INTO addexpense (id, expenseamount, description, category, loginuserid) VALUES (?, ?, ?, ?, ?)';

//   connection.query(insertExpenseQuery, [id, expenseamount, description, category, jwt_decoded_token.userId], (error, results) => {
//     if (error) {
//       console.error('Error adding expense: ', error);
//       return res.status(500).json({ error: 'Error adding expense' });
//     }

//     const insertedId = results.insertId;
//     console.log('Expense added successfully');
//     return res.status(201).json({ message: 'Expense added', insertedId });

//   });
// };



// // Fetch all expenses for a user
// const fetchExpenses = (req, res) => {

//   const selectAllExpensesQuery = 'SELECT * FROM addexpense WHERE loginuserid = ?'; // Use placeholder

//   connection.query(selectAllExpensesQuery, [loginuserid], (error, results) => {
//     if (error) {
//       console.error('Error fetching expenses: ', error);
//       return res.status(500).json({ error: 'Error fetching expenses' });
//     }

//     console.log('Expenses fetched successfully');
//     return res.status(200).json({ expenses: results });
//   });
// };

// const deleteuserexpense = (req, res) => {
//   const {id} = req.params;
//   console.log(req.params)

//   // Validate input
//   if (!id) {
//     return res.status(400).json({ message: 'expenseId is required' });
//   }

//   const deleteExpenseQuery = 'DELETE FROM addexpense WHERE id = ?';

//   connection.query(deleteExpenseQuery, [id], (error, results) => {
//     if (error) {
//       console.error('Error deleting expense: ', error);
//       return res.status(500).json({ error: 'Error deleting expense' });
//     }

//     console.log('Expense deleted successfully');
//     return res.status(200).json({ message: 'Expense deleted' });
//   });
// };

module.exports = {
  // signupcreate,
  // login,
  // addExpense,
  // fetchExpenses,
  // deleteuserexpense,
  createorder,
  updateorderstatus,
};


