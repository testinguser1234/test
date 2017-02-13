var express = require('express'),
    _       = require('lodash'),
    aws     = require('aws-sdk'),
    awsPromised = require('aws-promised');

var app = module.exports = express.Router();

aws.config.update({accessKeyId: '', secretAccessKey: ''});
var s3 = awsPromised.s3();

app.get('/photos/get/:marker', function(req, res) {

  var params = {
    Bucket: 'pasalo92imageupload',
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

app.post('/album/delete', function (req, res) {

    var params = {
      Bucket: 'pasalo92imageupload',
      Prefix: req.body.album + "/"
    };

    s3.listObjects(params, function (err, data) {
      if (err) {
        console.log(err);
      }

      if (data.Contents.length === 0) {
        return;
      }

      params = {Bucket: 'pasalo92imageupload'};
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
    Bucket: 'pasalo92imageupload',
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


app.post('/photo/upload', function (req, res) {

  var uniqueString = function () {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 8; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

  if (req.body.photo) {

    var fileSize = Math.round(parseInt(req.body.photo.size, 10));
    if (fileSize > 1058576) {
      res.send('Sorry, your attachment is too big. Maximum 1MB file attachment allowed');
      return false;
    }

    // Prepend Unique String To Prevent Overwrites
    var uniqueFileName = uniqueString() + '-' + req.body.photo.name;

    var params = {
      Key: req.body.markNum.toString() + "/" + uniqueFileName,
      ContentType: req.body.photo.type,
      Body: req.body.photo,
      ServerSideEncryption: 'AES256',
      Bucket: 'pasalo92imageupload'
    };

    s3.putObject(params, function (err) {
      if (err) {
        res.send(err.message);
        return false;
      }
      else {
        // Upload Successfully Finished
        res.send('File Uploaded Successfully');
        // callBucket();
        // $scope.uploadProgress = 0;
        // $scope.$digest();
        // $scope.showProgress = false;
      }
    });
        // .on('httpUploadProgress', function (progress) {
        //   $scope.showProgress = true;
        //   $scope.uploadProgress = Math.round(progress.loaded / progress.total * 100);
        //   $scope.$digest();
        // });
  }
  else {
    // No File Selected
    res.send('Please select a file to upload');
  }

});


