const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");
const finalValue = document.getElementById("final-value");
const walletBalance = document.getElementById("wallet-balance");
const withdrawBtn = document.getElementById("withdraw-btn");
const historyList = document.getElementById("history-list");

// Initialize wallet and history
let wallet = parseInt(localStorage.getItem('wallet')) || 0;
let history = JSON.parse(localStorage.getItem('withdraw_history')) || [];

walletBalance.innerText = `Wallet: ${wallet}`;

// Load history
const loadHistory = () => {
  historyList.innerHTML = "";
  history.forEach((entry) => {
    const li = document.createElement("li");
    li.innerText = `Withdrawn ₹${entry.amount} at ${entry.time}`;
    historyList.appendChild(li);
  });
};
loadHistory();

// Update wallet
const updateWallet = (amount) => {
  wallet += amount;
  localStorage.setItem('wallet', wallet);
  walletBalance.innerText = `Wallet: ${wallet}`;
};

// Withdraw wallet
withdrawBtn.addEventListener("click", () => {
  const minWithdraw = 10; // Minimum wallet needed to withdraw
  if (wallet >= minWithdraw) {
    alert(`Withdrawal Successful! You withdrew ₹${wallet}.`);

    // Add to history
    const now = new Date();
    const entry = {
      amount: wallet,
      time: now.toLocaleString(),
    };
    history.push(entry);
    localStorage.setItem('withdraw_history', JSON.stringify(history));
    loadHistory();

    // Reset wallet
    wallet = 0;
    localStorage.setItem('wallet', wallet);
    walletBalance.innerText = `Wallet: ${wallet}`;
  } else {
    alert(`Minimum ₹${minWithdraw} required to withdraw!`);
  }
});

// Rotation values
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
var pieColors = ["#8b35bc", "#b163da", "#8b35bc", "#b163da", "#8b35bc", "#b163da"];

let myChart = new Chart(wheel, {
  plugins: [ChartDataLabels],
  type: "pie",
  data: {
    labels: [1, 2, 3, 4, 5, 6],
    datasets: [{ backgroundColor: pieColors, data: data }],
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

// Value Generator
const valueGenerator = (angleValue) => {
  for (let i of rotationValues) {
    if (angleValue >= i.minDegree && angleValue <= i.maxDegree) {
      finalValue.innerHTML = `<p>Value: ${i.value}</p>`;
      updateWallet(i.value);
      spinBtn.disabled = false;
      break;
    }
  }
};

let count = 0;
let resultValue = 101;

// Spin Button Click
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
