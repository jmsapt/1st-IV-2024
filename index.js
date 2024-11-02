import { plotRateSplitRaw } from './rate-split';
import FitParser from 'fit-file-parser';

const CHART_ID = "chart"
const DARTA_DIR = "./data/"

// const files = {}

// gpx,
const fitParser = new FitParser({
  force: true,
  speedUnit: 'm/s',
  lengthUnit: 'm',
  temperatureUnit: 'celsius',
  pressureUnit: 'cbar', // accept bar, cbar and psi (default is bar)
  elapsedRecordField: true,
  mode: 'cascade',
});

function processData(points) {
  const lap = points.activity.sessions[0].laps[0]
  const records = lap.records

  // map then calculate stroke_length
  const data = []
  data.push({ time: 0, distance: 0, rate: 0, stroke_count: 0, stroke_length: 0, speed: 0, split: 0 })
  records.forEach((x) => data.push({
    time: x.elapsed_time,
    distance: x.distance,
    rate: x.cadence,
    stroke_count: x.total_cycles,
    speed: x.speed,        // m/s
    split: x.speed > 0 ? (500 / x.speed) : 0,  // s/500m
    // done below
    stroke_length: 0,
  }))

  // final calcs
  data.slice(1).map((x) => {
    const n = x.stroke_count;
    const len = x.distance - data[n - 1].distance
    console.log(len)
    return {
      ...x,
      stroke_length: len
    }
  })

  return data
}

document.getElementById('fileSelect').addEventListener('change', function () {
  fetch(DARTA_DIR + this.value)
    .then((res) => res.arrayBuffer())
    .then((buffer) => {
      console.log("success")
      fitParser.parse(buffer, function (error, data) {
        if (error) {
          console.log(error);
        } else {
          // console.log(JSON.stringify(data));
          // console.log(data);
          const res = processData(data);
          console.log(res)
          plotRateSplitRaw(res, CHART_ID)
        }
      });
    })

    .catch((e) => console.error(e));
});

document.addEventListener('DOMContentLoaded', function () {
  fetch('./data.json') // Adjust the path to your JSON file
    .then(response => response.json())
    .then(data => {
      const fileSelect = document.getElementById('fileSelect');
      const downloadBtn = document.getElementById('downloadBtn');

      data.sort((a, b) => new Date(a.date) > new Date(b.date) ? -1 : 1)
        .forEach(item => {
          const option = document.createElement('option');
          option.value = item.path; // Use the path from the JSON
          option.textContent = `${item.date} - ${item.name}`; // Customize the display text
          fileSelect.appendChild(option);
        });

      // Set download link based on selected file
      fileSelect.addEventListener('change', () => {
        const selectedFile = fileSelect.value;
        // downloadBtn.setAttribute('href', selectedFile);
        downloadBtn.setAttribute('download', selectedFile);
      });

      downloadBtn.addEventListener('click', (text) => {
        let element = document.createElement('a');
        element.setAttribute('href', DARTA_DIR + fileSelect.value);
        element.setAttribute('download', fileSelect.value);
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      })

      // Set initial download link if needed
      if (fileSelect.value) {
        downloadBtn.setAttribute('href', fileSelect.value);
        downloadBtn.setAttribute('download', fileSelect.value.split('/').pop());
      }
    })
    .catch(error => console.error('Error fetching the JSON:', error));
});