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


function hideAlerts() {
    $(".alert-hidden").hide();
}