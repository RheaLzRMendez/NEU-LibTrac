window.onload = () => {
  const fullName = localStorage.getItem("firstName") || "Guest";
  const firstName = fullName.split(" ")[0];
  const email = localStorage.getItem("userEmail") || "user@gmail.com";

  // Greeting
  document.getElementById("helloMsg").innerHTML =
    `<span class="hello-text">Hello!</span><br><span class="name-text">${firstName}</span>`;

  // Top bar email (shows at the top, next to logo)
  const userEmailEl = document.getElementById("userEmail");
  if (userEmailEl) {
    userEmailEl.innerText = email;
  }
};

// Profile section (name only, email removed)
const fullName = localStorage.getItem("firstName") || "Guest";
const profileNameEl = document.getElementById("profileName");
if (profileNameEl) profileNameEl.innerText = fullName;

document.getElementById("checkinForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const purpose = document.getElementById("purpose").value;
  const college = document.getElementById("college").value;
  const userType = document.getElementById("userType").value; // NEW FIELD
  // 
  
  const email =localStorage.getItem("userEmail");
  // Send data to backend (save_checkin.php)
  fetch("save_checkin.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `purpose=${encodeURIComponent(purpose)}&college=${encodeURIComponent(college)}&userType=${encodeURIComponent(userType)}&email=${encodeURIComponent(email)}` 
   })
   
  .then(res => res.text())
  .then(data => {
    // Show success popup
    const popup = document.createElement("div");
    popup.classList.add("success-popup");
    popup.innerHTML = `
      <div class="popup-box">
        <div class="check-icon">✔️</div>
        <h2 class="popup-heading">
          <span class="welcome-text">WELCOME</span><br>
          <span class="welcome-text">TO</span><br>
          <span class="library-text">NEU LIBRARY!</span>
        </h2>
        <p>Your entry has been recorded successfully.<br>Enjoy your study time!</p>
        <div class="popup-buttons">
          <button id="doneBtn">DONE</button>
          <button id="newEntryBtn">NEW ENTRY</button>
        </div>
      </div>
    `;
    document.body.appendChild(popup);

    // Button actions
    document.getElementById("doneBtn").addEventListener("click", () => {
      popup.remove(); // close popup
    });

    document.getElementById("newEntryBtn").addEventListener("click", () => {
      popup.remove();
      document.getElementById("checkinForm").reset(); // reset form for new entry
    });
  })
  .catch(err => {
    alert("Error saving check-in. Please try again.");
    console.error(err);
  });
});

// Logout button action
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = "index.html";
});
