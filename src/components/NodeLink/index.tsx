import React from 'react'
import {Card} from 'antd'

interface Props {
    width:number,
    height:number
}

export default class NodeLink extends React.Component<Props>{
    titleHeight=36;
    margin = 10;
    padding = 10;
    render(){
        let {width, height} = this.props
        let svgWidth = width-2*this.padding -2*this.margin,
        svgHeight = height-2*this.padding-this.titleHeight - 2*this.margin
        return <Card size='small' title='Node attention' 
            style={{width: width-2*this.margin, height: height-2*this.margin, margin: this.margin}}
            bodyStyle={{padding:this.padding}}
            headStyle={{height: this.titleHeight}}
        >
            <svg width={svgWidth} height={svgHeight}>
            
        </svg>
        </Card>
    }
}