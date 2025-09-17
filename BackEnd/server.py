
from flask import Flask
import datetime

x = datetime.datetime.now()
app = Flask(__name__)

@app.route('/data')
def get_time():

    return {
        'Test1':"1",
        "Test2":"2"
        }


if __name__ == '__main__':
    app.run(debug=True)
