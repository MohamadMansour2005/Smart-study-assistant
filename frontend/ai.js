const aiAskBtn = document.getElementById("aiAskBtn");
const aiPrompt = document.getElementById("aiPrompt");
const aiContext = document.getElementById("aiContext");
const aiStatus = document.getElementById("aiStatus");
const aiOutput = document.getElementById("aiOutput");

aiAskBtn.addEventListener("click", () => {
  const prompt = aiPrompt.value.trim();
  const context = aiContext.value.trim();

  if (!prompt) {
    aiStatus.textContent = "Please enter a question or instruction first.";
    return;
  }

  aiStatus.textContent = "AI Assistance page shell is ready.";
  aiOutput.textContent =
    `Prompt:\n${prompt}\n\n` +
    `Context:\n${context || "No extra context provided."}\n\n` +
    `Next step: connect this page to your AI backend.`;
});