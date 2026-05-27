const groups = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/|~"
};

const elements = {
  lengthRange: document.querySelector("#lengthRange"),
  lengthValue: document.querySelector("#lengthValue"),
  prefixInput: document.querySelector("#prefixInput"),
  passwordOutput: document.querySelector("#passwordOutput"),
  generateButton: document.querySelector("#generateButton"),
  quickGenerateButton: document.querySelector("#quickGenerateButton"),
  copyButton: document.querySelector("#copyButton"),
  strengthLabel: document.querySelector("#strengthLabel"),
  strengthDescription: document.querySelector("#strengthDescription"),
  headerStrength: document.querySelector("#headerStrength"),
  messageStrength: document.querySelector("#messageStrength"),
  messageDetail: document.querySelector("#messageDetail"),
  meterBars: document.querySelectorAll(".strength-meter span")
};

const optionInputs = Object.keys(groups).map((id) => document.querySelector(`#${id}`));

function randomIndex(max) {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0] % max;
}

function randomChar(characters) {
  return characters[randomIndex(characters.length)];
}

function shuffle(text) {
  const chars = [...text];

  for (let index = chars.length - 1; index > 0; index -= 1) {
    const target = randomIndex(index + 1);
    [chars[index], chars[target]] = [chars[target], chars[index]];
  }

  return chars.join("");
}

function getActiveOptions() {
  return optionInputs
    .filter((input) => input.checked)
    .map((input) => input.id);
}

function getActiveGroups() {
  return getActiveOptions().map((id) => groups[id]);
}

function generatePassword() {
  const length = Number(elements.lengthRange.value);
  const activeGroups = getActiveGroups();
  const prefix = elements.prefixInput.value.trim();

  if (activeGroups.length === 0) {
    elements.passwordOutput.textContent = "Selecione uma opcao";
    updateStrength(0);
    return;
  }

  const allCharacters = activeGroups.join("");
  let password = prefix ? createMemorableBase(prefix) : "";

  if (!password) {
    password = activeGroups.map((group) => randomChar(group)).join("");
  }

  while (password.length < length) {
    password += randomChar(allCharacters);
  }

  const finalPassword = prefix ? password.slice(0, length) : shuffle(password.slice(0, length));

  elements.passwordOutput.innerHTML = colorizePassword(finalPassword);
  updateStrength(calculateStrength(length, activeGroups.length));
}

function createMemorableBase(value) {
  const words = normalizeText(value)
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "";

  const firstWord = words[0];
  const lastWord = words.length > 1 ? words[words.length - 1] : "";

  if (!lastWord) {
    return applyLeet(firstWord.slice(0, 10));
  }

  return [
    capitalize(firstWord.slice(0, 2)),
    leetChar(firstWord[2] || firstWord[1] || "a"),
    randomDigit(),
    capitalize(lastWord.slice(0, 3)),
    randomDigit(),
    leetChar(lastWord[lastWord.length - 2] || "e"),
    lastWord[lastWord.length - 1] || ""
  ].join("");
}

function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim();
}

function applyLeet(value) {
  return [...value]
    .map((char, index) => (index % 2 === 0 ? preserveCase(char, index) : leetChar(char)))
    .join("");
}

function leetChar(char) {
  const replacements = {
    a: ["@", "4"],
    e: ["3"],
    i: ["1", "!"],
    o: ["0"],
    s: ["5", "$"],
    t: ["7"]
  };
  const options = replacements[char.toLowerCase()];

  if (!options) return char;

  const validOptions = options.filter((option) => {
    if (groups.numbers.includes(option)) return document.querySelector("#numbers").checked;
    if (groups.symbols.includes(option)) return document.querySelector("#symbols").checked;
    return true;
  });

  return validOptions.length > 0 ? randomChar(validOptions) : char;
}

function randomDigit() {
  return document.querySelector("#numbers").checked ? randomChar(groups.numbers) : "";
}

function preserveCase(char, index) {
  return index === 0 ? char.toUpperCase() : char;
}

function capitalize(value) {
  if (!value) return "";
  return value[0].toUpperCase() + value.slice(1).toLowerCase();
}

function colorizePassword(password) {
  return [...password]
    .map((char) => `<span class="${getCharClass(char)}">${escapeHtml(char)}</span>`)
    .join("");
}

function getCharClass(char) {
  if (groups.uppercase.includes(char)) return "purple";
  if (groups.lowercase.includes(char)) return "green";
  if (groups.numbers.includes(char)) return "amber";
  return "blue";
}

function escapeHtml(char) {
  const element = document.createElement("span");
  element.textContent = char;
  return element.innerHTML;
}

function calculateStrength(length, activeGroupCount) {
  let score = 0;

  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;
  if (activeGroupCount >= 3) score += 1;
  if (activeGroupCount === 4 && length >= 18) score += 1;

  return score;
}

function updateStrength(score) {
  const states = [
    {
      label: "Fraca",
      description: "Aumente o tamanho e combine mais tipos de caracteres.",
      detail: "Seria descoberta rapidamente.",
      color: "var(--danger)"
    },
    {
      label: "Regular",
      description: "Melhor, mas ainda vale reforçar a variedade.",
      detail: "Ainda pode ser descoberta com ataques simples.",
      color: "var(--amber)"
    },
    {
      label: "Boa",
      description: "Boa combinacão para contas comuns.",
      detail: "Levaria mais tempo para ser descoberta.",
      color: "var(--blue)"
    },
    {
      label: "Forte",
      description: "Otimo! Sua senha esta segura.",
      detail: "Levaria muitos anos para ser descoberta.",
      color: "var(--green)"
    },
    {
      label: "Muito Forte",
      description: "Excelente! Sua senha esta muito segura.",
      detail: "Levaria milhares de anos para ser descoberta.",
      color: "var(--green)"
    }
  ];
  const state = states[Math.max(0, Math.min(score - 1, states.length - 1))] || states[0];

  elements.strengthLabel.textContent = state.label;
  elements.strengthLabel.style.color = state.color;
  elements.headerStrength.textContent = state.label;
  elements.headerStrength.style.color = state.color;
  elements.strengthDescription.textContent = state.description;
  elements.messageStrength.textContent = `${state.label.toLowerCase()}!`;
  elements.messageStrength.style.color = state.color;
  elements.messageDetail.textContent = state.detail;

  elements.meterBars.forEach((bar, index) => {
    bar.classList.toggle("active", index < score);
    bar.style.background = index < score ? state.color : "#253044";
  });
}

function updateRange() {
  const min = Number(elements.lengthRange.min);
  const max = Number(elements.lengthRange.max);
  const current = Number(elements.lengthRange.value);
  const progress = ((current - min) / (max - min)) * 100;

  elements.lengthValue.textContent = current;
  elements.lengthRange.style.setProperty("--range-progress", `${progress}%`);
}

async function copyPassword() {
  const password = elements.passwordOutput.textContent;

  if (!password || password === "Selecione uma opção") return;

  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(password);
  } else {
    const textarea = document.createElement("textarea");
    textarea.value = password;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  elements.copyButton.classList.add("copied");
  elements.copyButton.querySelector("span:last-child").textContent = "Copiado";

  setTimeout(() => {
    elements.copyButton.classList.remove("copied");
    elements.copyButton.querySelector("span:last-child").textContent = "Copiar";
  }, 1400);
}

elements.lengthRange.addEventListener("input", () => {
  updateRange();
  generatePassword();
});

elements.prefixInput.addEventListener("input", generatePassword);

optionInputs.forEach((input) => {
  input.addEventListener("change", generatePassword);
});

elements.generateButton.addEventListener("click", generatePassword);
elements.quickGenerateButton.addEventListener("click", generatePassword);
elements.copyButton.addEventListener("click", copyPassword);

updateRange();
generatePassword();
