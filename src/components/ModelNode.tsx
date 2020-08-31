import * as React from "react"
import * as d3 from "d3"
import axios from "axios"
import { all_targets as viralTargets } from 'data/virus.json'
import { path } from "d3";

interface Props {
    height: number,
    width: number,
    offsetX: number,
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
        [netName:string]: {[drugID:string]:number[]}
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

export default class ModelNode extends React.Component<Props, State>{
    public padding = 10;
    getDrugPaths() {
        const drugJson = './data/drug_graph_top10.json'
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
    drawDrugPath() {
        let { selectedDrugID, offsetX, width, height } = this.props
        const NETNAME = 'A2'
        if (selectedDrugID == '') return <g className='path no' />
        let { edges, targets: drugTargets, paths } = this.state.drugPaths[selectedDrugID],
            nodes: INode[] = Array.from(new Set(edges.flat())).map(d => { return { id: d } }),
            links: ILink[] = edges.map(edge => { return { source: edge[0].toString(), target: edge[1] } })
        // nodes: INode[] = [
        //     { id: "a", fx:100, fy:100},
        //     { id: "b" },
        //     { id: "c" }
        // ],
        // links: ILink[] = [
        //     { source: "a", target: "b" },
        //     { source: "b", target: "c" },
        //     // { source: "c", target: "a" }
        // ]

        let allLengths = paths.map(d => d.length)

        // let lenDict: any = {}
        // allLengths.forEach(len => {
        //     if (len in lenDict) {
        //         lenDict[len] += 1
        //     } else {
        //         lenDict[len] = 1
        //     }
        // })

        console.info('number of nodes: ', nodes.length)
        console.info('number of edges: ', edges.length)
        // console.info('shortest path from drug proteins to viral targets')
        // Object.keys(lenDict).forEach(len => {
        //     console.info('  length of the shortest path is', len, lenDict[len])
        // })

        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i],
                drugIdx = drugTargets.indexOf(node.id),
                viralIdx = viralTargets.indexOf(parseInt(node.id))
            if (viralIdx > -1) {
                node.fy = height / viralTargets.length * viralIdx
                node.fx = offsetX
            }
            else if (drugIdx > -1) {
                node.fy = 0.4 * height / drugTargets.length * (drugIdx+1)
                node.fx = offsetX + width
            }

        }

        d3.select('g.drugGraph').remove()
        let g = d3.select('g.model')
            .append('g')
            .attr('class', 'drugGraph')

        let simulation = d3.forceSimulation<INode, ILink>()
            .force("charge", d3.forceManyBody<INode>().strength(-70))
            .force("link",
                d3.forceLink<INode, ILink>()
                    .id(d => d.id)
                // .distance(20)
                // .strength(1)
            )
            .force("center", d3.forceCenter<INode>(offsetX + width / 2, height * 0.6))
        // .force("x", d3.forceX())
        // .force("y", d3.forceY())

        let svgLinks: any = g.append('g')
            .attr("stroke", "gray")
            .style("opacity", 0.2)
            .selectAll('line')


        const isExpNode = (nodeID:number)=>{
            if ( this.state.expNodes[NETNAME] == undefined) return false
            return this.state.expNodes[NETNAME][selectedDrugID].includes(nodeID)
        }
        let svgNodes = g.append('g')
            .attr('class', 'nodes')
            .selectAll('circle.node')
            .data(nodes, (d: any) => d.id)
            .join(
                (enter: any) => enter.append("circle")
                    .attr("r", (d: any) => viralTargets.includes(parseInt(d.id)) ? '1' : '5')
                    .attr("fill", (d: any) => drugTargets.includes(d.id) ? '#1890ff' : (isExpNode(d.id)?'pink':'white'))
                    .attr('stroke', 'gray')
            )



        function ticked() {
            svgNodes.attr("cx", (d: any) => d.x)
                .attr("cy", (d: any) => d.y)

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

        return <g className='model'>
            Model
            {this.drawDrugPath()}
        </g>
    }
}