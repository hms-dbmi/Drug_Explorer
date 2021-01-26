import { Card } from 'antd'
import { path } from 'd3';
import { getNodeColor } from 'helpers/color';
import { off } from 'process';
import React from 'react'

import {StateConsumer} from 'stores'
import { IState } from 'types';

interface Props {
    width:number,
    height:number,
    globalState: IState
}

interface State {
    expand: boolean[]
}

 class PathMatrix extends React.Component<Props, State>{
    TITLE_HEIGHT=36;
    MARGIN = 10;
    PADDING = 10;
    EDGE_LENGTH = 100;
    NODE_WIDTH = 130;
    NODE_HEIGHT = 25; 
    VERTICAL_GAP = 5

    constructor(prop:Props){
        super(prop)
        this.state={
            expand: [false, false, false, false]
        }
    }
    drawSummary(){
        let {EDGE_LENGTH, NODE_WIDTH, NODE_HEIGHT, VERTICAL_GAP} = this
        let {metaPaths, edgeThreshold} = this.props.globalState
        let summary = metaPaths
        .filter((metaPath)=>{
            return Math.min(...metaPath.edges.map(e=>e.score))>edgeThreshold
        })    
        .map((metaPath, pathIdx)=>{

            let {nodes, edges} = metaPath
            let svgNodes = nodes.map((node, nodeIdx)=>{
                let translate = `translate(${(EDGE_LENGTH+NODE_WIDTH)*nodeIdx}, ${pathIdx*(NODE_HEIGHT+VERTICAL_GAP)})`
                return (<g key={`node_${nodeIdx}`} transform={translate}>
                    <rect width={NODE_WIDTH} height={NODE_HEIGHT} fill={getNodeColor(node)} rx={this.NODE_HEIGHT/2}/>
                    <text textAnchor="middle" y={NODE_HEIGHT/2+6} x={NODE_WIDTH/2} fill='white'>{node}</text>
                </g>)
            })

            let svgEdges = edges.map( (edge, edgeIdx)=>{
                let translate = `translate(${NODE_WIDTH+(EDGE_LENGTH+NODE_WIDTH)*edgeIdx}, ${pathIdx*(NODE_HEIGHT+VERTICAL_GAP) + NODE_HEIGHT/2})`
                return <g key={`edge_${edgeIdx}`} transform={translate}  >
                    <line 
                    stroke="gray"
                    strokeWidth={edge.score * 10}
                    x1={0} y1={0} x2={EDGE_LENGTH} y2={0}
                    />
                    <text textAnchor="middle" x={EDGE_LENGTH/2} y={-5}>{edge.edgeInfo}</text>
                </g>
            })
            return [svgEdges, svgNodes]
        })
        return summary
    }
    expandType(idx:number){
        let {expand} = this.state
        if (idx<expand.length){
            expand[idx] = !expand[idx]
            this.setState({expand})
        }
    }
    drawDummy(){
        let {EDGE_LENGTH, NODE_WIDTH, NODE_HEIGHT, VERTICAL_GAP} = this

        let {nodeNameDict, selectedDrug, selectedDisease} = this.props.globalState

        if (!selectedDisease) return
        if (!selectedDrug) return

        const ICON_WIDTH = 70

        let protoTypes:string[][] = [
            ['disease', 'disease', 'effect/phenotype', 'drug'],
            ['disease', 'gene/protein', 'gene/protein','gene/protein', 'drug'],
            ['disease', 'gene/protein', 'disease', 'gene/protein', 'drug'],
        ]

        let childrenNums = [4,2,1]
        
        let offsetY = 0
        let summary = protoTypes.map((type, pathIdx)=>{
            let nodes = type.map((node, nodeIdx)=>{
                let translate = `translate(${(EDGE_LENGTH+NODE_WIDTH)*nodeIdx}, ${0})`
                return (<g key={`node_${nodeIdx}`} transform={translate}>
                    <rect width={NODE_WIDTH} height={NODE_HEIGHT} fill={getNodeColor(node)} rx={this.NODE_HEIGHT/2}/>
                    <text textAnchor="middle" y={NODE_HEIGHT/2+6} x={NODE_WIDTH/2} fill='white'>{node}</text>
                </g>)
            })
            let edges = [...Array(type.length-1)].map((_, edgeIdx)=>{
                let translate = `translate(${NODE_WIDTH+(EDGE_LENGTH+NODE_WIDTH)*edgeIdx}, ${+ NODE_HEIGHT/2})`
                return <g key={`edge_${edgeIdx}`} transform={translate}  >
                    <line 
                    stroke="gray"
                    // strokeWidth={1+Math.random() * 8}
                    strokeWidth={2}
                    x1={0} y1={0} x2={EDGE_LENGTH} y2={0}
                    />
                </g>
            })
            let currentY = offsetY
            offsetY += (NODE_HEIGHT+VERTICAL_GAP)

            let numChildren = childrenNums[pathIdx], showChildren = this.state.expand[pathIdx]
            let children = [...Array(numChildren)].map((child, childIdx)=>{
                
                let nodes = type.map((node, nodeIdx)=>{
                    let nodeName:string 
                    if (nodeIdx===0) {
                        nodeName = nodeNameDict['disease'][selectedDisease!.replace('disease_','')]
                    // }else if (nodeIdx===numChildren-1) {
                    //     nodeName = nodeNameDict['drug'][selectedDrug!.replace('drug_','')]
                    }else {
                        let possibleNames = Object.values(nodeNameDict[node])
                        nodeName = possibleNames[Math.floor(Math.random()*possibleNames.length)]
                    }

                    let translate = `translate(${(EDGE_LENGTH+NODE_WIDTH)*nodeIdx}, ${0})`
                    return (<g key={`node_${nodeIdx}`} transform={translate}>
                        <rect width={NODE_WIDTH} height={NODE_HEIGHT} fill={getNodeColor(node)} />
                        <text textAnchor="middle" y={NODE_HEIGHT/2+6} x={NODE_WIDTH/2} fill='white'>{nodeName}</text>
                    </g>)
                })
                let edges = [...Array(type.length-1)].map((_, edgeIdx)=>{
                    let translate = `translate(${NODE_WIDTH+(EDGE_LENGTH+NODE_WIDTH)*edgeIdx}, ${+ NODE_HEIGHT/2})`
                    return <g key={`edge_${edgeIdx}`} transform={translate}  >
                        <line 
                        stroke="gray"
                        strokeWidth={1+Math.random() * 8}
                        x1={0} y1={0} x2={EDGE_LENGTH} y2={0}
                        />
                    </g>
                })
                return <g key={childIdx} transform={`translate(${30 + ICON_WIDTH}, ${(NODE_HEIGHT+VERTICAL_GAP) * (1+childIdx)})`}>
                    {nodes}
                    {edges}
                </g>
            })

            if (showChildren){
                offsetY += (NODE_HEIGHT+VERTICAL_GAP) * numChildren
            }

            
            return <g key={`prototype_${pathIdx}`} transform={`translate(${0}, ${currentY })`}>
                <g className="icon">
                    <text x={10} y={NODE_HEIGHT} textAnchor="middle">{numChildren}</text>
                    <path 
                        d={
                            showChildren?
                            `M25 0 L${25+NODE_HEIGHT} 0 L${NODE_HEIGHT/2+25} ${NODE_HEIGHT} Z`
                            :`M25 0 L25 ${NODE_HEIGHT} L${NODE_HEIGHT+25} ${NODE_HEIGHT/2} Z`} 
                        fill="gray"
                        onClick={()=>this.expandType(pathIdx)}
                        cursor="pointer"
                    />
                    {showChildren?children: <g/>}
                    
                </g>
                <g className="prototype" transform={`translate(${ICON_WIDTH}, 0)`}>
                    {nodes} 
                    {edges}
                </g>
            </g>
        })
        return summary
    }
    render(){
        let {width, height} = this.props
        let svgWidth = width-2*this.PADDING-2*this.MARGIN, 
            svgOuterHeight = height - 2*this.PADDING-this.TITLE_HEIGHT,
            svgHeight = this.props.globalState.metaPaths.length * (this.NODE_HEIGHT+ this.VERTICAL_GAP)
        return <Card size='small' title='Path Matrix' 
            style={{width: width-2*this.MARGIN, height: height, margin: `0px ${this.MARGIN}px`}}
            bodyStyle={{padding:this.PADDING, height: svgOuterHeight, overflowY: "auto"}}
            headStyle={{height: this.TITLE_HEIGHT}}
        >
            <svg width={svgWidth} height={svgHeight}>
            {this.drawDummy()}
        </svg>
        </Card>
    }
}

export default StateConsumer(PathMatrix)