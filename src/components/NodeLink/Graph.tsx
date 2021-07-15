import * as React from 'react';
import * as d3 from 'd3';
import { IAttentionTree, IState } from 'types';
import { getNodeColor, pruneEdge } from 'helpers';

interface Props {
  height: number;
  width: number;
  globalState: IState;
}

interface State {}

interface INode extends d3.SimulationNodeDatum {
  id: string; // `${node_type}:${node_id}`
  nodeId: string; //
  nodeType: string; //
  fx?: number;
  fy?: number;
}

interface ILink {
  source: string;
  target: string;
}

export default class ModelNodeForce extends React.Component<Props, State> {
  public padding = 20;
  RADIUS = 8;
  prevNodes: INode[] = [];
  prevLinks: ILink[] = [];
  simulation = d3
    .forceSimulation<INode, ILink>()
    .force('charge', d3.forceManyBody<INode>().strength(-170))
    .force(
      'link',
      d3
        .forceLink<INode, ILink>()
        .id((d) => d.id)
        .distance(10)
        .strength(0.3)
    )
    .force('collision', d3.forceCollide().radius(this.RADIUS + 2))
    .alphaMin(0.05); // force quick simulation

  ticked(
    svgNodes: d3.Selection<
      SVGGElement | d3.BaseType,
      INode,
      d3.BaseType,
      unknown
    >,
    svgLinks: any
  ) {
    svgNodes.attr('transform', (d) => `translate(${d.x}, ${d.y})`);

    svgLinks
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y);
  }

  dragstarted(d: INode) {
    if (!d3.event.active) this.simulation.alpha(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  dragged(d: INode) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  dragended(d: INode) {
    if (!d3.event.active) this.simulation.alpha(0);
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  isTargetNode(d: INode) {
    const { drugPredictions, selectedDisease } = this.props.globalState;
    const selectedDrugs = drugPredictions
      .filter((d) => d.selected)
      .map((d) => d.id);
    return selectedDrugs.includes(d.nodeId) || selectedDisease === d.nodeId;
  }

  isHighlighted(d: INode) {
    const { selectedPathNodes } = this.props.globalState;
    return (
      selectedPathNodes.map((i) => i.nodeType).includes(d.nodeType) &&
      selectedPathNodes.map((i) => i.nodeId).includes(d.nodeId)
    );
  }

  getNodeLinks() {
    const {
      drugPredictions,
      attention,
      edgeThreshold,
      selectedDisease,
    } = this.props.globalState;
    const { width, height } = this.props;
    const selectedDrugs = drugPredictions
      .filter((d) => d.selected)
      .map((d) => d.id);

    let nodes: INode[] = [],
      links: ILink[] = [];

    Object.values(attention).forEach((nodeAttention: IAttentionTree) => {
      let nodeAttentionFiltered = pruneEdge(nodeAttention, edgeThreshold);
      const rootNode = d3.hierarchy(nodeAttentionFiltered);
      let desNodes: INode[] = [];
      rootNode.descendants().forEach((d) => {
        const node = {
          id: `${d.data.nodeType}:${d.data.nodeId}`,
          nodeId: d.data.nodeId,
          nodeType: d.data.nodeType,
        };
        const prevNode = this.prevNodes.find((d) => d.id === node.id);
        desNodes.push({ ...node, ...prevNode });
      });
      nodes = nodes.concat(desNodes);
      const desLinks = rootNode.links().map((d) => {
        const sourceData = d.source.data,
          targetData = d.target.data;
        return {
          source: `${sourceData.nodeType}:${sourceData.nodeId}`,
          target: `${targetData.nodeType}:${targetData.nodeId}`,
        };
      });
      links = links.concat(desLinks);
    });

    // // show the virus host proteins
    // let nodes:INode[] =  viralTargets.map(d => { return { id: d.toString() } }),
    //     links:ILink[] = targetLinks.map(edge => { return { source: edge[0].toString(), target: edge[1].toString() } })

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const drugIdx = selectedDrugs.indexOf(node.nodeId);
      if (node.nodeId === selectedDisease) {
        node.fy = height / 2;
        node.fx = width * 0.1;
      } else if (drugIdx > -1) {
        node.fy = (height / (selectedDrugs.length + 1)) * (drugIdx + 1);
        node.fx = width * 0.9;
      }
    }

    this.prevNodes = nodes;
    this.prevLinks = links;

    return { nodes, links };
  }

  drawGraph() {
    const { nodeNameDict } = this.props.globalState;
    const { nodes, links } = this.getNodeLinks();
    const { width, height } = this.props;

    // d3.selectAll('g.nodeGroup').remove();
    // d3.selectAll('line.link').remove();

    let svgLinks: any = d3
      .select('svg.graph')
      .select('g.links')
      .selectAll('.link')
      .data(links)
      .join('line')
      .attr('class', 'link')
      .attr('stroke', '#333')
      .attr('id', (d) => `${d.source}-${d.target}`)
      .style('opacity', 0.2);

    let svgNodes = d3
      .select('svg.graph')
      .select('g.nodes')
      .selectAll('g.nodeGroup')
      .data(nodes, (d: any) => d.id)
      .join(
        (enter) =>
          enter
            .append('g')
            .attr('class', 'nodeGroup')
            .attr('transform', (d) => {
              return `translate(${d.x || width / 2}, ${d.y || height / 2})`;
            }) // ensure d.x is not undefined when first entering
            .attr('cursor', 'pointer')
            .call(
              d3
                .drag<SVGGElement, INode>()
                .on('start', this.dragstarted.bind(this))
                .on('drag', this.dragged.bind(this))
                .on('end', this.dragended.bind(this))
            ),

        (update) =>
          update.attr('transform', (d) => `translate(${d.x}, ${d.y})`),

        (exit) => exit.remove()
      );

    svgNodes
      .append('title')
      .text(
        (d: INode) =>
          `${d.nodeType}: ${nodeNameDict[d.nodeType][d.nodeId] || d.nodeId}`
      );

    d3.selectAll('text.targetLabel').remove();

    svgNodes
      .filter((d) => this.isTargetNode(d) || this.isHighlighted(d))
      .append('text')
      .attr('class', 'targetLabel')
      .attr('transform', `translate(${-1 * this.RADIUS}, ${-2 * this.RADIUS} )`)
      .text((d) => nodeNameDict[d.nodeType][d.nodeId]);

    svgNodes
      .append('circle')
      // .filter(d=>!drugTargets.includes(d.id))
      .attr('r', this.RADIUS)
      // .attr("r", 5)
      .attr('class', 'node')
      .attr('id', (d) => d.id)
      .attr('fill', (d: INode) => getNodeColor(d.nodeType))
      .attr('opacity', (d) =>
        this.isTargetNode(d) ? 1 : this.isHighlighted(d) ? 0.8 : 0.3
      )
      .attr('stroke', 'none');

    this.simulation.nodes(nodes);
    this.simulation.force<d3.ForceLink<INode, ILink>>('link')!.links(links);
    this.simulation.on('tick', () => this.ticked(svgNodes, svgLinks));
  }

  updateNodeLabel() {
    const { nodeNameDict } = this.props.globalState;
    let svgNodes: d3.Selection<
      SVGGElement,
      INode,
      d3.BaseType,
      any
    > = d3.select('svg.graph').select('g.nodes').selectAll('g.nodeGroup');

    svgNodes
      .select('circle')
      .attr('opacity', (d) =>
        this.isTargetNode(d) ? 1 : this.isHighlighted(d) ? 0.8 : 0.3
      );

    d3.selectAll('text.targetLabel').remove();

    svgNodes
      .filter((d) => this.isTargetNode(d) || this.isHighlighted(d))
      .append('text')
      .attr('class', 'targetLabel')
      .attr('transform', `translate(${-1 * this.RADIUS}, ${-2 * this.RADIUS} )`)
      .text((d: INode) => nodeNameDict[d.nodeType][d.nodeId]);
  }

  componentDidMount() {
    this.drawGraph();
  }

  componentDidUpdate(prevProps: Props) {
    const {
      metaPathGroups: prevGroups,
      selectedPathNodes: prevNodes,
    } = prevProps.globalState;
    const {
      metaPathGroups: currGroups,
      selectedPathNodes: currNodes,
    } = this.props.globalState;
    if (Object.keys(prevGroups).length !== Object.keys(currGroups).length) {
      this.drawGraph();
      this.simulation.alpha(0.5).restart();
    }
    if (
      prevNodes.map((d) => d.nodeId).join() !==
      currNodes.map((d) => d.nodeId).join()
    ) {
      this.updateNodeLabel();
    }
    return false;
  }

  render() {
    const { width, height } = this.props;

    const selectedDrugs = Object.keys(this.props.globalState.metaPathGroups);
    const reminderText = (
      <text transform={`translate(${width / 2}, ${height / 2})`} fill="gray">
        Please select a drug first
      </text>
    );

    return (
      <svg className="graph" width={width} height={height}>
        <g className="nodes" />
        <g className="links" />
        {selectedDrugs.length === 0 ? reminderText : <></>}
      </svg>
    );
  }
}
