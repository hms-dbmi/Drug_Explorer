export interface INode extends d3.SimulationNodeDatum {
    id: string,
    fx?: number,
    fy?: number
}

export interface ILink {
    source: string,
    target: string
}