import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAllUsers, sampleQuotesByUser } from 'prisma-db'
import quippetBot from '../src/quippetBot.js'

const QUOTE_SAMPLE_SIZE = 3
type Quote = Awaited<ReturnType<typeof sampleQuotesByUser>>[number]

const formatQuote = (quote: Quote) => {
  return `"${quote.content}"\n\n- ${quote.quotee}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('Received event')
    const allUsers = await getAllUsers()
    for (const user of allUsers) {
      if (!user.telegramId) {
        console.log('Skipping user without telegramId:', user)
        continue
      }

      console.log('Sending message to user:', user)
      const quotes = await sampleQuotesByUser(user.id, QUOTE_SAMPLE_SIZE)
      const quotesMessage = quotes.map(formatQuote).join('\n\n---\n\n')
      await quippetBot.telegram.sendMessage(user.telegramId.toString(), quotesMessage)
    }
    return res.json('Success')
  } catch (e) {
    console.error('Error processing update:', e)
    return res.status(500).json('Error processing update: ' + e)
  }
}
