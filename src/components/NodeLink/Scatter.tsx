import React from 'react';
import { requestEmbedding } from 'stores/DataService';
import { IState } from 'types';
import * as d3 from 'd3';
import { HIGHLIGHT_COLOR } from 'helpers/color';
import { LOADING_ICON } from 'helpers';
import { Tooltip } from 'antd';

interface State {
  embedding: { [key: string]: [number, number] };
}
interface Props {
  width: number;
  height: number;
  globalState: IState;
}

export default class Scatter extends React.Component<Props, State> {
  async loadEmbedding() {
    const embedding = await requestEmbedding();
    this.setState({ embedding });
  }
  componentDidMount() {
    this.loadEmbedding();
  }
  drawScatter() {
    const { drugPredictions, nodeNameDict } = this.props.globalState;
    const { width, height } = this.props;
    const { embedding } = this.state;
    const xDomain = Object.values(embedding).map((d) => d[0]),
      yDomain = Object.values(embedding).map((d) => d[1]);

    const xScale = d3.scaleLinear().domain(xDomain).range([0, width]);
    const yScale = d3.scaleLinear().domain(yDomain).range([0, height]);

    const R = 3;

    const nodes = Object.keys(embedding).map((drug_id) => {
      const [x, y] = embedding[drug_id];
      const isHighlighted = drugPredictions.map((d) => d.id).includes(drug_id);
      const tipText = `drug: ${nodeNameDict['drug'][drug_id]}`;
      return (
        <Tooltip destroyTooltipOnHide title={tipText} key={drug_id}>
          <g key={drug_id}>
            <circle
              cx={xScale(x)}
              cy={yScale(y)}
              fill={isHighlighted ? HIGHLIGHT_COLOR : 'lightGray'}
              r={isHighlighted ? R * 5 : R}
            />
          </g>
        </Tooltip>
      );
    });
    return nodes;
  }
  render() {
    const { isDrugLoading, selectedDisease } = this.props.globalState;
    const { width, height } = this.props;

    return (
      <svg>
        <g className="scatter">
          {isDrugLoading ? (
            <g
              transform={`translate(${width / 2}, ${height / 2})`}
              textAnchor="middle"
            >
              {LOADING_ICON}
            </g>
          ) : selectedDisease ? (
            this.drawScatter()
          ) : (
            <text x={width / 2} y={height / 2} fill="gray">
              Please select a drug first
            </text>
          )}
        </g>{' '}
      </svg>
    );
  }
}
