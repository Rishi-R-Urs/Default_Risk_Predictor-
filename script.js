// CHANGE THIS to your actual PythonAnywhere URL
const API_URL = "https://rurs.pythonanywhere.com/predict";

const form = document.getElementById("prediction-form");
const resultCard = document.getElementById("result-card");
const errorCard = document.getElementById("error-card");
const resultLabel = document.getElementById("result-label");
const resultProb = document.getElementById("result-prob");
const resultNote = document.getElementById("result-note");
const errorMessage = document.getElementById("error-message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorCard.classList.add("hidden");
  resultCard.classList.add("hidden");

  const loan_amnt = parseFloat(document.getElementById("loan_amnt").value);
  const int_rate = parseFloat(document.getElementById("int_rate").value);
  const annual_inc = parseFloat(document.getElementById("annual_inc").value);
  const dti = parseFloat(document.getElementById("dti").value);
  const fico_low = parseFloat(document.getElementById("fico_low").value);
  const fico_high = parseFloat(document.getElementById("fico_high").value);
  const termValue = document.getElementById("term").value;

  const term_36 = termValue === "36" ? 1 : 0;

  const payload = {
    loan_amnt: loan_amnt,
    int_rate: int_rate,
    annual_inc: annual_inc,
    dti: dti,
    fico_range_low: fico_low,
    fico_range_high: fico_high,
    term_36: term_36,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "API error");
    }

    const data = await response.json();

    const probPct = (data.prob_default * 100).toFixed(2);

    resultLabel.textContent = `Prediction: ${data.label}`;
    resultProb.textContent = `Estimated probability of default: ${probPct}%`;
    resultNote.textContent =
      "This demo model is trained on historical LendingClub loan data using a small set of features. It is for educational purposes only and not financial advice.";

    resultCard.classList.remove("hidden");
  } catch (err) {
    errorMessage.textContent = err.message;
    errorCard.classList.remove("hidden");
  }
});
