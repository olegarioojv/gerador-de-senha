Set shell = CreateObject("WScript.Shell")
projectPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
shell.CurrentDirectory = projectPath
shell.Run "cmd /c npm start", 0, False
