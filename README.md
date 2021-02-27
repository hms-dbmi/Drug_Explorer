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
python setup.py
```

go to `localhost:7777` in your web browser

# run in development mode

run the front end
```npm start
```

run the python server
```
conda activate dgl
python setup.py
```

go to `localhost:3006` in your web browser
