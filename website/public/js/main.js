/* Handles all pages. */

/* The class "hidden" is used for elements which are hidden if a page changes. */

/* Challenge format:
    - id
    - title
    - description
    - duration [optional] (in days)
    - tags [array,optional]
        - tagname
    - image [optional]
*/

/*** Constants ***/
var SERVER_URL = "http://localhost:8080";
//var SERVER_URL = "http://87.106.14.30:8080";


var MIN_TITLE_LENGTH = 4;
var MAX_TITLE_LENGTH = 40;
var MIN_DESCRIPTION_LENGTH = 50;
var MAX_DESCRIPTION_LENGTH = 1200;
var MAX_TAGS = 20;
var MAX_TAG_LENGTH = 20;


/*** Global Variables ***/

/* Stores the id of the current page. */
var currentPage = null;

/* Holds all challenges which are already loaded into memory. */
var storedChallenges = {};


/*** Main Control ***/

// TODO write a function to scroll the menu with th page but show it if the user scrolls up
// (see http://jsfiddle.net/T6nZe/)

/*$(function() {
    var win = $(window);
    var filter = $(".navbar");
    var upScrollTop = null;
    var lastTopScroll = 0;
    
    win.scroll(function(data, second) {
        console.log("Windows scrolled: " + win.scrollTop());
        if (win.scrollTop() > lastTopScroll) {
            // user scrolled down - nothing happens
            lastTopScroll = win.scrollTop();
        } else {
            console.log("We scrolled up!");
            if (upScrollTop == null) {
                // first time we scroll up
                console.log("First time scrolling up!");
                upScrollTop = lastTopScroll;
            }
        }
    });
});*/


/*** Network ***/

/* Sends the given challenge to the server to add it. */
function sendNewChallenge(challenge) {
    // send challenge
    var data = JSON.stringify(challenge);
    
    $.ajax({
        url: SERVER_URL + "/submit",
        type: "POST",
        contentType: "application/json",
        data: data,
        success: function(response) {
            console.log("Ajax was successfull " + JSON.stringify(response));
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("Error " + textStatus + " " + errorThrown);
        }
    });
}

/* Requests the challenge with the given id and calls the callback method with the challange as parameter and stores it.*/
function loadChallenge(challengeId, callback) {
    console.log("Loading challenge with id: " + challengeId);
    
    var data = {
        challengeId: challengeId
    };
    ajaxRequest(SERVER_URL + "/load", data, function(response) {
        if (response.status == "success") {
            callback(response.challenge); // extract challenge
        } else {
            console.log("Invalid id - changing screen");
            changePageFade(DEFAULT_PAGE);
        }
    });
    
}

function ajaxRequest(url, data, successCallback) {
    $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function(response) {
            console.log("Ajax response: " + JSON.stringify(response));
            successCallback(response);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("Error " + textStatus + " " + errorThrown);
        }
    });
}

/* Requests challenges from the server. */
function requestChallenges(callback) {
    console.log("Requesting challenges.");
    // as test
    
    var data = {list: "all"};
    
    $.ajax({
        url: SERVER_URL + "/list",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function(response) {
            console.log("Ajax was successfull " + JSON.stringify(response));
            callback(response.challenges);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log("Error " + textStatus + " " + errorThrown);
        }
    });
}


/*** Helper ***/

/* Helper method to change the hash of the url (ie. used in buttons to change page) */
function hash(h) {
    // only change if necessary
    if (h == location.hash) {
        return;
    }
    location.hash = h;
}

function toClass(e) {
    return "." + e;
}

function toHash(e) {
    return "#" + e;
}

/* Helper to test if the given string has the given ending. */
function endsWith(string, ending) {
    if (!ending || !string) {
        return false;
    }
    for (var i = 0; i < ending.length; i++) {
        if (i >= string.length) {
            return false;
        }
        if (string.charAt(string.length - i) != ending.charAt(ending.length - i)) {
            return false;
        }
    }
    return true;
}


/*** Init ***/

function initialize() {
    console.log("Initializing...");
    // show the container which shows all pages
    // (it is hidden in the beginning to prevent overlapping of pages on start up)
    $(".start-hidden").show();
    
    // TODO check hash
    if (location.hash) {
    } else {
        // start at top
    }
    
    // activate tooltips
    $('[data-toggle="tooltip"]').tooltip();

}

$(document).ready = initialize();
