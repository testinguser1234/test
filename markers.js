var mongo = require('mongodb'),
    bodyParser = require('body-parser');


var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server(process.env.DB2, 27017, {auto_reconnect: true});
db = new Db('pasalo92DB', server);

db.open(function (err, db) {
    if (!err) {
        console.log("Connected to 'pasalo92DB' database");
        db.collection('trips', {strict: true}, function (err, collection) {
            if (err) {
                console.log("The 'trips' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});


// exports.findAll = function(req, res) {
//   db.collection('markers', function(err, collection) {
//     collection.find( { user: req.params.user } ).toArray(function(err, items) {
//       res.send(items);
//     });
//   });
// };

exports.findTrip = function (req, res) {
    db.collection('trips', function (err, collection) {
        collection.find({user: req.params.user}).toArray(function (err, items) {
            res.send(items);
        });
    });
};

exports.addCaption = function (req, res) {
    var cap = req.body.caption;

    db.collection('markers', function (err, collection) {
        console.log(cap);
        console.log(req.body);
        collection.update(
            {markerNum: parseInt(req.body.marker), user: req.body.user, tripNum: req.body.tripNum},
            {$set: {caption: cap}},
            {upsert: true}
            , function (err, doc) {
                if (err) {
                    console.log("error:" + err);
                } else {
                    console.log("doc:" + doc);
                    res.send("Success!");
                }
            });

    });

};

exports.addTrip = function (req, res) {
    var trip = req.body;
    //console.log('Adding marker: ' + JSON.stringify(marker));
    db.collection('trips', function (err, collection) {

        collection.insert(trip, {safe: true}, function (err, result) {
            if (err) {
                res.send({'error': 'An error has occurred: ' + err});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });

    });

};

exports.deleteTrip = function (req, res) {
    var trip = req.body;

    db.collection('trips', function (err, collection) {
        if (err) {
            res.send({'error': 'An error has occurred: ' + err});
        } else {
            collection.findOneAndDelete({"tripNum": trip.tripNum, "user": trip.userName});
            res.send(result[0]);
        }
    });
};

exports.deleteMarker = function(req, res) {

    var marker = req.body;
    //console.log('Adding marker: ' + JSON.stringify(marker));
    db.collection('markers', function (err, collection) {

        if (err) {
            res.send({'error': 'An error has occurred: ' + err});
        } else {
            collection.findOneAndDelete(
                {"markerNum": marker.markerNum, "tripNum": marker.tripNum, "user": marker.userName}
            );
        }

    });
};




/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function () {

    var trips = [
        {
            tripNum: 1,
            locations: [
                {
                    lat: 31.821564514920738,
                    lng: -116.5594482421875,
                    markerNum: 1
                },
                {
                    lat: -31.821564514920738,
                    lng: 116.5594482421875,
                    markerNum: 2
                }
            ],
            user: 'pablotest'
        },
        {
            tripNum: 2,
            locations: [
                {
                    lat: 41.821564514920738,
                    lng: -116.5594482421875,
                    markerNum: 1
                },
                {
                    lat: -41.821564514920738,
                    lng: 116.5594482421875,
                    markerNum: 2
                }
            ],
            user: 'pablotest'
        }];

    db.collection('trips', function (err, collection) {
        collection.insert(trips, {safe: true}, function (err, result) {
        });
    });

};