const K = "edu_";

const S = {
  user: JSON.parse(localStorage.getItem(K + "user") || "null"),

  hw: JSON.parse(localStorage.getItem(K + "hw") || "null") || [
    {
      id: 1,
      s: "Mathematics",
      t: "Trigonometric Functions — Exercise 3",
      d: "Tomorrow",
      st: "Pending"
    },
    {
      id: 2,
      s: "Physics",
      t: "Laws of Motion DPP",
      d: "Friday",
      st: "Pending"
    },
    {
      id: 3,
      s: "Chemistry",
      t: "Mole Concept Practice",
      d: "Monday",
      st: "Submitted"
    }
  ],

  nt: JSON.parse(localStorage.getItem(K + "nt") || "null") || [
    {
      t: "Parent–Teacher Meeting",
      d: "10 Oct 2026",
      x: "Meeting schedule will be shared by class teachers."
    },
    {
      t: "Sports Registration",
      d: "12 Oct 2026",
      x: "Submit sports participation details to the office."
    }
  ]
};

let page = "Dashboard";
let role = S.user?.role || "Parent";
let open = false;

function save() {
  localStorage.setItem(K + "user", JSON.stringify(S.user));
  localStorage.setItem(K + "hw", JSON.stringify(S.hw));
  localStorage.setItem(K + "nt", JSON.stringify(S.nt));
}

function esc(x) {
  return String(x ?? "").replace(/[&<>"']/g, function (m) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[m];
  });
}

function staff() {
  return role === "Teacher" || role === "Admin";
}

function toast(message) {
  const e = document.createElement("div");

  e.textContent = message;

  e.style =
    "position:fixed;right:16px;bottom:16px;" +
    "background:#172033;color:white;padding:12px 15px;" +
    "border-radius:11px;z-index:9999";

  document.body.appendChild(e);

  setTimeout(function () {
    e.remove();
  }, 2000);
}

function render() {
  if (S.user) {
    app();
  } else {
    login();
  }
}

/* LOGIN */

function login() {
  document.getElementById("app").innerHTML = `
    <div class="login">
      <div class="loginbox">

        <img src="./icon-192.png">

        <h1>EduConnect</h1>

        <p class="muted">
          Smart school management in one place.
        </p>

        <div class="form">

          <label>School code</label>

          <input
            id="sc"
            class="input"
            value="DEMO01"
          >

          <label>Phone number</label>

          <input
            id="ph"
            class="input"
            inputmode="numeric"
            maxlength="10"
            placeholder="10-digit demo number"
          >

          <label>Continue as</label>

          <div class="roles">

            ${["Parent", "Student", "Teacher", "Admin"]
              .map(function (r) {
                return `
                  <button
                    type="button"
                    class="role ${role === r ? "sel" : ""}"
                    onclick="pickRole('${r}')"
                  >
                    ${r}
                  </button>
                `;
              })
              .join("")}

          </div>

          <button
            type="button"
            class="btn"
            onclick="enter()"
          >
            Enter EduConnect
          </button>

          <button
            type="button"
            class="btn ghost"
            onclick="toggleDark()"
            style="margin-top:8px"
          >
            🌙 Dark Mode
          </button>

          <small class="muted">
            Demo mode • no real OTP
          </small>

        </div>

      </div>
    </div>
  `;
}

/* ROLE SELECTION */

function pickRole(r) {
  role = r;
  login();
}

/* LOGIN ENTER */

function enter() {
  const phone = document.getElementById("ph").value.trim();

  if (!/^\d{10}$/.test(phone)) {
    toast("Enter a 10-digit number");
    return;
  }

  S.user = {
    name: role === "Admin" ? "School Admin" : role,
    role: role,
    phone: phone
  };

  save();

  page = "Dashboard";

  render();
}

/* LOGOUT */

function logout() {
  S.user = null;
  role = "Parent";

  save();

  render();
}

/* NAVIGATION */

function go(x) {
  page = x;
  open = false;

  render();
}

function side() {
  open = !open;

  render();
}

/* DARK MODE */

function toggleDark() {
  document.body.classList.toggle("dark");

  localStorage.setItem(
    "edu_dark",
    document.body.classList.contains("dark") ? "1" : "0"
  );
}

function loadDark() {
  if (localStorage.getItem("edu_dark") === "1") {
    document.body.classList.add("dark");
  }
}

/* MAIN APP */

function app() {
  document.getElementById("app").innerHTML = `
    <div class="shell">

      <aside class="side ${open ? "open" : ""}">

        <div class="brand">
          <img src="./icon-192.png">
          EduConnect
        </div>

        <div class="nav">

          ${[
            "Dashboard",
            "Homework",
            "Attendance",
            "Timetable",
            "Results",
            "Notices",
            "Documents",
            "Study AI"
          ]
            .map(function (x) {
              return `
                <button
                  class="${page === x ? "on" : ""}"
                  onclick="go('${x}')"
                >
                  ${x}
                </button>
              `;
            })
            .join("")}

        </div>

        <button
          class="btn ghost"
          style="position:absolute;bottom:18px;left:14px;right:14px"
          onclick="logout()"
        >
          ↪ Logout
        </button>

      </aside>

      <main class="main">

        <div class="top">

          <div style="display:flex;gap:10px">

            <button
              class="mobile"
              onclick="side()"
            >
              ☰
            </button>

            <div>

              <h1>${esc(page)}</h1>

              <div class="muted">
                DEMO01 • school workspace
              </div>

            </div>

          </div>

          <div class="pill">

            <div class="avatar">
              ${esc(S.user.name[0])}
            </div>

            <div>

              <b>${esc(S.user.name)}</b>

              <div
                class="muted"
                style="font-size:12px"
              >
                ${esc(role)}
              </div>

            </div>

          </div>

        </div>

        ${body()}

      </main>

    </div>
  `;
}

/* PAGE ROUTER */

function body() {
  if (page === "Dashboard") return dash();
  if (page === "Homework") return homework();
  if (page === "Attendance") return attendance();
  if (page === "Timetable") return timetable();
  if (page === "Results") return results();
  if (page === "Notices") return notices();
  if (page === "Documents") return docs();

  return ai();
}

/*
