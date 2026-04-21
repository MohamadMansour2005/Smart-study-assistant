const quizQuestion = document.getElementById("quizQuestion");
const quizChoices = document.getElementById("quizChoices");
const submitQuizBtn = document.getElementById("submitQuizBtn");
const nextQuizBtn = document.getElementById("nextQuizBtn");
const quizStatus = document.getElementById("quizStatus");
const quizCorrectAnswer = document.getElementById("quizCorrectAnswer");

let quizzes = [];
let currentQuizIndex = 0;

function renderQuiz() {
  if (!quizzes.length) {
    quizQuestion.textContent = "No quiz questions available yet. Process a PDF first.";
    quizChoices.innerHTML = "";
    quizCorrectAnswer.textContent = "Your result and explanation will appear here after you submit.";
    quizStatus.textContent = "No quiz data loaded.";
    submitQuizBtn.disabled = true;
    nextQuizBtn.disabled = true;
    return;
  }

  const currentQuiz = quizzes[currentQuizIndex];

  quizQuestion.textContent = currentQuiz.question;
  quizChoices.innerHTML = "";
  quizCorrectAnswer.textContent = "Your result and explanation will appear here after you submit.";
  quizStatus.textContent = `Question ${currentQuizIndex + 1} of ${quizzes.length}`;
  submitQuizBtn.disabled = false;
  nextQuizBtn.disabled = false;

  currentQuiz.choices.forEach((choice) => {
    const optionLabel = document.createElement("label");
    optionLabel.className = "mcq-option";

    optionLabel.innerHTML = `
      <input type="radio" name="quizOption" value="${choice}">
      <span>${choice}</span>
    `;

    quizChoices.appendChild(optionLabel);
  });
}

submitQuizBtn.addEventListener("click", () => {
  const selectedOption = document.querySelector('input[name="quizOption"]:checked');

  if (!selectedOption) {
    quizStatus.textContent = "Please choose an answer before submitting.";
    return;
  }

  const selectedValue = selectedOption.value;
  const currentQuiz = quizzes[currentQuizIndex];
  const isCorrect = selectedValue === currentQuiz.correctAnswer;

  if (isCorrect) {
    quizCorrectAnswer.innerHTML = `
      <div class="result-correct">Correct ✅</div>
      <br>
      <strong>Correct Answer:</strong> ${currentQuiz.correctAnswer}
      <br><br>
      <strong>Explanation:</strong> ${currentQuiz.explanation}
    `;
  } else {
    quizCorrectAnswer.innerHTML = `
      <div class="result-incorrect">Incorrect ❌</div>
      <br>
      <strong>Your Answer:</strong> ${selectedValue}
      <br>
      <strong>Correct Answer:</strong> ${currentQuiz.correctAnswer}
      <br><br>
      <strong>Explanation:</strong> ${currentQuiz.explanation}
    `;
  }

  quizStatus.textContent = "Answer submitted.";
});

nextQuizBtn.addEventListener("click", () => {
  if (!quizzes.length) return;
  currentQuizIndex = (currentQuizIndex + 1) % quizzes.length;
  renderQuiz();
});

try {
  const savedQuizzes = localStorage.getItem("quizzes");
  quizzes = savedQuizzes ? JSON.parse(savedQuizzes) : [];
} catch (error) {
  console.error("Failed to load quizzes from localStorage:", error);
  quizzes = [];
}

renderQuiz();