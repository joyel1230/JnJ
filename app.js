const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
// const axios = require('axios');
const multer = require('multer')

const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const hbs = require('express-handlebars')
const app = express();
const fileUpload = require('express-fileupload')
const db = require('./config/connection')
const session = require('express-session')
require('dotenv').config()



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials/' }))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/image',express.static(path.join(__dirname, 'image')));
// app.use(fileUpload())
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'image');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const newFilename = `${timestamp}_${path.basename(file.originalname, ext)}.jpg`;
    cb(null, newFilename);
  }
});


app.use(multer({dest: 'image',storage: fileStorage}).array('image'))


app.use(session({ secret: process.env.SESSION_KEY, cookie: { maxAge: 6000000 } }))
app.use((req, res, next) => {
  res.header('Cache-Control', 'no-cache,private,no-Store,must-revalidate,max-scale=0,post-check=0,pre-check=0');
  next();
})
db.connect((err) => {
  if (err) console.log('connection error');
  else console.log('Database connected');
})
app.use('/admin', adminRouter);
app.use('/', userRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
  res.render('error')
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});





// // Set the interval (in milliseconds)
// const interval = 5000; // 5 seconds

// // Define the function to be called repeatedly
// function sendRequest() {
//   axios.get('http://localhost:3000/admin/users')
//     .then(response => {
//       // console.log(response.data);
//     })
//     .catch(error => {
//       // console.error(error);
//     });
// }

// // Call the function repeatedly at the defined interval
// setInterval(sendRequest, interval);

// module.exports = app;
app.listen(3000,()=>{
  console.log('started');
})
