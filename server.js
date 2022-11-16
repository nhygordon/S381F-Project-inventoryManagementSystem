//HTML 
const html = require('html');
const url = require('url');
const assert = require('assert');
//File
const fs = require('fs'); 
const formidable = require('express-formidable');
//MongoDB
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const mongourl = 'mongodb+srv://Fl:123456abcd!@cluster0.e7oruyd.mongodb.net/?retryWrites=true&w=majority'; 
const dbName = 'test';

const express = require('express');
const app = express();
const session = require('cookie-session');

const bodyParser = require('body-parser');

const { Buffer } = require('safe-buffer');

var users = new Array(
	{name: "natasha", password: "itsNat"},
    {name: "demo", password: ""},
    {name: "student", password: ""}
);
var DOC = {};
//Main Body
app.set('view engine', 'ejs');
app.use(formidable());

//Middleware
app.use(bodyParser.json());
//Cookie
app.use(session({
    userid: "session",  
    keys: ['th1s!sA5ecretK3y'],
    //maxAge: 90 * 24 * 60 * 60 * 1000
}));