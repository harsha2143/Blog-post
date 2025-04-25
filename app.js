require('dotenv').config();

const express = require('express');
const expresslayout=require('express-ejs-layouts');
const methodOverride=require('method-override');
const CookieParser=require('cookie-parser');
const mongoStore=require('connect-mongo');
const session=require('express-session');


const connectDB=require('./server/config/db');
const { Session } = require('express-session');

const app = express();
const port = process.env.PORT || 3000;

//connect to DB
connectDB();

app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(CookieParser());
app.use(session({
    secret: 'Keyboard cat',
    resave: false,
    saveUninitialized: false,
    store: mongoStore.create({mongoUrl: process.env.MONGODB_URI}),
    // cookie: {maxAge: 1000 * 60 * 60 * 24}
}));


app.use(express.static('public'));

//templete engine
app.use(expresslayout);
app.set('layout','./layouts/main');
app.set('view engine','ejs');

app.use('/',require('./server/routes/main'))
app.use('/',require('./server/routes/admin'))


app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
})