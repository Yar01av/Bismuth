function flush_new_post_ui() {
	$("#post-form").remove();
	$("#curtain").remove();
	$(".post").remove();

	updatePostList(chosen_category);
}

function addPostButtonEvent() {
	$("body").append("<div id='curtain'></div>");
	$("body").append(" \
						<form id='post-form' method=POST enctype='multipart/form-data'> \
							<div class='form-group'> \
								<label>Title of the new post</label> \
								<input id='title-field' class='form-control' name='new-post-title'></input> \
								 \
							</div> \
							<div class='form-group'> \
								<label>Text of the new post</label> \
								<textarea class='form-control' name='new-post-text'></textarea> \
								 \
							</div> \
							<div class='form-group'> \
								<label>Choose the category of the post</label> \
								<div class='form-check'> \
									<input class='form-check-input' type='radio' name='category-choice' id='radio-uncategorized' value='uncategorized' checked> \
	  								<label class='form-check-label' for='radio-uncategorized'> \
	    								Uncategorized/All \
	  								</label> \
								</div> \
								<div class='form-check'> \
									<input class='form-check-input' type='radio' name='category-choice' id='radio-science' value='science'> \
	  								<label class='form-check-label' for='radio-science'> \
	    								Science \
	  								</label> \
								</div> \
								<div class='form-check'> \
									<input class='form-check-input' type='radio' name='radio-culture' value='culture'> \
	  								<label class='form-check-label' for='radio-culture'> \
	    								Culture \
	  								</label> \
								</div> \
								<div class='form-check'> \
									<input class='form-check-input' type='radio' name='category-choice' value='history'> \
	  								<label class='form-check-label' for='exampleRadios2'> \
	    								History \
	  								</label> \
								</div> \
							</div> \
							<div class='form-group'> \
								<label>Choose an image to upload</label> \
								<input id='upload-button' type=file class='form-control-file' name=new-post-image></input> \
							</div> \
							<input type='submit' class='btn secondary-bg-clr' rows=3 value='Submit a new post'></input> \
							<button type='button' class='btn secondary-bg-clr' onclick=flush_new_post_ui() rows=4>Cancel</button> \
						</form> \
					");

	//Associated events
	$("#post-form").submit(function(event){
		//prevents refreshing
		event.preventDefault();

		//sends the data to the server
		var formData = new FormData($("#post-form")[0]);

		$.ajax({
			url: postEndpoint,
			processData: false,
			method: "POST",
			data: formData,
			contentType: false,
            processData: false,
            async: false,
			success: function(respData, status, jqXHR) {
				console.log(respData);
			}
		});

		//restores the normal page and updates it
		flush_new_post_ui();
	});
	$("#curtain").click(flush_new_post_ui);
	$("#title-field").keydown(function(event){
	if (event.keyCode==13) {
		event.preventDefault();
		return false;
	}
});
}

//updates the list of posts
function updatePostList(category) {
	$.ajax({
			url: getPostsEndpoint,
			method: "GET",
			async: false,
			success: function(respData, status, jqXHR) {
				for(var i = 0; i < respData["contents"].length; i++) {
					$("body").append('<div class="border media mb-2 shadow-sm post"> \
	  									<img class="mr-3" src="./images/' + respData["img_name"][i] + '"> \
	  									<div class="media-body"> \
	    									<h5 class="mt-0">' + respData["headings"][i] + '</h5> \
	    										' + respData["contents"][i] + ' \
	  									</div>\
									</div>')
				}
			}
		})
}

//selecting the right category visually in the navbar
$(document).ready(function(){
	switch(chosen_category){
		case "uncategorized":
			$("#nav-all").html('All<span class="sr-only">(current)</span>');
			$("#nav-all").addClass("active");
			break;
		case "science":
			$("#nav-science").html('Science<span class="sr-only">(current)</span>');
			$("#nav-science").addClass("active");
			break;
		case "culture":
			$("#nav-culture").html('Culture<span class="sr-only">(current)</span>');
			$("#nav-culture").addClass("active");
			break;
		case "history":
			$("#nav-history").html('History<span class="sr-only">(current)</span>');
			$("#nav-history").addClass("active");
			break;
	}
});
//updating the list of posts
$(document).ready(updatePostList(chosen_category));