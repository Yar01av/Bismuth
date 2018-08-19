from flask import Flask, url_for, render_template, request, jsonify, send_from_directory, abort
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug import secure_filename
import os


UPLOAD_FOLDER = "./images"
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])
BASE_PATH = os.path.abspath(os.path.dirname(__file__))
LIST_OF_CATEGORIES = ["uncategorized", "science", "history", "culture", ""]
MAX_HEADING_LENGTH = 80
MAX_CONTENT_LENGTH = 200
MAX_POSTS = 5

def get_text_from_lines(preceeding_text, text_file_lines):
	lines_with_extras = list(filter(lambda line: preceeding_text in line, text_file_lines))

	return [text_line[len(preceeding_text) : ] for text_line in lines_with_extras]


app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///post_log.sqlite3'
db = SQLAlchemy(app)

#SQL
class Post(db.Model):
	id_num = db.Column(db.Integer, primary_key = True, index = True, autoincrement = True)
	time = db.Column(db.DateTime)
	heading = db.Column(db.String(MAX_HEADING_LENGTH))
	content = db.Column(db.String(MAX_CONTENT_LENGTH))
	category = db.Column(db.String(50))
	image_name = db.Column(db.String(80))

@app.route('/')
@app.route('/category/<category>')
def show_all(category = "uncategorized"):
	if category not in LIST_OF_CATEGORIES:
		print(category)
		abort(404)
	return render_template('main.html', category = category)

@app.route('/new-post/', methods = ['POST'])
def new_post():
	bad_inputs_ids = []

	#Test the form input
	if bool(request.files) == True:
		if secure_filename(request.files["new-post-image"].filename).rsplit('.', 1)[1] not in ALLOWED_EXTENSIONS:
			bad_inputs_ids.append("#upload-button")

		f = request.files["new-post-image"]
		image_name = secure_filename(f.filename)
		f.save(app.config['UPLOAD_FOLDER'] + '/' + image_name)
	else:
		image_name = "default.png"

	if len(request.form["new-post-title"]) > MAX_HEADING_LENGTH:
		bad_inputs_ids.append("#title-field")
	if len(request.form["new-post-text"]) > MAX_CONTENT_LENGTH:
		bad_inputs_ids.append("#content-field")

	if len(bad_inputs_ids) != 0:
		return jsonify(bad_inputs_ids), 400

	#Write to SQL database
	db.session.add(Post(heading = request.form["new-post-title"], content = request.form["new-post-text"].replace("\r\n", " ").replace("\n", " "), category = request.form["category-choice"], image_name = image_name, time = datetime.now()))
	#Delete the oldest entry if there are too many
	all_saved_posts = Post.query.all()
	if len(all_saved_posts) > MAX_POSTS:
		db.session.delete(all_saved_posts[0])
	db.session.commit()

	return "The post was successfully posted!"

@app.route('/get_posts/', methods = ["GET"])
@app.route('/get_posts/<category>', methods = ["GET"])
def get_posts(category = "uncategorized"):
	headings = []
	contents = []
	imgs = []

	#Read from SQL database
	if category in LIST_OF_CATEGORIES:
		if category == "uncategorized":
			fetched_posts = Post.query.all()
		else:
			fetched_posts = Post.query.filter_by(category = category).all()
	else:
		abort(400)

	for p in fetched_posts:
		headings.append(p.heading)
		contents.append(p.content)
		imgs.append(p.image_name)

	#return and reverse so that the recent posts are on top
	return jsonify(dict(headings = list(reversed(headings)), contents = list(reversed(contents)), img_name = list(reversed(imgs))))

@app.route("/images/<path:image_name>", methods = ["GET"])
def image_fetch(image_name):
	return send_from_directory(app.config['UPLOAD_FOLDER'], image_name)

@app.route("/about/")
def about():
	return render_template("about_info.html")

if __name__ == "__main__":
	app.run(host="localhost", port="5000", debug=True)
	print("It works as expected")

db.create_all()