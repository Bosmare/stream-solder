# stream-solder
Reactive state handling for React.js using Kefir.js and Ramda.js

## Installation
```
npm install @bosmare/stream-solder
```

## Example usage
Client for a multi-user counter app (ES6)

### app.js
```
import Counter from './Counter.js'

import {initializeStreams} from 'stream-solder'
import streamDefinitions from './streamDefinitions.js'
initializeStreams(streamDefinitions)


class App extends Component {
    render = () => <Counter />
}

React.render(<App />, document.getElementByID('app'))
```

### Counter.js
```
import {connect} from 'stream-solder'

const Counter = ({count, onCountAdded}) => ({
    <div>
        <h1> {this.state.count + 1} </h1>
        <button onClick={onCountAdded}> +1 </button>
    </div>
})

export default connect(
    'count',
    'onCountAdded'
)(Counter)
```

### streamDefinitions.js
```
import {openWS, sendCountAdded} from './api.js'

//names of streams originating from the application
const actions = [
    'onCountAdded',
]

//names of property streams and their initial values
const properties = {
    count: 0
}

//functions for defining reactive streams
//take a list of event streams
const connections = [
    () => ({count: openWS()}),
    ({onCountAdded}) => {sendCountAdded(onCountAdded)},
]

export default {actions, properties, connections}
```

### api.js
```
import {createStream} from 'stream-solder/utils'
import {serverIP} from './constants'

let WS

export const openWS = () => {

    let {emitter, stream} = createStream()

    WS = new WebSocket(serverIP)

    WS.onopen = () => {
        emitter.value('websocket opened')
    }
    WS.onmessage = emitter.value
    WS.onerror = emitter.error
    WS.onclose = emitter.end

    return stream
}

export const sendCountAdded = stream => {
    stream.observe({
        value: WS.message,
        error: WS.error,
        end: WS.close
    })
}
```
