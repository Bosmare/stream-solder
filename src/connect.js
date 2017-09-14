import React from 'react'
import R from 'ramda'

const parse = arg => arg === 0 ? [] : arg.split(' ')

const connect = (inputs, outputs = 0) => Component => {
	const
		ins = parse(inputs),
		outs = parse(outputs)

	return class Connector extends React.Component {

		constructor(props) {
			super(props)
			this.state = {}
		}

		componentWillMount(){
			this.outs = R.pipe(
				R.map(name => [name, window.getActionEmitter(name).value]),
				R.fromPairs
			) (outs)			
		}

		componentDidMount() {
			this.subscriptions = ins.map(
				name => window.subscribeToProperty(
					name,
					value => {
						this.setState({[name]: value})
						this.active = true
					}
				)
			)
		}

		componentWillUnmount() {
			this.subscriptions.forEach(
				sub => sub.unsubscribe()
			)
		}

		render = () => {
			return (
				(R.length(ins) === R.length(R.keys(this.state)))
					? <Component {...this.state} {...this.outs} {...this.props}/>
					: null
			)
		}
	}
}

export default connect