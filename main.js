// Importa o módulo principal do Electron.
// O app controla o ciclo de vida da aplicação.
// BrowserWindow cria janelas.
// shell permite abrir links externos no navegador.
const { app, BrowserWindow, shell } = require("electron");

// Importa o módulo path do Node.js.
// Ele ajuda a criar caminhos de arquivos compatíveis com qualquer sistema operacional.
const path = require("path");

/*
  Função responsável por criar a janela principal da aplicação.
*/
function createWindow() {
  // Cria uma nova janela Electron.
  const mainWindow = new BrowserWindow({
    // Largura inicial da janela.
    width: 1280,

    // Altura inicial da janela.
    height: 720,

    // Largura mínima permitida.
    minWidth: 1100,

    // Altura mínima permitida.
    minHeight: 680,

    // Cor de fundo da janela enquanto carrega.
    backgroundColor: "#050914",

    // Título da aplicação.
    title: "Gerador de Senhas",

    // Esconde automaticamente a barra de menu.
    autoHideMenuBar: true,

    // Define o ícone da aplicação.
    // path.join garante compatibilidade entre Windows, Linux e Mac.
    icon: path.join(__dirname, "assets", "app-icon.png"),

    // Configurações de segurança e comportamento do navegador interno.
    webPreferences: {
      // Isola o contexto da página do contexto do Electron.
      // Isso aumenta a segurança.
      contextIsolation: true,

      // Desativa integração do Node.js no front-end.
      // Isso impede acesso direto ao sistema pelo HTML/JS da interface.
      nodeIntegration: false,
    },
  });

  /*
    Remove completamente o menu padrão do Electron.
    Isso deixa o aplicativo mais limpo.
  */
  mainWindow.removeMenu();

  /*
    Carrega o arquivo HTML principal da aplicação.
  */
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  /*
    Intercepta tentativas de abrir novas janelas.
    Muito usado quando o usuário clica em links externos.
  */
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Abre o link no navegador padrão do sistema.
    shell.openExternal(url);

    // Impede que o Electron abra outra janela interna.
    return { action: "deny" };
  });
}

/*
  Evento disparado quando o Electron termina de iniciar.
*/
app.whenReady().then(() => {
  // Cria a janela principal.
  createWindow();

  /*
    Evento do macOS.
    Quando o usuário clica novamente no ícone do app
    e não existe nenhuma janela aberta.
  */
  app.on("activate", () => {
    // Verifica se não existem janelas abertas.
    if (BrowserWindow.getAllWindows().length === 0) {
      // Cria nova janela.
      createWindow();
    }
  });
});

/*
  Evento disparado quando todas as janelas são fechadas.
*/
app.on("window-all-closed", () => {
  /*
    No macOS (darwin), normalmente os apps continuam abertos
    mesmo sem janelas.

    Nos outros sistemas o app é encerrado.
  */
  if (process.platform !== "darwin") {
    // Fecha totalmente a aplicação.
    app.quit();
  }
});
