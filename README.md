# code structure
- drug_server/ includes the python files to access backend ML models
- src/ includes the typescript files to run the front-end visualization

# install dependencies
npm@6.14.5
python@3.7

front-end dependencies
```
npm install
```

back-end server dependencies
```
conda create --name dgl --file server/requirements.txt
```

# run in production mode

build front end
```
npm run build
```

run the python server
```
conda activate dgl
python drug_server/application.py
```

go to `localhost:8001` in your web browser

# run in development mode

run the front end
```npm start
```

run the python server
```
conda activate dgl
python drug_server/application.py
```

go to `localhost:3006` in your web browser
