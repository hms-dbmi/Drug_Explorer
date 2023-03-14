import React from 'react';
import { requestEmbedding } from 'stores/DataService';
import { IState, IDispatch } from 'types';
import { StateConsumer } from 'stores';
import * as d3 from 'd3';
import { HIGHLIGHT_COLOR, SELECTED_COLOR } from 'helpers/color';
import { LOADING_ICON } from 'helpers';
import { selectDrug } from 'stores/actions';
import { isAddDrug } from 'stores/reducer';
import lasso from './lasso.js';

interface State {
  embedding: { [key: string]: [number, number] };
  tooltip: {
    visible: boolean;
    info: string;
    position: [number, number];
  };
}
interface Props {
  width: number;
  height: number;
  globalState: IState;
  dispatch: IDispatch;
}

class Scatter extends React.Component<Props, State> {
  circleRadius = 3;
  hoverTimeout: number = 0;
  WAIT = 500;
  constructor(props: Props) {
    super(props);
    this.state = {
      embedding: {},
      tooltip: { visible: false, info: '', position: [0, 0] },
    };
    this.onChangeDrug = this.onChangeDrug.bind(this);
  }
  async loadEmbedding() {
    const embedding = await requestEmbedding();
    this.setState({ embedding });
  }
  componentDidMount() {
    this.loadEmbedding();
  }

  addLasso(width: number, height: number) {
    const { drugPredictions } = this.props.globalState;
    const selectedDrugIds = drugPredictions
      .filter((d) => d.selected)
      .map((d) => d.id);
    // lasso draw
    d3.selectAll('g.lasso').remove();
    var svg = d3.select('svg.scatter');

    var lasso_area = d3.select('rect.lasso');

    // Lasso functions to execute while lassoing
    var lasso_start = () => {
      // (mylasso.items() as any).attr('r', 5); // reset size
      // .attr('fill', 'white')
    };

    var lasso_draw = () => {
      // Style the possible dots
      // mylasso
      // .possibleItems()
      // .classed("possible", true)
    };

    var lasso_end = () => {
      // mylasso.selectedItems()
      //     .attr('fill', colors[this.selected.length])
      //     .attr('r', '7')
      //     .classed(`group_${this.selected.length}`, true)
      // mylasso
      // .items()
      // .classed("possible", false)

      (mylasso.selectedItems() as any)._groups[0].forEach((d: any) => {
        const drugID = d.attributes.id.value;
        if (!selectedDrugIds.includes(drugID)) {
          selectDrug(
            drugID,
            this.props.globalState.selectedDisease,
            true,
            this.props.dispatch
          );
        }
      });
    };

    var mylasso = lasso();
    mylasso.items(svg.selectAll('circle.highlighted'));
    mylasso
      .targetArea(lasso_area) // area where the lasso can be started
      .on('start', lasso_start) // lasso start function
      .on('draw', lasso_draw) // lasso draw function
      .on('end', lasso_end); // lasso end function

    svg.call(mylasso);
  }
  drawScatter() {
    const { drugPredictions } = this.props.globalState;
    const { width, height } = this.props;

    // this.addLasso(width, height);

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
      .range([this.circleRadius, width - this.circleRadius]);
    const yScale = d3
      .scaleLinear()
      .domain(yDomain)
      .range([this.circleRadius, height - this.circleRadius]);

    const drugIds = drugPredictions.map((d) => d.id);
    const selectedDrugIds = drugPredictions
      .filter((d) => d.selected)
      .map((d) => d.id);

    const getSortIndex = (drugId: string) =>
      drugIds.indexOf(drugId) > -1 ? drugIds.indexOf(drugId) : drugIds.length; // sort by drug rank

    const nodes = Object.keys(embedding)
      .sort((a, b) => -getSortIndex(a) + getSortIndex(b)) // sort by drug rank
      .map((drugId) => {
        const [x, y] = embedding[drugId];
        const drugRank = drugIds.indexOf(drugId);
        const isHighlighted = drugRank > -1; // the top n predicted drugs
        const isSelected = selectedDrugIds.includes(drugId); // the drug selected by users

        return (
          <circle
            cx={xScale(x)}
            cy={yScale(y)}
            key={drugId}
            className={isHighlighted ? 'highlighted drug' : 'drug'}
            id={drugId}
            fill={
              isSelected
                ? SELECTED_COLOR
                : isHighlighted
                ? HIGHLIGHT_COLOR
                : 'lightGray'
            }
            opacity={isSelected ? 1 : 0.7}
            stroke={'white'}
            r={
              isSelected
                ? this.circleRadius * 1.5
                : isHighlighted
                ? this.circleRadius * 1.1
                : this.circleRadius
            }
            onDoubleClick={() => {
              if (isHighlighted) this.onChangeDrug(drugId);
            }}
            onClick={() => this.showTooltip(drugId, [xScale(x), yScale(y)])}
            // onMouseLeave={() => this.hideTooltip()}
          />
        );
      });
    return nodes;
  }
  onChangeDrug(selectedDrug: string) {
    const isAdd = isAddDrug(
      this.props.globalState.drugPredictions,
      selectedDrug
    );
    selectDrug(
      selectedDrug,
      this.props.globalState.selectedDisease,
      isAdd,
      this.props.dispatch
    );
  }
  showTooltip(drugId: string, position: [number, number]) {
    const { nodeNameDict } = this.props.globalState;
    this.hoverTimeout = window.setTimeout(() => {
      this.setState({
        tooltip: {
          visible: true,
          info: `drug: ${nodeNameDict['drug'][drugId]}`,
          position,
        },
      });
    }, this.WAIT);
  }
  hideTooltip() {
    window.clearTimeout(this.hoverTimeout);
    this.setState({
      tooltip: {
        visible: false,
        info: ``,
        position: [0, 0],
      },
    });
  }
  render() {
    const { isDrugLoading, isInitializing } = this.props.globalState;
    const { width, height } = this.props;
    const { tooltip } = this.state;

    return (
      <div style={{ position: 'relative' }}>
        <svg width={width} height={height} className="scatter">
          <rect
            className="lasso area"
            width={width}
            height={height}
            opacity={0}
          />
          <g className="scatter">
            {this.state.embedding ? (
              this.drawScatter()
            ) : (
              <g
                transform={`translate(${width / 2}, ${height / 2})`}
                textAnchor="middle"
              >
                {LOADING_ICON}
              </g>
            )}
            {/* overlap a loading icon when loading */}
            {isDrugLoading && !isInitializing ? (
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
          <text x={0} y={height - 25} fontSize={12} fill="gray">
            Click to reveal the drug name.
          </text>
          <text x={0} y={height - 10} fontSize={12} fill="gray">
            Double click to select the drug.
          </text>
        </svg>
        <div
          className={`tooltip tooltip-${tooltip.visible ? 'show' : 'hide'}`}
          style={{
            left: tooltip.position[0] + this.circleRadius,
            top: tooltip.position[1] + this.circleRadius,
          }}
        >
          {tooltip.info}
        </div>
      </div>
    );
  }
}

export default StateConsumer(Scatter);
