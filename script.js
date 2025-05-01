const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");
const finalValue = document.getElementById("final-value");
const walletBalanceDisplay = document.getElementById("wallet-balance");
const withdrawBtn = document.getElementById("withdraw-btn");
const withdrawModal = document.getElementById("withdraw-modal");
const closeModalBtn = document.querySelector(".close-btn");
const modalBalanceDisplay = document.getElementById("modal-balance");
const upiOptionBtn = document.getElementById("upi-option-btn");
const giftcardOptionBtn = document.getElementById("giftcard-option-btn");
const upiDetailsDiv = document.getElementById("upi-details");
const giftcardDetailsDiv = document.getElementById("giftcard-details");
const upiIdInput = document.getElementById("upi-id");
const upiAmountInput = document.getElementById("upi-amount");
const giftcardTypeSelect = document.getElementById("giftcard-type");
const giftcardAmountInput = document.getElementById("giftcard-amount");
const submitUpiBtn = document.getElementById("submit-upi-withdraw");
const submitGiftcardBtn = document.getElementById("submit-giftcard-withdraw");
const withdrawMessage = document.getElementById("withdraw-message");


let walletBalance = 0; // Initialize wallet balance
let minWithdrawalCoins = 50; // Example: Minimum coins needed to withdraw

//Object that stores values of minimum and maximum angle for a value
const rotationValues = [
  { minDegree: 0, maxDegree: 30, value: 2 },
  { minDegree: 31, maxDegree: 90, value: 1 },
  { minDegree: 91, maxDegree: 150, value: 6 },
  { minDegree: 151, maxDegree: 210, value: 5 },
  { minDegree: 211, maxDegree: 270, value: 4 },
  { minDegree: 271, maxDegree: 330, value: 3 },
  { minDegree: 331, maxDegree: 360, value: 2 },
];
//Size of each piece
const data = [16, 16, 16, 16, 16, 16];
//background color for each piece
var pieColors = [
  "#8b35bc",
  "#b163da",
  "#8b35bc",
  "#b163da",
  "#8b35bc",
  "#b163da",
];
//Create chart
let myChart = new Chart(wheel, {
  plugins: [ChartDataLabels],
  type: "pie",
  data: {
    labels: [1, 2, 3, 4, 5, 6],
    datasets: [
      {
        backgroundColor: pieColors,
        data: data,
      },
    ],
  },
  options: {
    responsive: true,
    animation: { duration: 0 },
    plugins: {
      tooltip: false,
      legend: {
        display: false,
      },
      datalabels: {
        color: "#ffffff",
        formatter: (_, context) => context.chart.data.labels[context.dataIndex],
        font: { size: 24 },
      },
    },
  },
});

// Update Wallet Balance Display
const updateWalletDisplay = () => {
    walletBalanceDisplay.textContent = walletBalance;
    modalBalanceDisplay.textContent = walletBalance; // Update modal balance too
    // Enable/disable withdraw button based on balance
    withdrawBtn.disabled = walletBalance < minWithdrawalCoins;
};

//display value based on the randomAngle and update wallet
const valueGenerator = (angleValue) => {
  let earnedValue = 0;
  for (let i of rotationValues) {
    if (angleValue >= i.minDegree && angleValue <= i.maxDegree) {
      earnedValue = i.value;
      finalValue.innerHTML = `<p>You Won: ${earnedValue} coins</p>`;
      walletBalance += earnedValue; // Add earned value to balance
      updateWalletDisplay(); // Update the wallet display
      spinBtn.disabled = false;
      break;
    }
  }
};

//Spinner count
let count = 0;
//100 rotations for animation and last rotation for result
let resultValue = 101;
//Start spinning
spinBtn.addEventListener("click", () => {
  spinBtn.disabled = true;
  finalValue.innerHTML = `<p>Good Luck!</p>`;
  let randomDegree = Math.floor(Math.random() * (355 - 0 + 1) + 0);
  let rotationInterval = window.setInterval(() => {
    myChart.options.rotation = myChart.options.rotation + resultValue;
    myChart.update();
    if (myChart.options.rotation >= 360) {
      count += 1;
      resultValue -= 5;
      myChart.options.rotation = 0;
    } else if (count > 15 && myChart.options.rotation == randomDegree) {
      valueGenerator(randomDegree);
      clearInterval(rotationInterval);
      count = 0;
      resultValue = 101;
    }
  }, 10);
});

// --- Withdrawal Modal Logic ---

// Show Modal
withdrawBtn.addEventListener("click", () => {
    if (walletBalance >= minWithdrawalCoins) {
        updateWalletDisplay(); // Ensure modal balance is current
        withdrawModal.style.display = "block";
        // Reset modal state
        upiDetailsDiv.style.display = "none";
        giftcardDetailsDiv.style.display = "none";
        upiIdInput.value = "";
        upiAmountInput.value = "";
        giftcardAmountInput.value = "";
        withdrawMessage.textContent = "";
        upiAmountInput.min = minWithdrawalCoins; // Set minimum dynamically if needed
        giftcardAmountInput.min = minWithdrawalCoins; // Set minimum dynamically if needed
    } else {
        alert(`You need at least ${minWithdrawalCoins} coins to withdraw.`);
    }
});

// Hide Modal
closeModalBtn.addEventListener("click", () => {
  withdrawModal.style.display = "none";
});

// Hide Modal if clicked outside the content area
window.addEventListener("click", (event) => {
  if (event.target == withdrawModal) {
    withdrawModal.style.display = "none";
  }
});

// Show UPI Details
upiOptionBtn.addEventListener("click", () => {
    upiDetailsDiv.style.display = "block";
    giftcardDetailsDiv.style.display = "none";
    withdrawMessage.textContent = "";
});

// Show Gift Card Details
giftcardOptionBtn.addEventListener("click", () => {
    giftcardDetailsDiv.style.display = "block";
    upiDetailsDiv.style.display = "none";
    withdrawMessage.textContent = "";
});

// Handle UPI Withdraw Submission (Placeholder)
submitUpiBtn.addEventListener("click", () => {
    const upiId = upiIdInput.value.trim();
    const amount = parseInt(upiAmountInput.value);

    withdrawMessage.textContent = ""; // Clear previous messages

    if (!upiId || !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
        withdrawMessage.textContent = "Please enter a valid UPI ID.";
        withdrawMessage.style.color = "red";
        return;
    }
     if (isNaN(amount) || amount <= 0) {
        withdrawMessage.textContent = "Please enter a valid amount.";
        withdrawMessage.style.color = "red";
        return;
    }
    if (amount < minWithdrawalCoins) {
         withdrawMessage.textContent = `Minimum withdrawal amount is ${minWithdrawalCoins} coins.`;
         withdrawMessage.style.color = "red";
         return;
    }
     if (amount > walletBalance) {
        withdrawMessage.textContent = "Insufficient balance.";
        withdrawMessage.style.color = "red";
        return;
    }

    // **IMPORTANT: Backend Integration Needed Here**
    // Send 'upiId' and 'amount' to your backend server for processing.
    // The backend should validate, process the payment, and update the user's balance.
    console.log(`Withdraw Request: UPI ID=${upiId}, Amount=${amount}`);
    withdrawMessage.textContent = "Processing UPI withdrawal request...";
    withdrawMessage.style.color = "orange";

    // Simulate backend processing delay and response
    setTimeout(() => {
        // --- Replace this with actual backend response handling ---
        const success = true; // Simulate success/failure from backend
        if (success) {
             walletBalance -= amount; // Deduct from balance ONLY on success
             updateWalletDisplay();
             withdrawMessage.textContent = `Successfully initiated withdrawal of ${amount} coins to ${upiId}.`;
             withdrawMessage.style.color = "green";
             upiIdInput.value = ""; // Clear inputs on success
             upiAmountInput.value = "";
             // Optionally close the modal after a delay
             // setTimeout(() => { withdrawModal.style.display = "none"; }, 2000);
        } else {
            withdrawMessage.textContent = "UPI withdrawal failed. Please try again later.";
            withdrawMessage.style.color = "red";
        }
        // --- End of backend simulation ---
    }, 1500); // Simulate 1.5 second delay
});

// Handle Gift Card Withdraw Submission (Placeholder)
submitGiftcardBtn.addEventListener("click", () => {
    const cardType = giftcardTypeSelect.value;
    const amount = parseInt(giftcardAmountInput.value);

    withdrawMessage.textContent = ""; // Clear previous messages

    if (isNaN(amount) || amount <= 0) {
        withdrawMessage.textContent = "Please enter a valid amount.";
        withdrawMessage.style.color = "red";
        return;
    }
     if (amount < minWithdrawalCoins) { // You might have different minimums for gift cards
         withdrawMessage.textContent = `Minimum withdrawal amount is ${minWithdrawalCoins} coins.`; // Adjust if needed
         withdrawMessage.style.color = "red";
         return;
    }
    if (amount > walletBalance) {
        withdrawMessage.textContent = "Insufficient balance.";
         withdrawMessage.style.color = "red";
        return;
    }

     // **IMPORTANT: Backend Integration Needed Here**
    // Send 'cardType' and 'amount' to your backend server.
    // The backend should validate, generate/fetch the gift card code, and update the user's balance.
    console.log(`Withdraw Request: Gift Card Type=${cardType}, Amount=${amount}`);
    withdrawMessage.textContent = "Processing Gift Card request...";
    withdrawMessage.style.color = "orange";


    // Simulate backend processing delay and response
    setTimeout(() => {
        // --- Replace this with actual backend response handling ---
        const success = true; // Simulate success/failure from backend
        const giftCardCode = "ABCD-EFGH-IJKL"; // Simulate received code from backend

        if (success) {
             walletBalance -= amount; // Deduct from balance ONLY on success
             updateWalletDisplay();
             // Display the code (or confirmation) to the user
             withdrawMessage.innerHTML = `Successfully generated ${cardType} Gift Card worth ${amount} coins.<br>Your code: <strong>${giftCardCode}</strong> (This is a fake code)`;
             withdrawMessage.style.color = "green";
             giftcardAmountInput.value = ""; // Clear input on success
              // Optionally close the modal after a delay
             // setTimeout(() => { withdrawModal.style.display = "none"; }, 5000); // Longer delay to show code
        } else {
            withdrawMessage.textContent = "Gift Card request failed. Please try again later.";
            withdrawMessage.style.color = "red";
        }
         // --- End of backend simulation ---
    }, 2000); // Simulate 2 second delay
});

// Initialize wallet display on page load
updateWalletDisplay();
