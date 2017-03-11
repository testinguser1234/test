var express = require('express'),
    _       = require('lodash'),
    mongo = require('mongodb'),
    jwt     = require('jsonwebtoken');

var app = module.exports = express.Router();

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server(process.env.DB, 27017, {auto_reconnect: true});
db = new Db('pasalo92DB', server);

db.open(function(err, db) {
    if(!err) {
        db.collection('users', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'users' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

function createToken(user) {
    return jwt.sign(_.omit(user, 'password'), 'test_secret', { expiresIn: 60*300 });
}

app.post('/users', function(req, res) {
    var users;

    db.collection('users', function(err, collection) {

        if (err) {
            throw err
        } else {
            collection.find().toArray(function (err, items) {
                users = items;
                if (!req.body.usr.username || !req.body.usr.password) {
                    return res.status(400).send("You must send the username and the password");
                }
                if (_.find(users, {username: req.body.usr.username})) {
                    return res.status(400).send("A user with that username already exists");
                }

                var profile = _.pick(req.body.usr, 'username', 'password');
                profile.id = _.max(users, 'id').id + 1;

                collection.insert(profile, {safe: true}, function (err, result) {
                    if (err) {
                        res.send({'error': 'An error has occurred'});
                    } else {
                        console.log('Success: ' + JSON.stringify(result[0]));
                        res.send(result[0]);
                    }
                });

                res.status(201).send({
                    id_token: createToken(profile)
                });
            });
        }
    });

});

app.get('/users', function (req, res) {
    var users;

    db.collection('users', function(err, collection) {

        if (err) {
            throw err
        } else {
            collection.find().toArray(function (err, items) {
                users = items;
                var adminUsers = users.slice();
                var adminUsernames = [];
                adminUsers.splice(0, 1);
                for (var i = 0; i < adminUsers.length; i++) {
                    adminUsernames.push(adminUsers[i].username);
                }

                res.send(adminUsernames);
            });
        }
    });



});

app.post('/sessions/create', function(req, res) {
    var isAdmin = false;
    var users;

    db.collection('users', function(err, collection) {

        if (err) {
            throw err
        } else {
            collection.find().toArray(function (err, items) {
                users = items;

                if (!req.body.usr.username || !req.body.usr.password) {
                    return res.status(400).send("You must send the username and the password");
                }

                var user = _.find(users, {username: req.body.usr.username});
                if (!user) {
                    return res.status(401).send("The username or password don't match");
                }

                if (user.password !== req.body.usr.password) {
                    return res.status(401).send("The username or password don't match");
                }

                if (user.username !== 'guest') {
                    isAdmin = true;
                }

                res.status(201).send({
                    admin: isAdmin,
                    userName: req.body.usr.username,
                    id_token: createToken(user)
                });
            });
        }
    });


});


/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {

    var users = [
        {
            id: 1,
            username: 'guest',
            password: 'guest'
        },
        {
            id: 2,
            username: 'pasalo92',
            password: 'ulises'
        }
    ];

    db.collection('users', function(err, collection) {
        collection.insert(users, {safe:true}, function(err, result) {});
    });

};
