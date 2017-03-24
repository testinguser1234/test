var express = require('express'),
    _       = require('lodash'),
    aws     = require('aws-sdk'),
    awsPromised = require('aws-promised');


aws.config.update({accessKeyId: process.env.ACCESSKEY, secretAccessKey: process.env.SECRETACCESSKEY});
var s3 = awsPromised.s3();

var app = module.exports = express.Router();

app.get('/photos/get/:tripNum/:marker/:user', function(req, res) {

  var params = {
    Bucket:  process.env.MAPSBUCKET,
    Prefix:  req.params.user + "/trip-" + req.params.tripNum + "/marker-" + req.params.marker + "/"
  };

  s3.listObjects(params, function (err,data) {
    if(err) {
      res.send(err);
    } else {
      res.send(data);
    }

  });

});

app.get('/profile/:user', function(req, res) {

  var params = {
    Bucket:  process.env.PROFILEBUCKET,
    Prefix:  req.params.user + "/"
  };

  s3.listObjects(params, function (err,data) {
    if(err) {
      res.send(err);
    } else {
      res.send(data);
    }
  });

});


app.post('/album/delete', function (req, res) {

    var params = {
      Bucket: process.env.MAPSBUCKET,
      Prefix: req.body.user + "/" + req.body.album + "/"
    };

    s3.listObjects(params, function (err, data) {
      if (err) {
        console.log(err);
      }

      if (data.Contents.length === 0) {
        return;
      }

      params = {Bucket: process.env.MAPSBUCKET};
      params.Delete = {Objects: []};

      data.Contents.forEach(function (content) {
        params.Delete.Objects.push({Key: content.Key});
      });

      s3.deleteObjects(params, function (err, data) {
        if (err) {
          console.log(err);
          res.send("There was an error deleting the album");
        }
      });
    });

});

app.post('/photo/delete', function (req, res) {
  var params = {
    Bucket: process.env.MAPSBUCKET,
    Key: req.body.photo
  };

  s3.deleteObject(params, function (err, data) {
    if (err) {
      res.send(err, err.stack);
    } else {
      res.send(req.body.photo + " has been deleted");
    }
  });

});





