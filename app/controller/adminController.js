"use strict";

var Admin = require("../model/adminModel");
const AWS = require("aws-sdk");
const path = require("path");
const async = require("async");
const config = require("dotenv").config();
const USER_KEY = process.env.ACCESS_KEY;
const USER_SECRET = process.env.SECRET_KEY;
const BUCKET_NAME = process.env.BUCKET;

let s3bucket = new AWS.S3({
  accessKeyId: USER_KEY,
  secretAccessKey: USER_SECRET,
  Bucket: BUCKET_NAME,
});

exports.getHomepageData = (req, res) => {
  Admin.getHomepageData((err, response) => {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.updateHomepage = (req, res) => {
  const param = req.body;
  console.log("==================", param);
  if (req.files != null) {
    let getFile = req.files.file; //mimetype
    var ext = path.extname(getFile.name);
    let imageTitle = param.title;
    var filename = Date.now() + "_" + imageTitle + ext;
    var fileData = getFile["data"];
    var r = 0;
    var imageName = `${imageTitle}_${new Date().getTime()}`;
    s3bucket.createBucket(function () {
      var params = {
        Bucket: BUCKET_NAME + "/nftimage/" + imageName,
        Key: filename,
        ACL: "public-read",
        Body: fileData,
      };
      s3bucket.upload(params, function (err, data) {
        if (err) {
          console.log("Error uploading", err);
        }
        param.filepath = data.Location;
        // const new_data = {
        //   title: param.title,
        //   description: param.description,
        //   image_url: data.Location

        // };
        // var jsonString = Buffer.from(JSON.stringify(new_data));
        // s3bucket.createBucket(function () {
        // var params = {
        //   Bucket: BUCKET_NAME + "/json",
        //   Key: "filename.json",
        //   ACL: "public-read",
        //   ContentEncoding: "base64",
        //   ContentType: "application/json",
        //   Body: jsonString,
        // };

        // s3bucket.upload(params, function (err, data) {
        // if (err) {
        //   console.log("error in callback");
        //   console.log(err);
        // }
        // var finalUrl = data.Location;
        // param.nftUrl = finalUrl;

        Admin.updateHomepage(param, function (err, response) {
          if (err) res.send(err);
          res.json(response);
        });
        // });
        // });
      });
    });
  } else {
    Admin.updateHomepage(param, function (err, response) {
      if (err) res.send(err);
      res.json(response);
    });
  }
};

// exports.addNft = function (req, res) {

//   const param = req.body;
//   if (req.files != null) {
//     var photos = req.files.file; // Array of files

//     if (!Array.isArray(photos)) {
//       photos = [photos]; // Ensure it's always an array
//     }

//     const uploadedPhotos = [];

//     // Iterate through each photo in the array
//     async.each(
//       photos,
//       function (photo, callback) {
//         const ext = path.extname(photo.name);
//         const imageTitle = photo.name;
//         const filename = Date.now() + '_' + imageTitle + ext;
//         const fileData = photo.data;
//         const imageName = `${imageTitle}_${new Date().getTime()}`;

//         s3bucket.createBucket(function () {
//           const params = {
//             Bucket: `${BUCKET_NAME}/nft_image/${imageName}`,
//             Key: filename,
//             ACL: 'public-read',
//             Body: fileData,
//             ContentType: photo["mimetype"]
//           };

//           s3bucket.upload(params, function (err, data) {
//             if (err) {
//               console.log('Error uploading', err);
//               callback(err);
//             } else {
//               uploadedPhotos.push(data.Location);
//               callback();
//               const new_data = {
//                 title: param.title,
//                 image_url: data.Location,
//                 description: param.description
//               };
//               var jsonString = Buffer.from(JSON.stringify(new_data));
//               s3bucket.createBucket(function () {
//                 var params = {
//                   Bucket: BUCKET_NAME + "/json",
//                   Key: "filename.json",
//                   ACL: "public-read",
//                   ContentEncoding: "base64",
//                   ContentType: "application/json",
//                   Body: jsonString,
//                 };

//                 s3bucket.upload(params, function (err, data) {
//                   if (err) {
//                     console.log("error in callback");
//                     console.log(err);
//                   }
//                   var finalUrl = data.Location;
//                   param.nftUrl = finalUrl;

//                   Admin.addNft(param, function (err, response) {
//                     if (err) res.send(err);
//                     res.json(response);
//                   });
//                 });
//               });
//             }
//           });
//         });
//       },
//       function (err) {
//         if (err) {
//           res.status(500).json({ error: true, msg: 'Error uploading photos' });
//         } else {
//           param.photos = uploadedPhotos;

//         }
//       }
//     );

//   } else {
//     res.status(400).json({
//       error: true,
//       msg: 'Please select file(s)',
//     });
//   }

//   // if (req.files != null) {
//   //   let getFile = req.files.file; //mimetype
//   //   var ext = path.extname(getFile.name);
//   //   let imageTitle = param.title;
//   //   var filename = Date.now() + "_" + imageTitle + ext;
//   //   var fileData = getFile["data"];
//   //   var r = 0;
//   //   var imageName = `${imageTitle}_${new Date().getTime()}`;
//   //   s3bucket.createBucket(function () {
//   //     var params = {
//   //       Bucket: BUCKET_NAME + "/nftimage/" + imageName,
//   //       Key: filename,
//   //       ACL: "public-read",
//   //       Body: fileData,
//   //     };
//   //     s3bucket.upload(params, function (err, data) {
//   //       if (err) {
//   //         console.log("Error uploading", err);
//   //       }
//   //       param.filepath = data.Location;
//   //       const new_data = {
//   //         title: param.title,
//   //         image_url: data.Location,
//   //         description: param.description
//   //       };
//   //       var jsonString = Buffer.from(JSON.stringify(new_data));
//   //       s3bucket.createBucket(function () {
//   //         var params = {
//   //           Bucket: BUCKET_NAME + "/json",
//   //           Key: "filename.json",
//   //           ACL: "public-read",
//   //           ContentEncoding: "base64",
//   //           ContentType: "application/json",
//   //           Body: jsonString,
//   //         };

//   //         s3bucket.upload(params, function (err, data) {
//   //           if (err) {
//   //             console.log("error in callback");
//   //             console.log(err);
//   //           }
//   //           var finalUrl = data.Location;
//   //           param.nftUrl = finalUrl;

//   //           Admin.addNft(param, function (err, response) {
//   //             if (err) res.send(err);
//   //             res.json(response);
//   //           });
//   //         });
//   //       });
//   //     });
//   //   });
//   // } else {
//   //   res.send({
//   //     "error": false,
//   //     "msg": "Please select file",
//   //     "body": []
//   //   })
//   // }
// };

exports.addNft = function (req, res) {
  const param = req.body;
  if (req.files) {
    const photos = req.files.file;

    if (!Array.isArray(photos)) {
      res.status(400).json({ error: true, msg: "Please select file(s)" });
      return;
    }

    const uploadedPhotos = [];
    const imageTitle = param.title;

    async.eachOfSeries(photos, function (photo, index, callback) {
      const ext = path.extname(photo.name);
      const filename = Date.now() + "_" + index + "_" + imageTitle + ext;

      const params = {
        Bucket: `${BUCKET_NAME}/nft_image`,
        Key: filename,
        ACL: "public-read",
        Body: photo.data,
        // ContentType: photo['mimetype'], //for viewing the image uploaded
       };

      s3bucket.upload(params, function (err, data) {
        if (err) {
          console.log("Error uploading", err);
          callback(err);
        } else {
          uploadedPhotos.push(data.Location);
          callback();
        }
      });
    }, function (err) {
      if (err) {
        res.status(500).json({ error: true, msg: "Error uploading photos" });
      } else {
        const new_data = {
          title: param.title,
          description: param.description,
          images: uploadedPhotos,
        };

        const jsonString = JSON.stringify(new_data);

        const params = {
          Bucket: BUCKET_NAME + "/json",
          Key: new_data.title+"_nft.json",
          ACL: "public-read",
          ContentType: "application/json",
          Body: jsonString,
        };

        s3bucket.upload(params, function (err, data) {
          if (err) {
            console.log("Error uploading JSON", err);
            res.status(500).json({ error: true, msg: "Error uploading JSON" });
          } else {
            param.nftUrl = data.Location;
            param.photos = uploadedPhotos;

            Admin.addNft(param, function (err, response) {
              if (err) {
                res.status(500).json({
                  error: true,
                  msg: "Error adding NFT to the database",
                });
              } else {
                res.json(response);
              }
            });
          }
        });
      }
    });
  } else {
    res.status(400).json({
      error: true,
      msg: "Please select file(s)",
    });
  }
};


exports.editNft = function (req, res) {
  const param = req.body;
  if (req.files != null) {
    let getFile = req.files.file; //mimetype
    var ext = path.extname(getFile.name);
    let imageTitle = param.title;
    var filename = Date.now() + "_" + imageTitle + ext;
    var fileData = getFile["data"];
    var r = 0;
    var imageName = `${imageTitle}_${new Date().getTime()}`;
    s3bucket.createBucket(function () {
      var params = {
        Bucket: BUCKET_NAME + "/nftimage/" + imageName,
        Key: filename,
        ACL: "public-read",
        Body: fileData,
      };
      s3bucket.upload(params, function (err, data) {
        if (err) {
          console.log("Error uploading", err);
        }
        param.filepath = data.Location;
        Admin.editNft(param, function (err, response) {
          if (err) response.send(err);
          res.json(response);
        });
      });
    });
  } else {
    Admin.editNft(param, function (err, response) {
      if (err) response.send(err);
      res.json(response);
    });
  }
};

exports.deleteNft = function (req, res) {
  var param = req.params;
  Admin.deleteNft(param, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.getAllNft = function (req, res) {
  Admin.getAllNft(function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.buyNft = function (req, res) {
  const params = req.body;
  Admin.buyNft(params, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.getNftTransaction = function (req, res) {
  const param = req.params;
  Admin.getNftTransaction(param, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.getAllTransaction = function (req, res) {
  Admin.getAllTransaction(function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.getSalesOvervieww = function (req, res) {
  var params = req.params;
  Admin.getSalesOvervieww(params, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.totalYearlyEarning = function (req, res) {
  var params = req.params;
  Admin.totalYearlyEarning(params, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.nftStatus = function (req, res) {
  var params = req.params;
  Admin.nftStatus(params, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.addCategory = (req, res) => {
  const param = req.body;
  console.log("==================", param);
  if (req.files != null) {
    let getFile = req.files.file; //mimetype
    var ext = path.extname(getFile.name);
    let imageTitle = param.title;
    var filename = Date.now() + "_" + imageTitle + ext;
    var fileData = getFile["data"];
    var r = 0;
    var imageName = `${imageTitle}_${new Date().getTime()}`;
    s3bucket.createBucket(function () {
      var params = {
        Bucket: BUCKET_NAME + "/nftimage/" + imageName,
        Key: filename,
        ACL: "public-read",
        Body: fileData,
      };
      s3bucket.upload(params, function (err, data) {
        if (err) {
          console.log("Error uploading", err);
        }
        param.filepath = data.Location;

        Admin.addCategory(param, function (err, response) {
          if (err) res.send(err);
          res.json(response);
        });
        // });
        // });
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

exports.editCategory = (req, res) => {
  const param = req.body;
  console.log("==================", param);
  if (req.files != null) {
    let getFile = req.files.file; //mimetype
    var ext = path.extname(getFile.name);
    let imageTitle = param.title;
    var filename = Date.now() + "_" + imageTitle + ext;
    var fileData = getFile["data"];
    var r = 0;
    var imageName = `${imageTitle}_${new Date().getTime()}`;
    s3bucket.createBucket(function () {
      var params = {
        Bucket: BUCKET_NAME + "/nftimage/" + imageName,
        Key: filename,
        ACL: "public-read",
        Body: fileData,
      };
      s3bucket.upload(params, function (err, data) {
        if (err) {
          console.log("Error uploading", err);
        }
        param.filepath = data.Location;

        Admin.editCategory(param, function (err, response) {
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

exports.getAllCategory = function (req, res) {
  Admin.getAllCategory(function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.deleteCategory = function (req, res) {
  var params = req.body;
  Admin.deleteCategory(params, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.addtoDealOfTheDay = function (req, res) {
  var params = req.body;
  Admin.addtoDealOfTheDay(params, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.getFureverSettings = function (req, res) {
  Admin.getFureverSettings(function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.getDealOfTheDay = function (req, res) {
  Admin.getDealOfTheDay(function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.addtoSpecialOffers = function (req, res) {
  var params = req.body;
  Admin.addtoSpecialOffers(params, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.getSpecialOffers = function (req, res) {
  Admin.getSpecialOffers(function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.stripePayment = function (req, res) {
  const param = req.body;
  console.log(param);
  Admin.stripePayment(param, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.success = function (req, res) {
  const param = req.params;
  Admin.success(param, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.cancel = function (req, res) {
  const param = req.params;
  Admin.cancel(param, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.applePayments = function (req, res) {
  const param = req.body;
  console.log;
  console.log(param);
  Admin.applePayments(param, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.getCategories = function (req, res) {
  Admin.getCategories(function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.getStripeTransactions = function (req, res) {
  Admin.getStripeTransactions(function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};


exports.nft = function (req, res) {
  const params = req.params;
  Admin.nft(params, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.createCoupon = function (req, res) {
  const params = req.body;
  Admin.createCoupon(params, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};

exports.stripePaymentWithCoupon = function (req, res) {
  const params = req.body;
  Admin.stripePaymentWithCoupon(params, function (err, response) {
    if (err) response.send(err);
    res.json(response);
  });
};
