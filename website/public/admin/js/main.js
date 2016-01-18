
var SERVER_URL = "http://localhost:8080";
//var SERVER_URL = "http://87.106.14.30:8080";


var password = "testpw123";
var userName = "spartaner";


/*** Main control ***/
function loadAllChallenges() {
    requestAllChallenges(function(challenges) {
        // load challenges into table
        
        var table = $("#challenge-table");
        
        var i = 0;
        for (i = 0; i < challenges.length; i++) {
            table.append(createTableEntry(challenges[i]));
        }
        
        console.log("Challenges loaded.");
        $("#dataTables-example").DataTable({
            responsive: true,
        });
    });
}

function createTableEntry(challenge) {
    var row = $("<tr>");
    row.addClass("challenge-row");
    row.click(function() {challengeClicked(challenge._id)});
    //row.on("click", "challengeClicked(" + challenge._id + ");");
    // append data
    row.append($("<td>").text(challenge._id));
    row.append($("<td>").text(challenge.title));
    row.append($("<td>").text(challenge.description));
    row.append($("<td>").text(challenge.authorName));
    row.append($("<td>").text(challenge.authorMail));
    row.append($("<td>").text(challenge.tags));
    row.append($("<td>").text(challenge.duration));
    row.append($("<td>").text(challenge.image));
    row.append($("<td>").text(challenge.views));
    row.append($("<td>").text(challenge.status));
    row.append($("<td>").text(challenge.timestamp));
    
    // add edit button
    
    return row;
}

function challengeClicked(challengeId) {
    console.log("Clicked on challenge " + challengeId);
}



/*** Network ***/

function requestAllChallenges(callback) {
    var data = {
        pw: password,
        user: userName
    };
    ajaxRequest(SERVER_URL + "/admin-list-all", data, function(data) {
        callback(data.challenges);
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


/*** Init ***/

function initialize() {
    loadAllChallenges();
}

$(document).ready = initialize();