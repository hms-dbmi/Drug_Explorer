import React from 'react';
import { requestEmbedding } from 'stores/DataService';
import { IState } from 'types';
import * as d3 from 'd3';
import { HIGHLIGHT_COLOR, SELECTED_COLOR } from 'helpers/color';
import { LOADING_ICON } from 'helpers';

interface State {
  embedding: { [key: string]: [number, number] };
}
interface Props {
  width: number;
  height: number;
  globalState: IState;
}

export default class Scatter extends React.Component<Props, State> {
  circleRadius = 3;
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
    const { drugPredictions, selectedDrug } = this.props.globalState;
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

    const xScale = d3
      .scaleLinear()
      .domain(xDomain)
      .range([0, width - this.circleRadius * 2]);
    const yScale = d3
      .scaleLinear()
      .domain(yDomain)
      .range([0, height - this.circleRadius * 2]);

    const drugIds = drugPredictions.map((d) => d.id);

    const nodes = Object.keys(embedding)
      .sort((a, b) => drugIds.indexOf(a) - drugIds.indexOf(b))
      .map((drugId) => {
        const [x, y] = embedding[drugId];
        const drugRank = drugIds.indexOf(drugId);
        const isHighlighted = drugRank > -1; // the top n predicted drugs
        const isSelected = selectedDrug === drugId; // the drug selected by users
        return (
          <g key={drugId}>
            <circle
              cx={xScale(x)}
              cy={yScale(y)}
              fill={
                isSelected
                  ? SELECTED_COLOR
                  : isHighlighted
                  ? HIGHLIGHT_COLOR
                  : 'lightGray'
              }
              stroke={'white'}
              r={isHighlighted ? this.circleRadius * 1.5 : this.circleRadius}
            />
          </g>
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
            this.state.embedding ? (
              this.drawScatter()
            ) : (
              <g
                transform={`translate(${width / 2}, ${height / 2})`}
                textAnchor="middle"
              >
                {LOADING_ICON}
              </g>
            )
          ) : (
            <text x={width / 2} y={height / 2} fill="gray">
              Please select a disease first
            </text>
          )}
          {/* overlap a loading icon when loading */}
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
