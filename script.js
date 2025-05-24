const apiBase = "https://engageng.onrender.com";
let token = "";
let userRole = "";

// Register
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const role = document.querySelector("input[name='role']:checked").value;

  const res = await fetch(`${apiBase}/register/${role}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  alert(data.message);
});

// Login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const res = await fetch(`${apiBase}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (res.ok) {
    token = data.token;
    userRole = data.role;
    showDashboard();
  } else {
    alert(data.message);
  }
});

// Show dashboard
function showDashboard() {
  document.getElementById("dashboard").style.display = "block";
  if (userRole === "user") {
    document.getElementById("userDashboard").style.display = "block";
    document.getElementById("clientDashboard").style.display = "none";
  } else if (userRole === "client") {
    document.getElementById("clientDashboard").style.display = "block";
    document.getElementById("userDashboard").style.display = "none";
  }
}

// Submit Task
document.getElementById("taskForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const type = document.getElementById("taskType").value;
  const url = document.getElementById("taskLink").value;

  const res = await fetch(`${apiBase}/client/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ type, url })
  });

  const data = await res.json();
  alert(data.message);
});

// Submit Proof
document.getElementById("proofForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const comments = document.getElementById("comments").value;
  const proofFile = document.getElementById("proofUpload").files[0];

  const formData = new FormData();
  formData.append("comments", comments);
  formData.append("proof", proofFile);

  const res = await fetch(`${apiBase}/user/proof`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });

  const data = await res.json();
  alert(data.message);
});
