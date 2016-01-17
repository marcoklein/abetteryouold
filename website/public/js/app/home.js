
function initTopChallenges() {
    Storage.requestListChallenges("top", function(challenges) {
        fillWithChallengesRows($("#top-challenges"), 2, challenges);
    });
}

function initNewChallenges() {
    Storage.requestListChallenges("new", function(challenges) {
        fillWithChallengesRows($("#new-challenges"), 2, challenges);
    });
}

function fillWithChallengesRows(container, colsPerRow, challenges) {
    var i;
    var row;
    var colSize = 12 / colsPerRow;
    for (i = 0; i < challenges.length; i++) {
        if (i % colsPerRow == 0) {
            // add new row
            row = $("<row>");
            container.append(row);
        }
        // add column
        var col = $("<div>");
        col.addClass("col-md-" + colSize);
        col.attr("href", "detail#" + challenges[i]._id);
        col.click(linkContentAction);
        
        row.append(col);
        
        // add challenge box
        var content = createChallengeBox(challenges[i]);
        col.append(content);
        
    }
}


/*** Init ***/

function initialize() {
    initTopChallenges();
    initNewChallenges();
}


console.log("Init page scrolling");
$('a.page-scroll').bind('click', function (event) {
    var $anchor = $(this);
    $('html, body').stop().animate({
        scrollTop: $($anchor.attr('href')).offset().top - 50
    }, 1500, 'easeInOutExpo');
    event.preventDefault();
});

updateMenu("#home-nav");
initialize();