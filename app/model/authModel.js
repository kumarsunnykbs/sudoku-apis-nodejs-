const sql = require("./db");
const bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");
let config = require("../../config");
const { param } = require("../routes/route");
var request = require("request");

const AWS = require("aws-sdk");
const path = require("path");
const config2 = require("dotenv").config();
const USER_KEY = process.env.ACCESS_KEY;
const USER_SECRET = process.env.SECRET_KEY;
const BUCKET_NAME = process.env.BUCKET;

let s3bucket = new AWS.S3({
  accessKeyId: USER_KEY,
  secretAccessKey: USER_SECRET,
  Bucket: BUCKET_NAME,
});

const saltRounds = 10;
var Auth = function (userData) {
  console.log(userData);
  this.email = userData.email;
  this.created_at = new Date();
};

Auth.register = (userData, result) => {
  var data = {};
  checkUniqueUser(userData, function (callbackres, deletedUser) {
    console.log("<<<<<<<<<<callbackres>>>>>>>>>", callbackres);
    if (callbackres == false) {
      var salt = bcrypt.genSaltSync(saltRounds);
      var hash = bcrypt.hashSync(userData.password, salt);

      const insertData = {
        firstname: userData.firstname,
        lastname: userData.lastname,
        username: userData.username,
        email: userData.email,
        password: hash,
        active: userData.active,
        role: userData.role,
      };

      sql.query(`insert into users set ?`, [insertData], (err, resp) => {
        if (err) {
          console.log("error: ", err);
          data["error"] = true;
          data["message"] = err;
          data["body"] = [];
          result(null, data);
        } else {
          data["error"] = false;
          data["message"] = "Registered Successfully";
          data["body"] = resp;
          result(null, data);
        }
      });
    } else {
      data["error"] = true;
      data["msg"] = "Email Already Exist";
      data["body"] = [];
      result(null, data);
    }
  });
};
Auth.admLogin = (param, result) => {
  var data = {};
  sql.query(
    `SELECT * FROM users WHERE email= ? and role = 'admin'`,
    [param.email],
    async (err, resp) => {
      if (err) {
        data["error"] = true;
        data["message"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        if (resp.length > 0) {
          var match = await bcrypt.compareSync(
            param.password,
            resp[0].password
          );
          if (match == true) {
            let token = jwt.sign(
              {
                username: resp[0].username,
                user_id: resp[0].id,
                role: resp[0].role,
              },
              config.Secret_Key,
              {
                expiresIn: "30 days", // expires in 30 Days
              }
            );
            let finalresult = {
              token: token,
              id: resp[0].id,
            };
            data["error"] = false;
            data["message"] = "Logged In Successfully";
            data["body"] = [finalresult];
            result(null, data);
          } else {
            data["error"] = true;
            data["message"] = "Invalid Username or Password";
            data["body"] = [];
            result(null, data);
          }
        } else {
          data["error"] = false;
          data["message"] = "No account exists";
          data["body"] = [];
          result(null, data);
        }
      }
    }
  );
};

Auth.userLogin = (param, result) => {
  var data = {};
  sql.query(
    `SELECT * FROM users WHERE email= ? and role = 'user'`,
    [param.email],
    async (err, resp) => {
      if (err) {
        data["error"] = true;
        data["message"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        if (resp.length > 0) {
          var match = await bcrypt.compareSync(
            param.password,
            resp[0].password
          );
          if (match == true) {
            let token = jwt.sign(
              {
                username: resp[0].username,
                user_id: resp[0].id,
                role: resp[0].role,
              },
              config.Secret_Key,
              {
                expiresIn: "30 days", // expires in 30 Days
              }
            );
            let finalresult = {
              token: token,
              id: resp[0].id,
            };
            data["error"] = false;
            data["message"] = "Logged In Successfully";
            data["body"] = [finalresult];
            result(null, data);
          } else {
            data["error"] = true;
            data["message"] = "Invalid Username or Password";
            data["body"] = [];
            result(null, data);
          }
        } else {
          data["error"] = true;
          data["message"] = "No user found for this email";
          data["body"] = [];
          result(null, data);
        }
      }
    }
  );
};

function checkUniqueUser(userdata, callback) {
  console.log(".................duplicate data", userdata);
  sql.query(
    "SELECT * from users where email=?",
    [userdata.email],
    function (err, res) {
      if (err) {
        console.log("error: ", err);
        return callback(false, false);
      } else {
        if (res.length == 0) {
          return callback(false, false);
        } else {
          return callback(true, false);
        }
      }
    }
  );
}

Auth.getAllUsers = (result) => {
  var data = {};

  sql.query("Select * from users where role = 'user'", (err, resp) => {
    if (err) {
      data["error"] = true;
      data["message"] = err;
      data["body"] = [];
      result(null, data);
    } else {
      data["error"] = false;
      data["message"] = "Get successfully";
      data["body"] = resp;
      result(null, data);
    }
  });
};

Auth.uploadProfilePic = (userData, result) => {
  var data = {};

  let upData;
  if (userData.type == 1) {
    upData = {
      profile_pic: userData.filepath,
    };
  } else if (userData.type == 2) {
    upData = {
      cover_pic: userData.filepath,
    };
  }
  sql.query(
    `update users set ? where id = ?`,
    [upData, userData.id],
    (err, resp) => {
      if (err) {
        console.log("error: ", err);
        data["error"] = true;
        data["message"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        data["error"] = false;
        data["message"] = "Updated Successfully";
        data["body"] = resp;
        result(null, data);
      }
    }
  );
};

Auth.getUserById = (params, result) => {
  var data = {};

  sql.query(
    "Select * from users where role = 'user' and id = ?",
    [params.id],
    (err, resp) => {
      if (err) {
        data["error"] = true;
        data["message"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        data["error"] = false;
        data["message"] = "Get successfully";
        data["body"] = resp;
        result(null, data);
      }
    }
  );
};

Auth.updateProfile = (userData, result) => {
  var data = {};
  checkUniqueUser(userData, function (callbackres, deletedUser) {
    console.log("<<<<<<<<<<callbackres>>>>>>>>>", callbackres);
    if (callbackres == false) {
      let upData = {
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
      };
      sql.query(
        `update users set ? where id = ?`,
        [upData, userData.id],
        (err, resp) => {
          if (err) {
            console.log("error: ", err);
            data["error"] = true;
            data["message"] = err;
            data["body"] = [];
            result(null, data);
          } else {
            data["error"] = false;
            data["message"] = "Updated Successfully";
            data["body"] = resp;
            result(null, data);
          }
        }
      );
    } else {
      data["error"] = true;
      data["msg"] =
        "The user with this email already exists. Please try with diffrent email.";
      data["body"] = [];
      result(null, data);
    }
  });
};

Auth.wishlistNft = (params, result) => {
  var data = {};
  sql.query(
    "select * from nft_details where id = ?",
    [params.id, params.user_id],
    (err, resp) => {
      if (err) {
        data["error"] = true;
        data["msg"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        if (resp.length > 0) {
          if (resp[0].is_wishlisted == "0") {
            var updata = {
              user_id: params.user_id,
              is_wishlisted: "1",
            };
            sql.query(
              "update nft_details set  ? where id = ?",
              [updata, params.id],
              (err, resp) => {
                if (err) {
                  data["error"] = true;
                  data["msg"] = err;
                  data["body"] = [];
                  result(null, data);
                } else {
                  data["error"] = false;
                  data["msg"] = "wishlisted successfully";
                  data["body"] = [];
                  result(null, data);
                }
              }
            );
          } else {
            var updata1 = {
              user_id: params.user_id,
              is_wishlisted: "0",
            };
            sql.query(
              "update nft_details set ? where id = ?",
              [updata1, params.id],
              (err, resp) => {
                if (err) {
                  data["error"] = true;
                  data["msg"] = err;
                  data["body"] = [];
                  result(null, data);
                } else {
                  data["error"] = false;
                  data["msg"] = "Removed from wishlist successfully";
                  data["body"] = [];
                  result(null, data);
                }
              }
            );
          }
        }
      }
    }
  );
};

Auth.getWishlistNft = (params, result) => {
  var data = {};
  sql.query(
    "select * from nft_details where is_wishlisted = '1' and user_id = ?",
    [params.user_id],
    (err, resp) => {
      if (err) {
        data["error"] = true;
        data["msg"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        data["error"] = false;
        data["msg"] = resp.length
          ? "Wishlisted nft fetched successfully"
          : "No data found";
        data["body"] = resp;
        result(null, data);
      }
    }
  );
};

Auth.addtocartNft = (params, result) => {
  var data = {};
  sql.query(
    "select * from nft_details where id = ?",
    [params.id, params.user_id],
    (err, resp) => {
      if (err) {
        data["error"] = true;
        data["msg"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        if (resp.length > 0) {
          if (resp[0].is_added_to_cart == "0") {
            var updata = {
              user_id: params.user_id,
              is_added_to_cart: "1",
            };
            sql.query(
              "update nft_details set  ? where id = ?",
              [updata, params.id],
              (err, resp) => {
                if (err) {
                  data["error"] = true;
                  data["msg"] = err;
                  data["body"] = [];
                  result(null, data);
                } else {
                  data["error"] = false;
                  data["msg"] = "Added to cart successfully";
                  data["body"] = [];
                  result(null, data);
                }
              }
            );
          } else {
            var updata1 = {
              user_id: params.user_id,
              is_added_to_cart: "0",
            };
            sql.query(
              "update nft_details set ? where id = ?",
              [updata1, params.id],
              (err, resp) => {
                if (err) {
                  data["error"] = true;
                  data["msg"] = err;
                  data["body"] = [];
                  result(null, data);
                } else {
                  data["error"] = false;
                  data["msg"] = "Removed from add to cart successfully";
                  data["body"] = [];
                  result(null, data);
                }
              }
            );
          }
        }
      }
    }
  );
};

Auth.getAddtocartNft = (params, result) => {
  var data = {};
  sql.query(
    "select * from nft_details where is_added_to_cart = '1' and user_id = ?",
    [params.user_id],
    (err, resp) => {
      if (err) {
        data["error"] = true;
        data["msg"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        data["error"] = false;
        data["msg"] = resp.length
          ? "Add to Cart nft fetched successfully"
          : "No data found";
        data["body"] = resp;
        result(null, data);
      }
    }
  );
};

Auth.addPetDetails = (params, result) => {
  var data = {};

  const insertedData = {
    petName: params.petName,
    breadName: params.breadName,
    old: params.old,
    things: params.things,
    petPlace: params.petPlace,
    cat_id: params.pet_cat_id,
    // photos: params.photos.join(","),
    photos: params.url,
    user_id: params.userId,
    owner_name: params.owner_name,
    email: params.email,
    nft_status: "pending",
  };

  console.log('insertedData',insertedData);
  
  // console.log("check_url", insertedData);
  // // console.log("qqqqqqqqqqqqqqqqqqqqqqqqqqqqqq", params.url.photos);

  // let firstValue = ''
  // try {

  //   const photosArray = JSON.parse(params.url);

  //   // Get the first value from the array and store it in a variable
  //   firstValue += photosArray[0];
  //   console.log("First URL:", firstValue);
  // } catch (error) {
  //   console.error("Error parsing JSON:", error);
  // }
  // return;
  // console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", insertedData);
  sql.query("insert into pet_details set ?", [insertedData], (err, resp) => {
    if (err) {
      data["error"] = true;
      data["message"] = err;
      data["body"] = [];
      result(null, data);
    } else {
      // const new_data = {
      //   title: params.petName,
      //   image_url: firstValue,
      //   description: params.things
      // };
      // var jsonString = Buffer.from(JSON.stringify(new_data));
      // s3bucket.createBucket(function () {
      //   var params2 = {
      //     Bucket: BUCKET_NAME + "/json",
      //     Key: "filename.json",
      //     ACL: "public-read",
      //     ContentEncoding: "base64",
      //     ContentType: "application/json",
      //     Body: jsonString,
      //   };

      //   s3bucket.upload(params2, function (err, data) {
      //     if (err) {
      //       console.log("error in callback");
      //       console.log(err);
      //     }
      //     var finalUrl = data.Location;
      //     params2.nftUrl = finalUrl;

      //     const lastInsertId = resp.insertId;
      //     const insertData2 = {
      //       image_url: firstValue,
      //       user_id: params.userId,
      //       pet_id: lastInsertId,
      //       // description: userData.description,
      //       nft_url: finalUrl,
      //       // price: userData.price,
      //       quantity: 1,
      //       category: params.pet_cat_id,
      //     };

      //     request(
      //       {
      //         url: `http://18.130.160.139:9005/createNft?nft_url=${finalUrl}&maxSupply=1&initSupply=1&data=0x`,
      //         method: "GET",
      //       },
      //       function (error, response, body) {
      //         if (response) {
      //           let new_data = JSON.parse(response.body);
      //           const tx_details = JSON.stringify(new_data.data.transactionDetails);
      //           if (
      //             new_data.data.nftId ||
      //             new_data.data.txHash ||
      //             new_data.data.transactionDetails
      //           ) {
      //             insertData2.nft_id = new_data.data.nftId;
      //             insertData2.transaction_hash = new_data.data.txHash;
      //             insertData2.transaction_details = tx_details;
      //             console.log(
      //               "insertDatainsertDatainsertDatainsertDatainsertData",
      //               insertData2
      //             );

      //             sql.query(
      //               "INSERT INTO nft_details set ?",
      //               [insertData2],
      //               (err, resp2) => {
      //                 console.log("check_nftData...", resp2)
      //                 if (err) {
      //                   console.log("check_nft_errors", err);
      //                   data["error"] = true;
      //                   data["message"] = err;
      //                   data["body"] = [err.code];
      //                   result(null, data);
      //                 } else {
      //                   console.log("check_nft_resp...",)
      //                   data["error"] = false;
      //                   data["message"] = "Inserted successfully";
      //                   data["body"] = resp;
      //                   result(null, data);
      //                 }
      //               }
      //             );
      //           } else {
      //             data["error"] = true;
      //             data["msg"] = "Something went wrong.";
      //             data["body"] = [];
      //             // dbFunc.connectionRelease;
      //             result(null, data);
      //           }
      //         } else {
      //           data["error"] = true;
      //           data["msg"] = "Something went wrong.";
      //           data["body"] = [];
      //           // dbFunc.connectionRelease;
      //           result(null, data);
      //         }
      //       }
      //     );
      //   });
      // });

      data["error"] = false;
      data["message"] = "Created Successfully";
      data["body"] = resp;
      result(null, data);
    }
  });
};

Auth.getPetDetailsByUserId = (params, result) => {
  var data = {};
  sql.query(
    "Select * from pet_details where user_id=?",
    [params.id],
    (err, resp) => {
      //   sql.query(`SELECT
      //   pet_details.id,
      //   pet_details.user_id,
      //   pet_details.owner_name,
      //   pet_details.email,
      //   pet_details.petName,
      //   pet_details.breadName,
      //   pet_details.old,
      //   pet_details.things,
      //   pet_details.cat_id,
      //   pet_details.photos,
      //   nft_details.nft_id,
      //   nft_details.title,
      //   nft_details.category,
      //   nft_details.image_url,
      //   nft_details.nft_url,
      //   nft_details.quantity
      // FROM
      //   pet_details
      // INNER JOIN
      //   nft_details
      // ON
      //   pet_details.id = nft_details.pet_id
      // WHERE
      //   pet_details.user_id = ?;`, [params.id], (err, resp) => {

      if (err) {
        data["error"] = true;
        data["message"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        data["error"] = false;
        data["message"] = "get Successfully";
        data["body"] = resp;
        result(null, data);
      }
    }
  );
};

Auth.addFile = (params, result) => {
  var data = {};
  const indata = {
    files: JSON.stringify(params.photos),
  };
  sql.query("insert into files set ?", [indata], (err, resp) => {
    if (err) {
      data["error"] = true;
      data["message"] = err;
      data["body"] = [];
      result(null, data);
    } else {
      const lastInserted = resp.insertId;
      sql.query(
        "select * from files where id = ?",
        [lastInserted],
        (err, resp1) => {
          if (err) {
            data["error"] = true;
            data["message"] = err;
            data["body"] = [];
            result(null, data);
          } else {
            data["error"] = false;
            data["message"] = "Last inserted images fetched successfully";
            data["body"] = resp1;
            result(null, data);
          }
        }
      );
    }
  });
};

Auth.getPetDetailsByCatid = (params, result) => {
  const data = {};
  const pet_cat_id = params.cat_id;
  console.log("check_pat_cat_id", pet_cat_id);
  // sql.query("SELECT * FROM pet_details WHERE cat_id = ?", [pet_cat_id], (error, res) => {

  sql.query(
    `select pet_details.id, pet_details.user_id, pet_details.owner_name, pet_details.email,
    pet_details.petName, pet_details.breadName, pet_details.old, pet_details.things,
    pet_details.cat_id, pet_details.photos, nft_details.nft_id, nft_details.title, nft_details.category, nft_details.image_url, nft_details.nft_url, nft_details.quantity, nft_details.nft_id FROM pet_details left join nft_details on pet_details.id = nft_details.pet_id WHERE pet_details.cat_id = ?`,
    [pet_cat_id],
    (error, res) => {
      if (error) {
        data["error"] = true;
        data["msg"] = error.code;
        data["body"] = [error];
        result(null, data);
      } else {
        data["error"] = false;
        data["msg"] = "pet details get successfully";
        data["body"] = res;
        result(null, data);
      }
    }
  );
};

Auth.getAllPetDetails = (result) => {
  const data = {};
  sql.query("SELECT * FROM pet_details order by created_at desc ", (error, res) => {
    // sql.query(`select pet_details.id, pet_details.user_id, pet_details.owner_name, pet_details.email,
    //   pet_details.petName, pet_details.breadName, pet_details.old, pet_details.things,
    //   pet_details.cat_id, pet_details.photos, nft_details.nft_id, nft_details.title, nft_details.category, nft_details.image_url, nft_details.nft_url, nft_details.quantity, nft_details.nft_id FROM pet_details left join nft_details on pet_details.id = nft_details.pet_id`, (error, res) => {

    if (error) {
      data["error"] = true;
      data["msg"] = error.code;
      data["body"] = [error];
      result(null, data);
    } else {
      data["error"] = false;
      data["msg"] = "Pet Details fetcheds successfully";
      data["body"] = res;
      result(null, data);
    }
  });
};

Auth.getLatestPetDetails = (result) => {
  const data = {};
  sql.query(
    "Select nft_details.*, pd.petName, pd.owner_name,pd.photos FROM nft_details left JOIN pet_details pd on nft_details.pet_id = pd.id where nft_details.is_deleted = '0' ORDER BY created_at DESC LIMIT 6",
    (error, res) => {
      // sql.query(`select pet_details.id, pet_details.user_id, pet_details.owner_name, pet_details.email,
      //     pet_details.petName, pet_details.breadName, pet_details.old, pet_details.things,
      //     pet_details.cat_id, pet_details.photos, nft_details.nft_id, nft_details.title, nft_details.category, nft_details.image_url, nft_details.nft_url, nft_details.quantity, nft_details.nft_id FROM pet_details left join nft_details on pet_details.id = nft_details.pet_id ORDER BY pet_details.created_at DESC LIMIT 4`, (error, res) => {

      if (error) {
        data["error"] = true;
        data["msg"] = error.code;
        data["body"] = [error];
        result(null, data);
      } else {
        // const newData= [];

        // let newData= res.map((item)=>{
        // if(item.photos != null && item.photos != ""){
        //   item.photos.push(item.image_url);
        // }
        //   return item;
        // })

        // console.log('nnnewwwwwwwwwwdata',newData);
        // return

        // const newData = res.map((item) => {
        //   if (item.photos) {
        //     try {
        //       let photosArray = JSON.parse(item.photos); // Try to parse the photos string into an array
        //       photosArray = [item.image_url, ...photosArray]; // Add image_url to the beginning of the photos array
        //       item.photos = JSON.stringify(photosArray); // Convert the array back to a string
        //     } catch (error) {
        //       console.error(`Error parsing JSON for item with id ${item.id}:`, error);
        //     }
        //   }
        //   return item;
        // });

        // const newData = res.map((item) => {
        //   if (item.photos) {
        //     try {
        //       if(item.photos != null && item.photos != "" && item.image_url != null && item.image_url != "") {
        //         let d = JSON.parse(item.photos)
        //         if
        //         d.push(item.image_url); // Attempt to parse the string
        //         console.log(d,'dchjcjgegjmgwygwjegj');
        //         item.photos = JSON.stringify(d);
        //       }
        //       // Convert the array back to a string
        //     } catch (error) {
        //       console.error(`Error parsing JSON for item with id ${item.id}:`, error);
        //     }
        //   }
        //   return item;
        // });
        // console.log("resssssssss", newData);
        // return;
        data["error"] = false;
        data["msg"] = "get latest pet details successfully";
        data["body"] = res;
        result(null, data);
      }
    }
  );
};

Auth.getNftById = (params, result) => {
  console.log(params);
  const data = {};
  sql.query(
    "SELECT nft_details.*, pd.petName, pd.owner_name FROM nft_details LEFT JOIN pet_details pd ON nft_details.pet_id = pd.id WHERE nft_details.is_deleted = '0' and nft_details.user_id = ? ORDER BY pd.created_at DESC",
    [params.id],
    (error, res) => {
      // sql.query(`select pet_details.id, pet_details.user_id, pet_details.owner_name, pet_details.email,
      //     pet_details.petName, pet_details.breadName, pet_details.old, pet_details.things,
      //     pet_details.cat_id, pet_details.photos, nft_details.nft_id, nft_details.title, nft_details.category, nft_details.image_url, nft_details.nft_url, nft_details.quantity, nft_details.nft_id FROM pet_details left join nft_details on pet_details.id = nft_details.pet_id ORDER BY pet_details.created_at DESC LIMIT 4`, (error, res) => {

      if (error) {
        data["error"] = true;
        data["msg"] = error;
        data["body"] = [error];
        result(null, data);
      } else {
        data["error"] = false;
        data["msg"] = "Get successfully";
        data["body"] = res;
        result(null, data);
      }
    }
  );
};

module.exports = Auth;
