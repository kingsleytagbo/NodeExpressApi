const express = require('express');
const app = express();
const port = process.env.PORT || 3011;
const bodyParser = require("body-parser");
const cors = require('cors');

// Body Parser Middleware
//app.use(bodyParser.json()); 
app.use(cors());
app.use(express.json({limit: '1mb'}));
app.use(express.urlencoded({limit: '1mb', extended: true, parameterLimit: 100}));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", '*');
    // if you add credentials include in the frontend, remove wildcards above and specify origin below
    //res.header("Access-Control-Allow-Origin", "http://localhost:8080" ),
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    if (req.methods === 'OPTIONS'){
        cosole.log({options: req});
        res.sendStatus(204)
    }
    next();
});
const server = app.listen(port, function () {
    console.log('Server is running on: ' + port);
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
app.use('/api/blog', require('./routes/blogs/index'));
app.use('/api/gallery', require('./routes/gallery/index'));

