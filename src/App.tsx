import React from 'react';
import DrugPCP from 'components/DrugPCP'
import DrugHeat from 'components/DrugHeat'
import Viral from 'components/Viral'
import ModelNodeForce from 'components/ModelNodeForce'
import ModelBar from 'components/ModelBar'
import { Layout, Switch, Select, InputNumber } from 'antd'
import './App.css';
import {virus_target as virus2target} from 'data/virus.json'


import * as d3 from "d3"



const { Header, Footer, Sider, Content } = Layout;
const { Option } = Select

interface State {
  selectedDrugID: string,
  // selectedDrugIDs: string[],
  drugFlag: boolean,
  modelFlag: boolean,
  netName: string,
  viralProtein:string,
  maxPathLen: number,
}
interface Props {

}

export default class App extends React.Component<Props, State>{
  constructor(props: Props) {
    super(props)
    this.state = {
      // selectedDrugIDs: [],
      selectedDrugID: 'DB13179',
      viralProtein: '',
      netName: 'A1',
      drugFlag: true,
      modelFlag: true,
      maxPathLen: 1
    }
    this.selectDrug = this.selectDrug.bind(this)
    this.toggleDrugFlag = this.toggleDrugFlag.bind(this)
    this.toggleModelFlag = this.toggleModelFlag.bind(this)
    this.changeNet = this.changeNet.bind(this)
    this.changeMaxPathLen = this.changeMaxPathLen.bind(this)
    this.hoverViralProtein = this.hoverViralProtein.bind(this)
    this.unhoverViralProtein = this.unhoverViralProtein.bind(this)

    
    
  }

  selectDrug(drugID: string) {
    if (drugID === this.state.selectedDrugID) {
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

  toggleDrugFlag() {
    let { drugFlag } = this.state
    this.setState({
      drugFlag: !drugFlag
    })
  }

  toggleModelFlag() {
    let { modelFlag } = this.state
    this.setState({
      modelFlag: !modelFlag
    })
  }

  changeNet(netName: string) {
    if (netName !== this.state.netName) {
      this.setState({ netName })
    }
  }

  changeMaxPathLen(len:number|undefined|string){
    // console.info('change max path len', len)
    if (typeof(len) ==='undefined') return
    else{
      this.setState({
        maxPathLen:len as number
      })
    }
    
  }

  // hoverViralProtein(e:any){
  //   let viralProtein = e.target.value
  //   if (viralProtein!==undefined){
  //     this.setState({viralProtein})
  //   }
  //   // let hosts = (virus2target as VT)[viralProtein]

  //   // if (hosts===undefined)  return

  //   // d3.selectAll('.virus_host')
  //   //   .style('opacity', 0.2)
    
  // }

  hoverViralProtein(viralProtein:string){
    
    if (viralProtein!==undefined){
      this.setState({viralProtein})
    }
    // let hosts = (virus2target as VT)[viralProtein]

    // if (hosts===undefined)  return

    // d3.selectAll('.virus_host')
    //   .style('opacity', 0.2)
    
  }


  unhoverViralProtein(){
    // d3.selectAll('.virus_host')
    //   .style('opacity', 1)
    this.setState({viralProtein:''})
  }

  render() {
    let siderWidth = 200, mainViewWidth = window.innerWidth - 200, mainViewHeight = window.innerHeight,
      headerHeight = 64, footHeight = 60, mainHeight = mainViewHeight - headerHeight - footHeight,
      virusWidth = 0.1 * mainViewWidth, modelWidth = 0.6 * mainViewWidth, drugWidth = mainViewWidth - virusWidth - modelWidth

    let { selectedDrugID, drugFlag, modelFlag, netName, maxPathLen } = this.state

    let modelComponent = modelFlag ?
      <ModelNodeForce height={mainHeight} width={modelWidth} selectedDrugID={selectedDrugID} offsetX={virusWidth} netName={netName} maxPathLen={maxPathLen} />
      :
      <ModelBar height={mainHeight} width={modelWidth} selectedDrugID={selectedDrugID} offsetX={virusWidth} />


    let drugComponent = drugFlag ?
      <DrugHeat height={mainHeight} width={drugWidth} offsetX={virusWidth + modelWidth} selectedDrugID={selectedDrugID} selectDrug={this.selectDrug} />
      :
      <DrugPCP height={mainHeight} width={drugWidth} offsetX={virusWidth + modelWidth} selectedDrugID={selectedDrugID} selectDrug={this.selectDrug} />


    let header = <Header className='header' style={{ height: headerHeight }}>
      Header
    <span style={{ float: 'right', fontSize: '12px' }}>
        {/* Explanation for  
      <Select defaultValue="A1" style={{ width: 120 }} onChange={this.changeNet}>
      <Option value="A1">A1</Option>
      <Option value="A2">A2</Option>
      <Option value="A3">A3</Option>
      <Option value="A4">A4</Option>
    </Select> */}
    Model <Switch checkedChildren="node-link" unCheckedChildren="bar-agg" defaultChecked onChange={this.toggleModelFlag} />
    Drug <Switch checkedChildren="heat" unCheckedChildren="pcp" defaultChecked onChange={this.toggleDrugFlag} />
      </span>
    </Header>


    let sider = <Sider width={siderWidth} theme="light" style={{padding: "5px"}}>
         <Select defaultValue="SARS-COV2" style={{ width: siderWidth -10}} onChange={this.changeNet}>
        <Option value="SARS-COVID2">SARS-COV2</Option>
      </Select> 
    <br/>
    <div style={{marginBottom: "5px", borderBottom: "lightgray solid 1px", paddingBottom: "5px"}}>
      <h4>viral proteins</h4> 
      <div >{Object.keys(virus2target).map(viralProtein=>{
        let name = viralProtein.replace('sars-cov2','')
        let isHovered = (viralProtein===this.state.viralProtein)
        return <span 
          style={{
            margin: " 2px 4px", padding:"2px 4px", border:`solid ${isHovered?'2px black':'1px lightgray'}`, cursor:"pointer", display:"inline-block",
            color: `${isHovered?'black':'gray'}`
          }} 
          onMouseEnter={()=>this.hoverViralProtein(viralProtein)}  
          onMouseLeave={this.unhoverViralProtein}>
          {name}
        </span>
      })}
      </div>
    </div>
      <h4>longest path included</h4> <InputNumber min={1} max={2} defaultValue={maxPathLen} onChange={this.changeMaxPathLen}/>
    </Sider>

    return (
      <Layout>
        {header}

        <Layout>
          {sider}
          <Content className="main" style={{ height: mainHeight }}>
            <svg className="main">
              <Viral height={mainHeight} width={virusWidth} viralProtein={this.state.viralProtein} />
              {modelComponent}
              {drugComponent}
            </svg>

          </Content>
        </Layout>
        <Footer className='footer' style={{ height: footHeight }}>Footer</Footer>
      </Layout>
    );
  }

}


