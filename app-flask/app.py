#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
from flask import Flask, render_template, request, redirect, session

DEVELOPMENT_ENV = True

app = Flask(__name__)

app.secret_key = 'dev' # placeholder for now 

app_data = {
    "name": "Template for a Flask Web App",
    "description": "A basic Flask app using bootstrap for layout",
    "html_title": "ReviewChew",
    "project_name": "ReviewChew",
    "keywords": "flask, webapp, template, basic"
}

# Function to fetch reviews from API
def search_database(keywords, stars):
    api_url = f"http://apan-api:3100/api/v1/business/getList?filter={keywords}"

    # If there's a star filter, append it to the API URL
    if stars:
        api_url += f"&stars={stars}"

    try:
        response = requests.get(api_url)

        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "result" in data:
                formatted_results = []
                for item in data["result"]:
                    formatted_results.append({
                        "name": item.get("name", "No name available"),
                        "summary": item.get("summary", "No summary available"),
                        "stars": item.get("stars", "No rating available"),
                            "uuid": item.get("uuid")
                    })
                return formatted_results
            else:
                return []
        else:
            print(f"Error: {response.status_code}")
            return []
    except requests.exceptions.RequestException as e:
        print(f"Error with the API request: {e}")
        return []


# Flask route handling
@app.route('/', methods=['GET', 'POST'])
def index():

    keywords = ''
    stars = ''
    results = []
    username = session.get('username') 

    app_data.update({
        'description': 'Let ReviewChew help you find the best restaurant reviews!'
    })

    if request.method == 'POST':
        keywords = request.form.get('keywords', '')
        stars = request.form.get('stars', '')     

        # redirect to the same page with the search query and star filter and change the URL
        return redirect('?keywords='+keywords+'&stars='+stars)   

    keywords = request.args.get('keywords', '')
    stars = request.args.get('stars', '')

    if keywords and stars:
        results = search_database(keywords, stars)  
    return render_template('index.html', keywords=keywords, results=results, stars=stars, app_data=app_data, username=username)

# Fetch the restaurant from the database by its ID (or UUID)

@app.route('/restaurant/<restaurant_uuid>', methods=['GET'])
def restaurant_details(restaurant_uuid):
    # URL of the API endpoint
    api_url = f"http://apan-api:3100/api/v1/business/getDetail/{restaurant_uuid}" 

    # return render_template('restaurant_details.html', restaurant={}, app_data=app_data)

    # Make a GET request to fetch restaurant data
    response = requests.get(api_url)
    
    if response.status_code == 200:
        # Parse the JSON data from the response
        restaurant_data = response.json()

        # Pass the data to the template
        return render_template('restaurant_details.html', data=restaurant_data["result"],  app_data=app_data)
    
    # Handle case if the restaurant is not found or API request fails
    return "Restaurant not found", 404

# Login route 
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')

        # Store the username in the session
        session['logged_in'] = True
        session['username'] = username

        # Redirect to the homepage
        return redirect('/')

    return render_template('login.html', app_data=app_data)

@app.route('/map')
def map():
    return render_template('map.html', app_data=app_data)


@app.route('/service')
def service():
    return render_template('service.html', app_data=app_data)


@app.route('/contact')
def contact():
    return render_template('contact.html', app_data=app_data)


if __name__ == '__main__':
    app.run(debug=DEVELOPMENT_ENV)
