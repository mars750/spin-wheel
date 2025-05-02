// जरूरी DOM एलिमेंट्स को चुनना
const wheelCanvas = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");
const finalValueDisplay = document.getElementById("final-value");
const walletBalanceDisplay = document.getElementById("wallet-balance");
const withdrawBtn = document.getElementById('withdraw-btn');
const modal = document.getElementById('withdraw-modal');
const closeModalBtn = modal.querySelector('.close-btn');
const modalBalanceDisplay = document.getElementById('modal-balance');
const upiOptionBtn = document.getElementById('upi-option-btn');
const giftcardOptionBtn = document.getElementById('giftcard-option-btn');
const upiDetailsDiv = document.getElementById('upi-details');
const giftcardDetailsDiv = document.getElementById('giftcard-details');
const submitUpiWithdrawBtn = document.getElementById('submit-upi-withdraw');
const submitGiftcardWithdrawBtn = document.getElementById('submit-giftcard-withdraw');
const withdrawMessage = document.getElementById('withdraw-message');

// ऐप वेरिएबल्स
let walletBalance = 75; // यूज़र का वॉलेट बैलेंस (शुरुआत में 75 सेट करें)
let spinCount = 0;    // स्पिन का काउंटर
let myChart = null; // Chart.js ऑब्जेक्ट को स्टोर करने के लिए

// --- Chart.js व्हील सेटअप ---
// यह एक उदाहरण सेटअप है, आपको इसे अपने व्हील के अनुसार बदलना पड़ सकता है
const rotationValues = [
    { minDegree: 0, maxDegree: 60, value: 10 },
    { minDegree: 61, maxDegree: 120, value: 20 },
    { minDegree: 121, maxDegree: 180, value: 5 },
    { minDegree: 181, maxDegree: 240, value: 50 },
    { minDegree: 241, maxDegree: 300, value: 15 },
    { minDegree: 301, maxDegree: 360, value: 25 },
];
const data = [16, 16, 16, 16, 16, 16]; // बराबर हिस्से मान लें
const pieColors = ["#8b36b8", "#702ca1", "#5b2484", "#8b36b8", "#702ca1", "#5b2484"]; // उदाहरण कलर्स

// Chart.js व्हील बनाना (पेज लोड पर)
document.addEventListener('DOMContentLoaded', () => {
    myChart = new Chart(wheelCanvas, {
        plugins: [ChartDataLabels],
        type: "pie",
        data: {
            labels: [10, 20, 5, 50, 15, 25], // उदाहरण लेबल (मान)
            datasets: [{
                backgroundColor: pieColors,
                data: data,
            }, ],
        },
        options: {
            responsive: true,
            animation: { duration: 0 }, // शुरुआती एनिमेशन बंद
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
    updateWithdrawButtonState(); // शुरुआत में विथड्रा बटन की स्थिति सेट करें
    walletBalanceDisplay.textContent = walletBalance; // पेज लोड पर वॉलेट बैलेंस दिखाएं
});


// डिग्री से वैल्यू निकालने वाला हेल्पर फंक्शन (आपके rotationValues पर आधारित)
const valueGenerator = (angleValue) => {
    // 360 डिग्री मोड्यूलो सुनिश्चित करें
    const adjustedAngle = angleValue % 360;
    for (let i = 0; i < rotationValues.length; i++) {
        if (adjustedAngle >= rotationValues[i].minDegree && adjustedAngle <= rotationValues[i].maxDegree) {
            return rotationValues[i].value;
        }
    }
    return 0; // अगर कोई मैच नहीं मिलता
};

// --- असल स्पिन लॉजिक फंक्शन ---
function executeActualSpin() {
    console.log(`Executing spin #${spinCount}`);
    spinBtn.disabled = true; // स्पिन के दौरान बटन को डिसेबल करें
    finalValueDisplay.innerHTML = `<p>Spinning...</p>`;

    // 1. रैंडम स्टॉप एंगल कैलकुलेट करें
    let randomDegree = Math.floor(Math.random() * 360); // 0 से 359 तक

    // 2. एनिमेशन के लिए रोटेशन वैल्यू सेट करें
    let spins = 5; // व्हील कितनी बार घूमेगा
    let finalRotation = spins * 360 + randomDegree;
    let animationDuration = 4000; // एनीमेशन की अवधि (मिलीसेकंड में)
    let startTime = null;

    function animateWheel(currentTime) {
        if (!startTime) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const ease = (t) => t * t * t * (t * (6 * t - 15) + 10); // ईजिंग फंक्शन
        myChart.options.rotation = ease(timeElapsed / animationDuration) * finalRotation;
        myChart.update();
        if (timeElapsed < animationDuration) {
            requestAnimationFrame(animateWheel);
        } else {
            // एनीमेशन समाप्त
            const winningValue = valueGenerator(randomDegree);
            const resultText = `You won: ${winningValue} coins!`;
            finalValueDisplay.innerHTML = `<p>${resultText}</p>`;
            walletBalance += winningValue;
            walletBalanceDisplay.textContent = walletBalance;
            spinBtn.disabled = false;
            console.log("Spin finished. Wallet:", walletBalance, "Winning Value:", winningValue, "Final Degree:", randomDegree);
            updateWithdrawButtonState();
        }
    }

    requestAnimationFrame(animateWheel);
    // --------------------------------------------------
}

// --- स्पिन बटन का क्लिक इवेंट ---
spinBtn.addEventListener("click", () => {
    // अगर myChart अभी लोड नहीं हुआ है तो कुछ न करें
    if (!myChart) {
        console.error("Chart not initialized yet.");
        return;
    }

    spinCount++; // स्पिन काउंटर बढ़ाएं

    // ऐड दिखाने की शर्त: पहला स्पिन या हर 5 स्पिन के बाद (छठे, ग्यारहवें, आदि स्पिन से पहले)
    const shouldShowAd = (spinCount === 1 || (spinCount - 1) % 5 === 0);

    if (shouldShowAd) {
        console.log(`Spin #${spinCount}: Ad is required.`);

        // --- Adsterra Popunder को हैंडल करना ---
        // Popunder स्क्रिप्ट (HTML में) क्लिक पर खुद ही काम करेगी।
        // यूज़र को सूचित करें और थोड़ी देर बाद स्पिन शुरू करें।
        // आप चाहें तो alert हटा सकते हैं अगर यह परेशान करता है।
        alert("An ad may open. The spin will start shortly.");

        // थोड़ी देरी (e.g., 500ms) के बाद वास्तविक स्पिन फंक्शन को कॉल करें
        setTimeout(executeActualSpin, 500);

    } else {
        // अगर ऐड नहीं दिखाना है, तो सीधे स्पिन फंक्शन को कॉल करें
        console.log(`Spin #${spinCount}: No ad required.`);
        executeActualSpin();
    }
});


// --- विथड्रावल लॉजिक ---

function updateWithdrawButtonState() {
    // मान लें कम से कम 1000 कॉइन विथड्रा करने के लिए चाहिए
    if (walletBalance >= 1000) {
        withdrawBtn.disabled = false;
        withdrawBtn.style.opacity = 1;
        withdrawBtn.style.cursor = 'pointer';
    } else {
        withdrawBtn.disabled = true;
        withdrawBtn.style.opacity = 0.5;
        withdrawBtn.style.cursor = 'not-allowed';
    }
}

// विथड्रा बटन क्लिक पर मोडल खोलें
withdrawBtn.addEventListener('click', () => {
    if (!withdrawBtn.disabled) {
        modalBalanceDisplay.textContent = walletBalance; // मोडल में बैलेंस दिखाएं
        upiDetailsDiv.style.display = 'none'; // शुरुआत में डिटेल्स छिपाएं
        giftcardDetailsDiv.style.display = 'none';
        withdrawMessage.textContent = ''; // पिछला मैसेज हटाएं
        modal.style.display = 'flex'; // मोडल दिखाएं (flex या block)
    }
});

// मोडल बंद करें
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// मोडल के बाहर क्लिक करने पर बंद करें
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

// विथड्रावल ऑप्शन चुनने पर
upiOptionBtn.addEventListener('click', () => {
    upiDetailsDiv.style.display = 'block';
    giftcardDetailsDiv.style.display = 'none';
});

giftcardOptionBtn.addEventListener('click', () => {
    giftcardDetailsDiv.style.display = 'block';
    upiDetailsDiv.style.display = 'none';
});

// UPI विथड्रावल सबमिट
submitUpiWithdrawBtn.addEventListener('click', () => {
    const amount = parseInt(document.getElementById('upi-amount').value);
    const upiId = document.getElementById('upi-id').value.trim();

    if (!upiId) {
        withdrawMessage.textContent = 'Please enter your UPI ID.';
        withdrawMessage.style.color = 'red';
        return;
    }
    if (isNaN(amount) || amount < 1000) {
        withdrawMessage.textContent = 'Minimum withdrawal amount for UPI is 1000 coins.';
        withdrawMessage.style.color = 'red';
        return;
    }
    if (amount > walletBalance) {
        withdrawMessage.textContent = 'Insufficient balance.';
        withdrawMessage.style.color = 'red';
        return;
    }

    // --- यहाँ सर्वर पर विथड्रावल रिक्वेस्ट भेजने का लॉजिक आएगा ---
    console.log(`Withdrawal Request: ${amount} coins to UPI ID: ${upiId}`);
    // अभी के लिए, हम सिर्फ बैलेंस कम कर देंगे और मैसेज दिखाएंगे
    walletBalance -= amount;
    walletBalanceDisplay.textContent = walletBalance;
    modalBalanceDisplay.textContent = walletBalance; // मोडल में भी अपडेट करें
    withdrawMessage.textContent = `Withdrawal request for ${amount} coins submitted!`;
    withdrawMessage.style.color = 'green';
    updateWithdrawButtonState(); // विथड्रा बटन की स्थिति अपडेट करें
    document.getElementById('upi-amount').value = ''; // फ़ील्ड साफ़ करें
    document.getElementById('upi-id').value = '';
    // setTimeout(() => { modal.style.display = 'none'; }, 2000); // 2 सेकंड बाद मोडल बंद करें
});

// Gift Card विथड्रावल सबमिट
submitGiftcardWithdrawBtn.addEventListener('click', () => {
    const amount = parseInt(document.getElementById('giftcard-amount').value);
    const cardType = document.getElementById('giftcard-type').value;

    if (isNaN(amount) || amount < 100) { // मान लें गिफ्ट कार्ड के लिए मिनिमम 100 है
        withdrawMessage.textContent = 'Minimum amount for Gift Card is 100 coins.';
        withdrawMessage.style.color = 'red';
        return;
    }
    if (amount > walletBalance) {
        withdrawMessage.textContent = 'Insufficient balance.';
        withdrawMessage.style.color = 'red';
        return;
    }

    // --- यहाँ सर्वर पर विथड्रावल रिक्वेस्ट भेजने का लॉजिक आएगा ---
    console.log(`Withdrawal Request: ${amount} coins for ${cardType} Gift Card`);
    // अभी के लिए, हम सिर्फ बैलेंस कम कर देंगे और मैसेज दिखाएंगे
    walletBalance -= amount;
    walletBalanceDisplay.textContent = walletBalance;
    modalBalanceDisplay.textContent = walletBalance;
    withdrawMessage.textContent = `Request for ${cardType} gift card (${amount} coins) submitted!`;
    withdrawMessage.style.color = 'green';
    updateWithdrawButtonState();
    document.getElementById('giftcard-amount').value = '';
    // setTimeout(() => { modal.style.display = 'none'; }, 2000);
});

// सुनिश्चित करें कि पेज लोड पर विथड्रा बटन की सही स्थिति हो
document.addEventListener('DOMContentLoaded', updateWithdrawButtonState);
