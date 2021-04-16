import React from 'react';
import { Card, Tooltip } from 'antd';
import { StateConsumer } from 'stores';
import { IState, IAttentionTree } from 'types';
import * as d3 from 'd3';
import { getNodeColor } from 'helpers/color';
import {
  cropText,
  VIRUS_ICON,
  DRUG_ICON,
  getTextWidth,
  LOADING_ICON,
} from 'helpers';

import './index.css';
interface Props {
  width: number;
  height: number;
  globalState: IState;
}

class NodeLink extends React.Component<Props> {
  titleHeight = 36;
  margin = 10;
  padding = 10;
  nodeHeight = 20;
  fontSize = 14;
  labelLength = 150;

  drawNodeAttentionHorizontal(
    nodeAttention: IAttentionTree,
    stepGap: number,
    edgeThreshold: number
  ) {
    let { width } = this.props;
    let { nodeNameDict } = this.props.globalState;

    let pruneEdge = (
      node: IAttentionTree,
      threshold: number
    ): IAttentionTree => {
      if (node.children.length > 0) {
        node = {
          ...node,
          children: node.children
            .filter((d) => d.score >= threshold)
            .map((node) => pruneEdge(node, threshold)),
        };
      }
      return node;
    };

    let nodeAttentionFiltered = pruneEdge(nodeAttention, edgeThreshold);

    const rootNode = d3.hierarchy(nodeAttentionFiltered);
    // let root = d3.tree<IAttentionTree>().nodeSize([stepGap, this.nodeHeight+this.padding])(rootNode)
    const root = d3
      .tree<IAttentionTree>()
      .nodeSize([this.nodeHeight + 2, stepGap])(rootNode);

    const linkGene = d3
      .linkHorizontal<any, d3.HierarchyPointLink<IAttentionTree>, any>()
      // modify the source and target x, y to make space for node
      .source((d) => {
        const newX =
          root.data.nodeType === 'drug'
            ? width / 2 -
              d.source.y -
              3 * this.labelLength -
              this.labelLength / 2
            : d.source.y + this.labelLength / 2;
        const newY = d.source.x;

        return { x: newX, y: newY };
      })
      .target((d) => {
        const newX =
          root.data.nodeType === 'drug'
            ? width / 2 -
              d.target.y -
              3 * this.labelLength +
              this.labelLength / 2
            : d.target.y - this.labelLength / 2;
        const newY = d.target.x;

        return { x: newX, y: newY };
      })
      .x((d) => d.x)
      .y((d) => d.y);

    const maxScore = Math.max(
      ...root.links().map((link) => link.target.data.score)
    );

    let widthScale = d3.scaleLinear().domain([0, maxScore]).range([1, 5]);

    const links = root.links().map((link, i) => {
      return (
        <path
          d={linkGene(link)!}
          className={`link ${link.source.data.nodeId}=>${link.target.data.nodeId}`}
          key={`${link.source.data.nodeId}=>${link.target.data.nodeId}_link${i}`}
          fill="none"
          stroke="gray"
          strokeWidth={widthScale(link.target.data.score)}
        />
      );
    });

    const nodes = root.descendants().map((node, i) => {
      let { nodeId, nodeType } = node.data;
      const nodeFullName = nodeNameDict[nodeType][nodeId];
      if (nodeFullName === undefined) {
        nodeId = nodeId.split('_')[0]; // the id of a merged node is xxx_xxx_xxxx
      }
      let nodeShortName = cropText(
        nodeFullName,
        12,
        this.labelLength - 20 - getTextWidth('..(0.00)', 14)
      );
      let tooltipTitle = nodeShortName?.includes('..') ? nodeFullName : '';
      let icon_path = '';
      if (nodeType === 'disease') icon_path = VIRUS_ICON;
      if (nodeType === 'drug') icon_path = DRUG_ICON;

      return (
        <Tooltip title={tooltipTitle} key={`node${i}_${nodeFullName}`}>
          <g
            className={`${nodeId} node`}
            transform={`translate(${
              root.data.nodeType === 'drug'
                ? width / 2 - node.y - 3 * this.labelLength
                : node.y
            }, ${node.x})`}
            cursor="pointer"
          >
            <rect
              width={this.labelLength + 2 * this.padding}
              height={this.nodeHeight}
              fill={getNodeColor(nodeType)}
              x={(-1 * this.labelLength) / 2 - this.padding}
              y={-this.nodeHeight / 2}
            />
            <path
              className="virus_icon"
              d={icon_path}
              transform={`translate(${(-1 * this.labelLength) / 2 - 5}, ${
                -this.nodeHeight / 2
              }) scale(0.04)`}
              fill="white"
            />
            <text
              fill="white"
              fontSize={this.fontSize}
              transform={`translate(${(-1 * this.labelLength) / 2 + 20}, ${
                (this.nodeHeight - this.fontSize) / 2
              })`}
            >
              {`${nodeShortName}
              ${node.depth > 0 ? ':' + node.data.score.toFixed(2) : ''}`}
            </text>
          </g>
        </Tooltip>
      );
    });

    return [
      <g key="links" className="links">
        {links}
      </g>,
      <g key="nodes" className="nodes">
        {nodes}
      </g>,
    ];
  }
  drawSubgraph() {
    let { attention, edgeThreshold } = this.props.globalState;
    let { width, height } = this.props;

    // let stepGap = height/4
    // return Object.keys(attention).map((nodeKey:string, idx)=>{
    //     return <g className={nodeKey} key={nodeKey} transform={`translate(${width/2*idx + 1*width/5}, ${stepGap/2})`}>
    //         {this.drawNodeAttentionVertical(attention[nodeKey], stepGap, edgeThreshold)}
    //     </g>
    // })
    let stepGap = width / 8;
    return Object.keys(attention).map((nodeKey: string, idx) => {
      return (
        <g
          className={nodeKey}
          key={nodeKey}
          transform={`translate(${(width / 2) * idx + this.labelLength}, ${
            height / 2
          })`}
        >
          {this.drawNodeAttentionHorizontal(
            attention[nodeKey],
            stepGap,
            edgeThreshold
          )}
        </g>
      );
    });
  }
  render() {
    const { width, height, globalState } = this.props;
    const { isAttentionLoading } = globalState;
    let svgWidth = width - 2 * this.padding - 2 * this.margin,
      svgHeight =
        height - 2 * this.padding - this.titleHeight - 2 * this.margin;
    return (
      <Card
        size="small"
        title="Node attention"
        style={{
          width: width - 2 * this.margin,
          height: height - 2 * this.margin,
          margin: this.margin,
        }}
        bodyStyle={{ padding: this.padding }}
        headStyle={{ height: this.titleHeight }}
      >
        <svg width={svgWidth} height={svgHeight} className="nodeLink">
          {isAttentionLoading ? (
            <g transform={`translate(${width / 2}, ${height / 2})`}>
              {LOADING_ICON}
            </g>
          ) : (
            this.drawSubgraph()
          )}
        </svg>
      </Card>
    );
  }
}

export default StateConsumer(NodeLink);
