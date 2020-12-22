import React from "react"
import { StateConsumer } from "stores"
import {IState} from 'types'

import './Sider.css'

import { Col, InputNumber, Layout, Row, Select, Slider } from 'antd'
import { getNodeColor } from "helpers/color";
const { Sider } = Layout;
const { Option } = Select

interface Props {
    siderWidth: number,
    globalState:IState
}

class DrugSider extends React.Component<Props>{
    padding = 10;
    listHeight = 100
    render() {
        let { siderWidth } = this.props
        let {edgeThreshold, nodeTypes} = this.props.globalState
        let sider = <Sider width={siderWidth} theme="light" style={{ padding: `${this.padding}px` }}>
            Disease:
            <Select defaultValue="SARS-COV2" style={{ width: siderWidth - 2 * this.padding }} >
                <Option value="SARS-COVID2">SARS-COV2</Option>
            </Select>
            <br />

            Drug:
            <Select
                defaultValue="drug1"
                style={{ width: siderWidth - 2 * this.padding }}
                open
                showSearch
                filterOption={(input, option) =>
                    option!.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                listHeight={this.listHeight}
            >
                <Option value="drug1">
                    <div>
                        <span>drug1</span>
                        <span style={{ float: "right" }}>score:0.9</span>
                    </div>
                </Option>
                <Option value="drug2">
                    <div>
                        <span>drug2</span>
                        <span style={{ float: "right" }}>score:0.8</span>
                    </div>
                </Option>
            </Select>

            <div className='dummy' style={{height: this.listHeight}}/>

            Edge Threshold:
            <Row>
                <Col span={16}>
                    <Slider step={0.1} value={edgeThreshold} min={0} max={1} />
                </Col>
                <Col span={4}>
                    <InputNumber value={edgeThreshold}/>
                </Col>
            </Row>


            <div className="nodeTypes">
            Node Types:
            <br/>
            {nodeTypes.map(nodeType=>{
                return <div key={nodeType} style={{marginLeft:"5px"}}> 
                    <input type="checkbox" style={{margin:"2px"}}/>
                    <span style={{background: getNodeColor(nodeType), color:"white", padding: "2px"}}>{nodeType}</span>
                </div>
            })}
            </div>
            

        </Sider>

        return sider
    }
}

export default StateConsumer(DrugSider)