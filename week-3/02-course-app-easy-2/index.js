// refer the notes 

const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

const secretKey = "superS3cr3t1"; 
const createJwtToken = (user)=> {
  const payload ={username:user.username,}
  return jwt.sign(payload,secretKey,{expiresIn:'1 hr'})
}
const AuthJwt =(req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    jwt.verify(token, secretKey, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};



// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
  const admin = req.body;//do not use the  use the const {username,password}= req.body here because in the future you have to push the whole object inside an array;
  // check if there is a exist user
  const existingAdmin = ADMINS.find(ad=>ad.username ===admin.username && ad.password === admin.password);
  if (existingAdmin){
    res.status(403).json({message:"admin already exists"});

  }
  else {
    //push the created admin to the ADMINS array
    ADMINS.push(admin);
    // now along with this create a token that will be passed with the admin 
    const token =createJwtToken(admin);
    //now pass the response along with the token
    res.status(200).json({message:"successfully admin created",token});

  }
});

app.post('/admin/login', (req, res) => {
  // logic to log in admin
  // in the log in there is no need for the middheware,i mean user username ar password ii dilo na to dhanta middleware kaj korbe ,, boroncho run korbe na ai jonno.
  const {username,password} = req.headers;
  const admin = ADMINS.find((a)=>a.username === username && a.password=== password);
  if(admin) {
    // if verified generate the token and pass the token along with the msg to the backend 
    const token = createJwtToken(admin);
    res.status(200).json({message:"logged in successfully",token});

  }
  else{
    res.status(403).json({message:"admin varification failed"});
  }
});

app.post('/admin/courses', AuthJwt, (req, res) => {
  // logic to create a course
  const course = req.body;
  course.id = COURSES.length + 1; 
  COURSES.push(course);
  res.json({ message: 'Course created successfully', courseId: course.id });
});


app.put('/admin/courses/:courseId', AuthJwt,(req, res) => {
  // logic to edit a course
  const courseId= Number(req.params.courseId);
  let foundCourse = COURSES.find(c=>c.id === courseId);
  // if(foundCourse){
  //   const updtaedCourse = {...foundCourse,...req.body} ;
  //   foundCourse = updtaedCourse ;
  // } 
  // when it is found it is not nested so the spread operator does the deep cpy
  // spread operator working depends; FOR NESTED IT SHALLOWCOPIES AND FOR THE NOT NESTED IT DEEPCOPIES.
  if(foundCourse){
  Object.assign(foundCourse,...req.body);
    res.json({message:"course updated"})
}
else {
  res.status(404).json({ message: 'Course not found' });
}
});

app.get('/admin/courses',AuthJwt, (req, res) => {
  // logic to get all courses
  res.json({courses:COURSES});
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  // logic to sign up user
  const user = req.body;//do not use the  use the const {username,password}= req.body here because in the future you have to push the whole object inside an array;
  // check if there is a exist user
  const existinguser = USERS.find(ad.username ===user.username && ad.password === user.password);
  if (existinguser){
    res.status(403).json({message:"admin already exists"});

  }
  else {
    //push the created admin to the ADMINS array
    USERS.push(user);
    // now along with this create a token that will be passed with the admin 
    const token =createJwtToken(user);
    //now pass the response along with the token
    res.status(200).json({message:"successfully user created",token});

  }
});

app.post('/users/login', (req, res) => {
  // logic to log in user
  const { username, password } = req.headers;
  const user = USERS.find(u => u.username === username && u.password === password);
  if (user) {
    const token = createJwtToken(user);
    res.json({ message: 'Logged in successfully', token });
  } else {
    res.status(403).json({ message: 'User authentication failed' });
  }
});

app.get('/users/courses',AuthJwt, (req, res) => {
  // logic to list all courses
  res.json({ courses: COURSES });
});

app.post('/users/courses/:courseId',AuthJwt, (req, res) => {
  // logic to purchase a course
  const courseId = parseInt(req.params.courseId);
  const course = COURSES.find(c => c.id === courseId);
  if (course) {
    const user = USERS.find(u => u.username === req.user.username);
    if (user) {
      if (!user.purchasedCourses) {
        user.purchasedCourses = [];
      }
      user.purchasedCourses.push(course);
      res.json({ message: 'Course purchased successfully' });
    } else {
      res.status(403).json({ message: 'User not found' });
    }
  } else {
    res.status(404).json({ message: 'Course not found' });
  }
});

app.get('/users/purchasedCourses',AuthJwt, (req, res) => {
  // logic to view purchased courses
  const user = USERS.find(u => u.username === req.user.username);
  if (user && user.purchasedCourses) {
    res.json({ purchasedCourses: user.purchasedCourses });
  } else {
    res.status(404).json({ message: 'No courses purchased' });
  }
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
