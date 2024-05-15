const express = require('express')
const cors = require('cors');
require('dotenv').config()
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;


// middlewares
app.use(cors({origin:["http://localhost:5173","https://assignment-eleven-b42c8.web.app","https://assignment-eleven-b42c8.firebaseapp.com"],
  credentials:true
}))
app.use(express.json())
app.use(cookieParser())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vl4b2tk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// middlewares2
const logger = (req,res,next)=>{
  console.log('logger',req.method,req.url)
  next()

}

const verifyToken = (req,res,next)=>{
  const token = req?.cookies?.token
  // console.log('token in the middleware',token)
  if(!token){
    return res.status(401).send({message:'Unauthorized access'})
  }
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
    if(err){
      return res.status(401).send({message:'Unauthorized access'})
    }
    req.user = decoded
    next()
  })
  // next()
}

const cookieOptions = {
  httpOnly:true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
}
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
 
    const foodCollection = client.db('foodDB').collection('foods')

  
    app.post('/jwt',async (req,res)=>{
      const user = req.body
      console.log(user,'user token')
      const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
      res.cookie('token',token,cookieOptions)
      .send({success:true})   
    })

    app.post('/logout',async(req,res)=>{
      const user = req.body
      console.log('logging out user',user)
      res.clearCookie('token',{...cookieOptions,maxAge:0}).send({success:true})
    })

    app.post('/foods',   async (req,res)=>{

        const food = req.body
        const result = await foodCollection.insertOne(food)
        res.send(result)
    })

    app.get('/foods', async(req,res)=>{
     
        
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
          user_email:updatedRequest.user_email,
        
         
          
        request_date: updatedRequest.request_date,
   
          status: updatedRequest.status,
          note: updatedRequest.note,
        
        }
       }
       const result = await foodCollection.updateOne(filter,request,options)
       res.send(result)
     

    })

  

    app.get('/foods-request/:email', logger, verifyToken, async(req,res)=>{
        const user = req.user.email
      const email = req.params.email
      if(user !== email){
        return res.status(403).send({message:'Forbidden Access'})
      }
      const filter = {user_email:email,status:"Requested"}
      const result = await foodCollection.find(filter).toArray()
      res.send(result)
      
    })
  
    app.get('/managefood/:email', logger, verifyToken, async(req,res)=>{
      const user = req.user.email
    
      
      const email = req.params.email
      if(user !== email){
        return res.status(403).send({message:'Forbidden Access'})
      }
      const filter = {email:email,status:"Available"}
      const result = await foodCollection.find(filter).toArray()
      res.send(result)
    })

   app.put('/foods/user/:id',async(req,res)=>{
       const id = req.params.id
       const filter = {_id: new ObjectId(id)}
       const options = {upsert:true}
       const update = req.body
       const manageUpdate = {
        $set:{
          email:update.email,
          name:update.name,
          food_name:update.food_name,
          image:update.image,
          location:update.location,
          date:update.date,
          photo: update.photo,
          status:update.status,
          note:update.note,
          quantity:update.quantity
        
        }
       }
       const result = await foodCollection.updateOne(filter,manageUpdate,options)
       res.send(result)
     

    })

    app.delete('/foods/user/:id',async (req,res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await foodCollection.deleteOne(query)
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