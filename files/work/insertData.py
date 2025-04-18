# Function to fetch records from API and process them
import datetime
import os
import json

def fetch_and_store_records():

    # timestamp = time.time()
    now = datetime.datetime.now()
    file_name = now.strftime("%Y%m%d%H%M%S")
    output_path = (f"summary_{file_name}.json")
    file_data = []
    if os.path.exists(output_path):
        with open(output_path, 'r') as file:
            file_data = json.load(file)

    # Fetch records from API
    startPage = 1
    itemsPerPage = 2
    # response = http.request.get(f'http://apan-api:3100/api/v1/business/list?page={startPage}&items={itemsPerPage}&sortDir=ASC&sortBy=id')
    print('Retriving data from DB')
    response = http.request('GET', (f'http://apan-api:3100/api/v1/business/list?page={startPage}&items={itemsPerPage}&sortDir=ASC&sortBy=id'))

    if response.status == 200:
            
        # Open json to save to resonse data
        data = json.loads(response.data)
        
        print(f"New API data: {len(data['result'])} loaded.\n")
        if len(data['result']) > 0:
            print(f"First Data: {(data['result'][0])}\n")
            llm = Ollama(model="gemma3:12b", base_url="http://host.docker.internal:37869", verbose=True)

            for i, business in enumerate(data['result']):
                print(f"Summarizing.... \n")
                prompt = (
                    f"I have a restaurant raw data as json like this {business}. Please generate business summary text like this 'This Roast Coffeehouse and Wine Bar fun place with takeout options. prices are inexpensive, catering available and it has an average 4-star review and etc.. so on'. Use all the available information for the summary text and Do not add any comments. Return final summary text only."
                )
    
                response = llm.invoke(prompt)
    
                print(f"{i+1} -> Business ID {business['id']}: {response}\n")
                # Append new response
                # business.summary = response
                newData = business
                newData['summary'] = response
                file_data.append(newData)
                
                post_id = collection.insert_one(newData).inserted_id
                print('Post id: {0}\n'.format(post_id))
                # Write updated data back to the file
                with open(output_path, 'w') as file:
                    json.dump(file_data, file, indent=4, default=str)

    else:
        print(f"An error occurred: {response.status}")

from pymongo import MongoClient

# Initialize MongoDB collection
client = MongoClient("mongodb://localhost:27017/")
db = client["restaurant_review"]
collection = db["business_data"]


def loadDataAndInsertMongoDB():
    # Load data from json file
    # check summary_{file_name}.json files in backup_wl directory and load one by one and insert to MongoDB
    directory_path = "./backup_wl"
    files = os.listdir(directory_path)
   
    for file in files:
        print(f"file name: {file}")

        file_path = os.path.join(directory_path, file)
        if file != '.ipynb_checkpoints' and os.path.exists(file_path):
            with open(file_path, 'r') as data:
                records = json.load(data)
                print(f"file length: {len(records)}")
                # for record in records:
                #     # Check if the record already exists in the database
                #     existing_record = collection.find_one({"uuid": record["uuid"]})
                #     if not existing_record:
                #         collection.insert_one(data)

loadDataAndInsertMongoDB()

