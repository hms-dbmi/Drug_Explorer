import * as React from "react"
import * as d3 from "d3"
import axios from "axios"

interface Props {
    height: number,
    width: number,
    selectedDrugID:string
}

interface State {
    
}

export default class Model extends React.Component<Props, State>{
    getDrugPaths(){
        const drugJson = './data/drug_graph.json'
        axios.get(drugJson)
            .then(res => {
                let response = res.data

                Object.keys(response).forEach(drugID=>{
                    console.info(drugID, response[drugID].paths.length)
                })
                console.info(response)
            })
    }
    componentDidMount(){
        this.getDrugPaths()
    }
    render(){
        return <div className='model'>
            Model
            </div>
    }
}