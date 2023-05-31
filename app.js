const express = require('express');
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const { isArray } = require("util");
const fileUpload = require('express-fileupload');
const cors = require('cors');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// app.use(cors({
//     origin: ['http://rays.snmih.in']
// }));

app.use(cors({
    origin: '*'
}));


//const testRoute = require('./routes/testRoute');
const authRoute = require('./routes/auth');
const doctorsRoute = require('./routes/doctors');
const personRoute = require('./routes/personRoute');


app.use(authRoute);
app.use(doctorsRoute);
app.use(personRoute);


app.listen(process.env.PORT || 3333, () => {
    console.clear();
    console.log("Application listening on port 3333!");
});


