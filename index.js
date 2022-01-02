const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const {MongoClient} = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.islim.mongodb.net/water-kingdom?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try{
        await client.connect();
        console.log("database has connected")
        const database = client.db("water-kingdom");
        const reviews = database.collection("reviews");
        const packageBooking = database.collection("package-booking");

        // GET ALL REVIEWS
        app.get("/reviews", async(req,res) => {
            const cursor = reviews.find({});
            const result = await cursor.toArray();
            res.json(result);
        })
        // POST A PACKAGE BOOKING, DETAILS
        app.post("/packageBooking", async(req, res) => {
            const packageDetails = req.body;
            const result = await packageBooking.insertOne(packageDetails);
            res.json(result);
        })
    }
    catch {

    }
}
run().catch(console.dir);
app.get("/", async(req, res) => {
    res.send("Water Park Server Running")
})
app.listen(port, () => {
    console.log('Listening the Port', port);
})