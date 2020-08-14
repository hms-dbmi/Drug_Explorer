import * as React from "react"

interface Props {
    height: number,
    width: number
}

interface State {
    
}

export default class Model extends React.Component<Props, State>{
    render(){
        return <div className='model'>
            Model
            </div>
    }
}