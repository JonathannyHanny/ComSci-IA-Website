Startup instructions for localhost
Open folder COMSCI-IA-WEBSITE in a IDE: preferably Visual Studio Code

-----CLIENTSIDE
new terminal
cd react-with-flask
npm install
npm run dev

-----SERVERSIDE (with venv)
new terminal
cd react-with-flask/api
venv\Scripts\flask run --no-debugger

-----SERVERSIDE (without venv)
new terminal
cd react-with-flask/api
pip install -r requirements.txt
python -m flask run --no-debugger
