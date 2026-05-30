# Gerador de Senhas

Aplicativo desktop simples para gerar senhas seguras e aleatórias usando Electron, HTML, CSS e JavaScript.

## Sobre

Este projeto cria senhas personalizáveis com:

- seleção de tamanho de 4 a 64 caracteres
- prefixo opcional para tornar a senha mais memorável
- opções de letras maiúsculas, minúsculas, números e símbolos
- medidor de força da senha
- cópia rápida para área de transferência

Todas as senhas são geradas localmente e não são armazenadas.

## Pré-requisitos

- Node.js instalado (versão 18+ recomendada)
- npm disponível no terminal

> O projeto foi configurado para Windows, mas o Electron também funciona em macOS e Linux se adaptado.

## Instalação

Abra um terminal no diretório do projeto e execute:

```bash
npm install
```

Isso instalará as dependências do Electron e do Electron Builder.

## Captura de tela

Adicione uma imagem do aplicativo na mesma pasta do `README.md` e use o código abaixo para exibir no GitHub:

![Screenshot do Gerador de Senhas](screenshot.png)

> Se você salvar a imagem em outra pasta, ajuste o caminho relativo. Por exemplo, `assets/screenshot.png`.

## Executar em modo de desenvolvimento

Para abrir o app no modo de desenvolvimento:

```bash
npm start
```

A aplicação será iniciada em uma janela do Electron.

## Como usar

1. Ajuste o controle deslizante `Quantidade de caracteres` para definir o comprimento da senha.
2. Marque as opções desejadas:
   - Letras maiúsculas
   - Letras minúsculas
   - Números
   - Símbolos especiais
3. Opcional: digite um `Nome ou prefixo` para criar uma base mais memorável.
4. Clique em `Gerar Nova Senha` ou `Gerar outra` para criar uma nova senha.
5. Clique em `Copiar` para copiar o resultado para a área de transferência.

## Empacotar para Windows

O projeto já possui configuração de build no `package.json` usando `electron-builder`.

- Gerar instalador Windows (NSIS):

```bash
npm run dist
```

- Gerar versão portátil:

```bash
npm run portable
```

Os arquivos gerados ficarão na pasta `dist` ou `release`, dependendo do comando.

## Estrutura do projeto

- `index.html` - interface da aplicação
- `style.css` - estilos visuais
- `script.js` - lógica de geração de senhas e interações
- `main.js` - código principal do Electron
- `package.json` - metadados e scripts do projeto
- `assets/` - ícones e recursos estáticos
- `vendor/` - dependências de UI, como ícones Lucide

## Observações

- A senha é criada localmente no app e não é enviada para nenhum servidor.
- Se nenhuma opção de caractere for selecionada, o app exibirá a mensagem `Selecione uma opção`.
