import * as React from 'react';
import * as d3 from 'd3';
import { IAttentionTree, IState } from 'types';
import { flatTree, getNodeColor, pruneEdge, LOADING_ICON } from 'helpers';

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
  score: number;
  edgeInfo: string;
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
        .distance(6)
        .strength(0.6)
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
      .select('line.link')
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y);

    svgLinks
      .select('line.mask')
      .attr('x1', (d: any) => d.source.x)
      .attr('y1', (d: any) => d.source.y)
      .attr('x2', (d: any) => d.target.x)
      .attr('y2', (d: any) => d.target.y);

    svgLinks
      .select('text')
      .attr('text-anchor', 'middle')
      .attr(
        'transform',
        (d: any) =>
          `translate(${(d.target.x + d.source.x) / 2}, ${
            (d.source.y + d.target.y) / 2
          })`
      );
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
      // edgeThreshold,
      selectedDisease,
      edgeTypes,
    } = this.props.globalState;
    const { width, height } = this.props;
    const selectedDrugs = drugPredictions
      .filter((d) => d.selected)
      .map((d) => d.id);

    let nodes: INode[] = [],
      links: ILink[] = [];

    Object.values(attention).forEach((nodeAttention: IAttentionTree) => {
      // let nodeAttentionFiltered = pruneEdge(nodeAttention, edgeThreshold);
      const rootNode = d3.hierarchy(nodeAttention);
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
        let edgeInfo = targetData.edgeInfo.replace('rev_', '');
        edgeInfo = edgeTypes[edgeInfo]?.edgeInfo || edgeInfo;
        return {
          source: `${sourceData.nodeType}:${sourceData.nodeId}`,
          target: `${targetData.nodeType}:${targetData.nodeId}`,
          score: targetData.score,
          edgeInfo,
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
        node.fx = width * 0.2;
      } else if (drugIdx > -1) {
        node.fy = (height / (selectedDrugs.length + 1)) * (drugIdx + 1);
        node.fx = width * 0.8;
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

    const widthScale = d3
      .scaleLinear()
      .range([1, 4])
      .domain(d3.extent(links.map((d) => d.score)) as [number, number]);

    let svgLinks: any = d3
      .select('svg.graph')
      .select('g.links')
      .selectAll('g.link')
      .data(links)
      .join((enter) => enter.append('g').attr('class', 'link'))
      .on('mouseover', function () {
        d3.select(this)
          .select('text.edgeLabel')
          .transition()
          .delay(500)
          .attr('class', 'edgeLabel');
      })
      .on('mouseout', function () {
        d3.select(this)
          .select('text.edgeLabel')
          .transition()
          .delay(500)
          .attr('class', 'edgeLabel hidden');
      });

    svgLinks
      .append('line')
      .attr('x1', (d: any) => d.target.x)
      .attr('y1', (d: any) => d.target.y)
      .attr('x2', (d: any) => d.source.x)
      .attr('y2', (d: any) => d.source.y)
      .attr('class', 'link')
      .attr('stroke', '#aaa')
      .attr('stroke-width', (d: any) => widthScale(d.score))
      .attr('id', (d: any) => d.id);

    svgLinks
      .append('line')
      .attr('x1', (d: any) => d.target.x)
      .attr('y1', (d: any) => d.target.y)
      .attr('x2', (d: any) => d.source.x)
      .attr('y2', (d: any) => d.source.y)
      .attr('class', 'mask')
      .attr('stroke-width', 4)
      .attr('stroke', 'transparent');

    svgLinks
      .append('text')
      .attr('class', 'edgeLabel hidden')
      .attr(
        'transform',
        (d: any) =>
          `translate(${(d.target.x + d.source.x) / 2}, ${
            (d.source.y + d.target.y) / 2
          })`
      )
      .text((d: any) => d.edgeInfo);

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
      .append('circle')
      // .filter(d=>!drugTargets.includes(d.id))
      .attr('r', this.RADIUS)
      // .attr("r", 5)
      .attr('class', 'node')
      .attr('id', (d) => d.id)
      .attr('fill', (d: INode) => getNodeColor(d.nodeType))
      .attr('stroke', 'white');

    // add label to all nodes
    svgNodes
      .append('text')
      .attr('class', 'nodeLabel')
      .attr('transform', `translate(${-1 * this.RADIUS}, ${-2 * this.RADIUS} )`)
      .text((d) => nodeNameDict[d.nodeType][d.nodeId])
      .classed('hidden', true);

    svgNodes
      .filter((d) => this.isTargetNode(d) || this.isHighlighted(d))
      .select('text.nodeLabel')
      .classed('hidden', false);

    // toggle node visibility through click
    svgNodes.on('click', function (d) {
      const textlabel = d3.select(this).select('text.nodeLabel');
      const isHidden = textlabel.classed('hidden');
      textlabel.classed('hidden', !isHidden);
    });

    this.simulation.nodes(nodes);
    this.simulation.force<d3.ForceLink<INode, ILink>>('link')!.links(links);
    this.simulation.on('tick', () => this.ticked(svgNodes, svgLinks));

    this.updateVisibility();
  }

  updateNodeLabel() {
    let svgNodes: d3.Selection<
      SVGGElement,
      INode,
      d3.BaseType,
      any
    > = d3.select('svg.graph').select('g.nodes').selectAll('g.nodeGroup');

    svgNodes
      .filter((d) => this.isTargetNode(d) || this.isHighlighted(d))
      .select('text.nodeLabel')
      .classed('hidden', false);
  }

  updateVisibility() {
    // update visibility of nodes and edges based on threshold
    const { attention, edgeThreshold } = this.props.globalState;

    d3.select('svg.graph')
      .selectAll('g.link')
      .style('opacity', (d: any) => (d.score > edgeThreshold ? 1 : 0));

    var visibleNodes: string[] = [];
    Object.values(attention).forEach((d) => {
      visibleNodes = visibleNodes.concat(flatTree(pruneEdge(d, edgeThreshold)));
    });

    d3.select('svg.graph')
      .select('g.nodes')
      .selectAll('g.nodeGroup')
      .select('circle')
      .style('opacity', (d: any) => {
        return visibleNodes.includes(d.nodeId) ? 1 : 0;
      });
  }

  componentDidMount() {
    this.drawGraph();
  }

  componentDidUpdate(prevProps: Props) {
    const {
      metaPathGroups: prevGroups,
      selectedPathNodes: prevNodes,
      edgeThreshold: prevThreshold,
    } = prevProps.globalState;
    const {
      metaPathGroups: currGroups,
      selectedPathNodes: currNodes,
      edgeThreshold: currThreshold,
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

    if (prevThreshold !== currThreshold) {
      this.updateVisibility();
    }
    return false;
  }

  render() {
    const { width, height } = this.props;
    const { isAttentionLoading } = this.props.globalState;

    const selectedDrugs = Object.keys(this.props.globalState.metaPathGroups);
    const reminderText = (
      <text
        transform={`translate(${width / 2}, ${height / 2})`}
        fill="gray"
        fontSize={20}
      >
        Please select a drug first
      </text>
    );

    return (
      <svg className="graph" width={width} height={height}>
        <g className="links" />
        <g className="nodes" />
        <text x={0} y={height - 25} fill="gray" fontSize={12}>
          Drag & Drop to move nodes.
        </text>
        <text x={0} y={height - 10} fill="gray" fontSize={12}>
          Click on nodes to show/hide labels.
        </text>
        {selectedDrugs.length === 0 ? reminderText : <></>}
        {isAttentionLoading ? (
          <g className="loading">
            <rect
              className="loading__background"
              width={width}
              height={height}
              fill="white"
              opacity={0.5}
            />
            <g transform={`translate(${width / 2}, ${height / 2})`}>
              {LOADING_ICON}
            </g>
          </g>
        ) : (
          <></>
        )}
      </svg>
    );
  }
}
