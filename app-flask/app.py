#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import base64
from flask import Flask, render_template, request, redirect, session, jsonify
import pandas as pd
import re
import os

DEVELOPMENT_ENV = True

app = Flask(__name__)

app.secret_key = 'dev' # placeholder for now 

def getLogo():
    with open('assets/logo.png', 'rb') as f:
        logo_base64 = base64.b64encode(f.read()).decode('utf-8')
        return logo_base64
    
def getAvatar(path = 'assets/avatar.png'):

    with open(path, 'rb') as f:
        avatar_base64 = base64.b64encode(f.read()).decode('utf-8')
        return avatar_base64

    return ''

def getLoginSession(username, email):
    pass


app_data = {
    "name": "Template for a Flask Web App",
    "description": "A basic Flask app using bootstrap for layout",
    "html_title": "ReviewChew",
    "project_name": "ReviewChew",
    "keywords": "flask, webapp, template, basic",
    "logo": getLogo(),
    "token": "",
    "name": "",
    "avatar_image": getAvatar()
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
        app_data.update({
            'error': ""
        })
            
        password = request.form.get('password')
        email = request.form.get('email')

        api_url = f"http://apan-api:3100/api/v1/auth/login" 

        # return render_template('restaurant_details.html', restaurant={}, app_data=app_data)

        # Prepare the payload for the POST request
        payload = {
            "email": email,
            "password": password
        }

        # Make a POST request to the login API
        try:
            response = requests.post(api_url, json=payload)

            # Check if the response is successful
            if response.status_code == 200:
                data = response.json()
                if data.get("success"):
                    # Store the user session details
                    session['logged_in'] = True
                    session['email'] = email
                    app_data.update({
                        'token': data.get("authToken"),
                        'name': data.get("name"),
                        "avatar_image": getAvatar('assets/avatar_'+str(data.get("id")%6)+'.png')
                    })

                return redirect('/')
            else:
                return render_template('login.html', app_data=app_data, error=response.json().get("message", "Invalid credentials"))
        
        except requests.exceptions.RequestException as e:
            # Handle request exception
            return render_template('login.html', app_data=app_data, error="An error occurred. Please try again.")

    return render_template('login.html', app_data=app_data)


# Logout route 
@app.route('/logout', methods=['GET', 'POST'])
def logout():
    app_data.update({
        "token": "",
        "name": "",
        "avatar_image": getAvatar()
    })

    # redirect to the homepage
    return redirect('/')


# Show API key route
@app.route('/api-key', methods=['GET'])
def showApiKey():

    token = app_data['token']
    key = token.split('.')[1] if token else "No API key available"
    return render_template('apikey.html', key=key, app_data=app_data)


# Registartion route 
@app.route('/registration', methods=['GET', 'POST'])
def registration():
    if request.method == 'POST':
        firstName = request.form.get('first_name')
        lastName = request.form.get('last_name')
        email = request.form.get('email')
        password = request.form.get('password')

        api_url = f"http://apan-api:3100/api/v1/auth/register" 

        # Prepare the payload for the POST request
        payload = {
            "email": email,
            "password": password,
            "firstName": firstName,
            "lastName": lastName,
        }

        # Make a POST request to the login API
        try:
            response = requests.post(api_url, json=payload)

            # Check if the response is successful
            if response.status_code == 200:
                return redirect('/login')
            else:
                return render_template('registration.html', app_data=app_data, error=response.json().get("message", "Invalid credentials"))
        
        except requests.exceptions.RequestException as e:
            # Handle request exception
            return render_template('registration.html', app_data=app_data, error="An error occurred. Please try again.")

    return render_template('registration.html', app_data=app_data)

# Map
# Loading in business_df 

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # This will get the current directory of the script

@app.route('/map')
def map_view():
    # states = sorted(df['state'].dropna().unique().tolist())

    states = []
    api_url = f"http://apan-api:3100/api/v1/business/getStateList" 

        # Prepare the payload for the POST request

    # Make a POST request to the login API
    try:
        response = requests.get(api_url)
        if response.status_code == 200:
            states = response.json().get("result", [])
    except requests.exceptions.RequestException as e:
        # Handle request exception
        return render_template('map.html', states=states, app_data=app_data, error="An error occurred for available states. Please try again.")


    return render_template('map.html', states=states, app_data=app_data)

@app.route('/service')
def service():
    return render_template('service.html', app_data=app_data)


@app.route('/contact')
def contact():

    team = {
        'kibaek' : getAvatar('assets/team/kibaek.jpeg'),
        'wendy' : getAvatar('assets/team/wendy.jpeg'),
        'arden' : getAvatar('assets/team/arden.jpeg'),
        'sunny' : getAvatar('assets/team/sunny.jpeg'),
        'garima' : getAvatar('assets/team/garima.jpeg'),
    }

    return render_template('contact.html', app_data=app_data, team = team)


if __name__ == '__main__':
    app.run(debug=DEVELOPMENT_ENV)
