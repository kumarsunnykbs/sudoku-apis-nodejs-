const  stripeCredentials  = require('./config');
const Strip = require('stripe')(stripeCredentials.SECRET_KEY)




var StripePayment = function (userData) {
    console.log(userData);
    this.username = userData.username;
    this.created_at = new Date();
};


StripePayment.payment = (params, result) => {
    var data = {};
    // let amount = params.order_details.total;
    let total_amount = 5;
    let description = ''
    const token = params.token
    console.log("innnnnnnn", total_amount)
    Strip.charges.create({
        amount: parseFloat(total_amount * 100),
        currency: 'usd',
        description: description,
        // source: params.token.id
        source: token,
        // customer: params.user_id

    }, (error, charge) => {
        // console.log('________________amount', amount);
        // console.log('________________source', token);
        if (error) {
            console.log("error", error)
            data['error'] = true;
            data['msg'] = 'Failed'
            data['body'] = error
            result(data);
        } else {
            console.log('___charge', charge);
            data['error'] = false;
            data['msg'] = 'Success'
            data['body'] = charge
            result(data);
        }
    })


}
StripePayment.createStripeCustomer = async ({ name, email, phone }) => {
    return new Promise(async (resolve, reject) => {
        try {
            const Customer = await Strip.customers.create({
                name,
                email,
                phone
            });
            console.log("Customer", Customer)
            resolve(Customer);
        } catch (err) {
            console.log("test", err)
            console.log(err);
            reject(err);
        }
    });
}

// one time payment
StripePayment.checkout = ({ line_items }) => {
    return new Promise(async (resolve, fail) => {
        try {
            const session = await Strip.checkout.sessions.create({
                line_items,
                mode: 'payment',
                success_url: 'https://maybebaby.ai/payment_success?status=1',
                cancel_url: 'https://maybebaby.ai/payment_fail'
            })
            resolve(session);
        } catch (err) {
            console.log("err", err)
            fail(err);
        }
    })
}

// retrieve transaction status
StripePayment.retrievePaymentStatus = (param) => {
    return new Promise(async (resolve, fail) => {
        try {
            const session = await Strip.checkout.sessions.retrieve(param.payment_id);
            resolve(session);
        } catch (err) {
            console.log("err", err)
            fail(err);
        }
    })
}

// recursive payment way 1
StripePayment.subScriptionPayment = (param) => {
    return new Promise(async (resolve, fail) => {
        try {
            const { name, email, paymentMethod } = param;
            // Create a customer
            const customer = await Strip.customers.create({
                email,
                name,
                payment_method: paymentMethod,
                invoice_settings: { default_payment_method: paymentMethod },
            });
            // Create a product
            const product = await Strip.products.create({
                name: "Monthly subscription",
            });
            // Create a subscription
            const subscription = await Strip.subscriptions.create({
                customer: customer.id,
                items: [
                    {
                        price_data: {
                            currency: "INR",
                            product: product.id,
                            unit_amount: "500",
                            recurring: {
                                interval: "month",
                            },
                        },
                    },
                ],

                payment_settings: {
                    payment_method_types: ["card"],
                    save_default_payment_method: "on_subscription",
                },
                expand: ["latest_invoice.payment_intent"],
            });
            // Send back the client secret for payment
            resolve(subscription.latest_invoice.payment_intent.client_secret);
            // res.json({
            //   message: "Subscription successfully initiated",
            //   clientSecret: subscription.latest_invoice.payment_intent.client_secret,
            // });
        } catch (err) {
            console.error(err);
            fail(err);
        }
    });
}

// recursive payment way 2
StripePayment.checkoutSubScriptionPayment = ({ line_items, isMonthly }) => {
    return new Promise(async (resolve, fail) => {
        try {
            // const coupon = await Strip.coupons.create({ amount_off: 5000, currency: 'usd', duration: 'once'});
            // console.log("coupon",coupon)

            const session = await Strip.checkout.sessions.create({
                mode: 'subscription',
                line_items,
                // discounts: [{
                //   coupon: coupon.id,
                // }],
                success_url: isMonthly === "1" ? 'https://maybebaby.ai/payment_success?status=3' : 'https://maybebaby.ai/payment_success?status=2',
                cancel_url: 'https://maybebaby.ai/payment_fail'
            })

            console.log("check_data", session);
            resolve(session);
        } catch (err) {
            console.log("err", err.message)
            fail(err.message);
        }
    })
}

// create product
StripePayment.createProduct = () => {
    return new Promise(async (resolve, fail) => {
        try {
            const product = await Strip.products.create({
                name: "Monthly subscription",
                description: "this is description",

            });
            resolve(product)
        } catch (err) {
            fail(err)
        }
    });
}

module.exports = StripePayment;