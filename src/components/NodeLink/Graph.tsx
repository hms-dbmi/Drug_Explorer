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
  type: string; //
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
    } = this.props.globalState;
    const { width, height } = this.props;
    if (selectedDrug === undefined)
      return (
        <g
          className="path no"
          transform={`translate(${width / 2}, ${height / 2})`}
        >
          <text>Please select a drug first</text>
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
          type: d.data.nodeType,
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
      const nodeID = node.id.split(':')[1];
      if (nodeID === selectedDrug) {
        node.fy = height / 2;
        node.fx = width * 0.9;
      } else if (nodeID === selectedDisease) {
        node.fy = height / 2;
        node.fx = width * 0.1;
      }
    }

    d3.select('g.drugGraph').remove();
    let g = d3.select('g.model').append('g').attr('class', 'drugGraph');

    // loading icon
    let loadingIcon = g.append('g').attr('class', 'loading');
    let loadingIconWidth = 300,
      loadingIconHeight = 30;

    loadingIcon
      .append('rect')
      .attr('class', 'bg')
      .attr('width', loadingIconWidth)
      .attr('height', loadingIconHeight)
      .attr('rx', 15)
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('fill', 'white')
      .attr('stroke', 'gray')
      .attr('strokeWidth', '4');

    loadingIcon
      .append('rect')
      .attr('class', 'loadingbar')
      .attr('width', loadingIconWidth * 0.3)
      .attr('height', loadingIconHeight)
      .attr('rx', loadingIconHeight * 0.3)
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('fill', '#1890ff');

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
      .force('collision', d3.forceCollide().radius(this.RADIUS + 2))
      // .force("center", d3.forceCenter(width / 2, height*0.6))
      .alphaMin(0.2); // force quick simulation
    //   .stop();

    let linkGene = (linkData: any) => {
      let { source: target, target: source } = linkData;
      let pathGene = d3.path();
      pathGene.moveTo(source.x, source.y);
      // pathGene.quadraticCurveTo(source.x, target.y, target.x, target.y);
      //   let midX = source.x - (source.x - target.x) / 4;
      //   pathGene.bezierCurveTo(
      //     midX,
      //     source.y,
      //     midX,
      //     target.y,
      //     target.x,
      //     target.y
      //   );
      pathGene.lineTo(target.x, target.y);
      return pathGene.toString();
    };

    // simulation.on("tick", ticked);

    d3.timeout(() => {
      simulation.nodes(nodes);
      simulation.force<d3.ForceLink<INode, ILink>>('link')!.links(links);

      // run simulation first, then dray graph
      for (
        var i = 0,
          n = Math.ceil(
            Math.log(simulation.alphaMin()) /
              Math.log(1 - simulation.alphaDecay())
          );
        i < n;
        ++i
      ) {
        simulation.tick(1); // don't know why but simulation.on('tick', ticked) doesn't work

        if (i >= n - 1) {
          d3.select('g.loading').remove();
        } else {
          d3.select('rect.loadingbar')
            .transition()
            .attr('width', (loadingIconWidth * i) / n);
        }
      }

      let svgLinks: any = g
        .append('g')
        .attr('stroke', '#333')
        .style('opacity', 0.2)
        .selectAll('.link');

      svgLinks = svgLinks
        .data(links, (d: ILink) => [d.source, d.target])
        // .join("line")
        .join(
          (enter: any) =>
            enter
              .append('path')
              .attr('class', 'link')
              .attr('d', (d: any) => linkGene(d))
              .attr('fill', 'none')
              .attr('stroke', 'black')
              .attr('stroke-width', '2')
              .attr('opacity', 0.4),

          (update: any) => update.attr('d', (d: any) => linkGene(d)),

          (exit: any) => exit.remove()
        );

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
              .attr('cursor', 'pointer'),

          (update) =>
            update.attr('transform', (d) => `translate(${d.x}, ${d.y})`),

          (exit) => exit.remove()
        );

      svgNodes.append('title').text((d: INode) => `entrez_id:${d.id}`);

      svgNodes
        .append('circle')
        // .filter(d=>!drugTargets.includes(d.id))
        .attr('r', this.RADIUS)
        // .attr("r", 5)
        .attr('class', 'virus_host')
        .attr('id', (d) => d.id)
        .attr('fill', (d: INode) => getNodeColor(d.type))
        .attr('stroke', 'gray');
    });
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
