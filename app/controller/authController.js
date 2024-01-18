"use strict";

var Auth = require("../model/authModel.js");
const AWS = require("aws-sdk");
const path = require("path");
const async = require("async");
const USER_KEY = process.env.ACCESS_KEY;
const USER_SECRET = process.env.SECRET_KEY;
const BUCKET_NAME = process.env.BUCKET;

let s3bucket = new AWS.S3({
  accessKeyId: USER_KEY,
  secretAccessKey: USER_SECRET,
  Bucket: BUCKET_NAME,
});

exports.register = function (req, res) {
  var param = req.body;
  Auth.register(param, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};
exports.admLogin = function (req, res) {
  var data = {};
  var param = req.body;
  Auth.admLogin(param, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};
exports.userLogin = function (req, res) {
  var data = {};
  var param = req.body;
  Auth.userLogin(param, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.getAllUsers = function (req, res) {
  var data = {};
  Auth.getAllUsers(function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.uploadProfilePic = function (req, res) {
  const param = req.body;
  if (req.files != null) {
    let getFile = req.files.file; //mimetype
    var ext = path.extname(getFile.name);
    let imageTitle = getFile.name;
    var filename = Date.now() + "_" + imageTitle + ext;
    var fileData = getFile["data"];
    var r = 0;
    var imageName = `${imageTitle}_${new Date().getTime()}`;
    s3bucket.createBucket(function () {
      var params = {
        Bucket: BUCKET_NAME + "/profile_pic/" + imageName,
        Key: filename,
        ACL: "public-read",
        Body: fileData,
      };
      s3bucket.upload(params, function (err, data) {
        if (err) {
          console.log("Error uploading", err);
        }
        param.filepath = data.Location;

        Auth.uploadProfilePic(param, function (err, response) {
          if (err) res.send(err);
          res.json(response);
        });
      });
    });
  } else {
    res.send({
      error: false,
      msg: "Please select file",
      body: [],
    });
  }
};

exports.getUserById = function (req, res) {
  const param = req.params;
  Auth.getUserById(param, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.updateProfile = function (req, res) {
  const param = req.body;
  Auth.updateProfile(param, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.wishlistNft = function (req, res) {
  const param = req.params;
  Auth.wishlistNft(param, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};
exports.getWishlistNft = function (req, res) {
  const param = req.params;
  Auth.getWishlistNft(param, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.addtocartNft = function (req, res) {
  var params = req.params;
  Auth.addtocartNft(params, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.getAddtocartNft = function (req, res) {
  var params = req.params;
  Auth.getAddtocartNft(params, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.addPetDetails = function (req, res) {
  var params = req.body;

  Auth.addPetDetails(params, function (err, response) {
    if (err) {
      res
        .status(500)
        .json({ error: true, msg: "Error adding pet details" });
    } else {
      res.json(response);
    }
  });

  // if (req.files != null) {
  //   var photos = req.files.photos; // Array of files

  //   if (!Array.isArray(photos)) {
  //     photos = [photos]; // Ensure it's always an array
  //   }

  //   var uploadedPhotos = [];

  //   // Iterate through each photo in the array
  //   async.each(
  //     photos,
  //     function (photo, callback) {
  //       var ext = path.extname(photo.name);
  //       var imageTitle = photo.name;
  //       var filename = Date.now() + "_" + imageTitle + ext;
  //       var fileData = photo.data;
  //       var imageName = `${imageTitle}_${new Date().getTime()}`;

  //       s3bucket.createBucket(function () {
  //         var param = {
  //           Bucket: BUCKET_NAME + "/profile_pic/" + imageName,
  //           Key: filename,
  //           ACL: "public-read",
  //           Body: fileData,
  //         };

  //         s3bucket.upload(param, function (err, data) {
  //           if (err) {
  //             console.log("Error uploading", err);
  //             callback(err);
  //           } else {
  //             uploadedPhotos.push(data.Location);
  //             callback();
  //           }
  //         });
  //       });
  //     },
  //     function (err) {
  //       if (err) {
  //         res.status(500).json({ error: true, msg: "Error uploading photos" });
  //       } else {
  //         params.photos = uploadedPhotos;
  //         Auth.addPetDetails(params, function (err, response) {
  //           if (err) {
  //             res
  //               .status(500)
  //               .json({ error: true, msg: "Error adding pet details" });
  //           } else {
  //             res.json(response);
  //           }
  //         });
  //       }
  //     }
  //   );
  // } else {
  //   res.status(400).json({
  //     error: true,
  //     msg: "Please select file(s)",
  //   });
  // }
};

exports.getPetDetailsByUserId = function (req, res) {
  const param = req.params;
  Auth.getPetDetailsByUserId(param, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.getPetDetailsByCatid = function (req, res) {
  const param = req.params;
  console.log("check_controller_param", param);
  Auth.getPetDetailsByCatid(param, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  })
}

exports.getNftById = function (req, res) {
  const param = req.params;
  Auth.getNftById(param, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  })
}




exports.addFile = function (req, res) {
  const param = {}; // Initialize param object

  if (req.files != null) {
    var photos = req.files.file; // Array of files

    if (!Array.isArray(photos)) {
      photos = [photos]; // Ensure it's always an array
    }

    const uploadedPhotos = [];

    // Iterate through each photo in the array
    async.each(
      photos,
      function (photo, callback) {
        const ext = path.extname(photo.name);
        const imageTitle = photo.name;
        const filename = Date.now() + '_' + imageTitle + ext;
        const fileData = photo.data;
        const imageName = `${imageTitle}_${new Date().getTime()}`;

        s3bucket.createBucket(function () {
          const params = {
            Bucket: `${BUCKET_NAME}/pics/${imageName}`,
            Key: filename,
            ACL: 'public-read',
            Body: fileData,
            // ContentType: photo["mimetype"]
          };

          s3bucket.upload(params, function (err, data) {
            if (err) {
              console.log('Error uploading', err);
              callback(err);
            } else {
              uploadedPhotos.push(data.Location);
              callback();
            }
          });
        });
      },
      function (err) {
        if (err) {
          res.status(500).json({ error: true, msg: 'Error uploading photos' });
        } else {
          param.photos = uploadedPhotos;
          Auth.addFile(param, function (err, response) {
            if (err) {
              res.status(500).json({ error: true, msg: 'Error adding pet details' });
            } else {
              res.json(response);
            }
          });
        }
      }
    );
  } else {
    res.status(400).json({
      error: true,
      msg: 'Please select file(s)',
    });
  }
};

exports.getAllPetDetails = function (req, res) {
  Auth.getAllPetDetails(function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
}


exports.getLatestPetDetails = function (req, res) {
  Auth.getLatestPetDetails(function (err, response) {
    if (err) response.send(err);
    res.json(response);
  })
}