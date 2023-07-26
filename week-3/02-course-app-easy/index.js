const express = require('express');
const app = express();

app.use(express.json());

let ADMINS = [];
let USERS = [];
let COURSES = [];

// admin middleware
// it takes three parameters
const adminAuthentication = (req, res, next) => {
const {username,password} = req.headers;// as described in the read me
//verify
const admin = ADMINS.find((admin)=>admin.username === username && admin.password === password)
if(admin) {
  next();

}
else{
  res.status(403).json({message:"admin authentication failed"});

}
}

// user authentication middleware
const userAuthentication = (req,res,next) => {
  //find the user , if found then next if not then error 403
  const {username,password} = req.headers;
  const user = USERS.find((user) => user.username=== username && user.password === password) 
  if (!user) {
    return res.json({message: "User authentication failed"});

}
else
{
  req.user = user;// add the objexct ,accsess the authenticated user information.
  next();
}

 
}  


// Admin routes
app.post('/admin/signup', (req, res) => {
  // logic to sign up admin
 const admin = req.body;// requesting the admin from the body
 //confirming if the admin exist from the global ADMINS array.
 const existAdmin = ADMINS.find((ad)=>ad.username=== admin.username && ad.password === admin.password)// no need to check for the password it only checks fo the existance .
 if(existAdmin){
  res.status(403).json({message:"the admin already exist"})
  
 }
 else{
  //push the admin to the array
  ADMINS.push(admin);
  // returning a message
  res.status(200).json({message:"admin created successfully"})
 }
});

app.post('/admin/login',adminAuthentication, (req, res) => {
  // logic to log in admin
  // in the login we need to verify if the user so we need a middleware for this let say it is adminAuthentication. and pass the value to the header .
  res.json({message:"logged in successfully"});
});

app.post('/admin/courses', adminAuthentication,(req, res) => {

  let randomId =Math.floor(Math.random()*10000000);// u cannot do this in the destructuring assignment , it is complex and thus give an error in the vs code ;
  // logic to create a course
  // first need to check if it is admin nor not so we have to pass it through the middleware.
  const {title,description,price,imageLink,published} = req.body;
  // now push the thing inside the courses array.
  const course ={title,description,price,imageLink,published,courseId:randomId,

  }
  COURSES.push(course);
  return res.json({message: "course created successfully",courseId: course.courseId});

});

app.put('/admin/courses/:courseId',adminAuthentication, (req, res) => {
  // logic to edit a course
  //same logic before updating the course it must authenticate the admin,therefore pass it throught the middleware.
  //logic if you find the course by the courseId then 
const course = COURSES.find((course)=>course.id ===parseInt(req.params.courseId));// getting the individual array element
//now its time to update 
if (course){
  Object.assign(course,req.body);
   return res.json({message: 'Course updated successfully'});
}
else  {
  res.json({message: 'Course not updated'});
}



});

app.get('/admin/courses',adminAuthentication, (req, res) => {
  // logic to get all courses
  res.json({courses:COURSES})
});

// User routes
app.post('/users/signup', (req, res) => {
  // logic to sign up user
  //it deals with the individual users and note the array of the gloval USERS is not involved 
  const user = {...req.body, purchasedCourses: []};//cloning everyting in the user ;and also including the  new array;
  USERS.push(user);
  // it then push the user objectn which includes an array of purchased array to the global USERS.

  res.json({ message: 'User created successfully'})
});

app.post('/users/login',userAuthentication, (req, res) => {
  // logic to log in user
  res.json({ message: 'User logged in successfully' });
});

app.get('/users/courses',userAuthentication, (req, res) => {
  // logic to list all courses
  //use the array.prototype.filter  and pass the call back what do want to filter 
  //const filteredCourse = []; no need for this
  filteredCourse = COURSES.filter( c=>c.published);// there i no need to push it does the task automatically.
  res.json({ courses: filteredCourse});
});

app.post('/users/courses/:courseId',userAuthentication, (req, res) => {
  // logic to purchase a course
  const courseId = Number(req.params.courseId);
  const course = COURSES.find(c => c.id === courseId && c.published);
  // IF FOUND THE COURSE THEN PUSH THE COURSE ID INTO THEPURSHED ARRAY OF THE USER 
  if (course) {
    req.user.purchasedCourses.push(courseId);
    res.json({ message: 'Course purchased successfully' });
  } else {
    res.status(404).json({ message: 'Course not found or not available' });
  }
});




app.get('/users/purchasedCourses',userAuthentication,(req, res) => {
  // logic to view purchased courses
  const purchasedCourses = COURSES.filter(c => req.user.purchasedCourses.includes(c.id));
  res.json({ purchasedCourses });
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});

