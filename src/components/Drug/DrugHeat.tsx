import * as React from "react"
import * as d3 from "d3"
import {cropText} from 'helpers'
import { IState, StateConsumer } from "stores"


interface Props {
    height: number,
    width: number,
    offsetX: number,
    selectedDrugID: string,
    selectDrug: (id:string)=>void,
    globalState: IState,
}

interface State {}

class DrugHeat extends React.Component<Props, State>{
    public maxRank = 50; padding = 20; labelWidth = 140; labelHeight = 14; fontSize = 10; dotR = 8
    constructor(props: Props) {
        super(props)
        this.state = {
            drugNames: [],
            drugIDs: [],
            rankList: {}
        }
    }
   
    drawRanking() {
        
        let { height, width } = this.props
        let { drugNames, drugIDs, rankList } = this.props.globalState.predictions
        if (drugNames.length===0) return

        let rankMethods = Object.keys(rankList).slice(1)
        let yScale = d3.scaleLinear()
            .domain([1, this.maxRank])
            .range([this.fontSize, height - 2 * this.padding]),

            xScale = d3.scalePoint()
                .padding(1)
                .domain(rankMethods)
                .range([this.labelWidth, width - 2 * this.padding]),
            
            colorScale = d3.scaleSequential(d3.interpolateBlues)
                .domain([this.maxRank, 1])


        let labels = drugNames.map((name, i) => {
            let isSelected = (this.props.selectedDrugID===drugIDs[i])
            return <g key={name} transform={`translate(0, ${yScale(i + 1)})`} cursor="pointer" onClick={()=>this.props.selectDrug(drugIDs[i])}>
                <rect width={this.labelWidth} height={this.labelHeight} fill={isSelected?'#1890ff':"transparent"} stroke={isSelected?'none':'gray'} />
                <text
                    // x={this.labelWidth / 2} 
                    y={this.fontSize}
                    // style={{fontSize:this.fontSize+'px'}}
                    fontSize={this.fontSize+'px'} 
                    // textAnchor="middle"
                    x="2"
                    fill={isSelected?'white':'black'}
                >
                    {cropText( name, this.fontSize, this.labelWidth)}
                </text>
            </g>
        })


        let labelGroup = <g className="labelGroup" key="lableGroup">
           
                <text
                    x={this.labelWidth / 2} 
                    fontSize={this.fontSize} textAnchor="middle"
                >
                    acRank (top {this.maxRank})
                </text>
            {labels}
        </g>

        let rankNames = rankMethods.map(rankName => {
            return <text x={xScale(rankName)} y={0} textAnchor="middle" key={rankName}>{rankName}</text>
        })

        let rankGroup = <g key="rankGroup" className="rankGroup">
            {rankNames}
        </g>

        let rankCells = rankList[rankMethods[0]].map((_, idx)=>{
            let y = yScale(idx+1) 
            let row = rankMethods.map(rankMethod=>{
                let x=xScale(rankMethod)||0, rank = rankList[rankMethod][idx], width = xScale.step()*.9, 
                    fill = rank==0? 'white': (rank>this.maxRank?'white':colorScale(rank)) // rank = 0 means the value is missing
                return <g transform={`translate(${x}, ${y})`} key={rankMethod}>
                    <rect x={-0.5*width} y={0} width={width} height={this.labelHeight} fill={fill} />
                    <text fill={rank>0.5*this.maxRank?'black':'white'} textAnchor="middle" y={this.labelHeight} fontSize={this.fontSize}>{rank>this.maxRank*10?'':rank}</text>
                </g>
            })
        return <g key={drugIDs[idx]}>{row}</g>

        })
        let cellGroup = <g className="linkGroup" key="linkGroup">
            {rankCells}
        </g>


        return [labelGroup, cellGroup, rankGroup]
    }

    
    render() {
        return <g className='drug' transform={`translate(${this.props.offsetX + this.padding}, ${this.padding})`}>
            
            {this.drawRanking()}
        </g>
    }
}

export default StateConsumer(DrugHeat)