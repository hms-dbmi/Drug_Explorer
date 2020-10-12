import React from 'react';
import Drug from 'components/Drug/'
import Viral from 'components/Viral'
import Model from 'components/Model/'
import Diseases from 'components/Diseases'
import { Layout, Switch, Select, InputNumber, Slider } from 'antd'
import './App.css';
import {virus_target as virus2target} from 'data/virus.json'




const { Header, Footer, Sider, Content } = Layout;
const { Option } = Select

interface State {
  selectedDrugID: string,
  // selectedDrugIDs: string[],
  drugMode: TDrugMode,
  modelMode: 'layered'|'bar'|string,
  netName: string,
  viralProtein:string,
  maxPathLen: number,
  onlyExp:boolean,
  // transform of the graph 
  scale: number
}

type TDrugMode = 'heat'|'pcp'
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
      drugMode: 'heat',
      modelMode: 'layered',
      maxPathLen: 1,
      onlyExp: true,
      scale:1,
    }
    this.selectDrug = this.selectDrug.bind(this)
    this.toggleDrugFlag = this.toggleDrugFlag.bind(this)
    this.toggleModelFlag = this.toggleModelFlag.bind(this)
    this.changeNet = this.changeNet.bind(this)
    this.changeMaxPathLen = this.changeMaxPathLen.bind(this)
    this.hoverViralProtein = this.hoverViralProtein.bind(this)
    this.unhoverViralProtein = this.unhoverViralProtein.bind(this)

    this.changeScale = this.changeScale.bind(this)
    
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
    let { drugMode } = this.state
    if (drugMode==='heat'){
      drugMode ='pcp'
    } else {
      drugMode='heat'
    }
    this.setState({
      drugMode
    })
  }

  toggleModelFlag() {
    let { modelMode } = this.state
    if (modelMode=='layered'){
      modelMode='bar'
    }else{
      modelMode="layered"
    }
    this.setState({ modelMode })
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

  changeScale(scale:number){
    this.setState({scale})
  }


  render() {
    let siderWidth = 200, mainViewWidth = window.innerWidth - 200, mainViewHeight = window.innerHeight,
      headerHeight = 64, footHeight = 40, mainHeight = mainViewHeight - headerHeight - footHeight,
      PPIHeight = mainHeight * 0.785, diseasesHeight = mainHeight - PPIHeight,
      virusWidth = 0.1 * mainViewWidth, modelWidth = 0.6 * mainViewWidth, drugWidth = mainViewWidth - virusWidth - modelWidth
      let legendW = 100

    let { selectedDrugID, drugMode, modelMode, maxPathLen, onlyExp, scale } = this.state   
    let diseaseComponet = <Diseases width={modelWidth} height={diseasesHeight} offsetX={virusWidth} offsetY={PPIHeight}/>


    let header = <Header className='header' style={{ height: headerHeight }}>
      DrugExplorer
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
      <h4>longest path included</h4> <InputNumber min={1} max={4} defaultValue={maxPathLen} onChange={this.changeMaxPathLen} size="small"/>
      <br/> Scale
      <Slider value={scale} min={0} max={1} step={0.1} tooltipVisible onChange={this.changeScale}/>
      <br/>
      only pathes contains explanation nodes <Switch checkedChildren="yes" unCheckedChildren="no" defaultChecked onChange={()=>{
        let {onlyExp} = this.state
        this.setState({onlyExp: !onlyExp})
      }}/>
    </Sider>

    return (
      <Layout>
        {header}

        <Layout>
          {sider}
          <Content className="main" style={{ height: mainHeight }}>
            <svg className="main">
              <g className='wholeGraph' transform={`scale(${scale}) `}  >
              <Viral height={PPIHeight} width={virusWidth} viralProtein={this.state.viralProtein} />
              <Model modelMode={modelMode} height={PPIHeight} width={modelWidth} selectedDrugID={selectedDrugID} offsetX={virusWidth} maxPathLen={maxPathLen} onlyExp={onlyExp}/>
              </g>
              <Drug drugMode={drugMode} height={mainHeight} width={drugWidth} offsetX={virusWidth + modelWidth} selectedDrugID={selectedDrugID} selectDrug={this.selectDrug} />
              
      
              {diseaseComponet}
              <g className="legend" transform={`translate(${virusWidth/2-legendW/2}, ${mainHeight - legendW})`}>
                <foreignObject width={legendW} height={legendW} >
                    <img src='./assets/node_legend.png' width={legendW} />
                </foreignObject>
            </g>
            </svg>

          </Content>
        </Layout>
        <Footer className='footer' style={{ height: footHeight }}>@2020</Footer>
      </Layout>
    );
  }

}


