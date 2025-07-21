import { Configuration, OpenAIApi } from 'openai'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const { message } = req.body
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' })
  }
  const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY })
  const openai = new OpenAIApi(config)
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'Eres un asesor experto en decoración y materiales de fabricación.' },
        { role: 'user', content: message }
      ]
    })
    const reply = completion.data.choices[0].message.content
    res.status(200).json({ response: reply })
  } catch (error) {
    console.error('OpenAI API error:', error)
    res.status(500).json({ error: error.message || 'OpenAI API error' })
  }
}