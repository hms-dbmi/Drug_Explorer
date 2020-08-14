import * as React from "react"
import * as d3 from 'd3'
import {virus_target as virus2target, all_targets, target_links as targetLinks} from 'data/virus.json'

interface Props {
    height: number,
    width: number
}

interface VT {
    [virus:string]: number[]
}

interface State {

}

export default class Viral extends React.Component<Props, State >{
    public padding = 10; rectWidth = 100; rectHeight = 20; fontSize = 12;
    draw(){
        let {height, width} = this.props
        let virus = Object.keys(virus2target) 
        let virus_target: VT = virus2target
        virus.sort((a,b)=>{       
            return - virus_target[a].length + virus_target[b].length
        })

        let allTargets:number[] = []
        virus.forEach(v=>{
            let targets = virus_target[v]
            targets.forEach(target=>{
                if (! allTargets.includes(target) ){
                    allTargets.push(target)
                }else{
                    console.info('shared', target)
                }
            })
        })

        // let allTargets = all_targets

        let yVirusScale = d3.scalePoint()
            .domain(virus)
            .range([this.padding, height - 2* this.padding])

        let yTargetScale = d3.scalePoint()
            .domain(allTargets.map(d=>d.toString()))
            .range([this.padding, height - 2* this.padding])
        
        let virusPoints = virus.map(v=>{
            let targets = virus_target[v].map(target=>{
                return <line 
                    x1={this.rectWidth} y1= { this.rectHeight/2 + (yVirusScale(v)||0) }
                    x2={width - 2*this.padding} y2= {yTargetScale(target.toString())||0 - this.padding}
                    key={`virus${v}_target${target}`}
                    stroke="gray"
                    opacity={0.5}
                />
            })
            return (<g key={v} transform={`translate(${this.padding}, ${0})`}>
                <rect width= {this.rectWidth} height = {this.rectHeight} rx="2px" y={yVirusScale(v)} fill="none" stroke='gray'/>
                <text x={this.rectWidth/2} y={this.rectHeight/2 + this.fontSize/2 + (yVirusScale(v)||0)} textAnchor="middle" fontSize={this.fontSize}>{v}</text>
                <g className="virus2targetLinks">{targets}</g>
            </g>)
        })

        let targetPoints = allTargets.map(v=>{
            return <circle key={`target_protein_${v}`} cx={width - this.padding} cy={yTargetScale(v.toString())} r={1} fill="gray"/>
        })

        let links = targetLinks.map((link,i)=>{
            let pathGene = d3.path()
            let proteinA = link[0], proteinB = link[1], x = width - this.padding,
            yA = yTargetScale(proteinA.toString())||0, yB = yTargetScale(proteinB.toString())||0
            pathGene.moveTo(x, yA)
            let deltaY =  Math.abs( yB - yA) ,
            centerY = (yB+yA)/2 
            // pathGene.arcTo(x, yTargetScale(proteinB.toString())||0, x-20, yTargetScale(proteinB.toString())||0, r)
            pathGene.arc(x-deltaY/2, centerY, deltaY/Math.sqrt(2), -0.25*Math.PI, 0.25*Math.PI)
            return <path key={`link_${i}`} d={pathGene.toString()} fill='none' stroke='gray' opacity='0.4'/>
        })

        let virusGroup = <g className="virus" key="virus">{virusPoints}</g>,
            targetGroup = <g className="target" key="target">{targetPoints}</g>,
            linkGroup = <g className="links" key="links">{links}</g>

        return [virusGroup, targetGroup, linkGroup]

    }
    render(){
        return <g className='virus'>
            {this.draw()}
        </g>
    }
}