var express = require('express'),
    cors = require('cors'),
    logger = require('morgan'),
    http = require('http'),
    bodyParser = require('body-parser'),
    dotenv = require('dotenv');
    errorhandler = require('errorhandler');

var app = express();

dotenv.load();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(errorhandler());
app.use(cors());
app.use(require('./user-routes'));
app.use(require('./photos'));

marker = require('./markers'),

app.get('/markers', marker.findAll);
app.post('/markers', marker.addOrDelMarker);

app.use(function (err, req, res, next) {
    if (err.name === 'StatusError') {
        res.send(err.status, err.message);
    } else {
        next(err);
    }
});


var port = process.env.PORT || 8080;

http.createServer(app).listen(port, function (err) {
    console.log('listening in http://localhost:' + port);
});



