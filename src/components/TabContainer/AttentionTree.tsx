import React from 'react';
import { IState, IAttentionTree } from 'types';
import * as d3 from 'd3';
import { Tooltip } from 'antd';
import { getNodeColor, pruneEdge } from 'helpers';
import {
  cropText,
  VIRUS_ICON,
  DRUG_ICON,
  getTextWidth,
  LOADING_ICON,
} from 'helpers';

interface Props {
  width: number;
  height: number;
  globalState: IState;
}

export default class AttentionTree extends React.Component<Props, {}> {
  nodeHeight = 20;
  fontSize = 14;
  labelLength = 150;
  midGap = 60; // the gaph between two trees
  drawNodeAttentionHorizontal(
    nodeAttention: IAttentionTree,
    stepGap: number,
    edgeThreshold: number
  ) {
    const { width } = this.props;
    const {
      nodeNameDict,
      edgeTypes,
      selectedPathNodes,
    } = this.props.globalState;

    let nodeAttentionFiltered = pruneEdge(nodeAttention, edgeThreshold, 7);

    const rootNode = d3.hierarchy(nodeAttentionFiltered);
    const d3Tree = d3
      .tree<IAttentionTree>()
      .nodeSize([this.nodeHeight + 2, stepGap]);

    const root = d3Tree(rootNode);

    const linkGene = d3
      .linkHorizontal<any, d3.HierarchyPointLink<IAttentionTree>, any>()
      // modify the source and target x, y to make space for node
      .source((d) => {
        const newX =
          root.data.nodeType === 'drug'
            ? width / 2 -
              this.midGap / 2 -
              this.labelLength -
              d.source.y -
              this.labelLength / 2
            : d.source.y + this.labelLength / 2;
        const newY = d.source.x;

        return { x: newX, y: newY };
      })
      .target((d) => {
        const newX =
          root.data.nodeType === 'drug'
            ? width / 2 -
              this.midGap / 2 -
              this.labelLength -
              d.target.y +
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
      let edgeInfo = link.target.data.edgeInfo.replace('rev_', '');
      if (edgeTypes[edgeInfo]) {
        edgeInfo = edgeTypes[edgeInfo]['edgeInfo'] || edgeInfo;
      }
      return (
        <Tooltip
          title={edgeInfo}
          key={`${link.source.data.nodeId}=>${link.target.data.nodeId}_link${i}`}
          destroyTooltipOnHide
        >
          <g>
            <path
              d={linkGene(link)!}
              className={`link ${link.source.data.nodeId}=>${link.target.data.nodeId}`}
              fill="none"
              stroke="gray"
              strokeWidth={widthScale(link.target.data.score)}
              opacity={selectedPathNodes.length > 0 ? 0.5 : 1}
            />
            <path
              d={linkGene(link)!}
              className="mask"
              fill="none"
              stroke="transparent"
              strokeWidth="3"
            />
          </g>
        </Tooltip>
      );
    });

    const allY = root.descendants().map((node) => node.x);
    const minY = Math.min(...allY);
    const maxY = Math.max(...allY);

    const height = maxY - minY + this.nodeHeight + 4; // default seperation in d3 tree is 2

    const nodes = root.descendants().map((node, i) => {
      let { nodeId, nodeType } = node.data;
      let nodeFullName = nodeNameDict[nodeType][nodeId];
      if (nodeFullName === undefined) {
        nodeId = nodeId.replace(/_/g, '') + '.0'; // the id of a merged node is xxx_xxx_xxxx
        nodeFullName = nodeNameDict[nodeType][nodeId];
      }
      let nodeShortName = cropText(
        nodeFullName,
        12,
        this.labelLength - 25 - getTextWidth('..(0.00)', 14)
      );
      let tooltipTitle = nodeShortName?.includes('..') ? nodeFullName : '';
      let icon_path = '';
      if (nodeType === 'disease') icon_path = VIRUS_ICON;
      if (nodeType === 'drug') icon_path = DRUG_ICON;

      const isHighlighted =
        selectedPathNodes.length === 0 ||
        (selectedPathNodes.map((d) => d.nodeType).includes(nodeType) &&
          selectedPathNodes.map((d) => d.nodeId).includes(nodeId));

      return (
        <Tooltip
          title={tooltipTitle}
          key={`node${i}_${nodeFullName}`}
          destroyTooltipOnHide
          mouseEnterDelay={0.3}
        >
          <g
            className={`${nodeId} node`}
            transform={`translate(${
              root.data.nodeType === 'drug'
                ? width / 2 - this.midGap / 2 - this.labelLength - node.y
                : node.y
            }, ${node.x})`}
            cursor="pointer"
          >
            <rect
              width={this.labelLength}
              height={this.nodeHeight}
              fill={getNodeColor(nodeType)}
              x={(-1 * this.labelLength) / 2}
              y={-this.nodeHeight / 2}
              opacity={isHighlighted ? 1 : 0.2}
            />
            <path
              className="virus_icon"
              d={icon_path}
              transform={`translate(${(-1 * this.labelLength) / 2 + 2}, ${
                -this.nodeHeight / 2
              }) scale(0.04)`}
              fill="white"
            />
            <text
              fill="white"
              fontSize={this.fontSize}
              transform={`translate(${(-1 * this.labelLength) / 2 + 25}, ${
                (this.nodeHeight - this.fontSize) / 2
              })`}
            >
              {/* {`${nodeShortName}
                  ${node.depth > 0 ? ':' + node.data.score.toFixed(2) : ''}`} */}
              {nodeShortName}
            </text>
          </g>
        </Tooltip>
      );
    });

    return {
      content: [
        <g key="links" className="links">
          {links}
        </g>,
        <g key="nodes" className="nodes">
          {nodes}
        </g>,
      ],
      height: height,
    };
  }
  drawSubgraph() {
    let { attention, edgeThreshold } = this.props.globalState;
    let { width } = this.props;

    let stepGap = (width - 2 * this.labelLength - this.midGap) / 4;
    let heights = [0];
    const content = Object.keys(attention).map((nodeKey: string, idx) => {
      const { height, content } = this.drawNodeAttentionHorizontal(
        attention[nodeKey],
        stepGap,
        edgeThreshold
      );
      heights.push(height);
      return (
        <g
          className={nodeKey}
          key={nodeKey}
          transform={`translate(${
            ((width + this.midGap) / 2) * idx + this.labelLength / 2
          }, ${height / 2 + 2 * this.nodeHeight})`}
        >
          {content}
        </g>
      );
    });
    return { content, height: Math.max(...heights) };
  }
  render() {
    const { width, height, globalState } = this.props;
    const {
      isAttentionLoading,
      selectedDisease,
      drugPredictions,
    } = globalState;
    const selectedDrugs = drugPredictions.filter((d) => d.selected);

    const { content, height: graphHeight } = this.drawSubgraph();
    return (
      <svg
        width={width}
        height={Math.max(graphHeight, height)}
        className="nodeLink"
      >
        {selectedDrugs.length > 0 && selectedDisease ? (
          content
        ) : (
          <text x={width / 2} y={height / 2} fill="gray">
            Please select a disease and a drug first
          </text>
        )}
        {isAttentionLoading ? (
          <g>
            <rect width={width} height={height} fill="white" opacity={0.5} />
            <g
              transform={`translate(${width / 2}, ${height / 2})`}
              textAnchor="middle"
            >
              {LOADING_ICON}
            </g>
          </g>
        ) : (
          <g />
        )}
      </svg>
    );
  }
}
