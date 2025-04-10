#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
from flask import Flask, render_template, request

DEVELOPMENT_ENV = True

app = Flask(__name__)

app_data = {
    "name": "Template for a Flask Web App",
    "description": "A basic Flask app using bootstrap for layout",
    "html_title": "ReviewChew",
    "project_name": "ReviewChew",
    "keywords": "flask, webapp, template, basic"
}

# Function to fetch reviews from API
def search_database(query, star_filter):
    api_url = f"http://localhost:3100/api/v1/business/getList?filter={query}"

    # If there's a star filter, append it to the API URL
    if star_filter:
        api_url += f"&stars={star_filter}"

    try:
        response = requests.get(api_url)

        if response.status_code == 200:
            data = response.json()
            if data.get("success") and "result" in data:
                formatted_results = []
                for item in data["result"]:
                    name = item.get("name", "No name available")
                    summary = item.get("summary", "No summary available")
                    stars = item.get("stars", "No rating available")
                    uuid = item.get("uuid")
                    # Filter results based on the star rating
                    if star_filter:
                        # Parse the star rating to float for comparison
                        if isinstance(stars, (int, float)) and stars >= float(star_filter):
                            formatted_results.append({
                                "name": name,
                                "summary": summary,
                                "stars": stars,
                                "uuid": uuid
                            })
                    else:
                        formatted_results.append({
                            "name": name,
                            "summary": summary,
                            "stars": stars,
                             "uuid": uuid
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
    query = ''
    star_filter = ''
    results = []

    app_data.update({
        'description': 'Let ReviewChew help you find the best restaurant reviews!'
    })

    if request.method == 'POST':
        query = request.form['search_query']
        star_filter = request.form.get('star_filter', '')  
        results = search_database(query, star_filter)  

    return render_template('index.html', query=query, results=results, app_data=app_data)

# Fetch the restaurant from the database by its ID (or UUID)

@app.route('/restaurant/<restaurant_uuid>', methods=['GET'])
def restaurant_details(restaurant_id):
    # URL of the API endpoint
    api_url = f"http://localhost:3100/api/v1/business/getList?filter={_id}" 

    # Make a GET request to fetch restaurant data
    response = requests.get(api_url)
    
    if response.status_code == 200:
        # Parse the JSON data from the response
        restaurant_data = response.json()

        # Pass the data to the template
        return render_template('restaurant_details.html', restaurant=restaurant_data)
    
    # Handle case if the restaurant is not found or API request fails
    return "Restaurant not found", 404

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
