import * as React from "react"
import * as d3 from "d3"
import axios from "axios"
import { all_targets as viralTargets } from 'data/virus.json'

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

export default class ModelNodeForce extends React.Component<Props, State>{
    public padding = 10; RADIUS = 8;
    drugTargetLinkWidth = 70; // width to draw links between drug target proteins
    constructor(props: Props) {
        super(props)
        this.state = {
            drugPaths: {},
            expNodes: {}
        }

        // const graphWorker = new Worker("../workers/graphWorker.ts");
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
            if (this.state.expNodes[netName][selectedDrugID].includes(nodeID)) {
                idxs.push(idx)
            }
        })
        return idxs
    }

    isExp(nodeID: string): boolean {
        return this.getExpNetIdx(nodeID).length > 0
    }

    drawDrugPath() {
        let { selectedDrugID, offsetX, width, height, netName, maxPathLen, onlyExp } = this.props
        let { drugPaths, expNodes } = this.state
        if (selectedDrugID === '' || Object.keys(drugPaths).length === 0 || Object.keys(expNodes).length === 0) return <g className='path no' />


        let { targets: drugTargets, paths } = drugPaths[selectedDrugID]


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


        let nodes: INode[] = Array.from(new Set(paths.flat()))
            .concat(viralTargets.map(d => d.toString()))
            .concat(drugTargets)
            .map(d => { return { id: d } })

        // let links: ILink[] = edges.filter(edge=>paths.flat().includes(edge[0])&&paths.flat().includes(edge[1]))
        //     .filter(edge=>! (drugTargets.includes(edge[0])&&drugTargets.includes(edge[1]))) //draw the links between drug targets seperately
        //     .map(edge => { return { source: edge[0].toString(), target: edge[1] } })

        // let links: ILink[] = edges.map(edge => { return { source: edge[0].toString(), target: edge[1] } })

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

        console.info('number of nodes: ', nodes.length)
        console.info('number of edges: ', links.length)

        let yViralTargetScake = d3.scalePoint()
            .domain(viralTargets.map(d => d.toString()))
            .range([this.padding, height - 2 * this.padding])

        let yDrugTargetScale = d3.scalePoint()
            .domain(drugTargets.map(d => d.toString()))
            .range([this.padding + 0.1 * height, 0.9 * height - 2 * this.padding])

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


        // loading icon
        let loadingIcon = g.append('g')
            .attr('class', 'loading')
        let loadingIconWidth = 300, loadingIconHeight = 30

        loadingIcon.append('rect')
            .attr('class', 'bg')
            .attr('width', loadingIconWidth)
            .attr('height', loadingIconHeight)
            .attr('rx', 15)
            .attr('x', width / 2)
            .attr('y', height / 2)
            .attr('fill', 'white')
            .attr("stroke", "gray")
            .attr("strokeWidth", '4')

        loadingIcon.append('rect')
            .attr('class', 'loadingbar')
            .attr('width', loadingIconWidth * 0.3)
            .attr('height', loadingIconHeight)
            .attr('rx', loadingIconHeight * 0.3)
            .attr('x', width / 2)
            .attr('y', height / 2)
            .attr('fill', '#1890ff')

        let simulation = d3.forceSimulation<INode, ILink>()
            .force("charge",
                d3.forceManyBody<INode>()
                    .strength(-170)
            )
            .force("link",
                d3.forceLink<INode, ILink>()
                    .id(d => d.id)
                    .distance(30)
                    .strength(1)
            )
            .force('collision', d3.forceCollide().radius(this.RADIUS + 2))
            // .force("center", d3.forceCenter(width / 2, height*0.6))
            .alphaMin(0.2) // force quick simulation
            .stop()

        let linkGene = (linkData: any) => {
            let { source: target, target: source } = linkData
            let pathGene = d3.path()
            pathGene.moveTo(source.x, source.y);
            // pathGene.quadraticCurveTo(source.x, target.y, target.x, target.y);
            let midX = source.x + Math.abs(source.x - target.x) / 4
            pathGene.bezierCurveTo(midX, source.y, midX, target.y, target.x, target.y);
            return pathGene.toString()
        }




        // simulation.on("tick", ticked);

        d3.timeout(() => {
            simulation.nodes(nodes);
            simulation.force<d3.ForceLink<INode, ILink>>("link")!.links(links);


            // run simulation first, then dray graph
            for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
                simulation.tick(1); // don't know why but simulation.on('tick', ticked) doesn't work

                if (i>=n-1){
                    d3.select('g.loading')
                    .remove()
                }else{
                    d3.select('rect.loadingbar')
                    .transition()
                    .attr('width', loadingIconWidth*i/n)
                }


            }

            let svgLinks: any = g.append('g')
                .attr("stroke", "#333")
                .style("opacity", 0.2)
                .selectAll('.link')


            svgLinks = svgLinks
                .data(links, (d: ILink) => [d.source, d.target])
                // .join("line")
                .join(
                    (enter: any) => enter.append("path")
                        .attr('class', 'link')
                        .attr('d', (d:any)=>linkGene(d))
                        .attr('fill', 'none')
                        .attr('stroke', "black")
                        .attr('stroke-width', "2")
                        .attr("opacity", 0.4),

                    (update: any) => update
                        .attr('d', (d: any) => linkGene(d)),

                    (exit: any) => exit.remove()
                );


            let svgNodes = g.append('g')
                .attr('class', 'nodes')
                .selectAll('g.nodeGroup')
                .data(nodes, (d: any) => d.id)
                .join(
                    enter => enter.append("g")
                        .attr('class', 'nodeGroup')
                        .attr("transform", d => `translate(${d.x}, ${d.y})`)
                        .attr('cursor', 'pointer'),

                    update => update.attr("transform", d => `translate(${d.x}, ${d.y})`),

                    exit => exit.remove()
                )

            svgNodes.append('title')
                .text((d: INode) => `entrez_id:${d.id}`)


            svgNodes.append('circle')
                .filter(d => !viralTargets.includes(parseInt(d.id)))
                // .filter(d=>!drugTargets.includes(d.id))
                .attr("r", (d: INode) => viralTargets.includes(parseInt(d.id)) ? '0.5' : this.RADIUS)
                // .attr("r", 5)
                .attr('class', 'virus_host')
                .attr('id', d => d.id)
                .attr("fill", (d: INode) => drugTargets.includes(d.id) ? '#1890ff' : (viralTargets.includes(parseInt(d.id)) ? 'gray' : 'white'))
                .attr('stroke', 'gray')


            svgNodes
                .selectAll('path.arc')
                .data((d: any) => this.getExpNetIdx(d.id))
                .join(
                    enter => enter.append("path")
                        .attr('class', (d: number) => `arc ${d}`)
                        .attr('d', (d: number) => this.pieGenerator(d))
                        .attr('fill', 'red'),

                    update => update
                        .attr('d', (d: number) => this.pieGenerator(d)),

                    (exit: any) => exit.remove()
                )
            
        })


    }

    drugTargetConnections() {
        let { selectedDrugID, height, width, offsetX } = this.props
        let { drugPaths, expNodes } = this.state
        if (selectedDrugID === '' || Object.keys(drugPaths).length === 0 || Object.keys(expNodes).length === 0) return <g className='path no' />


        let { edges, targets: drugTargets, paths } = drugPaths[selectedDrugID]



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

    shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
        let { selectedDrugID: nextSelectedDrugID } = nextProps, { selectedDrugID } = this.props, { drugPaths } = this.state
        if (
            nextSelectedDrugID === selectedDrugID &&
            Object.keys(drugPaths).length === Object.keys(nextState.drugPaths).length
            && nextProps.maxPathLen === this.props.maxPathLen
            // && nextProps.onlyExp === this.props.onlyExp
        ) {
            return false
        }
        return true
    }

    render() {
        let { offsetX, height, width } = this.props
        let legendW = 100
        return <g className='model'>
            <g className="legend" transform={`translate(${offsetX + width - legendW}, ${height - legendW})`}>
                <foreignObject width={legendW} height={legendW} >
                    <img src='./assets/node_legend.png' width={legendW} />
                </foreignObject>
            </g>
            {this.drugTargetConnections()}
            {this.drawDrugPath()}
        </g>
    }
}