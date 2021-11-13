const express = require('express');
const cors = require('cors');
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const app = express();
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cjoji.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('Db connected successfully.');

        const database = client.db('Sunglass');
        const productsCollection = database.collection('Products');
        const ordersCollection = database.collection('Orders');
        const usersCollection = database.collection('Users');
        const reviewsCollection = database.collection('Reviews');

        // Get All products
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.send(products);
        });

        // Get A Specific product
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.send(product);
        });

        // Insert a product
        app.post('/addProduct', async (req, res) => {
            console.log('request for adding product', req.body);
            const newProduct = req.body;
            const result = await productsCollection.insertOne(newProduct);
            console.log('added product', result);
            res.json(result);
        });

        // Insert an order
        app.post('/addOrder', async (req, res) => {
            console.log('request for adding order', req.body);
            const newOrder = req.body;
            const result = await ordersCollection.insertOne(newOrder);
            console.log('added order', result);
            res.json(result);
        });

        // Get All orders
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = ordersCollection.find(query);
            const orders = await cursor.toArray();
            res.send(orders);
        });

        // Get A Specific order
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await ordersCollection.findOne(query);
            res.send(order);
        });


        // Delete an order
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleted = await ordersCollection.deleteOne(query);
            res.send(deleted);
        });


        // Insert a review
        app.post('/addReview', async (req, res) => {
            console.log('request for adding review', req.body);
            const newReview = req.body;
            const result = await reviewsCollection.insertOne(newReview);
            console.log('added review', result);
            res.json(result);
        });

        // Get All reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        // Insert an user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        // Update an user
        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // Update user role
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const requester = req.email;
            if (requester) {
                const requesterAccount = await usersCollection.findOne({ email: requester });
                if (requesterAccount.role === 'admin') {
                    const filter = { email: user.email };
                    const updateDoc = { $set: { role: 'admin' } };
                    const result = await usersCollection.updateOne(filter, updateDoc);
                    res.json(result);
                }
            }
            else {
                res.status(403).json({ message: 'Sorry! You do not have access to make an user to admin' })
            }

        })

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Sunglass store nodejs server running successfully.');
});

app.listen(port, () => {
    console.log('App is listening at port ', port);
});