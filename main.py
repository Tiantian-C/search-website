from flask import Flask,request
import requests


app = Flask(__name__)

@app.route("/")
def homepage():
    return app.send_static_file('html/index.html')

@app.route('/search', methods=["GET"])
def searchlist():
   keyword = request.args.get("keyword")
   segmentId = request.args.get("segmentId")
   radius = request.args.get("radius")
   geoPoint = request.args.get("geoPoint")
   
   url = 'https://app.ticketmaster.com/discovery/v2/events.json?apikey=XShKfsrq8G9FAG1gtn9qFnE3r1NIp7fU&keyword=' + keyword + '&segmentId=' + segmentId + '&radius=' + radius + '&unit=miles&geoPoint=' + geoPoint 
   header = {'Content-Type': 'application/json','Authorization':'Bearer Dbaadfeadfaa3dasf3231dasf'}
   response = requests.get(url, headers = header).json()
   return response

@app.route('/detail', methods=["GET"])
def eventsdetail():
   id = request.args.get("id")
   url = 'https://app.ticketmaster.com/discovery/v2/events/'+ id +'?apikey=XShKfsrq8G9FAG1gtn9qFnE3r1NIp7fU'
   header = {'Content-Type': 'application/json','Authorization':'Bearer Dbaadfeadfaa3dasf3231dasf'}
   response = requests.get(url, headers = header).json()
   return response

@app.route('/venue', methods=["GET"])
def venueshow():
   keyword = request.args.get("keyword")
   url = 'https://app.ticketmaster.com/discovery/v2/venues?apikey=XShKfsrq8G9FAG1gtn9qFnE3r1NIp7fU&keyword=' + keyword
   header = {'Content-Type': 'application/json','Authorization':'Bearer Dbaadfeadfaa3dasf3231dasf'}
   response = requests.get(url, headers = header).json()
   return response

if __name__ == '__main__':
    app.run(debug = True ,port = 3000)
    
