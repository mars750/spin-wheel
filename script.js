const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");
const finalValue = document.getElementById("final-value");

//Object that stores values of minimum and maximum angle for a value
const rotationValues = [
  { minDegree: 0, maxDegree: 60, value: 10 },
  { minDegree: 61, maxDegree: 120, value: 20 },
  { minDegree: 121, maxDegree: 180, value: 5 },
  { minDegree: 181, maxDegree: 240, value: 50 },
  { minDegree: 241, maxDegree: 300, value: 15 },
  { minDegree: 301, maxDegree: 360, value: 25 },
];

//Size of each piece (Equal sizes for 6 segments)
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
    labels: [1, 2, 3, 4, 5, 6], // Changed labels to 1, 2, 3, 4, 5, 6
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
  let adjustedAngle = angleValue % 360; // Ensure angle is within 0-359 range
  for (let i of rotationValues) {
    if (adjustedAngle >= i.minDegree && adjustedAngle <= i.maxDegree) {
      finalValue.innerHTML = `<p>You landed on: ${myChart.data.labels[rotationValues.indexOf(i)]}</p>`; // Display the label
      spinBtn.disabled = false;
      return; // Exit the loop after finding a match
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
  let randomDegree = Math.floor(Math.random() * 360); // Generate between 0-359
  //Interval for rotation animation
  let rotationInterval = window.setInterval(() => {
    //Set rotation for piechart
    myChart.options.rotation = myChart.options.rotation + resultValue;
    //Update chart with new value;
    myChart.update();
    //If rotation>360 reset it back to 0
    if (myChart.options.rotation >= 360) {
      count += 1;
      resultValue -= 5;
      myChart.options.rotation = 0;
    } else if (count > 15 && Math.abs(myChart.options.rotation - randomDegree) < 1) { // Check if close to the random degree
      valueGenerator(randomDegree);
      clearInterval(rotationInterval);
      count = 0;
      resultValue = 101;
    }
  }, 10);
});
