'use strict';


const express = require("express");
const authRoute = require('./routes/auth.route')
const userRoute = require('./routes/employee.route')

const dotenv = require('dotenv')
const cors = require('cors');
const { errorHandler } = require("./middleware/errorHandler");

dotenv.config();
const app = express()



app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));



// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


//Error Handling
app.use(errorHandler);



// Routes
app.use('/api/auth', authRoute)
app.use('/api/user', userRoute)




const PORT = process.env.SERVER_PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running in PORT : ${PORT}`);

});