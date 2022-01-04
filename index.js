const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient } = require("mongodb");
const ObjectId = require('mongodb').ObjectId;
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.islim.mongodb.net/water-kingdom?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

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


        // GET ALL REVIEWS
        app.get("/reviews", async (req, res) => {
            const cursor = reviews.find({});
            const result = await cursor.toArray();
            res.json(result);
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
        // GET MY BOOKING
        app.get("/booking/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const myBooking = await bookingCollection.find(query).toArray();
            res.json(myBooking);
        })
        // DELETE SINGLE BOOKING DATA
        app.delete('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await bookingCollection.deleteOne(query)
            res.json(result)
        })
    }
    catch {

    }
}
run().catch(console.dir);
app.get("/", async (req, res) => {
    res.send("Water Park Server Running")
})
app.listen(port, () => {
    console.log('Listening the Port', port);
})