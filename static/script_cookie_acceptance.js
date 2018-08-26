function accept_cookies() {
	$.ajax({
		url: acceptCookiesEndpoint,
		method: "POST",
		success: function() {
			console.log("Cookie policy accepted!")
		}
	});
}

$(document).ready(function() {
	$.ajax({
		url: acceptCookiesEndpoint,
		method: "GET",
		success: function(respData, status, jqXHR) {
			console.log(respData);

			if (respData == false) {
				$("body").append('\
					<div id="curtain"></div> \
  					<div class="over-curtain-card"> \
    					<h1> We use cookies </h1> \
    					<p> For the purposes of the core functionality of the website, cookies are being used here. These cookies store exclusively the information about posts that you have made and nothing else. By clicking "Accept" button below, you agree with our use of them. </p> \
    					<button id="accept-cookie-btn" class="btn secondary-bg-clr" onclick="accept_cookies(); removeSpecialOverlay()"> Accept </button> \
  					</div> \
				')
			}
		}
	});
})