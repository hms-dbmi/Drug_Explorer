import React from 'react';
import DrugPCP from 'components/DrugPCP'
import DrugHeat from 'components/DrugHeat'
import Viral from 'components/Viral'
import ModelNodeForce from 'components/ModelNodeForce'
import ModelBar from 'components/ModelBar'
import { Layout, Switch, Select} from 'antd'
import './App.css';

const { Header, Footer, Sider, Content } = Layout;
const {Option} = Select

interface State {
  selectedDrugID: string,
  // selectedDrugIDs: string[],
  drugFlag: boolean,
  modelFlag: boolean,
  netName:string,
}
interface Props {

}

export default class App extends React.Component<Props, State>{
  constructor(props: Props) {
    super(props)
    this.state = {
      // selectedDrugIDs: [],
      selectedDrugID:'DB13179',
      netName: 'A1',
      drugFlag: true,
      modelFlag: true
    }
    this.selectDrug = this.selectDrug.bind(this)
    this.toggleDrugFlag = this.toggleDrugFlag.bind(this)
    this.toggleModelFlag = this.toggleModelFlag.bind(this)
    this.changeNet = this.changeNet.bind(this)
  }

  selectDrug(drugID: string) {
    if (drugID == this.state.selectedDrugID) {
      this.setState({ selectedDrugID: '' })
    } else {
      this.setState({ selectedDrugID: drugID })
    }
    // let {selectedDrugIDs} = this.state
    // let drugIdx = selectedDrugIDs.indexOf(drugID)
    // if (drugIdx ==-1){
    //   selectedDrugIDs.push(drugID)
    // }else{
    //   selectedDrugIDs.splice(drugIdx)
    // }
  }

  toggleDrugFlag(){
    let {drugFlag} = this.state
    this.setState({
      drugFlag: !drugFlag
    })
  }

  toggleModelFlag(){
    let {modelFlag} = this.state
    this.setState({
      modelFlag: !modelFlag
    })
  }

  changeNet(netName:string){
    if (netName!== this.state.netName){
      this.setState({netName})
    }
  }

  render() {
    let allWidth = window.innerWidth, allHeight = window.innerHeight,
      headerHeight = 64, footHeight = 60, mainHeight = allHeight - headerHeight - footHeight,
      virusWidth = 0.15 * allWidth, modelWidth = 0.6 * allWidth, drugWidth = allWidth - virusWidth - modelWidth

    let {selectedDrugID, drugFlag, modelFlag, netName} = this.state

    let modelComponent = modelFlag?
      <ModelNodeForce height={mainHeight} width={modelWidth} selectedDrugID={selectedDrugID} offsetX={virusWidth} netName={netName}/>
      :
      <ModelBar height={mainHeight} width={modelWidth} selectedDrugID={selectedDrugID} offsetX={virusWidth}/>


    let drugComponent = drugFlag?
      <DrugHeat height={mainHeight} width={drugWidth} offsetX={virusWidth + modelWidth} selectedDrugID={selectedDrugID} selectDrug={this.selectDrug} />
      :
      <DrugPCP height={mainHeight} width={drugWidth} offsetX={virusWidth + modelWidth} selectedDrugID={selectedDrugID} selectDrug={this.selectDrug} /> 

    return (
      <Layout>
        <Header className='header' style={{ height: headerHeight }}>
          Header
          <span style={{float:'right', fontSize: '12px'}}>
            {/* Explanation for  
            <Select defaultValue="A1" style={{ width: 120 }} onChange={this.changeNet}>
            <Option value="A1">A1</Option>
            <Option value="A2">A2</Option>
            <Option value="A3">A3</Option>
            <Option value="A4">A4</Option>
          </Select> */}
          Model <Switch checkedChildren="node-link" unCheckedChildren="bar-agg" defaultChecked onChange={this.toggleModelFlag}/>
          Drug <Switch checkedChildren="heat" unCheckedChildren="pcp" defaultChecked onChange={this.toggleDrugFlag}/>
          </span>
        </Header>
        <Content className="main" style={{ height: mainHeight }}>
          <svg className="main">
            <Viral height={mainHeight} width={virusWidth} />
            {modelComponent}
            {drugComponent}
          </svg>

        </Content>
        <Footer className='footer' style={{ height: footHeight }}>Footer</Footer>
      </Layout>
    );
  }

}


