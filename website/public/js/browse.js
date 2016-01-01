
var browseContainer;
var challengeCount = 0;


function initBrowsePage() {
    updateMenu("#browse-page-nav");
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

$(document).ready = initBrowsePage();