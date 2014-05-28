var logIndex = 0;
var regIndex = 0;

$(document).ready(function () {
	$('#userLogin').click(function() {
		requestLogin();
	});
    $('#login').click(function() {
		redirect_login();
	});

    $('#register').click(function() {
		redirect_register();
	});
	$("#userReg").click(function() {
		requestRegister();
	});
});
function redirect_register(){
    $.ajax({
			url: 'user/register',
        type:'POST',
			async: false,
			cache: false,
			dataType: 'text',
			data: $('#registerForm').serializeArray(), 
			success: function(response) {
				}
			}
		);
}
function requestLogin() {
	var submit = true;
	var email = $("#logEmailInput").val();
	var password = $("#logPasswordInput").val();
	email = sanitise(email);
	password = sanitise(password);
	if(email === '') {
		$('#logEmailForm').attr('class', 'form-group has-error');
		submit = false;
	}
	if(password === '') {
		$('#logPasswordForm').attr('class', 'form-group has-error');
		submit = false;
	}
	if(submit) {
		$.ajax({
			url: 'user',
			type: 'POST',
			async: false,
			cache: false,
			dataType: 'text',
			data: {email: email, password: password},
			success: function(response) {
				alert(response);
				if(!response.email) {
					$("#loginForm").add('<div class="alert alert-danger">Oops! Login failed, please check your email</div>');
				}
				if(!response.password) {
					$("#loginForm").add('<div class="alert alert-danger">Oops! Login failed, please check your password</div>');
				}
				if(response.html != null) {
					window.location.href = "dashboard.html";
				}
			}
		})
		.done(function() {
			console.log("success");
		})
		.fail(function() {
			console.log("error");
		})
		.always(function() {
			console.log("complete");
		});
	}
	else {
		if(logIndex === 0) {
			$("#loginForm").append('<div class="alert alert-danger">Oop! Submission failed... No sneaky business!</div>');
			logIndex++;
		}
	}
}

function requestRegister() {
	var submit = true;
	$('#registerForm input').each(function() {
		var input = this.value;
		input = sanitise(input);
		if(input === '') {
			$($(this).parent()).attr('class', 'form-group has-error');
			submit = false;
		}
	});	
	if(submit) {
		$.ajax({
			url: 'js/formValid.py',
			type: 'POST',
			async: false,
			cache: false,
			dataType: 'text',
			data: $('#registerForm').serializeArray(), 
			success: function(response) {
				alert(response);
				if(!response.email) {
					$("#loginForm").add('<div class="alert alert-danger">Oops! Email is in use.</div>');
				}
				if(!response.password) {
					$("#loginForm").add('<div class="alert alert-danger">Oops! Password don\'t match.</div>');
				}
				if(response.email && response.password) {
					window.location.href = "myProfile.html";
				}
			}
		})
		.done(function() {
			console.log("success");
		})
		.fail(function() {
			console.log("error");
		})
		.always(function() {
			console.log("complete");
		});
	}
	else {
		if(regIndex === 0) {
			$("#registerForm").append('<div class="alert alert-danger">Oop! Submission failed... No sneaky business!</div>');
			regIndex++;
		}
	}

}
