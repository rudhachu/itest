const client = require('./lib/client')
const start = async () => {
	try {
		await client.initialize()
	} catch (error) {
		console.error(error)
	}
}

start()
