export interface INode extends d3.SimulationNodeDatum {
    id: string,
    fx?: number,
    fy?: number,
    isFocused?: boolean,
    pathIdx?:number,
}

export interface ILink {
    source: string,
    target: string,
    isFocused?: boolean,
    pathIdx?:number,
}