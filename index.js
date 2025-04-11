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

    app.put('/book/:id', async (req, res)=> {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const updatedData = req.body
      const option = {upsert: true}
      const updateBook = {
        $set: {
          ...updatedData
        }
      }
      const result = await booksCollection.updateOne(query, updateBook, option)
      res.send(result)
    })

    app.post('/borrow', async (req, res)=> {
      const borrowData = req.body
      console.log('borrow data', borrowData)
      const query = {
        bookId: borrowData.bookId,
        "userInfo.email": borrowData.userInfo.email
      }

      const alreadyBorrowed = await borrowBookCollection.findOne(query)
      if(alreadyBorrowed){
        return res
          .status(400)
          .send('Sorry you have already borrow this book!')
      }
      const result = await borrowBookCollection.insertOne(borrowData)
      
      const updateDoc = {
         $inc: { quantity: -1}
      }

      const bookQuery = { _id: new ObjectId(borrowData.bookId)}
      const updateBookCount = await booksCollection.updateOne(bookQuery, updateDoc)
      console.log('update book count',updateBookCount)
      res.send(result)
    })

    app.patch('/borrow/:id', async (req, res)=> {
      const bookId = req.body.bookId
      const email = req.body.email
      const borrowId = req.params.id
      const bookQuery = { _id: new ObjectId(bookId)}

      const borrowFound = await borrowBookCollection.findOne({ _id: new ObjectId(borrowId)})
      const bookFound = await booksCollection.findOne(bookQuery)

      if(borrowFound.userInfo.email !== email){
        return res.status(403).send({ message: 'You are not authorized to return this book' });
      }

    if(bookId === bookFound._id.toString()){
        const result = await borrowBookCollection.deleteOne({ _id: new ObjectId(borrowId)})
        const updateBook = {
          $inc: { quantity: 1}
        }
        const updateBookCount = await booksCollection.updateOne(bookQuery, updateBook)
        console.log('update book count',updateBookCount)
        res.send(result)
      }
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