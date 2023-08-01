# medium level

## what is the difference between the readfile and the readfile sync ?

here , i dont think that the read file sync is a good option it , is not async .
27

readFileSync() is synchronous and blocks execution until finished. These return their results as return values. readFile() are asynchronous and return immediately while they function in the background. You pass a callback function which gets called when they finish. let's take an example for non-blocking.

following method read a file as a non-blocking way

```js
var fs = require('fs');
fs.readFile(filename, "utf8", function(err, data) {
        if (err) throw err;
        console.log(data);
});
following is read a file as blocking or synchronous way.

var data = fs.readFileSync(filename);
```

LOL...If you don't want readFileSync() as blocking way then take reference from the following code. (Native)

```js
var fs = require('fs');
function readFileAsSync(){
    new Promise((resolve, reject)=>{
        fs.readFile(filename, "utf8", function(err, data) {
                if (err) throw err;
                resolve(data);
        });
    });
}

async function callRead(){
    let data = await readFileAsSync();
    console.log(data);
}

callRead();
```

it's mean behind scenes readFileSync() work same as above(promise) base.
on the given context there is another way to read a file using the async and await

```js
const fs = require('fs').promises;

async function readFiles() {
  try {
    ADMINS = JSON.parse(await fs.readFile('admins.json', 'utf8'));
    USERS = JSON.parse(await fs.readFile('users.json', 'utf8'));
    COURSES = JSON.parse(await fs.readFile('courses.json', 'utf8'));
  } catch {
    ADMINS = [];
    USERS = [];
    COURSES = [];
  }

  console.log(ADMINS);
  console.log(USERS);
  console.log(COURSES);
}

readFiles();

```
