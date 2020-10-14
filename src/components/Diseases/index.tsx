import * as React from 'react'
import axios from 'axios'
import { cropText } from "helpers"
import * as d3 from 'd3'
import { Tooltip } from 'antd'
import { color } from 'd3'

interface Props {
    height: number,
    width: number,
    offsetX: number,
    offsetY: number,
    selectedDrugID: string,
}

interface State {
    diseaseDict: {
        [diseaseID: string]: IDisease
    },
    selectedDiseaseID:string
}

interface IDisease {
    disease: string,
    diseaseID: string,
    proteins: string[],
    drugs: string[]
}

export default class Diseases extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props)
        this.state = {
            diseaseDict: {},
            selectedDiseaseID: ''
        }
    }
    async getDiseases() {
        const diseaseJson = './data/diseaseFiltered.json'
        let res = await axios.get(diseaseJson)
        let diseaseDict: { [diseaseID: string]: IDisease } = res.data

        this.setState({ diseaseDict })
    }

    clickDisease(diseaseID:string){
        
        let { diseaseDict, selectedDiseaseID } = this.state
        if (selectedDiseaseID === diseaseID){
            this.setState({selectedDiseaseID: ''})

            d3.selectAll('g.protein').style('opacity', 1)
        }else{
            this.setState({
                selectedDiseaseID: diseaseID
            })
        
            d3.selectAll('g.protein').style('opacity', 0.2)
       
        let disease = diseaseDict[diseaseID]

        disease['proteins'].forEach((proteinID)=>{
            let selectProtein = d3.select(`#protein_${proteinID}`)
            if (selectProtein.size()===0) return
            else {
                selectProtein.style('opacity', 1)
                // let translate = selectProtein.attr('transform')
                // let [transX, transY] = translate.substring(translate.indexOf("(")+1, translate.indexOf(")")).split(",")
                // console.info(proteinID)
            }
        })
        }
    }

    drawDiseases() {
        let { selectedDrugID, width } = this.props
        let { diseaseDict, selectedDiseaseID } = this.state

        let diseaseNodes: JSX.Element[] = [], nodeWidth = 120, nodeGap = 10, nodeHeight = 20

        Object.keys(diseaseDict).forEach((diseaseID, i) => {
            let disease = diseaseDict[diseaseID]
            if (disease.drugs.includes(selectedDrugID)) {
                let indexX = diseaseNodes.length % Math.floor(width / (nodeWidth + nodeGap)), indexY = Math.floor((nodeWidth + nodeGap) * (diseaseNodes.length + 1) / width)
                let transformX = width - (nodeWidth + nodeGap) * (indexX + 1),
                    transformY = indexY * (nodeHeight + nodeGap) + nodeGap
                let diseaseName = disease['disease']
                let text = cropText(diseaseName, 14, nodeWidth)

                let stroke = (selectedDiseaseID===''|| diseaseID!==selectedDiseaseID ) ?'gray': '#1890ff' 

                let textContent = text === diseaseName ?
                    <text y={14} textAnchor="middle" x={nodeWidth / 2} cursor='pointer' stroke={stroke} >
                        {diseaseName}
                    </text>
                    :
                    <Tooltip title={diseaseName}>
                        <text y={14} textAnchor="middle" x={nodeWidth / 2} stroke={stroke} cursor='pointer'>
                            {cropText(diseaseName, 14, nodeWidth)}
                        </text>
                    </Tooltip>

                diseaseNodes.push(<g key={diseaseName} transform={`translate(${transformX}, ${transformY})`} onClick={()=>this.clickDisease(diseaseID)}>
                    <rect rx='2' width={nodeWidth} height={nodeHeight} stroke={stroke} fill='white' />
                    {textContent}
                </g>)
            }
        })

        return diseaseNodes
    }
    componentDidMount() {
        this.getDiseases()
    }

    render() {
        let { offsetX, offsetY, width, height, selectedDrugID } = this.props
        return <g className='disaseNodes' transform={`translate(${offsetX}, ${offsetY})`}>
            <rect width={width} height={height} fill='none' style={{ stroke: 'gray', strokeDasharray: '4' }} />
            <text y={-10} x={5}>other diseases related to drug {selectedDrugID}</text>
            {this.drawDiseases()}
        </g>
    }
}