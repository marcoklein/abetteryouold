function login() {
    console.log("Login clicked.");
    // get user name and password
    var user = $("#user-input").val();
    var pw = $("#password-input").val();
    
    
    // save if user marks checkbox
    if ($("#remember-checkbox").val()) {
        console.log("Stored credentials.");
        localStorage.setItem("user", user);
        localStorage.setItem("sparta", pw);
    }
    
    window.location.href = "./admin.html";
}



/** Init **/

function initialize() {
    var user = localStorage.getItem("user");
    var pw = localStorage.getItem("sparta");
    
    if (user) {
        $("#user-input").val(user);
        if (pw) {
            $("#password-input").val(pw);
        }
    }
    
}

$(document).ready = initialize();