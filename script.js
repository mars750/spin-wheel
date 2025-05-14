const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");
const finalValue = document.getElementById("final-value");
const walletAmountDisplay = document.getElementById("wallet-amount");
const withdrawButton = document.getElementById("withdraw-btn");
const withdrawalOptionsDiv = document.getElementById("withdraw-options");

// 🔁 LocalStorage से वॉलेट राशि प्राप्त करें या 50 सेट करें
let walletBalance = parseInt(localStorage.getItem("walletBalance")) || 50;

// वॉलेट राशि को अपडेट और दिखाने का फंक्शन
const updateWalletDisplay = () => {
    if (walletAmountDisplay) {
        walletAmountDisplay.innerText = `Wallet: ${walletBalance} coins`;
    } else {
        console.error("Error: 'wallet-amount' element not found in the HTML.");
    }
};

// 🎯 Wheel के rewards के angle और value
const rotationValues = [
    { minDegree: 0, maxDegree: 30, value: 2 },
    { minDegree: 31, maxDegree: 90, value: 1 },
    { minDegree: 91, maxDegree: 150, value: 6 },
    { minDegree: 151, maxDegree: 210, value: 5 },
    { minDegree: 211, maxDegree: 270, value: 4 },
    { minDegree: 271, maxDegree: 330, value: 3 },
    { minDegree: 331, maxDegree: 360, value: 2 },
];

// Wheel pieces और colors
const data = [16, 16, 16, 16, 16, 16];
const pieColors = [
    "#8b35bc",
    "#b163da",
    "#8b35bc",
    "#b163da",
    "#8b35bc",
    "#b163da",
];

// 🎡 Wheel Chart बनाएं
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

// 🎁 जीत की वैल्यू और wallet में जोड़ें
const valueGenerator = (angleValue) => {
    for (let i of rotationValues) {
        if (angleValue >= i.minDegree && angleValue <= i.maxDegree) {
            finalValue.innerHTML = `<p>You won: ${i.value} coins!</p>`;
            walletBalance += i.value;
            localStorage.setItem("walletBalance", walletBalance); // save to storage
            updateWalletDisplay();
            spinBtn.disabled = false;
            break;
        }
    }
};

// 🌀 Spin Logic
let count = 0;
let resultValue = 101;

spinBtn.addEventListener("click", () => {
    spinBtn.disabled = true;
    finalValue.innerHTML = `<p>Good Luck!</p>`;
    let randomDegree = Math.floor(Math.random() * 356);

    let rotationInterval = window.setInterval(() => {
        myChart.options.rotation += resultValue;
        myChart.update();

        if (myChart.options.rotation >= 360) {
            count += 1;
            resultValue -= 5;
            myChart.options.rotation = 0;
        } else if (count > 15 && myChart.options.rotation === randomDegree) {
            valueGenerator(randomDegree);
            clearInterval(rotationInterval);
            count = 0;
            resultValue = 101;
        }
    }, 10);
});

// 💸 Withdraw Button
if (withdrawButton) {
    withdrawButton.addEventListener("click", () => {
        if (withdrawalOptionsDiv) {
            withdrawalOptionsDiv.innerHTML = `
                <h3>Withdraw Options</h3>
                <p>Current Balance: ${walletBalance} coins</p>
                <button onclick="handleWithdraw('upi')">UPI</button>
                <button onclick="handleWithdraw('giftcard')">Gift Card</button>
            `;
        } else {
            console.error("Error: 'withdraw-options' element not found in the HTML.");
        }
    });
} else {
    console.error("Error: 'withdraw-btn' element not found in the HTML.");
}

// 💵 Withdrawal Logic
function handleWithdraw(method) {
    let minimumWithdrawal = 10;  // Withdraw करने के लिए न्यूनतम coins
    let deduction = 10;          // हर withdrawal पर घटने वाले coins

    if (walletBalance < minimumWithdrawal) {
        alert(`You need at least ${minimumWithdrawal} coins to withdraw.`);
        return;
    }

    walletBalance -= deduction;
    localStorage.setItem("walletBalance", walletBalance);
    updateWalletDisplay();

    if (method === 'upi') {
        alert(`You withdrew ${deduction} coins via UPI.`);
    } else if (method === 'giftcard') {
        alert(`You withdrew ${deduction} coins for a Gift Card.`);
    }
}

// 🔁 Page Load पर wallet दिखाएं
updateWalletDisplay();
