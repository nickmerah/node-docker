const express = require("express")
const mongoose = require('mongoose');
const session = require ('express-session')
const redis = require('ioredis');
const cors = require('cors')


let RedisStore = require('connect-redis')(session)


const {MONGO_USER, MONGO_PASSWORD, MONGO_IP,MONGO_PORT, REDIS_URL, REDIS_PORT, SESSION_SECRET }  = require("./configs/config")

const redisClient = redis.createClient({host:REDIS_URL,port:REDIS_PORT});

redisClient.on('connect',() => {
    console.log('connected to redis successfully!');
})
 
const postRouter = require("./routes/postRoutes")
const userRouter = require("./routes/userRoutes")

const app = express()
const MONGO_URL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`

const connectwithRetry = () =>{
    mongoose.connect(MONGO_URL, 
        { useNewUrlParser: true, 
            useUnifiedTopology: true
        })
.then(()=>console.log("Successfully connected to DB"))
.catch((e) =>{
    console.log(e)
    setTimeout(connectwithRetry,5000)
});
}

connectwithRetry();
app.enable("trust proxy")
app.use(cors({}))


app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: SESSION_SECRET,
      cookie: {
        saveUninitialized: false,
        resave: false,
        secure: false,
        httpOnly: true,
        maxAge: 60000
      }
        
    })
  )

app.use(express.json())

app.get("/api/v1", (req, res) => {
    res.send("<h2>Welcome to Express JS...</h2>")
    console.log("Hi there!")
})

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);


const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`listening on port ${port}`))