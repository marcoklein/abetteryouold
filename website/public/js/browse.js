const CHALLENGES_PER_ROW = 1; // not implemented yet
var browseContainer;
var challengeCount = 0;


function initBrowsePage() {
    browseContainer = $("#browse-container");
    
    $("#detail-challenge").hide();
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
    // add a row
    var row = $("<div>");
    row.addClass("row");
    var col = $("<div>");
    col.addClass("col-md-12");
    var content = $("<div>");
    content.addClass("challenge-box");
    var icon = $("<span>");
    // set background image
    icon.addClass("challenge-box-icon");
    icon.css("background-image", "url('../img/icon/alto.png')");
    
    // define onclick action
    col.click(function() {
        document.location.href = "./detail.html#" + challenge._id;
    });
    
    // add elements
    var title = $("<h1>");
    title.text(challenge.title);
    
    var description = $("<p>");
    description.text(challenge.description);
    
    // add
    content.append(title);
    content.append(description);
    content.append(icon);
    
    col.append(content);
    row.append(col);
    
    browseContainer.append(row);
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

$(document).ready = initBrowsePage();