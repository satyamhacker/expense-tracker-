        // Function to fetch and display JSON data
        var globalobj;

        //accessing input data value;
        
        var sellingprice = document.getElementById('sellingprice');
        var productname = document.getElementById('productname');
        var items = document.getElementById('items');
        
        var buttonid = document.getElementById('button');
        
        buttonid.addEventListener('click', save);
        
    function save(e)
    {
        //showing sellingprice, productname, items, when click on save button;
        
            const selectElement = document.getElementById("items");
        
            const electronic = document.getElementById("electronicitems");
            const deleteoneitemid = document.createElement("button");
            const food = document.getElementById('fooditems');
            const skincare = document.getElementById('skincareitems');
          
            deleteoneitemid.textContent = "Delete Order";
            deleteoneitemid.type = "button";
            deleteoneitemid.className = "deleteorder";
        
            const newLi = document.createElement("li");
        
            const selectedOption = selectElement.value;
        
            newLi.innerHTML = sellingprice.value+' '+ productname.value+' '+selectElement.value;
            newLi.appendChild(deleteoneitemid);
        
            if (selectedOption === "Electronic") {
                electronic.appendChild(newLi);
              }
        
            else if(selectedOption === "Food"){
                food.appendChild(newLi);
            }
            else{
                skincare.appendChild(newLi);
            }

             //saving data to backend;

      async function save_to_database() {
        const userData = {
          sellingprice: sellingprice.value,
          productname: productname.value,
          items: items.value,
        };
        try {
          const response = await fetch('/create', {
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

      window.location.reload();
                 
   }


   function fetchData() {
    return  fetch('/read')
         .then(response => response.json())
         .then(data => {
             console.log('ss')
             globalobj = data;
              //console.log(globalobj)
 
         })
         .catch(error => {
             console.error('Error fetching data:', error);
         });
 }
 
 fetchData().then(() => {

    // console.log(globalobj);
 
         for(let i=0;i<globalobj.length;i++)
         {
         
            // console.log(globalobj[i].category)
            
            const electronic = document.getElementById("electronicitems");
            const deleteoneitemid = document.createElement("button");
            const food = document.getElementById('fooditems');
            const skincare = document.getElementById('skincareitems');
          
            deleteoneitemid.textContent = "Delete Order";
            deleteoneitemid.type = "button";
            deleteoneitemid.className = "deleteorder";

            deleteoneitemid.addEventListener('click', () => {

                newLi.remove();
                delete_order(globalobj[i].id);
             });
        
            const newLi = document.createElement("li");
        
            newLi.innerHTML = globalobj[i].sellingprice+' '+ globalobj[i].productname+' '+globalobj[i].category;
            newLi.appendChild(deleteoneitemid);
        
            if (globalobj[i].category === "Electronic") {
                electronic.appendChild(newLi);
              }
        
            else if(globalobj[i].category === "Food"){
                food.appendChild(newLi);
            }
            else{
                skincare.appendChild(newLi);
            }
        }

        ///delete when click on deleteorder button;

        async function delete_order(id) {
            try {
              const response = await fetch(`/deleteuser/${id}`, {
                method: 'DELETE',
              });
          
              if (response.ok) {
                console.log('Appointment deleted successfully');
          
                // Refresh the page or perform any other necessary action
                //window.location.reload();
                
              } else {
                console.error('Error deleting appointment');
              }
            } catch (error) {
              console.error('Error:', error);
            }
          }
          

    });
        
        
        