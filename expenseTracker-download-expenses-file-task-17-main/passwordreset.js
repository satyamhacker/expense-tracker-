const mysqlconnection = require('./mysqlConnection');

const jwtmiddleware = require('./jwtmiddleware');

const bcrypt = require('bcrypt');





const passwordreset =  (req, res) => {

    //console.log(req)

    let url = req.url;

    console.log(url);

    // Split the URL by forward slashes
    const segments = url.split('/');

    // Get the last segment
    const get_method_uuid = segments[segments.length - 1];

    console.log(get_method_uuid);

    //check uuid is same ;

    const selectAlluuid = 'SELECT * FROM forgotpasswordrequests WHERE uuid = ? AND isactive=1'; 

    mysqlconnection.connection.query(selectAlluuid, [get_method_uuid], (error, results) => {
      if (error) {
        console.error('Error fetching expenses: ', error);
        return res.status(500).json({ error: 'Error fetching expenses' });
      }
  
      console.log('Expenses fetched successfully');
      console.log(results);

      if(results.length>0)
      {
        res.redirect('/updatepassword.html');
      }
    
    });


}







const updatepassword = async (req, res) => {
    const { newpassword, jwttoken } = req.body;

    try {
        const decodedjwttoken = jwtmiddleware.jwt_decode(jwttoken);
        const userid = decodedjwttoken.userId;

        // Hash the password before inserting into the database
        const hashedPassword = await bcrypt.hash(newpassword, 10); // 10 is the number of bcrypt rounds

        const updateQuery1 = `
            UPDATE expensetrackersignup AS e
            JOIN forgotpasswordrequests AS f ON e.id = f.userid
            SET e.password = ?
            WHERE e.id = ?;
        `;

        const updateQuery2 = `
            UPDATE forgotpasswordrequests
            SET isactive = 0
            WHERE userid = ?;
        `;

        mysqlconnection.connection.beginTransaction((beginError) => {
            if (beginError) {
                console.error('Error beginning transaction: ', beginError);
                return res.status(500).json({ error: 'Transaction error' });
            }

            mysqlconnection.connection.query(updateQuery1, [hashedPassword, userid], (error, updateResults1) => {
                if (error) {
                    console.error('Error updating password: ', error);
                    mysqlconnection.connection.rollback(() => {
                        console.error('Transaction rolled back');
                    });
                    return res.status(500).json({ error: 'Error updating password' });
                }

                mysqlconnection.connection.query(updateQuery2, [userid], (error, updateResults2) => {
                    if (error) {
                        console.error('Error updating isactive: ', error);
                        mysqlconnection.connection.rollback(() => {
                            console.error('Transaction rolled back');
                        });
                        return res.status(500).json({ error: 'Error updating isactive' });
                    }

                    mysqlconnection.connection.commit((commitError) => {
                        if (commitError) {
                            console.error('Error committing transaction: ', commitError);
                            mysqlconnection.connection.rollback(() => {
                                console.error('Transaction rolled back');
                            });
                            return res.status(500).json({ error: 'Transaction error' });
                        }

                        console.log('User password and isactive updated successfully');
                        return res.status(200).json({ message: 'Password and isactive updated successfully' });
                    });
                });
            });
        });

    } catch (error) {
        console.error('Error updating password: ', error);
        return res.status(500).json({ error: 'Error updating password' });
    }
};




module.exports = {
    updatepassword,
};




module.exports = {
    passwordreset,
    updatepassword,
}