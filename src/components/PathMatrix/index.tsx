import { Card } from 'antd'
import { getNodeColor } from 'helpers/color';
import React from 'react'

import {StateConsumer} from 'stores'
import { IState } from 'types';

interface Props {
    width:number,
    height:number,
    globalState: IState
}

 class PathMatrix extends React.Component<Props>{
    TITLE_HEIGHT=36;
    MARGIN = 10;
    PADDING = 10;
    EDGE_LENGTH = 100;
    NODE_WIDTH = 130;
    NODE_HEIGHT = 25; 
    VERTICAL_GAP = 5
    drawSummary(){
        let {EDGE_LENGTH, NODE_WIDTH, NODE_HEIGHT, VERTICAL_GAP} = this
        let {metaPaths} = this.props.globalState
        let summarys = metaPaths.map((metaPath, pathIdx)=>{

            let {nodes, edges} = metaPath
            let svgNodes = nodes.map((node, nodeIdx)=>{
                let translate = `translate(${(EDGE_LENGTH+NODE_WIDTH)*nodeIdx}, ${pathIdx*(NODE_HEIGHT+VERTICAL_GAP)})`
                return (<g key={`node_${nodeIdx}`} transform={translate}>
                    <rect width={NODE_WIDTH} height={NODE_HEIGHT} fill={getNodeColor(node)} rx={10}/>
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
        return summarys
    }
    drawDummy(){
        let {EDGE_LENGTH, NODE_WIDTH, NODE_HEIGHT, VERTICAL_GAP} = this
        
        let {metaPaths} = this.props.globalState
        let summarys = metaPaths.map((metaPath, pathIdx)=>{

            let {nodes, edges} = metaPath
            let svgNodes = nodes.map((node, nodeIdx)=>{
                let translate = `translate(${(EDGE_LENGTH+NODE_WIDTH)*nodeIdx}, ${pathIdx*(NODE_HEIGHT+VERTICAL_GAP)})`
                return (<g key={`node_${nodeIdx}`} transform={translate}>
                    <rect width={NODE_WIDTH} height={NODE_HEIGHT} fill={getNodeColor(node)} rx={10}/>
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
        return summarys
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
            {this.drawSummary()}
        </svg>
        </Card>
    }
}

export default StateConsumer(PathMatrix)