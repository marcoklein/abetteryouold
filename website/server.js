/*** Imports and global variables ***/
var http = require("http");
var fs = require("fs");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var config = require("./config.json");
var mongoose = require("mongoose");

require("./cycle.js");


/*** Webserver ***/

var server = http.createServer(app);
// start server
server.listen(config.port, function() {
    console.log("Server listening on: http://localhost:%s", config.port);
});

/* Deliver static files. */
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

/* If "/" is called deliver index.html */
app.get("/", function(request, response) {
    // deliver index.html
    console.log("Index requested.");
    response.sendFile(__dirname + "/public/index.html");
});

app.post("/submit", function(request, response) {
    console.log("Somebody made a post request: ");
    console.log("Body: " + JSON.stringify(request.body));
    console.log("Title: " + request.body.title);
    var challenge = request.body;
    
    // TODO check if challenge contains valid values
    
    // add challenge to db
    dbAddChallenge(challenge, function(newId) {
        // respond with success
        response.writeHead(200, {"Content-Type": "text/json"});
        response.end(JSON.stringify({status: "success", id: newId}));
    });
    
});

app.post("/list", function(request, response) {
    console.log("List request.");
    // check message
    var list = request.body.list;
    var challenges = null;
    
    
    // send the requested challenges
    response.writeHead(200, {"Content-Type": "text/json"});
    
    if (list == "all") {
        ChallengeModel.find(function(err, challenges) {
            if (err) return console.error(err);
            response.end(JSON.stringify({status: "success", challenges: challenges}));
        });
    } else {
        response.end(JSON.stringify({status: "error", msg: "no list option provided"}));
    }
});

/*** MongoDB ***/


/* DB Schemes and Models */

var challengeSchema = mongoose.Schema({
    title: String,
    description: String,
    duration: Number,
    tags: String,
    image: String,
    time: Date,
});

var ChallengeModel = mongoose.model("challenge", challengeSchema);

/* DB Connection */

mongoose.connect(config.dbUrl);
var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function(callback) {
    // started
    initDb();
});


function initDb() {
    ChallengeModel.find(function(err, challenges) {
        if (err) return console.error(err);
        console.log(challenges);
    });
}

function dbAddChallenge(challenge, callback) {
    var testChallenge = new ChallengeModel(challenge);
    testChallenge.save(function(err, obj) {
        if (err) return console.error(err);
        console.log(obj.title + " was saved successfully with id " + obj._id);
        
        callback(obj._id);
    });
}
