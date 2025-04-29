const wheel = document.getElementById('wheel');
const spinBtn = document.getElementById('spinBtn');
const finalValue = document.getElementById('finalValue');
const ctx = wheel.getContext('2d');
let spinning = false;
let degree = 0;
let animationInterval;
const rotationSpeed = 3; // रोटेशन की गति को नियंत्रित करता है
const decelerationRate = 0.99; // मंदी की दर

// व्हील के सेक्शंस और उनके रंग
const sections = ['Section 1', 'Section 2', 'Section 3', 'Section 4', 'Section 5', 'Section 6'];
const colors = ['#e74c3c', '#2ecc71', '#3498db', '#f39c12', '#9b59b6', '#1abc9c'];

const data = sections.map((_, i) => 1); // सभी सेक्शंस का समान आकार
const totalSlices = sections.length;
const sliceAngle = 360 / totalSlices;
const radius = wheel.width / 2;
const centerX = radius;
const centerY = radius;

function drawWheel() {
  ctx.clearRect(0, 0, wheel.width, wheel.height);
  let startAngle = 0;

  data.forEach((value, i) => {
    const angle = sliceAngle * value;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle * Math.PI / 180, (startAngle + angle) * Math.PI / 180, false);
    ctx.lineTo(centerX, centerY);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fill();
    ctx.stroke();

    // टेक्स्ट जोड़ना (वैकल्पिक)
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate((startAngle + angle / 2 + 90) * Math.PI / 180);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(sections[i], radius / 1.8, 0);
    ctx.restore();

    startAngle += angle;
  });

  // तीर बनाना (CSS द्वारा नियंत्रित)
}

function spin() {
  if (spinning) return;
  spinning = true;
  finalValue.innerHTML = '';
  let currentRotationSpeed = rotationSpeed;

  animationInterval = setInterval(() => {
    degree += currentRotationSpeed;
    degree %= 360; // सुनिश्चित करें कि डिग्री 360 से अधिक न हो
    wheel.style.transform = `rotate(${degree}deg)`;

    currentRotationSpeed *= decelerationRate;

    if (currentRotationSpeed < 0.02) {
      clearInterval(animationInterval);
      spinning = false;
      determineFinalValue();
    }
  }, 1000 / 60); // 60 FPS
}

function determineFinalValue() {
  const winningDegree = 360 - (degree % 360); // व्हील के ऊपरी बिंदु के सापेक्ष डिग्री
  const winningSlice = Math.floor(winningDegree / sliceAngle);
  finalValue.innerHTML = `You landed on: ${sections[winningSlice]}`;
}

// इनिशियलाइज़ेशन
drawWheel();

spinBtn.addEventListener('click', spin);
