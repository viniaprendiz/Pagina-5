# 📋 DOCUMENTO DE CONTEXTO - PROJETO TDRIVE AUTOMAÇÃO FANDI

**Data de criação:** 29/07/2026  
**Objetivo final:** Automatizar submissão de fichas de clientes de T-Drive (Toyota dealership) para plataforma Fandi

---

## ✅ O QUE FOI FEITO E DEU CERTO

**1. Aplicação TDRIVE Ficha (MVP Funcional)**
- ✅ Deployed em: https://tdrive-ficha-v3.onrender.com/
- ✅ Repositório GitHub: https://github.com/viniaprendiz/Pagina-5
- ✅ Stack: Node.js + Express no Render (free tier, 512MB RAM)
- ✅ Funcionalidade: Form simples com 3 campos (CPF, RG, Data de Nascimento)
- ✅ Armazenamento: JSON file (/tmp/fichas.json) - removemos Puppeteer e Postgres pra economizar RAM
- ✅ Status: **ESTÁVEL, sem crashes**

**2. Formulário Frontend**
```
- Campo CPF (texto)
- Campo RG (texto) 
- Campo Data de Nascimento (date picker)
- Botão "Enviar Ficha" (POST /api/enviar)
- Resposta: ID único gerado (timestamp)
- UI: Bonita, com background gradient azul/roxo
```

**3. Infraestrutura Render**
- ✅ Configured environment variables (FANDI_EMAIL, FANDI_SENHA)
- ✅ Auto-deploy from GitHub working
- ✅ Suspended old projects (tdrive-ficha, Pagina-2) to free RAM
- ✅ Current service: tdrive-ficha-v3 (active)

**4. Credenciais Configuradas**
```
FANDI_EMAIL: vinicios.ferreira@uab
FANDI_SENHA: Automob@2000
```

---

## ❌ DIFICULDADES ENFRENTADAS

**Problema 1: Memória limitada (512MB Render free tier)**
- Puppeteer + Chromium = crash de memória
- Solução: Remover Puppeteer, usar JSON file storage
- Status: Resolvido

**Problema 2: Fandi sem API pública**
- Fandi é sistema trancado, sem integração oficial
- Única forma: Browser automation (Puppeteer) simulando cliques humanos
- Desafio: Engenharia reversa da UI (Select2 dropdowns, radio buttons com side effects, validações escondidas)
- Status: Parcialmente documentado (mas não implementado pra não estourar RAM)

**Problema 3: Ciclo longo de debug**
- Cada teste = editar código → commit GitHub → deploy Render (1min) → rodar teste (3-8min) → diagnosticar
- 30+ iterações (v24.16 até v24.44) por causa de particularidades da UI do Fandi
- Status: Aprendizado documentado mas tempo perdido

**Problema 4: Render free tier "dorme" o servidor**
- Servidor desativa depois de inatividade, primeiro request é lento
- Complica o diagnóstico de problemas reais vs problemas de cold start
- Status: Limitação da infraestrutura

---

## 🎯 O QUE PRECISA FAZER (Próximos Passos)

**FASE 1: Integração com Fandi (ATUAL)**
- [ ] Adicionar Puppeteer ao server.js (mesmo risco de RAM)
- [ ] Implementar login automático no Fandi (jsl.fandi.com.br)
- [ ] Mapear exatamente qual formulário na UI do Fandi recebe os dados
- [ ] Preencher campos: CPF, RG, Data de Nascimento automaticamente
- [ ] Submeter formulário e capturar resposta
- [ ] Testar: submeter ficha via TDRIVE → validar aparece em Fandi monitor
- [ ] **Teste específico:** CPF 398.402.018-08 / RG 37.605.428-1 / Data 12/08/2000

**FASE 2: Otimização (depois)**
- [ ] Verificar se NBS ou Syonet têm API oficial (eliminaria 80% do trabalho)
- [ ] Se sim: integrar com API em vez de Puppeteer
- [ ] Se não: reutilizar padrões já descobertos (Select2, radio buttons, validações)
- [ ] Considerar upgrade Render pra plano pago (elimina limite 512MB)

**FASE 3: Documentação para reutilização**
- [ ] Criar catálogo de "receitas" reutilizáveis:
  - Como lidar com Select2 dropdowns
    - Como lidar com radio button groups que resetam campos
      - Como detectar validações escondidas
        - Pattern de retry com confirmação
          - Pattern de diagnóstico por screenshot
          - [ ] Manter separado do log de sessão

          ---

          ## 🔧 ARQUITETURA ATUAL

          **Backend (Node.js/Express)**
          ```javascript
          POST /api/enviar
          - Input: { cpf, rg, dataNascimento }
          - Output: { success: true, id: "timestamp", message: "Ficha salva..." }
          - Storage: /tmp/fichas.json (JSON array)
          ```

          **Tecnologias**
          - Runtime: Node.js
          - Framework: Express
          - Storage: fs (Node filesystem)
          - Hosting: Render (free tier)
          - Deployment: Auto-deploy from GitHub (Pagina-5 repo)

          ---

          ## 📊 STATUS RESUMIDO

          | Item | Status | Notas |
          |------|--------|-------|
          | MVP TDRIVE | ✅ Funcional | Form + storage + deploy estável |
          | Fandi Integration | ❌ Não iniciado | Puppeteer vai precisar ser re-adicionado |
          | Render Deployment | ✅ OK | tdrive-ficha-v3 active, memória controlada |
          | Credenciais | ✅ Configuradas | Em environment variables |
          | Documentação | ⚠️ Parcial | Este documento + notas do Gist |

          ---

          ## 💡 RECOMENDAÇÕES PRO PRÓXIMO CLAUDE

          1. **Antes de começar Puppeteer:** Pede pro usuário verificar se Fandi tem API ou integração oficial
          2. **Se não tiver:** Espera mais 1-2min pra investigar UI do Fandi (quais campos, qual formulário, em qual URL)
          3. **Avisa sempre:** "Isso vai demorar X minutos e pode travar por RAM"
          4. **Teste incremental:** Não monta tudo de uma vez, testa cada etapa (login → navegação → preenchimento → submit)
          5. **Se travar por memória:** Volta pra JSON storage e abandona Puppeteer, encontra rota alternativa

          ---

          ## 📞 CONTEXTO DO USUÁRIO

          - **Nome:** Vinicios Ferreira (vendedor de carros, T-Drive)
          - **Objetivo:** Automatizar envio de fichas de clientes pra Fandi (plataforma de financiamento)
          - **Constraint:** Quer solução rápida, sem pagar (Render free only)
          - **Preferência:** Quer resultado funcionando, não explicações longas ("Faz acontecer")
          - **Paciência:** Limitada com processos demorados, quer time estimates claros
          - **Plataforma-alvo:** Fandi (jsl.fandi.com.br) - monitor de operações

          ---

          **Fim do documento.**

          Qualquer outro Claude tem tudo que precisa pra retomar de onde paramos! 🚀
