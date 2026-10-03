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
let role = S.user?.role || "Student";
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
  loadDark();

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

            ${["Student", "Teacher", "Admin"]
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

/* ROLE */

function pickRole(r) {
  role = r;
  login();
}

/* LOGIN */

function enter() {
  const phoneElement = document.getElementById("ph");
  const phone = phoneElement ? phoneElement.value.trim() : "";

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
  open = false;

  render();
}

/* LOGOUT */

function logout() {
  S.user = null;
  role = "Student";
  page = "Dashboard";

  localStorage.removeItem(K + "user");

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

function applyTheme() {
  const theme =
    localStorage.getItem("edu_theme") || "system";

  let dark = false;

  if (theme === "dark") {
    dark = true;
  }

  if (theme === "system") {
    dark = window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  document.body.classList.toggle("dark", dark);
}

function loadDark() {
  applyTheme();
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

          <div style="display:flex;gap:10px;align-items:center">

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
              ${esc((S.user.name || "U")[0])}
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
  if (page === "Settings") return settings();

  return dash();
}

/* DASHBOARD */

function dash() {
  const pending = S.hw.filter(function (x) {
    return x.st === "Pending";
  }).length;

  return `
    <section class="grid">

      <div class="card">
        <div class="muted">Attendance</div>
        <div class="big">92%</div>
        <p>Good attendance record</p>
      </div>

      <div class="card">
        <div class="muted">Homework</div>
        <div class="big">${pending}</div>
        <p>Pending assignments</p>
      </div>

      <div class="card">
        <div class="muted">Notices</div>
        <div class="big">${S.nt.length}</div>
        <p>Latest school notices</p>
      </div>

      <div class="card">
        <div class="muted">Role</div>
        <div class="big" style="font-size:24px">
          ${esc(role)}
        </div>
        <p>Current account</p>
      </div>

    </section>

    <section class="card">
      <h2>Welcome to EduConnect</h2>

      <p>
        Your school information, homework, attendance,
        timetable, results and notices in one place.
      </p>

      <div class="actions">

        <button class="btn" onclick="go('Homework')">
          View Homework
        </button>

        <button class="btn ghost" onclick="go('Notices')">
          View Notices
        </button>

        <button class="btn ghost" onclick="go('Study AI')">
          Open Study AI
        </button>

      </div>
    </section>
  `;
}

/* HOMEWORK */

function homework() {
  return `
    <section class="card">

      <div class="sectionhead">

        <div>
          <h2>Homework</h2>
          <p class="muted">
            Assignments and submission status
          </p>
        </div>

        ${
          staff()
            ? `
              <button class="btn" onclick="addHomework()">
                + Add Homework
              </button>
            `
            : ""
        }

      </div>

      <div class="list">

        ${
          S.hw.length
            ? S.hw
                .map(function (x) {
                  return `
                    <div class="item">

                      <div>
                        <b>${esc(x.s)}</b>

                        <div>
                          ${esc(x.t)}
                        </div>

                        <small class="muted">
                          Due: ${esc(x.d)}
                        </small>
                      </div>

                      <div>
                        <span class="badge">
                          ${esc(x.st)}
                        </span>

                        ${
                          x.st === "Pending" && !staff()
                            ? `
                              <button
                                class="btn small"
                                onclick="submitHomework(${x.id})"
                              >
                                Submit
                              </button>
                            `
                            : ""
                        }
                      </div>

                    </div>
                  `;
                })
                .join("")
            : `<p class="muted">No homework available.</p>`
        }

      </div>

    </section>
  `;
}

function addHomework() {
  const subject = prompt("Subject:");

  if (!subject) return;

  const title = prompt("Homework:");

  if (!title) return;

  const due = prompt("Due date:", "Tomorrow") || "Tomorrow";

  S.hw.unshift({
    id: Date.now(),
    s: subject,
    t: title,
    d: due,
    st: "Pending"
  });

  save();
  toast("Homework added");
  render();
}

function submitHomework(id) {
  const item = S.hw.find(function (x) {
    return x.id === id;
  });

  if (!item) return;

  item.st = "Submitted";

  save();
  toast("Homework submitted");
  render();
}

/* ATTENDANCE */

function attendance() {
  return `
    <section class="card">

      <h2>Attendance</h2>

      <div class="attendance">

        <div class="big">92%</div>

        <div>
          <b>Present: 46 days</b>
          <p class="muted">
            Absent: 4 days
          </p>
        </div>

      </div>

      <div class="progress">
        <div style="width:92%"></div>
      </div>

      <p class="muted">
        Attendance data shown in demo mode.
      </p>

    </section>
  `;
}

/* TIMETABLE */

function timetable() {
  const rows = [
    ["Monday", "Physics", "Mathematics", "Chemistry"],
    ["Tuesday", "Mathematics", "Physics", "English"],
    ["Wednesday", "Chemistry", "Mathematics", "Physics"],
    ["Thursday", "Physics", "Chemistry", "Mathematics"],
    ["Friday", "Mathematics", "Physics", "Chemistry"]
  ];

  return `
    <section class="card">

      <h2>Timetable</h2>

      <div class="tablewrap">

        <table>

          <thead>
            <tr>
              <th>Day</th>
              <th>9:00 AM</th>
              <th>10:00 AM</th>
              <th>11:00 AM</th>
            </tr>
          </thead>

          <tbody>

            ${rows
              .map(function (r) {
                return `
                  <tr>
                    <td><b>${r[0]}</b></td>
                    <td>${r[1]}</td>
                    <td>${r[2]}</td>
                    <td>${r[3]}</td>
                  </tr>
                `;
              })
              .join("")}

          </tbody>

        </table>

      </div>

    </section>
  `;
}

/* RESULTS */

function results() {
  return `
    <section class="card">

      <h2>Results</h2>

      <div class="grid">

        <div class="card">
          <div class="muted">Physics</div>
          <div class="big">88</div>
          <p>Marks</p>
        </div>

        <div class="card">
          <div class="muted">Chemistry</div>
          <div class="big">91</div>
          <p>Marks</p>
        </div>

        <div class="card">
          <div class="muted">Mathematics</div>
          <div class="big">94</div>
          <p>Marks</p>
        </div>

      </div>

      <p class="muted">
        Demo result data.
      </p>

    </section>
  `;
}

/* NOTICES */

function notices() {
  return `
    <section class="card">

      <div class="sectionhead">

        <div>
          <h2>Notices & Circulars</h2>
          <p class="muted">
            School announcements
          </p>
        </div>

        ${
          staff()
            ? `
              <button class="btn" onclick="addNotice()">
                + Add Notice
              </button>
            `
            : ""
        }

      </div>

      <div class="list">

        ${S.nt
          .map(function (x) {
            return `
              <div class="item">

                <div>
                  <b>${esc(x.t)}</b>

                  <p>
                    ${esc(x.x)}
                  </p>
                </div>

                <small class="muted">
                  ${esc(x.d)}
                </small>

              </div>
            `;
          })
          .join("")}

      </div>

    </section>
  `;
}

function addNotice() {
  const title = prompt("Notice title:");

  if (!title) return;

  const text = prompt("Notice details:");

  if (!text) return;

  S.nt.unshift({
    t: title,
    d: "Today",
    x: text
  });

  save();
  toast("Notice added");
  render();
}

/* DOCUMENTS */

function docs() {
  return `
    <section class="card">

      <h2>Documents</h2>

      <p class="muted">
        School documents and PDFs
      </p>

      <div class="list">

        <div class="item">
          <div>
            <b>School Calendar 2026</b>
            <p class="muted">PDF document</p>
          </div>

          <button
            class="btn small"
            onclick="toast('Demo PDF opened')"
          >
            Open
          </button>
        </div>

        <div class="item">
          <div>
            <b>Academic Guidelines</b>
            <p class="muted">PDF document</p>
          </div>

          <button
            class="btn small"
            onclick="toast('Demo PDF opened')"
          >
            Open
          </button>
        </div>

        <div class="item">
          <div>
            <b>Fee Structure</b>
            <p class="muted">PDF document</p>
          </div>

          <button
            class="btn small"
            onclick="toast('Demo PDF opened')"
          >
            Open
          </button>
        </div>

      </div>

    </section>
  `;
}

/* SETTINGS */

function settings() {
  const theme = localStorage.getItem("edu_theme") || "system";
  const notifications =
    localStorage.getItem("edu_notifications") !== "0";

  return `
    <section class="card">

      <h2>⚙️ Settings</h2>

      <p class="muted">
        Manage your EduConnect preferences.
      </p>

      <div class="head">
        <h2>🎨 Appearance</h2>
      </div>

      <div class="row">
        <div>
          <strong>System Default</strong>
          <small class="muted">
            Follow your phone's theme
          </small>
        </div>

        <button
          class="btn ${theme === "system" ? "" : "ghost"}"
          onclick="setTheme('system')"
        >
          ${theme === "system" ? "Selected" : "Select"}
        </button>
      </div>

      <div class="row">
        <div>
          <strong>☀️ White Mode</strong>
          <small class="muted">
            Always use light mode
          </small>
        </div>

        <button
          class="btn ${theme === "light" ? "" : "ghost"}"
          onclick="setTheme('light')"
        >
          ${theme === "light" ? "Selected" : "Select"}
        </button>
      </div>

      <div class="row">
        <div>
          <strong>🌙 Dark Mode</strong>
          <small class="muted">
            Always use dark mode
          </small>
        </div>

        <button
          class="btn ${theme === "dark" ? "" : "ghost"}"
          onclick="setTheme('dark')"
        >
          ${theme === "dark" ? "Selected" : "Select"}
        </button>
      </div>

      <div class="head">
        <h2>🔔 Notifications</h2>
      </div>

      <div class="row">
        <div>
          <strong>School Notifications</strong>
          <small class="muted">
            Homework, notices and school updates
          </small>
        </div>

        <button
          class="btn ${notifications ? "" : "ghost"}"
          onclick="toggleNotifications()"
        >
          ${notifications ? "ON" : "OFF"}
        </button>
      </div>

      <div class="head">
        <h2>👤 Account</h2>
      </div>

      <div class="row">
        <div>
          <strong>${esc(S.user.name)}</strong>
          <small class="muted">
            ${esc(role)} • ${esc(S.user.phone)}
          </small>
        </div>

        <button
          class="btn ghost"
          onclick="anotherAccount()"
        >
          Another Account
        </button>
      </div>

      <div class="head">
        <h2>ℹ️ About</h2>
      </div>

      <div class="row">
        <div>
          <strong>EduConnect</strong>
          <small class="muted">
            Smart School Management
          </small>
        </div>

        <span class="badge">v1.0 Demo</span>
      </div>

    </section>
  `;
}
function setTheme(theme) {
  localStorage.setItem("edu_theme", theme);

  applyTheme();

  render();
}

function toggleNotifications() {
  const current =
    localStorage.getItem("edu_notifications") !== "0";

  localStorage.setItem(
    "edu_notifications",
    current ? "0" : "1"
  );

  toast(current ? "Notifications OFF" : "Notifications ON");

  render();
}

function anotherAccount() {
  localStorage.removeItem(K + "user");

  S.user = null;
  role = "Student";
  page = "Dashboard";

  render();
}
/* STUDY AI */

function ai() {
  return `
    <section class="card">

      <h2>Study AI</h2>

      <p class="muted">
        Ask a study question and get help.
      </p>

      <textarea
        id="aiq"
        class="input"
        rows="5"
        placeholder="Example: Explain Newton's second law..."
      ></textarea>

      <button
        class="btn"
        style="margin-top:10px"
        onclick="askAI()"
      >
        Ask Study AI
      </button>

      <div
        id="air"
        class="airesult"
        style="margin-top:15px"
      ></div>

    </section>
  `;
}

function askAI() {
  const q = document.getElementById("aiq").value.trim();
  const result = document.getElementById("air");

  if (!q) {
    toast("Type your question first");
    return;
  }

  result.innerHTML = `
    <div class="card">
      <b>Study AI Demo</b>

      <p>
        Your question:
        <br>
        ${esc(q)}
      </p>

      <p>
        AI integration will be connected in the
        production version of EduConnect.
      </p>
    </div>
  `;
}

/* START */

loadDark();
render();
