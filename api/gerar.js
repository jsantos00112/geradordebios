const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ erro: "Método não permitido" });
  }

  let body = {};
  try {
    body = req.body;
    if (typeof body === "string") {
      body = JSON.parse(body);
    }
  } catch (e) {
    return res.status(400).json({ erro: "JSON inválido" });
  }

  const { nome, sobre, tom } = body;

  console.log("Dados recebidos:", { nome, sobre, tom });

  try {
    const resposta = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Você é um assistente criativo que escreve bios curtas para redes sociais. Use no máximo 150 caracteres e emojis se o tom permitir.",
          },
          {
            role: "user",
            content: `Nome: ${nome}\nSobre: ${sobre}\nTom desejado: ${tom}`,
          },
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    console.log("Status da resposta OpenAI:", resposta.status);

    const dados = await resposta.json();
    console.log("Resposta da OpenAI:", dados);

    if (!dados.choices || !dados.choices[0]?.message?.content) {
      return res.status(500).json({ erro: "Resposta inválida da OpenAI", dados });
    }

    res.status(200).json({ texto: dados.choices[0].message.content });
  } catch (err) {
    console.error("Erro ao gerar bio:", err.message);
    res.status(500).json({ erro: "Erro ao gerar bio", detalhe: err.message });
  }
};
