const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

let browser = null;

async function initBrowser() {
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    console.log('✅ Puppeteer iniciado');
  } catch (error) {
    console.error('❌ Erro Puppeteer:', error.message);
    setTimeout(initBrowser, 5000);
  }
}

async function preencherFandi(cpf, rg, data) {
  if (!browser) throw new Error('Browser não está pronto');
  
  const page = await browser.newPage();
  try {
    await page.goto('https://jsl.fandi.com.br/', { waitUntil: 'networkidle2' });
    console.log('✅ Fandi carregado');
    return { sucesso: true, mensagem: 'Fandi encontrado. Próximo passo: preencher dados.' };
  } catch (error) {
    return { sucesso: false, erro: error.message };
  } finally {
    await page.close();
  }
}

app.post('/api/enviar', async (req, res) => {
  try {
    const { cpf, rg, data } = req.body;
    if (!cpf || !rg || !data) {
      return res.status(400).json({ erro: 'CPF, RG e data obrigatórios' });
    }
    const resultado = await preencherFandi(cpf, rg, data);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  initBrowser();
});
