console.log("Script loaded successfully!");
const themeToggle = document.getElementById('themeToggle');

themeToggle.addEventListener('change', function () {
  if (this.checked) {
    document.body.classList.remove('light');
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
    document.body.classList.add('light');
  }
});

// Set default theme on load
window.onload = () => {
  document.body.classList.add('light');
  renderLineChart();
  populateYearDropdown();
};


const checkboxContainer = document.getElementById('checkboxContainer');
const ctx = document.getElementById('lineChart').getContext('2d');
let lineChartInstance;
let yearBarChartInstance;

// Line chart (for checkboxes)
function getSelectedLanguages() {
  const checkboxes = checkboxContainer.querySelectorAll("input[type='checkbox']");
  
  checkboxes.forEach(checkbox => {
    const label = checkbox.closest(".language-checkbox");
    if (checkbox.checked) {
      label.classList.add("selected");
    } else {
      label.classList.remove("selected");
    }
  });

  return Array.from(checkboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value.toLowerCase());
}

async function fetchData(language) {
  const res = await fetch(`/api/data/${language}`);
  return { language, data: await res.json() };
}

async function renderLineChart() {
  const selectedLanguages = getSelectedLanguages();
  const allData = await Promise.all(selectedLanguages.map(fetchData));

  const labels = allData[0]?.data.map(item => item.year);
  const datasets = allData.map(langObj => ({
    label: langObj.language,
    data: langObj.data.map(item => item.count),
    borderColor: getRandomColor(),
    tension: 0.4
  }));

  if (lineChartInstance)  lineChartInstance.destroy();

  lineChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      }
    }
  });
}


// Year-wise data
const languageData = {
  2015: { python: 3200, javascript: 2900, java: 1800, php: 1200, html: 1200, csharp: 1100, css: 950, cpp: 850 },
  2016: { python: 3500, javascript: 3100, java: 1900, php: 1300, html: 1250, csharp: 1150, css: 1000, cpp: 870 },
  2017: { python: 3700, javascript: 3300, java: 2000, php: 1400, html: 1300, csharp: 1200, css: 1050, cpp: 880 },
  2018: { python: 3900, javascript: 3400, java: 2100, php: 1500, html: 1350, csharp: 1250, css: 1100, cpp: 900 },
  2019: { python: 4100, javascript: 3500, java: 2150, php: 1450, html: 1400, csharp: 1300, css: 1120, cpp: 910 },
  2020: { python: 4300, javascript: 3600, java: 2200, php: 1400, html: 1420, csharp: 1320, css: 1140, cpp: 920 },
  2021: { python: 4500, javascript: 3700, java: 2250, php: 1350, html: 1440, csharp: 1340, css: 1160, cpp: 930 },
  2022: { python: 4700, javascript: 3800, java: 2300, php: 1300, html: 1460, csharp: 1360, css: 1180, cpp: 940 },
  2023: { python: 4900, javascript: 3900, java: 2350, php: 1250, html: 1480, csharp: 1380, css: 1200, cpp: 950 },
  2024: { python: 5100, javascript: 4000, java: 2400, php: 1200, html: 1500, csharp: 1400, css: 1220, cpp: 960 }
};

// Populate year dropdown
function populateYearDropdown() {
  const dropdown = document.getElementById("yearDropdown");
  const years = Object.keys(languageData);
  dropdown.innerHTML = `<option value="">-- Select Year --</option>`;
  years.forEach(year => {
    dropdown.innerHTML += `<option value="${year}">${year}</option>`;
  });
}

// Year selection handler
document.getElementById("yearDropdown").addEventListener("change", function () {
  const selectedYear = this.value;
  if (!selectedYear) return;

  const yearData = languageData[selectedYear];
  const labels = Object.keys(yearData);
  const data = Object.values(yearData);

  renderBarChartFromYearData(labels, data, selectedYear);
});

function renderBarChartFromYearData(labels, data, year) {
  const ctxYear = document.getElementById('yearWiseChart').getContext('2d');
  if (yearBarChartInstance) yearBarChartInstance.destroy();

  yearBarChartInstance = new Chart(ctxYear, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: `Popularity in ${year}`,
        data: data,
        backgroundColor: labels.map(() => getRandomColor())
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function getRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

// On page load
window.onload = () => {
  renderLineChart();       // Line chart (checkboxes)
  populateYearDropdown();  // Year dropdown
};

// On checkbox change
checkboxContainer.addEventListener('change', renderLineChart);

