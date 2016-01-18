/* Manages challenge boxes */
function createChallengeBox(challenge) {
    var content = $("<div>");
    content.addClass("challenge-box");
    content.attr("title", challenge.title);
    content.attr("href", "#");
    content.tooltip();
    var icon = $("<span>");
    // set background image
    icon.addClass("challenge-box-image");
    if (challenge.image && challenge.image != "") {
        icon.css("background-image", "url('../img/icon/" + challenge.image + "')");
    }
    // add elements
    var title = $("<h1>");
    title.text(challenge.title);
    
    var description = $("<p>");
    description.text(challenge.description);
    
    // add
    content.append(title);
    content.append(description);
    content.append(icon);
    
    return content;
}