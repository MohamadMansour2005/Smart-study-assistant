const flashcardFront = document.getElementById("flashcardFront");
const flashcardBack = document.getElementById("flashcardBack");
const flipCardBtn = document.getElementById("flipCardBtn");
const prevCardBtn = document.getElementById("prevCardBtn");
const nextCardBtn = document.getElementById("nextCardBtn");
const flashcardStatus = document.getElementById("flashcardStatus");

let flashcards = [];
let currentCardIndex = 0;
let showingAnswer = false;

function renderFlashcard() {
  if (!flashcards.length) {
    flashcardFront.textContent = "No flashcards available yet. Process a PDF first.";
    flashcardBack.textContent = "";
    flashcardBack.classList.add("hidden");
    flashcardFront.classList.remove("hidden");
    flipCardBtn.disabled = true;
    prevCardBtn.disabled = true;
    nextCardBtn.disabled = true;
    flashcardStatus.textContent = "No flashcards loaded.";
    return;
  }

  const card = flashcards[currentCardIndex];

  flashcardFront.textContent = card.question;
  flashcardBack.textContent = card.answer;

  if (showingAnswer) {
    flashcardFront.classList.add("hidden");
    flashcardBack.classList.remove("hidden");
    flipCardBtn.textContent = "Show Question";
  } else {
    flashcardFront.classList.remove("hidden");
    flashcardBack.classList.add("hidden");
    flipCardBtn.textContent = "Show Answer";
  }

  flipCardBtn.disabled = false;
  prevCardBtn.disabled = false;
  nextCardBtn.disabled = false;
  flashcardStatus.textContent = `Card ${currentCardIndex + 1} of ${flashcards.length}`;
}

flipCardBtn.addEventListener("click", () => {
  showingAnswer = !showingAnswer;
  renderFlashcard();
});

prevCardBtn.addEventListener("click", () => {
  if (!flashcards.length) return;
  currentCardIndex = (currentCardIndex - 1 + flashcards.length) % flashcards.length;
  showingAnswer = false;
  renderFlashcard();
});

nextCardBtn.addEventListener("click", () => {
  if (!flashcards.length) return;
  currentCardIndex = (currentCardIndex + 1) % flashcards.length;
  showingAnswer = false;
  renderFlashcard();
});

try {
  const savedFlashcards = localStorage.getItem("flashcards");
  flashcards = savedFlashcards ? JSON.parse(savedFlashcards) : [];
} catch (error) {
  console.error("Failed to load flashcards from localStorage:", error);
  flashcards = [];
}

renderFlashcard();