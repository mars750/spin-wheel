const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");
const finalValue = document.getElementById("final-value");
const walletAmountDisplay = document.getElementById("wallet-amount");
const withdrawButton = document.getElementById("withdraw-btn");
const withdrawalOptionsDiv = document.getElementById("withdraw-options");

// 🔁 LocalStorage से वॉलेट बैलेंस लाओ या 50 coins से शुरू करो
let storedBalance = localStorage.getItem("walletBalance");
let walletBalance = storedBalance ? parseInt(storedBalance) : 50;

// वॉलेट डिस्प्ले अपडेट करने का फंक्शन
const updateWalletDisplay = () => {
    if (walletAmountDisplay) {
        walletAmountDisplay.innerText = `Wallet: ${walletBalance} coins`;
    } else {
        console.error("Error: 'wallet-amount' element not found in the HTML.");
    }
};

// रोटेशन वैल्यूज
const rotationValues = [
    { minDegree: 0, maxDegree: 30, value: 2 },
    { minDegree: 31, maxDegree: 90, value: 1 },
    { minDegree: 91, maxDegree: 150, value: 6 },
    { minDegree: 151, maxDegree: 210, value: 5 },
    { minDegree: 211, maxDegree: 270, value: 4 },
    { minDegree: 271, maxDegree: 330, value: 3 },
    { minDegree: 331, maxDegree: 360, value: 2 },
];

// Pie चार्ट के डेटा
const data = [16, 16, 16, 16, 16, 16];
const pieColors = ["#8b35bc", "#b163da", "#8b35bc", "#b163da", "#8b35bc", "#b163da"];

// Chart बनाना
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

// रोटेशन से वैल्यू निकालना
const valueGenerator = (angleValue) => {
    for (let i of rotationValues) {
        if (angleValue >= i.minDegree && angleValue <= i.maxDegree) {
            finalValue.innerHTML = `<p>You won: ${i.value} coins!</p>`;
            walletBalance += i.value; // 🟢 वॉलेट में जोड़ो
            localStorage.setItem("walletBalance", walletBalance); // 🟢 सेव करो localStorage में
            updateWalletDisplay(); // UI अपडेट
            spinBtn.disabled = false;
            break;
        }
    }
};

// स्पिनिंग लॉजिक
let count = 0;
let resultValue = 101;

spinBtn.addEventListener("click", () => {
    spinBtn.disabled = true;
    finalValue.innerHTML = `<p>Good Luck!</p>`;
    let randomDegree = Math.floor(Math.random() * (355 - 0 + 1) + 0);

    let rotationInterval = window.setInterval(() => {
        myChart.options.rotation += resultValue;
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

// विथड्रॉ बटन
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

// पेज लोड पर UI अपडेट करें
updateWalletDisplay();

// विथड्रॉ प्रोसेस
function handleWithdraw(method) {
    if (method === 'upi') {
        alert('UPI withdrawal functionality will be implemented here.');
    } else if (method === 'giftcard') {
        alert('Gift Card withdrawal functionality will be implemented here.');
    }
}
