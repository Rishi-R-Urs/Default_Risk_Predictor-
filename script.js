// Backend API endpoint on PythonAnywhere
const API_URL = "https://rurs.pythonanywhere.com/predict";

// Form + result elements
const form = document.getElementById("prediction-form");
const resultCard = document.getElementById("result-card");
const errorCard = document.getElementById("error-card");
const resultLabel = document.getElementById("result-label");
const resultProb = document.getElementById("result-prob");
const resultNote = document.getElementById("result-note");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Hide previous messages
  errorCard.classList.add("hidden");
  resultCard.classList.add("hidden");

  // Read input values from the form
  const loan_amnt = parseFloat(document.getElementById("loan_amnt").value);
  const int_rate = parseFloat(document.getElementById("int_rate").value);
  const annual_inc = parseFloat(document.getElementById("annual_inc").value);
  const dti = parseFloat(document.getElementById("dti").value);
  const fico_range_low = parseFloat(document.getElementById("fico_low").value);
  const fico_range_high = parseFloat(document.getElementById("fico_high").value);

  // Loan term slider / select: value should be "36" or "60"
  const termSelect = document.getElementById("term");
  const term_36 = termSelect.value === "36" ? 1 : 0;

  // Payload must match Flask DEPLOY_FEATURES exactly
  const payload = {
    loan_amnt,
    int_rate,
    annual_inc,
    dti,
    fico_range_low,
    fico_range_high,
    term_36,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST", // <<--- IMPORTANT: use POST, not GET
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const data = await response.json();

    const probPct = (data.prob_default * 100).toFixed(2);

    resultLabel.textContent = data.label || "Prediction";
    resultProb.textContent = `Estimated probability of default: ${probPct}%`;
    resultNote.textContent =
      "This demo model is trained on historical LendingClub loans and is for educational purposes only, not financial advice.";

    resultCard.classList.remove("hidden");
  } catch (err) {
    console.error("Prediction error:", err);
    errorMessage.textContent = err.message || "Load failed";
    errorCard.classList.remove("hidden");
  }
});

