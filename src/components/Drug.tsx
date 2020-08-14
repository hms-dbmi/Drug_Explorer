import * as React from "react"

interface Props {
    height: number,
    width: number
}

interface State {
    
}

export default class Drug extends React.Component<Props, State>{
    render(){
        return <div className='drug'>
            Drug
            </div>
    }
}