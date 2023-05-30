import fastify from 'fastify'
import { prisma } from './lib/prisma'
import { env } from './env'

const app = fastify()

app.get('/hello', async () => {
  const transaction = await prisma.transaction.create({
    data: {
      title: 'Transação de teste',
      amount: 1000,
    },
  })

  return transaction
})

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('server running!')
  })
