const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const cors = require('cors');

// Body Parser Middleware
app.use(bodyParser.json()); 
app.use(cors());
const server = app.listen(port, function () {
    //console.log('Server is running on: ' + port);
});

app.get('/', function (request, response) {
    const result = {};
    response.send(result);
});

app.use('/api/login/authenticate', require('./routes/login/authenticate'));

/*
// use this to test the authid token
app.use('/api/login/authorize', require('./routes/login/authorize'));
*/

app.use('/api/users', require('./routes/users/index'));

