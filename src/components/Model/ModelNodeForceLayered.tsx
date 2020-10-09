import * as React from "react"
import * as d3 from "d3"
import axios from "axios"
import { all_targets as viralTargets } from 'data/virus.json'

import { INode, ILink } from 'types'

import Worker from 'workers'
const instance = new Worker();

interface Props {
    height: number,
    width: number,
    offsetX: number,
    // netName: string,
    selectedDrugID: string,
    maxPathLen: number,
    onlyExp: boolean,
}
interface IDrugPath {
    [id: string]: {
        drugID: string,
        paths: string[][],
        edges: [string, string][],
        targets: string[]
    }
}

interface State {
    nodes: INode[],
    links: ILink[],
    isCalculating: boolean,
}

interface IExpNodes {
    [netName: string]: { [drugID: string]: string[] }
}

export default class ModelNodeForce extends React.Component<Props, State>{
    public padding = 10; RADIUS = 8; drugPaths: IDrugPath = {}; expNodes: IExpNodes = {}
    drugTargetLinkWidth = 70; // width to draw links between drug target proteins
    constructor(props: Props) {
        super(props)
        this.state = {
            nodes: [],
            links: [],
            isCalculating: true
        }

        // const graphWorker = new Worker("../workers/graphWorker.ts");
    }
    async getDrugPaths(): Promise<IDrugPath> {
        const drugJson = './data/drug_graph_top50_len4.json'
        let res = await axios.get(drugJson)
        this.drugPaths = res.data
        return res.data
    }

    async getDrugExp(): Promise<IExpNodes> {
        const drugJson = './data/drug_onlyexp_top50.json'
        let res = await axios.get(drugJson)
        this.expNodes = res.data
        return res.data
    }
    async calculateLayout() {
        if (this.state.isCalculating===false){
            this.setState({isCalculating:true})
        }
        

        let { selectedDrugID, offsetX, width, height, maxPathLen, onlyExp } = this.props
        if (Object.keys(this.expNodes).length===0){
            await this.getDrugExp()
        }
        if (Object.keys(this.drugPaths).length===0){
            await this.getDrugPaths()
        }

        let {drugPaths, expNodes} = this



        if (selectedDrugID === '' || Object.keys(drugPaths).length === 0 || Object.keys(expNodes).length === 0) return <g className='path no' />


        let { targets: drugTargets, paths } = drugPaths[selectedDrugID]


        paths = paths.filter(path => path.length <= maxPathLen + 1)

        if (onlyExp) {
            paths = paths.filter(path => {
                let flag = false
                if (path.length === 2) {
                    flag = this.isExp(path[0]) || this.isExp(path[1])
                } else {
                    // if path.length>2, the path needs to include an explanation node apart from the source & target node
                    for (let i = 1; i < path.length - 1; i++) {
                        let node = path[i]
                        if (this.isExp(node)) {
                            flag = true
                            i = path.length
                        }
                    }
                }

                return flag
            })
        }

        paths.sort((a, b) => a.length - b.length)

        let yViralTargetScake = d3.scalePoint()
            .domain(viralTargets)
            .range([this.padding, height - 2 * this.padding])

        let yDrugTargetScale = d3.scalePoint()
            .domain(drugTargets)
            .range([this.padding + 0.1 * height, 0.9 * height - 2 * this.padding])

        let nodeIDs: string[] = viralTargets.concat(
            drugTargets.filter(d => !viralTargets.includes(d))
        )

        let nodes: INode[] = nodeIDs
            .map((d, i) => {
                let fx: number = 0, fy: number = 0;
                if (i < viralTargets.length) {
                    fx = offsetX
                    fy = yViralTargetScake(d) || 0

                } else {

                    fx = offsetX + width - this.drugTargetLinkWidth
                    fy = yDrugTargetScale(d) || 0
                }
                return { id: d, fx, fy }
            }
            )


        paths.forEach(path => {
            for (let i = 0; i < path.length; i++) {
                let node = path[i].toString()
                if (!nodeIDs.includes(node)) {
                    nodeIDs.push(node)
                    nodes.push({
                        id: node,
                        fx: offsetX + (width - this.drugTargetLinkWidth) / (maxPathLen) * i
                    })
                }
            }
        })

        let links: ILink[] = []
        paths.forEach(path => {
            for (let i = 0; i < path.length - 1; i++) {
                let source = path[i].toString(), target = path[i + 1].toString()
                if (drugTargets.includes(source) && drugTargets.includes(target)) {
                    continue
                }
                links.push({ source, target })
            }
        })

        let respond = await instance.calculateLayout({ nodes, links }, this.RADIUS)
        nodes = respond.nodes
        links = respond.links


        this.setState({
            isCalculating: false,
            nodes,
            links
        })
    }

    drawNodes() {
        let { nodes} = this.state

        let { selectedDrugID } = this.props
        let { drugPaths } = this

        let { targets: drugTargets } = drugPaths[selectedDrugID]


        let svgNodes = nodes
            // .filter(d => (!viralTargets.includes(d.id)) || (viralTargets.includes(d.id) && drugTargets.includes(d.id)))
            .map((node, i) => {
                let r = (viralTargets.includes(node.id) && !drugTargets.includes(node.id)) ? '0' : this.RADIUS
                let fill = drugTargets.includes(node.id) ? '#1890ff' : (viralTargets.includes(node.id) ? 'gray' : 'white')
                let arcs = this.getExpNetIdx(node.id).map(d => {
                    return <path key={`arc_${d}`} d={this.pieGenerator(d)!} fill="red" />
                })
                return <g key={`node_${node.id}`} transform={`translate(${node.x}, ${node.y})`}>
                    <circle r={r} fill={fill} />
                    {arcs}
                </g>
            })
        return <g className="nodes" >{svgNodes}</g>
    }

    drawLinks() {
        let { links } = this.state

        let svgLinks: JSX.Element[] = links.map((link) => {
            let { source, target }: any = link
            return <path key={`${source.id!}->${target.id}`}
                className={`${source.id!}->${target.id}`}
                d={this.linkGene(link)}
                fill="none"
                stroke="black"
                strokeWidth="1"
                opacity="0.4"
            />
        })


        return <g className="links" style={{opacity:"0.4"}}>{svgLinks}</g>
    }


    pieGenerator(idx: number) {
        let data = [1, 1, 1, 1];

        let arcData = d3.pie()(data)
        // reorder arc data, start from -0.5pi
        let last = arcData.pop() as d3.PieArcDatum<number>
        arcData.unshift(last)

        let pieGene = d3.arc<any, any>()
            .innerRadius(0)
            .outerRadius(this.RADIUS)

        let pies = arcData.map(arc => pieGene(arc))

        return pies[idx]
    }
    getExpNetIdx(nodeID: string): number[] {
        let netNames = ['A1', 'A2', 'A3', 'A4']
        let { selectedDrugID } = this.props
        let idxs: number[] = []
        netNames.forEach((netName, idx) => {
            if (this.expNodes[netName][selectedDrugID].includes(nodeID)) {
                idxs.push(idx)
            }
        })
        return idxs
    }

    isExp(nodeID: string): boolean {
        return this.getExpNetIdx(nodeID).length > 0
    }

    linkGene(linkData: any): string {
        let { source: target, target: source } = linkData
        let pathGene = d3.path()
        pathGene.moveTo(source.x, source.y);
        // pathGene.quadraticCurveTo(source.x, target.y, target.x, target.y);
        let midX = source.x - (source.x - target.x) / 4
        pathGene.bezierCurveTo(midX, source.y, midX, target.y, target.x, target.y);
        return pathGene.toString()
    }


    drugTargetConnections() {
        let { selectedDrugID, height, width, offsetX } = this.props
        let { drugPaths, expNodes } = this
        if (selectedDrugID === '' || Object.keys(drugPaths).length === 0 || Object.keys(expNodes).length === 0) return <g className='path no' />


        let { edges, targets: drugTargets } = drugPaths[selectedDrugID]



        let targetEdges = edges
            .filter(edge => (drugTargets.includes(edge[0]) && drugTargets.includes(edge[1])))


        let yDrugTargetScale = d3.scalePoint()
            .domain(drugTargets.map(d => d.toString()))
            .range([this.padding + 0.1 * height, 0.9 * height - 2 * this.padding])

        let links = targetEdges.map((link, i) => {
            let pathGene = d3.path()
            let proteinA = link[0], proteinB = link[1], x = width + offsetX - this.drugTargetLinkWidth,
                yA = yDrugTargetScale(proteinA.toString()) || 0, yB = yDrugTargetScale(proteinB.toString()) || 0
            pathGene.moveTo(x, Math.min(yA, yB))
            let deltaY = Math.abs(yB - yA),
                centerY = (yB + yA) / 2
            // pathGene.arcTo(x, yTargetScale(proteinB.toString())||0, x-20, yTargetScale(proteinB.toString())||0, r)
            pathGene.arc(x - deltaY / 2, centerY, deltaY / Math.sqrt(2), -0.25 * Math.PI, 0.25 * Math.PI)
            return <path key={`link_${i}`} d={pathGene.toString()} fill='none' stroke='gray' opacity='0.4' xlinkTitle={`${proteinA}_${proteinB}`} />
        })

        return <g key="drugTargetLinks" className="drugTargetLinks">{links}</g>
    }

    // shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    //     let { selectedDrugID: nextSelectedDrugID } = nextProps, { selectedDrugID } = this.props, { drugPaths } = this.state
    //     if (
    //         nextSelectedDrugID === selectedDrugID &&
    //         Object.keys(drugPaths).length === Object.keys(nextState.drugPaths).length
    //         && nextProps.maxPathLen === this.props.maxPathLen
    //         // && nextProps.onlyExp === this.props.onlyExp
    //     ) {
    //         return false
    //     }
    //     return true
    // }
    componentDidMount() {
        this.calculateLayout()
    }

    componentDidUpdate(prevProps: Props){
        let { selectedDrugID: prevSelectedDrugID, maxPathLen: prevMaxPathLen} = prevProps, { selectedDrugID } = this.props
            if (
                prevSelectedDrugID !== selectedDrugID || prevMaxPathLen !== this.props.maxPathLen
                // && nextProps.onlyExp === this.props.onlyExp
            ) {
                
                this.calculateLayout()
            }
    }

    render() {
        let {offsetX, width, height} = this.props
        let content = this.state.isCalculating ?
            <g transform={`translate(${offsetX+width/2}, ${height/2})`}><text>loading</text></g> :
            <g>{this.drawLinks()}
                {this.drawNodes()}
                {this.drugTargetConnections()}
            </g>
        return <g className='model'>
           {content}
        </g>
    }
}