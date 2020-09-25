import * as React from "react"
import * as d3 from "d3"
import axios from "axios"
import { all_targets as viralTargets } from 'data/virus.json'

// import Dagre from 'lib/@types/dagre/'
// import dagre from 'lib/dagre.js';
import * as dagre from 'dagre';

// console.info('dagre', dagre)

interface Props {
    height: number,
    width: number,
    offsetX: number,
    netName: string,
    selectedDrugID: string,
    maxPathLen: number,
    onlyExp: boolean,
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
        [netName: string]: { [drugID: string]: string[] }
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

export default class ModelNodeLayered extends React.Component<Props, State>{
    public padding = 10;
    constructor(props: Props) {
        super(props)
        this.state = {
            drugPaths: {},
            expNodes: {}
        }
    }
    getDrugPaths() {
        const drugJson = './data/drug_graph_top50.json'
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

    getExpNetIdx(nodeID: string): number[] {
        let netNames = ['A1', 'A2', 'A3', 'A4']
        let { selectedDrugID } = this.props
        let idxs: number[] = []
        netNames.forEach((netName, idx) => {
            if (this.state.expNodes[netName][selectedDrugID].includes(nodeID)) {
                idxs.push(idx)
            }
        })
        return idxs
    }


    isExp(nodeID: string): boolean {
        return this.getExpNetIdx(nodeID).length > 0
    }

    drawPaths() {
        const nodeW = 110, nodeH = 20, margin = 10
        let { selectedDrugID, maxPathLen, onlyExp } = this.props
        if (this.state.drugPaths[selectedDrugID] === undefined) return <g />

        let { edges, targets: drugTargets, paths } = this.state.drugPaths[selectedDrugID]
        let dag = new dagre.graphlib.Graph();
        dag.setGraph({
            ranksep: nodeH * .6,
            marginx: margin,
            marginy: margin,
            rankdir: 'TB',
            edgesep: nodeW * 0.02
        });

        dag.setDefaultEdgeLabel(() => { return {}; });

        // let nodes = Array.from(new Set(edges.flat()))
        // nodes.forEach(node=>{
        //     dag.setNode(node, {
        //         label: node, 
        //         width: nodeW, 
        //         height: nodeH
        //     })
        // })

        // filter paths
        paths = paths.filter(path => path.length <= maxPathLen + 1)

        if (onlyExp) {
            paths = paths.filter(path => {
                let flag = false
                path.forEach(node => {
                    if (this.isExp(node)) {
                        flag = true
                    }
                })
                return flag
            })
        }
        // set graph
        let nodes = Array.from(new Set(paths.flat()))
            // .concat(viralTargets.map(d => d.toString()))
            // .concat(drugTargets)

        nodes.forEach(node => {
            dag.setNode(node, {
                label: node,
                width: nodeW,
                height: nodeH
            })
        })

        paths.forEach(path => {
            for (let i = 0; i < path.length - 1; i++) {
                let source = path[i].toString(), target = path[i + 1].toString()
                dag.setEdge(source, target)
            }
        })




        dagre.layout(dag)
        console.info(dag.nodes(), dag.edges())

    }

    render() {

        return <g className='model'>
            {this.drawPaths()}
        </g>
    }
}