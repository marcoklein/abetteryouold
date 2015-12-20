/* Handles all pages. */

/* The class "hidden" is used for elements which are hidden if a page changes. */

/*** Constants ***/
var FADE_TIME = 400;
var PAGES = ["home-page", "browse-page", "submit-page", "about-page"];
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
        console.log("Unknown page hash: " + page);
        changePageFade(DEFAULT_PAGE);
    }
};

var MIN_TITLE_LENGTH = 4;
var MAX_TITLE_LENGTH = 50;
var MIN_DESCRIPTION_LENGTH = 50;
var MAX_DESCRIPTION_LENGTH = 1200;

/*** Global Variables ***/

/* Stores the id of the current page. */
var currentPage = null;




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
    
    browseContainer.append("<div>Loading...</div>");
    
    requestChallenges();
    
    
    /*for (var i = 0; i < 1; i++) {
        var row = $("<div>").addClass("row");
        browseContainer.append(row);
        $("<div>").addClass("col-md-4").append($("<p>").text("111111111111111")).appendTo(row);
        $("<div>").addClass("col-md-4").append($("<p>").text("2222222222222222")).appendTo(row);
        $("<div>").addClass("col-md-4").append($("<p>").text("3333333333333")).appendTo(row);
    }*/
}

/* Requests challenges from the server. */
function requestChallenges() {
    console.log("Requesting challenges.");
    // as test
    challengesRecieved();
}

/* Called as the client recieves the challenges.*/
function challengesRecieved() {
    console.log("Recieved challenges.");
    // clean all challenge items
    challengeCount = 0;
    var browseContainerNode = document.getElementById("browse-container");
    while (browseContainerNode.firstChild) {
        browseContainerNode.removeChild(browseContainerNode.firstChild);
    }
    
    /*** TEST ***/
    var challenges = [{name: "Test", description: "Test challenge"},
                      {name: "Another Challenge", description: "This is sparta"},
                      {name: "Blabla", description: "Do this do that"}];
    
    applyChallenges(challenges);
}

/* Applies the given challenges to the browse screen.
They have the form
    - challenges [array]
        - id
        - name
        - description
        - duration [optional] (in days)
        - tags [array,optional]
            - tagname
        - image [optional]
*/
function applyChallenges(challenges) {
    // add challenges
    for (challenge in challenges) {
        addChallenge(challenges[challenge]);
    }
}

/* Adds given challenge to the browse page. See applyChallenges for the format. */
function addChallenge(challenge) {
    var col = $("<div>");
    var content = $("<div>");
    col.append(content);
    // content
    content.append($("<h4>").text(challenge.name));
    //content.append($("<p>").text(challenge.description));
    // css
    col.css("padding", "4px");
    content.css("text-align", "center");
    content.css("padding", "4px");
    content.css("border", "4px solid green");
    content.css("background-color", "#EEE");
    content.css("width", "192px");
    content.css("height", "128px");
    content.css("cursor", "pointer");
    content.onclick = function() {
        console.log("Showing challenge \"" + challenge.name + "\"");
        // change hash to show clicked challenge
        location.hash = "#bla";
    };
    
    content.attr("data-toggle", "tooltip");
    content.attr("title", challenge.description);
    content.attr("data-placement", "bottom");
    content.tooltip();
    
    // add
    browseContainer.append(col);
    challengeCount++;
}

/* Called if you press enter while in the search text field. */
$("#search-text").keypress(function(e) {
    if (e.which == 13) {
        // FIXME seems not to work right now
        search($("#search-text").val());
    }
});


/* Called as the search button is pressed. */
function search(text) {
    console.log("Searching for \"" + text + "\"");
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
    // check if all fields are filled correctly
    var title = $("#challenge-title").val();
    if (title.length < MIN_TITLE_LENGTH) {
        $("#title-too-short").show();
    } else if (title.length > MAX_TITLE_LENGTH) {
        $("#title-too-long").show();
    }
    var description = $("#challenge-description").val();
    if (description.length < MIN_DESCRIPTION_LENGTH) {
        $("#description-too-short").show();
    } else if (description.length > MAX_DESCRIPTION_LENGTH) {
        $("#description-too-long").show();
    }
}

/*** About Page ***/

function initAboutPage() {
    updateMenu("#about-page-nav");
}



/*** Main Control ***/


/* Handles hash changes of the url. You can get the hash by location.hash */
function locationHashChanged() {
    var page = location.hash.substr(1); // cut away the hashtag
    console.log("Hash has changed to " + page);
    // analyse new hash - is it a page?
    if (endsWith(page, "page")) {
        /*for (p in PAGES) {
            if (PAGES[p].match(page)) {
                console.log("Unknown page: " + page);
                return;
            }
        }*/
        // a valid page
        changePageFade(page);
    } else {
        // unknown hash - change page to default page
        console.log("Unknown hash: " + page);
        changePageFade(DEFAULT_PAGE);
    }
}



/* Hides all available pages. If you create a new one you have to add it here. */
function hideAllPages() {
    for (page in PAGES) {
        $(toClass(PAGES[page])).hide();
    }
}

function changePageFade(newPage) {
    changePage(newPage, true);
}

function changePage(newPage, fade) {
    if (currentPage == newPage) {
        return; // no page change
    }
    if (fade === undefined) {
        fade = true; // default value
    }
    console.log("Changing pages from " + currentPage + " to " + newPage);
    if (currentPage === null) {
        currentPage = newPage;
        hash(toHash(currentPage));
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
        $(toClass(currentPage)).fadeOut(FADE_TIME, function() {
            currentPage = newPage;
            hash(toHash(currentPage));
            $(toClass(currentPage)).fadeIn(FADE_TIME);
            INIT_PAGE(newPage);
        });
    } else {
        // just change pages
        currentPage = newPage;
        hash(toHash(currentPage));
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

/*** Helper ***/

/* Helper method to change the hash of the url (ie. used in buttons to change page) */
function hash(h) {
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
