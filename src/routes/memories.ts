import { FastifyInstance } from "fastify";
import {z} from 'zod'
import { prisma } from "../lib/prisma";
import { randomUUID } from "crypto";
export async function memories(app: FastifyInstance) {

    app.addHook('preHandler', async (request) => {
        await request.jwtVerify()
    })

    app.get('/memories', async (request) => {


        const memories = await prisma.memory.findMany({
            where: {
                userId: request.user.sub
            },
            orderBy: {
                createdAt: 'asc'
            }
        })

        return memories.map((memory) => {
                return {
                    id: memory.id,
                    coverUrl: memory.coverUrl,
                    excert: memory.content.substring(0, 155).concat('...'),
                    createdAt: memory.createdAt
            }
        })
    })

    app.get('/memories/:id', async (request, response) => {
        const paramsSchema = z.object({
            id: z.string().uuid()
        })
        const { id } = paramsSchema.parse(request.params)
        
        const memory = await prisma.memory.findUniqueOrThrow({
            where: {
                id
            },
        })

        if (!memory.isPublic && memory.userId != request.user.sub) {
            return response.status(401).send()
        }

        return {memory}
    })

    app.post('/memories', async (request) => {
        const bodySchema = z.object({
          content: z.string(),
          coverUrl: z.string(),
          isPublic: z.coerce.boolean().default(false),
        })
    
        const { content, coverUrl, isPublic } = bodySchema.parse(request.body)
    
        const memory = await prisma.memory.create({
          data: {
            content,
            coverUrl,
            isPublic,
            userId: request.user.sub,
          },
        })
    
        return {memory}
      })

    app.put('/memories/:id', async (request, response) => {

        const paramsSchema = z.object({
            id: z.string().uuid()
        })
        const bodySchema = z.object({
            content: z.string(),
            isPublic: z.coerce.boolean().default(false),
            coverUrl: z.string()
        })

        const {id} = paramsSchema.parse(request.params)

        const { content, isPublic, coverUrl } = bodySchema.parse(request.body)
        
        let memory = await prisma.memory.findUniqueOrThrow({
            where: {
                id
            }
        })

        if (memory.userId != request.user.sub) {
            return response.status(401).send()
        }

         memory = await prisma.memory.update({
            where: {
                id
            },
            data: {
                isPublic,
                coverUrl,
                userId: request.user.sub,
                content
            }
        })

        return {memory}
    })

    app.delete('/memories', async (request, response) => {
        const paramsSchema = z.object({
            id: z.string().uuid()
        })
        const { id } = paramsSchema.parse(request.params)

        const memory = await prisma.memory.findUniqueOrThrow({
            where: {
                id
            }
        })

        if (memory.userId != request.user.sub) {
            return response.status(401).send()
        }
        
         await prisma.memory.delete({
            where: {
                id
            },
        })

        return {memory}
    })
    
}