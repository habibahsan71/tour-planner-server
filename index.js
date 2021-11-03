const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i5s9y.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.get("/", (req, res) => {
    res.send("server is running fast");
})


async function run() {
    try {
        await client.connect();
        console.log('connected to DB');
        const database = client.db("tourGroup");
        const spotCollection = database.collection("services");
        const cart_Collection = database.collection('cart')
        const order_Collection = database.collection('orders')


        //GET API

        app.get('/services', async (req, res) => {
            const cursor = spotCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            // console.log('getting specific id', id);
            const query = { _id: ObjectId(id) };
            const service = await spotCollection.findOne(query);
            res.json(service);
        })

        // load cart data by id
        app.get("/cart/:uid", async (req, res) => {
            const uid = req.params.uid;
            const query = { uid: uid };
            const result = await cart_Collection.find(query).toArray();
            res.json(result);
        });

        //GET Order APi
        app.get('/orders', async (req, res) => {
            const cursor = order_Collection.find({})
            const order = await cursor.toArray()
            res.send(order)
        })

        //POST API

        app.post('/service/add', async (req, res) => {
            console.log(req.body);
            const service = req.body
            const result = await cart_Collection.insertOne(service)
            console.log(result);
            res.send(result)
        })

        app.post('/services', async (req, res) => {
            const service = req.body;
            const result = await spotCollection.insertOne(service);
            console.log(result.insertedId);
            res.json(result)
        });

        // delete data from cart delete api
        app.delete("/delete/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await cart_Collection.deleteOne(query);
            console.log(result);
            res.json(result);
        });



        //DELETE APII
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await spotCollection.deleteOne(query);
            res.json(result)
        })

        // app.delete("/purchase/:uid", async (req, res) => {
        //     const uid = req.params.uid;
        //     const query = { uid: uid };
        //     const result = await cart_Collection.deleteMany(query);
        //     res.json(result);
        // });

    } finally {
        //   await client.close();
    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log("Running server", port);
})