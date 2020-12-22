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
    titleHeight=36;
    margin = 10;
    padding = 10;
    drawSummary(){
        const EDGE_LENGTH = 50, NODE_WIDTH = 100, NODE_HEIGHT = 25, VERTICAL_GAP = 5
        let {metaPaths} = this.props.globalState
        let summarys = metaPaths.map((metaPath, pathIdx)=>{

            let {nodes, edges} = metaPath
            let svgNodes = nodes.map((node, nodeIdx)=>{
                let translate = `translate(${(EDGE_LENGTH+NODE_WIDTH)*nodeIdx}, ${pathIdx*(NODE_HEIGHT+VERTICAL_GAP)})`
                return (<g key={`node_${nodeIdx}`} transform={translate}>
                    <rect width={NODE_WIDTH} height={NODE_HEIGHT} fill={getNodeColor(node)}/>
                    <text textAnchor="middle" y={NODE_HEIGHT/2+6} x={NODE_WIDTH/2} fill='white'>{node}</text>
                </g>)
            })

            let svgEdges = edges.map( (edgeInfo, edgeIdx)=>{
                let translate = `translate(${NODE_WIDTH+(EDGE_LENGTH+NODE_WIDTH)*edgeIdx}, ${pathIdx*(NODE_HEIGHT+VERTICAL_GAP) + NODE_HEIGHT/2})`
                return <line transform={translate} key={`edge_${edgeIdx}`} 
                    stroke="gray"
                    x1={0} y1={0} x2={EDGE_LENGTH} y2={0}
                    />
            })
            return [svgEdges, svgNodes]
        })
        return summarys
    }
    render(){
        let {width, height} = this.props
        let svgWidth = width-2*this.padding-2*this.margin, svgHeight = height - 2*this.padding-this.titleHeight
        return <Card size='small' title='Path Matrix' 
            style={{width: width-2*this.margin, height: height, margin: `0px ${this.margin}px`}}
            bodyStyle={{padding:this.padding}}
            headStyle={{height: this.titleHeight}}
        >
            <svg width={svgWidth} height={svgHeight}>
            {this.drawSummary()}
        </svg>
        </Card>
    }
}

export default StateConsumer(PathMatrix)