console.log("Script loaded successfully!");

const BASE_URL = "https://language-trend-analysis.onrender.com";
const themeToggle = document.getElementById('themeToggle');
const checkboxContainer = document.getElementById('checkboxContainer');
const ctx = document.getElementById('lineChart').getContext('2d');

let lineChartInstance;
let yearBarChartInstance;
let pieChartInstance;

// ========== THEME TOGGLE ==========
themeToggle.addEventListener('change', function () {
  document.body.classList.toggle('dark', this.checked);
  document.body.classList.toggle('light', !this.checked);
});

// Set default theme
document.body.classList.add('light');

// ========== CHECKBOX SELECTION ==========
function getSelectedLanguages() {
  const checkboxes = checkboxContainer.querySelectorAll("input[type='checkbox']");
  
  return Array.from(checkboxes)
    .filter(checkbox => checkbox.checked)
    .map(checkbox => {
      const label = checkbox.closest(".language-checkbox");
      label?.classList.add("selected");
      return checkbox.value.toLowerCase();
    });
}

// ========== FETCHING DATA FROM API ==========
async function fetchData(language) {
  const res = await fetch(`${BASE_URL}/api/data/${language}`);
  return { language, data: await res.json() };
}

// ========== LINE CHART ==========
async function renderLineChart() {
  const selectedLanguages = getSelectedLanguages();
  if (selectedLanguages.length === 0) return;

  const allData = await Promise.all(selectedLanguages.map(fetchData));
  const labels = allData[0]?.data.map(item => item.year) || [];

  const datasets = allData.map(langObj => ({
    label: langObj.language,
    data: langObj.data.map(item => item.count),
    borderColor: getRandomColor(),
    tension: 0.4
  }));

  if (lineChartInstance) lineChartInstance.destroy();

  lineChartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: { legend: { display: true } }
    }
  });
}

// ========== POPULATE YEAR DROPDOWN ==========
async function populateYearDropdown() {
  const res = await fetch(`${BASE_URL}/api/languages`);
  const languages = await res.json();
  const data = await fetch(`${BASE_URL}/api/data/${languages[0]}`).then(res => res.json());

  const years = data.map(d => d.year);
  const dropdown = document.getElementById("yearDropdown");

  dropdown.innerHTML = `<option value="">-- Select Year --</option>`;
  years.forEach(year => {
    dropdown.innerHTML += `<option value="${year}">${year}</option>`;
  });
}

// ========== BAR CHART + PIE CHART FOR SELECTED YEAR ==========
document.getElementById("yearDropdown").addEventListener("change", async function () {
  const selectedYear = this.value;
  if (!selectedYear) return;

  const langs = await fetch(`${BASE_URL}/api/languages`).then(res => res.json());

  const allData = await Promise.all(
    langs.map(async lang => {
      const data = await fetch(`${BASE_URL}/api/data/${lang}`).then(res => res.json());
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
      labels,
      datasets: [{
        label: `Popularity in ${year}`,
        data,
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

// ========== RANDOM COLOR GENERATOR ==========
function getRandomColor() {
  const color = Math.floor(Math.random() * 16777215).toString(16);
  return `#${color.padStart(6, '0')}`;
}

// ========== INIT ==========
window.onload = () => {
  renderLineChart();
  populateYearDropdown();
};

// ========== DEBOUNCED CHECKBOX LISTENER ==========
let debounceTimer;
checkboxContainer.addEventListener('change', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(renderLineChart, 300);
});
