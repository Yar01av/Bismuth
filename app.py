from flask import Flask, url_for, render_template, request, jsonify, send_from_directory
from datetime import datetime
from werkzeug import secure_filename
import os


UPLOAD_FOLDER = "./images"
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])
base_path = os.path.abspath(os.path.dirname(__file__))

def get_text_from_lines(preceeding_text, text_file_lines):
	lines_with_extras = list(filter(lambda line: preceeding_text in line, text_file_lines))

	return [text_line[len(preceeding_text) : ] for text_line in lines_with_extras]


app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
print(__name__)
if __name__ == "__main__":
	app.run(host="0.0.0.0", port="5000", debug=True)

@app.route('/')
def show_all():
	return render_template('home.html')

@app.route('/new-post/', methods = ['POST', 'GET'])
def new_post():
	if request.method == "POST":
		with open(os.path.join(base_path, "static", "post_log.txt"), "a") as log:
			#Make a note of the post
			log.write("New post made on %s. \n" % datetime.now().strftime("%Y-%m-%d %H:%M"))
			log.write("Heading: " + request.form["new-post-title"] + "\n")
			log.write("Content: " + request.form["new-post-text"].replace("\r\n", " ").replace("\n", " ") + "\n")

			if bool(request.files) == True:
				f = request.files["new-post-image"]
				log.write("Image name: " + secure_filename(f.filename) + "\n")

				#Save the image
				f.save(app.config['UPLOAD_FOLDER'] + '/' + secure_filename(f.filename))
			else:
				log.write("Image name: fig1.png" + "\n")

			return "The post was successfully posted!"
	else:
		with open(os.path.join(base_path, "static", "post_log.txt"), "r") as log:
			#Get the posts
			text_lines = log.readlines()
			heading_from_lines = get_text_from_lines("Heading: ", text_lines)
			content_from_lines = get_text_from_lines("Content: ", text_lines)
			imgs_from_lines = get_text_from_lines("Image name: ", text_lines)

			return jsonify(dict(headings = heading_from_lines, contents = content_from_lines, img_name = imgs_from_lines))

@app.route("/images/<path:image_name>", methods = ["GET"])
def image_fetch(image_name):
	return send_from_directory(app.config['UPLOAD_FOLDER'], image_name)