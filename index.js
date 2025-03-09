const express = require('express')
const cors = require('cors')
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





app.get('/', (req, res)=> {
    res.send('Hello from library management server')
})

app.listen(port, ()=> {
    console.log(`Server running on port ${port}`)
})