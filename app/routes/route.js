"use strict";
var express = require("express");
const Router = express.Router();
var authController = require("../controller/authController");
var adminController = require("../controller/adminController");

Router.get("/", function (req, res) {
  res.send("Welcome to forever_pet");
});

Router.post("/admLogin", authController.admLogin);
Router.post("/userLogin", authController.userLogin);
Router.post("/register", authController.register);
Router.get("/getAllUsers", authController.getAllUsers);
Router.post("/uploadProfilePic", authController.uploadProfilePic);
Router.get("/getUserById/:id", authController.getUserById);
Router.post("/updateProfile", authController.updateProfile);
Router.post("/wishlistNft/:id/:user_id", authController.wishlistNft);
Router.get("/getWishlistNft/:user_id", authController.getWishlistNft);
Router.post("/addtocartNft/:id/:user_id", authController.addtocartNft);
Router.get("/getAddtocartNft/:user_id", authController.getAddtocartNft);
Router.post("/addPetDetails", authController.addPetDetails);
Router.get("/getAppPetDetails/:id", authController.getPetDetailsByUserId);
Router.get("/getPetDetailsByCatid/:cat_id", authController.getPetDetailsByCatid);
Router.get("/getAllAdminPetDetails", authController.getAllPetDetails);
Router.get("/getLatestPetDetails", authController.getLatestPetDetails);
Router.post("/addFile", authController.addFile);
Router.get("/getPetById/:id", authController.getNftById);

//Api's for admin section
Router.post("/addNft", adminController.addNft);
Router.post("/editNft", adminController.editNft);
Router.post("/deleteNft/:id", adminController.deleteNft);
Router.get("/getAllAdminNft", adminController.getAllNft);
Router.get("/getAllAppNft", adminController.getAllNft);
Router.post("/buyNft", adminController.buyNft);
Router.post("/nftStatus/:id", adminController.nftStatus);
Router.get("/getNftTransaction/:id", adminController.getNftTransaction);
Router.get("/getAllTransaction", adminController.getAllTransaction);
Router.get("/getSalesOverview/:year", adminController.getSalesOvervieww);
Router.get("/totalYearlyEarning/:year", adminController.totalYearlyEarning);

Router.get("/nft/:nft_id",adminController.nft);

// api's for category section
Router.post("/addCategory", adminController.addCategory);
Router.post("/editCategory", adminController.editCategory);
Router.get("/getAllCategoryAdmin", adminController.getAllCategory);
Router.post("/deleteCategory", adminController.deleteCategory);

//Deal of the day api's
Router.post("/addtoDealOfTheDay", adminController.addtoDealOfTheDay);
Router.get("/getFureverSettings", adminController.getFureverSettings);
Router.get("/getDealOfTheDay", adminController.getDealOfTheDay);

//Special Offer api's
Router.post("/addtoSpecialOffers", adminController.addtoSpecialOffers);
Router.get("/getSpecialOffers", adminController.getSpecialOffers);
Router.get("/getAdminHomepageData", adminController.getHomepageData);
Router.get("/getAppHomepageData", adminController.getHomepageData);
Router.patch("/updateAdminHomepageData/:id", adminController.updateHomepage);

// stripe payment api routes
Router.post("/stripePayment", adminController.stripePayment);
Router.get('/success/:uuId', adminController.success);
Router.get('/cancel/:uuId', adminController.cancel);
Router.get('/getStripeTransactions', adminController.getStripeTransactions);

// stripe coupon routes
// Router.post("/createCoupon", adminController.createCoupon);
// Router.post("/stripePaymentWithCoupon", adminController.stripePaymentWithCoupon);


//Apple pay payments routes
Router.post('/applePayments', adminController.applePayments);
Router.get('/getCategories', adminController.getCategories);




module.exports = Router;
