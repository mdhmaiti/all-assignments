const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
//const path = require('path');
const app = express();

app.use(express.json());

let ADMINS, USERS, COURSES;

// Read data from file, or initialize to empty array if file does not exist
try {
  ADMINS = JSON.parse(fs.readFileSync('admins.json', 'utf8'));
  USERS = JSON.parse(fs.readFileSync('users.json', 'utf8'));
  COURSES = JSON.parse(fs.readFileSync('courses.json', 'utf8'));
} catch {
  ADMINS = [];
  USERS = [];
  COURSES = [];
}
console.log(ADMINS);

const SECRET = 'my-secret-key';

// creating a common function which generate the token for both the admin and the user
const createJwtToken = (user)=> {
  const payload ={username:user.username,}
  return jwt.sign(payload,secretKey,{expiresIn:'1 hr'})
}

const AuthJwt = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET, (err, user) => {
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

app.post('/admin/signup', (req, res) => {
 
  const admin = req.body;
  const existingAdmin = ADMINS.find(ad=>ad.username ===admin.username && ad.password === admin.password);
  if (existingAdmin){
    res.status(403).json({message:"admin already exists"});

  }
  else {
    
    ADMINS.push(admin);
    fs.writeFileSync('admins.json', JSON.stringify(ADMINS));
     
    const token =createJwtToken(admin);
    
    res.status(200).json({message:"successfully admin created",token});

  }
});

app.post('/admin/login', (req, res) => {
 
  const {username,password} = req.headers;
  const admin = ADMINS.find((a)=>a.username === username && a.password=== password);
  if(admin) {
   
    const token = createJwtToken(admin);
    res.status(200).json({message:"logged in successfully",token});

  }
  else{
    res.status(403).json({message:"admin varification failed"});
  }
});

app.post('/admin/courses', AuthJwt, (req, res) => {
  
  const course = req.body;
  course.id = COURSES.length + 1; 
  COURSES.push(course);
  fs.writeFileSync('courses.json', JSON.stringify(COURSES));
  res.json({ message: 'Course created successfully', courseId: course.id });
});


app.put('/admin/courses/:courseId', AuthJwt,(req, res) => {
 
  const courseId= Number(req.params.courseId);
  let foundCourse = COURSES.find(c=>c.id === courseId);
  
  if(foundCourse){
  Object.assign(foundCourse,...req.body);
  fs.writeFileSync('courses.json', JSON.stringify(COURSES));
    res.json({message:"course updated"})
}
else {
  res.status(404).json({ message: 'Course not found' });
}
});

app.get('/admin/courses',AuthJwt, (req, res) => {
 
  res.json({courses:COURSES});
});

// User routes
app.post('/users/signup', (req, res) => {
  
  const user = req.body;
  const existinguser = USERS.find(ad.username ===user.username && ad.password === user.password);
  if (existinguser){
    res.status(403).json({message:"admin already exists"});

  }
  else {
    
    USERS.push(user);
    fs.writeFileSync('users.json', JSON.stringify(USERS));
    const token =createJwtToken(user);
    
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
      fs.writeFileSync('users.json', JSON.stringify(USERS));
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
