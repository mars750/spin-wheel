const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");
const finalValue = document.getElementById("final-value");
const walletBtn = document.getElementById("wallet-btn");
const withdrawBtn = document.getElementById("withdraw-btn");
const currentCoins = document.getElementById("current-coins");
const withdrawForm = document.getElementById("withdraw-form");
const upiIdInput = document.getElementById("upi-id");
const withdrawAmountInput = document.getElementById("withdraw-amount");
const confirmWithdrawBtn = document.getElementById("confirm-withdraw-btn");

const rotationValues = [
  { minDegree: 0, maxDegree: 30, value: 2 },
  { minDegree: 31, maxDegree: 90, value: 1 },
  { minDegree: 91, maxDegree: 150, value: 6 },
  { minDegree: 151, maxDegree: 210, value: 5 },
  { minDegree: 211, maxDegree: 270, value: 4 },
  { minDegree: 271, maxDegree: 330, value: 3 },
  { minDegree: 331, maxDegree: 360, value: 2 },
];

const data = [16, 16, 16, 16, 16, 16];

var pieColors = [
  "#8b35bc", "#b163da",
  "#8b35bc", "#b163da",
  "#8b35bc", "#b163da",
];

let myChart = new Chart(wheel, {
  plugins: [ChartDataLabels],
  type: "pie",
  data: {
    labels: [1, 2, 3, 4, 5, 6],
    datasets: [{
      backgroundColor: pieColors,
      data: data,
    }],
  },
  options: {
    responsive: true,
    animation: { duration: 0 },
    plugins: {
      tooltip: false,
      legend: { display: false },
      datalabels: {
        color: "#ffffff",
        formatter: (_, context) => context.chart.data.labels[context.dataIndex],
        font: { size: 24 },
      },
    },
  },
});

let walletAmount = 0;

function updateWalletDisplay() {
  currentCoins.textContent = walletAmount;
}

const valueGenerator = (angleValue) => {
  for (let i of rotationValues) {
    if (angleValue >= i.minDegree && angleValue <= i.maxDegree) {
      finalValue.innerHTML = `<p>Value: ${i.value}</p>`;
      walletAmount += i.value;
      updateWalletDisplay();
      break;
    }
  }
};

let count = 0;
let resultValue = 101;

spinBtn.addEventListener("click", () => {
  spinBtn.disabled = true;
  finalValue.innerHTML = `<p>Good Luck!</p>`;
  let randomDegree = Math.floor(Math.random() * 360);

  let rotationInterval = window.setInterval(() => {
    myChart.options.rotation += resultValue;
    myChart.update();

    if (myChart.options.rotation >= 360) {
      myChart.options.rotation = myChart.options.rotation - 360;
      count += 1;
      resultValue -= 5;
    }

    if (resultValue <= 5 && count > 15) {
      clearInterval(rotationInterval);
      valueGenerator(myChart.options.rotation);
      count = 0;
      resultValue = 101;
      spinBtn.disabled = false;
    }
  }, 10);
});

walletBtn.addEventListener("click", () => {
  withdrawForm.style.display = "none";
  alert(`Your current wallet amount is: ${walletAmount} coins`);
});

withdrawBtn.addEventListener("click", () => {
  withdrawForm.style.display = "block";
});

confirmWithdrawBtn.addEventListener("click", () => {
  const upiId = upiIdInput.value;
  const withdrawAmount = parseInt(withdrawAmountInput.value);

  if (!upiId) {
    alert("Please enter your UPI ID.");
  } else if (withdrawAmount < 1000) {
    alert("Minimum withdraw is 1000 coins (₹10).");
  } else if (walletAmount >= withdrawAmount) {
    walletAmount -= withdrawAmount;
    updateWalletDisplay();
    alert(`Withdrawal successful! ₹${(withdrawAmount / 100).toFixed(2)} sent to ${upiId}`);
    upiIdInput.value = "";
    withdrawAmountInput.value = "";
    withdrawForm.style.display = "none";
  } else {
    alert("Insufficient coins.");
  }
});
