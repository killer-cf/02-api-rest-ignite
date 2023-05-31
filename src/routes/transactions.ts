import { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function transactionsRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const { sessionId } = req.cookies

      const transactions = await prisma.transaction.findMany({
        where: { session_id: sessionId },
      })

      return { transactions }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req) => {
      const setTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = setTransactionParamsSchema.parse(req.params)

      const { sessionId } = req.cookies

      const transaction = await prisma.transaction.findFirst({
        where: {
          id,
          session_id: sessionId,
        },
      })

      return { transaction }
    },
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists],
    },
    async (req) => {
      const { sessionId } = req.cookies

      const summary = (
        await prisma.transaction.findMany({
          where: { session_id: sessionId },
        })
      ).reduce((acc, transaction) => {
        acc = acc + Number(transaction.amount)

        return acc
      }, 0.0)

      return { summary }
    },
  )

  app.post('/', async (req, res) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    })

    const { title, amount, type } = createTransactionBodySchema.parse(req.body)

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      res.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      })
    }

    await prisma.transaction.create({
      data: {
        title,
        amount: type === 'credit' ? amount : amount * -1,
        session_id: sessionId,
      },
    })

    return res.status(201).send()
  })
}
