const express = require('express');
const app = express();
const database = require('./database');

const path = require('path');

var currentDirPath = __dirname;

app.use(express.json()); // Add this line to parse JSON data


app.use(express.static(currentDirPath));



app.get('/', (req, res) => {
  const indexfile = path.join(currentDirPath, 'index.html')
  res.sendFile(indexfile);
});


//upto above correct;

app.post('/create', database.create);

app.get('/read', database.retrieve);

app.delete('/deleteuser/:id', database.deleteuser)


app.listen(3000, () => {
  console.log('Server started on port 3000');
});