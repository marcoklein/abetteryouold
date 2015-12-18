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

/*** Global Variables ***/

/* Stores the id of the current page. */
var currentPage = null;




/*** Home Page ***/

function initHomePage() {
    updateMenu("#home-page-nav");
}


/*** Browse Page ***/

var COLS_PER_ROW = 3; // Columns per row
var browseContainer;
var challengeCount = 0;
var currentRow;

function initBrowsePage() {
    updateMenu("#browse-page-nav");
    browseContainer = $("#browse-container");
    
    requestChallenges();
    
    browseContainer.append("<div>Loading...</div>");
    
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
    while (browseContainer.firstChild) {
        browseContainer.removeChild(browseContainer.firstChild);
    }
    
    /*** TEST ***/
    var challenges = [{name: "Test", description: "Test challenge"},
                      {name: "Another Challenge", description: "This is sparta"},
                      {name: "Blabla", description: "Do this"}];
    
    applyChallenges(challenges);
}

/* Applies the given challenges to the browse screen.
They have the form
    - challenges [array]
        - name
        - description
        - duration [optional]
        - tags [array,optional]
            - tagname
        - image[optional]
*/
function applyChallenges(challenges) {
    // add challenges
    for (challenge in challenges) {
        addChallenge(challenges[challenge]);
    }
}

/* Adds given challenge to the browse page. See applyChallenges for the format. */
function addChallenge(challenge) {
    if (challengeCount % COLS_PER_ROW === 0) {
        // add a row
        currentRow = $("<div>").addClass("row");
        browseContainer.append(currentRow);
    }
    var col = $("<div>").addClass("col-md-4");
    // content
    col.append($("<h3>").text(challenge.name));
    col.append($("<p>").text(challenge.description));
    // css
    col.css("background-color", "yellow");
    // add
    col.appendTo(currentRow);
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
    if (page.endsWith("page")) { // TODO replace endsWith - only supported by new browsers
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
    // recieve hash changes
    window.onhashchange = locationHashChanged;

}

$(document).ready = initialize();
