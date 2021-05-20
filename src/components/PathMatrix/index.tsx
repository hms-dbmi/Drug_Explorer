import { Card, Tooltip, Modal } from 'antd';
import { cropText, YES_ICON, NO_ICON, EDIT_ICON, SEARCH_ICON } from 'helpers';
import { getNodeColor } from 'helpers/color';
import React from 'react';

import { StateConsumer } from 'stores';
import { IMetaPathSummary, IState } from 'types';
import * as d3 from 'd3';

interface Props {
  width: number;
  height: number;
  globalState: IState;
}

interface State {
  expand: boolean[];
  isModalVisible: boolean;
}

class PathMatrix extends React.Component<Props, State> {
  TITLE_HEIGHT = 36;
  MARGIN = 10;
  PADDING = 10;
  EDGE_LENGTH = 100;
  NODE_WIDTH = 130;
  NODE_HEIGHT = 25;
  VERTICAL_GAP = 5; // vertical gap between path
  GROUP_GAP = 10; // vertical gap between path groups
  COUNT_GAP = 5; // horizontal gap between count circles

  constructor(prop: Props) {
    super(prop);
    this.state = {
      expand: this.props.globalState.metaPathSummary.map((d) => false),
      isModalVisible: false,
    };

    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.filterMetaPathGroups = this.filterMetaPathGroups.bind(this);
  }
  toggleExpand(idx: number) {
    let { expand } = this.state;
    expand[idx] = !expand[idx];
    this.setState({ expand });
  }
  getIconGroup() {
    const dimension = 20;
    return (
      <g className="feedback" cursor="pointer" style={{ fill: '#777' }}>
        <g className="search" transform={`translate(0, 0)`}>
          <rect width={dimension} height={dimension} fill="white" />
          <path d={SEARCH_ICON} transform={`scale(0.018)`} />
        </g>
        <g className="yes" transform={`translate(${dimension}, 0)`}>
          <rect width={dimension} height={dimension} fill="white" />
          <path d={YES_ICON} transform={`scale(0.03)`} />
        </g>
        <g className="no" transform={`translate(${2 * dimension}, 0)`}>
          <rect width={dimension} height={dimension} fill="white" />
          <path d={NO_ICON} transform={`scale(0.03)`} />
        </g>
        <g
          className="edit"
          transform={`translate(${3 * dimension}, 0)`}
          onClick={this.showModal}
        >
          <rect width={dimension} height={dimension} fill="white" />
          <path d={EDIT_ICON} transform={`scale(0.03)`} />
        </g>
      </g>
    );
  }
  drawSummary() {
    let { EDGE_LENGTH, NODE_WIDTH, NODE_HEIGHT, VERTICAL_GAP } = this;

    let {
      nodeNameDict,
      selectedDrug,
      selectedDisease,
      metaPathSummary,
      drugPredictions,
    } = this.props.globalState;

    const ICON_WIDTH =
      (drugPredictions.length + 1) * (NODE_HEIGHT + this.COUNT_GAP);

    let metaPathGroups = this.filterMetaPathGroups();
    const triangleRight =
        'M 9 17.879 V 6.707 A 1 1 0 0 1 10.707 6 l 5.586 5.586 a 1 1 0 0 1 0 1.414 l -5.586 5.586 A 1 1 0 0 1 9 17.879 Z',
      triangelBottom =
        'M 6.414 9 h 11.172 a 1 1 0 0 1 0.707 1.707 l -5.586 5.586 a 1 1 0 0 1 -1.414 0 l -5.586 -5.586 A 1 1 0 0 1 6.414 9 Z';

    if (!selectedDisease) return;
    if (!selectedDrug) return;

    const maxCount = Math.max(...metaPathSummary.map((d) => d.sum));
    const rScale = d3
      .scaleLinear()
      .range([1, NODE_HEIGHT / 2])
      .domain([0, maxCount]);

    let offsetY = 0;
    let allPaths = metaPathSummary.map((group, groupIdx) => {
      let nodes = group.nodeTypes.map((node, nodeIdx) => {
        let translate = `translate(${
          (EDGE_LENGTH + NODE_WIDTH) * nodeIdx
        }, ${0})`;
        return (
          <g key={`node_${nodeIdx}`} transform={translate}>
            <rect
              width={NODE_WIDTH}
              height={NODE_HEIGHT}
              fill="white"
              strokeWidth="3"
              stroke={getNodeColor(node)}
              rx={this.NODE_HEIGHT / 2}
            />
            <text
              textAnchor="middle"
              y={NODE_HEIGHT / 2 + 6}
              x={NODE_WIDTH / 2}
              fill="black"
            >
              {node}
            </text>
          </g>
        );
      });
      let edges = [...Array(nodes.length - 1)].map((_, edgeIdx) => {
        let translate = `translate(${
          NODE_WIDTH + (EDGE_LENGTH + NODE_WIDTH) * edgeIdx
        }, ${+NODE_HEIGHT / 2})`;
        return (
          <g key={`edge_${edgeIdx}`} transform={translate}>
            <line
              stroke="lightgray"
              // strokeWidth={1+Math.random() * 8}
              strokeWidth={2}
              x1={0}
              y1={0}
              x2={EDGE_LENGTH}
              y2={0}
            />
          </g>
        );
      });
      let currentY = offsetY;
      offsetY += NODE_HEIGHT + VERTICAL_GAP;

      let showChildren = this.state.expand[groupIdx];
      const metaPaths =
        metaPathGroups.filter(
          (d) => d.nodeTypes.join('') === group.nodeTypes.join('')
        )[0]?.metaPaths || [];
      let children = metaPaths.map((path, childIdx) => {
        let nodes = path.nodes.map((node, nodeIdx) => {
          let { nodeId, nodeType } = node;
          let nodeName = nodeNameDict[nodeType][nodeId];
          if (nodeName === undefined) {
            nodeId = nodeId.replace(/_/g, '') + '.0';
            nodeName = nodeNameDict[nodeType][nodeId];
          }

          let shortNodeName =
            cropText(nodeName, 14, NODE_WIDTH - 10) || 'undefined';

          let translate = `translate(${
            (EDGE_LENGTH + NODE_WIDTH) * nodeIdx
          }, ${0})`;
          return (
            <Tooltip
              key={`node_${nodeIdx}`}
              title={shortNodeName.includes('.') ? nodeName : ''}
            >
              <g transform={translate} className={`node_${nodeId}`}>
                <rect
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  fill={getNodeColor(nodeType)}
                />
                <text
                  textAnchor="middle"
                  y={NODE_HEIGHT / 2 + 6}
                  x={NODE_WIDTH / 2}
                  fill="white"
                >
                  {shortNodeName}
                </text>
              </g>
            </Tooltip>
          );
        });
        let edges = path.edges.map((edge, edgeIdx) => {
          const translate = `translate(${
            NODE_WIDTH + (EDGE_LENGTH + NODE_WIDTH) * edgeIdx
          }, ${+NODE_HEIGHT / 2})`;

          return (
            <g key={`edge_${edgeIdx}`} transform={translate}>
              <line
                stroke="gray"
                strokeWidth={1 + edge.score * 0.7}
                x1={0}
                y1={NODE_HEIGHT / 4}
                x2={EDGE_LENGTH}
                y2={NODE_HEIGHT / 4}
              />
              <text x={EDGE_LENGTH / 2} y={0} textAnchor="middle">
                {edge.edgeInfo}
              </text>
            </g>
          );
        });
        return (
          <g
            key={childIdx}
            transform={`translate(${ICON_WIDTH + 20}, ${
              (NODE_HEIGHT + VERTICAL_GAP) * (1 + childIdx)
            })`}
          >
            {nodes}
            {edges}
            <g
              className="iconGroup"
              transform={`translate(${
                NODE_WIDTH * nodes.length + EDGE_LENGTH * edges.length + 20
              }, 0)`}
            >
              {this.getIconGroup()}
            </g>
          </g>
        );
      });

      if (showChildren) {
        offsetY += (NODE_HEIGHT + VERTICAL_GAP) * metaPaths.length;
      }

      offsetY += this.GROUP_GAP;

      return (
        <g
          key={`prototype_${groupIdx}`}
          transform={`translate(${0}, ${currentY})`}
        >
          <g className="metaCount">{this.drawMetaCount(group, rScale)}</g>
          <g className="icon">
            <path
              d={showChildren ? triangelBottom : triangleRight}
              transform={`translate(${ICON_WIDTH}, 0)`}
              fill="gray"
              onClick={() => this.toggleExpand(groupIdx)}
              cursor="pointer"
            />
          </g>
          <g
            className="prototype"
            transform={`translate(${ICON_WIDTH + 20}, 0)`}
          >
            {nodes}
            {edges}
          </g>
          <g className="metapaths">{showChildren ? children : <g />}</g>
        </g>
      );
    });
    return allPaths;
  }
  drawMetaCount(
    summary: IMetaPathSummary,
    rScale: d3.ScaleLinear<number, number>
  ) {
    const { count, sum } = summary;
    const RADIUS = this.NODE_HEIGHT / 2;
    const vis = count.map((num, idx) => {
      return (
        <circle
          key={idx}
          className="count"
          r={rScale(num)}
          fill="lightGray"
          xlinkTitle={num.toString()}
          stroke="lightGray"
          cx={RADIUS / 2 + idx * (2 * RADIUS + this.COUNT_GAP)}
          cy={this.NODE_HEIGHT / 2}
        />
      );
    });
    return (
      <g className="metaCount" transform={`translate(${this.PADDING}, 0)`}>
        {vis}
        <g
          className="sum"
          transform={`translate(${
            count.length * (2 * RADIUS + this.COUNT_GAP)
          }, 0)`}
        >
          {/* <circle
            className="sum"
            cx={RADIUS / 2}
            cy={this.NODE_HEIGHT / 2}
            fill="lightGray"
            stroke="lightGray"
            r={rScale(sum)}
          /> */}
          <text x={RADIUS / 2} y={this.NODE_HEIGHT / 2 + 6} textAnchor="middle">
            {' '}
            {`| ${sum}`}{' '}
          </text>
        </g>
      </g>
    );
  }
  showModal() {
    this.setState({ isModalVisible: true });
  }
  hideModal() {
    this.setState({ isModalVisible: false });
  }
  filterMetaPathGroups() {
    let { metaPathGroups, edgeThreshold } = this.props.globalState;
    let a = metaPathGroups.map((metaPathGroup) => {
      const metaPaths = metaPathGroup.metaPaths.filter((metaPath) =>
        metaPath.edges.every((e) => e.score > edgeThreshold)
      );
      return { ...metaPathGroup, metaPaths };
    });

    let b = a.filter((metaPathGroup) => metaPathGroup.metaPaths.length > 0);

    return b;
  }
  render() {
    const { width, height } = this.props,
      { isModalVisible } = this.state;
    const {
      isAttentionLoading,
      attention,
      metaPathSummary,
    } = this.props.globalState;
    const metaPathGroups = this.filterMetaPathGroups();
    const numberOfPath = metaPathGroups
      .map((d) => d.metaPaths.length)
      .reduce((a, b) => a + b, 0);

    const svgWidth = width - 2 * this.PADDING - 2 * this.MARGIN,
      svgOuterHeight = height - 2 * this.PADDING - this.TITLE_HEIGHT,
      svgHeight = Math.max(
        (numberOfPath + metaPathGroups.length) *
          (this.NODE_HEIGHT + this.VERTICAL_GAP) +
          2 * this.PADDING,
        svgOuterHeight
      );

    const reminderText = (
      <text x={svgWidth / 2} y={svgOuterHeight / 2} fill="gray">
        {attention['disease']
          ? 'There is no meta path'
          : 'Please select a disease first'}
      </text>
    );
    const content = isAttentionLoading ? (
      <></>
    ) : metaPathSummary.length === 0 ? (
      reminderText
    ) : (
      this.drawSummary()
    );
    return (
      <>
        <Card
          size="small"
          title="Meta Paths"
          style={{
            width: width - 2 * this.MARGIN,
            height: height,
            margin: `0px ${this.MARGIN}px`,
          }}
          bodyStyle={{
            padding: this.PADDING,
            height: svgOuterHeight,
            overflowY: 'auto',
          }}
          headStyle={{ height: this.TITLE_HEIGHT }}
        >
          <svg width={svgWidth} height={svgHeight}>
            <g
              className="metaPath"
              transform={`translate(${0}, ${this.PADDING})`}
            >
              {content}
            </g>
          </svg>
        </Card>
        <Modal
          title="Edit Explanation"
          visible={isModalVisible}
          onOk={this.hideModal}
          onCancel={this.hideModal}
          okText="Confirm"
          width={width}
          zIndex={1999}
        >
          <svg width={width}></svg>
        </Modal>
      </>
    );
  }
}

export default StateConsumer(PathMatrix);
