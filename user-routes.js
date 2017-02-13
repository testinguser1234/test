var express = require('express'),
    _       = require('lodash'),
    //config  = require('./config'),
    jwt     = require('jsonwebtoken');

var app = module.exports = express.Router();

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

function createToken(user) {
    return jwt.sign(_.omit(user, 'password'), 'test_secret', { expiresIn: 60*1 });
}

// app.post('/users', function(req, res) {
//     if (!req.body.username || !req.body.password) {
//         return res.status(400).send("You must send the username and the password");
//     }
//     if (_.find(users, {username: req.body.username})) {
//         return res.status(400).send("A user with that username already exists");
//     }
//
//     var profile = _.pick(req.body, 'username', 'password', 'extra');
//     profile.id = _.max(users, 'id').id + 1;
//
//     users.push(profile);
//
//     res.status(201).send({
//         id_token: createToken(profile)
//     });
// });

app.get('/users', function (req, res) {

    var adminUsers = users.slice();
    var adminUsernames = [];
    adminUsers.splice(0,1);
    for (var i = 0; i < adminUsers.length; i ++) {
        adminUsernames.push(adminUsers[i].username);
    }

    res.send(adminUsernames);

});

app.post('/sessions/create', function(req, res) {
    var isAdmin = false;
    if (!req.body.usr.username || !req.body.usr.password) {
        return res.status(400).send("You must send the username and the password");
    }

    var user = _.find(users, {username: req.body.usr.username});
    if (!user) {
        return res.status(401).send("The username or password don't match");
    }

    if (user.password !== req.body.usr.password) {
        console.log(req.body.usr.password);
        return res.status(401).send("The username or password don't match");
    }

    if (user.username === 'admin') {
        isAdmin = true;
    }

    res.status(201).send({
        admin: isAdmin,
        userName: req.body.usr.username,
        id_token: createToken(user)
    });
});
