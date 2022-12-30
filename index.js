const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;
require('dotenv').config()

app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
    res.send("hello")
})


//  mongo db start

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.pwszy9e.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try {
        const postsCollection = client.db('click').collection('posts');
        const commentsCollection = client.db('click').collection('comments');
        const likesCollection = client.db('click').collection('likes');
        const usersCollection = client.db('click').collection('users');
        
       

        app.post('/posts', async (req, res) => {
            const query = req.body;
            const post = await postsCollection.insertOne(query)
            res.send(post)
        });

        app.get('/posts', async (req, res) => {
            const query = {}
            const result = await postsCollection.find(query).toArray()
            res.send(result)
        })

        // comment 

        app.post('/comment', async (req, res) => {
            const comment = req.body 
           
            const result = await commentsCollection.insertOne(comment)
            res.send(result)
        })

        app.get('/comments/:id', async(req, res) => {
            const id = req.params.id
            const query = {postId: id}
            const options = {
                sort: {"time" : -1} 
            }
            const comments = await commentsCollection.find(query, options).toArray()
            res.send(comments)
        })

        // reactions 
        app.post('/likes', async(req, res) => {
            const query = req.body;
            const likes = await likesCollection.insertOne(query);
            res.send(likes);
        })

        app.get('/likes/:id', async(req, res) => {
            const id = req.params.id 
            const query = {postId: id}
            const likes = await likesCollection.find(query).toArray()
            res.send(likes)
        })

        // send to db user 
        app.post('/users', async(req, res) => {
            const query = req.body;
            const users = await usersCollection.insertOne(query);
            res.send(users);
        })


        // update profile
        app.put('/update', async(req, res) => {
            const updatedProfile = req.body;
            const email = req.query.email;
            const filter = {email};
            const options = {upsert: true};
            const updatedDoc = {
                $set: {
                    displayName: updatedProfile.displayName,
                    address: updatedProfile.address,
                    university: updatedProfile.university,
                    bio: updatedProfile.bio,
                    photoURL: updatedProfile.photoURL
                }
                
            };
            const result = await usersCollection.updateMany(filter, updatedDoc, options);
            res.send(result);
        });

        app.get('/users', async(req, res) => {
            const email = req.query.email
            const filter = {email}
            const result = await usersCollection.findOne(filter)
            res.send(result)
        })

        app.get('/allusers', async(req, res) => {
            const query = {}
            const result = await usersCollection.find(query).toArray()
            res.send(result)
        })
        

    }
    finally {

    }
}
run().catch(error => console.log(error))



app.listen(port)

