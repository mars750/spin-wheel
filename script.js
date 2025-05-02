const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");
const finalValue = document.getElementById("final-value");
const walletAmountDisplay = document.getElementById("wallet-amount");
const withdrawButton = document.getElementById("withdraw-btn");
const withdrawalOptionsDiv = document.getElementById("withdraw-options");

// शुरुआती वॉलेट राशि
let walletBalance = 50; // उदाहरण के लिए, प्रारंभिक राशि 50 सिक्के

// वॉलेट राशि को डिस्प्ले पर अपडेट करने का फंक्शन
const updateWalletDisplay = () => {
    if (walletAmountDisplay) {
        walletAmountDisplay.innerText = `Wallet: ${walletBalance} coins`;
    } else {
        console.error("Error: 'wallet-amount' element not found in the HTML.");
    }
};
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
    //Plugin for displaying text on pie chart
    plugins: [ChartDataLabels],
    //Chart Type Pie
    type: "pie",
    data: {
        //Labels(values which are to be displayed on chart)
        labels: [1, 2, 3, 4, 5, 6],
        //Settings for dataset/pie
        datasets: [
            {
                backgroundColor: pieColors,
                data: data,
            },
        ],
    },
    options: {
        //Responsive chart
        responsive: true,
        animation: { duration: 0 },
        plugins: {
            //hide tooltip and legend
            tooltip: false,
            legend: {
                display: false,
            },
            //display labels inside pie chart
            datalabels: {
                color: "#ffffff",
                formatter: (_, context) => context.chart.data.labels[context.dataIndex],
                font: { size: 24 },
            },
        },
    },
});
//display value based on the randomAngle
const valueGenerator = (angleValue) => {
    for (let i of rotationValues) {
        //if the angleValue is between min and max then display it
        if (angleValue >= i.minDegree && angleValue <= i.maxDegree) {
            finalValue.innerHTML = `<p>You won: ${i.value} coins!</p>`;
            walletBalance += i.value; // वॉलेट में जीता हुआ अमाउंट जोड़ें
            updateWalletDisplay(); // वॉलेट डिस्प्ले को अपडेट करें
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
    //Empty final value
    finalValue.innerHTML = `<p>Good Luck!</p>`;
    //Generate random degrees to stop at
    let randomDegree = Math.floor(Math.random() * (355 - 0 + 1) + 0);
    //Interval for rotation animation
    let rotationInterval = window.setInterval(() => {
        //Set rotation for piechart
        /*
        Initially to make the piechart rotate faster we set resultValue to 101 so it rotates 101 degrees at a time and this reduces by 1 with every count. Eventually on last rotation we rotate by 1 degree at a time.
        */
        myChart.options.rotation = myChart.options.rotation + resultValue;
        //Update chart with new value;
        myChart.update();
        //If rotation>360 reset it back to 0
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
// विथड्रॉ बटन के लिए इवेंट लिस्नर
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

// पेज लोड होने पर वॉलेट डिस्प्ले को अपडेट करें
updateWalletDisplay();

function handleWithdraw(method) {
    if (method === 'upi') {
        alert('UPI withdrawal functionality will be implemented here.');
        // यहाँ UPI निकासी की लॉजिक लिखें
    } else if (method === 'giftcard') {
        alert('Gift Card withdrawal functionality will be implemented here.');
        // यहाँ गिफ्ट कार्ड निकासी की लॉजिक लिखें
    }
    // आप यहाँ आगे की प्रोसेसिंग (जैसे सर्वर को अनुरोध भेजना) कर सकते हैं
}
