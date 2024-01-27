const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config()
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.payment_key);
const multer = require('multer');
const fetch = require('node-fetch');


app.use(cors());



app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.json());

const upload = multer();




const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorized access' });
    }
    // bearer token
    const token = authorization.split(' ')[1];

    jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ error: true, message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })
}

const img_hosting_url = `https://api.imgbb.com/1/upload?key=${process.env.img_hosting_token}`


app.post('/Imgupload', upload.single('image'), (req, res) => {
    const imageBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const contentType = req.file.mimetype;

    console.log(req.body);
    console.log(img_hosting_url);

    fetch(img_hosting_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `image=${encodeURIComponent(imageBuffer.toString('base64'))}&name=${encodeURIComponent(fileName)}&content_type=${encodeURIComponent(contentType)}`,
    })
        .then(response => response.json())
        .then(imgResponse => {
            res.json(imgResponse);
        })
        .catch(error => {
            res.status(500).json({ error: 'Failed to upload image' });
        });
});

// 
// 
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.ChainTechUserName}:${process.env.ChainTechPassword}@cluster0.kaq6cez.mongodb.net/?retryWrites=true&w=majority`;







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

        
        const userCollection = client.db("ChainTechBlock").collection("users");
        const taskCollection = client.db("ChainTechBlock").collection("tasks");
        const selectClassCollection = client.db("ChainTechBlock").collection("selectClass");
        const enrollClassCollection = client.db("ChainTechBlock").collection("enrollClass");
        const usernotificationCollection = client.db("ChainTechBlock").collection("usernotification");
        


        app.post("/jwt",  (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.JWT_TOKEN, { expiresIn: '5hr' });
            return res.send({token})
        })

      const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email }
      const user = await userCollection.findOne(query);
      if (user?.role !== 'admin') {
        return res.status(403).send({ error: true, message: 'forbidden message' });
      }
      next();
    }

        app.post("/usernotification", async (req, res) => {
            const notification = req.body;
            const result = await usernotificationCollection.insertOne(notification);
            return res.send(result);
        })

        app.get('/tasks',  async (req, res) => {
            const result = await taskCollection.find().toArray();
             return res.send(result);
        })

        app.post("/tasks", async (req, res) => {
            const newTask = req.body;
            const result = await taskCollection.insertOne(newTask);
            return res.send(result);
        })

        //after make payment...seat are reduce from available seat...
     
       


        app.patch("/task/:id",  async (req, res) => {
            const id = req.params.id;
            const updateData = req.body;
          
            const filter = { _id: new ObjectId(id) };
            const updateDoc = {
              $set: {
                Title: updateData.Title,
                Description: updateData.Description,
                updatedTime: new Date(),
              },
            };
          
            const options = { upsert: true };
          
            try {
              const result = await taskCollection.updateOne(filter, updateDoc, options);
          
              return res.json(result);
            } catch (error) {
              console.error("Error updating task:", error.message);
              return res.status(500).json({ error: "Internal Server Error" });
            }
        })

        app.patch("/task/comment/:id",  async (req, res) => {
            const id = req.params.id;
  const updateData = req.body;

  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $push: {
      comments: {
        usercomment: updateData.usercomment,
        CommenterName: updateData.CommenterName,
        CommenterEmail: updateData.CommenterEmail,
        CommentTime: new Date(),
      },
    },
  };

  const options = { upsert: true };

  try {
    const result = await taskCollection.updateOne(
      filter,
      {
        $setOnInsert: {
          comments: [],
        },
      },
      options
    );

    if (result.upsertedCount > 0) {
    
      await taskCollection.updateOne(filter, updateDoc);
    } else {
      
      await taskCollection.updateOne(filter, updateDoc);
    }

    return res.json(result);
  } catch (error) {
    console.error("Error updating task:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
        })

        app.delete("/task/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await taskCollection.deleteOne(query);
            
                if (result.deletedCount === 1) {
                  return res.json({ success: true, message: "Task deleted successfully" });
                } else {
                  return res.status(404).json({ success: false, message: "Task not found" });
                }
              } catch (error) {
                console.error("Error deleting task:", error.message);
                return res.status(500).json({ success: false, error: "Internal Server Error" });
              }
        })
        
     
      

       
        



        // //user info insert to db...
        app.get("/users",  async (req, res) => {
           
            const result = await userCollection.find().toArray();
            return res.send(result);
        })

      

       


        app.post("/users",  async (req, res) => {
           
            const user = req.body;
         
            
            const query = { email: user.email };
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                return res.send({message:"user alreay in exists"})
            }
            const result = await userCollection.insertOne(user); 
            return res.send(result);
        })

       

    


        

       
        

        

      



        // ///payment user info api,,,,,

        
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Chain Tech Project Setup')
})

app.listen(port, () => {
    console.log(`Chain Tech Project is sitting on port ${port}`);
})



