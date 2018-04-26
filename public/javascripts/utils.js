function getCookie(name) {
	var value = "; " + document.cookie;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) 
		return parts.pop().split(";").shift();
	else
		return null;
}
function signOut(){
  document.cookie = 'dasa_token=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  window.location.href=CLIENT_URL+ "login";
}

var fading_circle_spinner =
'<div class="sk-fading-circle">' +
  '<div class="sk-circle1 sk-circle"></div>' +
  '<div class="sk-circle2 sk-circle"></div>' +
  '<div class="sk-circle3 sk-circle"></div>' +
  '<div class="sk-circle4 sk-circle"></div>' +
  '<div class="sk-circle5 sk-circle"></div>' +
  '<div class="sk-circle6 sk-circle"></div>' +
  '<div class="sk-circle7 sk-circle"></div>' +
  '<div class="sk-circle8 sk-circle"></div>' +
  '<div class="sk-circle9 sk-circle"></div>' +
  '<div class="sk-circle10 sk-circle"></div>' +
  '<div class="sk-circle11 sk-circle"></div>' +
  '<div class="sk-circle12 sk-circle"></div>' +
'</div>'