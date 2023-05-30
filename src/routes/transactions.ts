import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/', async () => {
    const transactions = await prisma.transaction.findMany()

    return { transactions }
  })

  app.get('/:id', async (req) => {
    const setTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = setTransactionParamsSchema.parse(req.params)

    const transaction = await prisma.transaction.findUnique({
      where: {
        id,
      },
    })

    return { transaction }
  })

  app.get('/summary', async () => {
    const summary = (await prisma.transaction.findMany()).reduce(
      (acc, transaction) => {
        acc = acc + Number(transaction.amount)

        return acc
      },
      0.0,
    )

    return { summary }
  })

  app.post('/', async (req, res) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(req.body)

    await prisma.transaction.create({
      data: {
        title,
        amount: type === 'credit' ? amount : amount * -1,
      },
    })

    return res.status(201).send()
  })
}
