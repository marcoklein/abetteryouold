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

var HTML_PAGE_DIRECTORY = "./html/";
var DEFAULT_PAGE = "home";


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

function updateMenu(active) {
    $("#navbar>ul>li").removeClass("active");
    $(active).addClass("active");
    // hide navbar if it is visible
    if ($("#navbar").hasClass("in")) {
        $(".navbar-toggle:visible").click();
    }
}

/* Manages challenge storage. */
var Storage = {
    challenges: [],
    challengesById: {}, // loaded challenges
    requestChallenge: function (challengeId, callback) {
        var challenge = this.challengesById[challengeId]; // challenge already loaded?
        if (this.challenges[challengeId]) {
            // already loaded
            callback(challenge);
        } else {
            // to load
            loadChallenge(challengeId, function (loadedChallenge) {
                // store loaded challenge
                Storage.storeLoadedChallenge(loadedChallenge);
                callback(loadedChallenge);
            });
        }
    },
    requestAllChallenges: function (callback) {
        var obj = this;
        requestChallenges(function (challenges) {
            var i;
            for (i = 0; i < challenges.length; i++) {
                obj.storeLoadedChallenge(challenges[i]);
            }
            callback(challenges);
        });
    },
    requestListChallenges: function (listOption, callback) {
        console.log("Requesting list challenges.");

        var data = {
            list: listOption
        };

        $.ajax({
            url: SERVER_URL + "/list",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function (response) {
                console.log("Ajax was successfull " + JSON.stringify(response));
                callback(response.challenges);
            },
            error: function (jqXHR, textStatus, errorThrown) {
                console.log("Error " + textStatus + " " + errorThrown);
            }
        });
    },
    /** Adds given challenge to the challenges array. */
    storeLoadedChallenge: function (challengeToAdd) {
        // TODO sort challenges array ?
        this.challenges[this.challenges.length] = challengeToAdd;
        this.challengesById[challengeToAdd._id] = challengeToAdd;
    }
};


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
        success: function (response) {
            console.log("Ajax was successfull " + JSON.stringify(response));
        },
        error: function (jqXHR, textStatus, errorThrown) {
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
    ajaxRequest(SERVER_URL + "/load", data, function (response) {
        if (response.status == "success") {
            callback(response.challenge); // extract challenge
        } else {
            console.log("Invalid id - changing screen");
            changePage(DEFAULT_PAGE);
        }
    });
    
}

function ajaxRequest(url, data, successCallback) {
    $.ajax({
        url: url,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function (response) {
            console.log("Ajax response: " + JSON.stringify(response));
            successCallback(response);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log("Error " + textStatus + " " + errorThrown);
        }
    });
}

/* Requests all challenges from the server. The callback will get all challenges as an array. */
function requestChallenges(callback) {
    Storage.requestListChallenges("all", callback);
}


/*** Helper ***/

/* Helper method to change the hash of the url (ie. used in buttons to change page) */
function hash(h) {
    // only change if necessary
    if (h === location.hash) {
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

/*** Ajax (dynamic page changing) ***/
/* It is assumed that all html content is in the HTML_PAGE_DIRECTORY */

/* Loads the page which is defined by the page url property. */
function loadAjaxPage() {
    var page = getPageURLParameter();
    if (!page) {
        // no page available - load default page
        page = DEFAULT_PAGE;
    }
    // apply page
    loadPage(page);
}

/* Loads the given page */
function loadPage(page) {
    console.log("Loading page " + page);
    var hashUrl = page.split("#");
    var pageUrl = HTML_PAGE_DIRECTORY + hashUrl[0] + ".html"; // construct page url

    
    var newUrl = updatePageURLParameter(page);
    /*if (url.length === 2) {
        //newUrl += url[1]; // append hash
        location.hash = url[1]; // set hash
    } else {
        location.hash = "";
    }*/
    
    
    //to change the browser URL to the given link location
    if (newUrl != window.location){
        window.history.pushState({path:newUrl},'',newUrl);
    }
    
    
    $("#main-content").load(pageUrl, function (response, status, xhr) {
        $("#loading").hide();
        if (status == "success") {
            console.log("Page content loaded for " + pageUrl);
            applyLinkAction("#main-content");
        } else {
            console.error("Page loading error.");
            $("#main-content").load("./html/error.html");
        }
    });
    
}

// TODO only make elements with a[rel="tab"] clickable
/* Redefines the action for all link elements (<a>) so they will change the ajax page respectively. */
function applyLinkAction(rootElement) {
    console.log("Redefining links for element " + rootElement);
    $(rootElement + " a[rel='content']").click(linkContentAction);
}

function linkContentAction() {
    console.log("Calling link action for " + this);
    var pageUrl = $(this).attr("href");
    console.log("Clicked on " + pageUrl);

    try {
        loadPage(pageUrl);
    } catch (ex) {
        // TODO show ERROR page
        console.error("Error loading page");
    }
    //linkContentAction();
    return false;
}

/* Override backbutton */
$(window).bind('popstate', function() {
    loadAjaxPage();
});

function getURLParameter(name) {
    var value = decodeURIComponent((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, ""])[1]);
    return (value !== 'null') ? value : false;
}

function updateURLParameter(url, param, paramVal) {
    var TheAnchor = null;
    var newAdditionalURL = "";
    var tempArray = url.split("?");
    var baseURL = tempArray[0];
    var additionalURL = tempArray[1];
    var temp = "";

    if (additionalURL) {
        var tmpAnchor = additionalURL.split("#");
        var TheParams = tmpAnchor[0];
        TheAnchor = tmpAnchor[1];
        if (TheAnchor)
            additionalURL = TheParams;

        tempArray = additionalURL.split("&");

        for (i = 0; i < tempArray.length; i++) {
            if (tempArray[i].split('=')[0] != param) {
                newAdditionalURL += temp + tempArray[i];
                temp = "&";
            }
        }
    } else {
        var tmpAnchor = baseURL.split("#");
        var TheParams = tmpAnchor[0];
        TheAnchor = tmpAnchor[1];

        if (TheParams)
            baseURL = TheParams;
    }

    if (TheAnchor)
        paramVal += "#" + TheAnchor;

    var rows_txt = temp + "" + param + "=" + paramVal;
    return baseURL + "?" + newAdditionalURL + rows_txt;
}

function updatePageURLParameter(newPage) {
    var response = updateURLParameter(window.location.href, "page", newPage);
    console.log("Updated page url to " + newPage + ": " + response);
    return response;
}

function getPageURLParameter() {
    return getURLParameter("page");
}


/*** Init ***/

function initialize() {
    console.log("Initializing...");
    // show the container which shows all pages
    // (it is hidden in the beginning to prevent overlapping of pages on start up)
    $(".start-hidden").show();
    
    
    applyLinkAction("*"); // start using all link elements
    loadAjaxPage();
    
    // activate tooltips
    $('[data-toggle="tooltip"]').tooltip();
    
    /*$(".navbar-fixed-top").autoHidingNavbar({
    });*/

    // jQuery to collapse the navbar on scroll
    $(window).scroll(function() {
        if ($(".navbar").offset().top > 8) {
            $(".navbar-fixed-top").addClass("top-nav-collapse");
        } else {
            $(".navbar-fixed-top").removeClass("top-nav-collapse");
        }
    });
}

$(document).ready = initialize();


