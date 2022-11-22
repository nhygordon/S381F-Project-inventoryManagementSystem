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

const dbName = 'Library';

const express = require('express');
const app = express();
const session = require('cookie-session');

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const { Buffer } = require('safe-buffer');

var users = new Array(
	{name: "fl", password: "fl"},
    {name: "nhy", password: ""},
    {name: "ccy", password: "ccy"}
);
var DOC = {};
//Main Body
app.set('view engine', 'ejs');
//app.use(formidable());

//Middleware
app.use(bodyParser.json());
//Cookie
app.use(session({
    userid: "session",  
    keys: ['th1s!sA5ecretK3y'],
    //maxAge: 90 * 24 * 60 * 60 * 1000
}));

//functions
    //create new Library docs
const createDocument = (db, createDoc, callback) => {
    const client = new MongoClient(mongourl);
    client.connect((err) =>{
        assert.equal(null, err);
        console.log("Connected successfully to the DB server.");
        const db = client.db(dbName);

        db.collection('Library').insertOne(createDoc, (error, results)=>{
            if(error) throw error;
            console.log(results);
            callback();
        });
    });
}
    //find doc with criteria
const findDocument = (db, criteria, callback) => {
    let cursor = db.collection('Library').find(criteria);
    console.log(`findDocument: ${JSON.stringify(criteria)}`);
    cursor.toArray((err, docs)=>{
        assert.equal(err, null);
        console.log(`findDocument: ${docs.length}`);
        callback(docs);
    });
}
const deleteDocument = (db, criteria, callback) => {
    db.collection('Library').deleteOne(
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

        db.collection('Library').updateOne(criteria,
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
            res.status(200).render('home', {name: `${req.session.userid}`, num_book: docs.length, Library: docs});
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
            res.status(200).render('details', {Library: docs[0]});
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
        DOCID['creator'] = criteria.creator;
        deleteDocument(db, DOCID, (results)=>{
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('info', {message: "Book Data successfully deleted."});
        })     
    });
    client.close();
    res.status(200).render('info', {message: "Book Data successfully deleted."});
}
//handling requests
app.get('/', (req, res)=>{
    if(!req.session.authenticated){
        console.log("...Not authenticated; directing to login");
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

app.post('/login', (req, res)=>{
    console.log("...Handling your login request");
    users.forEach((user) => {
        if (user.name == req.body.username && user.password == req.body.password) {
        req.session.authenticated = true;
        req.session.userid = req.body.username;
        console.log(req.session.userid);
        res.status(200).redirect("/home");
        }
    });
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

app.get('/logout', (req, res)=>{
    req.session = null;
    req.authenticated = false;
    res.redirect('/');
});
//Home page
app.get('/home', (req, res)=>{
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
            res.status(200).render('home', {name: `${req.session.userid}`, num_book: docs.length, Library: docs});
        });
    });
    //res.status(200).render('home', {name: `${req.session.userid}`});
});
//details
app.get('/details', (req,res) => {
    handle_Details(res, req.query);
});

app.get("/map", (req, res) => {
    console.log("...returning the map leaflet.");
	res.status(200).render("map", {
		lat:`${req.query.lat}`,
		lon:`${req.query.lon}`,
		zoom:`${req.query.zoom ? req.query.zoom : 15}`
	});
});

app.get('/create', (req, res)=>{
    res.status(200).render("create");
});
app.post('/create', (req, res)=>{
    console.log("...create a new Book Data!");
    const client = new MongoClient(mongourl);
    client.connect((err)=>{
        assert.equal(null, err);
        console.log("Connected successfully to the DB server.");
        const db = client.db(dbName);
                
// Get a timestamp in seconds
var timestamp = Math.floor(new Date().getTime()/1000);
// Create a date with the timestamp
var timestampDate = new Date(timestamp*1000);

// Create a new ObjectID with a specific timestamp
var objectId = new ObjectID(timestamp);

	DOC["_id"] = objectId;

        DOC['name']= req.fields.name;
        DOC['Isbn']= req.fields.Isbn;
        DOC['quantity']= req.fields.quantity;
        console.log("...putting data into DOC");
        DOC['Publisher'] = req.fields.Publisher;
		DOC['Brief_Synopsis'] = req.fields.Brief_Synopsis;
        DOC['creator']= `${req.session.userid}`;
        
        if(DOC.name &&  DOC.creator){
            console.log("...Creating the Book Data");
            createDocument(db, DOC, (docs)=>{
                client.close();
                console.log("Closed DB connection");
                res.status(200).render('info', {message: "Book Data created successfully!"});
            });
        } else{
            client.close();
            console.log("Closed DB connection");
            res.status(200).render('info', {message: "Invalid entry - Name & creator is compulsory!"});
        }
    });
    client.close();
    console.log("Closed DB connection");
    res.status(200).render('info', {message: "Book Data created"}); 
});

app.get('/edit', (req, res)=>{
    console.log("...Enter update page");
    const client = new MongoClient(mongourl);
    client.connect((err) => {
        assert.equal(null, err);
        console.log("Connected successfully to server");
        const db = client.db(dbName);

        let DOCID = {};
        DOCID['_id'] = ObjectID(req.query._id);
        findDocument(db, DOCID, (docs) => {  
            client.close();
            console.log("Closed DB connection");
            console.log(docs[0]);
            res.status(200).render('edit', {Library: docs[0]});
        });
    });

}); 
app.post('/update', (req, res)=>{
    var updateDOC={};
    console.log("...handle Update");
    const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            console.log("...checking creator");
            
            if(req.fields.creator == req.session.userid){
                if(req.fields.name){
                updateDOC['name']= req.fields.name;
                updateDOC['Isbn']= req.fields.Isbn;
                updateDOC['quantity']= req.fields.quantity;
                updateDOC['Creator']= `${req.session.userid}`;
                updateDOC['Publisher'] = req.fields.Publisher;
		        updateDOC['Brief_Synopsis'] = req.fields.Brief_Synopsis;
                var DOCID = {};
                DOCID['_id'] = ObjectID(req.fields._id);
                updateDocument(DOCID, updateDOC, (docs) => {
                    client.close();
                    console.log("Closed DB connection");
                    res.status(200).render('info', {message: "Book Data updated successfully!."});
                    });
                
            }else{
                res.status(200).render('info', {message: "Invalid entry - Name is compulsory!"});}
              
    }else{
                res.status(200).render('info', {message: "Invalid creator - Only the creator can update the page!"});
            }
    });
    
});

app.get('/delete', (req, res)=>{
    if(req.session.userid == req.query.creator){
        console.log("...hello creator of the Book Data");
        handle_Delete(res, req.query);
    }else{
        res.status(200).render('info', {message: "Access denied - You don't have the access right!"}); 
    }
});

//Rest API
//name
app.get('/api/library/name/:name', function(req,res)  {
    console.log("...Rest Api");
	console.log("name: " + req.params.name);
    if (req.params.name) {
        let criteria = {};
        criteria['name'] = req.params.name;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            findDocument(db, criteria, (docs) => {
                client.close();
                console.log("Closed DB connection");
                res.status(200).json(docs);
            });
        });
    } else {
        res.status(500).json({"error": "missing name"});
    }
});
///Isbn
app.get('/api/library/Isbn/:Isbn', (req,res) => {
    console.log("...Rest Api");
	console.log("Isbn: " + req.params.Isbn);
    if (req.params.Isbn) {
        let criteria = {};
        criteria['Isbn'] = req.params.Isbn;
        const client = new MongoClient(mongourl);
        client.connect((err) => {
            assert.equal(null, err);
            console.log("Connected successfully to server");
            const db = client.db(dbName);

            db.collection('Library').deleteMany(criteria,(err,results) => {
                assert.equal(err,null)
                client.close()
                res.status(200).end();
            })
        });
    } else {
        res.status(500).json({"error": "missing bookingid"});       
    }
})

app.get('/*', (req, res)=>{
    res.status(404).render("info", {message: `${req.path} - Unknown request!`})
});

app.listen(process.env.PORT || 8099);
