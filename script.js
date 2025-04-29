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

// Coin to Rupee Conversion Settings
const coinToRupeeRate = 100; // 100 coins = 1 Rupee
const minimumWithdrawCoins = 1000; // Minimum coins required for withdrawal

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
const pieColors = ["#8b35bc", "#b163da", "#8b35bc", "#b163da", "#8b35bc", "#b163da"];

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

const valueGenerator = (angleValue) => {
    for (let i of rotationValues) {
        if (angleValue >= i.minDegree && angleValue <= i.maxDegree) {
            finalValue.innerHTML = `<p>Value: ${i.value}</p>`;
            spinBtn.disabled = false;
            walletAmount += i.value;
            updateWalletDisplay();
            break;
        }
    }
};

let walletAmount = 0;

function updateWalletDisplay() {
    currentCoins.textContent = walletAmount;
}

let count = 0;
let resultValue = 101;

spinBtn.addEventListener("click", () => {
    spinBtn.disabled = true;
    finalValue.innerHTML = `<p>Good Luck!</p>`;
    let randomDegree = Math.floor(Math.random() * 360);
    let rotationInterval = window.setInterval(() => {
        myChart.options.rotation = (myChart.options.rotation + resultValue) % 360;
        myChart.update();
        if (myChart.options.rotation >= 360) {
            count++;
            resultValue -= 5;
            myChart.options.rotation = 0;
        } else if (count > 15 && Math.round(myChart.options.rotation) === randomDegree) {
            valueGenerator(randomDegree);
            clearInterval(rotationInterval);
            count = 0;
            resultValue = 101;
        }
    }, 10);
});

// Wallet Button
walletBtn.addEventListener("click", () => {
    withdrawForm.style.display = "none";
    alert(`Your current wallet amount is: ${walletAmount} coins`);
});

// Withdraw Button
withdrawBtn.addEventListener("click", () => {
    withdrawForm.style.display = "block";
});

// Confirm Withdraw
confirmWithdrawBtn.addEventListener("click", () => {
    const upiId = upiIdInput.value.trim();
    const withdrawCoins = parseInt(withdrawAmountInput.value);

    if (!upiId) {
        alert("Please enter your UPI ID.");
        return;
    }
    if (isNaN(withdrawCoins) || withdrawCoins <= 0) {
        alert("Please enter a valid number of coins to withdraw.");
        return;
    }
    if (walletAmount < withdrawCoins) {
        alert("You don't have enough coins.");
        return;
    }
    if (withdrawCoins < minimumWithdrawCoins) {
        alert(`Minimum ${minimumWithdrawCoins} coins required to withdraw.`);
        return;
    }

    const rupees = (withdrawCoins / coinToRupeeRate).toFixed(2);

    walletAmount -= withdrawCoins;
    updateWalletDisplay();

    alert(`Withdrawal successful! ₹${rupees} sent to ${upiId}`);
    upiIdInput.value = "";
    withdrawAmountInput.value = "";
    withdrawForm.style.display = "none";
});
