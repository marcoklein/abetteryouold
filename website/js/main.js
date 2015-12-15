
/*** Constants ***/
var FADE_TIME = 400;
var PAGES = ["home-page", "browse-page", "submit-page", "about-page"];




/*** Variables ***/

/* Stores the id of the current page. */
var currentPage = null;




/*** Home Page ***/




/*** Browse Page ***/

/* Called as the search button is pressed. */
function search(text) {
    console.log("Searching for " + text);
}




/*** Submit Page ***/




/*** About Page ***/





/*** Main Control ***/


/* Handles hash changes of the url. You can get the hash by location.hash */
function locationHashChanged() {
    var hash = location.hash.substr(1); // cut away the hashtag
    console.log("Has changed to " + hash);
    // analyse new hash - is it a page?
    if (hash.endsWith("page")) { // TODO replace endsWith - only supported by new browsers
        changePage(hash);
    }
}


/* Hides all available pages. If you create a new one you have to add it here. */
function hideAllPages() {
    for (var page in PAGES) {
        $(toClass(PAGES[page])).hide();
    }
}

function changePage(newPage) {
    changePage(newPage, true);
}

function changePage(newPage, fade) {
    if (fade === undefined) {
        fade = true; // default value
    }
    console.log("Changing pages from " + currentPage + " to " + newPage);
    if (currentPage === null) {
        currentPage = newPage;
        hash(toHash(currentPage));
        hideAllPages();
        // only fade in new page if fade is true
        if (fade) $(toClass(newPage)).fadeIn(FADE_TIME);
        else $(toClass(newPage)).show();
    } else if (fade) {
        // fade out current page then fade in new page
        $(toClass(currentPage)).fadeOut(FADE_TIME, function() {
            currentPage = newPage;
            hash(toHash(currentPage));
            $(toClass(currentPage)).fadeIn(FADE_TIME);
        });
    } else {
        // just change pages
        currentPage = newPage;
        hash(toHash(currentPage));
        hideAllPages();
        $(toClass(newPage)).show();
    }
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
    hideAllPages();
    // show the container which shows all pages
    // (it is hidden in the beginning to prevent overlapping of pages on start up)
    $(".start-hidden").show();
    
    // determine the page to be shown
    if (location.hash !== null) {
        //locationHashChanged(); // there is a hashtag in the url
        changePage("home-page", false); // default page to show
    } else {
        changePage("home-page", false); // default page to show
    }
    
    
}


window.onhashchange = locationHashChanged;
window.onload = initialize;