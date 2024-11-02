const DATA_COUNT = 7;
const NUMBER_CFG = { count: DATA_COUNT, min: -100, max: 100 };

function formatSplit(splitTime) {
  const minutes = Math.floor(splitTime / 60);
  const seconds = Math.floor(splitTime % 60);
  const tenths = Math.floor((splitTime * 10) % 10);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}.${tenths}`; // Format to mm:ss
}

function data(distance, split, rate) {
  return {
    labels: distance,
    datasets: [
      {
        label: 'Split',
        data: split,
        borderColor: 'rgba(255, 99, 132, 1)',       // Red
        backgroundColor: 'rgba(255, 99, 132, 0.5)', // Transparent Red
        pointRadius: 3,
        yAxisID: 'split', // Use primary y-axis
      },
      {
        label: 'Rate',
        data: rate,
        borderColor: 'rgba(54, 162, 235, 1)',       // Blue
        backgroundColor: 'rgba(54, 162, 235, 0.5)', // Transparent Blue
        pointRadius: 2,
        yAxisID: 'rate', // Use secondary y-axis
      }
    ]
  }
}


function config(distance, split, rate) {
  // const max_split = Math.ceil(Math.max(split) / 15) * 15
  // const min_split = Math.floor(Math.min(split) / 15) * 15

  return {
    type: 'line',
    data: data(distance, split, rate),

    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          type: 'linear',
          min: 0,
          max: 2000,
          ticks: {
            stepSize: 250
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)', // Gridline color
          }
        },
        split: {
          type: 'linear',
          reverse: true,
          position: 'left',
          min: 90,
          max: 150,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)', // Gridline color
          },
          ticks: {
            stepSize: 15,
            callback: function (value, index, values) {
              // Format value as needed
              return formatSplit(value); // Example: show one decimal place
            }
          }
        },
        rate: { // Secondary y-axis
          type: 'linear',
          position: 'right',
          min: 0,
          max: 50,
          grid: {
            drawOnChartArea: false, // Don't draw grid lines on the chart area for the secondary axis
          },
          ticks: {
            stepSize: 5
          }
        },
      },
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Split & Rate (Raw)'
        },
        tooltip: {
          callbacks: {
            label: function (tooltipItem) {
              // Here you can customize the tooltip based on dataset
              let label = tooltipItem.dataset.label || '';
              const value = tooltipItem.raw; // This is the raw value of the data point

              if (label) {
                label += ': ';
              }

              // Format the value as needed
              if (tooltipItem.dataset.label === 'Split') {
                label += formatSplit(tooltipItem.raw)
              } else if (tooltipItem.dataset.label === 'Rate') {
                label += value; // Just display the rate
              }

              return label;
            }
          },
          mode: 'interpolate',
          intersect: false
        },

        crosshair: {
          line: {
            color: 'rgba(0,0,0,1)',  // crosshair line color
            width: 1        // crosshair line width
          },
          sync: {
            enabled: true,            // enable trace line syncing with other charts
            group: 1,                 // chart group
            suppressTooltips: false   // suppress tooltips when showing a synced tracer
          },
          zoom: {
            enabled: true,                                      // enable zooming
            zoomboxBackgroundColor: 'rgba(66,133,244,0.2)',     // background color of zoom box 
            zoomboxBorderColor: '#48F',                         // border color of zoom box
            zoomButtonText: 'Reset Zoom',                       // reset zoom button text
            zoomButtonClass: 'reset-zoom',                      // reset zoom button class
          },
          callbacks: {
            beforeZoom: () => function (start, end) {                  // called before zoom, return false to prevent zoom
              return false;
            },
            afterZoom: () => function (start, end) {                   // called after zoom
            }
          }
        },
      }
    }
  }
}


// Render the chart
export function plotRateSplitRaw(data, element) {
  const exisiting = Chart.getChart('chart')
  if (exisiting) {
    exisiting.destroy()
  }
  data = data
    .filter((x) => x.split > 60 && x.rate < 60)
  // Lower limit of 1:00 split, upper limit of 2:30

  console.log(data)
  const [distance, split, rate] =
    [data.map((x) => x.distance), data.map((x) => x.split), data.map((x) => x.rate)]

  console.log(distance, split, rate)
  new Chart(
    element,
    config(distance, split, rate)
  );
}

