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
  constructor(props: Props) {
    super(props);
    this.state = { embedding: {} };
  }
  async loadEmbedding() {
    const embedding = await requestEmbedding();
    this.setState({ embedding });
  }
  componentDidMount() {
    this.loadEmbedding();
  }
  drawScatter() {
    const {
      drugPredictions,
      nodeNameDict,
      selectedDrug,
    } = this.props.globalState;
    const { width, height } = this.props;
    const { embedding } = this.state;
    const xDomain = d3.extent(Object.values(embedding).map((d) => d[0])) as [
        number,
        number
      ],
      yDomain = d3.extent(Object.values(embedding).map((d) => d[1])) as [
        number,
        number
      ];

    const xScale = d3.scaleLinear().domain(xDomain).range([0, width]);
    const yScale = d3.scaleLinear().domain(yDomain).range([0, height]);

    const R = 3;
    const drugIds = drugPredictions.map((d) => d.id);

    const nodes = Object.keys(embedding)
      .sort((a, b) => drugIds.indexOf(a) - drugIds.indexOf(b))
      .map((drug_id) => {
        const [x, y] = embedding[drug_id];
        const isHighlighted = drugIds.includes(drug_id); // the top n predicted drugs
        const isSelected = selectedDrug === drug_id; // the drug selected by users
        const tipText = `drug: ${nodeNameDict['drug'][drug_id]}`;
        return (
          <Tooltip destroyTooltipOnHide title={tipText} key={drug_id}>
            <g key={drug_id}>
              <circle
                cx={xScale(x)}
                cy={yScale(y)}
                fill={isHighlighted ? HIGHLIGHT_COLOR : 'lightGray'}
                opacity={0.5}
                stroke={'white'}
                r={isHighlighted ? R * 1.5 : R}
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
      <svg width={width} height={height}>
        <g className="scatter">
          {selectedDisease ? (
            this.drawScatter()
          ) : (
            <text x={width / 2} y={height / 2} fill="gray">
              Please select a disease first
            </text>
          )}
          {isDrugLoading ? (
            <g
              transform={`translate(${width / 2}, ${height / 2})`}
              textAnchor="middle"
            >
              {LOADING_ICON}
            </g>
          ) : (
            <g />
          )}
        </g>{' '}
      </svg>
    );
  }
}
