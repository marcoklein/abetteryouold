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

var FADE_TIME = 400;
var PAGES = ["home-page", "browse-page", "submit-page", "about-page", "detail-challenge-module"];
var DEFAULT_PAGE = PAGES[0];
var INIT_PAGE = function (page) {
    switch (page) {
    case "home-page":
        initHomePage();
        break;
    case "browse-page":
        initBrowsePage();
        break;
    case "submit-page":
        initSubmitPage();
        break;
    case "about-page":
        initAboutPage();
        break;
    default:
    }
};

var MIN_TITLE_LENGTH = 4;
var MAX_TITLE_LENGTH = 50;
var MIN_DESCRIPTION_LENGTH = 50;
var MAX_DESCRIPTION_LENGTH = 1200;


/*** Global Variables ***/

/* Stores the id of the current page. */
var currentPage = null;

/* Holds all challenges which are already loaded into memory. */
var storedChallenges = {};



/*** Home Page ***/

function initHomePage() {
    updateMenu("#home-page-nav");
}


/*** Browse Page ***/

var browseContainer;
var challengeCount = 0;


function initBrowsePage() {
    updateMenu("#browse-page-nav");
    browseContainer = $("#browse-container");
    
    $("#detailed-challenge").hide();
    // TODO FIXME Loading is shown if no challenges are provided
    browseContainer.append("<div>Loading...</div>");
    
    requestChallenges(challengesRecieved);
}


/* Called as the client recieves the challenges.*/
function challengesRecieved(challenges) {
    console.log("Challenges recieved.");
    // clean all challenge items
    var browseContainerNode = document.getElementById("browse-container");
    while (browseContainerNode.firstChild) {
        browseContainerNode.removeChild(browseContainerNode.firstChild);
    }
    
    for (var i = 0; i < challenges.length; i++) {
        // store challenges for fast lookup
        storedChallenges[challenges[i]._id] = challenges[i];
    }
    
    applyChallenges(challenges);
}

/* Applies the given challenges to the browse screen.
They have the form
    - challenges [array]
        - id
        - title
        - description
        - duration [optional] (in days)
        - tags [array,optional]
            - tagname
        - image [optional]
*/
function applyChallenges(challenges) {
    // add challenges
    for (var i = 0; i < challenges.length; i++) {
        addChallenge(challenges[i]);
    }
}

/* Adds given challenge to the browse page. See applyChallenges for the format. */
function addChallenge(challenge) {
    var col = $("<div class='col-md-12'>");
    var content = $("<div>");
    col.append(content);
    //col.addClass("panel panel-default");
    col.addClass("challenge-box");
    //content.addClass("panel-body");
    //content.addClass("challenge-box");
    // content
    content.append($("<h2>").text(challenge.title));
    // TODO center challenge boxes
    //content.append($("<p>").text(challenge.description));
    // css
    col.css("margin", "4px");
    col.css("cursor", "pointer");
    //col.css("background-color", "#EEE");
    //content.css("text-align", "center");
    content.css("padding", "4px");
    content.css("width", "100%");
    content.css("height", "100%");
    
    col.attr("onclick", "hash(\"#id" + challenge._id + "\")");
    /*content.attr("data-toggle", "tooltip");
    content.attr("title", challenge.description);
    content.attr("data-placement", "bottom");*/
    content.append(challenge.description);
    content.tooltip();
    
    // add
    browseContainer.append(col);
    challengeCount++;
}

/* Called if you press enter while in the search text field. */
$("#search-box").keypress(function(e) {
    if (e.which == 13) {
        search($("#search-box").val());
    }
});

/* Called as the search button is pressed. */
function search(text) {
    console.log("Searching for \"" + text + "\"");
}


/*** Browse Detailed Challenge ***/

/* Shows the given challenge detailed. */
function initDetailedChallenge(challengeId) {
    changePageHash("detail-challenge-module", true, false);
    updateMenu("#browse-page-nav");
    // show detailed view
    showDetailedChallenge(challengeId);
    
}

function showDetailedChallenge(challengeId) {
    var challenge = storedChallenges[challengeId];
    if (!challenge) {
        console.log("Challenge not stored - loading challenge with id " + challengeId);
        // load challenge
        loadChallenge(challengeId, function(challenge) {
            if (challengeId != challenge._id) {
                // something went totally wrong
                throw console.error("Wrong challenge id.");
            }
            storedChallenges[challengeId] = challenge;
            showDetailedChallenge(challenge._id);
        });
        return; // wait for callback of load challenge
    }
    
    console.log("Showing challenge \"" + challenge.title + "\"");
    $("#detail-challenge-title").text(challenge.title);
    $("#detail-challenge-description").text(challenge.description);
}


/*** Submit Page ***/

function initSubmitPage() {
    updateMenu("#submit-page-nav");
    hideAlerts();
}

/* Submit button pressed */
function submit() {
    console.log("Submitting challenge...");
    hideAlerts();
    var valid = true;
    // check if all fields are filled correctly
    var title = $("#challenge-title").val();
    if (title.length < MIN_TITLE_LENGTH) {
        $("#title-too-short").fadeIn();
        valid = false;
    } else if (title.length > MAX_TITLE_LENGTH) {
        $("#title-too-long").fadeIn();
        valid = false;
    }
    var description = $("#challenge-description").val();
    if (description.length < MIN_DESCRIPTION_LENGTH) {
        $("#description-too-short").fadeIn();
        valid = false;
    } else if (description.length > MAX_DESCRIPTION_LENGTH) {
        $("#description-too-long").fadeIn();
        valid = false;
    }
    
    if (!valid) {
        return;
    }
    
    // send new challenge to server
    var challenge = {};
    challenge.title = title;
    challenge.description = description;
    // TODO set challenge tags image and duration
    challenge.duration = null;
    challenge.tags = null;
    challenge.image = null;
    sendNewChallenge(challenge);
}

/* update written characters for challenge title */
$("#challenge-title").on("input", function() {
    var length = $("#challenge-title").val().length;
    $("#challenge-title-characters").text(length);
    if (length > MIN_TITLE_LENGTH) {
        $("#title-too-short").fadeOut();
    }
});

/* update written characters for challenge description */
$("#challenge-description").on("input", function() {
    var length = $("#challenge-description").val().length;
    $("#challenge-description-characters").text(length);
    if (length > MIN_DESCRIPTION_LENGTH) {
        $("#description-too-short").fadeOut();
    }
});

$("#challenge-title").keypress(function(e) {
    if (e.which == 13) {
        $("#challenge-submit-button").click();
    }
});

$("#challenge-tags").keypress(function(e) {
    if (e.which == 13) {
        $("#challenge-submit-button").click();
    }
});


/*** About Page ***/

function initAboutPage() {
    updateMenu("#about-page-nav");
}



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

/* Handles hash changes of the url. You can get the hash by location.hash */
function locationHashChanged() {
    var hash = location.hash.substr(1); // cut away the hashtag
    console.log("Hash has changed to " + hash);
    // analyse new hash - is it a page?
    if (endsWith(hash, "page")) {
        if (!hasPage(hash)) {
            console.log("Not a valid page hash: " + hash);
            changePageFade(DEFAULT_PAGE);
            return;
        }
        // a valid page
        changePageFade(hash);
    } else if (/id([0-9])*/.test(hash)) {
        // challenge id
        console.log("Challenge id: " + hash);
        hash = hash.substr(2);
        initDetailedChallenge(hash);
    } else {
        // unknown hash - change page to default page
        console.log("Unknown hash: " + hash);
        changePageFade(DEFAULT_PAGE);
    }
}

/* Checks if the given page is a valid page. */
function hasPage(page) {
    for (var i = 0; i < PAGES.length; i++) {
        if (PAGES[i] == page) {
            return true;
        }
    }
    return false;
}

/* Hides all available pages. If you create a new one you have to add it here. */
function hideAllPages() {
    for (var i = 0; i < PAGES.length; i++) {
        $(toClass(PAGES[i])).hide();
    }
}

function changePageFade(newPage) {
    changePage(newPage, true);
}

/* Helper to execute fade out only once. (workaround)*/
var blocker = false;

function changePage(newPage, fade) {
    changePageHash(newPage, fade, true);
}

function changePageHash(newPage, fade, updateHash) {
    if (currentPage == newPage) {
        return; // no page change
    }
    if (fade === undefined) {
        fade = true; // default value
    }
    console.log("Changing pages from " + currentPage + " to " + newPage);
    if (currentPage === null) {
        currentPage = newPage;
        if (updateHash) hash(toHash(currentPage));
        hideAllPages();
        // only fade in new page if fade is true
        if (fade) {
            $(toClass(newPage)).fadeIn(FADE_TIME);
            INIT_PAGE(newPage);
        }
        else {
            $(toClass(newPage)).show();
            INIT_PAGE(newPage);
        }
    } else if (fade) {
        // fade out current page then fade in new page
        blocker = false;
        $(toClass(currentPage)).fadeOut(FADE_TIME, function() {
            if (blocker) {
                return;
            }
            blocker = true;
            hideAllPages();
            currentPage = newPage;
            if (updateHash) hash(toHash(currentPage)); // update hash
            $(toClass(currentPage)).fadeIn(FADE_TIME);
            INIT_PAGE(currentPage);
        });
    } else {
        // just change pages
        currentPage = newPage;
        if (updateHash) hash(toHash(currentPage));
        hideAllPages();
        $(toClass(newPage)).show();
        INIT_PAGE(newPage);
    }
}

function updateMenu(active) {
    $("#navbar>ul>li").removeClass("active");
    $(active).addClass("active");
    //if ($("#navbar").has("in")) {
    //    $(".navbar-toggle").click(); // hide navbar
    //}
        
}

function hideAlerts() {
    $(".alert-hidden").hide();
}

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

/* Hide all pages but the landing page. */
function initialize() {
    console.log("Initializing...");
    hideAllPages();
    // show the container which shows all pages
    // (it is hidden in the beginning to prevent overlapping of pages on start up)
    $(".start-hidden").show();
    
    // determine the page to be shown
    if (location.hash) {
        // locationHashChanged() will be called automatically by the system
        locationHashChanged(); // there is a hashtag in the url
        //changePage("home-page", false); // default page to show
    } else {
        changePage(DEFAULT_PAGE, false); // default page to show
    }
    
    // activate tooltips
    $('[data-toggle="tooltip"]').tooltip(); 
    
    // recieve hash changes
    window.onhashchange = locationHashChanged;

}

$(document).ready = initialize();
