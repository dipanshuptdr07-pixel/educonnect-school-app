/* EDUCONNECT FINAL v10 - PART 1/10 */

const KEY = "educonnect_v10";

const state = JSON.parse(
  localStorage.getItem(KEY) || "null"
) || {
  theme: "system",
  notifications: true,
  language: "English",
  current: null,
  accounts: [],

  school: {
    code: "EDU001",
    name: "EduConnect Demo School",
    classes: ["9","10","11","12"],
    sections: ["A","B"],
    subjects: [
      "Physics",
      "Chemistry",
      "Mathematics",
      "English",
      "Computer Science"
    ]
  },

  users: [
    {
      id:"s1",
      role:"Student",
      name:"Aarav Sharma",
      phone:"9000000001",
      class:"11",
      section:"A",
      schoolCode:"EDU001"
    },
    {
      id:"s2",
      role:"Student",
      name:"Riya Patel",
      phone:"9000000002",
      class:"11",
      section:"A",
      schoolCode:"EDU001"
    },
    {
      id:"t1",
      role:"Teacher",
      name:"Rahul Sir",
      phone:"9000000011",
      subject:"Physics",
      classes:["11"],
      sections:["A"],
      schoolCode:"EDU001"
    },
    {
      id:"t2",
      role:"Teacher",
      name:"Neha Ma’am",
      phone:"9000000012",
      subject:"Chemistry",
      classes:["11"],
      sections:["A"],
      schoolCode:"EDU001"
    },
    {
      id:"a1",
      role:"Admin",
      name:"School Admin",
      phone:"9000000099",
      schoolCode:"EDU001"
    }
  ],

  homework: [],
  attendance: [],
  notices: [],
  results: [],
  ptm: [],
  exams: [],
  fees: [],
  leaves: [],
  events: [],
  feedback: [],
  notifications: []
};

let page = "home";
let menuOpen = false;

function save(){
  localStorage.setItem(KEY,JSON.stringify(state));
}

function uid(prefix){
  return prefix + Date.now().toString(36);
}

function esc(value=""){
  return String(value).replace(
    /[&<>'"]/g,
    c => ({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      "'":"&#39;",
      '"':"&quot;"
    }[c])
  );
}

function current(){
  return state.users.find(
    u => u.id === state.current
  ) || null;
}

function isStaff(){
  return ["Teacher","Admin"].includes(
    current()?.role
  );
}

function isAdmin(){
  return current()?.role === "Admin";
}

function cls(){
  return current()?.class || "11";
}

function sec(){
  return current()?.section || "A";
}

function setPage(p){
  page = p;
  menuOpen = false;
  render();
}

function toast(message){
  alert(message);
}

function visibleHW(){
  const u = current();

  return state.homework.filter(h =>
    h.published &&
    (
      isStaff() ||
      (
        h.class === u?.class &&
        h.section === u?.section
      )
    )
  );
}
/* EDUCONNECT FINAL v10 - PART 2/10 */

function login(){

  document.getElementById("app").innerHTML = `
    <div class="login">
      <div class="loginbox">

        <img src="./icon-192.png">

        <h1>EduConnect</h1>

        <p class="muted">
          School Management Platform
        </p>

        <div class="form">

          <input
            id="phone"
            class="input"
            placeholder="Enter phone number"
            inputmode="numeric"
          >

          <button
            class="btn"
            onclick="loginGo()">
            Continue
          </button>

          <button
            class="btn alt"
            onclick="demoLogin()">
            Try Demo Account
          </button>

        </div>

        <p class="muted" style="margin-top:16px">
          Demo OTP: 1234
        </p>

      </div>
    </div>
  `;

}


function loginGo(){

  const phone =
    document.getElementById("phone")?.value.trim();

  const user =
    state.users.find(
      u => u.phone === phone
    );

  if(!user){

    toast("Phone number not found");
    return;

  }

  state.current = user.id;
  save();
  render();

}


function demoLogin(){

  state.current = "s1";

  save();

  render();

}


function logout(){

  state.current = null;

  page = "home";

  save();

  login();

}


function toggleMenu(){

  menuOpen = !menuOpen;

  render();

}


function card(title,value,icon=""){

  return `
    <div class="card">

      <div class="muted">
        ${icon} ${esc(title)}
      </div>

      <div class="num">
        ${esc(value)}
      </div>

    </div>
  `;

}


function pageTitle(){

  const titles = {

    home:"Dashboard",
    attendance:"Attendance",
    homework:"Homework",
    notices:"Notices",
    results:"Results",
    ptm:"PTM",
    contacts:"Teacher Contacts",
    notifications:"Notifications",
    exams:"Exam Schedule",
    fees:"Fees",
    leave:"Leave",
    events:"School Events",
    feedback:"Feedback",
    study:"Study AI",
    profile:"Profile",
    settings:"Settings",
    accounts:"Accounts",
    school:"School Management"

  };

  return titles[page] || "EduConnect";

}


function shell(content){

  const u = current();

  if(!u){

    login();

    return;

  }

  document.getElementById("app").innerHTML = `

    <aside class="side ${menuOpen ? "open" : ""}">

      <div class="brand">

        <img src="./icon-192.png">

        <span>EduConnect</span>

      </div>

      <div class="nav">

        ${nav()}

        <button onclick="setPage('profile')">
          👤 Profile
        </button>

        <button onclick="setPage('settings')">
          ⚙ Settings
        </button>

        <button onclick="logout()">
          ↪ Logout
        </button>

      </div>

    </aside>


    <main class="main">

      <div class="top">

        <div style="display:flex;gap:10px;align-items:center">

          <button
            class="mobile"
            onclick="toggleMenu()">
            ☰
          </button>

          <div>

            <h1>${pageTitle()}</h1>

            <div class="muted">
              ${esc(u.name)} • ${esc(u.role)}
            </div>

          </div>

        </div>


        <div class="pill">

          <div class="avatar">
            ${esc(u.name[0] || "U")}
          </div>

          <span>${esc(u.name)}</span>

        </div>

      </div>


      ${content}

    </main>
  `;

}
function homePage(){

  const u = current();

  if(isStaff()) return staffHome();

  const hw = visibleHW().length;

  const notices = state.notices.filter(n =>
    n.published &&
    n.class === u.class &&
    n.section === u.section
  ).length;

  return `
    <div class="grid">

      ${card("Homework",hw,"📚")}

      ${card("Notices",notices,"🔔")}

      ${card("Exams",state.exams.length,"🗓")}

      ${card("Events",state.events.length,"🎉")}

    </div>

    <div class="head">
      <h2>Quick Access</h2>
    </div>

    <div class="grid2">

      <div
        class="card premium-card"
        onclick="setPage('homework')">

        <div class="card-art">
          <span>📚</span>
        </div>

        <div class="card-title">
          Homework
        </div>

        <div class="card-open">
          View your assignments →
        </div>

      </div>


      <div
        class="card premium-card"
        onclick="setPage('study')">

        <div class="card-art">
          <span>🤖</span>
        </div>

        <div class="card-title">
          Study AI
        </div>

        <div class="card-open">
          Get study help →
        </div>

      </div>

    </div>
  `;
}


function staffHome(){

  const students =
    state.users.filter(
      u => u.role === "Student"
    ).length;

  const homework =
    state.homework.length;

   const notices =
    state.notices.length;

  const exams =
    state.exams.length;

  return `
    <div class="grid">

      ${card("Students",students,"👨‍🎓")}

      ${card("Homework",homework,"📚")}

      ${card("Notices",notices,"🔔")}

      ${card("Exams",exams,"🗓")}

    </div>

    <div class="head">
      <h2>Management</h2>
    </div>

    <div class="grid2">

      <div
        class="card premium-card"
        onclick="setPage('attendance')">

        <div class="card-art">
          <span>✓</span>
        </div>

        <div class="card-title">
          Attendance
        </div>

        <div class="card-open">
          Mark attendance →
        </div>

      </div>


      <div
        class="card premium-card"
        onclick="setPage('homework')">

        <div class="card-art">
          <span>📚</span>
        </div>

        <div class="card-title">
          Homework
        </div>

        <div class="card-open">
          Manage homework →
        </div>

      </div>


      <div
        class="card premium-card"
        onclick="setPage('notices')">

        <div class="card-art">
          <span>🔔</span>
        </div>

        <div class="card-title">
          Notices
        </div>

        <div class="card-open">
          Publish notices →
        </div>

      </div>


      <div
        class="card premium-card"
        onclick="setPage('results')">

        <div class="card-art">
          <span>📊</span>
        </div>

        <div class="card-title">
          Results
        </div>

        <div class="card-open">
          Manage results →
        </div>

      </div>

    </div>
  `;
}
function attendancePage(){

  const u = current();

  if(!isStaff()){
    return `
      <div class="card">
        <h2>My Attendance</h2>
        <p class="muted">
          Your attendance records will appear here.
        </p>
      </div>
    `;
  }

  const students = state.users.filter(
    x => x.role === "Student"
  );

  return `
    <div class="card">

      <h2>Mark Attendance</h2>

      ${students.map(s => `
        <div class="row">

          <div>
            <strong>${esc(s.name)}</strong>
            <span class="muted">
              Class ${s.class}-${s.section}
            </span>
          </div>

          <button
            class="btn"
            onclick="markAttendance('${s.id}')">
            Present
          </button>

        </div>
      `).join("")}

    </div>
  `;
}


function markAttendance(studentId){

  state.attendance.push({

    id: uid("att_"),
    studentId,
    date: new Date()
      .toISOString()
      .slice(0,10),
    status: "Present"

  });

  save();

  toast("Attendance marked");

  render();
}
function homeworkPage(){

  const list = visibleHW();

  return `
    <div class="head">

      <h2>Homework</h2>

      ${
        isStaff()
        ? `<button class="btn"
             onclick="addHomework()">
             + Add
           </button>`
        : ""
      }

    </div>

    <div class="grid2">

      ${
        list.length
        ? list.map(h => `

          <div class="card">

            <span class="badge">
              ${esc(h.subject)}
            </span>

            <h3>
              ${esc(h.title)}
            </h3>

            <p class="muted">
              ${esc(h.description)}
            </p>

            <small>
              Due: ${esc(h.due)}
            </small>

          </div>

        `).join("")
        : `
          <div class="card">
            No homework available.
          </div>
        `
      }

    </div>
  `;
}


function addHomework(){

  const title =
    prompt("Homework title:");

  if(!title) return;

  const description =
    prompt("Description:") || "";

  state.homework.push({

    id: uid("hw_"),
    title,
    description,
    subject: current().subject || "General",
    class: "11",
    section: "A",
    due: "2026-10-10",
    teacher: current().name,
    files: [],
    published: true,
    submissions: {}

  });

  save();

  toast("Homework added");

  render();
}
function noticesPage(){

  const list = state.notices.filter(n =>
    isStaff() ||
    (
      n.class === cls() &&
      n.section === sec()
    )
  );

  return `
    <div class="head">

      <h2>Notices</h2>

      ${
        isStaff()
        ? `<button class="btn"
             onclick="addNotice()">
             + Add
           </button>`
        : ""
      }

    </div>

    <div class="card">

      ${
        list.length
        ? list.map(n => `
          <div class="row">

            <div>
              <strong>
                ${esc(n.title)}
              </strong>

              <span class="muted">
                ${esc(n.body)}
              </span>
            </div>

          </div>
        `).join("")
        : "No notices yet."
      }

    </div>
  `;
}


function addNotice(){

  const title = prompt("Notice title:");

  if(!title) return;

  const body =
    prompt("Notice message:") || "";

  state.notices.push({

    id: uid("n_"),
    title,
    body,
    class: "11",
    section: "A",
    author: current().name,
    date: new Date()
      .toISOString()
      .slice(0,10),
    published: true,
    readBy: []

  });

  save();

  toast("Notice published");

  render();
}
function resultsPage(){

  const list = state.results.filter(r =>
    isStaff() ||
    r.studentId === current().id
  );

  return `
    <div class="head">

      <h2>Results</h2>

      ${
        isStaff()
        ? `<button class="btn"
             onclick="addResult()">
             + Add
           </button>`
        : ""
      }

    </div>

    <div class="card">

      ${
        list.length
        ? list.map(r => `

          <div class="row">

            <div>
              <strong>
                ${esc(r.subject)}
              </strong>

              <span class="muted">
                ${esc(r.exam)}
              </span>
            </div>

            <b>
              ${r.marks}/${r.total}
            </b>

          </div>

        `).join("")
        : "No results available."
      }

    </div>
  `;
}


function addResult(){

  const subject =
    prompt("Subject:");

  if(!subject) return;

  const marks =
    Number(prompt("Marks:") || 0);

  const total =
    Number(prompt("Total marks:") || 100);

  state.results.push({

    id: uid("r_"),
    studentId: "s1",
    subject,
    exam: "Unit Test",
    marks,
    total

  });

  save();

  toast("Result added");

  render();
}
function contactsPage(){

  const teachers = state.users.filter(
    u => u.role === "Teacher"
  );

  return `
    <div class="card">

      <h2>Teacher Contacts</h2>

      ${teachers.map(t => `

        <div class="row">

          <div>
            <strong>
              ${esc(t.name)}
            </strong>

            <span class="muted">
              ${esc(t.subject || "Teacher")}
            </span>
          </div>

          <a
            class="btn"
            href="tel:${t.phone}">
            Call
          </a>

        </div>

      `).join("")}

    </div>
  `;
}


function notificationsPage(){

  return `
    <div class="card">

      <h2>Notifications</h2>

      ${
        state.notifications.length
        ? state.notifications.map(n => `
          <div class="row">
            <strong>
              ${esc(n.title || n)}
            </strong>
          </div>
        `).join("")
        : `
          <p class="muted">
            No new notifications.
          </p>
        `
      }

    </div>
  `;
}
function examsPage(){

  return `
    <div class="card">

      <h2>Exam Schedule</h2>

      ${state.exams.map(e => `

        <div class="row">

          <div>
            <strong>
              ${esc(e.title)}
            </strong>

            <span class="muted">
              ${esc(e.subject)}
            </span>
          </div>

          <b>
            ${esc(e.date)}
          </b>

        </div>

      `).join("")}

    </div>
  `;
}


function feesPage(){

  const list = state.fees.filter(
    f => isStaff() ||
    f.studentId === current().id
  );

  return `
    <div class="card">

      <h2>Fees</h2>

      ${list.map(f => `

        <div class="row">

          <div>
            <strong>${esc(f.title)}</strong>
            <span class="muted">
              Due: ${esc(f.due)}
            </span>
          </div>

          <b>
            ₹${f.amount}
          </b>

        </div>

      `).join("")}

    </div>
  `;
}
function leavePage(){

  return `
    <div class="card">

      <h2>Leave Application</h2>

      <textarea
        id="leaveReason"
        class="textarea"
        placeholder="Reason for leave">
      </textarea>

      <br><br>

      <button
        class="btn"
        onclick="applyLeave()">
        Submit Leave
      </button>

    </div>
  `;
}


function applyLeave(){

  const reason =
    document.getElementById("leaveReason")
      ?.value.trim();

  if(!reason){

    toast("Enter reason");

    return;
  }

  state.leaves.push({

    id: uid("l_"),
    studentId: current().id,
    reason,
    status: "Pending",
    date: new Date()
      .toISOString()
      .slice(0,10)

  });

  save();

  toast("Leave submitted");

  render();
}


function eventsPage(){

  return `
    <div class="card">

      <h2>School Events</h2>

      ${state.events.map(e => `

        <div class="row">

          <div>
            <strong>
              ${esc(e.title)}
            </strong>

            <span class="muted">
              ${esc(e.description)}
            </span>
          </div>

          <b>${esc(e.date)}</b>

        </div>

      `).join("")}

    </div>
  `;
}
function feedbackPage(){

  return `
    <div class="card">

      <h2>Feedback</h2>

      <textarea
        id="feedbackText"
        class="textarea"
        placeholder="Write your feedback">
      </textarea>

      <br><br>

      <button
        class="btn"
        onclick="sendFeedback()">
        Send Feedback
      </button>

    </div>
  `;
}


function sendFeedback(){

  const text =
    document.getElementById("feedbackText")
      ?.value.trim();

  if(!text){

    toast("Write something first");

    return;
  }

  state.feedback.push({

    id: uid("fb_"),
    userId: current().id,
    text,
    date: new Date()
      .toISOString()
      .slice(0,10)

  });

  save();

  toast("Feedback sent");

  render();
}


function studyPage(){

  return `
    <div class="card">

      <h2>Study AI 🤖</h2>

      <p class="muted">
        Ask a study question.
      </p>

      <textarea
        id="studyQuestion"
        class="textarea"
        placeholder="Type your question...">
      </textarea>

      <br><br>

      <button
        class="btn"
        onclick="studyAnswer()">
        Ask AI
      </button>

      <div id="studyAnswer"></div>

    </div>
  `;
}


function studyAnswer(){

  const q =
    document.getElementById("studyQuestion")
      ?.value.trim();

  if(!q){

    toast("Enter a question");

    return;
  }

  document.getElementById("studyAnswer").innerHTML = `
    <div class="card" style="margin-top:15px">
      <b>Study AI</b>
      <p>
        This is the EduConnect AI demo.
        Real AI can be connected later.
      </p>
    </div>
  `;
}
function profilePage(){

  const u = current();

  return `
    <div class="card">

      <h2>My Profile</h2>

      <div class="row">
        <strong>Name</strong>
        <span>${esc(u.name)}</span>
      </div>

      <div class="row">
        <strong>Role</strong>
        <span>${esc(u.role)}</span>
      </div>

      <div class="row">
        <strong>Phone</strong>
        <span>${esc(u.phone)}</span>
      </div>

      ${
        u.class
        ? `
          <div class="row">
            <strong>Class</strong>
            <span>${esc(u.class)}-${esc(u.section)}</span>
          </div>
        `
        : ""
      }

    </div>
  `;
}


function settingsPage(){

  return `
    <div class="card">

      <h2>Settings</h2>

      <div class="row">

        <strong>Dark Mode</strong>

        <button
          class="btn alt"
          onclick="toggleTheme()">
          Toggle
        </button>

      </div>

      <div class="row">

        <strong>Notifications</strong>

        <button
          class="btn alt"
          onclick="toggleNotifications()">
          ${state.notifications ? "ON" : "OFF"}
        </button>

      </div>

    </div>
  `;
}


function toggleTheme(){

  state.theme =
    state.theme === "dark"
    ? "light"
    : "dark";

  document.body.classList.toggle(
    "dark",
    state.theme === "dark"
  );

  save();
  render();
}


function toggleNotifications(){

  state.notifications =
    !state.notifications;

  save();
  render();
}
function accountsPage(){

  return `
    <div class="card">

      <h2>Accounts</h2>

      ${state.accounts.map(a => `

        <div class="row">

          <div>
            <strong>
              ${esc(a.name)}
            </strong>

            <span class="muted">
              ${esc(a.role)}
            </span>
          </div>

          <button
            class="btn alt"
            onclick="switchAccount('${a.id}')">
            Switch
          </button>

        </div>

      `).join("")}

      <br>

      <button
        class="btn"
        onclick="addAccount()">
        + Add Account
      </button>

    </div>
  `;
}


function switchAccount(id){

  if(!state.users.some(u => u.id === id))
    return;

  state.current = id;

  save();

  render();
}
function accountsPage(){

  return `
    <div class="card">

      <h2>Accounts</h2>

      ${state.accounts.map(a => `

        <div class="row">

          <div>
            <strong>
              ${esc(a.name)}
            </strong>

            <span class="muted">
              ${esc(a.role)}
            </span>
          </div>

          <button
            class="btn alt"
            onclick="switchAccount('${a.id}')">
            Switch
          </button>

        </div>

      `).join("")}

      <br>

      <button
        class="btn"
        onclick="addAccount()">
        + Add Account
      </button>

    </div>
  `;
}


function switchAccount(id){

  if(!state.users.some(u => u.id === id))
    return;

  state.current = id;

  save();

  render();
}


function addAccount(){

  const phone =
    prompt("Demo account phone:");

  const user =
    state.users.find(
      u => u.phone === phone
    );

  if(!user){

    toast("Account not found");

    return;
  }

  if(!state.accounts.some(
    a => a.id === user.id
  )){

    state.accounts.push(user);

  }

  state.current = user.id;

  save();

  render();
}
function ptmPage(){

  return `
    <div class="card">

      <h2>Parent-Teacher Meeting</h2>

      ${
        state.ptm.length
        ? state.ptm.map(p => `
          <div class="row">

            <div>
              <strong>${esc(p.title)}</strong>
              <span class="muted">
                ${esc(p.date)}
              </span>
            </div>

          </div>
        `).join("")
        : `
          <p class="muted">
            No PTM scheduled.
          </p>
        `
      }

      ${
        isStaff()
        ? `
          <br>
          <button
            class="btn"
            onclick="addPTM()">
            + Schedule PTM
          </button>
        `
        : ""
      }

    </div>
  `;
}


function addPTM(){

  const title =
    prompt("PTM title:");

  if(!title) return;

  const date =
    prompt("PTM date:");

  state.ptm.push({

    id: uid("ptm_"),
    title,
    date

  });

  save();

  toast("PTM scheduled");

  render();
}


function render(){

  if(!current()){

    login();

    return;
  }

  let content = "";

  if(page === "home")
    content = homePage();

  else if(page === "attendance")
    content = attendancePage();

  else if(page === "homework")
    content = homeworkPage();

  else if(page === "notices")
    content = noticesPage();

  else if(page === "results")
    content = resultsPage();

  else if(page === "ptm")
    content = ptmPage();

  else if(page === "contacts")
    content = contactsPage();

  else if(page === "notifications")
    content = notificationsPage();

  else if(page === "exams")
    content = examsPage();

  else if(page === "fees")
    content = feesPage();

  else if(page === "leave")
    content = leavePage();

  else if(page === "events")
    content = eventsPage();

  else if(page === "feedback")
    content = feedbackPage();

  else if(page === "study")
    content = studyPage();

  else if(page === "profile")
    content = profilePage();

  else if(page === "settings")
    content = settingsPage();

  else if(page === "accounts")
    content = accountsPage();

  shell(content);
}
/* ================================
   EDUCONNECT FINAL v10
   PART 15/15 — START APP
================================ */

function applyTheme(){

  document.body.classList.toggle(
    "dark",
    state.theme === "dark"
  );

}


function startApp(){

  applyTheme();

  if(state.current){

    render();

  }else{

    login();

  }

}


/* Start EduConnect */

startApp();

   
