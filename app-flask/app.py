#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from flask import Flask, render_template, request

DEVELOPMENT_ENV  = True

app = Flask(__name__)

app_data = {
    "name":         "Template for a Flask Web App",
    "description":  "A basic Flask app using bootstrap for layout",
    "html_title":   "Template for a Flask Web App",dd
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


@app.route('/gallery')
def gallery():
    return render_template('gallery.html', app_data=app_data)


@app.route('/service')
def service():
    return render_template('service.html', app_data=app_data)


@app.route('/contact')
def contact():
    return render_template('contact.html', app_data=app_data)


if __name__ == '__main__':
    app.run(debug=DEVELOPMENT_ENV)