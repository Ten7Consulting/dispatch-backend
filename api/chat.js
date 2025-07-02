export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { message } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Missing OpenAI API Key' });
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await openaiRes.json();

    // 🧪 DEBUG: Log full OpenAI response
    console.log("OpenAI full response:", JSON.stringify(data, null, 2));

    // 🛡 Fallback if OpenAI didn't send usable content
    const reply = data?.choices?.[0]?.message?.content || "Sorry, Dispatch was unable to answer that. Please try again.";

    return res.status(200).json({ reply });

  } catch (error) {
    console.error('OpenAI request failed:', error);
    return res.status(500).json({
      error: 'OpenAI request failed',
      detail: error.message,
    });
  }
}
