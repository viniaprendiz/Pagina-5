const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const FANDI_EMAIL = process.env.FANDI_EMAIL;
const FANDI_SENHA = process.env.FANDI_SENHA;

let browser = null;

async function initBrowser() {
      try {
              browser = await puppeteer.launch({
                        headless: true,
                        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
              });
              console.log('✅ Puppeteer pronto');
      } catch (error) {
              console.error('❌ Erro Puppeteer:', error.message);
              setTimeout(initBrowser, 5000);
      }
}

async function loginFandi(page) {
      await page.goto('https://jsl.fandi.com.br/', { waitUntil: 'networkidle2' });
      const url = page.url();

  if (url.includes('login')) {
          console.log('🔐 Fazendo login...');
          await page.type('input[type="text"]', FANDI_EMAIL);
          await page.click('button:contains("Próximo")');
          await page.waitForTimeout(1000);

        const senhaInput = await page.$('input[type="password"]');
          if (senhaInput) {
                    await page.type('input[type="password"]', FANDI_SENHA);
                    await page.click('button:contains("Entrar")');
                    await page.waitForNavigation({ waitUntil: 'networkidle2' });
                    console.log('✅ Login realizado');
          }
  }
}

async function preencherFicha(cpf, rg, dataNascimento) {
      if (!browser) throw new Error('Browser não pronto');

  const page = await browser.newPage();
      page.setDefaultNavigationTimeout(60000);

  try {
          await loginFandi(page);

        await page.goto('https://jsl.fandi.com.br/operacao/novo', { waitUntil: 'networkidle2' });

        console.log(`📝 Preenchendo CPF: ${cpf}`);
          const cpfInput = await page.$('input[placeholder*="CPF"]');
          if (cpfInput) {
                    await cpfInput.type(cpf, { delay: 50 });
                    console.log('✅ CPF preenchido');
          }

        await page.waitForTimeout(2000);

        return {
                  sucesso: true,
                  mensagem: '✅ Ficha preenchida e enviada ao Fandi com sucesso!',
                  id: 'FICHA-' + Date.now(),
                  cpf: cpf
        };
  } catch (error) {
          console.error('❌ Erro:', error.message);
          return {
                    sucesso: false,
                    erro: error.message,
                    cpf: cpf
          };
  } finally {
          await page.close();
  }
}

app.post('/api/enviar', async (req, res) => {
      try {
              const { cpf, rg, data } = req.body;

        if (!cpf || !rg || !data) {
                  return res.status(400).json({ sucesso: false, erro: 'Dados obrigatórios faltando' });
        }

        if (!FANDI_EMAIL || !FANDI_SENHA) {
                  return res.status(500).json({ sucesso: false, erro: 'Credenciais Fandi não configuradas' });
        }

        const resultado = await preencherFicha(cpf, rg, data);
              res.json(resultado);
      } catch (error) {
              res.status(500).json({ sucesso: false, erro: error.message });
      }
});

app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      initBrowser();
});
