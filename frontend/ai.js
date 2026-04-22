const aiAskBtn = document.getElementById("aiAskBtn");
const newChatBtn = document.getElementById("newChatBtn");
const clearContextBtn = document.getElementById("clearContextBtn");
const assistMode = document.getElementById("assistMode");
const aiPrompt = document.getElementById("aiPrompt");
const aiContext = document.getElementById("aiContext");
const aiStatus = document.getElementById("aiStatus");
const aiSpinner = document.getElementById("aiSpinner");
const chatMessages = document.getElementById("chatMessages");
const chatEmpty = document.getElementById("chatEmpty");

const API_BASE = "https://jme6e80xa3.execute-api.us-east-1.amazonaws.com/dev";
const CHAT_STORAGE_KEY = "aiChatHistory";
const CONTEXT_STORAGE_KEY = "aiChatContext";
const MODE_STORAGE_KEY = "aiChatMode";

let chatHistory = [];

function setAiLoading(isLoading) {
  if (isLoading) {
    aiSpinner.classList.remove("hidden");
    aiAskBtn.disabled = true;
    aiAskBtn.textContent = "Sending...";
  } else {
    aiSpinner.classList.add("hidden");
    aiAskBtn.disabled = false;
    aiAskBtn.textContent = "Send";
  }
}

function saveChatState() {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatHistory));
  localStorage.setItem(CONTEXT_STORAGE_KEY, aiContext.value);
  localStorage.setItem(MODE_STORAGE_KEY, assistMode.value);
}

function loadChatState() {
  try {
    const savedHistory = localStorage.getItem(CHAT_STORAGE_KEY);
    chatHistory = savedHistory ? JSON.parse(savedHistory) : [];
  } catch (error) {
    console.error("Failed to load chat history:", error);
    chatHistory = [];
  }

  aiContext.value = localStorage.getItem(CONTEXT_STORAGE_KEY) || "";
  assistMode.value = localStorage.getItem(MODE_STORAGE_KEY) || "general";
}

function clearChatMessagesUI() {
  chatMessages.innerHTML = "";
  const emptyDiv = document.createElement("div");
  emptyDiv.className = "chat-empty";
  emptyDiv.id = "chatEmpty";
  emptyDiv.textContent = "No messages yet. Ask your first question below.";
  chatMessages.appendChild(emptyDiv);
}

async function renderMarkdownInto(element, markdownText) {
  let cleaned = markdownText || "";
  cleaned = cleaned.replace(/\[(\\text\{.*?\}.*?)]/gs, '\\[$1\\]');
  element.innerHTML = marked.parse(cleaned);

  if (window.MathJax && window.MathJax.typesetPromise) {
    await window.MathJax.typesetPromise([element]);
  }
}

async function appendMessage(role, content) {
  const emptyNode = document.getElementById("chatEmpty");
  if (emptyNode) {
    emptyNode.remove();
  }

  const wrapper = document.createElement("div");
  wrapper.className = `chat-bubble ${role === "user" ? "chat-user" : "chat-assistant"}`;

  const roleLabel = document.createElement("div");
  roleLabel.className = "chat-role";
  roleLabel.textContent = role === "user" ? "You" : "AI Assistant";

  const body = document.createElement("div");

  wrapper.appendChild(roleLabel);
  wrapper.appendChild(body);
  chatMessages.appendChild(wrapper);

  if (role === "assistant") {
    await renderMarkdownInto(body, content);
  } else {
    body.textContent = content;
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function renderFullChat() {
  clearChatMessagesUI();

  for (const message of chatHistory) {
    await appendMessage(message.role, message.content);
  }
}

aiAskBtn.addEventListener("click", async () => {
  const prompt = aiPrompt.value.trim();
  const context = aiContext.value.trim();
  const mode = assistMode.value;

  if (!prompt) {
    aiStatus.textContent = "Please enter a message first.";
    return;
  }

  try {
    setAiLoading(true);
    aiStatus.textContent = "Waiting for AI response...";

    const userMessage = {
      role: "user",
      content: prompt
    };

    chatHistory.push(userMessage);
    saveChatState();
    await appendMessage("user", prompt);
    aiPrompt.value = "";

    const response = await fetch(`${API_BASE}/assist`, {
      method: "POST",
      body: JSON.stringify({
        mode,
        context,
        conversationHistory: chatHistory
      })
    });

    if (!response.ok) {
      throw new Error("Failed to get AI assistance.");
    }

    const data = await response.json();
    const assistantText = data.response || "No response returned.";

    const assistantMessage = {
      role: "assistant",
      content: assistantText
    };

    chatHistory.push(assistantMessage);
    saveChatState();
    await appendMessage("assistant", assistantText);

    aiStatus.textContent = "AI response ready.";
  } catch (error) {
    console.error("AI CHAT ERROR:", error);
    aiStatus.textContent = `Error: ${error.message}`;
  } finally {
    setAiLoading(false);
  }
});

newChatBtn.addEventListener("click", async () => {
  chatHistory = [];
  saveChatState();
  await renderFullChat();
  aiStatus.textContent = "Started a new chat.";
});

clearContextBtn.addEventListener("click", () => {
  aiContext.value = "";
  saveChatState();
  aiStatus.textContent = "Context cleared.";
});

assistMode.addEventListener("change", saveChatState);
aiContext.addEventListener("input", saveChatState);

loadChatState();
renderFullChat();