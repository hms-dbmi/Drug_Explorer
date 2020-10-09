import * as React from "react"
import * as d3 from "d3"

interface Props{
    height: number,
    width: number,
    offsetX: number,
    offsetY: number,
}

interface State{
    diseases: {
        [diseaseID:string]:IDisease
    }
}

interface IDisease{
    "disease": string,
    "diseaseID": string,
    "proteins": string[],
    "drugs": string[]
}

export default class Diseases extends React.Component<Props, State>{
    
    render(){
        let {offsetX, offsetY, width, height} = this.props
        return <g className="disaseNodes" transform={`translate(${offsetX}, ${offsetY})`}>
            <rect width={width} height={height} fill="none" style={{stroke:"gray", strokeDasharray:"4" }}/>
            <text y={20} x={5}>other diseases</text>
            </g>
    }
}