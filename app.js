/* EDUCONNECT v9 — Functional Prototype */

(() => {
  "use strict";

  const APP = "EduConnect";
  const OTP = "123456";

  const K = {
    users: "ec9_users",
    current: "ec9_current",
    accounts: "ec9_accounts",
    school: "ec9_school",
    theme: "ec9_theme",
    settings: "ec9_settings",
    attendance: "ec9_attendance",
    homework: "ec9_homework",
    submissions: "ec9_submissions",
    notices: "ec9_notices",
    results: "ec9_results",
    notifications: "ec9_notifications",
    exams: "ec9_exams",
    fees: "ec9_fees",
    leaves: "ec9_leaves",
    events: "ec9_events",
    feedback: "ec9_feedback",
    ptm: "ec9_ptm"
  };

  const STATE = {
    page: "dashboard",
    menu: false
  };

  const SCHOOL = {
    code: "DEMO01",
    name: "EduConnect Demo School",
    classes: ["9", "10", "11", "12"],
    sections: ["A", "B"],
    subjects: ["Physics", "Chemistry", "Mathematics", "English", "Computer Science"]
  };

  const USERS = [
    {
      id: "STU001",
      role: "Student",
      name: "Dipanshu Patidar",
      phone: "9999999999",
      school: "DEMO01",
      class: "11",
      section: "A",
      roll: "01",
      teachers: ["T001"]
    },
    {
      id: "STU002",
      role: "Student",
      name: "Aarav Sharma",
      phone: "9999999998",
      school: "DEMO01",
      class: "11",
      section: "A",
      roll: "02",
      teachers: ["T001"]
    },
    {
      id: "STU003",
      role: "Student",
      name: "Riya Patel",
      phone: "9999999997",
      school: "DEMO01",
      class: "11",
      section: "B",
      roll: "01",
      teachers: ["T002"]
    },
    {
      id: "T001",
      role: "Teacher",
      name: "Amit Sharma",
      phone: "9000000001",
      school: "DEMO01",
      subject: "Physics",
      classes: ["11"],
      sections: ["A"],
      teachers: []
    },
    {
      id: "T002",
      role: "Teacher",
      name: "Neha Verma",
      phone: "9000000002",
      school: "DEMO01",
      subject: "Chemistry",
      classes: ["11"],
      sections: ["B"],
      teachers: []
    },
    {
      id: "ADMIN001",
      role: "Admin",
      name: "School Admin",
      phone: "9000000000",
      school: "DEMO01"
    }
  ];

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function data(name, fallback = []) {
    return read(K[name] || ("ec9_" + name), fallback);
  }

  function saveData(name, value) {
    write(K[name] || ("ec9_" + name), value);
  }

  function uid(prefix = "ID") {
    return prefix + "_" + Date.now().toString(36) +
      Math.random().toString(36).slice(2, 7);
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getUsers() {
    return read(K.users, []);
  }

  function currentUser() {
    const id = localStorage.getItem(K.current);
    return getUsers().find(u => u.id === id) || null;
  }

  function isStaff() {
    const u = currentUser();
    return u && (u.role === "Teacher" || u.role === "Admin");
  }

  function isAdmin() {
    const u = currentUser();
    return u && u.role === "Admin";
  }

  function seed() {
    const saved = read(K.users, []);

    if (!Array.isArray(saved) || !saved.some(u => u.id === "STU001")) {
      write(K.users, USERS);
    }

    if (!localStorage.getItem(K.school)) {
      write(K.school, SCHOOL);
    }

    if (!localStorage.getItem(K.accounts)) {
      write(K.accounts, []);
    }

    if (!localStorage.getItem(K.settings)) {
      write(K.settings, {
        notifications: true,
        language: "English"
      });
    }

    if (!localStorage.getItem(K.attendance)) write(K.attendance, []);
    if (!localStorage.getItem(K.homework)) write(K.homework, []);
    if (!localStorage.getItem(K.submissions)) write(K.submissions, []);
    if (!localStorage.getItem(K.notices)) write(K.notices, []);
    if (!localStorage.getItem(K.results)) write(K.results, []);
    if (!localStorage.getItem(K.notifications)) write(K.notifications, []);
    if (!localStorage.getItem(K.exams)) write(K.exams, []);
    if (!localStorage.getItem(K.fees)) write(K.fees, []);
    if (!localStorage.getItem(K.leaves)) write(K.leaves, []);
    if (!localStorage.getItem(K.events)) write(K.events, []);
    if (!localStorage.getItem(K.feedback)) write(K.feedback, []);
    if (!localStorage.getItem(K.ptm)) write(K.ptm, []);
  }

  seed();

  function loginUser(user) {
    localStorage.setItem(K.current, user.id);

    let accounts = read(K.accounts, []);

    if (!accounts.some(a => a.id === user.id)) {
      accounts.push({
        id: user.id,
        name: user.name,
        role: user.role,
        phone: user.phone
      });
      write(K.accounts, accounts);
    }

    STATE.page = "dashboard";
  }

  function logoutUser() {
    localStorage.removeItem(K.current);
    STATE.page = "login";
    STATE.menu = false;
    render();
  }

  function demoLogin(role) {
    const user = getUsers().find(u => u.role === role);

    if (user) {
      loginUser(user);
      render();
    }
  }

  function otpLogin(phone, code) {
    if (code !== OTP) {
      alert("Demo OTP: 123456");
      return;
    }

    const user = getUsers().find(u => u.phone === phone);

    if (!user) {
      alert("Account not found");
      return;
    }

    loginUser(user);
    render();
  }

  function addData(name, item) {
    const list = data(name, []);
    list.push(item);
    saveData(name, list);
    return item;
  }

  function updateData(name, id, changes) {
    const list = data(name, []);
    const index = list.findIndex(x => x.id === id);

    if (index === -1) return;

    list[index] = {
      ...list[index],
      ...changes
    };

    saveData(name, list);
  }

  function deleteData(name, id) {
    saveData(
      name,
      data(name, []).filter(x => x.id !== id)
    );
  }

  function byId(name, id) {
    return data(name, []).find(x => x.id === id);
  }

  function notifyUser(userId, title, message, type = "general") {
    const settings = read(K.settings, {
      notifications: true,
      language: "English"
    });

    if (!settings.notifications) return;

    addData("notifications", {
      id: uid("NOT"),
      userId,
      title,
      message,
      type,
      date: today(),
      read: false
    });
  }

  function notifyClass(className, section, title, message, type) {
    getUsers()
      .filter(u =>
        u.role === "Student" &&
        u.class === className &&
        u.section === section
      )
      .forEach(u => notifyUser(u.id, title, message, type));
  }

  /* LOGIN */

  function renderLogin() {
    document.body.innerHTML = `
      <div class="login">
        <div class="loginbox">
          <img src="./icon-192.png">
          <h1>EduConnect</h1>
          <p class="muted">Smart School Management</p>

          <div class="form">

            <input id="schoolCode"
              class="input"
              placeholder="School Code"
              value="DEMO01">

            <input id="phone"
              class="input"
              placeholder="Phone Number"
              inputmode="numeric">

            <input id="otp"
              class="input"
              placeholder="OTP"
              inputmode="numeric">

            <button class="btn" id="loginBtn">
              Login
            </button>

            <button class="btn alt" id="demoStudent">
              Demo Student
            </button>

            <button class="btn ghost" id="demoTeacher">
              Demo Teacher
            </button>

            <button class="btn ghost" id="demoAdmin">
              Demo Admin
            </button>

          </div>

          <p class="muted" style="margin-top:16px">
            Demo OTP: 123456
          </p>
        </div>
      </div>
    `;

    document.getElementById("loginBtn").onclick = handleLogin;

    document.getElementById("demoStudent").onclick =
      () => demoLogin("Student");

    document.getElementById("demoTeacher").onclick =
      () => demoLogin("Teacher");

    document.getElementById("demoAdmin").onclick =
      () => demoLogin("Admin");
  }

  function handleLogin() {
    const code = document
      .getElementById("schoolCode")
      .value.trim();

    const phone = document
      .getElementById("phone")
      .value.trim();

    const otp = document
      .getElementById("otp")
      .value.trim();

    if (code !== SCHOOL.code) {
      alert("Invalid School Code");
      return;
    }

    otpLogin(phone, otp);
  }

  /* APP SHELL */

  function render() {
    const user = currentUser();

    if (!user) {
      renderLogin();
      return;
    }

    document.body.innerHTML = `
      <div id="app"></div>
    `;

    renderApp(user);
    applyTheme();
  }

  function renderApp(user) {
    const app = document.getElementById("app");

    app.innerHTML = `
      <div class="shell">

        <aside class="side" id="side">

          <div class="brand" onclick="go('dashboard')">
            <img src="./icon-192.png">
            <span>EduConnect</span>
          </div>

          <nav class="nav">

            <button onclick="go('profile')">
              👤 Profile
            </button>

            <button onclick="go('settings')">
              ⚙️ Settings
            </button>

            <button onclick="go('accounts')">
              🔄 Multiple Accounts
            </button>

            <button onclick="logoutUser()">
              🚪 Logout
            </button>

          </nav>
        </aside>

        <main class="main">

          <div class="top">

            <button class="mobile"
              onclick="toggleMenu()">
              ☰
            </button>

            <div>
              <h1>EduConnect</h1>
              <div class="muted">
                Welcome, ${esc(user.name)}
              </div>
            </div>

            <div class="pill">
              <div class="avatar">
                ${esc(user.name.charAt(0))}
              </div>
              <span>${esc(user.role)}</span>
            </div>

          </div>

          <section id="content"></section>

        </main>

      </div>
    `;

    renderPage();
  }

  function toggleMenu() {
    const side = document.getElementById("side");
    if (side) side.classList.toggle("open");
  }

  function go(page, push = true) {
    STATE.page = page;

    const side = document.getElementById("side");
    if (side) side.classList.remove("open");

    if (push) {
      history.pushState(
        { page },
        "",
        "#" + page
      );
    }

    renderPage();
  }

  window.addEventListener("popstate", () => {
    STATE.page =
      location.hash.replace("#", "") || "dashboard";

    renderPage();
  });

  /* DASHBOARD */

  function renderPage() {
    const box = document.getElementById("content");

    if (!box) return;

    const pages = {
      dashboard: renderDashboard,
      profile: renderProfile,
      settings: renderSettings,
      accounts: renderAccounts,
      attendance: renderAttendance,
      homework: renderHomework,
      notices: renderNotices,
      results: renderResults,
      notifications: renderNotifications,
      contacts: renderContacts,
      exams: renderExams,
      fees: renderFees,
      leave: renderLeave,
      events: renderEvents,
      feedback: renderFeedback,
      school: renderSchoolManagement
    };

    const fn = pages[STATE.page] || renderDashboard;

    box.innerHTML = fn();
  }

  function card(icon, title, page) {
    return `
      <button
        class="card premium-card card-${page}"
        onclick="go('${page}')">

        <div class="card-art">
          <span>${icon}</span>
        </div>

        <div class="card-title">
          ${title}
        </div>

        <div class="card-open">
          Tap to open →
        </div>

      </button>
    `;
  }

  function renderDashboard() {
    const user = currentUser();

    return `
      <div class="grid">

        ${card("📊", "Attendance", "attendance")}
        ${card("📚", "Homework", "homework")}
        ${card("📢", "Notices", "notices")}
        ${card("🏆", "Results", "results")}
        ${card("🔔", "Notifications", "notifications")}
        ${card("👨‍🏫", "Teacher Contacts", "contacts")}
        ${card("📝", "Exam Schedule", "exams")}
        ${card("💰", "Fees", "fees")}
        ${card("📩", "Leave", "leave")}
        ${card("🎉", "School Events", "events")}
        ${card("💬", "Feedback", "feedback")}

        ${
          user.role !== "Student"
            ? card("🏫", "School Management", "school")
            : ""
        }

      </div>
    `;
  }

  /* PROFILE */

  function renderProfile() {
    const u = currentUser();

    return `
      <div class="card">

        <div class="head">
          <h2>Profile</h2>
        </div>

        <div class="row">
          <span>Name</span>
          <strong>${esc(u.name)}</strong>
        </div>

        <div class="row">
          <span>Role</span>
          <strong>${esc(u.role)}</strong>
        </div>

        <div class="row">
          <span>Phone</span>
          <strong>${esc(u.phone)}</strong>
        </div>

        <div class="row">
          <span>School</span>
          <strong>${esc(SCHOOL.name)}</strong>
        </div>

        ${
          u.class
            ? `
              <div class="row">
                <span>Class / Section</span>
                <strong>
                  ${esc(u.class)} - ${esc(u.section)}
                </strong>
              </div>

              <div class="row">
                <span>Roll Number</span>
                <strong>${esc(u.roll || "-")}</strong>
              </div>
            `
            : ""
        }

      </div>
    `;
  }

  /* SETTINGS */

  function renderSettings() {
    const s = read(K.settings, {
      notifications: true,
      language: "English"
    });

    const theme = read(K.theme, "system");

    return `
      <div class="grid2">

        <div class="card">

          <h2>Appearance</h2>

          <div class="form">

            <button class="btn ghost"
              onclick="setTheme('light')">
              ☀️ White
            </button>

            <button class="btn ghost"
              onclick="setTheme('dark')">
              🌙 Dark
            </button>

            <button class="btn ghost"
              onclick="setTheme('system')">
              📱 System Default
            </button>

            <p class="muted">
              Current: ${esc(theme)}
            </p>

          </div>

        </div>

        <div class="card">

          <h2>Notifications</h2>

          <p class="muted">
            Control in-app notifications.
          </p>

          <button class="btn"
            onclick="toggleNotifications()">

            ${
              s.notifications
                ? "🔔 Notifications ON"
                : "🔕 Notifications OFF"
            }

          </button>

        </div>

        <div class="card">

          <h2>Language</h2>

          <select class="input"
            onchange="setLanguage(this.value)">

            <option value="English"
              ${s.language === "English" ? "selected" : ""}>
              English
            </option>

            <option value="Hindi"
              ${s.language === "Hindi" ? "selected" : ""}>
              Hindi
            </option>

          </select>

        </div>

        <div class="card">

          <h2>Account</h2>

          <div class="form">

            <button class="btn alt"
              onclick="go('accounts')">
              🔄 Another Account
            </button>

            <button class="btn ghost"
              onclick="logoutUser()">
              🚪 Logout
            </button>

          </div>

        </div>

        <div class="card">

          <h2>About</h2>

          <p class="muted">
            EduConnect<br>
            Smart School Management
          </p>

          <span class="badge">
            Prototype v9
          </span>

        </div>

      </div>
    `;
  }

  function setTheme(theme) {
    write(K.theme, theme);
    applyTheme();
    renderPage();
  }

  function applyTheme() {
    const theme = read(K.theme, "system");

    let dark = theme === "dark";

    if (theme === "system") {
      dark =
        window.matchMedia &&
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
    }

    document.body.classList.toggle("dark", dark);
  }

  function toggleNotifications() {
    const s = read(K.settings, {
      notifications: true,
      language: "English"
    });

    s.notifications = !s.notifications;

    write(K.settings, s);

    renderPage();
  }

  function setLanguage(language) {
    const s = read(K.settings, {
      notifications: true,
      language: "English"
    });

    s.language = language;

    write(K.settings, s);

    renderPage();
  }

  /* MULTIPLE ACCOUNTS */

  function renderAccounts() {
    const accounts = read(K.accounts, []);
    const current = currentUser();

    return `
      <div class="card">

        <div class="head">
          <h2>Multiple Accounts</h2>
        </div>

        ${
          accounts.length
            ? accounts.map(a => `
              <div class="row">

                <div>
                  <strong>${esc(a.name)}</strong>
                  <span class="muted">
                    ${esc(a.role)} • ${esc(a.phone)}
                  </span>
                </div>

                ${
                  current && current.id === a.id
                    ? `<span class="badge ok">
                         Active
                       </span>`
                    : `
                      <button class="btn alt"
                        onclick="switchAccount('${a.id}')">
                        Switch
                      </button>
                    `
                }

              </div>
            `).join("")
            : `
              <p class="muted">
                No saved accounts.
              </p>
            `
        }

        <div style="margin-top:16px">
          <button class="btn"
            onclick="renderLogin()">
            + Add Another Account
          </button>
        </div>

      </div>
    `;
  }

  function switchAccount(id) {
    const user = getUsers().find(u => u.id === id);

    if (!user) return;

    loginUser(user);
    render();
  }

  /* ATTENDANCE */

  function renderAttendance() {
    const user = currentUser();

    if (user.role === "Student") {
      return renderStudentAttendance();
    }

    return renderStaffAttendance();
  }

  function renderStudentAttendance() {
    const user = currentUser();

    const records = data("attendance", [])
      .filter(a => a.studentId === user.id)
      .sort((a, b) => b.date.localeCompare(a.date));

    const present = records.filter(a => a.status === "Present").length;
    const total = records.length;
    const percentage =
      total ? Math.round((present / total) * 100) : 0;

    const ptm = data("ptm", [])
      .filter(x => x.studentId === user.id)
      .sort((a, b) => b.date.localeCompare(a.date));

    return `
      <div class="grid">

        <div class="card">
          <div class="muted">Overall Attendance</div>
          <div class="num">${percentage}%</div>
          <span class="badge">
            ${present}/${total} Present
          </span>
        </div>

        <div class="card">
          <div class="muted">PTM Attendance</div>
          <div class="num">${ptm.length}</div>
          <span class="badge">PTM Records</span>
            <span>Phone</span>
          <strong>${esc(u.phone)}</strong>
        </div>
        <div class="row">
          <span>School</span>
          <strong>${esc(SCHOOL.name)}</strong>
        </div>
        ${u.class ? `
          <div class="row">
            <span>Class / Section</span>
            <strong>${esc(u.class)} - ${esc(u.section)}</strong>
          </div>
        ` : ""}
      </div>
    `;
  }

  function renderSettings(){
    const s = read(K.settings,{
      notifications:true,
      language:"English"
    });

    const theme = read(K.theme,"system");

    return `
      <div class="grid2">

        <div class="card">
          <h2>Appearance</h2>

          <div class="form">
            <button class="btn ghost"
              onclick="setTheme('light')">
              ☀️ White
            </button>

            <button class="btn ghost"
              onclick="setTheme('dark')">
              🌙 Dark
            </button>

            <button class="btn ghost"
              onclick="setTheme('system')">
              📱 System Default
            </button>

            <p class="muted">
              Current: ${esc(theme)}
            </p>
          </div>
        </div>

        <div class="card">
          <h2>Notifications</h2>

          <button class="btn"
            onclick="toggleNotifications()">
            ${s.notifications
              ? "🔔 Notifications ON"
              : "🔕 Notifications OFF"}
          </button>
        </div>

        <div class="card">
          <h2>Language</h2>

          <select class="input"
            onchange="setLanguage(this.value)">
            <option ${s.language==="English"?"selected":""}>
              English
            </option>
            <option ${s.language==="Hindi"?"selected":""}>
              Hindi
            </option>
          </select>
        </div>

        <div class="card">
          <h2>About</h2>
          <p class="muted">
            EduConnect<br>
            Smart School Management
          </p>
          <span class="badge">Prototype v8</span>
        </div>

      </div>
    `;
  }
  function setTheme(theme){
    write(K.theme,theme);
    applyTheme();
    renderPage();
  }

  function applyTheme(){
    const theme = read(K.theme,"system");
    let dark = theme === "dark";

    if(theme === "system"){
      dark = window.matchMedia &&
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
    }

    document.body.classList.toggle("dark",dark);
  }

  function toggleNotifications(){
    const s = read(K.settings,{
      notifications:true,
      language:"English"
    });

    s.notifications = !s.notifications;
    write(K.settings,s);
    renderPage();
  }

  function setLanguage(language){
    const s = read(K.settings,{
      notifications:true,
      language:"English"
    });

    s.language = language;
    write(K.settings,s);
    renderPage();
  }

  function renderAccounts(){
    const accounts = read(K.accounts,[]);
    const current = currentUser();

    return `
      <div class="card">
        <div class="head">
          <h2>Multiple Accounts</h2>

          <button class="btn"
            onclick="go('dashboard')">
            Dashboard
          </button>
        </div>

        ${accounts.length
          ? accounts.map(a => `
            <div class="row">
              <div>
                <strong>${esc(a.name)}</strong>
                <span class="muted">
                  ${esc(a.role)} • ${esc(a.phone)}
                </span>
              </div>

              ${
                current && current.id === a.id
                ? `<span class="badge ok">Active</span>`
                : `<button class="btn alt"
                    onclick="switchAccount('${a.id}')">
                    Switch
                  </button>`
              }
            </div>
          `).join("")
          : `<p class="muted">
               No saved accounts
             </p>`
        }
      </div>
    `;
  }

  function switchAccount(id){
    const user = getUsers()
      .find(u => u.id === id);

    if(!user) return;

    loginUser(user);
    render();
                    }
    function renderPage(){
    const box = document.getElementById("content");
    if(!box) return;

    if(["dashboard","profile","settings","accounts"]
      .includes(STATE.page)){
      const map = {
        dashboard:renderDashboard,
        profile:renderProfile,
        settings:renderSettings,
        accounts:renderAccounts
      };
      box.innerHTML = map[STATE.page]();
      return;
    }

    box.innerHTML = featurePage(STATE.page);
  }

  function featurePage(page){
    const names = {
      attendance:"Attendance",
      homework:"Homework",
      notices:"Notices",
      results:"Results",
      notifications:"Notifications",
      contacts:"Teacher Contacts",
      exams:"Exam Schedule",
      fees:"Fees",
      leave:"Leave Application",
      events:"School Events",
      feedback:"Feedback",
      school:"School Management"
    };

    const title = names[page] || "Feature";

    return `
      <div class="card">
        <div class="head">
          <h2>${title}</h2>
          <button class="btn alt"
            onclick="go('dashboard')">
            ← Dashboard
          </button>
        </div>

        <div class="row">
          <div>
            <strong>${title}</strong>
            <span class="muted">
              EduConnect ${title} section
            </span>
          </div>
          <span class="badge">Ready</span>
        </div>

        <div style="margin-top:20px">
          ${
            page === "attendance"
            ? `<button class="btn"
                onclick="demoAction('Attendance saved')">
                Mark / View Attendance
              </button>`
            : page === "homework"
            ? `<button class="btn"
                onclick="demoAction('Homework opened')">
                + Add Homework
              </button>`
            : page === "notices"
            ? `<button class="btn"
                onclick="demoAction('Notice created')">
                + Create Notice
              </button>`
            : page === "results"
            ? `<button class="btn"
                onclick="demoAction('Result section opened')">
                + Add Result
              </button>`
            : page === "leave"
            ? `<button class="btn"
                onclick="demoAction('Leave application opened')">
                Apply Leave
              </button>`
            : page === "feedback"
            ? `<button class="btn"
                onclick="demoAction('Feedback form opened')">
                Give Feedback
              </button>`
            : `<button class="btn"
                onclick="demoAction('${title} opened')">
                Open ${title}
              </button>`
          }
        </div>
      </div>
    `;
  }

  function demoAction(message){
    alert(message);
  }

  applyTheme();

  if(window.matchMedia){
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).addEventListener("change",() => {
      if(read(K.theme,"system") === "system"){
        applyTheme();
      }
    });
  }

    window.demoLogin = demoLogin;
  window.handleLogin = handleLogin;
  window.logoutUser = logoutUser;
  window.toggleMenu = toggleMenu;
  window.go = go;
  window.setTheme = setTheme;
  window.toggleNotifications = toggleNotifications;
  window.setLanguage = setLanguage;
  window.switchAccount = switchAccount;
  window.demoAction = demoAction;

  render();

})();
