#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from flask import Flask, render_template, request
from flask_login import LoginManager, login_user, logout_user, login_required, UserMixin, current_user
from flask_bcrypt import Bcrypt

app = Flask(__name__)

# use info
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
bcrypt = Bcrypt(app)

class User(UserMixin):
    def __init__(self, id, username, password_hash):
        self.id = id
        self.username = username
        self.password_hash = password_hash

# database for user
users = {
    "admin": User(id=1, username="admin", password_hash=bcrypt.generate_password_hash("password").decode('utf-8'))
}

@login_manager.user_loader
def load_user(user_id):
    for user in users.values():
        if str(user.id) == user_id:
            return user
    return None

# add login / logout route
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = users.get(username)
        if user and bcrypt.check_password_hash(user.password_hash, password):
            login_user(user)
            return redirect(url_for('dashboard'))
        else:
            return render_template('login.html', app_data=app_data, error="Invalid credentials")
    return render_template('login.html', app_data=app_data)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', app_data=app_data, user=current_user)



DEVELOPMENT_ENV  = True


app_data = {
    "name":         "Template for a Flask Web App",
    "description":  "A basic Flask app using bootstrap for layout",
    "html_title":   "Template for a Flask Web App",
    "project_name": "ReviewChew",
    "keywords":     "flask, webapp, template, basic"
}

# Placeholder function for database search (empty for now)
def search_database(query):
    # This is where you will connect to the database in the future
    # For now, it's empty
    return []

@app.route('/', methods=['GET', 'POST'])
def index():
    query = ''
    results = []  # This will hold search results after query processing
    if request.method == 'POST':
        query = request.form['search_query']  # Get search query from form
        # Later, you would connect to the database and fetch results here
        results = search_database(query)

    return render_template('index.html', app_data=app_data, query=query, results=results)


@app.route('/about')
def about():
    return render_template('about.html', app_data=app_data)


@app.route('/service')
def service():
    return render_template('service.html', app_data=app_data)


@app.route('/contact')
def contact():
    return render_template('contact.html', app_data=app_data)


if __name__ == '__main__':
    app.run(debug=DEVELOPMENT_ENV)