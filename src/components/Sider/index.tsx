import React from "react"
import { StateConsumer } from "stores"
import { IDispatch, IState } from 'types'
import { ACTION_TYPES } from 'stores/actions'
import { requestMetaPaths, requestAttention, requestDrugOptions } from 'stores/DataService';

import './Sider.css'

import { Button, Col, InputNumber, Layout, Row, Select, Slider } from 'antd'
import { SearchOutlined } from '@ant-design/icons';
import { getNodeColor } from "helpers/color";
import { reverse } from "dns";
const { Sider } = Layout;
const { Option } = Select

interface Props {
    siderWidth: number,
    globalState: IState,
    dispatch: IDispatch
}

class DrugSider extends React.Component<Props>{
    padding = 10;
    listHeight = 150 // height of the open drug list
    constructor(props: Props) {
        super(props)
        this.changeEdgeTHR = this.changeEdgeTHR.bind(this)
        this.changeDisease = this.changeDisease.bind(this)
        this.changeDrug = this.changeDrug.bind(this)
    }
    startAnalysis() {
        requestMetaPaths()
            .then((metaPaths) => {
                this.props.dispatch({ type: ACTION_TYPES.Load_Meta_Paths, payload: { metaPaths } })
            })

        let { selectedDisease, selectedDrug } = this.props.globalState

        requestAttention([selectedDisease, selectedDrug])
            .then((attention) => {
                this.props.dispatch({ type: ACTION_TYPES.Load_Attention, payload: { attention } })
            })
    }
    changeEdgeTHR(value: number | undefined | string) {
        if (typeof (value) == 'number') {
            this.props.dispatch({
                type: ACTION_TYPES.Change_Edge_THR,
                payload: { edgeThreshold: value }
            })
        }
    }
    changeDrug(selectedDrug: string) {
        this.props.dispatch({
            type: ACTION_TYPES.Change_Drug,
            payload: { selectedDrug }
        })
       
    }
    changeDisease(selectedDisease: string) {
        this.props.dispatch({
            type: ACTION_TYPES.Change_Disease,
            payload: { selectedDisease }
        })

        requestDrugOptions()
        .then((drugOptions) => {
            this.props.dispatch({ type: ACTION_TYPES.Load_Edge_Types, payload: { drugOptions } })
        })

    }
    render() {
        let { siderWidth } = this.props
        let { edgeThreshold, nodeTypes, diseaseOptions, drugOptions, nodeNameDict } = this.props.globalState


        let sider = <Sider width={siderWidth} theme="light" style={{ padding: `${this.padding}px` }}>
            Disease:
            <Select defaultValue="select a disease" style={{ width: siderWidth - 2 * this.padding }} onChange={this.changeDisease}>
                {diseaseOptions.map((d, idx) => {
                    let name = nodeNameDict['disease'][d.split('_')[1]]
                    return <Option value={d} key={`disease_${idx}`}>
                        {name}
                    </Option>
                })}
            </Select>
            <br />

            Drug:
            <Select
                defaultValue="select a drug from the predictions"
                style={{ width: siderWidth - 2 * this.padding }}
                open
                showSearch
                filterOption={(input, option) =>
                    option!.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                listHeight={this.listHeight}
                onChange={this.changeDrug}
            >
                {Object.keys(drugOptions)
                .sort((a,b)=>-drugOptions[a]+drugOptions[b])
                .map((d, idx) => {
                    let name = nodeNameDict['drug'][d.split('_')[1]]
                    return <Option value={d} key={`disease_${idx}`}>
                        
                        <div>
                        <span>{name}</span>
                        <span style={{ float: "right" }}>score: {drugOptions[d].toFixed(2)}</span>
                    </div>
                    </Option>
                })}
            </Select>

            <div className='dummy' style={{ height: this.listHeight + 20 }} />



            Edge Threshold:
            <Row>
                <Col span={16}>
                    <Slider step={0.1} value={edgeThreshold} min={0} max={1} onChange={this.changeEdgeTHR} />
                </Col>
                <Col span={4}>
                    <InputNumber value={edgeThreshold} onChange={this.changeEdgeTHR} step={0.1} />
                </Col>
            </Row>


            <div className="nodeTypes">
                Node Types:
            <br />
                {nodeTypes.map(nodeType => {
                    return <div key={nodeType} style={{ marginLeft: "5px" }}>
                        {/* <input type="checkbox" style={{ margin: "2px" }} /> */}
                        <span style={{ background: getNodeColor(nodeType), color: "white", padding: "2px" }}>{nodeType}</span>
                    </div>
                })}
            </div>

            <br />
            <Button icon={<SearchOutlined />} type='primary' shape='round' onClick={() => this.startAnalysis()}>
                Start Analysis
            </Button>
            <br />


        </Sider>

        return sider
    }
}

export default StateConsumer(DrugSider)