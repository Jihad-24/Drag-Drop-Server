const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
require('dotenv').config()
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3001;

// middilewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.8urwnno.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const userCollection = client.db('TaskManagement').collection('users');
    const taskCollection = client.db('TaskManagement').collection('tasks');

    // task api 

    app.get('/tasks', async (req, res) => {
      const result = await taskCollection.find().toArray();
      res.send(result);
    })

    app.post('/tasks', async (req, res) => {
      const task = req.body;
      const result = await taskCollection.insertOne(task);
      res.send(result);
    })

    app.patch('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedtasks = req.body;
      const tasks = {
        $set: {
          status: updatedtasks.status,
        }
      }
      const result = await taskCollection.updateOne(filter, tasks, options)
      res.send(result);
    })

    app.put('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedtasks = req.body;
      const tasks = {
        $set: {
          titleName: updatedtasks.titleName,
          priority: updatedtasks.priority,
          deadlines: updatedtasks.deadlines,
          authorName: updatedtasks.authorName,
          description: updatedtasks.description,
          taskImage: updatedtasks.taskImage
        }
      }
      const result = await taskCollection.updateOne(filter, tasks)
      res.send(result);
    })

    app.delete('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const quary = { _id: new ObjectId(id) };
      const result = await taskCollection.deleteOne(quary);
      res.send(result);
    })


    // user api
    app.get('/users', async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    app.post('/users', async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'user already exist', insertedId: null })
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    })

    app.put('/user/:id', async (req, res) => {
      const userId = req.params.id;
      // console.log(userId);
      const { name, image } = req.body;
      try {
        const result = await userCollection.updateOne(
          { _id: new ObjectId(userId) },
          { $set: { name, image } },
        );
        // console.log(result);
        res.send(result);
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
      }
    });

  } finally {

  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Task Management  in running')
})

app.listen(port, () => {
  console.log(`Task Management  is on port ${port}`);
})