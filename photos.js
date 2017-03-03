var express = require('express'),
    _       = require('lodash'),
    aws     = require('aws-sdk'),
    awsPromised = require('aws-promised');


aws.config.update({accessKeyId: process.env.ACCESSKEY, secretAccessKey: process.env.SECRETACCESSKEY});
var s3 = awsPromised.s3();

var app = module.exports = express.Router();

app.get('/photos/get/:marker/:user', function(req, res) {

  var params = {
    Bucket: req.params.user + 'imageupload',
    Prefix:  req.params.marker + "/"
  };

  s3.listObjects(params, function (err,data) {
    if(err) {
      res.send(err);
    } else {
      res.send(data);
    }

  });

});

app.post('/bucket', function(req, res) {

  var params = {
    Bucket: req.body.bucket + 'imageupload',
    ACL: 'public-read-write',
    CreateBucketConfiguration: {
      LocationConstraint: 'us-west-1'
    }
  };

  s3.createBucket(params, function(err, data) {
    if (err) {
      res.send("Error", err);
    } else {
      res.send("Success");

      var policyJson = {
        "Version": "2012-10-17",
        "Id": "Policy1483511424050",
        "Statement": [
          {
            "Sid": "Stmt1483511411174",
            "Effect": "Allow",
            "Principal": {
              "AWS": "*"
            },
            "Action": [
              "s3:GetObject",
              "s3:PutObject",
              "s3:PutObjectAcl",
              "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::" + req.body.bucket + "imageupload/*"
          }
        ]
      }

      var policyParams = {
        Bucket: req.body.bucket + 'imageupload',
        Policy: JSON.stringify(policyJson)
      };
      s3.putBucketPolicy(policyParams, function(err, data) {
        if (err) {
          console.log(err);
        }
        else {
          var corsParams = {
            Bucket: req.body.bucket + 'imageupload',
            CORSConfiguration: {
              CORSRules: [
                {
                  AllowedMethods: [
                    'GET',
                    'POST',
                    'PUT',
                    'DELETE'
                  ],
                  AllowedOrigins: [
                    '*'
                  ],
                  AllowedHeaders: [
                    '*'
                  ],
                  MaxAgeSeconds: 3000
                }
              ]
            }
          };
          s3.putBucketCors(corsParams, function(err, data) {
            if (err) {
              console.log(err); // an error occurred
            }
          });
        }
      });
    }
  });

});


app.post('/album/delete', function (req, res) {

    var params = {
      Bucket: req.body.user + 'imageupload',
      Prefix: req.body.album + "/"
    };

    s3.listObjects(params, function (err, data) {
      if (err) {
        console.log(err);
      }

      if (data.Contents.length === 0) {
        return;
      }

      params = {Bucket: req.body.user + 'imageupload'};
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
    Bucket: req.body.user + 'imageupload',
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




