const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient } = require("mongodb");
const ObjectId = require('mongodb').ObjectId;
const Razorpay = require("razorpay");
require("dotenv").config();
const sha256 = require("crypto-js/sha256");
const crypto = require('crypto');

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.islim.mongodb.net/water-kingdom?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const instance = new Razorpay({
  key_id: `${process.env.RAZOR_PAY_KEY_ID}`,
  key_secret: `${process.env.RAZOR_PAY_KEY_SECRET}`,
});

async function run() {
  try {
    await client.connect();
    console.log("database has connected");
    const database = client.db("water-kingdom");
    const reviews = database.collection("reviews");
    const packageBooking = database.collection("package-booking");
    const usersCollection = database.collection('users');
    const eventPackages = database.collection("event-packages");
    const bookingCollection = database.collection("booking-collection");
    const blogsCollection = database.collection("blogs");
    const rideCollection = database.collection("ride-collection");

    // GET ALL REVIEWS
    app.get("/reviews", async (req, res) => {
      const cursor = reviews.find({});
      const result = await cursor.toArray();
      res.json(result);
    })
    // REVIEW POST API 
    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await reviews.insertOne(review);
      res.send(result)
    })
    // POST A PACKAGE BOOKING, DETAILS
    app.post("/packageBooking", async (req, res) => {
      const packageDetails = req.body;
      const result = await packageBooking.insertOne(packageDetails);
      res.json(result);
    })
    // GET Users API
    app.get('/users', async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.json(users);
    });
    //add users in database
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    //update users
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    });
    // ADMIN ROLE FINDER from USERSCOLLECTION
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email }
      const user = await usersCollection.findOne(query)
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    })
    // EVENT PACKAGES GET
    app.get("/packages", async (req, res) => {
      const cursor = eventPackages.find({});
      const result = await cursor.toArray();
      res.json(result);
    })
    // SINGLE EVENT PACKAGE FIND
    app.get("/packages/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const package = await eventPackages.findOne(query);
      res.json(package);
    })
    // POST BOOKING
    app.post("/booking", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.json(result);
    })
    // GET ALL BOOKING
    app.get("/booking", async (req, res) => {
      const cursor = bookingCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    })
     // ADD INOVICE
    app.patch('/bookingUpdate/:id', async (req, res) => {
        const id = req.params.id;
        const updateBooking = req.body;
        const filter = { _id: ObjectId(id) }
        const options = { upsert: true };
        const updateDoc = {
            $set: updateBooking
        };
        const result = await bookingCollection.updateOne(filter, updateDoc, options)
        res.json(result)
    })
    // GET MY BOOKING
    app.get("/booking/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const myBooking = await bookingCollection.find(query).toArray();
      res.json(myBooking);
    });
    // GET Blogs API
    app.get('/blogs', async (req, res) => {
      const cursor = blogsCollection.find({});
      const blogs = await cursor.toArray();
      res.json(blogs);
    });
    //add Blogs in database
    app.post('/blogs', async (req, res) => {
      const blog = req.body;
      const result = await blogsCollection.insertOne(blog);
      res.json(result);
    });
    // GET Single Blog
    app.get('/blogs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const blog = await blogsCollection.findOne(query);
      res.json(blog);
    })
    // DELETE SINGLE BOOKING DATA
    app.delete('/booking/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await bookingCollection.deleteOne(query)
      res.json(result)
    });
    // UPDATE SINGLE BOOKING DETAILS API
    app.patch('/booking/:id', async (req, res) => {
      const id = req.params.id;
      const updateBooking = req.body;
      const filter = { _id: ObjectId(id) }
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updateBooking.status
        },
      };
      const result = await bookingCollection.updateOne(filter, updateDoc, options)
      res.json(result)
    })
    // GET ALL RIDE COLLECTION 
    app.get("/rides", async (req, res) => {
      const cursor = rideCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    })
    // GET SINGLE RIDE FROM RIDECOLLECTION
    app.get('/rides/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const ride = await rideCollection.findOne(query);
      res.json(ride)
    })
    // POST A SINGLE RIDE
    app.post('/rides', async (req, res) => {
      const rideDetails = req.body;
      const result = await rideCollection.insertOne(rideDetails);
      res.send(result)
    })
    // UPDATE SINGLE RIDE DETAILS
    app.put('/rides/:id', async (req, res) => {
      const id = req.params.id;
      const updatedRide = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updatedRide.name,
          price: updatedRide.price,
          img: updatedRide.img,
          description: updatedRide.description
        },
      };
      const result = await rideCollection.updateOne(filter, updateDoc, options)
      res.json(result)
    })
    // DELETE SINGLE RIDE DATA
    app.delete('/rides/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await rideCollection.deleteOne(query)
      res.json(result)
    })
    // RAZOR PAY BY CHANDAN
    app.post("/createOrder", async (req, res) => {
      // STEP 1:
      const orderDetails = req.body;
      const { amount, currency, receipt, notes } = await orderDetails;
      console.log(orderDetails)

      try {
        // STEP 2:    
        instance.orders.create({ amount, currency, receipt, notes }, async function (err, order) {
          //STEP 3 & 4: 
          if (err) {
            return res.status(500).json({
              message: "Something Went Wrong",
            });
          }
          console.log(order)
          return res.status(200).json(order);
        }
        )
      } catch (err) {
        return res.status(500).json({
          message: "Something Went Wrong",
        });
      }
    })
    // VERIFY ORDER CREATED BY CHANDAN
    app.post('/verifyOrder', (req, res) => {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      console.log("sign", razorpay_signature)
      const key_secret = "hit20H8dtUjpDkawNZFXoDuE";
      let hmac = crypto.createHmac('sha256', key_secret);
      hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
      const generated_signature = hmac.digest('hex');

      if (razorpay_signature === generated_signature) {
        res.json({ success: true, message: "Payment has been verified" })
      }
      else
        res.json({ success: false, message: "Payment verification failed" })
    });

  } catch {
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", async (req, res) => {
  res.send("Water Park Server Running")
})
app.listen(port, () => {
  console.log('Listening the Port', port);
})