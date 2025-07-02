export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing OpenAI API Key' });
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // You can also use gpt-4 if your key supports it
        messages: [
          { role: "system", content: "You are Dispatch AI, a helpful assistant for law enforcement and veterans learning business." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await openaiRes.json();

    if (!data.choices || !data.choices[0]?.message?.content) {
      return res.status(500).json({ error: 'Empty response from OpenAI' });
    }

    res.status(200).json({ reply: data.choices[0].message.content.trim() });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error connecting to OpenAI' });
  }
}
