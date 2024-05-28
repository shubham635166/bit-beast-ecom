const express = require('express');
const router = require('./router/router');
const server = require('./database/productDataBase');
const path = require('path')
const cookieParser = require('cookie-parser');
const app = express()
const bodyParser = require('body-parser');
const cors = require('cors')
app.use(bodyParser.urlencoded({extended:false}));
app.use(cors())
app.use(express.json())
app.use(router)
app.use(cookieParser());
server().then(()=>{
    console.log('Database successfully connected ');
}).catch((error)=>{
    console.log(error);
})
app.use('/profile' , express.static(path.join(__dirname , 'upload')))
app.listen(4000,()=>{
    console.log("Server Is On");
})