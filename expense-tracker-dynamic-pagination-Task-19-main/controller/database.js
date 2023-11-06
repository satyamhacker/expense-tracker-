const sequelize = require('../models/sequelize');

const User = require('../models/User');

const Expense = require('../models/Expense');


const bcrypt = require('bcrypt');

const Razorpay = require('razorpay');

const jwtmiddleware = require('./jwtmiddleware');


const razorpay = new Razorpay({
  key_id:'rzp_test_i9xLVOw6ARS71H',                        //'YOUR_KEY_ID',
  key_secret:'3OFSNOeI4AMuoWtpXWI6yAfP',                   //'YOUR_KEY_SECRET',
});


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



const updateorderstatus = async (req, res) => {
  try {
    const { orderId, status, jwttoken } = req.body;
    const decodedjwttoken = jwtmiddleware.jwt_decode(jwttoken);

    //console.log(decodedjwttoken.userId);

    if (status === 'success') {
      const ispremium = 1;
      await make_user_premium(decodedjwttoken.userId, ispremium);
    }

    // Update the order status in your database or perform other actions as needed
    // For demonstration purposes, we'll simply respond with the updated status
    const updatedStatus = 'updated'; // Modify this based on your implementation

    res.json({ status: updatedStatus });
  } catch (error) {
    console.error('Error updating order status: ', error);
    res.status(500).json({ error: 'Error updating order status' });
  }
};

async function make_user_premium(userid, ispremium) {
  try {
    // Update user's ispremium using Sequelize
    const user = await User.findByPk(userid);
    if (user) {
      user.ispremium = ispremium;
      await user.save();
      console.log('User became premium');
    } else {
      console.error('User not found');
    }
  } catch (error) {
    console.error('Error updating user data: ', error);
    throw new Error('Error updating user data');
  }
}




const check_user_is_premium = async (req, res) => {
  try {
    const { jwttoken } = req.body;
    const jwt_decoded_token = jwtmiddleware.jwt_decode(jwttoken);

    const user = await User.findByPk(jwt_decoded_token.userId, {
      attributes: ['ispremium'],
    });

    if (!user) {
      console.error('User not found');
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ message: 'test', results: user });
  } catch (error) {
    console.error('Error fetching user data: ', error);
    return res.status(500).json({ error: 'Error fetching user data' });
  }
};




// for signup;
const signupcreate = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email, password are required' });
    }

    // Check if email already exists
    const emailCount = await User.count({ where: { email } });
    if (emailCount > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    console.log('User created successfully');
    return res.status(201).json({ message: 'User created', insertedId: newUser.id });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Error creating user' });
  }
};

///for login;

// var loginuserid;

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validate input: Check if both email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find the user by email
    const user = await User.findOne({ where: { email } });

    // Check if the user was found in the database
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Compare the provided password with the stored hashed password using bcrypt
    const passwordMatches = await bcrypt.compare(password, user.password);

    // If passwords do not match, return an unauthorized status
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Wrong password' });
    }

    // If login is successful, log a message and return the user's id
    console.log('Login successful');
    const userId = user.id;

    const ispremium = user.ispremium;

    const encoded_jwt_token = jwtmiddleware.jwt_encode(userId, ispremium);

    return res.status(200).json({ message: 'Login successful', encoded_jwt_token });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Error during login' });
  }
};



const addExpense = async (req, res) => {
  const { expenseamount, description, category, jwt_encoded_token } = req.body;

  try {
    const jwt_decoded_token = jwtmiddleware.jwt_decode(jwt_encoded_token);

    // Create a transaction
    const transaction = await sequelize.transaction();

    try {
      // Create the expense
      const createdExpense = await Expense.create({
        expenseamount,
        description,
        category,
        loginuserid: jwt_decoded_token.userId,
      }, { transaction });

      // Update the user's total expense
      const user = await User.findByPk(jwt_decoded_token.userId, { transaction });
      const updatedTotalExpense = Number(user.totalexpense) + Number(expenseamount);
      user.totalexpense = updatedTotalExpense; // Update the attribute value
      await user.save({ transaction });

      // Commit the transaction
      await transaction.commit();

      console.log('Expense added and user updated successfully');
      return res.status(201).json({ message: 'Expense added and user updated' });
    } catch (error) {
      // Rollback the transaction on error
      await transaction.rollback();
      console.error('Error during adding expense and updating user:', error);
      return res.status(500).json({ error: 'Error during adding expense and updating user' });
    }
  } catch (error) {
    console.error('Error during decoding JWT:', error);
    return res.status(400).json({ error: 'Error during decoding JWT' });
  }
};


// Fetch all expenses for a user

const fetchExpenses = async (req, res) => {
  const {clickCount, expense_size_start_limit,expense_size_end_limit ,jwt_encoded_token } = req.body;

  try {
    const jwt_decoded_token = jwtmiddleware.jwt_decode(jwt_encoded_token);

    const loginuserid = jwt_decoded_token.userId;

    ////Fetch all expenses for the user within the specified limit

   

    ////test B;

    console.log(clickCount);
    console.log(expense_size_start_limit);
    console.log(expense_size_end_limit);

    if(clickCount=='1')
    {
      var  expenses = await Expense.findAll({
        where: { loginuserid },
        limit: Number(expense_size_start_limit),
      });

    }
    else
    {
      var expenses = await Expense.findAll({
        where: { loginuserid },
        offset: Number(expense_size_start_limit), // Set this to your desired start offset
        limit:  Number(expense_size_end_limit)-Number(expense_size_start_limit), // Calculate the difference between start and end offsets
      });

    }

    ////test A;

    console.log('Expenses fetched successfully');
    return res.status(200).json({ expenses });
  } catch (error) {
    console.error('Error during fetching expenses:', error);
    return res.status(500).json({ error: 'Error during fetching expenses' });
  }
};



const deleteuserexpense = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: 'expenseId is required' });
  }

  try {
    const transaction = await sequelize.transaction();

    // Find the expense by ID
    const expense = await Expense.findByPk(id, { transaction });

    if (!expense) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Expense not found' });
    }

    const userId = expense.loginuserid;
    const expenseAmount = expense.expenseamount;

    // Delete the expense
    await expense.destroy({ transaction });

    // Update the user's total expense
    await sequelize.query(
      'UPDATE userssignup SET totalexpense = totalexpense - :expenseAmount WHERE id = :userId',
      {
        replacements: { expenseAmount, userId },
        type: sequelize.QueryTypes.UPDATE,
        transaction,
      }
    );

    await transaction.commit();

    console.log('Expense deleted successfully');
    return res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    return res.status(500).json({ error: 'Error deleting expense' });
  }
};



























module.exports = {
  signupcreate,
  login,
  addExpense,
  fetchExpenses,
  deleteuserexpense,
  createorder,
  updateorderstatus,
  check_user_is_premium,
};

