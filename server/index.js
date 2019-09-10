const Hapi = require('@hapi/hapi')
const Inert = require('@hapi/inert')
const Nes = require('@hapi/nes')
const Path = require('path')
const uuidv4 = require('uuid/v4')

const treasures = {}

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 3000,
        routes: {
            files: {
                relativeTo: Path.join(__dirname, '../public')
            }
        }
    })

    await server.register(Inert)
    await server.register(Nes)

    server.subscription('/treasuremap/{id}')

    server.route({
        method: 'POST',
        path: '/treasuremap/{id*}',
        handler: (request, h) => {
            const { id } = request.params
            const { treasure } = request.payload

            treasures[id] = treasure

            server.publish(`/treasuremap/${id}`, { treasure: treasures[id] })

            return { treasure: treasures[id] }
        }
    })

    server.route({
        method: 'GET',
        path: '/treasuremap/{id*}',
        handler: (request, h) => {
            const { id } = request.params

            if (!treasures[id]) {
                treasures[id] = [{
                    id: uuidv4(),
                    notes: []
                }]
            }

            const treasure = treasures[id]

            return { treasure }
        }
    })

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: '.',
                redirectToSlash: true
            }
        }
    })

    await server.start()
    console.log('Server running on %s', server.info.uri)
}

process.on('unhandledRejection', (err) => {

    console.log(err)
    process.exit(1)
})

init()