const express = require('express');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const bodyParser = require('body-parser');
const { isArray } = require("util");
const fileUpload = require('express-fileupload');
const cors = require('cors');
require('dotenv').config();

const sql = require('mssql');
const dbConfig = require('./controller/config');
const Excel = require('exceljs');
const path = require('path');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use(cors({
//     origin: ['http://rays.snmih.in']
// }));

app.use(cors({
    origin: '*'
}));

const authRoute = require('./routes/auth');
const doctorsRoute = require('./routes/doctors');
const adminRoute = require('./routes/admin');
const adminRoute1 = require('./routes/admin1');
const personRoute = require('./routes/personRoute');

app.use(authRoute);
app.use(doctorsRoute);
app.use(adminRoute);
app.use(adminRoute1);
app.use(personRoute);


app.listen(process.env.PORT || 3333, () => {
    console.clear();
    console.log("Application listening on port 3333!")
});


// need to install
// npm install node - cron--save
// npm install xlsx
// npm install exceljs

