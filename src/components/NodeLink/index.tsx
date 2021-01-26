import React from 'react'
import {Card, Tooltip} from 'antd'
import {StateConsumer} from 'stores'
import { IState, IAttentionTree } from 'types';
import * as d3 from 'd3'
import { getNodeColor } from 'helpers/color';
import { cropText, getTextWidth } from 'helpers';

import './index.css'
interface Props {
    width:number,
    height:number,
    globalState: IState
}

 class NodeLink extends React.Component<Props>{
    titleHeight=36;
    margin = 10;
    padding = 10;
    nodeWidth = 20
    fontSize = 14;
    labelLength = 120;

    drawNodeAttentionVertical(nodeAttention: IAttentionTree, stepHeight:number, edgeThreshold:number){
        let {nodeNameDict} = this.props.globalState

        let pruneEdge = (node:IAttentionTree, threshold:number):IAttentionTree=>{
            if (node.children.length>0){
                node = {
                    ...node,
                    children: node.children
                        .filter(d=>d.score >= threshold)
                        .map(node=>pruneEdge(node, threshold))
                }

            }
            return node
        }

        let nodeAttentionFiltered = pruneEdge(nodeAttention, edgeThreshold)
        
       
        const rootNode = d3.hierarchy(nodeAttentionFiltered);
        let root = d3.tree<IAttentionTree>().nodeSize([this.nodeWidth+this.padding, stepHeight])(rootNode)
        

        let linkGene = d3.linkVertical<any, d3.HierarchyPointLink<IAttentionTree>, any>()
            .x(d => d.x)
            .y(d => d.y)

        const links = root.links()
        .map((link, i)=>{
            return <path 
                d={linkGene(link)!} 
                className ={`link ${link.source.data.node}=>${link.target.data.node}`}
                key={`${link.source.data.node}=>${link.target.data.node}_link${i}`}
                fill="none"
                stroke="gray"
                strokeWidth={1+5*link.target.data.score}
            />
        })

        const nodes = root.descendants()
        .map((node,i)=>{
            let nodeName = node.data.node 
            let chunks = nodeName.split('_')
            let nodeTypeID = chunks[chunks.length-1]
            let nodeType = chunks.slice(0, chunks.length-1).join('_') 
            

            let nodeFullName = nodeNameDict[nodeType][nodeTypeID] 
            // let labelLength = getTextWidth(nodeTypeID, this.fontSize)
            let labelLength = 100
            let nodeShortName = cropText(nodeFullName, 12, labelLength)

            let tooltipTitle = nodeShortName.includes('..')?nodeFullName: ''

            return <Tooltip title={ tooltipTitle} key={`node${i}_${nodeName}`}>
                <g className={`${nodeName} node`}
                    transform={`translate(${node.x}, ${node.y})`}
                    cursor="pointer"
                >
                <rect height={labelLength+ 2*this.padding} width={this.nodeWidth} fill={getNodeColor(nodeType)} x={-1*this.nodeWidth/2} y={-1*labelLength/2 - this.padding}/>
                
                <text fill="white" fontSize={this.fontSize} transform={`rotate(90) translate(${-1*labelLength/2}, ${(this.nodeWidth-this.fontSize)/2})`}>
                    {nodeShortName} 
                </text>
                
            </g>
            </Tooltip>
        })
        
        return [
            <g key="links" className="links">{links}</g>,
            <g key="nodes" className="nodes">{nodes}</g>
        ]

    }
    drawNodeAttentionHorizontal(nodeAttention: IAttentionTree, stepHeight:number, edgeThreshold:number){
        let {width, height} = this.props
        let {nodeNameDict} = this.props.globalState

        let pruneEdge = (node:IAttentionTree, threshold:number):IAttentionTree=>{
            if (node.children.length>0){
                node = {
                    ...node,
                    children: node.children
                        .filter(d=>d.score >= threshold)
                        .map(node=>pruneEdge(node, threshold))
                }

            }
            return node
        }

        let nodeAttentionFiltered = pruneEdge(nodeAttention, edgeThreshold)
        
       
        const rootNode = d3.hierarchy(nodeAttentionFiltered);
        // let root = d3.tree<IAttentionTree>().nodeSize([stepHeight, this.nodeWidth+this.padding])(rootNode)
        let root = d3.tree<IAttentionTree>().nodeSize([this.nodeWidth+2, stepHeight])(rootNode)

        let linkGene = d3.linkHorizontal<any, d3.HierarchyPointLink<IAttentionTree>, any>()
            .x(d => root.data.node.includes("drug")? width/2-d.y-3*this.labelLength: d.y)
            .y(d => d.x)

            console.info(root)
        const links = root.links()
        .map((link, i)=>{
            return <path 
                d={linkGene(link)!} 
                className ={`link ${link.source.data.node}=>${link.target.data.node}`}
                key={`${link.source.data.node}=>${link.target.data.node}_link${i}`}
                fill="none"
                stroke="gray"
                strokeWidth={1+5*link.target.data.score}
            />
        })

        const nodes = root.descendants()
        .map((node,i)=>{
            let nodeName = node.data.node 
            let chunks = nodeName.split('_')
            let nodeTypeID = chunks[chunks.length-1]
            let nodeType = chunks.slice(0, chunks.length-1).join('_') 
            

            let nodeFullName = nodeNameDict[nodeType][nodeTypeID] 
            // let labelLength = getTextWidth(nodeTypeID, this.fontSize)
            let nodeShortName = cropText(nodeFullName, 12, this.labelLength)

            let tooltipTitle = nodeShortName.includes('..')?nodeFullName: ''

            return <Tooltip title={ tooltipTitle} key={`node${i}_${nodeName}`}>
                <g className={`${nodeName} node`}
                    transform={`translate(${root.data.node.includes("drug")? width/2-node.y-3*this.labelLength:node.y}, ${node.x})`}
                    cursor="pointer"
                >
                <rect width={this.labelLength+ 2*this.padding} height={this.nodeWidth} fill={getNodeColor(nodeType)} x={-1*this.labelLength/2 - this.padding} y={-this.nodeWidth/2}/>
                
                <text fill="white" fontSize={this.fontSize} transform={`translate(${-1*this.labelLength/2}, ${(this.nodeWidth-this.fontSize)/2})`}>
                    {nodeShortName} 
                </text>
                
            </g>
            </Tooltip>
        })
        
        return [
            <g key="links" className="links">{links}</g>,
            <g key="nodes" className="nodes">{nodes}</g>
        ]

    }
    drawAttentions (){
        let {attention, edgeThreshold}=this.props.globalState
        let {width, height} = this.props

        // let stepHeight = height/4
        // return Object.keys(attention).map((nodeKey:string, idx)=>{
        //     return <g className={nodeKey} key={nodeKey} transform={`translate(${width/2*idx + 1*width/5}, ${stepHeight/2})`}>
        //         {this.drawNodeAttentionVertical(attention[nodeKey], stepHeight, edgeThreshold)}
        //     </g>
        // })
        let stepHeight = width/8
        return Object.keys(attention).map((nodeKey:string, idx)=>{
            return <g className={nodeKey} key={nodeKey} transform={`translate(${width/2*idx + this.labelLength}, ${height/2})`}>
                {this.drawNodeAttentionHorizontal(attention[nodeKey], stepHeight, edgeThreshold)}
            </g>
        })
    }
    render(){
        let {width, height} = this.props
        let svgWidth = width-2*this.padding -2*this.margin,
        svgHeight = height-2*this.padding-this.titleHeight - 2*this.margin
        return <Card size='small' title='Node attention' 
            style={{width: width-2*this.margin, height: height-2*this.margin, margin: this.margin}}
            bodyStyle={{padding:this.padding}}
            headStyle={{height: this.titleHeight}}
        >
            <svg width={svgWidth} height={svgHeight} className="nodeLink">
            {this.drawAttentions()}
        </svg>
        </Card>
    }
}

export default StateConsumer(NodeLink)