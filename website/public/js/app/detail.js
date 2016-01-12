function initDetailPage() {
    console.log("Initializing detail page.");
    updateMenu("#browse-nav");
    // hide challenge box in the beginning
    //$(".challenge-detail-box").css("opacity", "0");
    
    // evaluate location hash
    var challengeId = location.hash.substr(1);
    
    
    console.log("Requesting challenge with id " + challengeId);
    // request challenge
    Storage.requestChallenge(challengeId, function(challenge) {
        if (!challenge) {
            console.error("No challenge recieved.");
            return;
        }
        // update challenge information
        updateChallengeInformation(challenge);
    });
}

function updateChallengeInformation(challenge) {
    $(".challenge-detail-box h1").text(challenge.title);
    $(".challenge-detail-box p").text(challenge.description);
    
    if (challenge.image && challenge.image != "") {
        $(".challenge-detail-box-image").css("background-image", "url('../img/icon/" + challenge.image + "')");
    }
}


initDetailPage();