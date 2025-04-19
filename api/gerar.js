export default async function handler(req, res) {
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

  const prompt = `
Crie 3 versões criativas e curtas de bio para redes sociais com base nas informações abaixo:

Nome: ${nome}
Sobre a pessoa: ${sobre}
Tom desejado: ${tom}

Use emojis apenas se for apropriado ao tom. Máximo 150 caracteres por bio.
  `;

  try {
    const resposta = await fetch("https://api.openai.com/v1/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 150,
        temperature: 0.8,
      }),
    });

    const dados = await resposta.json();

    if (!dados.choices || !dados.choices[0]?.text) {
      return res.status(500).json({ erro: "Resposta inválida da OpenAI", dados });
    }

    res.status(200).json({ texto: dados.choices[0].text });
  } catch (err) {
    res.status(500).json({ erro: "Erro ao gerar bio", detalhe: err.message });
  }
}
