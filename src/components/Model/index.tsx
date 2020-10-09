import React, {FC} from "react"
import ModelBar from './ModelBar'
import ModelNode from './ModelNodeForceLayered'

interface Props {
    height: number,
    width: number,
    offsetX: number,
    selectedDrugID: string,
    maxPathLen: number,
    onlyExp: boolean,
    modelMode:string
}

const Drug : FC<Props>= ({height, width, offsetX, selectedDrugID, maxPathLen, onlyExp, modelMode})=>{
    return modelMode==='layered'?
    <ModelNode height={height} width={width} selectedDrugID={selectedDrugID} offsetX={offsetX} maxPathLen={maxPathLen} onlyExp={onlyExp}/>
    :
    <ModelBar height={height} width={width} selectedDrugID={selectedDrugID} offsetX={offsetX} />
}

export default Drug