// --------------------
// Dummy user data (replace with DB later)
// --------------------
const users = [
  { name: "Rhealiza Rose T. Mendez", email: "rhealizarose.mendez@neu.edu.ph", status: "Active" },
  { name: "Rhealiza Rose T. Mendez", email: "eyamendez18june@gmail.com", status: "Active" }
];

// --------------------
// Render Users Table
// --------------------
function renderTable() {
  const tbody = document.getElementById("visitorTable");
  tbody.innerHTML = "";
  users.forEach(u => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td class="${u.status === "Active" ? "status-active" : "status-issue"}">${u.status}</td>
      <td><button class="blockBtn">${u.status === "Active" ? "Block Access" : "Unblock"}</button></td>
    `;
    tbody.appendChild(row);
  });
}

// --------------------
// Search Filter
// --------------------
document.getElementById("searchInput").addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const rows = document.querySelectorAll("#visitorTable tr");
  rows.forEach(row => {
    const name = row.cells[0].innerText.toLowerCase();
    const email = row.cells[1].innerText.toLowerCase();
    row.style.display = (name.includes(query) || email.includes(query)) ? "" : "none";
  });
});

// --------------------
// Block/Unblock Toggle
// --------------------
document.addEventListener("click", function(e) {
  if (e.target.classList.contains("blockBtn")) {
    const row = e.target.closest("tr");
    const statusCell = row.cells[2];
    if (statusCell.innerText === "Active") {
      statusCell.innerText = "Blocked";
      statusCell.className = "status-issue";
      e.target.innerText = "Unblock";
      row.style.background = "rgba(220,38,38,0.1)";
    } else {
      statusCell.innerText = "Active";
      statusCell.className = "status-active";
      e.target.innerText = "Block Access";
      row.style.background = "";
    }
  }
});

// --------------------
// Sidebar Navigation
// --------------------
function showSection(sectionId) {
  document.getElementById("dashboardSection").style.display = "none";
  document.getElementById("usersSection").style.display = "none";
  document.getElementById("adminSection").style.display = "none";
  document.getElementById(sectionId).style.display = "block";
}

document.getElementById("dashboardBtn").addEventListener("click", () => {
  showSection("dashboardSection");
  loadCheckins(); // refresh dashboard data
});

document.getElementById("usersBtn").addEventListener("click", () => {
  showSection("usersSection");
  renderTable();
});

document.getElementById("adminBtn").addEventListener("click", () => {
  showSection("adminSection");
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "index.html"; 
});


// --------------------
// Analysis Engine
// --------------------
document.getElementById("generateAnalysis").addEventListener("click", () => {
  document.getElementById("analysisStatus").innerText = "Generating insights...";
  setTimeout(() => {
    document.getElementById("analysisStatus").innerText =
      "Insights generated: Peak visitors at 5pm, Engineering highest attendance.";
  }, 2000);
});

// --------------------
// Chart.js Setup
// --------------------
const hourlyChart = new Chart(document.getElementById('hourlyChart'), {
  type: 'bar',
  data: { labels: [], datasets: [{ label: 'Visitors', backgroundColor: '#4CAF50', data: [] }] },
  options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
});

const collegeChart = new Chart(document.getElementById('collegeChart'), {
  type: 'pie',
  data: { labels: [], datasets: [{ backgroundColor: ['#2196F3','#FF9800','#9C27B0','#F44336'], data: [] }] },
  options: { responsive: true, maintainAspectRatio: false }
});



// --------------------
// Load Check-ins with Filters
// --------------------
function loadCheckins() {
  const start = document.getElementById("startDate")?.value || "";
  const end = document.getElementById("endDate")?.value || "";
  const purpose = document.getElementById("filterPurpose")?.value || "";
  const college = document.getElementById("filterCollege")?.value || "";
  const userType = document.getElementById("filterUserType")?.value || "";

  const params = new URLSearchParams({ start, end, purpose, college, userType });

  fetch("get_checkins.php?" + params.toString())
    .then(res => res.json())
    .then(entries => {
      // Update metrics
      document.getElementById("totalVisitors").innerText = entries.length;
      document.getElementById("systemUsers").innerText = new Set(entries.map(e => e.email)).size;
      document.getElementById("liveSync").innerText = "Connected";

      // Calculate daily peak
      const hours = {};
      entries.forEach(e => {
        const hour = new Date(e.created_at).getHours();
        hours[hour] = (hours[hour] || 0) + 1;
      });
      const peakHour = Object.keys(hours).reduce((a,b) => hours[a] > hours[b] ? a : b, 0);
      document.getElementById("dailyPeak").innerText = peakHour ? peakHour + ":00" : "--";

      // Update Hourly Chart
      const hourLabels = [...Array(24).keys()].map(h => h + ":00");
      const hourData = hourLabels.map(h => hours[parseInt(h)] || 0);
      hourlyChart.data.labels = hourLabels;
      hourlyChart.data.datasets[0].data = hourData;
      hourlyChart.update();

      // Update College Chart
      const collegeCounts = {};
      entries.forEach(e => {
        collegeCounts[e.college] = (collegeCounts[e.college] || 0) + 1;
      });
      collegeChart.data.labels = Object.keys(collegeCounts);
      collegeChart.data.datasets[0].data = Object.values(collegeCounts);
      collegeChart.update();
    })
    .catch(err => {
      console.error("Error loading check-ins:", err);
    });
}

document.getElementById("filterBtn").addEventListener("click", loadCheckins);

// --------------------
// Initial Load
// --------------------
loadCheckins();


