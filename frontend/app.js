const processBtn = document.getElementById("processBtn");
const pdfFileInput = document.getElementById("pdfFile");
const statusEl = document.getElementById("status");
const spinnerEl = document.getElementById("spinner");
const summaryOutput = document.getElementById("summaryOutput");
const textOutput = document.getElementById("textOutput");
const toggleTextBtn = document.getElementById("toggleTextBtn");
const textContainer = document.getElementById("textContainer");

const API_BASE = "https://jme6e80xa3.execute-api.us-east-1.amazonaws.com/dev";

toggleTextBtn.addEventListener("click", () => {
  const isCollapsed = textContainer.classList.contains("collapsed");

  if (isCollapsed) {
    textContainer.classList.remove("collapsed");
    toggleTextBtn.textContent = "Hide Extracted Text";
  } else {
    textContainer.classList.add("collapsed");
    toggleTextBtn.textContent = "Show Extracted Text";
  }
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function setLoading(isLoading) {
  if (isLoading) {
    spinnerEl.classList.remove("hidden");
    processBtn.disabled = true;
    processBtn.textContent = "Processing...";
  } else {
    spinnerEl.classList.add("hidden");
    processBtn.disabled = false;
    processBtn.textContent = "Process PDF";
  }
}

async function renderStudyNotes(markdownText) {
  let cleaned = markdownText || "No summary returned.";
  cleaned = cleaned.replace(/\[(\\text\{.*?\}.*?)]/gs, '\\[$1\\]');
  summaryOutput.innerHTML = marked.parse(cleaned);

  if (window.MathJax && window.MathJax.typesetPromise) {
    await window.MathJax.typesetPromise([summaryOutput]);
  }
}

async function pollResults(jobId) {
  while (true) {
    statusEl.textContent = `Checking results... Job ID: ${jobId}`;

    const resultsResponse = await fetch(`${API_BASE}/results?jobId=${jobId}`);
    if (!resultsResponse.ok) {
      throw new Error("Failed to fetch processing results.");
    }

    const resultsData = await resultsResponse.json();

    if (resultsData.status === "SUCCEEDED") {
      return resultsData;
    }

    if (resultsData.status === "FAILED") {
      throw new Error("Document processing failed.");
    }

    statusEl.textContent = "Textract is still processing the document...";
    await sleep(3000);
  }
}

processBtn.addEventListener("click", async () => {
  const file = pdfFileInput.files[0];

  if (!file) {
    statusEl.textContent = "Please choose a PDF file first.";
    return;
  }

  try {
    setLoading(true);

    textContainer.classList.add("collapsed");
    toggleTextBtn.textContent = "Show Extracted Text";

    summaryOutput.textContent = "Waiting for AI-generated notes...";
    textOutput.textContent = "Waiting for OCR extracted text...";

    localStorage.removeItem("flashcards");
    localStorage.removeItem("quizzes");

    statusEl.textContent = "Getting upload URL...";
    const uploadUrlResponse = await fetch(`${API_BASE}/upload-url`);
    if (!uploadUrlResponse.ok) {
      throw new Error("Failed to get upload URL.");
    }

    const uploadData = await uploadUrlResponse.json();
    const { uploadUrl, fileKey, bucketName } = uploadData;

    statusEl.textContent = "Uploading PDF to S3...";
    const s3UploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/pdf"
      },
      body: file
    });

    if (!s3UploadResponse.ok) {
      throw new Error("Failed to upload PDF to S3.");
    }

    statusEl.textContent = "Starting Textract document processing...";
    const processResponse = await fetch(`${API_BASE}/process-document`, {
      method: "POST",
      body: JSON.stringify({
        fileKey,
        bucketName
      })
    });

    if (!processResponse.ok) {
      throw new Error("Failed to start document processing.");
    }

    const processData = await processResponse.json();
    const jobId = processData.jobId;

    statusEl.textContent = "Textract started. Waiting for extracted text...";
    textOutput.textContent = "OCR is running...";
    summaryOutput.textContent = "AI study notes will appear after OCR finishes...";

    const resultsData = await pollResults(jobId);

    statusEl.textContent = "Generating AI study notes...";
    textOutput.textContent = resultsData.text || "No extracted text returned.";

    await renderStudyNotes(resultsData.summary || "No summary returned.");

    statusEl.textContent = "Generating flashcards...";
    const flashcardsResponse = await fetch(`${API_BASE}/flashcards`, {
      method: "POST",
      body: JSON.stringify({
        text: resultsData.text || ""
      })
    });

    if (!flashcardsResponse.ok) {
      throw new Error("Failed to generate flashcards.");
    }

    const flashcardsData = await flashcardsResponse.json();
    localStorage.setItem("flashcards", JSON.stringify(flashcardsData.flashcards || []));

    statusEl.textContent = "Generating MCQ quizzes...";
    const quizResponse = await fetch(`${API_BASE}/quiz`, {
      method: "POST",
      body: JSON.stringify({
        text: resultsData.text || ""
      })
    });

    if (!quizResponse.ok) {
      throw new Error("Failed to generate quizzes.");
    }

    const quizData = await quizResponse.json();
    localStorage.setItem("quizzes", JSON.stringify(quizData.quizzes || []));

    statusEl.textContent = "Processing complete.";
  } catch (error) {
    console.error("APP ERROR:", error);
    statusEl.textContent = `Error: ${error.message}`;
    summaryOutput.textContent = "An error occurred.";
    textOutput.textContent = "An error occurred.";
  } finally {
    setLoading(false);
  }
});