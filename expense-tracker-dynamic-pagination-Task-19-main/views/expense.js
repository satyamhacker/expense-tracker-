var globalobj;
var expenseamountid = document.getElementById('expenseamount');
var descriptionid = document.getElementById('description');
var itemsid= document.getElementById('items');

var messageid = document.getElementById('message');

var buttonid = document.getElementById('button');

var leaderboardid = document.getElementById('leaderboard');

var downloadexpensesid = document.getElementById('downloadexpenses');

downloadexpensesid.addEventListener('click', download_expenses);

buttonid.addEventListener('click', save);

leaderboardid.addEventListener('click', showleaderboard);

var expense_sizeid = document.getElementById('expense_size');

expense_sizeid.addEventListener("change", () => {
  clickCount=0;
  
  fetchExpenses();

});


async function showleaderboard() {
  try {
    var jwttoken = localStorage.getItem('jwt_token');
    //console.log(jwttoken);
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
   // console.log('got response');
    //console.log(data);

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
        key:'rzp_test_i9xLVOw6ARS71H',                            //'YOUR_RAZORPAY_KEY_ID',
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


let clickCount = 0; // Initialize the click count

function next_expense_button(){

  const additemsid = document.getElementById("additems");

  const numberOfItems = additemsid.querySelectorAll("li").length;
  
  if(numberOfItems>expense_sizeid.value || numberOfItems<expense_sizeid.value)
  {
    alert('sorry no more expenses available');
  }
  else
  {
    fetchExpenses();
  }
  
}

function prev_expense_button(){

  if(clickCount=='1')
  {
    alert('sorry no previous expenses available');
  }
  else{

    clickCount--;
    clickCount--;
  
    fetchExpenses();

  }

}


async function fetchExpenses() {
  try {

      clickCount++; // Increment the click count;
     
      let additemsid = document.getElementById("additems");
      additemsid.innerHTML = "";

      const jwttoken = localStorage.getItem('jwt_token');
      const expense_size_start_limit = expense_sizeid.value;
      const expense_size_end_limit = expense_sizeid.value*clickCount;

      const response = await axios.post('/readexpense', {
           clickCount:clickCount,
           expense_size_start_limit:expense_size_start_limit,
           expense_size_end_limit:expense_size_end_limit,
          jwt_encoded_token: jwttoken
      });

      if (response.status === 200) {
          const data = response.data;
          globalobj = data;

          //console.log(data.expenses)

          for (let i = 0; i < globalobj.expenses.length; i++) {
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
          
              newLi.innerHTML = globalobj.expenses[i].expenseamount + ' ' + globalobj.expenses[i].description + ' ' + globalobj.expenses[i].category;
              additemsid.appendChild(newLi);
              newLi.appendChild(deleteexpenseid);
          }
      } 
      
      else {
          console.error('Error fetching data. Status:', response.status);
      }
  } catch (error) {
      console.error('Error:', error);
  }
}


    async function delete_expense(id) {
      try {
        const response = await fetch(`/deleteuserexpense/${id}`, {
          method: 'DELETE',
        });
    
        if (response.ok) {
          //console.log('expense Deleted');
    
          // Refresh the page or perform any other necessary action
          //window.location.reload();
          
        } else {
          console.error('Error deleting expense');
        }
      } catch (error) {
        console.error('Error:', error);
      }

    }

 
    function download_expenses() {
      var jwttoken = localStorage.getItem('jwt_token');
  
      axios.get('http://localhost:3000/user/download', {
          headers: {
              "Authorization": jwttoken
          },
          responseType: 'arraybuffer'
      })
      .then((response) => {
          console.log('File download successful');
  
          // Create a Blob from the response data
          const blob = new Blob([response.data], { type: 'application/pdf' });
  
          // Create a link to trigger the download
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = 'expenses.pdf';
          link.click();
  
          // Clean up the object URL
          URL.revokeObjectURL(link.href);
      })
      .catch((err) => {
          console.error(err);
      });
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
        //console.log(data.results[0].ispremium); // You can use the data here

        console.log(data)

        let ispremium = data.results.ispremium;

        //console.log(data.results.ispremium)

        if(ispremium==true){

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

   fetchExpenses();
    
};









