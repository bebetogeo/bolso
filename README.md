# Bolso

Controle financeiro pessoal que roda inteiro no navegador. Pode ser instalado no celular e no computador (PWA) e funciona sem internet.

- **Privado:** os dados ficam só no aparelho (IndexedDB). Não há servidor, login nem envio de dados.
- **Importa extratos** OFX (SGML e XML) e CSV de conta corrente e cartão de crédito, sem duplicar o que já foi importado.
- **Classifica sozinho** por regras "descrição contém texto → categoria" e aprende com as correções.
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
