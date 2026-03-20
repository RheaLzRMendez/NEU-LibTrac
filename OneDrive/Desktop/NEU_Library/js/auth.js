function handleCredentialResponse(response) {
  const data = parseJwt(response.credential);
  const email = data.email;
  const firstName = data.given_name;
  const role = document.querySelector('input[name="role"]:checked').value;

  // Save to localStorage for later pages
  localStorage.setItem("userEmail", email);
  localStorage.setItem("firstName", firstName);

  // Exception accounts: can access both student and admin dashboards
  const exceptionAccounts = [
    "jcesperanza@neu.edu.ph",
    "eyamendez18june@gmail.com",
    "mendeziza183@gmail.com"
  ];

  if (exceptionAccounts.includes(email)) {
    if (role === "student") {
      alert("Welcome to NEU Library!");
      window.location.href = "checkin.html"; // student dashboard
    } else if (role === "admin") {
      alert("Welcome Admin!");
      window.location.href = "admin.html"; // admin dashboard
    }
    return;
  }

  // Institutional student accounts: only allowed student role
  if (role === "student" && email.endsWith("@neu.edu.ph")) {
    alert("Welcome to NEU Library!");
    window.location.href = "checkin.html";
  } else if (role === "admin" && email.endsWith("@neu.edu.ph")) {
    // Block institutional student accounts from admin dashboard
    alert("Access denied. Only exception accounts can log in as admin.");
  } else {
    alert("Access denied. Invalid account for selected role.");
  }
}

// Helper: decode JWT
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
  return JSON.parse(jsonPayload);
}
