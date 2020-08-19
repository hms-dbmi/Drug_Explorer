import React from 'react';
import DrugPCP from 'components/DrugPCP'
import DrugHeat from 'components/DrugHeat'
import Viral from 'components/Viral'
import ModelNode from 'components/ModelNode'
import ModelBar from 'components/ModelBar'
import { Layout, Switch} from 'antd'
import './App.css';

const { Header, Footer, Sider, Content } = Layout;

interface State {
  selectedDrugID: string,
  drugFlag: boolean,
  modelFlag: boolean
}
interface Props {

}

export default class App extends React.Component<Props, State>{
  constructor(props: Props) {
    super(props)
    this.state = {
      selectedDrugID: '',
      drugFlag: true,
      modelFlag: true
    }
    this.selectDrug = this.selectDrug.bind(this)
    this.toggleDrugFlag = this.toggleDrugFlag.bind(this)
    this.toggleModelFlag = this.toggleModelFlag.bind(this)
  }

  selectDrug(drugID: string) {
    if (drugID == this.state.selectedDrugID) {
      this.setState({ selectedDrugID: '' })
    } else {
      this.setState({ selectedDrugID: drugID })
    }
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

  render() {
    let allWidth = window.innerWidth, allHeight = window.innerHeight,
      headerHeight = 64, footHeight = 60, mainHeight = allHeight - headerHeight - footHeight,
      virusWidth = 0.15 * allWidth, modelWidth = 0.6 * allWidth, drugWidth = allWidth - virusWidth - modelWidth

    let {selectedDrugID, drugFlag, modelFlag} = this.state

    let modelComponent = modelFlag?
      <ModelNode height={mainHeight} width={modelWidth} selectedDrugID={selectedDrugID} offsetX={virusWidth}/>
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


