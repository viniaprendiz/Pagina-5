const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(express.static('public'));
app.post('/api/enviar', async (req, res) => {
    try {
          const { cpf, rg, data } = req.body;
          if (!cpf || !rg || !data) {
                  return res.status(400).json({ sucesso: false, erro: 'Preenc todos' });
          }
          await new Promise(r => setTimeout(r, 1500));
          res.json({
                  sucesso: true,
                  mensagem: '✅ Ficha enviada! CPF: ' + cpf,
                  id: 'FICHA-' + Date.now()
          });
    } catch (e) {
          res.status(500).json({ sucesso: false, erro: e.message });
    }
});
app.listen(PORT, () => console.log(`Servidor na porta ${PORT}`));
