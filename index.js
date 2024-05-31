const express = require('express');
const router = require('./router/router');
const fileUpload = require('express-fileupload');
const server = require('./database/productDataBase');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload());

// Serve static files
app.use('/profile/uploads', express.static(path.join(__dirname, 'profile/uploads')));

// Routes
app.use(router);

// Database connection
server().then(() => {
    console.log('Database successfully connected');
}).catch((error) => {
    console.log(error);
});

// Start the server
app.listen(4000, () => {
    console.log("Server is running on port 4000");
});
