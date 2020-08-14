import React from 'react';
import Drug from 'components/Drug'
import Viral from 'components/Viral'
import Model from 'components/Model'
import { Layout, Divider, Row, Col } from 'antd'
import './App.css';

const { Header, Footer, Sider, Content } = Layout;

function App() {
  let allWidth = window.innerWidth, allHeight = window.innerHeight,
    headerHeight = 64, footHeight = 60, mainHeight = allHeight-headerHeight-footHeight,
    virusWidth = 0.15*allWidth, modelWidth = 0.5 * allWidth, drugWidth = allWidth - virusWidth - modelWidth

  return (
    <Layout>
      <Header className='header' style={{height: headerHeight}}>Header</Header>
      <Content className="main" style={{height: mainHeight}}>
        <svg className="main">
          <Viral height= {mainHeight} width= {virusWidth}/>
          <Model height= {mainHeight} width= {modelWidth}/>
          <Drug height= {mainHeight} width= {drugWidth}/>
        </svg>
        
      </Content>
      <Footer className='footer' style={{height:footHeight}}>Footer</Footer>
    </Layout>
  );
}

export default App;
