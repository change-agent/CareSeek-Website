$(document).ready(function () {
	//Add event listeners for edit selection
	$( "#editEmail" ).click(function() {
	  $( "#editEmailBox" ).toggle("slow");
	});

	$( "#editPass" ).click(function() {
	  $( "#editPassBox" ).toggle("slow");
	});

	$("#editInterests").click(function() {
	  $("#editInterestBox").toggle("slow");
	});

	$("#editPhone").click(function() {
	  $("#editPhoneBox").toggle("slow");
	});
	
	$("#editAboutMe").click(function() {
	  $("#editAboutMeBox").toggle("slow");
	});

	$("#editCV").click(function() {
	  $("#editCVBox").toggle("slow");
	});

	$("#editPic").click(function() {
	  $("#editPicBox").toggle("slow");
	});
});