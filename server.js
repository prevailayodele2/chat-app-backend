const mongoose = require("mongoose");
const dotenv= require("dotenv");
const express = require('express');
const morgan = require('morgan');
const routes = require('./routes/index');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet'); 
const mongosanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const cookieParser = require('cookie-parser'); 
const session = require('cookie-session');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');

dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (err) => {
  console.log(err);
  console.log("UNCAUGHT Exception! Shutting down ...");
  process.exit(1); // Exit Code 1 indicates that a container shut down, either because of an application failure.
});

const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'PATCH', 'POST', 'DELETE', 'PUT'],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10kb' })); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(
  session({
    secret: 'keyboard cat',
    proxy: true,
    resave: true,
    saveUnintialized: true,
    cookie: {
      secure: false,
    },
  })
);
app.use('/api', authRouter);
app.use('/api', userRouter);

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimit({
  max: 3000,
  windowMs: 60 * 60 * 1000, // In one hour
  message: 'Too many Requests from this IP, please try again in an hour!',
});

app.use('/tawk', limiter);
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(mongosanitize());
app.use(xss());
app.use(routes);

const http = require("http");
const server = http.createServer(app);

const DB = process.env.DATABASE.replace(
    "<PASSWORD>",
    process.env.DATABASE_PASSWORD
  );

  mongoose
    .connect(DB, {})
    .then((con) => {
      console.log("DB Connection successful");
    });

const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log(`App running on port ${port} ...`);
});

// process.on("unhandledRejection", (err) => {
//   console.log(err);
//   console.log("UNHANDLED REJECTION! Shutting down ...");
//   server.close(() => {
//     process.exit(1); //  Exit Code 1 indicates that a container shut down, either because of an application failure.
//   });
// });
