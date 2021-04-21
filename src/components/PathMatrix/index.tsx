import { Card, Tooltip, Modal } from 'antd';
import { cropText, YES_ICON, NO_ICON, EDIT_ICON } from 'helpers';
import { getNodeColor } from 'helpers/color';
import React from 'react';

import { StateConsumer } from 'stores';
import { IState } from 'types';

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
  VERTICAL_GAP = 5;
  GROUP_GAP = 10;

  constructor(prop: Props) {
    super(prop);
    this.state = {
      expand: [false, true, true, false],
      isModalVisible: false,
    };

    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
  }
  expandType(idx: number) {
    let { expand } = this.state;
    if (idx < expand.length) {
      expand[idx] = !expand[idx];
      this.setState({ expand });
    }
  }
  getIconGroup() {
    return (
      <g className="feedback" cursor="pointer" style={{ fill: '#777' }}>
        <g className="yes">
          <rect width={30} height={30} fill="white" />
          <path d={YES_ICON} transform={`scale(0.04)`} />
        </g>
        <g className="no" transform={`translate(${30}, 0)`}>
          <rect width={30} height={30} fill="white" />
          <path d={NO_ICON} transform={`scale(0.04)`} />
        </g>
        <g
          className="edit"
          transform={`translate(${60}, 0)`}
          onClick={this.showModal}
        >
          <rect width={30} height={30} fill="white" />
          <path d={EDIT_ICON} transform={`scale(0.04)`} />
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
      metaPathGroups,
    } = this.props.globalState;

    const triangleRight =
        'M 9 17.879 V 6.707 A 1 1 0 0 1 10.707 6 l 5.586 5.586 a 1 1 0 0 1 0 1.414 l -5.586 5.586 A 1 1 0 0 1 9 17.879 Z',
      triangelBottom =
        'M 6.414 9 h 11.172 a 1 1 0 0 1 0.707 1.707 l -5.586 5.586 a 1 1 0 0 1 -1.414 0 l -5.586 -5.586 A 1 1 0 0 1 6.414 9 Z';

    if (!selectedDisease) return;
    if (!selectedDrug) return;

    const ICON_WIDTH = 70;

    let offsetY = 0;
    let summary = metaPathGroups.map((group, pathIdx) => {
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

      let showChildren = this.state.expand[pathIdx];
      let children = group.metaPaths.map((path, childIdx) => {
        let nodes = path.nodes.map((node, nodeIdx) => {
          const { nodeId, nodeType } = node;
          let nodeName = nodeNameDict[nodeType][nodeId];

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
              <g transform={translate}>
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
            transform={`translate(${ICON_WIDTH}, ${
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
        offsetY += (NODE_HEIGHT + VERTICAL_GAP) * group.metaPaths.length;
      }

      offsetY += this.GROUP_GAP;

      return (
        <g
          key={`prototype_${pathIdx}`}
          transform={`translate(${0}, ${currentY})`}
        >
          <g className="icon">
            <text x={10} y={NODE_HEIGHT / 2 + 6} textAnchor="middle">
              {group.metaPaths.length}
            </text>
            <path
              d={showChildren ? triangelBottom : triangleRight}
              transform={`translate(${25}, 0)`}
              fill="gray"
              onClick={() => this.expandType(pathIdx)}
              cursor="pointer"
            />
          </g>
          <g className="prototype" transform={`translate(${ICON_WIDTH}, 0)`}>
            {nodes}
            {edges}
          </g>
          <g className="metapaths">{showChildren ? children : <g />}</g>
        </g>
      );
    });
    return summary;
  }
  showModal() {
    this.setState({ isModalVisible: true });
  }
  hideModal() {
    this.setState({ isModalVisible: false });
  }
  render() {
    const { width, height } = this.props,
      { isModalVisible } = this.state,
      { metaPathGroups, isAttentionLoading } = this.props.globalState;
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
    return (
      <>
        <Card
          size="small"
          title="Path Matrix"
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
            <g className="dummy" transform={`translate(${0}, ${this.PADDING})`}>
              {isAttentionLoading ? <></> : this.drawSummary()}
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
