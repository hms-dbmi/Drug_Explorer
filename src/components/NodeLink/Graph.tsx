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
  drawGraph() {
    const {
      selectedDrug,
      attention,
      edgeThreshold,
      selectedDisease,
      nodeNameDict,
    } = this.props.globalState;
    const { width, height } = this.props;
    if (selectedDrug === undefined)
      return (
        <g
          className="path no"
          transform={`translate(${width / 2}, ${height / 2})`}
        >
          <text color="gray">Please select a drug first</text>
        </g>
      );

    let nodes: INode[] = [],
      links: ILink[] = [];

    Object.values(attention).forEach((nodeAttention: IAttentionTree) => {
      let nodeAttentionFiltered = pruneEdge(nodeAttention, edgeThreshold);
      const rootNode = d3.hierarchy(nodeAttentionFiltered);
      const desNodes = rootNode.descendants().map((d) => {
        return {
          id: `${d.data.nodeType}:${d.data.nodeId}`,
          nodeId: d.data.nodeId,
          nodeType: d.data.nodeType,
        };
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
      if (node.nodeId === selectedDrug) {
        node.fy = height / 2;
        node.fx = width * 0.9;
      } else if (node.nodeId === selectedDisease) {
        node.fy = height / 2;
        node.fx = width * 0.1;
      }
    }

    d3.select('g.drugGraph').remove();
    let g = d3.select('g.model').append('g').attr('class', 'drugGraph');

    // // loading icon
    // let loadingIcon = g.append('g').attr('class', 'loading');
    // let loadingIconWidth = 300,
    //   loadingIconHeight = 30;

    // loadingIcon
    //   .append('rect')
    //   .attr('class', 'bg')
    //   .attr('width', loadingIconWidth)
    //   .attr('height', loadingIconHeight)
    //   .attr('rx', 15)
    //   .attr('x', width / 2)
    //   .attr('y', height / 2)
    //   .attr('fill', 'white')
    //   .attr('stroke', 'gray')
    //   .attr('strokeWidth', '4');

    // loadingIcon
    //   .append('rect')
    //   .attr('class', 'loadingbar')
    //   .attr('width', loadingIconWidth * 0.3)
    //   .attr('height', loadingIconHeight)
    //   .attr('rx', loadingIconHeight * 0.3)
    //   .attr('x', width / 2)
    //   .attr('y', height / 2)
    //   .attr('fill', '#1890ff');

    let simulation = d3
      .forceSimulation<INode, ILink>()
      .force('charge', d3.forceManyBody<INode>().strength(-170))
      .force(
        'link',
        d3
          .forceLink<INode, ILink>()
          .id((d) => d.id)
          .distance(30)
          .strength(1)
      )
      .force('collision', d3.forceCollide().radius(this.RADIUS + 2));

    function dragstarted(d: INode) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d: INode) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragended(d: INode) {
      if (!d3.event.active) simulation.alphaTarget(0);
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }
    const isTargetNode = (d: INode) =>
      d.nodeId === selectedDrug || d.nodeId === selectedDisease;

    let svgLinks: any = g
      .append('g')
      .attr('stroke', '#333')
      .style('opacity', 0.2)
      .selectAll('.link');
    svgLinks = svgLinks
      .data(links, (d: ILink) => [d.source, d.target])
      .join('line');

    // simulation.on("tick", ticked);
    function ticked() {
      svgNodes.attr('transform', (d) => `translate(${d.x}, ${d.y})`);

      svgLinks
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
    }

    let svgNodes = g
      .append('g')
      .attr('class', 'nodes')
      .selectAll('g.nodeGroup')
      .data(nodes, (d: any) => d.id)
      .join(
        (enter) =>
          enter
            .append('g')
            .attr('class', 'nodeGroup')
            .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
            .attr('cursor', 'pointer')
            .call(
              d3
                .drag<SVGGElement, INode>()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended)
            ),

        (update) =>
          update.attr('transform', (d) => `translate(${d.x}, ${d.y})`),

        (exit) => exit.remove()
      );

    svgNodes.append('title').text((d: INode) => d.id);

    svgNodes
      .filter((d) => isTargetNode(d))
      .append('text')
      .attr('class', 'targetLabel')
      .attr('transform', `translate(${-1 * this.RADIUS}, ${-2 * this.RADIUS} )`)
      .text((d) => nodeNameDict[d.nodeType][d.nodeId]);

    svgNodes
      .append('circle')
      // .filter(d=>!drugTargets.includes(d.id))
      .attr('r', this.RADIUS)
      // .attr("r", 5)
      .attr('class', 'virus_host')
      .attr('id', (d) => d.id)
      .attr('fill', (d: INode) => getNodeColor(d.nodeType))
      .attr('opacity', (d) => (isTargetNode(d) ? 1 : 0.4))
      .attr('stroke', 'none');

    simulation.nodes(nodes);
    simulation.force<d3.ForceLink<INode, ILink>>('link')!.links(links);
    simulation.on('tick', ticked);
  }

  render() {
    const { width, height } = this.props;
    return (
      <svg className="graph" width={width} height={height}>
        <g className="model">{this.drawGraph()}</g>
      </svg>
    );
  }
}
