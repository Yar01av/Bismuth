const max_heading_length = 80
const max_content_length = 200

function removeSpecialOverlay() {
	$(".over-curtain-card").remove();
	$("#curtain").remove();
}

function flushNewPostUI() {
	removeSpecialOverlay();
	$(".post").remove();

	updatePostList(chosen_category);
}

function maybeAddDeleteButton(post_id, ids_with_deletion) {
	if (ids_with_deletion.includes(post_id)) {
		return "<button onclick=requestDeletion(" + post_id + ") class='btn dangerous-bg-clr'> Delete this post </button>"
	} else {
		return ""
	}
}

function requestDeletion(post_id) {
	$.ajax({
		url: "/delete_post/" + post_id,
		method: "DELETE",
		success: function(respData, status, jqXHR) {
			$("#post-id_" + post_id).remove()
		},
		error: function(jqXHR, textStatus) {
			alert("You are trying to delete a post that you have not made!")
		}
	});
}

function addPostButtonEvent() {
	$("body").append("<div id='curtain'></div>");
	$("body").append(" \
						<form id='post-form' class='over-curtain-card' method=POST enctype='multipart/form-data'> \
							<div class='form-group'> \
								<label>Title of the new post</label> \
								<input id='title-field' class='form-control' name='new-post-title' placeholder='" + max_heading_length + " symbols max.'></input> \
								<div class='invalid-feedback'> \
          							The number of symbols should be no more than " + max_heading_length + ".\
        						</div> \
							</div> \
							<div class='form-group'> \
								<label>Text of the new post</label> \
								<textarea id='content-field' class='form-control' name='new-post-text' placeholder='" + max_content_length + " symbols max.'></textarea> \
								<div class='invalid-feedback'> \
          							The number of symbols should be no more than " + max_content_length + ".\
        						</div> \
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
								<div class='invalid-feedback'> \
          							Incorrect file type or the image is too large. Only .jpeg, .jpg, .png, .gif that are below 10MB are accepted.\
        						</div> \
							</div> \
							<input type='submit' class='btn post-control-btn secondary-bg-clr' rows=3 value='Submit a new post'></input> \
							<button type='button' class='btn post-control-btn secondary-bg-clr' onclick=flushNewPostUI() rows=4>Cancel</button> \
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

				//restores the normal page and updates it (+ delete buttons)
				flushNewPostUI();
			},
			error: function(jqXHR, textStatus) {
				//jqXHR contains ids of the icorrect fields
				for (var i = 0; i < jqXHR["responseJSON"].length; i++) {
					$(String(jqXHR["responseJSON"][i])).addClass("is-invalid");
				}
			}
		});
	});
	$("#curtain").click(flushNewPostUI);
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
					$("body").append('<div id="post-id_' + respData["ids"][i] + '" class="border media mb-2 shadow-sm post"> \
										<div class="mr-3 align-self-center image-container"> \
	  									<img src="/images/' + respData["img_name"][i] + '"> \
	  									</div> \
	  									<div class="media-body"> \
	    									<h5 class="mt-0">' + respData["headings"][i] + '</h5> \
	    										' + respData["contents"][i] + ' \
	  									</div>\
	  									' + maybeAddDeleteButton(respData["ids"][i], respData["client_made_posts"]) + '\
									</div>')
				};
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
