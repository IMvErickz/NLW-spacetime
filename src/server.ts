import 'dotenv/config'
import fastify from 'fastify'
import Cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { memories } from './routes/memories'
import multipart from '@fastify/multipart'
import { authRoutes } from './routes/auth'
import { uploadRoats } from './routes/upload'
import { resolve } from 'node:path'

async function Main() {

    const app = fastify({
        logger: true
    })

    await app.register(Cors, {
        origin: true
    })

    await app.register(jwt, {
        secret: 'spacetime'
    })

    app.register(multipart)

    app.register(require('@fastify/static'), {
        root: resolve(__dirname, '../uploads'),
        prefix: '/uploads'
    })

    await app.register(memories)
    await app.register(authRoutes)
    await app.register(uploadRoats)
    
    app.listen({port: 3333, host: '0.0.0.0'}).then(() => console.log('Server online'))
}

Main()

