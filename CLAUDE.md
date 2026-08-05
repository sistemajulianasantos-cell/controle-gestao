# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## O que é este projeto

Sistema de controle e gestão da Romero Coquetéis (empresa de coquetelaria para eventos): estoque, festas/contratos, financeiro, equipe, orçamentos, produção e fechamentos. Aplicação web estática (sem build step, sem framework, sem package.json) hospedada no GitHub Pages, com Firebase (Firestore + Auth anônima) como backend de dados.

## Comandos

Não há build, bundler, linter ou testes automatizados. É HTML/CSS/JS puro servido diretamente.

- **Rodar localmente**: abrir `index.html` num servidor estático (ex: `npx serve .` ou extensão Live Server), pois os módulos Firebase usam `<script type="module">` e alguns recursos exigem `http(s)://` (não funcionam via `file://`).
- **Deploy**: automático via GitHub Actions (`.github/workflows/deploy.yml`) a cada push na branch `main` — publica no GitHub Pages (domínio custom em `CNAME`: meucontroleegestao.com.br). Não há passo de build; o conteúdo do repo é publicado como está.

## Arquitetura

### Estrutura geral
- `index.html` — hospeda todas as "páginas" da aplicação como `<div id="page-*">` dentro de uma única SPA (troca de página é feita via `go(page)` em `js/nav.js`, sem roteamento por URL). Também contém, inline, a inicialização do Firebase e as funções globais de leitura/gravação (`svFirebase`, `carregarDados`, comprovantes, backups).
- `js/*.js` — um arquivo por módulo/domínio de negócio (ex: `financeiro.js`, `contratos.js`, `equipe.js`, `festas.js`, `orcamento.js`, `regras.js`). Todos são scripts clássicos (não ES modules) carregados via `<script src="js/x.js?v=...">` em sequência no final do `index.html`, e compartilham escopo global (funções e variáveis viram globais implícitas).
- `app17.js` (raiz) — arquivo legado/não utilizado. Não é carregado pelo `index.html`; foi substituído pelos dados equivalentes em `js/data.js` (`FESTAS_PRELOAD`/`QUEBRAS_PRELOAD`). Ignorar ao editar funcionalidades atuais.
- `style.css` — estilos globais (tema escuro/claro via classe `light-mode` no `body`, alternado por `toggleTheme()`).

### Estado e persistência (Firebase)
- Estado vive inteiro em memória no objeto global `D` (definido em `js/globals.js`), populado a partir do Firestore em `carregarDados()` (dentro do `<script type="module">` de `index.html`) e salvo via `sv(chave)` → `window.svFirebase(chave)`.
- Cada seção de dados (`fornecedores`, `festas`, `financeiro`, `equipe`, etc.) é um documento próprio na coleção Firestore `dados` — decisão deliberada para não estourar o limite de 1MB por documento do Firestore. `financeiro` é ainda fatiado por ano (`financeiro_AAAA`) pelo mesmo motivo.
- Comprovantes de pagamento ficam em documentos separados na coleção `comprovantes` (1 por parcela), nunca embutidos no array `financeiro`.
- Antes de sobrescrever `financeiro_AAAA`, o estado anterior é copiado para a coleção `backups` (última versão apenas, não histórico completo) — restaurável pela função `restaurarBackupFinanceiroAno`.
- Ao adicionar um novo campo em `D`, é preciso: inicializar em `D` (`js/globals.js`/`js/data.js`), ler em `carregarDados()` e gravar em `window.svFirebase()` (ambos em `index.html`).

### Cache-busting de scripts
Cada `<script src="js/x.js?v=YYYYMMDDx">` tem uma query string de versão. **Sempre que um `js/*.js` existente for editado, atualizar o `?v=` do respectivo `<script>` em `index.html`**, senão usuários com cache antigo do navegador não recebem a mudança.

### Autenticação e permissões
- Login por perfil (não por usuário individual), com PIN + hash SHA-256 (`js/auth.js`). Perfis: `admin`, `financeiro`, `operacional`, cada um com uma lista fixa de módulos permitidos em `ACESSO` (`js/auth.js`).
- `go(page)` (`js/nav.js`) verifica login e se `ACESSO[perfilAtual]` inclui o `data-modulo` do item de nav antes de trocar de página.
- Suporta 2FA via TOTP implementado manualmente (RFC 6238, `js/auth.js`), sem dependência externa.
- Proteção contra brute-force local (delays progressivos por tentativa incorreta).

### Padrão de página/módulo
Cada módulo de negócio segue o mesmo padrão:
1. Uma entrada em `pageInfo` (`js/nav.js`) com título/subtítulo.
2. Uma entrada em `pageRenders` (`js/nav.js`, populada por `initPageRenders()`) mapeando o id da página para a função `init*`/`r*` que renderiza aquele módulo quando ativado.
3. Funções de render (`rXxx`) e handlers no arquivo `js/xxx.js` correspondente, operando diretamente sobre o array/objeto relevante em `D`.

### Cadastro Central (em andamento)
Existe um esforço de centralizar cadastros hoje duplicados entre módulos (Insumos, Cargos, Categorias, Serviços) em fontes únicas (`js/insumos.js`, `js/cargos.js`, `js/categorias.js`, `js/servicos.js`), reconectando telas antigas (Equipe, Orçamento) a essas fontes em vez de manterem cópias próprias dos dados. Ver histórico do `git log` para o estado atual de quais domínios já foram migrados.

### Convenções de commit
Mensagens de commit em português, modo imperativo, começando com verbo (`Adiciona`, `Corrige`, `Reformula`, `Atualiza`), sem acentos em palavras-chave frequentes é aceitável mas não obrigatório (ex.: `"Corrige status de Fechamento desatualizado entre Financeiro e Fechamentos"`).
