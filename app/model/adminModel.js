const sql = require("./db");
var request = require("request");

const stripeCredentials = require("../../config");
const stripe = require("stripe")(stripeCredentials.SECRET_KEY);

const uuid = require("uuid");

var Admin = function (userData) {
  console.log(userData);
  this.email = userData.email;
  this.created_at = new Date();
};


Admin.addNft = (userData, result) => {
  var data = {};
  // console.log("userDatauserDatauserData>>>>>>>>>>>>>>",userData);
  // return
  const insertData = {
    image_url: JSON.stringify(userData.photos),
    title: userData.title,
    description: userData.description,
    nft_url: userData.nftUrl,
    price: userData.price,
    quantity: userData.quantity,
    category: userData.category,
    pet_id: userData.pet_id,
    user_id: userData.user_id,
  };

  request(
    {
      url: `http://18.130.160.139:9005/createNft?nft_url=${userData.nftUrl}&maxSupply=1&initSupply=1&data=0x`,
      method: "GET",
    },
    function (error, response, body) {
      if (response) {
        let new_data = JSON.parse(response.body);
        if (new_data.error) {
          data["error"] = true;
          data["msg"] = new_data.msg;
          data["body"] = [];
          result(null, data);
        } else {
          const tx_details = JSON.stringify(new_data.data.transactionDetails);
          if (
            new_data.data.nftId ||
            new_data.data.txHash ||
            new_data.data.transactionDetails
          ) {
            insertData.nft_id = new_data.data.nftId;
            insertData.transaction_hash = new_data.data.txHash;
            insertData.transaction_details = tx_details;
            // console.log(
            //   "insertDatainsertDatainsertDatainsertDatainsertData",
            //   insertData
            // );
            // return
            sql.query(
              "INSERT INTO nft_details set ?",
              [insertData],
              (err, resp) => {
                if (err) {
                  data["error"] = true;
                  data["message"] = err;
                  data["body"] = [];
                  result(null, data);
                } else {
                  const id = userData.pet_id;
                  const insertedId = resp.insertId;
                  sql.query(
                    "update pet_details set nft_status = 'completed' where id= ?",
                    [id],
                    (err, resp) => {
                      if (err) {
                        data["error"] = true;
                        data["message"] = err;
                        data["body"] = [];
                        result(null, data);
                      } else {
                          sql.query(
                            "update nft_details set is_active = '1' where id= ?",
                            [insertedId],
                            (err, resp) => {
                              if (err) {
                                data["error"] = true;
                                data["message"] = err;
                                data["body"] = [];
                                result(null, data);
                              } else {
                                data["error"] = false;
                                data["message"] = "Nft created successfully";
                                data["body"] = [];
                                result(null, data);
                              }
                            }
                          );
                      }
                    }
                  );
                }
              }
            );
          } else {
            data["error"] = true;
            data["msg"] = "Something went wrong.";
            data["body"] = [];
            // dbFunc.connectionRelease;
            result(null, data);
          }
        }
      } else {
        data["error"] = true;
        data["msg"] = "Something went wrong.";
        data["body"] = [];
        // dbFunc.connectionRelease;
        result(null, data);
      }
    }
  );
};

Admin.editNft = (userData, result) => {
  var data = {};
  // console.log('________________________----============',userData);
  // return
  const upData = {
    title: userData.title,
    description: userData.description,
    nft_url: userData.nft_url,
    price: userData.price,
    quantity: userData.quantity,
  };
  if (userData.filepath) {
    upData.image_url = userData.filepath;
  }
  sql.query(
    "Update nft_details set ? where id = ?",
    [upData, userData.id],
    (err, resp) => {
      if (err) {
        data["error"] = true;
        data["message"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        data["error"] = false;
        data["message"] = "Updated successfully";
        data["body"] = resp;
        result(null, data);
      }
    }
  );
};

Admin.deleteNft = (userData, result) => {
  var data = {};

  sql.query(
    "Update nft_details set is_deleted = '1' where id = ?",
    [userData.id],
    (err, resp) => {
      if (err) {
        data["error"] = true;
        data["message"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        data["error"] = false;
        data["message"] = "Deleted successfully";
        data["body"] = resp;
        result(null, data);
      }
    }
  );
};

Admin.getAllNft = (result) => {
  var data = {};

  sql.query(
    "Select nft_details.*, pd.email,pd.owner_name, pd.petName from nft_details left join pet_details pd on nft_details.pet_id = pd.id where is_deleted = '0' order by created_at desc",
    (err, resp) => {
      // sql.query(
      //   `select pet_details.id, pet_details.user_id, pet_details.owner_name, pet_details.email,
      //   pet_details.petName, pet_details.breadName, pet_details.old, pet_details.things,
      //   pet_details.cat_id, pet_details.photos, nft_details.nft_id, nft_details.title, nft_details.category, nft_details.image_url, nft_details.nft_url, nft_details.quantity, nft_details.nft_id FROM pet_details left join nft_details on pet_details.id = nft_details.pet_id WHERE nft_details.is_deleted = '0'`,
      // (err, resp) => {
      if (err) {
        data["error"] = true;
        data["message"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        console.log(resp);

        // resp[0].nft_image_url = [resp[0].nft_image_url]
        data["error"] = false;
        data["message"] = "Get successfully";
        data["body"] = resp;
        result(null, data);
      }
    }
  );
};

Admin.buyNft = (paymentData, result) => {
  var data = {};

  const insertData = {
    user_id: paymentData.user_id,
    nft_id: paymentData.nft_id,
    amount: paymentData.amount,
    payment_hash: paymentData.payment_hash,
  };

  request(
    {
      url: `http://18.130.160.139:9005/mintNft?address=${paymentData.address}&nft_id=${paymentData.nft_id}`,
      method: "GET",
    },
    function (error, response, body) {
      let new_data = JSON.parse(response.body);

      if (new_data.data.txHash) {
        insertData.nft_hash = new_data.data.txHash;
        sql.query(
          "insert into nft_payment_details set ?",
          [insertData],
          (err, resp) => {
            if (err) {
              data["error"] = true;
              data["message"] = err;
              data["body"] = [];
              result(null, data);
            } else {
              data["error"] = false;
              data["message"] = "Inserted successfully";
              data["body"] = resp;
              result(null, data);
            }
          }
        );
      } else {
        data["error"] = true;
        data["msg"] = "Something went wrong.";
        data["body"] = [];
        // dbFunc.connectionRelease;
        result(null, data);
      }
    }
  );
};

Admin.getNftTransaction = (params, result) => {
  var data = {};
  var searchStr = params.searchStr;
  sql.query(
    "Select nft_payment_details.*, nft_details.* from nft_payment_details left join nft_details on nft_payment_details.nft_id = nft_details.id where nft_payment_details.user_id = ?",
    [params.id],
    (err, resp) => {
      if (err) {
        data["error"] = true;
        data["message"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        if (searchStr) {
          var filtered = resp.filter((item) => {
            if (item.is_approved == searchStr) {
              return item.is_approved;
            }
          });
          data["error"] = false;
          data["message"] = "Get successfully";
          data["body"] = filtered;
          result(null, data);
        } else {
          data["error"] = false;
          data["message"] = "Get successfully";
          data["body"] = resp;
          result(null, data);
        }
      }
    }
  );
};

Admin.getAllTransaction = (result) => {
  var data = {};
  sql.query(
    "select users.*, nft_payment_details.amount, nft_payment_details.payment_hash,nft_payment_details.nft_hash,nft_payment_details.nft_id FROM users left join nft_payment_details on users.id = nft_payment_details.user_id",
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

// Admin.getSalesOverview = (result) => {
//   var data = {};
//   sql.query(
//     "select users.*, nft_payment_details.amount, nft_payment_details.payment_hash,nft_payment_details.nft_hash,nft_payment_details.nft_id FROM users left join nft_payment_details on users.id = nft_payment_details.user_id",
//     (err, resp) => {
//       if (err) {
//         data["error"] = true;
//         data["message"] = err;
//         data["body"] = [];
//         result(null, data);
//       } else {
//         data["error"] = false;
//         data["message"] = "Get successfully";
//         data["body"] = resp;
//         result(null, data);
//       }
//     }
//   );
// };

// Admin.getSalesOvervieww = (param, result) => {
//   var data = {};

//   sql.query(
//     "SELECT COUNT(nd.id) AS total_nft_created, MONTHNAME(nd.created_at) AS month_name, (SELECT COUNT(npd.id) FROM nft_payment_details npd) AS total_nft_sold, YEAR(nd.created_at) AS year FROM nft_details nd WHERE DATE(nd.created_at) BETWEEN '2021-06-01' AND CURDATE() AND YEAR(nd.created_at) = 2023 GROUP BY month_name;",
//     [param.year],
//     function (err, res) {
//       if (err) {
//         data["error"] = true;
//         data["msg"] = err.code;
//         data["body"] = [err];
//         result(null, data);
//       } else {
//         // return
//         var resp = res.map(item=>{
//           if(item.year == param.year){
//             return item;
//           }else{
//             return
//           }
//         })
//         if(!resp[0]){
//           resp =[]
//         }
//         console.log("resresresresresresresresresresresres",resp);
//         // return
//         // var monthResult = months.map((data) => {
//         //   var foundData = res.filter((item) => item.month_name == data);
//         //   if (foundData.length > 0) {
//         //     return foundData[0];
//         //   } else {
//         //     return {
//         //       count: 0,
//         //       month_name: data,
//         //       year: param.year,
//         //     };
//         //   }
//         // });
//         data["error"] = false;
//         data["msg"] = "Success";
//         data["body"] = resp;
//         result(null, data);
//       }
//     }
//   );
// };
Admin.getSalesOvervieww = (param, result) => {
  var data = {};

  sql.query(
    "SELECT count(id)as total_nft_created,MONTHNAME(created_at) as month_name FROM `nft_details` where date(created_at) BETWEEN '2021-06-01' and CURRENT_DATE  and YEAR(created_at)=? GROUP BY month_name",
    [param.year],
    function (err, res) {
      if (err) {
        data["error"] = true;
        data["msg"] = err.code;
        data["body"] = [err];
        result(null, data);
      } else {
        sql.query(
          "SELECT count(id)as total_nft_sold,MONTHNAME(created_at) as month_name FROM `nft_payment_details` where date(created_at) BETWEEN '2021-06-01' and CURRENT_DATE  and YEAR(created_at)=? GROUP BY month_name",
          [param.year],
          function (err, res1) {
            const months = [
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ];
            var nft_sold = months.map((data) => {
              var foundData = res1.filter((item) => item.month_name == data);
              if (foundData.length > 0) {
                return foundData[0];
              } else {
                return {
                  total_nft_sold: 0,
                  month_name: data,
                  year: param.year,
                };
              }
            });

            var nft_created = months.map((data) => {
              var foundData = res.filter((item) => item.month_name == data);
              if (foundData.length > 0) {
                return foundData[0];
              } else {
                return {
                  total_nft_created: 0,
                  month_name: data,
                  year: param.year,
                };
              }
            });

            var finalResult = {
              nft_sold,
              nft_created,
            };

            console.log("here");
            data["error"] = false;
            data["msg"] = "Success";
            data["body"] = finalResult;
            result(null, data);
          }
        );
      }
    }
  );
};

Admin.totalYearlyEarning = (params, result) => {
  var data = {};
  sql.query(
    "select IFNULL(sum(amount),0) as total_yearly_earning from nft_payment_details where year(created_at) = ?",
    [params.year],
    (err, resp) => {
      if (err) {
        data["error"] = true;
        data["message"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        data["error"] = false;
        data["message"] = "Get successfully";
        data["body"] = resp[0];
        result(null, data);
      }
    }
  );
};

Admin.nftStatus = (params, result) => {
  var data = {};
  sql.query(
    "update nft_details set is_sold = '1' where id = ?",
    [params.id],
    (err, resp) => {
      if (err) {
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

Admin.addCategory = (params, result) => {
  var data = {};
  const insertedData = {
    category: params.category,
    image: params.filepath,
  };

  sql.query("insert into categories set ?", [insertedData], (err, resp) => {
    if (err) {
      data["error"] = true;
      data["message"] = err;
      data["body"] = [];
      result(null, data);
    } else {
      data["error"] = false;
      data["message"] = "Category Created Successfully";
      data["body"] = resp;
      result(null, data);
    }
  });
};

Admin.editCategory = (params, result) => {
  var data = {};
  const upData = {
    category: params.category,
    image: params.filepath,
  };
  sql.query(
    "update categories set ? where id = ?",
    [upData, params.id],
    (err, resp) => {
      if (err) {
        data["error"] = true;
        data["message"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        data["error"] = false;
        data["message"] = "Category updated Successfully";
        data["body"] = resp;
        result(null, data);
      }
    }
  );
};

Admin.getAllCategory = (result) => {
  var data = {};
  console.log("44444444444444444444444444444444444");
  sql.query("select * from categories where is_deleted = '0'", (err, resp) => {
    if (err) {
      data["error"] = true;
      data["message"] = err;
      data["body"] = [];
      result(null, data);
    } else {
      data["error"] = false;
      data["message"] = resp.length
        ? "Category Fetched Successfully"
        : "No Data Found";
      data["body"] = resp;
      result(null, data);
    }
  });
};

Admin.deleteCategory = (params, result) => {
  var data = {};
  sql.query(
    "update categories set is_deleted = '1' where id = ?",
    [params.id],
    (err, resp) => {
      if (err) {
        data["error"] = true;
        data["message"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        data["error"] = false;
        data["message"] = "Category deleted Successfully";
        data["body"] = resp;
        result(null, data);
      }
    }
  );
};

Admin.addtoDealOfTheDay = (params, result) => {
  var data = {};
  sql.query(
    "select * from deal_of_the_day where product_id = ?",
    [params.product_id],
    (err, res) => {
      if (err) {
        data["error"] = true;
        data["msg"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        if (res.length == 0) {
          const insertedData = {
            product_name: params.product_name,
            product_id: params.product_id,
            product_price: params.product_price,
            starts_at: params.starts_at,
            ends_at: params.ends_at,
          };
          sql.query(
            "insert into deal_of_the_day set ?",
            [insertedData],
            (err, resp) => {
              if (err) {
                data["error"] = true;
                data["message"] = err;
                data["body"] = [];
                result(null, data);
              } else {
                data["error"] = false;
                data["message"] = "Deal Created Successfully";
                data["body"] = resp;
                result(null, data);
              }
            }
          );
        } else {
          data["error"] = false;
          data["msg"] = "This product is already added to Deal of the Day";
          data["body"] = [];
          result(null, data);
        }
      }
    }
  );
};

Admin.getFureverSettings = (result) => {
  var data = {};
  sql.query("select * from  furever_settings", (err, resp) => {
    if (err) {
      data["error"] = true;
      data["message"] = err;
      data["body"] = [];
      result(null, data);
    } else {
      data["error"] = false;
      data["message"] = resp.length
        ? "Furever settings Fetched Successfully"
        : "No Data Found";
      data["body"] = resp;
      result(null, data);
    }
  });
};

//edit homepage data
Admin.updateHomepage = (Data, result) => {
  console.log("dataaaaaaaaaaaaaaaaa", Data);
  var data = {};

  const insertData = {
    title: Data.title,
    description: Data.description,
  };
  if (Data.filepath) {
    insertData.image = Data.filepath;
  }

  sql.query(`UPDATE homepage SET ? `, [insertData], (error, res) => {
    if (error) {
      data["error"] = true;
      data["message"] = error.code;
      data["body"] = [error];
      result(null, data);
    } else {
      data["error"] = false;
      data["message"] = "homepage data updated successfully";
      data["body"] = res;
      result(null, data);
    }
  });
};

//get homepage data
Admin.getHomepageData = (result) => {
  var data = {};
  sql.query("SELECT * FROM homepage", (err, res) => {
    if (err) {
      data["error"] = true;
      data["message"] = err.code;
      data["body"] = [err];
      result(null, data);
    } else {
      data["error"] = false;
      data["message"] = "homepage data get successfully";
      data["body"] = res;
      result(null, data);
    }
  });
};

Admin.getDealOfTheDay = (result) => {
  var data = {};
  (d = new Date()),
    (dformat =
      [d.getFullYear(), d.getMonth() + 1, d.getDate()].join("/") +
      " " +
      [d.getHours(), d.getMinutes(), d.getSeconds()].join(":"));
  console.log(dformat, "fjhewfmhwejwfgewvwfmv");
  let currentDateTime = dformat.replaceAll("/", ":");
  sql.query(
    "select * from  deal_of_the_day where ends_at < ? and is_expired = '0'",
    [currentDateTime],
    (err, resp) => {
      if (err) {
        data["error"] = true;
        data["message"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        resp.map((value) => {
          sql.query(
            "update deal_of_the_day set is_expired = '1' where id = ?",
            [value.id],
            (err, resp1) => {
              if (err) {
                data["error"] = true;
                data["msg"] = err;
              } else {
                data["error"] = false;
              }
            }
          );
        });

        setTimeout(() => {
          sql.query(
            "select deal_of_the_day.*, nft_details.* from deal_of_the_day left join nft_details on deal_of_the_day.product_id = nft_details.nft_id where ends_at >= ? and is_expired = '0'",
            [currentDateTime],
            (err, SendData) => {
              if (!SendData.length) {
                data["error"] = true;
                data["message"] = "No Data Found";
                data["body"] = [];
                result(null, data);
              } else {
                data["error"] = false;
                data["message"] = "Deal of the day fetched Successfully";
                data["body"] = SendData;
                result(null, data);
              }
            }
          );
        }, 2000);
      }
    }
  );
};

Admin.addtoSpecialOffers = (params, result) => {
  var data = {};
  sql.query(
    "select * from special_offers where product_id = ?",
    [params.product_id],
    (err, res) => {
      if (err) {
        data["error"] = true;
        data["msg"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        if (res.length == 0) {
          const insertedData = {
            product_name: params.product_name,
            product_id: params.product_id,
            product_price: params.product_price,
            starts_at: params.starts_at,
            ends_at: params.ends_at,
          };
          sql.query(
            "insert into special_offers set ?",
            [insertedData],
            (err, resp) => {
              if (err) {
                data["error"] = true;
                data["message"] = err;
                data["body"] = [];
                result(null, data);
              } else {
                data["error"] = false;
                data["message"] = "Special Offer Created Successfully";
                data["body"] = resp;
                result(null, data);
              }
            }
          );
        } else {
          data["error"] = false;
          data["msg"] = "This product is already added to Special offers list.";
          data["body"] = [];
          result(null, data);
        }
      }
    }
  );
};

Admin.getSpecialOffers = (result) => {
  var data = {};
  (d = new Date()),
    (dformat =
      [d.getFullYear(), d.getMonth() + 1, d.getDate()].join("/") +
      " " +
      [d.getHours(), d.getMinutes(), d.getSeconds()].join(":"));
  console.log(dformat, "fjhewfmhwejwfgewvwfmv");
  let currentDateTime = dformat.replaceAll("/", ":");
  sql.query(
    "select * from  special_offers where ends_at < ? and is_expired = '0'",
    [currentDateTime],
    (err, resp) => {
      if (err) {
        data["error"] = true;
        data["message"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        resp.map((value) => {
          sql.query(
            "update special_offers set is_expired = '1' where id = ?",
            [value.id],
            (err, resp1) => {
              if (err) {
                data["error"] = true;
                data["msg"] = err;
              } else {
                data["error"] = false;
              }
            }
          );
        });

        setTimeout(() => {
          sql.query(
            "select special_offers.*, nft_details.* from special_offers left join nft_details on special_offers.product_id = nft_details.nft_id where ends_at >= ? and is_expired = '0'",
            [currentDateTime],
            (err, SendData) => {
              if (!SendData.length) {
                data["error"] = true;
                data["message"] = "No Data Found";
                data["body"] = [];
                result(null, data);
              } else {
                data["error"] = false;
                data["message"] = "Special offers fetched Successfully";
                data["body"] = SendData;
                result(null, data);
              }
            }
          );
        }, 2000);
      }
    }
  );
};

Admin.stripePayment = async (payment, result) => {
  let data = {};

  const productN = payment.productName;
  const user_id = payment.user_id;
  const couponCode = payment.couponCode;
if(couponCode){
  try {
    // Create a Stripe Product first
    const product = await stripe.products.create({
      name: productN,
      type: "service",
    });

    // Create a Stripe Price associated with the Product
    const price = await stripe.prices.create({
      currency: "usd",
      unit_amount: 9.99 * 100,
      product: product.id,
    });

    // Attempt to create the promotion code
    const promotionCode = await stripe.promotionCodes.create({
      coupon: couponCode,
    });

    // Create a Stripe Checkout session
    const uuId = uuid.v4();
    const paymentData = {
      userId: user_id,
      order_id: uuId,
      amount: "9.99 $",
      product_name: productN,
      status: "pending",
      coupon: couponCode
    };

    // Insert the payment data into the database
    sql.query("INSERT INTO payments SET ?", paymentData, (err, res) => {
      if (err) {
        data["error"] = true;
        data["msg"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        stripe.checkout.sessions
          .create({
            payment_method_types: ["card"],
            line_items: [
              {
                price: price.id,
                quantity: 1,
              },
            ],
            mode: "payment",
            allow_promotion_codes: true,
            success_url: `https://www.furever-pet.com/success?id=${uuId}`,
            cancel_url: `https://www.furever-pet.com/cancel?id=${uuId}`,
          })
          .then((session) => {
            data["error"] = false;
            data["msg"] = "Payment URL initialized";
            data["body"] = session.url;
            result(null, data);

            const upData = {
              payment_id: session.id,
              payment_detail: JSON.stringify(session),
              status: "pending",
            };

            sql.query(
              "update payments set ? where userId = ?",
              [upData, payment.user_id],
              (err, resp) => {
                if (err) {
                  data["error"] = true;
                  data["msg"] = err;
                  data["body"] = [];
                  result(null, data);
                }
              }
            );
          })
          .catch((error) => {
            if (error.raw?.code === 'resource_missing' || error.statusCode === 404) {
              // Handle invalid coupon code error
              data["error"] = true;
              data["msg"] = "Invalid coupon code";
              data["body"] = [];
              result(null, data);
            } else {
              // Handle other errors
              console.error("Error creating Stripe Checkout session:", error);
              data["error"] = true;
              data["msg"] = error.raw?.code;
              data["body"] = [];
              result(null, data);
            }
          });
      }
    });
  } catch (error) {
    console.error("Error creating promotion code:", error);
    data["error"] = true;
    data["msg"] = "Error creating promotion code";
    data["body"] = [];
    result(null, data);
  }
}else{
  try {
    // Create a Stripe Product first
    const product = await stripe.products.create({
      name: productN,
      type: "service",
    });

    // Create a Stripe Price associated with the Product
    const price = await stripe.prices.create({
      currency: "usd",
      unit_amount: 9.99 * 100,
      product: product.id,
    });

    // Attempt to create the promotion code
    // const promotionCode = await stripe.promotionCodes.create({
    //   coupon: couponCode,
    // });

    // Create a Stripe Checkout session
    const uuId = uuid.v4();
    const paymentData = {
      userId: user_id,
      order_id: uuId,
      amount: "9.99 $",
      product_name: productN,
      status: "pending",
      coupon: couponCode
    };

    // Insert the payment data into the database
    sql.query("INSERT INTO payments SET ?", paymentData, (err, res) => {
      if (err) {
        data["error"] = true;
        data["msg"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        stripe.checkout.sessions
          .create({
            payment_method_types: ["card"],
            line_items: [
              {
                price: price.id,
                quantity: 1,
              },
            ],
            mode: "payment",
            // allow_promotion_codes: true,
            success_url: `https://www.furever-pet.com/success?id=${uuId}`,
            cancel_url: `https://www.furever-pet.com/cancel?id=${uuId}`,
          })
          .then((session) => {
            data["error"] = false;
            data["msg"] = "Payment URL initialized";
            data["body"] = session.url;
            result(null, data);

            const upData = {
              payment_id: session.id,
              payment_detail: JSON.stringify(session),
              status: "pending",
            };

            sql.query(
              "update payments set ? where userId = ?",
              [upData, payment.user_id],
              (err, resp) => {
                if (err) {
                  data["error"] = true;
                  data["msg"] = err;
                  data["body"] = [];
                  result(null, data);
                }
              }
            );
          })
          .catch((error) => {
            // if (error.raw?.code === 'resource_missing' || error.statusCode === 404) {
            //   // Handle invalid coupon code error
            //   data["error"] = true;
            //   data["msg"] = "Invalid coupon code";
            //   data["body"] = [];
            //   result(null, data);
            // } else {
              // Handle other errors
              console.error("Error creating Stripe Checkout session:", error);
              data["error"] = true;
              data["msg"] = error.raw?.code;
              data["body"] = [];
              result(null, data);
            // }
          });
      }
    });
  } catch (error) {
    console.error("Error creating promotion code:", error);
    data["error"] = true;
    data["msg"] = "Error creating promotion code";
    data["body"] = [];
    result(null, data);
  }
}
 
};


Admin.stripePaymentWithCoupon =  (payment, result) => {
  let data = {};
  sql.query("select * from payments where coupon = ?",[payment.couponCode],async(err,response)=>{
    if(err){
      data["error"] = true;
      data["msg"] = err;
      data["body"] = [];
      result(null, data);
    }else{
      if(response.length > 0){
        const productN = payment.productName;
        const user_id = payment.user_id;
      
      
        // Create a Stripe Product first
        const product = await stripe.products.create({
          name: productN,
          type: "service",
        });
      
        // Create a Stripe Price associated with the Product
        const price = await stripe.prices.create({
          currency: "usd",
          // unit_amount: 19.99 * 100,
          unit_amount: 9.99 * 100,
          product: product.id,
        });
      
      
      
        // Create a Stripe Checkout session
        const uuId = uuid.v4();
        const paymentData = {
          userId: user_id,
          order_id: uuId,
          amount: "9.99 $",
          product_name: productN,
          status: "pending",
        };
        // console.log('Payment datafffffffff', paymentData);
        // return
        // Insert the payment data into the database
        sql.query("INSERT INTO payments SET ?", paymentData, (err, res) => {
          if (err) {
            data["error"] = true;
            data["msg"] = err;
            data["body"] = [];
            result(null, data);
          } else {
            stripe.checkout.sessions
              .create({
                payment_method_types: ["card"],
                line_items: [
                  {
                    price: price.id,
                    quantity: 1,
                  },
                ],
                mode: "payment",
                success_url: `https://www.furever-pet.com/success?id=${uuId}`,
                cancel_url: `https://www.furever-pet.com/cancel?id=${uuId}`,
                discounts: [{coupon: payment.couponCode}]
             
              })
              .then((session) => {
                data["error"] = false;
                data["msg"] = "Payment url initialized";
                data["body"] = session;
                result(null, data);
      
                // // console.log('sessionnnnnnnnnnn',session);
                // // return
                const upData = {
                  payment_id: session.id,
                  payment_detail: JSON.stringify(session),
                  status: "pending",
                };
                sql.query(
                  "update payments set ? where userId = ?",
                  [upData, payment.user_id],
                  (err, resp) => {
                    if (err) {
                      data["error"] = true;
                      data["msg"] = err;
                      data["body"] = [];
                      result(null, data);
                    }
                  }
                );
              })
              .catch((error) => {
                console.error("Error creating Stripe Checkout session:", error);
                data["error"] = true;
                data["msg"] = error.raw.code;
                data["body"] = [];
                result(null, data);
              });
          }
        });
        
    }else{
      data["error"] = false;
      data["msg"] = "Invalid code";
      data["body"] = [];
      result(null, data);
    }
    
    }
});
};

Admin.success = (params, result) => {
  var data = {};
  const orderId = params.uuId; // Extract payment ID from query string

  sql.query(
    "select * from payments where order_id = ?",
    [orderId],
    (err, res) => {
      if (err) {
        data["error"] = true;
        data["msg"] = err;
        data["body"] = [];
        result(null, data);
      }
      if (res.length > 0) {
        const payment_detail = JSON.parse(res[0].payment_detail);
        // const payment_status= payment_detail.map(item => item.payment_status = 'paid');
        payment_detail.payment_status = "paid";
        payment_detail.amount_subtotal = "9.99 $";
        payment_detail.amount_total = "9.99 $";

        const upData = {
          payment_detail: JSON.stringify(payment_detail),
          status: "completed",
        };

        sql.query(
          "update  payments SET ? where order_id = ?",
          [upData, orderId],
          (err, res) => {
            if (err) {
              data["error"] = true;
              data["msg"] = err;
              data["body"] = [];
              result(null, data);
            } else {
              data["error"] = true;
              data["msg"] = "Payment successful";
              data["body"] = [];
              result(null, data);
            }
          }
        );
      }
    }
  );
};

Admin.cancel = (params, result) => {
  var data = {};
  const orderId = params.uuId; // Extract payment ID from query string

  sql.query(
    "select * from payments where order_id = ?",
    [orderId],
    (err, res) => {
      if (err) {
        data["error"] = true;
        data["msg"] = err;
        data["body"] = [];
        result(null, data);
      }
      if (res.length > 0) {
        const payment_detail = JSON.parse(res[0].payment_detail);
        // const payment_status= payment_detail.map(item => item.payment_status = 'paid');
        payment_detail.payment_status = "failed";

        const upData = {
          payment_detail: JSON.stringify(payment_detail),
          status: "canceled",
        };

        sql.query(
          "update  payments SET ? where order_id = ?",
          [upData, orderId],
          (err, res) => {
            if (err) {
              data["error"] = true;
              data["msg"] = err;
              data["body"] = [];
              result(null, data);
            } else {
              data["error"] = true;
              data["msg"] = "Payment canceled";
              data["body"] = [];
              result(null, data);
            }
          }
        );
      }
    }
  );
};

Admin.getCategories = async (result) => {
  const data = {};

  sql.query("SELECT * FROM categories", (error, res) => {
    if (error) {
      data["error"] = true;
      data["msg"] = err;
      data["body"] = [];
      result(null, data);
    } else {
      data["error"] = true;
      data["msg"] = "Categories get successfully";
      data["body"] = [];
      result(null, data);
    }
  });
};

Admin.applePayments = async (params, result) => {
  const data = {};
  try {
    // const paymentIntent = await stripe.paymentIntents.create({
    //   amount: 1000, // Amount in cents
    //   currency: 'usd',
    //   description: 'Payment for Product',
    //   // Additional options and metadata can be added here
    // });

    // console.log('Payment Intent', paymentIntent.client_secret);
    // return
    // Create a Stripe Checkout session with Apple Pay as the payment method
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // Include 'card' for fallback
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Product Name",
            },
            unit_amount: 9.99 * 100, // Amount in cents (adjust as needed)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://www.furever-pet.com/success",
      cancel_url: "https://www.furever-pet.com/cancel",
    });

    // Respond with the session ID
    // result(null, { client_secret: paymentIntent.client_secret });
    data.error = true;
    data.msg = "url generated successfully";
    data.body = session;
    result(null, data);
  } catch (error) {
    console.error("Error creating Stripe Checkout session:", error);
    data.error = true;
    data.msg = "Failed to create a checkout session";
    data.body = [];
    result(null, data);
  }
};

Admin.getStripeTransactions = (result) => {
  var data = {};

  sql.query("select * from payments", (err, resp) => {
    if (err) {
      data["error"] = true;
      data["msg"] = err;
      data["body"] = [];
      result(null, data);
    } else {
      data["error"] = false;
      data["msg"] = "Get successfully";
      data["body"] = resp;
      result(null, data);
    }
  });
};

Admin.nft = (params, result) => {
  var data = {};
  sql.query(
    "select * from nft_details where nft_id= ?",
    [params.nft_id],
    (err, resp) => {
      if (err) {
        data["error"] = true;
        data["msg"] = err;
        data["body"] = [];
        result(null, data);
      } else {
        const url = resp[0].nft_url;
        request(
          {
            url: url,
            method: "GET"
          },
          function (error, response, body) {
            data["body"] = JSON.parse(response.body);
            result(null, data);
          }
        );
      }
    }
  );
};


Admin.createCoupon = async(params,result)=>{
var data= {};
const discount= params.discount_per;
function randomString(length, chars) {
  var result = '';
  for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}
var rString = randomString(6, '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');

  const coupon = await stripe.coupons.create({
    percent_off: discount, // 20% off coupon
    duration: 'once', // Valid for a single use
    id: rString, // Unique identifier for the coupon
  });

  console.log('Coupon created:', coupon.id);
//  return
sql.query("select * from payments where order_id = ?",[params.order_id],(err,resp)=>{
if(err){
  data["error"] = true;
  data["msg"] = err;
  data["body"] = [];
  result(null, data);
}else{
  if(resp.length > 0){
    sql.query("update payments set coupon = ? where order_id = ?",[coupon.id,params.order_id],(err,resp1)=>{
      if(err){
        data["error"] = true;
        data["msg"] = err;
        data["body"] = [];
        result(null, data);
      }else{
        data["error"] = false;
        data["msg"] = "Coupon applied successfully";
        data["body"] = {couponCode: coupon.id};
        result(null, data);
      }
    } )
  }else{
    data["error"] = false;
    data["msg"] = "No product exists with this order_id";
    data["body"] = [];
    result(null, data);
  }

}
})

}
module.exports = Admin;
