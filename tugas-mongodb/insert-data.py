import json
from pymongo import MongoClient

client = MongoClient('mongodb://192.168.2.4:27017/?retryWrites=false&authSource=admin', username='mongo-admin', password='password')
db_news = client["forestfire"]
news_collection = db_news["forestfireCollection"]

cnt = 1
with open('amazon.json') as fp:
    data = fp.read()
    data_json = json.loads(data)
    for datas in data_json:
        news_collection.insert_one(datas)
        print(cnt)
        cnt=cnt+1
    
