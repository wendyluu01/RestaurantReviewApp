#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
from flask import Flask, render_template, request

DEVELOPMENT_ENV = True

app = Flask(__name__)

app_data = {
    "name": "Template for a Flask Web App",
    "description": "A basic Flask app using bootstrap for layout",
    "html_title": "Template for a Flask Web App",
    "project_name": "ReviewChew",
    "keywords": "flask, webapp, template, basic"
}

# Function to fetch reviews from API
def search_database(query):
    # API endpoint with query parameter
    api_url = f"http://localhost:3100/api/v1/review/list?filter={query}"

    try:
        # Send GET request to the API
        response = requests.get(api_url)

        # Check if the request was successful (status code 200)
        if response.status_code == 200:
            data = response.json()
            
            # Check if 'success' is True and 'result' contains reviews
            if data.get("success") and "result" in data:
                return data["result"]  # Return the reviews from the 'result' field
            else:
                return []  # No reviews found or API response not valid
        else:
            print(f"Error: {response.status_code}")
            return []  # Handle non-200 responses gracefully
    except requests.exceptions.RequestException as e:
        print(f"Error with the API request: {e}")
        return []  # Return empty list on failure

@app.route('/', methods=['GET', 'POST'])
def index():
    query = ''
    results = []  # Store search results here
    
    app_data = {
        'description': 'Let ReviewChew help you find the best restaurant reviews!'
    }

    if request.method == 'POST':
        query = request.form['search_query']
        
        # Send a GET request to the review API
        response = requests.get(f'http://localhost:3100/api/v1/review/list?filter={query}')
        
        # Parse the JSON response
        reviews_data = response.json()
        
        if reviews_data['success']:
            results = reviews_data['result']  # Store the reviews in results
        else:
            results = []

    return render_template('index.html', query=query, results=results, app_data=app_data)


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