

var globalobj;
var expenseamountid = document.getElementById('expenseamount');
var descriptionid = document.getElementById('description');
var itemsid= document.getElementById('items');

var messageid = document.getElementById('message');

var buttonid = document.getElementById('button');

var leaderboardid = document.getElementById('leaderboard');

buttonid.addEventListener('click', save);

leaderboardid.addEventListener('click', showleaderboard);



async function showleaderboard() {
  try {
    var jwttoken = localStorage.getItem('jwt_token');
    console.log(jwttoken);
    console.log('test');
    const userData = {
      jwttoken: jwttoken,
    };

    const response = await fetch('/showleaderboard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log('got response');
    //console.log(data);
    console.log('test');

    let leaderboardheadingid = document.getElementById('leaderboardheading');

    leaderboardheadingid.style.display = "block";

    //console.log(data.leaderboardData);

    const showleaderboarddata = data.leaderboardData; // Assuming your data variable is named 'data'

    // Sort the data based on totalexpense in descending order
    showleaderboarddata.sort((a, b) => b.totalexpense - a.totalexpense);

    for (const leaderboarddata of showleaderboarddata) {
      const showleaderboarditemsid = document.getElementById("showleaderboarditems");

      const newLi = document.createElement("li");

      newLi.innerHTML = `${leaderboarddata.name} - ${leaderboarddata.totalexpense}`;

      showleaderboarditemsid.appendChild(newLi);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}



var premiumbuttonid = document.getElementById('premiumbutton');

premiumbuttonid.addEventListener('click', buy_premium);

function hide_premium_button(){

  premiumbuttonid.style.visibility = 'hidden';  
  messageid.innerHTML = 'YOu are a premium user now';
  leaderboardid.style.display ='block';

}

function buy_premium() {
  const amount = premiumbuttonid.getAttribute('data-amount');


  console.log(amount)

  fetch('/createorder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: parseInt(amount),
    }),
  })
    .then(response => response.json())
    .then(order => {
      var options = {
        key:'rzp_test_oCHRYM35IRJby2',                            //'YOUR_RAZORPAY_KEY_ID',
        amount: order.amount,
        currency: 'INR',
        name: 'Your Company Name',
        description: 'Premium Subscription',
        order_id: order.id,
        handler: function (response) {
          // Handle the payment success response
          console.log('Payment successful:', response);
          alert('You are a premium user now');

          hide_premium_button();

          let jwttoken = localStorage.getItem('jwt_token');
          
          // Send the order status to the backend
          sendOrderStatus(order.id, 'success',jwttoken); // Modify the status as needed
          
        },
      };

      var rzp = new Razorpay(options);
      rzp.open();
    })
    .catch(error => {
      console.error('Error creating order:', error);
      alert('something went wrong');
    });
}

function sendOrderStatus(orderId, status, jwttoken) {
  fetch('/update-order-status', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      orderId: orderId,
      status: status,
      jwttoken:jwttoken,
    }),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Order status updated on the server:', data);
    })
    .catch(error => {
      console.error('Error updating order status:', error);
    });
}

///// (rest of your code)


function save(e)
{
    //showing Amount, description, items, when click on save button;
    
        const selectElement = document.getElementById("items");
    
        const deleteexpenseid = document.createElement("button");

        deleteexpenseid.textContent = "Delete Expense";
        deleteexpenseid.type = "button";
        deleteexpenseid.className = "deleteexpense";

        const additemsid = document.getElementById("additems");

        const newLi = document.createElement("li");
        
        const selectedOption = selectElement.value;

        newLi.innerHTML = expenseamountid.value+' '+ descriptionid.value+' '+itemsid.value;
        additemsid.appendChild(newLi);
        newLi.appendChild(deleteexpenseid);

           //saving data to backend;
          

           const jwttoken = localStorage.getItem('jwt_token');

           //console.log(jwttoken)



      async function save_to_database() {
        const userData = {
          expenseamount: expenseamountid.value,
          description: descriptionid.value,
          category: itemsid.value,
          jwt_encoded_token:jwttoken,
        };
        try {
          const response = await fetch('/add-expense', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          });
          const data = await response.json();
          //console.log(data); // Log the response data from the server
          //redirecting to homepage;
       // window.location.href = 'http://localhost:3000';
        } catch (error) {
          console.error('Error:', error);
        }
      }
      save_to_database(); 

      //window.location.reload();
                 
   }

   ///test B;
   
   async function fetchExpenses() {
    try {
           const response = await fetch('/readexpense');
           const data = await response.json();
           //console.log('ss');
           globalobj = data;
       } catch (error) {
           console.error('Error fetching data:', error);
       }
     }
 
    fetchExpenses().then(() => {

      //console.log(globalobj.expenses);

         for(let i=0;i<globalobj.expenses.length;i++)
         {
           //console.log(globalobj.expenses[i])

            //showing Amount, description, items, after fetching expense;
    
            const selectElement = document.getElementById("items");
        
            const deleteexpenseid = document.createElement("button");

            deleteexpenseid.textContent = "Delete Expense";
            deleteexpenseid.type = "button";
            deleteexpenseid.className = "deleteexpense";

            deleteexpenseid.addEventListener('click', () => {
              newLi.remove();
              delete_expense(globalobj.expenses[i].id);

           });

            const additemsid = document.getElementById("additems");

            const newLi = document.createElement("li");
            
            newLi.innerHTML = globalobj.expenses[i].expenseamount+' '+globalobj.expenses[i].description+' '+globalobj.expenses[i].category;
            additemsid.appendChild(newLi);
            newLi.appendChild(deleteexpenseid);

        }

    })


    async function delete_expense(id) {
      try {
        const response = await fetch(`/deleteuserexpense/${id}`, {
          method: 'DELETE',
        });
    
        if (response.ok) {
          console.log('expense Deleted');
    
          // Refresh the page or perform any other necessary action
          //window.location.reload();
          
        } else {
          console.error('Error deleting expense');
        }
      } catch (error) {
        console.error('Error:', error);
      }

    }
    

/////for refresh;

window.onload = () => {
  // Your code here
  console.log('Page loaded');

  function ispremium(jwttoken) {
    const userData = {
      jwttoken: jwttoken,
    };
  
    fetch('/ispremium', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
      .then(response => response.json())
      .then(data => {
        console.log(data.results[0].ispremium); // You can use the data here

        let ispremium = data.results[0].ispremium;

        if(ispremium=='1'){

          hide_premium_button();

        }

      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  
  // Get JWT token from localStorage
  const jwttoken = localStorage.getItem('jwt_token');
  
  // Call the function with the JWT token
  ispremium(jwttoken);
  
  

};









