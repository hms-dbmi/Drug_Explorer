import * as React from "react"
import * as d3 from "d3"
import axios from "axios"
import { all_targets as viralTargets } from 'data/virus.json'
import { path } from "d3";

interface Props {
    height: number,
    width: number,
    offsetX: number,
    netName: string,
    selectedDrugID: string
}
interface DrugPath {
    [id: string]: {
        drugID: string,
        paths: string[][],
        edges: [string, string][],
        targets: string[]
    }
}

interface State {
    drugPaths: DrugPath,
    expNodes: {
        [netName: string]: { [drugID: string]: number[] }
    }
}

interface INode extends d3.SimulationNodeDatum {
    id: string,
    fx?: number,
    fy?: number
}

interface ILink {
    source: string,
    target: string
}

export default class ModelNodeForce extends React.Component<Props, State>{
    public padding = 10; RADIUS = 8;
    constructor(props:Props){
        super(props)
        this.state={
            drugPaths:{},
            expNodes:{}
        }
    }
    getDrugPaths() {
        const drugJson = './data/drug_graph_top50_len3.json'
        axios.get(drugJson)
            .then(res => {
                let response = res.data

                this.setState({
                    drugPaths: response
                })
            })
    }

    getDrugExp() {
        const drugJson = './data/drug_onlyexp_top50.json'
        axios.get(drugJson)
            .then(res => {
                let response = res.data

                this.setState({
                    expNodes: response
                })
            })
    }
    componentDidMount() {
        this.getDrugPaths()
        this.getDrugExp()
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
    drawDrugPath() {
        let { selectedDrugID, offsetX, width, height, netName } = this.props
        let {drugPaths, expNodes} = this.state
        if (selectedDrugID == '' || Object.keys(drugPaths).length==0 || Object.keys(expNodes).length==0) return <g className='path no' />

        
        let { edges, targets: drugTargets, paths } = drugPaths[selectedDrugID],
            nodes: INode[] = Array.from(new Set(edges.flat())).map(d => { return { id: d } }),
            links: ILink[] = edges.map(edge => { return { source: edge[0].toString(), target: edge[1] } })

        console.info('number of nodes: ', nodes.length)
        console.info('number of edges: ', edges.length)       

        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i],
                drugIdx = drugTargets.indexOf(node.id),
                viralIdx = viralTargets.indexOf(parseInt(node.id))
            if (viralIdx > -1) {
                node.fy = height / viralTargets.length * viralIdx
                node.fx = offsetX
            }
            else if (drugIdx > -1) {
                node.fy = 0.9 * height / drugTargets.length * (drugIdx + 1)
                node.fx = offsetX + width
            }

        }

        d3.select('g.drugGraph').remove()
        let g = d3.select('g.model')
            .append('g')
            .attr('class', 'drugGraph')

        let simulation = d3.forceSimulation<INode, ILink>()
            .force("charge", 
                d3.forceManyBody<INode>()
                .strength(-180)
            )
            .force("link",
                d3.forceLink<INode, ILink>()
                    .id(d => d.id)
                    .distance(30)
                    .strength(1)
            )
            .force('collision', d3.forceCollide().radius(this.RADIUS*4))

        let svgLinks: any = g.append('g')
            .attr("stroke", "#333")
            .style("opacity", 0.2)
            .selectAll('line')


        // const isExpNode = (nodeID:number)=>{
        //     if ( this.state.expNodes[netName] == undefined) return false
        //     return this.state.expNodes[netName][selectedDrugID].includes(nodeID)
        // }

        const getExpNetIdx = (nodeID: number): number[] => {
            let netNames = ['A1', 'A2', 'A3', 'A4']
            let idxs: number[] = []
            netNames.forEach((netName, idx) => {
                if (this.state.expNodes[netName][selectedDrugID].includes(nodeID)) {
                    idxs.push(idx)
                }
            })
            return idxs
        }


        // let svgNodes = g.append('g')
        //     .attr('class', 'nodes')
        //     .selectAll('circle.node')
        //     .data(nodes, (d: any) => d.id)
        //     .join(
        //         (enter: any) => enter.append("circle")
        //             .attr("r", (d: any) => viralTargets.includes(parseInt(d.id)) ? '1' : this.RADIUS)
        //             .attr("fill", (d: any) => drugTargets.includes(d.id) ? '#1890ff' : 'white')
        //             .attr('stroke', 'gray')
        //     )

        let svgNodes = g.append('g')
            .attr('class', 'nodes')
            .selectAll('g.nodeGroup')
            .data(nodes, (d: any) => d.id)
            .join(
                (enter: any) => enter.append("g")
                    .attr('class', 'nodeGroup')
                    .attr('cursor', 'pointer')
            )
        
        svgNodes.append('title')
            .text((d:INode)=>`entrez_id:${d.id}`)
    

        svgNodes.append('circle')
            .attr("r", (d: INode) => viralTargets.includes(parseInt(d.id)) ? '1' : this.RADIUS)
            .attr("fill", (d: INode) => drugTargets.includes(d.id) ? '#1890ff' : 'white')
            .attr('stroke', 'gray')

        

        svgNodes
        .selectAll('path.arc')
        .data((d:any)=>getExpNetIdx(parseInt(d.id)))
        .join(
            (enter: any) => enter.append("path")
                .attr('class', (d:number)=>`arc ${d}`)
                .attr('d', (d:number)=>this.pieGenerator(d))
                .attr('fill', 'red')
        )
        // .attr("r", (d: any) => viralTargets.includes(parseInt(d.id)) ? '1' : this.RADIUS)
        //     .attr("fill", (d: any) => drugTargets.includes(d.id) ? '#1890ff' : 'red')
        //     .attr('stroke', 'gray')
        // .attr('d', this.pieGenerator())

        function ticked() {
            // svgNodes.attr("cx", (d: any) => d.x)
            //     .attr("cy", (d: any) => d.y)
            svgNodes.attr("transform", d => `translate(${d.x}, ${d.y})`);

            svgLinks.attr("x1", (d: any) => d.source.x)
                .attr("y1", (d: any) => d.source.y)
                .attr("x2", (d: any) => d.target.x)
                .attr("y2", (d: any) => d.target.y);
        }

        svgLinks = svgLinks
            .data(links, (d: any) => [d.source, d.target])
            .join("line");

        simulation.nodes(nodes);
        simulation.force<d3.ForceLink<INode, ILink>>("link")!.links(links);
        simulation.on("tick", ticked);
    }

    render() {
        let {offsetX, height, width} = this.props
        let legendW = 100
        return <g className='model'>
            <g className="legend" transform={`translate(${offsetX+width-legendW}, ${height-legendW})`}>
            <foreignObject width={legendW} height={legendW} >
                <img src='./assets/node_legend.png' width={legendW} />
            </foreignObject>
            </g>

            {this.drawDrugPath()}
        </g>
    }
}