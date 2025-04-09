# 🌐 Language Popularity Visualizer – Frontend

This is the frontend of the **Language Popularity Analyzer** project.  
It visualizes programming language trends from Stack Overflow data between **2015 to 2024** using interactive charts, dropdowns, and themes.

> 🔗 Backend API required to be running separately (Flask-based)

---

## ✨ Features

- 📈 **Line Chart** to compare languages over time
- 📊 **Bar Chart** showing popularity in a selected year
- 🥧 **Pie Chart** representing percentage share of each language in a selected year
- 🌙 **Dark/Light Theme Toggle**
- ✅ Responsive and minimal UI built with **HTML + CSS + JS**
- 🎯 Powered by [Chart.js](https://www.chartjs.org/)

---

## 🖥 Tech Stack

| Tech         | Purpose                 |
|--------------|-------------------------|
| HTML / CSS   | Frontend Layout & Theme |
| JavaScript   | Interactivity & Chart logic |
| Chart.js     | Data visualizations     |
| Flask (API)  | ⚠️ Consumed as external API |

---

## 📂 Folder Structure

```bash
language-visualizer-frontend/
│
├── index.html           # Main frontend file
├── static/
│   ├── style.css        # Styling (Light + Dark themes)
│   └── script.js        # Dropdowns, Chart rendering, API calls
