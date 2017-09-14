import K from 'kefir'
import R from 'ramda'

const initializeStreams = ({actions, properties, connections}) => {

	let 
		streams = {},
		emitters = {},
		props = {}

	const plug = (streamMap = {}) => R.pipe(
		R.toPairs,
		R.forEach(([name, stream]) => {
			if (!streams[name]) {
				streams[name] = K.pool()
			}
			streams[name].plug(stream)
		}),
	) (streamMap)

	actions.forEach(name => {
		let emitter
		const stream = K.stream(_emitter => {
			emitter = _emitter
		}).spy('action stream event - ' + name)

		stream.observe(() => {})

		Object.assign(streams, {[name]: stream})
		Object.assign(emitters, {[name]: emitter})
	})

	connections.forEach(connection => {
		plug(connection(streams))
	})

	R.pipe(
		R.toPairs,
		R.forEach(([name, stream]) => {
			if (R.keys(properties).includes(name)) {
				props[name] = stream
					.toProperty(() => {
						const initial = properties[name]
						console.log('property stream initialized - ', name, '=', initial)
						return initial
					})
					.spy('property stream update - ' + name)
				props[name].observe(() => {})
			}
			else if (!actions.includes(name)){
				stream.spy('stream event - ' + name)
			}
		})
	) (streams)

	console.log(streams)

	window.getActionEmitter = name => {
		if (!emitters[name]) {
			throw 'action -' + name + '- does not exist'
		}

		return emitters[name]
	}

	window.subscribeToProperty = (name, callback) => {
		if (!props[name]) {
			throw 'property -' + name + '- does not exist'
		}
		else {
			return props[name].observe(callback)
		}
	}
}

export default initializeStreams