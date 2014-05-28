$(document).ready(function () {
	//Add event listeners for Quick search input
	$("#searchCarer").keyup( function () {
		divClone = $("#mainContainer").clone();
		var searchStr = $("#searchCarer").val().trim();
		if( searchStr.trim().length == 0) {
			$("#mainContainer").replaceWith(divClone);
			return;
		}
		$("#mainContainer").empty();
		$("#mainContainer").append("<div class='container' id='searchResults'> </div>");
		$("#searchResults").append("<h1 class='page-header'> Search Results </h1>");
		var xmlhttp = createRequest();
		var jsonResp;
		xmlhttp.onreadystatechange = function() {
			if(xmlhttp.readyState == 4) {
				jsonResp = JSON.parse(xmlhttp.responseText);
				displayResults(jsonResp, searchStr);
			}
		}
		xmlhttp.open("GET", "ajax/people.json", true);
		xmlhttp.send();
	});
});

function displayResults(jsonObjArray, search_str) {
	//Create regular exp object
	search_str = search_str;
	var regex = new RegExp(search_str, "i");
	var i = 0;
	var preexist = false;
	while(i < $(".friendWrap").length) {
		oldFirstName = $(".firstName")[i].innerHTML;
		oldLastName = $(".lastName")[i].innerHTML;
		oldFirstName = oldFirstName.slice(0, search_str.length);
		oldLastName = oldLastName.slice(0, search_str.length);

		if(!regex.test(oldFirstName) || !regex.test(oldLastName)) {
			//Delete html node
			$(".friendWrap").remove();
			continue;
		}

		else if(regex.test(oldFirstName) || regex.test(oldLastName)) {
			preexist = true;
		}
		i++;
	}
	if(preexist) {
		return;
	}

	//Search through array
	for (var i = 0; i < jsonObjArray.length; i++) {	
		var fname = jsonObjArray[i].fname;
		var lname = jsonObjArray[i].lname;
		if(regex.test(fname.slice(0, search_str.length)) || regex.test(lname.slice(0, search_str.length))) {
			//Make some shit happen
			var profPic = jsonObjArray[i].image;
			var location = jsonObjArray[i].location;
			var desc = jsonObjArray[i].desc;

			//Create new div under friendWrap to house the person
			var newPerson = document.createElement("div");
			newPerson.className = "friendWrap"
			
			//Create profPic node and append
			var profilePic = document.createElement("img");
			profilePic.src = profPic;
			newPerson.appendChild(profilePic);

			//Create the details section to house the details
			var details = document.createElement("details");
			
			//first Name para
			var firstName = document.createElement("p");
			firstName.className = "firstName";
			firstName.innerHTML = fname;
			details.appendChild(firstName);

			//last Name para
			var lastName = document.createElement("p");
			lastName.className = "lastName";
			lastName.innerHTML = lname;
			details.appendChild(lastName);

			//geo name para
			var country = document.createElement("p");
			country.className = "location";
			country.innerHTML = location;
			details.appendChild(country);

			//desc name para
			var description = document.createElement("p");
			description.className = "desc";
			description.innerHTML = desc;
			details.appendChild(description);

			$(profilePic).appendTo(newPerson);
			$(details).appendTo(newPerson);
			$(newPerson).appendTo("#searchResults");
		}
	}
}