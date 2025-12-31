import OpenAI from 'openai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  try {
    const { prompt = '', systemInstruction = '' } = (req.body as any) || {};
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'DEEPSEEK_API_KEY not set' });
    }
    const client = new OpenAI({ apiKey, baseURL: 'https://api.deepseek.com' });
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
    if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
    messages.push({ role: 'user', content: prompt });
    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages,
      stream: false
    });
    const text = completion.choices?.[0]?.message?.content || '';
    return res.status(200).json({ text });
  } catch (e: any) {
    return res.status(502).json({ error: e?.message || 'DeepSeek call failed' });
  }
}
