const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000;

const app = express()

const corsOption = {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credential: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOption))
app.use(express.json())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.abrfq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const booksCollection = client.db('bookVibe').collection('books')
    const borrowBookCollection = client.db('bookVibe').collection('borrowBooks')


    app.get('/books', async (req, res)=> {
        const result = await booksCollection.find().toArray()
        res.send(result)
    })

    app.get('/book/:id', async (req, res)=> {
        const id = req.params.id
        const query = {_id: new ObjectId(id)}
        const result = await booksCollection.findOne(query)
        res.send(result)
    })

    app.post('/book', async (req, res)=> {
      const bookData = req.body
      const result = await booksCollection.insertOne(bookData)
      res.send(result)
    })

    app.post('/borrow', async (req, res)=> {
      const borrowData = req.body
      const result = await borrowBookCollection.insertOne(borrowData)
      res.send(result)
    })

    app.get('/borrows', async (req, res)=> {
      const result = await borrowBookCollection.find().toArray()
      res.send(result)
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error

  }
}
run().catch(console.dir);




app.get('/', (req, res)=> {
    res.send('Hello from library management server')
})

app.listen(port, ()=> {
    console.log(`Server running on port ${port}`)
})