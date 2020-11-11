import * as React from "react"
import * as d3 from "d3"
import { IState, StateConsumer } from "stores"
import {cropText, getTextWidth} from 'helpers'
import { Tooltip } from "antd";
import { link } from "fs";
import { color } from "d3";

interface Props {
    height: number,
    width: number,
    offsetX: number,
    selectedDrugID: string,
    selectDrug: (id:string)=>void,
    globalState: IState,
}

interface State {
}

class DrugDR extends React.Component<Props, State>{
    public padding = 20; labelWidth = 80; labelHeight = 18; fontSize = 12; dotR=4
    
    
    drawRanking() {
        let {globalState, height, width} = this.props 
        let {maxRank} = globalState
        let {embeddings, drugIDs, drugNames, embeddingRef} = globalState.predictions
        let xScale = d3.scaleLinear()
            .range([this.padding, width - this.padding - this.labelWidth])
            .domain(d3.extent(embeddings.map(d=>d.value[0])) as [number, number])

        let yScale = d3.scaleLinear()
            .range([this.padding, height - this.padding - this.labelHeight])
            .domain(d3.extent(embeddings.map(d=>d.value[1])) as [number, number])

        let points = embeddings.map((d,i)=>{
            let drugName = d.drugName
            let textWidth = getTextWidth(drugName, this.fontSize)
            // let opacity = 0.15 + 0.85*i/rankLength
            let opacity = 1

            let textLabel = textWidth>this.labelWidth? 
                <Tooltip title={drugName}>
                    <text x={5} opacity={opacity} fontSize={this.fontSize} textAnchor="middle">
                        {cropText(drugName, this.fontSize, this.labelWidth)}
                    </text>
                    </Tooltip>
                :
                <text x={5} fontSize={this.fontSize} opacity={opacity} textAnchor="middle">{drugName}</text>

            let rectWidth = Math.min(this.labelWidth, textWidth)+10
            
            return <g className={drugIDs[i]} key={drugIDs[i]} transform={`translate(${xScale(d.value[0])}, ${yScale(d.value[1])})`} >
                
                <rect width={rectWidth} height={this.labelHeight} fill="white" stroke="gray" y={-0.5*this.labelHeight - 0.5*this.fontSize} x={-0.5*rectWidth+5}/>
                {textLabel}

            </g>
        })

        let curveGenerator = d3.line()
            .x((p) => xScale(p[0]))
            .y((p) => yScale(p[1]))
            .curve(d3.curveCardinal)

        let colors = ['#1f78b4', '#b2df8a', '#fb9a99', '#fdbf6f', '#cab2d6', ]

        let links = Object.keys(embeddingRef).slice(1,4).map((rankName, i)=>{
            let idxList = embeddingRef[rankName]
            let path = curveGenerator( idxList.map(idx=>embeddings[idx].value as [number, number]).slice(0, 20) )
            return <path key={rankName} d={path!} fill="none" stroke={colors[i]} markerStart="url(#dot)" strokeWidth="3"/>
        })



        return <g className="drugDR">
            <g className="links">
                {links}
            </g>
            {/* <g className="points">
                {points}
            </g> */}
        </g>
    }

    
    render() {

        return <g className='drug' transform={`translate(${this.props.offsetX + this.padding}, ${this.padding})`}>
            <defs>
                <marker id="dot" viewBox={`0 0 ${this.dotR*2} ${this.dotR*2}`} refX={this.dotR} refY={this.dotR} markerWidth={this.dotR+4} markerHeight={this.dotR+4} >
                    <circle cx={this.dotR}  cy={this.dotR}  r={this.dotR}  fill="gray" />
                </marker>
            </defs>
            
            {this.drawRanking()}
        </g>
    }
}

export default StateConsumer(DrugDR)