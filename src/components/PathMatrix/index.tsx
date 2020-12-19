import { Card } from 'antd'
import React from 'react'

interface Props {
    width:number,
    height:number
}

export default class PathMatrix extends React.Component<Props>{
    titleHeight=36;
    margin = 10;
    padding = 10;
    render(){
        let {width, height} = this.props
        let svgWidth = width-2*this.padding-2*this.margin, svgHeight = height - 2*this.padding-this.titleHeight
        return <Card size='small' title='Path Matrix' 
            style={{width: width-2*this.margin, height: height, margin: `0px ${this.margin}px`}}
            bodyStyle={{padding:this.padding}}
            headStyle={{height: this.titleHeight}}
        >
            <svg width={svgWidth} height={svgHeight}>
            
        </svg>
        </Card>
    }
}