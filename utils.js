import R from 'ramda'
import K from 'kefir'

const getEmptyEmitter = () => R.pipe(
	R.map(name => [name, () => {}]),
	R.fromPairs
) (['value', 'error', 'end', 'event', 'emit'])


export const keyToType = R.pipe(
	R.toPairs,
	([[type, stream]]) => {
		return stream.map(signal => ({type, ...signal}))
	}
)

export const createStream = () => {
	let
		emitter = getEmptyEmitter(),
		stream = K.stream(_emitter => {
			Object.assign(emitter, _emitter)
			return () => Object.assign(emitter, getEmptyEmitter())
		})

	return {emitter, stream}
}

export const createStreams = keys => {
	let emitters = {}, streams = {}

	keys.forEach(key => {
		const {emitter, stream} = createStream()
		emitters[key] = emitter
		streams[key] = stream
	})

	return {emitters, streams}
}

export const conditionalSplit = R.curry(
	(predicates, stream) => {

		let {outputs, emitters} = createStreams(
			R.keys(predicates)
		)

		stream.observe(signal => (
			R.pipe(
				R.toPairs,
				R.forEach(([key, predicate]) => {
					if (predicate(signal)) {
						emitters[key].value(signal)
					}
				})
			) (predicates)
		))

		return outputs
	}
)

export const pickKeys = R.curry(
	(keys, stream) => {

		let {streams, emitters} = createStreams(keys)

		stream.observe(
			R.pipe(
				R.pick(keys),
				R.toPairs,
				R.forEach(([key, value]) => {emitters[key].value(value)})
			)
		)

		return streams
	}
)