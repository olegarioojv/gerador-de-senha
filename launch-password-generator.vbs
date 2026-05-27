' Cria um objeto Shell do Windows.
' Esse objeto permite executar comandos no sistema operacional.
Set shell = CreateObject("WScript.Shell")

' Pega automaticamente a pasta onde o script .vbs está localizado.
' Isso evita precisar colocar caminho fixo manualmente.
projectPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)

' Define a pasta atual do terminal como a pasta do projeto.
' Assim o comando npm start será executado dentro do diretório correto.
shell.CurrentDirectory = projectPath

' Executa o comando npm start pelo CMD.
'
' "cmd /c" → abre o terminal, executa o comando e fecha.
' npm start → inicia a aplicação configurada no package.json.
'
' O número 0 significa:
' executar o terminal oculto sem mostrar a janela preta do CMD.
'
' False significa:
' o script continua executando sem esperar o comando terminar.
shell.Run "cmd /c npm start", 0, False