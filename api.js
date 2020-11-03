const express=require("express")//importing express module
const app=express() //creating express instance
const bodyParser=require('body-parser')
const bcrypt=require('bcrypt')
const jwt = require('jsonwebtoken');
const User=require('./models/user')
const auth = require('./middleware/auth');


const mongoose=require("mongoose") //importing mongooose module
 const port=3000;

const server = '127.0.0.1:27017'; // REPLACE WITH YOUR DB SERVER
const database = 'news';
class Database 
{
    constructor() {
      this._connect()
    }
   _connect() {
       mongoose.connect(`mongodb://${server}/${database}`)
         .then(() => {
           console.log('Database connection successful')
         })
         .catch(err => {
           console.error('Database connection error')
         })
    }

  }

  module.exports= new Database();

  app.use(bodyParser.json());
  app.use(express.json())
  app.use(bodyParser.urlencoded({
  extended: true
}));

  const NewsSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    link: { type: String, required: true },
     by:{type:String,required:true},
     timestamp:{type:Date,default:new Date()}
  });
  
  var News = mongoose.model('news', NewsSchema);

   app.get('/',function(req,res){

    res.send('Welcome to hacker news')
    })

app.post('/newpost',auth,function(req,res){
    
   const news = new News({
             
       title: req.body.title,
        description: req.body.description,
        link:req.body.link,
        timestamp:new Date(),
        by:req.body.by
      });
      news.save()
      .then(
        () => {
          res.status(201).json({

            message: 'Post saved successfully!'
          });
        }
      ).catch(
        (error) => {
          res.status(400).json({
             error: error
          });
        }
      );
})
app.get('/news',auth,function(req,res){ //read all news documents from database with all info
 
  News.find()  // search query
  .then(doc => {
    res.json(doc)
  })
  .catch(err => {
    res.send(err)
  })
})
app.get('/news/:id',auth,function(req,res){
  const query=req.params.id;//read news using query
  News.find({_id:query})
  .then(doc => {
    res.json(doc)
   // console.log(doc)
  })
  .catch(err => {
   res.send(err)
    // console.error(err)
  })

})

app.patch('/news/:id',auth, (req, res, next) => {
  
  const query = new News({
    _id: req.params.id,
    title: req.body.title,
    description: req.body.description,
    link: req.body.link,
    by:req.body.by,
    updatedAt:{ type:Date,default:new Date()}
    
  });
  News.updateOne({_id: req.params.id}, query).then(
    () => {
      
      res.status(201).json({ 

        message: 'news updated successfully!',
        
        title: req.body.title,
   
        updatedAt:{ type:Date,default:new Date()}

      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
});

app.delete('/news/:id', auth,(req, res, next) => {
  News.deleteOne({_id: req.params.id}).then(
    () => {
      res.status(200).json({
        message: 'Deleted!'
      });
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
});
app.listen(port,()=>{
    console.log(port)
})


// var User=require('./Routes/User');
// app.use('/',User)
app.post('/signup',function(req,res){
  //console.log(req.body)
  bcrypt.hash(req.body.password, 10).then(
    (hash) => {
      const user = new User({
        email: req.body.email,
        password: hash
      });
      user.save().then(
        (doc) => {
          res.status(201).json({
            message: 'User added successfully!',
            doc
          });
        }
      ).catch(
        (error) => {
          res.status(500).json({
            error: error
          });
        }
      );
    }
  );
})
app.post('/login',function(req,res){
  User.findOne({ email: req.body.email }).then(
    (user) => {
      if (!user) {
        return res.status(401).json({
          message:'user not found'
        });
      }
      bcrypt.compare(req.body.password, user.password).then(
        (valid) => {
          if (!valid) {
            return res.status(401).json({
              message:'Incorrect password!'
            });
          }
          const token = jwt.sign(
            { userId: user._id },
            'RANDOM_TOKEN_SECRET',
            { expiresIn: '24h' });
          res.status(200).json({
            userId: user._id,
            token: token,
            message: 'User login successfull!'
          });
        }
      ).catch(
        (error) => {
          res.status(500).json({
            error: error
          });
        }
      );
    }
  ).catch(
    (error) => {
      res.status(500).json({
        error: error
      });
    }
  );

})