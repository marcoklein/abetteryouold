/*** Page Manager ***/

/*
Loads pages into memory using ajax.

First you have to define all used pages by using the constructur new PageManager(pageUrl, pages, defaultPage, contentContainer).
pageUrl: will be appended in front of the page name for the ajax request (.html will be appended at the end).
pages: array containing all pages you are using for your website.
defaultPage: will be used if no matching page can be found (in most cases the starting site).
contentContainer: the html content of a page will be inserted into the given contentContainer. It may be an id or a class of a div element.
    jQuery is used i.e. $(contentContainer).html(page.html); to set the content

After that you may call showURLPage() of your page manager to evaluate the url parameters and switch to the given page.

Then you are done with the basic setup. You may call loadAllPages() to preload the html of all pages.

EXAMPLE #1
var homePage = new Page("home");
var aboutPage = new Page("about");

var pageManager = new PageManager("http://localhost:8080/html/", [homePage, aboutPage], homePage, "#container");
pageManager.showURLPage();
pageManager.loadAllPages();


*/

var FADE_TIME = 1;

/** The functions init() and cleanup() may be overriden by child classes. */
var Page = function(name) {
    this.name = name;
    this.html = null;
};

Page.prototype = {
    setCallbacks: function(init, cleanup) {
        this.name = name;
        if (init) {
            this.init = init;
        }
        if (cleanup) {
            this.cleanup = cleanup;
        }
    },
    init: function() {},
    cleanup: function() {}
};


var PageManager = function(pageUrl, pages, defaultPage, contentContainer) {
    this.pageUrl = pageUrl;
    this.current = null;
    this.pages = pages;
    this.defaultPage = defaultPage;
    this.contentContainer = contentContainer;
    
    // setup error message if page can not be loaded
    this.errorPage = new Page("error");
    this.errorPage.html = "<h1>ERROR while loading page.</h1>";
    this.pages.push(this.errorPage);
};

PageManager.prototype = {
    
    /** Shows the page defined by the url. */
    showURLPage: function() {
        var pageName = getPageURLParameter();
        if (!pageName) {
            // no page parameter -> show default page
            this.changePage(this.defaultPage);
        } else {
            // find page
            var page = this.findPageByName(pageName);
            if (page) {
                this.changePage(page, true);
            } else {
                throw "No page with the name " + pageName + " found.";
            }
        }
    },
    changePageFade: function(newPage) {
        this.changePage(newPage, true);
    },
    changePage: function(newPage, fade) {
        // update url parameters
        updatePageURLParameter(newPage);
        
        if (this.current == newPage) {
            return; // no page change
        }
        if (fade === undefined) {
            fade = true; // default value
        }
        var obj = this;
        console.log("Changing pages from " + (this.current ? this.current.name : "undefined") + " to " + newPage.name);
        if (this.current === null) {
            this.current = newPage;
            // only fade in new page if fade is true
            if (fade) {
                this.loadHtml(newPage, function(html) {
                    $(obj.contentContainer).html(html);
                    obj.current.init();
                    $(obj.contentContainer).fadeIn(FADE_TIME);
                });
            } else {
                this.loadHtml(newPage, function(html) {
                    $(obj.contentContainer).html(html);
                    obj.current.init();
                    $(obj.contentContainer).show();
                });
            }
        } else if (fade) {
            this.current.cleanup();
            // fade out current page then fade in new page
            $(toClass(this.current)).fadeOut(FADE_TIME, function() {
                this.current = newPage;
                this.loadHtml(newPage, function(html) {
                    $(obj.contentContainer).html(html);
                    obj.current.init();
                    $(obj.contentContainer).fadeIn(FADE_TIME);
                });
            });
        } else {
            // change pages without fade
            $(this.contentContainer).hide();
            this.current.cleanup();
            
            this.current = newPage;
            this.loadHtml(newPage, function(html) {
                $(obj.contentContainer).html(html);
                obj.current.init();
                $(obj.contentContainer).show();
            });
        }
    },
    findPageByName: function(pageName) {
        for (var i = 0; i < this.pages.length; i++) {
            if (this.pages[i].name === pageName) {
                return this.pages[i];
            }
        }
        return null;
    },
    loadAllPages: function() {
    },
    loadPage: function(page, callback) {
        this.loadPages([page], callback);
    },
    loadPages: function(loadPages, callback) {
        var obj = this;
        var pagesToLoad = [];
        // TODO test if added page is already contained in the pages to load (avoid double loading)
        for (var i = 0; i < loadPages.length; i++) {
            if (loadPages[i].html) {
                console.log("Page " + loadPages[i] + " is already loaded.");
                continue;
            }
            pagesToLoad.push(loadPages[i]);
            var pageIndex = pagesToLoad.length - 1;
            console.log("Loading page " + pagesToLoad[pageIndex].name + ".");
            // load html of the page
            $.get(this.pageUrl + pagesToLoad[pageIndex].name + ".html", function(data) {
                console.log("Loaded page " + pagesToLoad[pageIndex].name + ".");
                pagesToLoad[pageIndex].html = data;
                if (callback) {
                    callback(pagesToLoad[pageIndex]);
                }
            }).fail(function(pageError) {
                this.errorPage.html = "<h1>Page Error: " + pageError + ". Please contact the system administrator.</h1>";
                callback(this.errorPage);
            });
        }
    },
    /** Looks up if html is loaded, if not it will load the html and return it. */
    loadHtml: function(page, callback) {
        if (page.html) {
            callback(page.html);
            return;
        } else {
            // load page and show
            this.loadPage(page, function(page) {
                callback(page.html);
            });
        }
    },
}

/*** Helper ***/

function getURLParameter(name) {
    var value = decodeURIComponent((RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, ""])[1]);
    return (value !== 'null') ? value : false;
}

function updateURLParameter(url, param, paramVal) {
    var TheAnchor = null;
    var newAdditionalURL = "";
    var tempArray = url.split("?");
    var baseURL = tempArray[0];
    var additionalURL = tempArray[1];
    var temp = "";

    if (additionalURL) {
        var tmpAnchor = additionalURL.split("#");
        var TheParams = tmpAnchor[0];
        TheAnchor = tmpAnchor[1];
        if (TheAnchor)
            additionalURL = TheParams;

        tempArray = additionalURL.split("&");

        for (i = 0; i < tempArray.length; i++) {
            if (tempArray[i].split('=')[0] != param) {
                newAdditionalURL += temp + tempArray[i];
                temp = "&";
            }
        }
    } else {
        var tmpAnchor = baseURL.split("#");
        var TheParams = tmpAnchor[0];
        TheAnchor = tmpAnchor[1];

        if (TheParams)
            baseURL = TheParams;
    }

    if (TheAnchor)
        paramVal += "#" + TheAnchor;

    var rows_txt = temp + "" + param + "=" + paramVal;
    return baseURL + "?" + newAdditionalURL + rows_txt;
}

function updatePageURLParameter(newPage) {
    updateURLParameter(window.location.href, "page", newPage);
}

function getPageURLParameter() {
    return getURLParameter("page");
}