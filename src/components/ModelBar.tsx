import * as React from "react"
import * as d3 from "d3"
import axios from "axios"
import { all_targets as viralTargets } from 'data/virus.json'
import { path } from "d3";

interface Props {
    height: number,
    width: number,
    offsetX: number,
    selectedDrugID: string
}
interface DrugPathAgg {
        drugID: string,
        pathsDict: {[len:string]:number}
}

interface State {
    drugsPathAgg: DrugPathAgg[]
}

interface INode extends d3.SimulationNodeDatum {
    id: string,
    fx?: number,
    fy?: number
}

interface ILink {
    source: string,
    target: string
}

export default class ModelBar extends React.Component<Props, State>{
    public padding = 20; fontSize = 12; maxRank = 50
    getDrugPaths() {
        const drugJson = './data/drug_path_top50.json'
        axios.get(drugJson)
            .then(res => {
                let response = res.data

                this.setState({
                    drugsPathAgg: response
                })
            })
    }
    componentDidMount() {
        this.getDrugPaths()
    }
    
    drawDrugPathSummary() {
        if (!this.state) return 
        const MAX_LEN = 7
        let { selectedDrugID, offsetX, width, height } = this.props
        let drugsPathAgg = this.state.drugsPathAgg

        let maxPathNum = 0
        drugsPathAgg.forEach(drugPathAgg=>{
            Object.values(drugPathAgg.pathsDict).forEach(d=>{
                maxPathNum = Math.max(d, maxPathNum)
            })
        })
        let yScale = d3.scaleLinear()
            .domain([1, this.maxRank])
            .range([this.fontSize + this.padding, height - this.fontSize- 2 * this.padding]),

        xScale = d3.scaleLinear()
            .domain([1, MAX_LEN])
            .range([offsetX + 30*this.padding, offsetX + width - this.padding]),

        barWScale = d3.scaleSqrt()
            .domain([0, maxPathNum])
            .range([0, (width-2*this.padding)/MAX_LEN * 0.8])

        return drugsPathAgg.map((drugPathAgg, rankIdx)=>{
            let yPos = yScale(rankIdx+1)+this.fontSize, bars = []
            for (let i =1; i<MAX_LEN; i++){
                let barW = 0, xPos = xScale(i), barH = (yScale(2)-yScale(1)) *0.9
                let pathNum = drugPathAgg.pathsDict[i.toString()]||0
                barW = barWScale(pathNum)

                bars.push(<g key={`len_${i}`} transform={`translate(${xPos}, ${yPos})`}>
                    <rect height={barH} width={barW} fill="#1890ff" y={-0.5*barH}/>
                    <text>{pathNum}</text>
                </g>)
            }
            return bars
        })

    }

    render() {

        return <g className='model'>
            Model
            {this.drawDrugPathSummary()}
        </g>
    }
}