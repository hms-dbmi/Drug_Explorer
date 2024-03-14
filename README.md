# A Visual Explanation Interface for GNN-based Drug Repurposing
![!interface](https://github.com/wangqianwen0418/Drug_Explorer/blob/master/imgs/interface.jpg)


**Interactive Online Demo:** <http://txgnn.org>
**Preprint:** <https://osf.io/yhdpv>

## Code Structure
- drug_server/ includes the python files to access backend ML models
- src/ includes the typescript files to run the front-end visualization

This project is developed and tested using `node@16.10.0` `python@3.8.5`

## Quick Start

Download and unzip the [quickstart.zip](https://github.com/wangqianwen0418/Drug_Explorer/raw/master/drugExplorer_quickstart.zip)

```
cd drugExplorer_quickstart
```

Create virtual environment and install python dependencies
```
conda create --name dgl --file requirements.txt
```

run the python server
```
conda activate dgl
python application.py
```

go to `localhost:8002` in your web browser

## Run in Development Mode

### front end

install front-end dependencies
```
npm install
```

run the front end
```
npm start
```

### back end
back-end server dependencies
```
conda create --name dgl --file drug_server/requirements.txt
```

run the python server
```
conda activate dgl
python drug_server/application.py
```

go to `localhost:3006` in your web browser
