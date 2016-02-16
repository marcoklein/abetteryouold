function initSubmitPage() {
    updateMenu("#submit-nav");
    hideAlerts();
}

/* Submit button pressed */
function submit() {
    //BootstrapDialog.show({message: "Hi Apple!"});
    console.log("Submitting challenge...");
    hideAlerts();
    var valid = true;
    // check if all fields are filled correctly
    // title
    var title = $("#challenge-title").val();
    if (title.length < MIN_TITLE_LENGTH) {
        $("#title-too-short").fadeIn();
        valid = false;
    } else if (title.length > MAX_TITLE_LENGTH) {
        $("#title-too-long").fadeIn();
        valid = false;
    }
    // description
    var description = $("#challenge-description").val();
    if (description.length < MIN_DESCRIPTION_LENGTH) {
        $("#description-too-short").fadeIn();
        valid = false;
    } else if (description.length > MAX_DESCRIPTION_LENGTH) {
        $("#description-too-long").fadeIn();
        valid = false;
    }
    // tags
    var tags = "" + $("#challenge-tags").val();
    tags = tags.split(","); // extract keywords
    if (tags.length > MAX_TAGS) {
        $("#tags-too-long").fadeIn();
        valid = false;
    }
    console.log("Number of keywords: " + tags.length);
    console.log(tags);
    // set up tags
    for (var i = 0; i < tags.length; i++) {
        tags[i] = trimTag(tags[i]);
        if (tags[i].length > MAX_TAG_LENGTH) {
            $("#tag-too-long").fadeIn();
            valid = false;
            break;
        }
    }
    
    // name
    var name = $("#challenge-author-name").val();
    // TODO validate name
    
    // mail
    var mail = $("#challenge-author-mail").val();
    // TODO check if it is a mail
    
    
    
    
    if (!valid) {
        return;
    }
    
    // send new challenge to server
    var challenge = {};
    challenge.title = title;
    challenge.description = description;
    challenge.authorName = name;
    challenge.authorMail = mail;
    challenge.tags = tags;
    challenge.duration = null;
    challenge.image = "alto.png";
    sendNewChallenge(challenge);
    
    alert("Your challenge has been submitted, thank you.");
    
}

/* Removes leading and trailing whitespaces. */
function trimTag(tags) {
    return tags.replace(/^\s+|\s+$/g,"");
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

$(document).ready = initSubmitPage();