import * as React from "react"
import * as d3 from "d3"
import axios from "axios"
import { all_targets as viralTargets} from 'data/virus.json'

interface Props {
    height: number,
    width: number,
    offsetX: number,
    netName: string,
    selectedDrugID: string,
    maxPathLen:number
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
    drugTargetLinkWidth =70; // width to draw links between drug target proteins
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
        let { selectedDrugID, offsetX, width, height, netName , maxPathLen} = this.props
        let {drugPaths, expNodes} = this.state
        if (selectedDrugID === '' || Object.keys(drugPaths).length===0 || Object.keys(expNodes).length===0) return <g className='path no' />

        
        let { edges, targets: drugTargets, paths } = drugPaths[selectedDrugID]


            paths = paths.filter(path=>path.length<=maxPathLen+1)

        let nodes: INode[] = Array.from(new Set(paths.flat()))
            .concat(viralTargets.map(d=>d.toString()))
            .concat(drugTargets)
            .map(d => { return { id: d } }),

        links: ILink[] = edges.filter(edge=>paths.flat().includes(edge[0])&&paths.flat().includes(edge[1]))
            .filter(edge=>! (drugTargets.includes(edge[0])&&drugTargets.includes(edge[1])))
            .map(edge => { return { source: edge[0].toString(), target: edge[1] } })
            // links: ILink[] = edges.map(edge => { return { source: edge[0].toString(), target: edge[1] } })

        console.info('number of nodes: ', nodes.length)
        console.info('number of edges: ', links.length)  
        
        let yViralTargetScake = d3.scalePoint()
            .domain(viralTargets.map(d=>d.toString()))
            .range([this.padding, height - 2* this.padding])

        let yDrugTargetScale = d3.scalePoint()
        .domain(drugTargets.map(d=>d.toString()))
        .range([this.padding + 0.1*height, 0.9*height - 2* this.padding])

        // // show the virus host proteins
        // let nodes:INode[] =  viralTargets.map(d => { return { id: d.toString() } }),
        //     links:ILink[] = targetLinks.map(edge => { return { source: edge[0].toString(), target: edge[1].toString() } })

        for (let i = 0; i < nodes.length; i++) {
            let node = nodes[i],
                drugIdx = drugTargets.indexOf(node.id),
                viralIdx = viralTargets.indexOf(parseInt(node.id))
            if (drugIdx > -1) {
                    node.fy = yDrugTargetScale(node.id)
                    node.fx = offsetX + width - this.drugTargetLinkWidth
                }
            if (viralIdx > -1) {
                // node.fy = this.padding + (height - this.padding) / viralTargets.length * viralIdx
                node.fy = yViralTargetScake(node.id)
                node.fx = offsetX
            }

        }

        d3.select('g.drugGraph').remove()
        let g = d3.select('g.model')
            .append('g')
            .attr('class', 'drugGraph')

        let simulation = d3.forceSimulation<INode, ILink>()
            .force("charge", 
                d3.forceManyBody<INode>()
                .strength(-10)
            )
            .force("link",
                d3.forceLink<INode, ILink>()
                    .id(d => d.id)
                    .distance(30)
                    .strength(1)
            )
            .force('collision', d3.forceCollide().radius(this.RADIUS*4))
            // .force("center", d3.forceCenter(width / 2, height*0.6))

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
                enter => enter.append("g")
                    .attr('class', 'nodeGroup')
                    .attr('cursor', 'pointer'),

                update => update.attr("transform", d => `translate(${d.x}, ${d.y})`),

                exit=> exit.remove()
            )
        
        svgNodes.append('title')
            .text((d:INode)=>`entrez_id:${d.id}`)
    

        svgNodes.append('circle')
            .filter(d=>!viralTargets.includes(parseInt(d.id)))
            // .filter(d=>!drugTargets.includes(d.id))
            .attr("r", (d: INode) => viralTargets.includes(parseInt(d.id)) ? '0.5' : this.RADIUS)
            // .attr("r", 5)
            .attr('class', 'virus_host')
            .attr('id', d=>d.id)
            .attr("fill", (d: INode) => drugTargets.includes(d.id) ? '#1890ff' :( viralTargets.includes(parseInt(d.id)) ? 'gray' : 'white'))
            .attr('stroke', 'gray')

        
        svgNodes
        .selectAll('path.arc')
        .data((d:any)=>getExpNetIdx(parseInt(d.id)))
        .join(
            enter => enter.append("path")
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

    drugTargetConnections(){
        let { selectedDrugID, height, width, offsetX} = this.props
        let {drugPaths, expNodes} = this.state
        if (selectedDrugID === '' || Object.keys(drugPaths).length===0 || Object.keys(expNodes).length===0) return <g className='path no' />

        
        let { edges, targets: drugTargets, paths } = drugPaths[selectedDrugID]

        

        let targetEdges = edges
            .filter(edge=> (drugTargets.includes(edge[0])&&drugTargets.includes(edge[1])))

        console.info(targetEdges)

        let yDrugTargetScale = d3.scalePoint()
        .domain(drugTargets.map(d=>d.toString()))
        .range([this.padding + 0.1*height, 0.9*height - 2* this.padding])

        let links = targetEdges.map((link,i)=>{
            let pathGene = d3.path()
            let proteinA = link[0], proteinB = link[1], x = width + offsetX - this.drugTargetLinkWidth ,
            yA = yDrugTargetScale(proteinA.toString())||0, yB = yDrugTargetScale(proteinB.toString())||0
            pathGene.moveTo(x, Math.min(yA, yB))
            let deltaY =  Math.abs( yB - yA) ,
            centerY = (yB+yA)/2 
            // pathGene.arcTo(x, yTargetScale(proteinB.toString())||0, x-20, yTargetScale(proteinB.toString())||0, r)
            pathGene.arc(x-deltaY/2, centerY, deltaY/Math.sqrt(2), -0.25*Math.PI, 0.25*Math.PI)
            return <path key={`link_${i}`} d={pathGene.toString()} fill='none' stroke='gray' opacity='0.4' xlinkTitle={`${proteinA}_${proteinB}`}/>
        })

    return <g key="drugTargetLinks" className="drugTargetLinks">{links}</g>
    }

    shouldComponentUpdate(nextProps:Props, nextState:State):boolean{
        let {selectedDrugID: nextSelectedDrugID} = nextProps, {selectedDrugID} = this.props, {drugPaths} = this.state
        console.info(nextProps.maxPathLen)
        if (
            nextSelectedDrugID===selectedDrugID && 
            Object.keys(drugPaths).length === Object.keys(nextState.drugPaths).length
            && nextProps.maxPathLen === this.props.maxPathLen) {
            return false
        }
        return true
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
            {this.drugTargetConnections()}
            {this.drawDrugPath()}
        </g>
    }
}