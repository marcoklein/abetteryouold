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


/*** Handle client requests ***/

/* Client wants to submit the transmitted challenge. */
app.post("/submit", function(request, response) {
    console.log("Somebody made a post request: ");
    console.log("Body: " + JSON.stringify(request.body));
    console.log("Title: " + request.body.title);
    var challenge = request.body;
    challenge.status = STATUS_SUBMITTED;
    
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
        ChallengesModel.find(function(err, challenges) {
            if (err) return console.error(err);
            response.end(JSON.stringify({status: "success", challenges: challenges}));
        });
    } else {
        response.end(JSON.stringify({status: "error", msg: "no list option provided"}));
    }
});

/* Load a single challenge. */
app.post("/load", function(request, response) {
    // check message
    var id = request.body.challengeId;
    
    console.log("Load request for id " + id);
    
    
    // send the requested challenges
    response.writeHead(200, {"Content-Type": "text/json"});
    
    // TODO find challenge by id
    ChallengesModel.find(function(err, challenges) {
        if (err) return console.error(err);
        for (var i = 0; i < challenges.length; i++) {
            if (challenges[i]._id == id) {
                response.end(JSON.stringify({status: "success", challenge: challenges[i]}));
                return;
            }
        }
        response.end(JSON.stringify({status: "error", msg: "not a valid id"}));
    });
    
});

/*** MongoDB ***/

/* Status of a challenge may be
0 = not approved (submitted)
1 = approved */
var STATUS_SUBMITTED = 0;
var STATUS_APPROVED = 1;

/* DB Schemes and Models */

var challengesSchema = mongoose.Schema({
    title: String,
    description: String,
    duration: Number,
    tags: String,
    image: String,
    timestamp: Date,
    status: Number,
});

var ChallengesModel = mongoose.model("challenges", challengesSchema);

/* DB Connection */

mongoose.connect(config.dbUrl);
var db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function(callback) {
    // started
    initDb();
});


function initDb() {
    ChallengesModel.find(function(err, challenges) {
        if (err) return console.error(err);
        console.log(challenges);
    });
}

function dbAddChallenge(challenge, callback) {
    var testChallenge = new ChallengesModel(challenge);
    testChallenge.timestamp = new Date(); // set timestamp to now
    testChallenge.save(function(err, obj) {
        if (err) return console.error(err);
        console.log(obj.title + " was saved successfully with id " + obj._id);
        
        callback(obj._id);
    });
}
