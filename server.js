const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const FICHAS_FILE = '/tmp/fichas.json';

function lerFichas() {
          try {
                      if (fs.existsSync(FICHAS_FILE)) {
                                    return JSON.parse(fs.readFileSync(FICHAS_FILE, 'utf8'));
                      }
          } catch (e) {
                      console.error('Erro ao ler fichas:', e.message);
          }
          return [];
}

function salvarFicha(cpf, rg, data) {
          const fichas = lerFichas();
          const novaFicha = {
                      id: Date.now(),
                      cpf,
                      rg,
                      data,
                      criada_em: new Date().toISOString()
          };
          fichas.push(novaFicha);
          fs.writeFileSync(FICHAS_FILE, JSON.stringify(fichas, null, 2));
          return novaFicha;
}

app.post('/api/enviar', (req, res) => {
          try {
                      const { cpf, rg, data } = req.body;

            if (!cpf || !rg || !data) {
                          return res.status(400).json({ sucesso: false, erro: 'Dados obrigatórios' });
            }

            const ficha = salvarFicha(cpf, rg, data);

            res.json({
                          sucesso: true,
                          mensagem: '✅ Ficha salva com sucesso! ID: ' + ficha.id,
                          id: ficha.id,
                          cpf: cpf
            });
          } catch (error) {
                      console.error('Erro:', error.message);
                      res.status(500).json({ sucesso: false, erro: error.message });
          }
});

app.get('/api/fichas', (req, res) => {
          try {
                      const fichas = lerFichas();
                      res.json(fichas);
          } catch (error) {
                      res.status(500).json({ erro: error.message });
          }
});

app.listen(PORT, () => {
          console.log(`🚀 Servidor na porta ${PORT}`);
});
