const client = require('./lib/client')
const start = async () => {
	try {
		await client.startRudhra()
	} catch (error) {
		console.error(error)
	}
}

start()
