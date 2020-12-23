import React from 'react';
import PathMatrix from 'components/PathMatrix'
import NodeLink from 'components/NodeLink'
import DrugSider from 'components/Sider'

import { Layout} from 'antd'
import './App.css';
import {  StateConsumer } from 'stores';
import {IState, IDispatch} from 'types'
import {ACTION_TYPES} from 'stores/actions'
import { requestNodeTypes, requestEdgeTypes} from 'stores/DataService';




const { Header, Footer, Content } = Layout;

interface Props {
  globalState: IState,
  dispatch: IDispatch
}
interface State {
  width: number
  height:number,
}


class App extends React.Component<Props, State>{
  constructor(props: Props){
    super(props)
    this.state={
      width: window.innerWidth,
      height: window.innerHeight
    }

    this.updateSize = this.updateSize.bind(this)
  }

  updateSize(){
    this.setState({
      width:window.innerWidth,
      height:window.innerHeight
    })
  }

  componentDidMount(){
    window.addEventListener('resize', this.updateSize)

    requestNodeTypes()
    .then((nodeTypes)=>{
        this.props.dispatch({type: ACTION_TYPES.Load_Node_Types, payload: {nodeTypes} })
    })

    requestEdgeTypes()
    .then((edgeTypes)=>{
        this.props.dispatch({type: ACTION_TYPES.Load_Edge_Types, payload: {edgeTypes} })
    })
    
  }

  componentWillUnmount(){
    window.removeEventListener('resize', this.updateSize)
  }

  render() {
    let siderWidth = 300, mainViewWidth = window.innerWidth - 200, 
      headerHeight = 64, footHeight = 40, mainViewHeight = window.innerHeight - headerHeight - footHeight,
      NodeLinkHeight = mainViewHeight * 0.6, MatrixHeight = mainViewHeight - NodeLinkHeight
    

    let header = <Header className='header' style={{ height: headerHeight }}>
      DrugExplorer
    </Header>



    return (
      <Layout>
        {header}

        <Layout>
          <DrugSider siderWidth={siderWidth}/>
          <Content className="main" style={{ height: mainViewHeight }}>          

              <NodeLink  width={mainViewWidth} height={NodeLinkHeight}/>
              <PathMatrix width={mainViewWidth} height={MatrixHeight}/>

          </Content>
        </Layout>
        <Footer className='footer' style={{ height: footHeight }}>@2020</Footer>
      </Layout>
    );
  }

}


export default StateConsumer(App)