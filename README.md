# Bolso

Controle financeiro pessoal que roda inteiro no navegador. Pode ser instalado no celular e no computador (PWA) e funciona sem internet.

- **Privado:** os dados ficam só no aparelho (IndexedDB). Não há servidor, login nem envio de dados.
- **Importa extratos** OFX (SGML e XML), CSV, PDF e planilha XLS de conta corrente e cartão, sem duplicar o que já foi importado — nem quando a mesma conta chega em formatos diferentes (a conta é reconhecida pelo banco e número; o lançamento, pelo valor com até 4 dias de diferença na data). PDF testado com Itaú e Nubank (PF e PJ), XLS com Itaú. PDF e planilha são lidos no próprio aparelho com o [pdf.js](https://mozilla.github.io/pdf.js/) e o [SheetJS](https://sheetjs.com/) (licença Apache 2.0, em `vendor/`).
- **Classifica sozinho** por regras "descrição contém texto → categoria", com um vocabulário embutido de ~400 lojas e serviços brasileiros (não existe lista pública em português; esta foi conferida com extratos reais), e aprende com as correções (Naive Bayes local, comparado com regressão logística e n-gramas de letras, que não acertaram mais). Pix para empresa não cai em "Pix e transferências".
- **Previsão até o fim do mês:** o que ainda deve sair (contas que se repetem com valor parecido, fatura que vence e o gasto do dia a dia nos mesmos dias dos meses anteriores) e quanto sobra ou falta com o saldo de hoje. Entradas irregulares não entram no número, só como referência.
- Pagamento de fatura, transferência entre as próprias contas e aplicação/resgate não contam como gasto nem como entrada.
- Orçamento por categoria, comparação com o ritmo do mês, últimos 6 meses, cópia de segurança em JSON e exportação em CSV.

## Arquivos

| Arquivo | O que é |
| --- | --- |
| `index.html`, `app.css`, `app.js` | o app (sem bibliotecas externas) |
| `sw.js`, `manifest.webmanifest`, `icons/` | instalação e uso offline |
| `testes/` | extratos fictícios para testar a importação |

## Rodar no computador

```bash
python -m http.server 8765
```

Depois abra `http://localhost:8765`.

## Publicar uma versão nova

Basta enviar os arquivos alterados. O app abre pela cópia guardada no aparelho e se atualiza em segundo plano: a versão nova aparece na abertura seguinte.
