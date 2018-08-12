from flask import Flask, url_for, render_template, request, jsonify, send_from_directory, abort
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug import secure_filename
import os


UPLOAD_FOLDER = "./images"
ALLOWED_EXTENSIONS = set(['png', 'jpg', 'jpeg', 'gif'])
base_path = os.path.abspath(os.path.dirname(__file__))
list_of_categories = ["uncategorized", "science", "history", "culture", ""]

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
	heading = db.Column(db.String(80))
	content = db.Column(db.String(120))
	category = db.Column(db.String(50))
	image_name = db.Column(db.String(80))

	def __init__(self, heading, content, category, image_name):
		self.time = datetime.now()
		self.heading = heading
		self.content = content
		self.category = category
		self.image_name = image_name

@app.route('/')
@app.route('/<category>')
def show_all(category = "uncategorized"):
	if category not in list_of_categories:
		print(category)
		abort(404)
	return render_template('main.html', category = category)

@app.route('/new-post/', methods = ['POST'])
def new_post():
	if bool(request.files) == True:
		f = request.files["new-post-image"]
		image_name = secure_filename(f.filename)
		f.save(app.config['UPLOAD_FOLDER'] + '/' + image_name)
	else:
		image_name = "default.png"

	#Write to SQL database
	db.session.add(Post(request.form["new-post-title"], request.form["new-post-text"].replace("\r\n", " ").replace("\n", " "), request.form["category-choice"], image_name))
	db.session.commit()

	return "The post was successfully posted!"

@app.route('/get_posts/', methods = ["GET"])
@app.route('/get_posts/<category>', methods = ["GET"])
def get_posts(category = "uncategorized"):
	headings = []
	contents = []
	imgs = []

	#Read from SQL database
	for p in Post.query.filter_by(category = category).all():
		headings.append(p.heading)
		contents.append(p.content)
		imgs.append(p.image_name)

	return jsonify(dict(headings = headings, contents = contents, img_name = imgs))

@app.route("/images/<path:image_name>", methods = ["GET"])
def image_fetch(image_name):
	return send_from_directory(app.config['UPLOAD_FOLDER'], image_name)

if __name__ == "__main__":
	app.run(host="localhost", port="5000", debug=True)
	print("It works as expected")

db.create_all()