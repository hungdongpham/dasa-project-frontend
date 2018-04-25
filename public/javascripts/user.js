function checkUserToken(callback){
	if(getCookie("dasa_token")){
		$.ajax({
    		url: API_URL + 'user',
    		type: "get",
    		dataType: 'json',
    		beforeSend: function(xhr){ 
    			xhr.setRequestHeader('dasa-token', getCookie("dasa_token"));
    		},
    		success: function( result ) {
    			var now = new Date();
    			var time = now.getTime();
    			time +=  30 * 24 * 3600 * 1000;
    			now.setTime(time);
    			document.cookie = 'dasa_token=' + result.token + '; expires=' + now.toUTCString() + '; path=/';
    			user = result;
    			callback(null,user);
    		},
    		error: function( err ) {
    			console.log( "ERROR:  " + JSON.stringify(err) );
    			callback(err);
    		}
    	});

	} else{
        callback(1);
    }
}

function signin(event){
	console.log(event);
	console.log(event.target);
	console.log(event.target.username.value);
	var username = event.target.username.value;
	var password = event.target.pwd.value;
	if($(".form-help").length <=0){
		$("form").prepend("<div class='form-help'></div>")
	}
	$(".form-help").html("");
	if(!username || username.trim()==""){
		$(".form-help").html("Enter username");
		return false;
	}

	if(!password || password.trim()==""){
		$(".form-help").html("Enter password");
		return false;
	}

	var data = {
			username: username,
			password: password
	}

	$.ajax({
    	url: API_URL + 'user/signin',
    	type: "post",
    	dataType: 'json',
    	contentType: 'application/json',
	    data : JSON.stringify(data),
    	success: function( result ) {
    		console.log(result);
    		var now = new Date();
    		var time = now.getTime();
    		time +=  30 * 24 * 3600 * 1000;
    		now.setTime(time);
    		document.cookie = 'dasa_token=' + result.token + '; expires=' + now.toUTCString() + '; path=/';
			window.location.href=CLIENT_URL+ "files";
    	},
    	error: function( err ) {
    		console.log( "ERROR:  " + JSON.stringify(err) );
    		console.log(err.responseJSON);
    		if(err.responseJSON && err.responseJSON.message)
    			$(".form-help").html(err.responseJSON.message);
    	}
    });

	return false;
}

function signup(event){
	console.log(event);
	console.log(event.target);
	console.log(event.target.username.value);
	var username = event.target.username.value;
	var password = event.target.pwd.value;
	if($(".form-help").length <=0){
		$("form").prepend("<div class='form-help'></div>")
	}
	$(".form-help").html("");
	if(!username || username.trim()==""){
		$(".form-help").html("Enter username");
		return false;
	}

	if(!password || password.trim()==""){
		$(".form-help").html("Enter password");
		return false;
	}

	var data = {
			username: username,
			password: password
	}

	$.ajax({
    	url: API_URL + 'user/signup',
    	type: "post",
    	dataType: 'json',
    	contentType: 'application/json',
	    data : JSON.stringify(data),
    	success: function( result ) {
    		console.log(result);
    		var now = new Date();
    		var time = now.getTime();
    		time +=  30 * 24 * 3600 * 1000;
    		now.setTime(time);
    		document.cookie = 'dasa_token=' + result.token + '; expires=' + now.toUTCString() + '; path=/';
			window.location.href=CLIENT_URL+ "files";
    	},
    	error: function( err ) {
    		console.log( "ERROR:  " + JSON.stringify(err) );
    		console.log(err.responseJSON);
    		if(err.responseJSON && err.responseJSON.message)
    			$(".form-help").html(err.responseJSON.message);
    	}
    });

	return false;
}