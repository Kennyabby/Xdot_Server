from flask import (Flask, jsonify, request)
from flask_cors import CORS, cross_origin
app = Flask(__name__)
CORS(app)
@app.route("/", methods=['POST'])
def hello():
    return "Hello World!"


@app.route("/show_success", methods=['POST'])
# @cross_origin(origin='localhost', headers=['Content-Type', 'Authrization'])
def show_success():
    print('got a request')
    # value = request.args
    # print(value.get('boy'),value.get('girl'))
    req = request.get_json()
    print(req)
    return jsonify({'success':req['matricNo']})
    # return jsonify({'success': "Hello World With an App!"})


app.run()