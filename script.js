const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");
const finalValue = document.getElementById("final-value");
const walletBtn = document.getElementById("wallet-btn");
const withdrawBtn = document.getElementById("withdraw-btn");
const walletInfo = document.getElementById("wallet-info");
const currentCoinsSpan = document.getElementById("current-coins");
const withdrawForm = document.getElementById("withdraw-form");
const upiIdInput = document.getElementById("upi-id");
const withdrawAmountInput = document.getElementById("withdraw-amount");
const confirmWithdrawBtn = document.getElementById("confirm-withdraw-btn");

let spinning = false;
let currentCoins = parseInt(localStorage.getItem('coins')) || 0; // Local storage se coins load karein
currentCoinsSpan.textContent = currentCoins;

// Wheel ke liye values (aap ise apne anusaar badal sakte hain)
const rotationValues = [
    { minDegree: 0, maxDegree: 30, value: 1 },
    { minDegree: 31, maxDegree: 90, value: 2 },
    { minDegree: 91, maxDegree: 150, value: 3 },
    { minDegree: 151, maxDegree: 210, value: 4 },
    { minDegree: 211, maxDegree: 270, value: 5 },
    { minDegree: 271, maxDegree: 330, value: 6 },
    { minDegree: 331, maxDegree: 360, value: 1 }, // Overlap ko handle karne ke liye
];

// Wheel ko draw karne ka function
const data = {
    labels: rotationValues.map(item => item.value),
    datasets: [
        {
            data: new Array(rotationValues.length).fill(1),
            backgroundColor: [
                "purple",
                "lightgreen",
                "lightblue",
                "pink",
                "orange",
                "lightcoral",
            ],
            borderWidth: 0,
        },
    ],
};

let myChart = new Chart(wheel, {
    plugins: [ChartDataLabels],
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 0 },
        plugins: {
            tooltip: { enabled: false },
            datalabels: {
                color: "#ffffff",
                formatter: (_, context) => data.labels[context.dataIndex],
                font: { size: 24 },
            },
        },
        layout: { padding: { top: 30 } },
        scales: {
            radialLinear: {
                display: false,
            },
        },
    },
    data,
});

// Prize value nikalne ka function
const getValue = (angle) => {
    for (let i of rotationValues) {
        if (angle >= i.minDegree && angle <= i.maxDegree) {
            finalValue.innerHTML = `<p>Congratulations! You won ${i.value} coins!</p>`;
            currentCoins += i.value;
            currentCoinsSpan.textContent = currentCoins;
            localStorage.setItem('coins', currentCoins); // Coins ko local storage mein save karein
            break;
        }
    }
};

// Spinning animation
let count = 0;
let resultValue = 101;
spinBtn.addEventListener("click", () => {
    if (!spinning) {
        spinning = true;
        finalValue.innerHTML = `<p>Good Luck!</p>`;
        spinBtn.disabled = true;
        let randomDegree = Math.floor(Math.random() * 355);
        let rotationInterval = window.setInterval(() => {
            myChart.options.rotation = myChart.options.rotation + resultValue;
            myChart.update();
            if (myChart.options.rotation >= 360) {
                count += 1;
                resultValue -= 5;
                myChart.options.rotation = 0;
            } else if (count > 15 && myChart.options.rotation == randomDegree) {
                getValue(randomDegree);
                clearInterval(rotationInterval);
                count = 0;
                resultValue = 101;
                spinBtn.disabled = false;
                spinning = false;
            }
        }, 10);
    }
});

walletBtn.addEventListener('click', () => {
    walletInfo.style.display = 'block';
    withdrawForm.style.display = 'none';
});

withdrawBtn.addEventListener('click', () => {
    walletInfo.style.display = 'none';
    withdrawForm.style.display = 'block';
});

confirmWithdrawBtn.addEventListener('click', () => {
    const upiId = upiIdInput.value;
    const amountToWithdraw = parseInt(withdrawAmountInput.value);
    const coinToINRRate = 0.1; // Example rate: 1 coin = ₹0.10
    const minWithdrawalCoins = 100; // Minimum withdrawal limit in coins

    if (!upiId) {
        alert('Please enter your UPI ID.');
        return;
    }

    if (isNaN(amountToWithdraw) || amountToWithdraw <= 0) {
        alert('Please enter a valid amount to withdraw.');
        return;
    }

    if (currentCoins < minWithdrawalCoins) {
        alert(`Minimum withdrawal amount is ${minWithdrawalCoins} coins.`);
        return;
    }

    const coinsToWithdraw = amountToWithdraw / coinToINRRate;

    if (coinsToWithdraw > currentCoins) {
        alert('Insufficient balance.');
        return;
    }

    const confirmWithdraw = window.confirm(`Withdraw ₹${amountToWithdraw} (${coinsToWithdraw.toFixed(2)} coins) to UPI ID: ${upiId}?`);

    if (confirmWithdraw) {
        // Yahan aapko backend mein withdrawal request bhejni hogi
        alert(`Withdrawal request sent for ₹${amountToWithdraw} to UPI ID: ${upiId}`);

        // Agar withdrawal successful hota hai toh wallet balance update karein
        currentCoins -= Math.ceil(coinsToWithdraw); // Ya aap amountToWithdraw ko seedha coins mein convert karke subtract kar sakte hain
        currentCoinsSpan.textContent = currentCoins;
        localStorage.setItem('coins', currentCoins);
        withdrawForm.style.display = 'none';
        upiIdInput.value = '';
        withdrawAmountInput.value = '';
        walletInfo.style.display = 'block';
    }
});

// Page load hone par wallet info dikhayein
walletInfo.style.display = 'block';
