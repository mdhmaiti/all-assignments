const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

const SECRET = 'SECr3t';


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


//creating the token fnc

const createJwtToken = (user)=> {
  const payload ={username:user.username,}
  return jwt.sign(payload,SECRET,{expiresIn:'1 hr'})
}


// creating the Auth jwt middleware it consist of the req,res and next 

const AuthJwt = (req, res, next) =>{
// in this context everything is passed in the header (doing as told )
const authHeader = req.headers.authorization;
if(authHeader){
    // if there is auth header extract the token and verify 
    const token = authHeader.split(' ')[1];
    jwt.verify(token,SECRET,( err,user)=>{
      if(err){
        res.status(403).json({message : " token verification error"})
      }
      req.user = user;// collecting the data
      next();

    });

}
else{
  res.status(401).json({message:"authentiation error header authorization not found"})
}

}




let ADMINS = [];
let USERS = [];
let COURSES = [];

// Admin routes
app.post('/admin/signup', async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });
  
    if (admin) {
      res.status(403).json({ message: 'Admin already exists' });
    } else {
      const obj = { username: username, password: password };
      const newAdmin = new Admin(obj);                         
       await newAdmin.save();
      const token = createJwtToken(username);
      res.json({ message: 'Admin created successfully', token });
    }

  
 
});
app.post('/admin/login', async (req, res) => {
  // logic to log in admin
  const { username, password } = req.headers;
  const admin = await Admin.findOne({ username, password });
  if (admin) {
    const token = createJwtToken(username);
    res.json({ message: 'Logged in successfully', token });
  } else {
    res.status(403).json({ message: 'Invalid username or password' });
  }
});

app.post('/admin/courses', async (req, res) => {
  // logic to create a course
  const course = new Course(req.body);
  await course.save();
  res.json({ message: 'Course created successfully', courseId: course._id });
});


app.put('/admin/courses/:courseId',AuthJwt, async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.courseId, req.body, { new: true });

  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  res.json({ message: 'Course updated successfully', updatedCourse: course });
});
app.get('/admin/courses',AuthJwt, async (req, res) => {
  const courses = await Course.find();
  res.json({ courses });
});


// User routes
app.post('/users/signup', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user) {
    res.status(403).json({ message: 'User already exists' });
  } else {
    const newUser = new User({ username, password });
    await newUser.save();
    const token = createJwtToken(username)
    res.json({ message: 'User created successfully', token });
  }
});

app.post('/users/login', async (req, res) => {
  const { username, password } = req.headers;
  const user = await User.findOne({ username, password });
  if (user) {
    const token = createJwtToken(username)
    res.json({ message: 'Logged in successfully', token });
  } else {
    res.status(403).json({ message: 'Invalid username or password' });
  }
});



app.get('/users/courses',AuthJwt, async (req, res) => {
  const courses = await Course.find({published: true});
  res.json({ courses });
});

app.post('/users/courses/:courseId',AuthJwt, async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  console.log(course);
  if (course) {
    const user = await User.findOne({ username:req.user.username });
    if (user) {
      user.purchasedCourses.push(course);
      await user.save();
      res.json({ message: 'Course purchased successfully' });
    } else {
      res.status(403).json({ message: 'User not found' });
    }
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});

app.get('/users/purchasedCourses',AuthJwt, async (req, res) => {
  const user = await User.findOne({ username: req.user.username }).populate('purchasedCourses');
  if (user) {
    res.json({ purchasedCourses: user.purchasedCourses || [] });
  } else {
    res.status(403).json({ message: 'User not found' });
  }
});
app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
