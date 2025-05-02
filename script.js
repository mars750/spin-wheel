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
let walletBalance = 0; // यूज़र का वॉलेट बैलेंस
let spinCount = 0;     // स्पिन का काउंटर
let myChart = null; // Chart.js ऑब्जेक्ट को स्टोर करने के लिए

// --- Chart.js व्हील सेटअप ---
const rotationValues = [
    { minDegree: 0, maxDegree: 30, value: 0 }, // उदाहरण वैल्यूज
    { minDegree: 31, maxDegree: 90, value: 1 },
    { minDegree: 91, maxDegree: 150, value: 2 },
    { minDegree: 151, maxDegree: 210, value: 3 },
    { minDegree: 211, maxDegree: 270, value: 4 },
    { minDegree: 271, maxDegree: 330, value: 5 },
    { minDegree: 331, maxDegree: 360, value: 0 },
];
const data = [16, 16, 16, 16, 16, 16]; // बराबर हिस्से मान लें
const pieColors = ["#8b36b8", "#702ca1", "#5b2484", "#8b36b8", "#702ca1", "#5b2484"]; // उदाहरण कलर्स
const labels = rotationValues.map(rv => rv.value); // लेबल्स को rotationValues से निकालें

// Chart.js व्हील बनाना (पेज लोड पर)
document.addEventListener('DOMContentLoaded', () => {
    myChart = new Chart(wheelCanvas, {
        plugins: [ChartDataLabels],
        type: "pie",
        data: {
            labels: labels,
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
            // व्हील को इनिशियली सेंटर करने के लिए रोटेशन सेट करें
            rotation: 0,
            circumference: 360,
        },
    });
    updateWithdrawButtonState(); // शुरुआत में विथड्रा बटन की स्थिति सेट करें
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

    // 1. रैंडम स्टॉप एंगल कैलकुलेट करें (अब हम सेक्टर के सेंटर के पास रुकने की कोशिश करेंगे)
    const numSegments = rotationValues.length;
    const segmentDegree = 360 / numSegments;
    const randomSegmentIndex = Math.floor(Math.random() * numSegments);
    // प्रत्येक सेगमेंट के मध्य बिंदु के पास एक रैंडम डिग्री कैलकुलेट करें
    const randomDegree = segmentDegree * randomSegmentIndex + segmentDegree / 2 + Math.random() * (segmentDegree / 4) - (segmentDegree / 8); // थोड़ा रैंडमनेस जोड़ें

    // 2. एनिमेशन के लिए रोटेशन वैल्यू सेट करें (जैसे कई पूरे चक्कर + रैंडम डिग्री)
    const spins = 5; // व्हील कितनी बार घूमेगा
    const totalRotation = spins * 360 + randomDegree;

    let animationProgress = 0;
    const animationDuration = 4000; // एनिमेशन की अवधि (मिलीसेकंड में)
    const startTime = performance.now();

    function animateWheel() {
        const currentTime = performance.now();
        const elapsedTime = currentTime - startTime;

        if (elapsedTime >= animationDuration) {
            clearInterval(animationInterval);
            myChart.options.rotation = totalRotation % 360; // फाइनल पोजीशन सेट करें
            myChart.update();
            handleSpinResult(myChart.options.rotation);
        } else {
            const ease = easeOutCubic(elapsedTime / animationDuration);
            myChart.options.rotation = ease * totalRotation;
            myChart.update();
        }
    }

    const animationInterval = setInterval(animateWheel, 10); // हर 10ms पर अपडेट करें

    // Easing फंक्शन (स्मूथ एनिमेशन के लिए)
    function easeOutCubic(t) {
        return (--t) * t * t + 1;
    }
}

// --- स्पिन खत्म होने पर रिजल्ट हैंडल करें ---
function handleSpinResult(finalRotation) {
    // फाइनल रोटेशन से विनिंग वैल्यू निकालें
    const resultValue = valueGenerator(finalRotation);
    const resultText = `You won: ${resultValue} coins!`;

    // रिजल्ट दिखाएं
    finalValueDisplay.innerHTML = `<p>${resultText}</p>`;

    // वॉलेट अपडेट करें
    walletBalance += resultValue;
    walletBalanceDisplay.textContent = walletBalance;

    // स्पिन बटन फिर से इनेबल करें
    spinBtn.disabled = false;
    console.log("Spin finished. Wallet:", walletBalance);

    // विथड्रा बटन की स्थिति अपडेट करें
    updateWithdrawButtonState();
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
    // मान लें कम से कम 50 कॉइन विथड्रा करने के लिए चाहिए
    if (walletBalance >= 50) {
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
    if (isNaN(amount) || amount < 50) {
        withdrawMessage.textContent = 'Minimum withdrawal amount for UPI is 50 coins.';
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
