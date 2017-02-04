var express = require('express'),
    marker = require('./markers');
    cors = require('./cors');

var app = express();

app.configure(function () {
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
    app.use(cors());
});


app.get('/markers', marker.findAll);
app.post('/markers', marker.addOrDelMarker);

app.listen(8080);
console.log('Listening on port 8080...');
