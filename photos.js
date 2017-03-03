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

app.get('/env', function (req, res) {

  var env = {
    ak: process.env.ACCESSKEY + "PSL",
    sk: process.env.SECRETACCESSKEY + "Gg"
  }

  res.send(env);

});


// app.post('/photo/upload', upload.array('file'), function (req, res) {
//
//   console.log(req.file);
//   console.log(req.body);
//   // var path = req.files.image.path;
//   // fs.readFile(path, function(err, file_buffer){
//   //   var params = {
//   //     Bucket: 'makersquest',
//   //     Key: 'myKey1234.png',
//   //     Body: file_buffer
//   //   };
//   //
//   //   s3.putObject(params, function (perr, pres) {
//   //     if (perr) {
//   //       console.log("Error uploading data: ", perr);
//   //     } else {
//   //       console.log("Successfully uploaded data to myBucket/myKey");
//   //     }
//   //   });
//   // });
//
//
//   var uniqueString = function () {
//     var text = "";
//     var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//
//     for (var i = 0; i < 8; i++) {
//       text += possible.charAt(Math.floor(Math.random() * possible.length));
//     }
//     return text;
//   };
//
//   if (req.body.photo) {
//
//     var fileSize = Math.round(parseInt(req.body.photo.size, 10));
//     if (fileSize > 1058576) {
//       res.send('Sorry, your attachment is too big. Maximum 1MB file attachment allowed');
//       return false;
//     }
//
//     // Prepend Unique String To Prevent Overwrites
//     var uniqueFileName = uniqueString() + '-' + req.body.photo.name;
//
//     var params = {
//       Key: req.body.markNum.toString() + "/" + uniqueFileName,
//       ContentType: req.body.photo.type,
//       Body: req.body.photo,
//       ServerSideEncryption: 'AES256',
//       Bucket: 'pasalo92imageupload'
//     };
//
//     s3.putObject(params, function (err) {
//       if (err) {
//         res.send(err.message);
//         return false;
//       }
//       else {
//         // Upload Successfully Finished
//         res.send('File Uploaded Successfully');
//         // callBucket();
//         // $scope.uploadProgress = 0;
//         // $scope.$digest();
//         // $scope.showProgress = false;
//       }
//     });
//         // .on('httpUploadProgress', function (progress) {
//         //   $scope.showProgress = true;
//         //   $scope.uploadProgress = Math.round(progress.loaded / progress.total * 100);
//         //   $scope.$digest();
//         // });
//   }
//   else {
//     // No File Selected
//     res.send('Please select a file to upload');
//   }
//
// });


