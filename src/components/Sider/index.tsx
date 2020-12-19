import React from "react"
import { Layout, Select } from 'antd'
const { Sider } = Layout;
const { Option } = Select

interface Props {
    siderWidth: number
}

export default class DrugSider extends React.Component<Props>{
    padding = 10
    render() {
        let { siderWidth } = this.props
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
                    option!.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                listHeight={100}
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

        </Sider>

        return sider
    }
}