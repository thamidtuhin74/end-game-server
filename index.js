const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;


// middle ware 
app.use(cors())
app.use(express.json())



// username : endgame-admin
// PASSWORD : BuWGBl23o4zITfNs

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASSWORD}@cluster0.vqsktco.mongodb.net/?retryWrites=true&w=majority`;

// const uri = "mongodb+srv://<username>:<password>@cluster0.vqsktco.mongodb.net/?retryWrites=true&w=majority";


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const usersCollection = client.db("campusReserveDB").collection("users");

        // const collageCardCollection = client.db("campusReserveDB").collection("collageCard");
        const collagesRoutesCollection = client.db("campusReserveDB").collection("collegesRoutes");
        // const collagesNameCollection = client.db("campusReserveDB").collection("college-name");
        const myCollegeCollection = client.db("campusReserveDB").collection("my-college");




        app.get('/users/:email', async (req, res) => {
            const userEmail = req.params.email; // Get the email from the request URL params
            const user = await usersCollection.findOne({ email: userEmail });

            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json(user);
        });




        // users put api
        app.put('/users/:id', async (req, res) => {
            const id = req.params.id;
            const profile = req.body;
            console.log(profile);
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedProfile = {
                $set: {
                    name: profile.name,
                    email: profile.email,
                    address: profile.address,
                    university: profile.university
                }
            }
            const result = await usersCollection.updateOne(filter, updatedProfile, options)
            console.log(result);
            res.send(result)
        })



        //user post user collection all users here
        app.post('/users', async (req, res) => {
            const user = req.body;

            const query = { email: user.email }
            const existingUser = await usersCollection.findOne(query);

            if (existingUser) {
                return res.send({ message: 'User All Ready Exist ' })
            }


            const result = await usersCollection.insertOne(user);
            res.send(result)
        })



        //  searching colleges by name
        app.get("/search-colleges", async (req, res) => {
            try {
                const searchCollege = req.query.q;
                const searchResult = await collagesRoutesCollection.find({ collegeName: { $regex: searchCollege, $options: "i" } })
                    .toArray();

                res.status(200).json(searchResult);
            } catch (err) {
                console.error("Error searching colleges:", err);
                res.status(500).json({ error: "Internal server error" });
            }
        });




        //college name get api for admission routes
        app.get('/collegeName', async (req, res) => {
            const result = await collagesRoutesCollection.find().toArray();
            res.send(result)
        })

        // post api for admission form post in my college collection 
        app.post('/add-admission', async (req, res) => {
            const addAdmission = req.body;
            const result = await myCollegeCollection.insertOne(addAdmission);
            // console.log(result);

            res.send(result)
        })

        // get api for my college route showing admission form details

        app.get('/my-college', async (req, res) => {
            const result = await myCollegeCollection.find().toArray();
            res.send(result)
        })

        app.get("/my-college-details/:id", async (req, res) => {
            const id = req.params.id;

            const query = { _id: new ObjectId(id) }

            const result = await collagesRoutesCollection.findOne(query);
            res.send(result)
        })


       

        // routes collages data api
        app.get('/collagesRoutes', async (req, res) => {
            const result = await collagesRoutesCollection.find().toArray();
            res.send(result)
        })

        // get api for collegeDetails component a single data
        app.get("/collegeDetails/:id", async (req, res) => {
            const id = req.params.id;

            const query = { _id: new ObjectId(id) }

            const result = await collagesRoutesCollection.findOne(query);
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('campus reserve is running')
})

app.listen(port, () => {
    console.log(`campus reserve is running on port ${port}`);
})