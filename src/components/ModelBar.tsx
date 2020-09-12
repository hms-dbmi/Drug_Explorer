import * as React from "react"
import * as d3 from "d3"
import axios from "axios"

interface Props {
    height: number,
    width: number,
    offsetX: number,
    selectedDrugID: string
}
interface DrugPathAgg {
        drugID: string,
        pathLen: {[len:string]:number},
        exp?:{
            [netName:string]: DrugExpAgg
        }
}

interface DrugExpAgg {
    expNodes: number[],
    expLen: {[len:string]:number},
    expDist: {[len:string]:number},
}

interface State {
    drugsPathAgg: DrugPathAgg[],
}


export default class ModelBar extends React.Component<Props, State>{
    public padding = 20; fontSize = 12; maxRank = 50
    getDrugPaths() {
        // const drugJson = './data/drug_path_top50.json'
        const drugJson = './data/drug_exp_top50.json'
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
    
    drawDrugPathHistogram() {
        if (!this.state) return 
        const MAX_LEN = 7
        let { selectedDrugID, offsetX, width, height } = this.props
        let drugsPathAgg = this.state.drugsPathAgg

        let maxPathNum = 0
        drugsPathAgg.forEach(drugPathAgg=>{
            Object.values(drugPathAgg.pathLen).forEach(d=>{
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
                let xPos = xScale(i), barH = (yScale(2)-yScale(1)) *0.9 /2 ,
                    pathNum = drugPathAgg.pathLen[i.toString()]||0,
                    barW = barWScale(pathNum)
                    // expBarW = barWScale(drugPathAgg.expDict2[i.toString()]||0)

                bars.push(<g key={`len_${i}`} transform={`translate(${xPos}, ${yPos})`}>
                    <rect height={barH} width={barW} fill="#1890ff" y={-barH}/>
                    {/* <rect height={barH} width={expBarW} fill="pink" /> */}
                    <text>{pathNum}</text>
                </g>)
            }
            return bars
        })

    }

    drawExpNodeSummary() {
        if (!this.state) return 
        const MAX_LEN = 7
        let { offsetX, width, height } = this.props
        let drugsPathAgg = this.state.drugsPathAgg

        let maxNodeDist = 0
        drugsPathAgg.forEach(drugPathAgg=>{
            Object.values(drugPathAgg['exp']||{}).forEach(netExp=>{
                maxNodeDist= Math.max(...Object.values(netExp['expDist']), maxNodeDist)
            })            
        })

        let yScale = d3.scaleLinear()
            .domain([1, this.maxRank])
            .range([this.fontSize + this.padding, height - this.fontSize- 2 * this.padding]),

        xScale = d3.scaleLinear()
            .domain([1, MAX_LEN])
            .range([offsetX + 30*this.padding, offsetX + width - this.padding]),

        barWScale = d3.scaleLinear()
            .domain([0, maxNodeDist])
            .range([0, (width-2*this.padding)/MAX_LEN * 0.8])

        return drugsPathAgg.map((drugPathAgg, rankIdx)=>{
            let yPos = yScale(rankIdx+1)+this.fontSize, bars = [], exp = drugPathAgg.exp||{}
            if (exp=={}){ return <g/>}
            for (let i =1; i<MAX_LEN; i++){
                let xPos = xScale(i), totalH = (yScale(2)-yScale(1)) *0.9,
                 barH= totalH/ (Object.keys(exp).length) 
                    
                    // expBarW = barWScale(drugPathAgg.expDict2[i.toString()]||0)

                let subBars =  Object.values(exp).map((exp, j)=>{
                    let nodeDist = exp.expLen[i.toString()]||0,
                    barW = barWScale(nodeDist)
                    return <g  key={j} >
                        <rect height={barH} width={barW} fill="#1890ff" y={-totalH/2 + barH*j }/>
                        <text>{nodeDist==0?nodeDist:''}</text>
                    </g>
                })

            bars.push(<g transform={`translate(${xPos}, ${yPos})`}>{subBars}</g>)

            }
            return <g key={drugPathAgg.drugID} className={`drugID_${drugPathAgg.drugID}`}>{bars}</g>
        })

    }

    render() {

        return <g className='model'>
            Model
            {this.drawDrugPathHistogram()}
            {/* {this.drawExpNodeSummary()} */}
        </g>
    }
}