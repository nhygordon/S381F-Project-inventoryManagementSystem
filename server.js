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

const { Buffer } = require('safe-buffer');

var users = new Array(
	{name: "nhy", password: "nhy"},
    {name: "fl", password: "fl"},
    {name: "ccy", password: "ccy"}
);
var DOC = {};
//Main Body
app.set('view engine', 'ejs');
app.use(formidable());

//Middleware
//Cookie
app.use(session({
    userid: "session",  
    keys: ['th1s!sA5ecretK3y'],
}));

//functions
    //create new inventory docs
const createDocument = (db, createDoc, callback) => {
    const client = new MongoClient(mongourl);
    client.connect((err) =>{
        assert.equal(null, err);
        console.log("Connected successfully to the DB server.");
        const db = client.db(dbName);

        db.collection('inventory').insertOne(createDoc, (error, results)=>{
            if(error) throw error;
            console.log(results);
            callback();
        });
    });
}
    //find doc with criteria
const findDocument = (db, criteria, callback) => {
    let cursor = db.collection('inventory').find(criteria);
    console.log(`findDocument: ${JSON.stringify(criteria)}`);
    cursor.toArray((err, docs)=>{
        assert.equal(err, null);
        console.log(`findDocument: ${docs.length}`);
        callback(docs);
    });
}
const deleteDocument = (db, criteria, callback) => {
    db.collection('inventory').deleteOne(
       criteria, 
       (err, results) => {
          assert.equal(err, null);
          console.log(results);
          callback();
       }
    );
};
const updateDocument = (criteria, updateDoc, callback) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        db.collection('inventory').updateOne(criteria,
            {
                $set : updateDoc
            },
            (err, results) => {
                client.close();
                assert.equal(err, null);
                callback(results);
            }
        );
    });
}

const handle_Find = (req, res, criteria) =>{
    const client = new MongoClient(mongourl);
    client.connect((err)=>{
        assert.equal(null, err);
        console.log("Connected successfully to the DB server.");
        const db = client.db(dbName);
        //callback()
        findDocument(db, {}, (docs)=>{
            client.close();
            console.log("Closed DB connection.");
            res.status(200).render('home', {name: `${req.session.userid}`, ninventory: docs.length, inventory: docs});
        });
    });
}

const handle_Details = (res, criteria) => {
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to DB server");
        const db = client.db(dbName);

        let DOCID = {};
        DOCID['_id'] = ObjectID(criteria._id);
        findDocument(db, DOCID, (docs) => {  
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('details', {inventory: docs[0]});
        });
    });
}

const handle_Delete = (res, criteria) =>{
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        let DOCID = {};
        DOCID['_id'] = ObjectID(criteria._id);
        DOCID['owner'] = criteria.owner;
        deleteDocument(db, DOCID, (results)=>{
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('info', {message: "Document successfully deleted."});
        })     
    });
    client.close();
    res.status(200).render('info', {message: "Document successfully deleted."});
}

//handling requests
app.get('/', (req, res)=>{
    if(!req.session.authenticated){
        res.redirect("/login");
    }
    console.log("...Hello, welcome back");
    handle_Find(req, res, {});
});
//login
app.get('/login', (req, res)=>{
    console.log("...Welcome to login page");
    res.sendFile(__dirname + '/public/login.html');
    res.status(200).render("login");
});
app.post('/login', function(req, res) {
    console.log("...Handling your login request");
    for (var i=0; i<users.length; i++) {
		if (users[i].name == req.fields.name &&
            users[i].password == req.fields.password) {
        req.session.authenticated = true;
        req.session.userid = users[i].username;
        console.log(req.session.userid);
        res.status(200).redirect("/home");
        }
    }
    res.redirect("/");
});
app.use((req, res, next) => {
    console.log("...Checking login status");
    if (req.session.authenticated){
      next();
    } else {
      res.redirect("/login");
    }
});

app.get('/logout', function(req, res){
    req.session = null;
    req.authenticated = false;
    res.redirect('/');
});
//Home page
app.get('/home', (req, res) => {
    console.log("...Welcome to the home page!")
    const client = new MongoClient(mongourl);
    client.connect((err)=>{
        assert.equal(null, err);
        console.log("Connected successfully to the DB server.");
        const db = client.db(dbName);
        //callback()
        findDocument(db, {}, (docs)=>{
            client.close();
            console.log("Closed DB connection.");
            res.status(200).render('home', {name: `${req.session.userid}`, ninventory: docs.length, inventory: docs});
        });
    });
    //res.status(200).render('home', {name: `${req.session.userid}`});
});

//not found
app.get('/*', (req, res)=>{
    res.status(404).render("info", {message: `${req.path} - Unknown request!`})
});

app.listen(process.env.PORT || 8099);