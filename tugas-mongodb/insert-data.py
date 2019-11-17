import json
from pymongo import MongoClient

client = MongoClient('mongodb://192.168.2.4:27017/?retryWrites=false&authSource=admin', username='mongo-admin', password='password')
db_forest = client["forestfire"]
forest_collection = db_forest["forestfireCollection"]

with open('amazon.json') as fp:
    data = fp.read()
    data_json = json.loads(data)
    for datas in data_json:
        forest_collection.insert_one(datas)
    
