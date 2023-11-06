const Sib = require('sib-api-v3-sdk');
const jwtmiddleware = require('./jwtmiddleware');
const {v4 : uuidv4} = require('uuid');

const mysqlconnection = require('./mysqlConnection')


const sendemail = async (req, res) => {

    const {email, jwttoken} = req.body;

    //console.log(email)

    let randomuuid = uuidv4();
    
    let decodedjwttoken = jwtmiddleware.jwt_decode(jwttoken);

    let userid = decodedjwttoken.userId;

    // console.log(userid)
    console.log(randomuuid)

    const insertForgetPasswordRequestQuery = 'INSERT INTO forgotpasswordrequests (uuid, userid, isactive) VALUES (?, ?, ?)';
    const insertForgetPasswordRequestQueryValues = [randomuuid, userid, '1'];

    mysqlconnection.connection.beginTransaction((beginError) => {
      if (beginError) {
        console.error('Error beginning transaction: ', beginError);
        return res.status(500).json({ error: 'Transaction error' });
      }
  
      mysqlconnection.connection.query(insertForgetPasswordRequestQuery, insertForgetPasswordRequestQueryValues, (insertError, insertResults) => {
        if (insertError) {
          console.error('Error adding expense: ', insertError);
          mysqlconnection.connection.rollback(() => {
            console.error('Transaction rolled back');
          });
          return res.status(500).json({ error: 'Error adding expense' });
        }
  
        mysqlconnection.connection.commit((commitError) => {
            if (commitError) {
              console.error('Error committing transaction: ', commitError);
              mysqlconnection.connection.rollback(() => {
                console.error('Transaction rolled back');
              });
              return res.status(500).json({ error: 'Transaction error' });
            }

          });
      });
    });




      try {
        const client = Sib.ApiClient.instance;
        const apiKey = client.authentications['api-key'];
        apiKey.apiKey =
          'xsmtpsib-9324828dbbca59659f5309c937fbfd5c54d089beb0925f82c798ae031c07557d-A8ph75TVdtKPkMwF';

        const tranEmailApi = new Sib.TransactionalEmailsApi();
        const sender = {
          email: 'sharpner@gmail.com',
          name: 'Expense Tracker',
        };
        const receivers = [
          {
            email: email,
          },
        ];

        const result = await tranEmailApi.sendTransacEmail({
          sender,
          to: receivers,
          subject: 'Sharpner Project',
          textContent: `
                from expenseTracker
            `,
            htmlContent: `
            <p>Your expenseTracker Reset password email</p>
            <p>Click <a href="http://localhost:3000/password/resetpassword/${randomuuid}">here</a> to reset your password.</p>
          `,
          params: {
            role: 'Frontend',
          },
        });

        //console.log(result);
        // You might want to send a response to the client indicating the success or completion.
        res.status(200).json({ message: 'Email sent successfully.' });
      } catch (error) {
        console.error(error);
        // Handle the error appropriately and send an error response to the client.
        res.status(500).json({ error: 'An error occurred while sending the email.' });
      }


};

module.exports = {
  sendemail,
};
