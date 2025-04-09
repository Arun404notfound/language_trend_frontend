console.log("Script loaded successfully!");

const BASE_URL = "https://language-trend-analysis.onrender.com";
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

// Default theme
document.body.classList.add('light');

const checkboxContainer = document.getElementById('checkboxContainer');
const ctx = document.getElementById('lineChart').getContext('2d');
let lineChartInstance;
let yearBarChartInstance;
let pieChartInstance;

// ========== CHECKBOX SELECTION ==========
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

// ========== FETCHING DATA FROM API ==========
async function fetchData(language) {
  const res = await fetch(`${BASE_URL}/api/data/${language}`);
  return { language, data: await res.json() };
}

// ========== LINE CHART ==========
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

  if (lineChartInstance) lineChartInstance.destroy();

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

// ========== YEAR DROPDOWN ==========
async function populateYearDropdown() {
  const res = await fetch(`${BASE_URL}/api/languages`);
  const languages = await res.json();

  const res2 = await fetch(`${BASE_URL}/api/data/${languages[0]}`);
  const data = await res2.json();

  const years = data.map(d => d.year);
  const dropdown = document.getElementById("yearDropdown");

  dropdown.innerHTML = `<option value="">-- Select Year --</option>`;
  years.forEach(year => {
    dropdown.innerHTML += `<option value="${year}">${year}</option>`;
  });
}

// ========== BAR CHART FOR SELECTED YEAR ==========
document.getElementById("yearDropdown").addEventListener("change", async function () {
  const selectedYear = this.value;
  if (!selectedYear) return;

  const res = await fetch(`${BASE_URL}/api/languages`);
  const langs = await res.json();

  const allData = await Promise.all(
    langs.map(async lang => {
      const res = await fetch(`${BASE_URL}/api/data/${lang}`);
      const data = await res.json();
      const entry = data.find(item => item.year == selectedYear);
      return { language: lang, count: entry ? entry.count : 0 };
    })
  );

  const filtered = allData.filter(d => d.count > 0);
  const labels = filtered.map(d => d.language);
  const values = filtered.map(d => d.count);

  renderBarChartFromYearData(labels, values, selectedYear);
  renderPieChart(labels, values, selectedYear);
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

// ========== PIE CHART ==========
function renderPieChart(labels, data, year) {
  const ctxPie = document.getElementById("pieChart").getContext("2d");
  if (pieChartInstance) pieChartInstance.destroy();

  pieChartInstance = new Chart(ctxPie, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: labels.map(() => getRandomColor())
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: `Language Share in ${year}`
        }
      }
    }
  });
}

// ========== RANDOM COLOR ==========
function getRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

// ========== INITIALIZE ==========
window.onload = () => {
  document.body.classList.add('light');
  renderLineChart();
  populateYearDropdown();
};

// ========== EVENT LISTENER FOR CHECKBOX ==========
checkboxContainer.addEventListener('change', renderLineChart);
