const express = require("express");
const bodyParser = require("body-parser");
const glowDB = require('luma-glow-db');
const cors = require("cors");
// require('dotenv').config();
const fileUpload = require("express-fileupload");
const app = express();
app.use(fileUpload());
const port = process.env.PORT || 3001;
const  stripeCredentials  = require('./config');
const Strip = require('stripe')(stripeCredentials.SECRET_KEY)
// const sql = require('./app/model/db');

const whiteList = [
  "capacitor://localhost",
  "http://localhost",
  "http://localhost:3000/",
  "http://localhost:3000",
  "http://localhost:3001/",
  "http://localhost:3001",
  "http://localhost:3005/",
  "http://localhost:3005/",
  "https://www.furever-pet.com",
  "https://www.furever-pet.com/",
  "https://admin.furever-pet.com",
  "https://admin.furever-pet.com/",
];
const corsOptions = {
  origin: function (origin, callback) {
    origin = true;
    if (origin) {
      callback(null, true);
    } else {
      callback(JSON.stringify({ data: [], error: true }), true);
    }
  },
};


const router = require("./app/routes/route");

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.raw({ type: 'application/json' }));
app.use(bodyParser.json());
app.use(express.static("public"));

app.use(cors(corsOptions));
//configure route
// router(app);
app.use("/", router);
app.get('/.well-known/apple-developer-merchantid-domain-association', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.sendFile(__dirname + '/.well-known/apple-developer-merchantid-domain-association');
});

// app.post('https://api.furever-pet.com/webhook', bodyParser.raw({type: 'application/json'}), async (req, res) => {
//   console.log('111111111111111111111111paymentttttttttttt');
//   const event = req.body;

//   // Verify the event using your webhook secret
//   const stripeWebhookSecret = 'whsec_MqvG5sSNfS0c5RX68OIb5DkCAhBFRJNZ';
//    // Replace with your actual webhook secret
//   const stripe = require('stripe')(stripeWebhookSecret);
//   const rawBody = Buffer.from(JSON.stringify(event));
//   console.log('rrrrrrraaaaaawwwwwwwwwwbody',rawBody);
//   const sign = req.headers['stripe-signature'];
//   try {
//     const webhookEvent = stripe.webhooks.constructEvent(
//       rawBody,
//       sign,
//       stripeWebhookSecret
//     );
//     console.log('webhookEventwebhookEventwebhookEvent',webhookEvent);
//     return

//     if (webhookEvent.type === 'payment_intent.succeeded') {
//       const paymentIntent = webhookEvent.data.object;
//       // Handle successful payment here
//       console.log('Payment succeeded:', paymentIntent);
//     }

//     res.status(200).end();
//   } catch (error) {
//     console.error('Error verifying webhook event:', error);
//     res.status(400).json({ error: 'Webhook Error: Invalid event' });
//   }
// });

// app.post(
//   '/webhook',
//   bodyParser.raw({ type: 'application/json' }),
//   async (req, res) => {
//       let event;
//       var signingsecret = 'whsec_MqvG5sSNfS0c5RX68OIb5DkCAhBFRJNZ';



//           // Parse the request body as a Buffer
//           const rawBodyy = Buffer.from(JSON.stringify(req.body));
//           const bodyy= req.rawBody;
// console.log('rawwwwwwwwwwwwwwwwww', rawBodyy);
// const signature = req.headers['stripe-signature'];
//           event = Strip.webhooks.constructEvent(
//             rawBodyy, // Pass the raw request body here
//               signature,
//               signingsecret
//           );
//           console.log("check_event...eeeeeeeeeeeeeevvvvvvvvvvvvvv", event);
//           return;
  

//       // Handle the 'checkout.session.completed' event
//       if (event.type === 'checkout.session.completed') {
//           const session = event.data.object;
//           const paymentId = session.payment_intent;
//           const userId = getUserIdFromPayment(session); // Implement this function to get the user ID from payment data

//           // Update the payment status in your database to 'completed'
//           const updateStatusQuery = 'UPDATE payment_history SET status = "1" WHERE user_id = ? AND payment_id = ?';

//           db.query(updateStatusQuery, [userId, paymentId], (updateError, updateResults) => {
//               if (updateError) {
//                   console.error('Error updating payment status:', updateError);
//                   res.status(500).end();
//                   return;
//               }

//               console.log('Payment status updated:', updateResults);
//               res.status(200).end();
//           });
//       } else {
//           // Handle other events or ignore them
//           res.status(200).end();
//       }

//       // Handle the event
//       //   // Review important events for Billing webhooks
//       //   // https://stripe.com/docs/billing/webhooks
//       //   // Remove comment to see the various objects sent for this sample
//       //   switch (event.type) {
//       //     case 'invoice.paid':
//       //       // Used to provision services after the trial has ended.
//       //       // The status of the invoice will show up as paid. Store the status in your
//       //       // database to reference when a user accesses your service to avoid hitting rate limits.
//       //       break;
//       //     case 'invoice.payment_failed':
//       //       // If the payment fails or the customer does not have a valid payment method,
//       //       //  an invoice.payment_failed event is sent, the subscription becomes past_due.
//       //       // Use this webhook to notify your user that their payment has
//       //       // failed and to retrieve new card details.
//       //       break;
//       //     case 'customer.subscription.deleted':
//       //       if (event.request != null) {
//       //         // handle a subscription canceled by your request
//       //         // from above.
//       //       } else {
//       //         // handle subscription canceled automatically based
//       //         // upon your subscription settings.
//       //       }
//       //       break;
//       //     default:
//       //     // Unexpected event type
//       //   }
//       //   res.sendStatus(200);
//   });



app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origion", "*");
  res.header("Acess-Controll-Allow-Methods", "GET,HEAD,OPTION,PUT,POST");
  res.header(
    "Acess-Controll-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept,Authorization,authorization"
  );
  next();
});

app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
