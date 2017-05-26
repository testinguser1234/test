var mongo = require('mongodb'),
    bodyParser = require('body-parser');


var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server(process.env.DB2, 27017, {auto_reconnect: true});
db = new Db('pasalo92DB', server);

db.open(function(err, db) {
  if(!err) {
    console.log("Connected to 'pasalo92DB' database");
    db.collection('trips', {strict:true}, function(err, collection) {
      if (err) {
        console.log("The 'profiles' collection doesn't exist. Creating it with sample data...");
        populateDB();
      }
    });
  }
});


exports.findProfile = function(req, res) {
  db.collection('trips', function(err, collection) {
    collection.find( { user: req.params.user } ).toArray(function(err, items) {
      res.send(items);
    });
  });
};

exports.addProfile = function (req, res) {
  var profile = req.body;
  //console.log('Adding marker: ' + JSON.stringify(marker));
  db.collection('profiles', function(err, collection) {
    //if (marker.addOrDel == 'add') {

      collection.insert(trip, {safe:true}, function(err, result) {
        if (err) {
          res.send({'error':'An error has occurred'});
        } else {
          console.log('Success: ' + JSON.stringify(result[0]));
          res.send(result[0]);
        }
      });

    // } else {
    //
    //   collection.findOneAndDelete(
    //
    //       {"latLng": marker.latLng}
    //
    //   );
    // }

  });

};


/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {

  var profiles = [
    {
      username: pasalo92,
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

  db.collection('profiles', function(err, collection) {
    collection.insert(trips, {safe:true}, function(err, result) {});
  });

};