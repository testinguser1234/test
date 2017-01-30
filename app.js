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
// app.get('/wines/:id', wine.findById);
app.post('/markers', marker.addOrDelMarker);
// app.put('/wines/:id', wine.updateWine);
//app.delete('/markers/:latLng', marker.deleteMarker);

app.listen(3000);
console.log('Listening on port 3000...');