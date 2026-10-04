// Keep this list small and local. It is a warning list, not a breach database.
const commonPasswords = new Set([
  "password",
  "123456",
  "12345678",
  "qwerty",
  "admin",
  "welcome",
  "letmein"
]);

const passwordInput = document.querySelector("#password-input");
const toggleButton = document.querySelector("#toggle-password");
const generateButton = document.querySelector("#generate-password");
const copyButton = document.querySelector("#copy-password");
const strengthLevel = document.querySelector("#strength-level");
const strengthScore = document.querySelector("#strength-score");
const strengthTrack = document.querySelector("#strength-track");
const strengthFill = document.querySelector("#strength-fill");
const suggestionList = document.querySelector("#suggestion-list");
const commonWarning = document.querySelector("#common-warning");
const actionStatus = document.querySelector("#action-status");

const requirementElements = {
  length: document.querySelector("#requirement-length"),
  uppercase: document.querySelector("#requirement-uppercase"),
  lowercase: document.querySelector("#requirement-lowercase"),
  number: document.querySelector("#requirement-number"),
  special: document.querySelector("#requirement-special")
};

// Describe the password's visible characteristics without sending it anywhere.
function inspectPassword(password) {
  return {
    longEnough: password.length >= 8,
    longForStrength: password.length >= 12,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
    isCommon: commonPasswords.has(password.toLowerCase()),
    hasRepeatedCharacters: hasExcessiveRepeats(password)
  };
}

// Treat long runs of one character, or a character used in over half the
// password, as repetition worth warning about.
function hasExcessiveRepeats(password) {
  if (/(.)\1{2,}/.test(password)) {
    return true;
  }

  if (password.length < 4) {
    return false;
  }

  const characterCounts = new Map();
  for (const character of password) {
    characterCounts.set(character, (characterCounts.get(character) || 0) + 1);
    if (characterCounts.get(character) > password.length / 2) {
      return true;
    }
  }
  return false;
}

// Use a simple, explainable heuristic rather than claiming to measure certainty.
function calculateScore(password, analysis) {
  if (password.length === 0) {
    return 0;
  }

  const categoryCount = [
    analysis.hasUppercase,
    analysis.hasLowercase,
    analysis.hasNumber,
    analysis.hasSpecial
  ].filter(Boolean).length;

  let score = Math.min(password.length, 20) * 2;
  score += categoryCount * 10;
  if (analysis.longForStrength && !analysis.hasRepeatedCharacters) {
    score += 20;
  }
  if (analysis.isCommon) {
    score -= 60;
  }
  if (analysis.hasRepeatedCharacters) {
    score -= 20;
  }

  return Math.max(0, Math.min(100, score));
}

function getStrengthLabel(score, hasPassword) {
  if (!hasPassword) return "Not rated";
  if (score < 20) return "Very Weak";
  if (score < 40) return "Weak";
  if (score < 60) return "Medium";
  if (score < 80) return "Strong";
  return "Very Strong";
}

function updateRequirement(element, isMet) {
  element.classList.toggle("is-met", isMet);
  element.setAttribute("aria-checked", String(isMet));
}

function renderSuggestions(password, analysis) {
  const suggestions = [];

  if (password.length < 8) suggestions.push("Use at least 8 characters.");
  else if (!analysis.longForStrength) suggestions.push("Use 12 or more characters for stronger protection.");
  if (!analysis.hasUppercase) suggestions.push("Add an uppercase letter.");
  if (!analysis.hasLowercase) suggestions.push("Add a lowercase letter.");
  if (!analysis.hasNumber) suggestions.push("Add a number.");
  if (!analysis.hasSpecial) suggestions.push("Add a special character.");
  if (analysis.hasRepeatedCharacters) suggestions.push("Avoid repeated characters.");
  if (analysis.isCommon) suggestions.push("Avoid common passwords.");
  if (suggestions.length === 0) suggestions.push("Good mix. A longer password can be even stronger.");

  suggestionList.replaceChildren(...suggestions.map((suggestion) => {
    const item = document.createElement("li");
    item.textContent = suggestion;
    return item;
  }));
  if (suggestions.length === 1 && suggestions[0].startsWith("Good mix")) {
    suggestionList.firstElementChild.classList.add("suggestion-good");
  }
}

function analyzeCurrentPassword() {
  const password = passwordInput.value;
  const analysis = inspectPassword(password);
  const score = calculateScore(password, analysis);
  const strength = getStrengthLabel(score, password.length > 0);

  updateRequirement(requirementElements.length, analysis.longEnough);
  updateRequirement(requirementElements.uppercase, analysis.hasUppercase);
  updateRequirement(requirementElements.lowercase, analysis.hasLowercase);
  updateRequirement(requirementElements.number, analysis.hasNumber);
  updateRequirement(requirementElements.special, analysis.hasSpecial);

  strengthLevel.textContent = strength;
  strengthScore.textContent = `${score}/100`;
  strengthTrack.setAttribute("aria-valuenow", String(score));
  strengthTrack.setAttribute("aria-valuetext", `${strength}, ${score} out of 100`);
  strengthFill.style.width = `${score}%`;
  strengthFill.dataset.level = strength.toLowerCase().replaceAll(" ", "-");
  commonWarning.hidden = !analysis.isCommon;
  copyButton.disabled = password.length === 0;

  if (password.length === 0) {
    suggestionList.replaceChildren();
    const emptyMessage = document.createElement("li");
    emptyMessage.textContent = "Enter a password to see suggestions.";
    suggestionList.append(emptyMessage);
  } else {
    renderSuggestions(password, analysis);
  }
}

// Draw an unbiased random integer from 0 up to (but not including) max.
function secureRandomInteger(max) {
  const randomValues = new Uint8Array(1);
  const acceptedLimit = Math.floor(256 / max) * max;
  let randomByte;

  do {
    window.crypto.getRandomValues(randomValues);
    randomByte = randomValues[0];
  } while (randomByte >= acceptedLimit);

  return randomByte % max;
}

function generateStrongPassword() {
  const characterSets = [
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "abcdefghijklmnopqrstuvwxyz",
    "0123456789",
    "!@#$%^&*()-_=+[]{}?"
  ];
  const allCharacters = characterSets.join("");
  const passwordCharacters = characterSets.map((characterSet) =>
    characterSet[secureRandomInteger(characterSet.length)]
  );

  // Twelve characters meets the minimum; extra random characters add variety.
  while (passwordCharacters.length < 16) {
    passwordCharacters.push(allCharacters[secureRandomInteger(allCharacters.length)]);
  }

  // Shuffle so the required character types do not always start in the same order.
  for (let index = passwordCharacters.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandomInteger(index + 1);
    [passwordCharacters[index], passwordCharacters[swapIndex]] =
      [passwordCharacters[swapIndex], passwordCharacters[index]];
  }

  passwordInput.value = passwordCharacters.join("");
  passwordInput.type = "password";
  toggleButton.textContent = "Show";
  toggleButton.setAttribute("aria-pressed", "false");
  analyzeCurrentPassword();
  actionStatus.textContent = "A new password was generated in your browser.";
}

async function copyCurrentPassword() {
  if (passwordInput.value.length === 0) {
    actionStatus.textContent = "Enter or generate a password before copying.";
    return;
  }

  try {
    await navigator.clipboard.writeText(passwordInput.value);
    actionStatus.textContent = "Password copied to the clipboard.";
  } catch {
    actionStatus.textContent = "Clipboard access is unavailable. Use a secure browser context such as Live Server.";
  }
}

passwordInput.addEventListener("input", () => {
  actionStatus.textContent = "";
  analyzeCurrentPassword();
});

toggleButton.addEventListener("click", () => {
  const willShowPassword = passwordInput.type === "password";
  passwordInput.type = willShowPassword ? "text" : "password";
  toggleButton.textContent = willShowPassword ? "Hide" : "Show";
  toggleButton.setAttribute("aria-pressed", String(willShowPassword));
});

generateButton.addEventListener("click", generateStrongPassword);
copyButton.addEventListener("click", copyCurrentPassword);

analyzeCurrentPassword();