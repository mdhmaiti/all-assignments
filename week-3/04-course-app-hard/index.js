const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

const SECRET = 'SECr3t';
//creating the token fnc
const createJwtToken = (user) =>{
  const token = jwt.sign(user.username,SECRET,{expiresIn:'1 hr'})
  return token;
}

// creating the Auth jwt middleware it consist of the req,res and next 

const AuthJwt = (req, res, next) =>{
  // in this context everything is passed in the header (doing as told )
  const authHeader = req.headers.authorization;
  if(authHeader){
      // if there is auth header extract the token and verify 
      const token = authHeader.split('')[1];
      jwt.verify(token,SECRET,( err,user)=>{
        if(err){
          res.status(403).json({message : " token verification error"})
        }
        res.user = user;// collecting the data
        next();

      });

  }
  else{
    res.status(401).json({message:"authentiation error header authorization not found"})
  }

}

// creating the schemas and the model for the which is the collections and the document files inside the mongo db

// creating the schema for the user , courses and the admin .
// creating the documents structure 
const userSchema = new mongoose.Schema({
  username:{type:String},
  password:{type:String},
  purchasedCourse:[{type:mongoose.Schema.Types.ObjectId,ref:'course'}]// it tells that the purchase course should be an array inside which there should be an object inside which thre should be an id (must) and the other things should be inside the course collection 

})

const adminSchema = new mongoose.Schema({

  username:String,
  password:String,

});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  imageLink: String,
  published: Boolean,

});


// Define mongoose models-> creating collections
const User = mongoose.model('User', userSchema);// it will plurazise the name database like Users
const Admin = mongoose.model('Admin', adminSchema);
const Course = mongoose.model('Course', courseSchema);

//connection 

mongoose.connect('mongodb+srv://medhashis000:5CVohk3AxH38oCo4@cluster0.pga7mlv.mongodb.net/courses',{ useNewUrlParser: true, useUnifiedTopology: true, dbName: "courses" })







let ADMINS = [];
let USERS = [];
let COURSES = [];

// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
});

app.post('/admin/login', (req, res) => {
  // logic to log in admin
});

app.post('/admin/courses', (req, res) => {
  // logic to create a course
});

app.put('/admin/courses/:courseId', (req, res) => {
  // logic to edit a course
});

app.get('/admin/courses', (req, res) => {
  // logic to get all courses
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
});

app.post('/users/login', (req, res) => {
  // logic to log in user
});

app.get('/users/courses', (req, res) => {
  // logic to list all courses
});

app.post('/users/courses/:courseId', (req, res) => {
  // logic to purchase a course
});

app.get('/users/purchasedCourses', (req, res) => {
  // logic to view purchased courses
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
