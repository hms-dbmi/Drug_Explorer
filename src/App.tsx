import React from 'react';
import Drug from 'components/Drug'
import DrugHeat from 'components/DrugHeat'
import Viral from 'components/Viral'
import Model from 'components/Model'
import { Layout} from 'antd'
import './App.css';

const { Header, Footer, Sider, Content } = Layout;

interface State {
  selectedDrugID: string
}
interface Props {

}

export default class App extends React.Component<Props, State>{
  constructor(props: Props) {
    super(props)
    this.state = {
      selectedDrugID: ''
    }
    this.selectDrug = this.selectDrug.bind(this)
  }

  selectDrug(drugID: string) {
    if (drugID == this.state.selectedDrugID) {
      this.setState({ selectedDrugID: '' })
    } else {
      this.setState({ selectedDrugID: drugID })
    }
  }

  render() {
    let allWidth = window.innerWidth, allHeight = window.innerHeight,
      headerHeight = 64, footHeight = 60, mainHeight = allHeight - headerHeight - footHeight,
      virusWidth = 0.15 * allWidth, modelWidth = 0.6 * allWidth, drugWidth = allWidth - virusWidth - modelWidth

    let {selectedDrugID} = this.state

    return (
      <Layout>
        <Header className='header' style={{ height: headerHeight }}>Header</Header>
        <Content className="main" style={{ height: mainHeight }}>
          <svg className="main">
            <Viral height={mainHeight} width={virusWidth} />
            <Model height={mainHeight} width={modelWidth} selectedDrugID={selectedDrugID} offsetX={virusWidth}/>
            {/* <Drug height={mainHeight} width={drugWidth} offsetX={virusWidth + modelWidth} selectedDrugID={selectedDrugID} selectDrug={this.selectDrug} /> */}
            <DrugHeat height={mainHeight} width={drugWidth} offsetX={virusWidth + modelWidth} selectedDrugID={selectedDrugID} selectDrug={this.selectDrug} />
          </svg>

        </Content>
        <Footer className='footer' style={{ height: footHeight }}>Footer</Footer>
      </Layout>
    );
  }

}


