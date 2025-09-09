'use strict';


const express = require("express");
const authRoute = require('./routes/auth.route')
const userRoute = require('./routes/employee.route')
const leaveRoute = require('./routes/leave.route')
const policyRoute = require('./routes/policy.route')
const holidayRoute = require('./routes/holiday.route')

const dotenv = require('dotenv')
const cors = require('cors');
const { errorHandler } = require("./middleware/errorHandler");

require("./cron/AnnualScheduler")
require("./cron/MontlyScheduler")
require("./cron/QuarterlyScheduler")

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
app.use('/api/leave-requests', leaveRoute)
app.use('/api/policy', policyRoute)
app.use('/api/holiday', holidayRoute)


const PORT = process.env.SERVER_PORT || 3000
app.listen(PORT, () => {
    console.log(`Server running in PORT : ${PORT}`);
});