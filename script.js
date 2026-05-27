// Objeto que armazena todos os grupos de caracteres disponíveis
// Cada propriedade representa um tipo de caractere que pode ser usado na senha
const groups = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ", // Letras maiúsculas
  lowercase: "abcdefghijklmnopqrstuvwxyz", // Letras minúsculas
  numbers: "0123456789", // Números
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/|~", // Símbolos especiais
};

// Objeto que centraliza todos os elementos HTML utilizados no sistema
// Isso evita ficar repetindo document.querySelector várias vezes
const elements = {
  lengthRange: document.querySelector("#lengthRange"), // Input range do tamanho da senha
  lengthValue: document.querySelector("#lengthValue"), // Texto que mostra o tamanho atual
  prefixInput: document.querySelector("#prefixInput"), // Campo para digitar uma palavra personalizada
  passwordOutput: document.querySelector("#passwordOutput"), // Área onde a senha será exibida
  generateButton: document.querySelector("#generateButton"), // Botão principal de gerar senha
  quickGenerateButton: document.querySelector("#quickGenerateButton"), // Botão rápido de gerar senha
  copyButton: document.querySelector("#copyButton"), // Botão de copiar senha
  strengthLabel: document.querySelector("#strengthLabel"), // Texto da força da senha
  strengthDescription: document.querySelector("#strengthDescription"), // Descrição da força da senha
  headerStrength: document.querySelector("#headerStrength"), // Texto de força exibido no cabeçalho
  messageStrength: document.querySelector("#messageStrength"), // Mensagem resumida da força
  messageDetail: document.querySelector("#messageDetail"), // Detalhe explicando a segurança
  meterBars: document.querySelectorAll(".strength-meter span"), // Barras visuais da força da senha
};

// Cria uma lista com todos os checkboxes de opções
// Object.keys(groups) pega os nomes das propriedades do objeto groups
// map percorre cada item e busca o elemento HTML correspondente
const optionInputs = Object.keys(groups).map((id) =>
  document.querySelector(`#${id}`),
);

// Função responsável por gerar um índice aleatório seguro
// Utiliza crypto.getRandomValues ao invés de Math.random
// porque crypto é mais seguro para geração de senhas
function randomIndex(max) {
  // Cria um array de 32 bits com 1 posição
  const values = new Uint32Array(1);

  // Preenche o array com um valor aleatório criptograficamente seguro
  crypto.getRandomValues(values);

  // Retorna um número aleatório dentro do limite máximo
  return values[0] % max;
}

// Função que retorna um caractere aleatório de uma string
function randomChar(characters) {
  // Usa randomIndex para pegar uma posição aleatória da string
  return characters[randomIndex(characters.length)];
}

// Função responsável por embaralhar os caracteres da senha
// Isso impede padrões previsíveis
function shuffle(text) {
  // Transforma a string em array
  const chars = [...text];

  // Loop que percorre o array de trás para frente
  for (let index = chars.length - 1; index > 0; index -= 1) {
    // Escolhe uma posição aleatória
    const target = randomIndex(index + 1);

    // Faz troca de posições usando destructuring
    [chars[index], chars[target]] = [chars[target], chars[index]];
  }

  // Junta novamente o array em texto
  return chars.join("");
}

// Função que retorna quais opções estão marcadas
function getActiveOptions() {
  return (
    optionInputs

      // Filtra apenas os checkboxes marcados
      .filter((input) => input.checked)

      // Retorna o id dos inputs marcados
      .map((input) => input.id)
  );
}

// Função que retorna os grupos de caracteres ativos
function getActiveGroups() {
  // Pega os ids ativos e busca os caracteres correspondentes no objeto groups
  return getActiveOptions().map((id) => groups[id]);
}

// Função principal responsável por gerar a senha
function generatePassword() {
  // Pega o tamanho da senha do input range
  const length = Number(elements.lengthRange.value);

  // Pega todos os grupos ativos
  const activeGroups = getActiveGroups();

  // Pega o prefixo digitado pelo usuário
  const prefix = elements.prefixInput.value.trim();

  // Verifica se nenhuma opção foi marcada
  if (activeGroups.length === 0) {
    // Exibe mensagem de erro
    elements.passwordOutput.textContent = "Selecione uma opção";

    // Atualiza a força para 0
    updateStrength(0);

    // Encerra a função
    return;
  }

  // Junta todos os caracteres permitidos em uma única string
  const allCharacters = activeGroups.join("");

  // Se existir prefixo cria uma base memorável
  // Caso contrário inicia vazio
  let password = prefix ? createMemorableBase(prefix) : "";

  // Caso não exista senha inicial
  if (!password) {
    // Garante pelo menos 1 caractere de cada grupo selecionado
    password = activeGroups.map((group) => randomChar(group)).join("");
  }

  // Continua adicionando caracteres até atingir o tamanho desejado
  while (password.length < length) {
    password += randomChar(allCharacters);
  }

  // Se existir prefixo apenas corta o tamanho
  // Se não existir embaralha a senha
  const finalPassword = prefix
    ? password.slice(0, length)
    : shuffle(password.slice(0, length));

  // Exibe a senha colorida no HTML
  elements.passwordOutput.innerHTML = colorizePassword(finalPassword);

  // Atualiza o nível de força da senha
  updateStrength(calculateStrength(length, activeGroups.length));
}

// Função que cria uma senha memorável baseada no texto digitado
function createMemorableBase(value) {
  // Normaliza o texto removendo acentos e caracteres inválidos
  // Depois divide as palavras por espaço
  const words = normalizeText(value).split(/\s+/).filter(Boolean);

  // Se não existir palavra retorna vazio
  if (words.length === 0) return "";

  // Primeira palavra digitada
  const firstWord = words[0];

  // Última palavra digitada
  // Se só existir uma palavra retorna vazio
  const lastWord = words.length > 1 ? words[words.length - 1] : "";

  // Caso exista apenas uma palavra
  if (!lastWord) {
    // Aplica transformação leet
    return applyLeet(firstWord.slice(0, 10));
  }

  // Cria uma senha combinando:
  // letras maiúsculas
  // caracteres leet
  // números aleatórios
  return [
    capitalize(firstWord.slice(0, 2)),
    leetChar(firstWord[2] || firstWord[1] || "a"),
    randomDigit(),
    capitalize(lastWord.slice(0, 3)),
    randomDigit(),
    leetChar(lastWord[lastWord.length - 2] || "e"),
    lastWord[lastWord.length - 1] || "",
  ].join("");
}

// Função que normaliza o texto
function normalizeText(value) {
  return (
    value

      // Remove acentos
      .normalize("NFD")

      // Remove marcas de acentuação
      .replace(/[\u0300-\u036f]/g, "")

      // Remove caracteres especiais
      .replace(/[^a-zA-Z0-9\s]/g, "")

      // Remove espaços extras
      .trim()
  );
}

// Função que aplica efeito leet na palavra
function applyLeet(value) {
  return (
    [...value]

      // Alterna entre preservar letra e substituir por caractere leet
      .map((char, index) =>
        index % 2 === 0 ? preserveCase(char, index) : leetChar(char),
      )
  
      // Junta tudo novamente
      .join("")
  );
}

// Função responsável por trocar letras por símbolos parecidos
function leetChar(char) {
  // Mapeamento dos caracteres possíveis
  const replacements = {
    a: ["@", "4"],
    e: ["3"],
    i: ["1", "!"],
    o: ["0"],
    s: ["5", "$"],
    t: ["7"],
  };

  // Busca opções da letra
  const options = replacements[char.toLowerCase()];

  // Se não existir substituição retorna o próprio caractere
  if (!options) return char;

  // Filtra apenas símbolos permitidos pelas opções marcadas
  const validOptions = options.filter((option) => {
    // Verifica se é número
    if (groups.numbers.includes(option)) {
      return document.querySelector("#numbers").checked;
    }

    // Verifica se é símbolo
    if (groups.symbols.includes(option)) {
      return document.querySelector("#symbols").checked;
    }

    return true;
  });

  // Retorna um caractere aleatório válido
  // Caso contrário retorna o original
  return validOptions.length > 0 ? randomChar(validOptions) : char;
}

// Função que gera número aleatório
function randomDigit() {
  // Só gera número se a opção estiver marcada
  return document.querySelector("#numbers").checked
    ? randomChar(groups.numbers)
    : "";
}

// Função que preserva a primeira letra maiúscula
function preserveCase(char, index) {
  // Se for primeira posição deixa maiúsculo
  return index === 0 ? char.toUpperCase() : char;
}

// Função que capitaliza texto
function capitalize(value) {
  // Se não existir valor retorna vazio
  if (!value) return "";

  // Primeira letra maiúscula e restante minúsculo
  return value[0].toUpperCase() + value.slice(1).toLowerCase();
}

// Função que colore cada caractere da senha
function colorizePassword(password) {
  return (
    [...password]

      // Cria um span com classe baseada no tipo do caractere
      .map(
        (char) =>
          `<span class="${getCharClass(char)}">${escapeHtml(char)}</span>`,
      )

      // Junta tudo em HTML
      .join("")
  );
}

// Função que define qual classe CSS será aplicada
function getCharClass(char) {
  // Letra maiúscula
  if (groups.uppercase.includes(char)) return "purple";

  // Letra minúscula
  if (groups.lowercase.includes(char)) return "green";

  // Número
  if (groups.numbers.includes(char)) return "amber";

  // Símbolo
  return "blue";
}

// Função que evita problemas de HTML Injection
function escapeHtml(char) {
  // Cria elemento temporário
  const element = document.createElement("span");

  // Insere texto seguro
  element.textContent = char;

  // Retorna HTML escapado
  return element.innerHTML;
}

// Função que calcula a força da senha
function calculateStrength(length, activeGroupCount) {
  let score = 0;

  // Quanto maior a senha mais pontos
  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;

  // Quanto mais grupos diferentes mais forte
  if (activeGroupCount >= 3) score += 1;

  // Caso máximo de segurança
  if (activeGroupCount === 4 && length >= 18) score += 1;

  return score;
}

// Função que atualiza visualmente a força da senha
function updateStrength(score) {
  // Lista de estados possíveis
  const states = [
    {
      label: "Fraca",
      description: "Aumente o tamanho e combine mais tipos de caracteres.",
      detail: "Seria descoberta rapidamente.",
      color: "var(--danger)",
    },
    {
      label: "Regular",
      description: "Melhor, mas ainda vale reforçar a variedade.",
      detail: "Ainda pode ser descoberta com ataques simples.",
      color: "var(--amber)",
    },
    {
      label: "Boa",
      description: "Boa combinacão para contas comuns.",
      detail: "Levaria mais tempo para ser descoberta.",
      color: "var(--blue)",
    },
    {
      label: "Forte",
      description: "Otimo! Sua senha esta segura.",
      detail: "Levaria muitos anos para ser descoberta.",
      color: "var(--green)",
    },
    {
      label: "Muito Forte",
      description: "Excelente! Sua senha esta muito segura.",
      detail: "Levaria milhares de anos para ser descoberta.",
      color: "var(--green)",
    },
  ];

  // Garante que o índice esteja dentro do limite
  const state =
    states[Math.max(0, Math.min(score - 1, states.length - 1))] || states[0];

  // Atualiza textos e cores da interface
  elements.strengthLabel.textContent = state.label;
  elements.strengthLabel.style.color = state.color;

  elements.headerStrength.textContent = state.label;
  elements.headerStrength.style.color = state.color;

  elements.strengthDescription.textContent = state.description;

  elements.messageStrength.textContent = `${state.label.toLowerCase()}!`;

  elements.messageStrength.style.color = state.color;

  elements.messageDetail.textContent = state.detail;

  // Atualiza as barras visuais da força
  elements.meterBars.forEach((bar, index) => {
    // Ativa barra conforme pontuação
    bar.classList.toggle("active", index < score);

    // Define cor ativa ou padrão
    bar.style.background = index < score ? state.color : "#253044";
  });
}

// Função que atualiza o valor do range
function updateRange() {
  // Valor mínimo
  const min = Number(elements.lengthRange.min);

  // Valor máximo
  const max = Number(elements.lengthRange.max);

  // Valor atual
  const current = Number(elements.lengthRange.value);

  // Calcula porcentagem do progresso
  const progress = ((current - min) / (max - min)) * 100;

  // Atualiza texto
  elements.lengthValue.textContent = current;

  // Atualiza variável CSS do progresso
  elements.lengthRange.style.setProperty("--range-progress", `${progress}%`);
}

// Função assíncrona para copiar senha
async function copyPassword() {
  // Pega senha exibida
  const password = elements.passwordOutput.textContent;

  // Se não existir senha válida interrompe
  if (!password || password === "Selecione uma opção") return;

  // Verifica se clipboard moderno está disponível
  if (navigator.clipboard && window.isSecureContext) {
    // Copia usando API moderna
    await navigator.clipboard.writeText(password);
  } else {
    // Fallback para navegadores antigos

    // Cria textarea temporário
    const textarea = document.createElement("textarea");

    // Define valor
    textarea.value = password;

    // Define readonly
    textarea.setAttribute("readonly", "");

    // Deixa invisível
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";

    // Adiciona ao body
    document.body.appendChild(textarea);

    // Seleciona texto
    textarea.select();

    // Executa comando copiar
    document.execCommand("copy");

    // Remove textarea
    textarea.remove();
  }

  // Adiciona classe visual de copiado
  elements.copyButton.classList.add("copied");

  // Altera texto do botão
  elements.copyButton.querySelector("span:last-child").textContent = "Copiado";

  // Após 1.4 segundos volta ao normal
  setTimeout(() => {
    elements.copyButton.classList.remove("copied");
    elements.copyButton.querySelector("span:last-child").textContent = "Copiar";
  }, 1400);
}

// Evento disparado ao mover o range
elements.lengthRange.addEventListener("input", () => {
  // Atualiza barra visual
  updateRange();

  // Gera nova senha
  generatePassword();
});

// Sempre que digitar no prefixo gera nova senha
elements.prefixInput.addEventListener("input", generatePassword);

// Adiciona evento em todos os checkboxes
optionInputs.forEach((input) => {
  // Quando alterar opção gera nova senha
  input.addEventListener("change", generatePassword);
});

// Evento do botão principal
elements.generateButton.addEventListener("click", generatePassword);

// Evento do botão rápido
elements.quickGenerateButton.addEventListener("click", generatePassword);

// Evento do botão copiar
elements.copyButton.addEventListener("click", copyPassword);

// Inicializa o range ao carregar a página
updateRange();

// Gera senha inicial automaticamente
generatePassword();
