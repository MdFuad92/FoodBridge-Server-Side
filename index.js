const express = require('express')
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;


// middlewares
app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vl4b2tk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
 
    const foodCollection = client.db('foodDB').collection('foods')

    app.post('/foods',async (req,res)=>{
        const food = req.body
        const result = await foodCollection.insertOne(food)
        res.send(result)
    })

    app.get('/foods',async(req,res)=>{
        const cursor = foodCollection.find()
        const result = await cursor.toArray()
        res.send(result)
    })

    app.get('/foods/:id',async(req,res)=>{
      const id = req.params.id 
      const query = {_id: new ObjectId(id)}
      const result = await foodCollection.findOne(query)
      res.send(result)
    })

    app.put('/foods/:id',async(req,res)=>{
       const id = req.params.id
       const filter = {_id: new ObjectId(id)}
       const options = {upsert:true}
       const updatedRequest = req.body
       const request = {
        $set:{
          email:updatedRequest.email,
        
         
          
        request_date: updatedRequest.request_date,
   
          status: updatedRequest.status,
          note: updatedRequest.note,
        
        }
       }
       const result = await foodCollection.updateOne(filter,request,options)
       res.send(result)
     

    })

    app.get('/food/:email',async(req,res)=>{
      const email = req.params.email
      const filter = {email:email,status:"Requested"}
      const result = await foodCollection.find(filter).toArray()
      res.send(result)
      
    })
  
    //    Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('my latest server is running');
})

app.listen(port,()=>{
    console.log(`my latest server is running: ${port}`)
})