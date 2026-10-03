const KEY = "educonnect_v11";

const seed = {
  schools: [
    {
      id: "sch1",
      code: "EDU001",
      name: "EduConnect Demo School",
      city: "Indore",
      classes: ["9", "10", "11", "12"],
      sections: ["A", "B"],
      subjects: ["Physics", "Chemistry", "Mathematics", "English"]
    },
    {
      id: "sch2",
      code: "EDU002",
      name: "Sunrise Public School",
      city: "Khargone",
      classes: ["9", "10", "11", "12"],
      sections: ["A", "B"],
      subjects: ["Physics", "Chemistry", "Mathematics", "English"]
    }
  ],

  users: [
    {
      id: "a1",
      schoolId: "sch1",
      role: "admin",
      name: "School Admin",
      phone: "9000000099",
      className: "",
      section: ""
    },
    {
      id: "t1",
      schoolId: "sch1",
      role: "teacher",
      name: "Physics Teacher",
      phone: "9000000011",
      subject: "Physics",
      className: "11",
      section: "A"
    },
    {
      id: "t2",
      schoolId: "sch1",
      role: "teacher",
      name: "Mathematics Teacher",
      phone: "9000000012",
      subject: "Mathematics",
      className: "11",
      section: "A"
    },
    {
      id: "s1",
      schoolId: "sch1",
      role: "student",
      name: "Aarav",
      phone: "9000000001",
      className: "11",
      section: "A"
    },
    {
      id: "s2",
      schoolId: "sch1",
      role: "student",
      name: "Vihaan",
      phone: "9000000002",
      className: "11",
      section: "B"
    },

    {
      id: "a2",
      schoolId: "sch2",
      role: "admin",
      name: "Sunrise Admin",
      phone: "9000000199",
      className: "",
      section: ""
    },
    {
      id: "t3",
      schoolId: "sch2",
      role: "teacher",
      name: "Sunrise Teacher",
      phone: "9000000191",
      subject: "Physics",
      className: "11",
      section: "A"
    },
    {
      id: "s3",
      schoolId: "sch2",
      role: "student",
      name: "Kabir",
      phone: "9000000101",
      className: "11",
      section: "A"
    }
  ],

  homework: [
    {
      id: "h1",
      schoolId: "sch1",
      title: "Units & Dimensions Questions",
      subject: "Physics",
      className: "11",
      section: "A",
      due: "2026-10-05",
      teacher: "Physics Teacher",
      description: "Complete the assigned numerical questions."
    }
  ],

  notices: [
    {
      id: "n1",
      schoolId: "sch1",
      title: "Welcome to EduConnect",
      message: "School notices will appear here.",
      date: "2026-10-01",
      className: "",
      section: ""
    }
  ],

  results: [
    {
      id: "r1",
      schoolId: "sch1",
      studentId: "s1",
      exam: "Unit Test 1",
      subject: "Physics",
      marks: 82,
      max: 100
    }
  ],

  attendance: [
    {
      id: "at1",
      schoolId: "sch1",
      studentId: "s1",
      date: "2026-10-01",
      status: "Present"
    }
  ],

  exams: [
    {
      id: "e1",
      schoolId: "sch1",
      title: "Unit Test 1",
      subject: "Physics",
      className: "11",
      section: "A",
      date: "2026-10-10"
    }
  ],

  fees: [
    {
      id: "f1",
      schoolId: "sch1",
      studentId: "s1",
      title: "Quarterly Fee",
      amount: 5000,
      status: "Pending"
    }
  ],

  leaves: [],
  events: [],
  ptm: [],
  feedback: [],
  notifications: []
};

let state = loadState();
let currentUserId =
  localStorage.getItem("educonnect_current_user") || null;

let currentPage = "dashboard";
function loadState() {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {}

  localStorage.setItem(KEY, JSON.stringify(seed));
  return JSON.parse(JSON.stringify(seed));
}

function saveState() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

function uid(prefix) {
  return (
    prefix +
    "_" +
    Date.now() +
    "_" +
    Math.random().toString(36).slice(2, 7)
  );
}

function esc(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function me() {
  return state.users.find(u => u.id === currentUserId) || null;
}

function schoolOfUser(user) {
  if (!user) return null;

  return (
    state.schools.find(s => s.id === user.schoolId) ||
    null
  );
}

function mySchool() {
  return schoolOfUser(me());
}

function sameSchool(item) {
  const user = me();

  return (
    !!user &&
    !!item &&
    item.schoolId === user.schoolId
  );
}

function schoolUsers() {
  return state.users.filter(u => sameSchool(u));
}

function roleLabel(role) {
  if (role === "admin") return "Admin";
  if (role === "teacher") return "Teacher";
  return "Student";
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(date + "T00:00:00").toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }
  );
}

function notify(message) {
  alert(message);
}

function startApp() {
  render();
}

function login() {
  const code =
    document.getElementById("schoolCode")?.value
      .trim()
      .toUpperCase();

  const phone =
    document.getElementById("phone")?.value.trim();

  const school = state.schools.find(
    s => s.code === code
  );

  if (!school) {
    notify("Invalid School Code.");
    return;
  }

  const user = state.users.find(
    u =>
      u.schoolId === school.id &&
      u.phone === phone
  );

  if (!user) {
    notify("Account not found in this school.");
    return;
  }

  currentUserId = user.id;

  localStorage.setItem(
    "educonnect_current_user",
    user.id
  );

  currentPage = "dashboard";

  render();
}

function demoLogin() {
  document.getElementById("schoolCode").value =
    "EDU001";

  document.getElementById("phone").value =
    "9000000099";

  login();
}

function logout() {
  currentUserId = null;

  localStorage.removeItem(
    "educonnect_current_user"
  );

  currentPage = "dashboard";

  render();
}

function switchAccount(id) {
  const user = state.users.find(
    u => u.id === id
  );

  if (!user) return;

  currentUserId = user.id;

  localStorage.setItem(
    "educonnect_current_user",
    user.id
  );

  currentPage = "dashboard";

  render();
}

function nav(page) {
  currentPage = page;
  render();
}

function addUser() {
  const role =
    document.getElementById("newUserRole").value;

  const name =
    document.getElementById("newUserName").value.trim();

  const phone =
    document.getElementById("newUserPhone").value.trim();

  const className =
    document.getElementById("newUserClass").value;

  const section =
    document.getElementById("newUserSection").value;

  if (!name || !phone) {
    notify("Name and phone are required.");
    return;
  }

  if (
    schoolUsers().some(
      u => u.phone === phone
    )
  ) {
    notify(
      "This phone number already exists in your school."
    );
    return;
  }

  state.users.push({
    id: uid("u"),
    schoolId: me().schoolId,
    role,
    name,
    phone,

    className:
      role === "student"
        ? className
        : "",

    section:
      role === "student"
        ? section
        : "",

    subject:
      role === "teacher"
        ? (
            document.getElementById(
              "newUserSubject"
            )?.value || ""
          )
        : ""
  });

  saveState();

  notify("Account created successfully.");

  render();
}

function removeUser(id) {
  const user = state.users.find(
    u => u.id === id
  );

  if (!user || !sameSchool(user)) return;

  if (user.id === me().id) return;

  if (
    !confirm(
      "Remove this account from your school?"
    )
  ) {
    return;
  }

  state.users =
    state.users.filter(
      u => u.id !== id
    );

  saveState();

  render();
}

function addHomework() {
  const title =
    document.getElementById("hwTitle")
      .value.trim();

  const subject =
    document.getElementById("hwSubject")
      .value;

  const className =
    document.getElementById("hwClass")
      .value;

  const section =
    document.getElementById("hwSection")
      .value;

  const due =
    document.getElementById("hwDue")
      .value;

  const description =
    document.getElementById("hwDescription")
      .value.trim();

  if (!title || !due) {
    notify(
      "Title and due date are required."
    );
    return;
  }

  state.homework.push({
    id: uid("h"),
    schoolId: me().schoolId,
    title,
    subject,
    className,
    section,
    due,
    teacher: me().name,
    description
  });

  saveState();

  notify("Homework added.");

  render();
}

function addNotice() {
  const title =
    document.getElementById("noticeTitle")
      .value.trim();

  const message =
    document.getElementById("noticeMessage")
      .value.trim();

  const className =
    document.getElementById("noticeClass")
      .value;

  const section =
    document.getElementById("noticeSection")
      .value;

  if (!title || !message) {
    notify(
      "Title and message are required."
    );
    return;
  }

  state.notices.push({
    id: uid("n"),
    schoolId: me().schoolId,
    title,
    message,
    className,
    section,
    date:
      new Date()
        .toISOString()
        .slice(0, 10)
  });

  saveState();

  notify("Notice published.");

  render();
    }
function addResult() {
  const studentId =
    document.getElementById("resultStudent").value;

  const exam =
    document.getElementById("resultExam")
      .value.trim();

  const subject =
    document.getElementById("resultSubject")
      .value;

  const marks =
    Number(
      document.getElementById("resultMarks").value
    );

  const max =
    Number(
      document.getElementById("resultMax").value
    );

  const student = schoolUsers().find(
    u =>
      u.id === studentId &&
      u.role === "student"
  );

  if (
    !student ||
    !exam ||
    Number.isNaN(marks) ||
    Number.isNaN(max)
  ) {
    notify(
      "Please fill all result details."
    );
    return;
  }

  state.results.push({
    id: uid("r"),
    schoolId: me().schoolId,
    studentId,
    exam,
    subject,
    marks,
    max
  });

  saveState();

  notify("Result saved.");

  render();
}

function addExam() {
  const title =
    document.getElementById("examTitle")
      .value.trim();

  const subject =
    document.getElementById("examSubject")
      .value;

  const className =
    document.getElementById("examClass")
      .value;

  const section =
    document.getElementById("examSection")
      .value;

  const date =
    document.getElementById("examDate")
      .value;

  if (!title || !date) {
    notify(
      "Exam title and date are required."
    );
    return;
  }

  state.exams.push({
    id: uid("e"),
    schoolId: me().schoolId,
    title,
    subject,
    className,
    section,
    date
  });

  saveState();

  notify("Exam added.");

  render();
}

function addFee() {
  const studentId =
    document.getElementById("feeStudent")
      .value;

  const title =
    document.getElementById("feeTitle")
      .value.trim();

  const amount =
    Number(
      document.getElementById("feeAmount")
        .value
    );

  const status =
    document.getElementById("feeStatus")
      .value;

  if (
    !studentId ||
    !title ||
    Number.isNaN(amount)
  ) {
    notify(
      "Please fill all fee details."
    );
    return;
  }

  state.fees.push({
    id: uid("f"),
    schoolId: me().schoolId,
    studentId,
    title,
    amount,
    status
  });

  saveState();

  notify("Fee record added.");

  render();
}

function addResult() {
  const studentId =
    document.getElementById("resultStudent").value;

  const exam =
    document.getElementById("resultExam")
      .value.trim();

  const subject =
    document.getElementById("resultSubject")
      .value;

  const marks =
    Number(
      document.getElementById("resultMarks").value
    );

  const max =
    Number(
      document.getElementById("resultMax").value
    );

  const student = schoolUsers().find(
    u =>
      u.id === studentId &&
      u.role === "student"
  );

  if (
    !student ||
    !exam ||
    Number.isNaN(marks) ||
    Number.isNaN(max)
  ) {
    notify(
      "Please fill all result details."
    );
    return;
  }

  state.results.push({
    id: uid("r"),
    schoolId: me().schoolId,
    studentId,
    exam,
    subject,
    marks,
    max
  });

  saveState();

  notify("Result saved.");

  render();
}

function addExam() {
  const title =
    document.getElementById("examTitle")
      .value.trim();

  const subject =
    document.getElementById("examSubject")
      .value;

  const className =
    document.getElementById("examClass")
      .value;

  const section =
    document.getElementById("examSection")
      .value;

  const date =
    document.getElementById("examDate")
      .value;

  if (!title || !date) {
    notify(
      "Exam title and date are required."
    );
    return;
  }

  state.exams.push({
    id: uid("e"),
    schoolId: me().schoolId,
    title,
    subject,
    className,
    section,
    date
  });

  saveState();

  notify("Exam added.");

  render();
}

function addFee() {
  const studentId =
    document.getElementById("feeStudent")
      .value;

  const title =
    document.getElementById("feeTitle")
      .value.trim();

  const amount =
    Number(
      document.getElementById("feeAmount")
        .value
    );

  const status =
    document.getElementById("feeStatus")
      .value;

  if (
    !studentId ||
    !title ||
    Number.isNaN(amount)
  ) {
    notify(
      "Please fill all fee details."
    );
    return;
  }

  state.fees.push({
    id: uid("f"),
    schoolId: me().schoolId,
    studentId,
    title,
    amount,
    status
  });

  saveState();

  notify("Fee record added.");

  render();
}

function addEvent() {
  const title =
    document.getElementById("eventTitle")
      .value.trim();

  const date =
    document.getElementById("eventDate")
      .value;

  const description =
    document.getElementById("eventDescription")
      .value.trim();

  if (!title || !date) {
    notify(
      "Event title and date are required."
    );
    return;
  }

  state.events.push({
    id: uid("ev"),
    schoolId: me().schoolId,
    title,
    date,
    description
  });

  saveState();

  notify("Event added.");

  render();
}

function addPTM() {
  const title =
    document.getElementById("ptmTitle")
      .value.trim();

  const date =
    document.getElementById("ptmDate")
      .value;

  const time =
    document.getElementById("ptmTime")
      .value;

  if (!title || !date || !time) {
    notify(
      "Please fill PTM details."
    );
    return;
  }

  state.ptm.push({
    id: uid("ptm"),
    schoolId: me().schoolId,
    title,
    date,
    time
  });

  saveState();

  notify("PTM added.");

  render();
}

function submitLeave() {
  const date =
    document.getElementById("leaveDate")
      .value;

  const reason =
    document.getElementById("leaveReason")
      .value.trim();

  if (!date || !reason) {
    notify(
      "Date and reason are required."
    );
    return;
  }

  state.leaves.push({
    id: uid("l"),
    schoolId: me().schoolId,
    studentId: me().id,
    date,
    reason,
    status: "Pending"
  });

  saveState();

  notify(
    "Leave request submitted."
  );

  render();
}

function submitFeedback() {
  const message =
    document.getElementById(
      "feedbackMessage"
    ).value.trim();

  if (!message) {
    notify(
      "Write your feedback first."
    );
    return;
  }

  state.feedback.push({
    id: uid("fb"),
    schoolId: me().schoolId,
    userId: me().id,
    message,
    date:
      new Date()
        .toISOString()
        .slice(0, 10)
  });

  saveState();

  notify(
    "Feedback submitted."
  );

  render();
}

function markAttendance(
  studentId,
  status
) {
  const user =
    schoolUsers().find(
      u => u.id === studentId
    );

  if (
    !user ||
    user.role !== "student"
  ) {
    return;
  }

  const date =
    new Date()
      .toISOString()
      .slice(0, 10);

  const existing =
    state.attendance.find(
      a =>
        a.schoolId === me().schoolId &&
        a.studentId === studentId &&
        a.date === date
    );

  if (existing) {
    existing.status = status;
  } else {
    state.attendance.push({
      id: uid("at"),
      schoolId: me().schoolId,
      studentId,
      date,
      status
    });
  }

  saveState();

  render();
}

function toggleDark() {
  const dark =
    !document.body.classList.contains(
      "dark"
    );

  document.body.classList.toggle(
    "dark",
    dark
  );

  localStorage.setItem(
    "educonnect_dark",
    dark ? "1" : "0"
  );
}

function studyAI() {
  notify(
    "Study AI demo is ready. Real AI/API integration will be added through a secure backend."
  );
}

function filteredHomeworkForStudent() {
  const u = me();

  return state.homework.filter(
    h =>
      sameSchool(h) &&
      (
        !h.className ||
        (
          h.className === u.className &&
          (
            !h.section ||
            h.section === u.section
          )
        )
      )
  );
}

function filteredNoticesForStudent() {
  const u = me();

  return state.notices.filter(
    n =>
      sameSchool(n) &&
      (
        !n.className ||
        (
          n.className === u.className &&
          (
            !n.section ||
            n.section === u.section
          )
        )
      )
  );
}
function dashboard() {
  const u = me();
  const s = mySchool();

  if (!u || !s) {
    return loginPage();
  }

  const schoolUsersCount =
    schoolUsers().length;

  const hw =
    u.role === "student"
      ? filteredHomeworkForStudent().length
      : state.homework.filter(
          sameSchool
        ).length;

  const notices =
    u.role === "student"
      ? filteredNoticesForStudent().length
      : state.notices.filter(
          sameSchool
        ).length;

  return `
    <div class="page-header">
      <div>
        <div class="eyebrow">
          ${esc(s.code)}
        </div>

        <h1>
          Welcome, ${esc(u.name)}
        </h1>

        <p>
          ${esc(s.name)}
          ·
          ${roleLabel(u.role)}
        </p>
      </div>

      <div class="school-pill">
        ${esc(s.code)}
      </div>
    </div>

    <div class="stats-grid">

      <div class="card stat-card">
        <span>School</span>
        <strong>
          ${esc(s.name)}
        </strong>
      </div>

      <div class="card stat-card">
        <span>Accounts</span>
        <strong>
          ${schoolUsersCount}
        </strong>
      </div>

      <div class="card stat-card">
        <span>Homework</span>
        <strong>
          ${hw}
        </strong>
      </div>

      <div class="card stat-card">
        <span>Notices</span>
        <strong>
          ${notices}
        </strong>
      </div>

    </div>

    <div class="section-title">
      <h2>Quick Access</h2>
    </div>

    <div class="quick-grid">
      ${quickButton(
        "homework",
        "Homework",
        "📚"
      )}

      ${quickButton(
        "attendance",
        "Attendance",
        "✓"
      )}

      ${quickButton(
        "results",
        "Results",
        "📊"
      )}

      ${quickButton(
        "notices",
        "Notices",
        "🔔"
      )}

      ${quickButton(
        "exams",
        "Exam Schedule",
        "📝"
      )}

      ${quickButton(
        "events",
        "School Events",
        "📅"
      )}

      ${quickButton(
        "studyai",
        "Study AI",
        "🤖"
      )}

      ${quickButton(
        "profile",
        "Profile",
        "👤"
      )}
    </div>
  `;
}

function quickButton(
  page,
  title,
  icon
) {
  return `
    <button
      class="card quick-card"
      onclick="nav('${page}')"
    >
      <span class="quick-icon">
        ${icon}
      </span>

      <strong>
        ${title}
      </strong>
    </button>
  `;
}

function homeworkPage() {
  const u = me();

  const list =
    u.role === "student"
      ? filteredHomeworkForStudent()
      : state.homework.filter(
          sameSchool
        );

  return `
    <div class="page-header">
      <div>
        <div class="eyebrow">
          ACADEMICS
        </div>

        <h1>Homework</h1>

        <p>
          School-wise homework management.
        </p>
      </div>
    </div>

    ${
      u.role !== "student"
        ? `
          <div class="card form-card">

            <h2>
              Add Homework
            </h2>

            <div class="form-grid">

              <input
                id="hwTitle"
                placeholder="Homework title"
              >

              <select id="hwSubject">
                ${subjectOptions()}
              </select>

              <select id="hwClass">
                ${classOptions()}
              </select>

              <select id="hwSection">
                ${sectionOptions()}
              </select>

              <input
                id="hwDue"
                type="date"
              >

              <input
                id="hwDescription"
                placeholder="Description"
              >

            </div>

            <button
              class="primary"
              onclick="addHomework()"
            >
              Add Homework
            </button>

          </div>
        `
        : ""
    }

    <div class="list">

      ${
        list.length
          ? list
              .map(
                h => `
                  <div class="card list-card">

                    <div>
                      <h3>
                        ${esc(h.title)}
                      </h3>

                      <p>
                        ${esc(h.subject)}
                        · Class
                        ${esc(h.className)}
                        -
                        ${esc(h.section)}
                      </p>

                      <small>
                        ${esc(
                          h.description || ""
                        )}
                      </small>
                    </div>

                    <span class="badge">
                      Due
                      ${formatDate(h.due)}
                    </span>

                  </div>
                `
              )
              .join("")
          : emptyState(
              "No homework available."
            )
      }

    </div>
  `;
}

function noticesPage() {
  const u = me();

  const list =
    u.role === "student"
      ? filteredNoticesForStudent()
      : state.notices.filter(
          sameSchool
        );

  return `
    <div class="page-header">
      <div>

        <div class="eyebrow">
          COMMUNICATION
        </div>

        <h1>
          Notices
        </h1>

        <p>
          Official school announcements.
        </p>

      </div>
    </div>

    ${
      u.role !== "student"
        ? `
          <div class="card form-card">

            <h2>
              Publish Notice
            </h2>

            <input
              id="noticeTitle"
              placeholder="Notice title"
            >

            <textarea
              id="noticeMessage"
              placeholder="Notice message"
            ></textarea>

            <div class="form-grid">

              <select id="noticeClass">
                <option value="">
                  All Classes
                </option>

                ${classOptions()}
              </select>

              <select id="noticeSection">
                <option value="">
                  All Sections
                </option>

                ${sectionOptions()}
              </select>

            </div>

            <button
              class="primary"
              onclick="addNotice()"
            >
              Publish Notice
            </button>

          </div>
        `
        : ""
    }

    <div class="list">

      ${
        list.length
          ? list
              .slice()
              .reverse()
              .map(
                n => `
                  <div class="card list-card">

                    <div>
                      <h3>
                        ${esc(n.title)}
                      </h3>

                      <p>
                        ${esc(n.message)}
                      </p>
                    </div>

                    <span class="badge">
                      ${formatDate(n.date)}
                    </span>

                  </div>
                `
              )
              .join("")
          : emptyState(
              "No notices."
            )
      }

    </div>
  `;
}

function resultsPage() {
  const u = me();

  const list =
    u.role === "student"
      ? state.results.filter(
          r =>
            sameSchool(r) &&
            r.studentId === u.id
        )
      : state.results.filter(
          sameSchool
        );

  return `
    <div class="page-header">
      <div>

        <div class="eyebrow">
          ACADEMICS
        </div>

        <h1>
          Results
        </h1>

        <p>
          Student-wise examination records.
        </p>

      </div>
    </div>

    ${
      u.role !== "student"
        ? `
          <div class="card form-card">

            <h2>
              Add Result
            </h2>

            <div class="form-grid">

              <select id="resultStudent">
                ${studentOptions()}
              </select>

              <input
                id="resultExam"
                placeholder="Exam name"
              >

              <select id="resultSubject">
                ${subjectOptions()}
              </select>

              <input
                id="resultMarks"
                type="number"
                placeholder="Marks"
              >

              <input
                id="resultMax"
                type="number"
                placeholder="Maximum marks"
                value="100"
              >

            </div>

            <button
              class="primary"
              onclick="addResult()"
            >
              Save Result
                 </button>

          </div>
        `
        : ""
    }

    <div class="table-wrap card">

      <table>

        <thead>
          <tr>

            ${
              u.role !== "student"
                ? "<th>Student</th>"
                : ""
            }

            <th>Exam</th>
            <th>Subject</th>
            <th>Marks</th>
            <th>Percentage</th>

          </tr>
        </thead>

        <tbody>

          ${
            list.length
              ? list
                  .map(r => {

                    const student =
                      state.users.find(
                        x =>
                          x.id ===
                          r.studentId
                      );

                    const pct =
                      r.max
                        ? (
                            (r.marks /
                              r.max) *
                            100
                          ).toFixed(1)
                        : "0";

                    return `
                      <tr>

                        ${
                          u.role !==
                          "student"
                            ? `
                              <td>
                                ${esc(
                                  student?.name ||
                                  "-"
                                )}
                              </td>
                            `
                            : ""
                        }

                        <td>
                          ${esc(r.exam)}
                        </td>

                        <td>
                          ${esc(
                            r.subject
                          )}
                        </td>

                        <td>
                          ${r.marks}/${r.max}
                        </td>

                        <td>
                          ${pct}%
                        </td>

                      </tr>
                    `;
                  })
                  .join("")
              : `
                <tr>
                  <td colspan="5">
                    No results available.
                  </td>
                </tr>
              `
          }

        </tbody>

      </table>

    </div>
  `;
}
function attendancePage() {
  const u = me();

  if (u.role === "student") {
    const records = state.attendance.filter(
      a =>
        sameSchool(a) &&
        a.studentId === u.id
    );

    return `
      <div class="page-header">
        <div>
          <div class="eyebrow">
            STUDENT
          </div>

          <h1>Attendance</h1>

          <p>
            Your attendance record.
          </p>
        </div>
      </div>

      <div class="table-wrap card">
        <table>

          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            ${
              records.length
                ? records.map(a => `
                    <tr>
                      <td>
                        ${formatDate(a.date)}
                      </td>

                      <td>
                        <span class="badge">
                          ${esc(a.status)}
                        </span>
                      </td>
                    </tr>
                  `).join("")
                : `
                  <tr>
                    <td colspan="2">
                      No attendance records.
                    </td>
                  </tr>
                `
            }
          </tbody>

        </table>
      </div>
    `;
  }

  const students =
    schoolUsers().filter(
      user => user.role === "student"
    );

  const today =
    new Date()
      .toISOString()
      .slice(0, 10);

  return `
    <div class="page-header">
      <div>

        <div class="eyebrow">
          STAFF
        </div>

        <h1>
          Attendance
        </h1>

        <p>
          Mark attendance for students
          in your school.
        </p>

      </div>
    </div>

    <div class="list">

      ${
        students.length
          ? students.map(student => {

              const existing =
                state.attendance.find(
                  a =>
                    a.schoolId ===
                      me().schoolId &&
                    a.studentId ===
                      student.id &&
                    a.date === today
                );

              return `
                <div class="card attendance-row">

                  <div>
                    <strong>
                      ${esc(student.name)}
                    </strong>

                    <p>
                      Class
                      ${esc(student.className)}
                      -
                      ${esc(student.section)}
                    </p>
                  </div>

                  <div class="attendance-actions">

                    <button
                      class="${
                        existing?.status ===
                        "Present"
                          ? "primary"
                          : ""
                      }"
                      onclick="
                        markAttendance(
                          '${student.id}',
                          'Present'
                        )
                      "
                    >
                      Present
                    </button>

                    <button
                      class="${
                        existing?.status ===
                        "Absent"
                          ? "danger"
                          : ""
                      }"
                      onclick="
                        markAttendance(
                          '${student.id}',
                          'Absent'
                        )
                      "
                    >
                      Absent
                    </button>

                  </div>

                </div>
              `;
            }).join("")
          : emptyState(
              "No students found."
            )
      }

    </div>
  `;
}

function examsPage() {
  const u = me();

  const list =
    state.exams.filter(e => {

      if (!sameSchool(e)) {
        return false;
      }

      if (u.role !== "student") {
        return true;
      }

      return (
        (!e.className ||
          e.className ===
            u.className) &&
        (!e.section ||
          e.section ===
            u.section)
      );
    });

  return `
    <div class="page-header">
      <div>

        <div class="eyebrow">
          ACADEMICS
        </div>

        <h1>
          Exam Schedule
        </h1>

        <p>
          Upcoming school examinations.
        </p>

      </div>
    </div>

    ${
      u.role !== "student"
        ? `
          <div class="card form-card">

            <h2>
              Add Exam
            </h2>

            <div class="form-grid">

              <input
                id="examTitle"
                placeholder="Exam title"
              >

              <select id="examSubject">
                ${subjectOptions()}
              </select>

              <select id="examClass">
                ${classOptions()}
              </select>

              <select id="examSection">
                ${sectionOptions()}
              </select>

              <input
                id="examDate"
                type="date"
              >

            </div>

            <button
              class="primary"
              onclick="addExam()"
            >
              Add Exam
            </button>

          </div>
        `
        : ""
    }

    <div class="list">

      ${
        list.length
          ? list.map(e => `
              <div class="card list-card">

                <div>
                  <h3>
                    ${esc(e.title)}
                  </h3>

                  <p>
                    ${esc(e.subject)}
                    · Class
                    ${esc(e.className)}
                    -
                    ${esc(e.section)}
                  </p>
                </div>

                <span class="badge">
                  ${formatDate(e.date)}
                </span>

              </div>
            `).join("")
          : emptyState(
              "No exams scheduled."
            )
      }

    </div>
  `;
}

function feesPage() {
  const u = me();

  const list =
    u.role === "student"
      ? state.fees.filter(
          f =>
            sameSchool(f) &&
            f.studentId === u.id
        )
      : state.fees.filter(
          sameSchool
        );

  return `
    <div class="page-header">
      <div>

        <div class="eyebrow">
          FINANCE
        </div>

        <h1>
          Fees
        </h1>

        <p>
          School fee records.
        </p>

      </div>
    </div>

    ${
      u.role !== "student"
        ? `
          <div class="card form-card">

            <h2>
              Add Fee Record
            </h2>

            <div class="form-grid">

              <select id="feeStudent">
                ${studentOptions()}
              </select>

              <input
                id="feeTitle"
                placeholder="Fee title"
              >

              <input
                id="feeAmount"
                type="number"
                placeholder="Amount"
              >

              <select id="feeStatus">

                <option>
                  Pending
                </option>

                <option>
                  Paid
                </option>

                <option>
                  Partial
                </option>

              </select>

            </div>

            <button
              class="primary"
              onclick="addFee()"
            >
              Add Fee
            </button>

          </div>
        `
        : ""
    }

    <div class="list">

      ${
        list.length
          ? list.map(f => {

              const student =
                state.users.find(
                  x =>
                    x.id ===
                    f.studentId
                );

              return `
                <div class="card list-card">

                  <div>

                    ${
                      u.role !==
                      "student"
                        ? `
                          <h3>
                            ${esc(
                              student?.name ||
                              "-"
                            )}
                          </h3>
                        `
                        : ""
                    }

                    <p>
                      ${esc(f.title)}
                    </p>

                  </div>

                  <div>

                    <strong>
                      ₹${Number(
                        f.amount
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                    <span class="badge">
                      ${esc(f.status)}
                    </span>

                  </div>

                </div>
              `;
            }).join("")
          : emptyState(
              "No fee records."
            )
      }

    </div>
  `;
}

function eventsPage() {
  const u = me();

  const list =
    state.events.filter(
      sameSchool
    );

  return `
    <div class="page-header">
      <div>

        <div class="eyebrow">
          CAMPUS
        </div>

        <h1>
          School Events
        </h1>

        <p>
          Events and activities.
        </p>

      </div>
    </div>

    ${
      u.role !== "student"
        ? `
          <div class="card form-card">

            <h2>
              Add Event
            </h2>

            <input
              id="eventTitle"
              placeholder="Event title"
            >

            <input
              id="eventDate"
              type="date"
            >

            <textarea
              id="eventDescription"
              placeholder="Description"
            ></textarea>

            <button
              class="primary"
              onclick="addEvent()"
            >
              Add Event
            </button>

          </div>
        `
        : ""
    }

    <div class="list">

      ${
        list.length
          ? list.map(e => `
              <div class="card list-card">

                <div>

                  <h3>
                    ${esc(e.title)}
                  </h3>

                  <p>
                    ${esc(
                      e.description ||
                      ""
                    )}
                  </p>

                </div>

                <span class="badge">
                  ${formatDate(e.date)}
                </span>

              </div>
            `).join("")
          : emptyState(
              "No events added."
            )
      }

    </div>
  `;
}

function leavePage() {
  const u = me();

  const list =
    u.role === "student"
      ? state.leaves.filter(
          l =>
            sameSchool(l) &&
            l.studentId === u.id
        )
      : state.leaves.filter(
          sameSchool
        );

  return `
    <div class="page-header">
      <div>

        <div class="eyebrow">
          REQUESTS
        </div>

        <h1>
          Leave
        </h1>

        <p>
          Leave requests.
        </p>

      </div>
    </div>

    ${
      u.role === "student"
        ? `
          <div class="card form-card">

            <h2>
              Apply for Leave
            </h2>

            <input
              id="leaveDate"
              type="date"
            >

            <textarea
              id="leaveReason"
              placeholder="Reason"
            ></textarea>

            <button
              class="primary"
              onclick="submitLeave()"
            >
              Submit Leave
            </button>

          </div>
        `
        : ""
    }

    <div class="list">

      ${
        list.length
          ? list.map(l => {

              const student =
                state.users.find(
                  x =>
                    x.id ===
                    l.studentId
                );

              return `
                <div class="card list-card">

                  <div>

                    ${
                      u.role !==
                      "student"
                        ? `
                          <h3>
                            ${esc(
                              student?.name ||
                              "-"
                            )}
                          </h3>
                        `
                        : ""
                    }

                    <p>
                      ${esc(l.reason)}
                    </p>

                  </div>

                  <span class="badge">
                    ${formatDate(l.date)}
                    ·
                    ${esc(l.status)}
                  </span>

                </div>
              `;
            }).join("")
          : emptyState(
              "No leave requests."
            )
      }

    </div>
  `;
}
function ptmPage() {
  const list =
    state.ptm.filter(
      sameSchool
    );

  return `
    <div class="page-header">
      <div>

        <div class="eyebrow">
          SCHOOL
        </div>

        <h1>
          PTM
        </h1>

        <p>
          Parent-teacher meeting schedule.
        </p>

      </div>
    </div>

    ${
      me().role !== "student"
        ? `
          <div class="card form-card">

            <h2>
              Add PTM
            </h2>

            <input
              id="ptmTitle"
              placeholder="PTM title"
            >

            <input
              id="ptmDate"
              type="date"
            >

            <input
              id="ptmTime"
              type="time"
            >

            <button
              class="primary"
              onclick="addPTM()"
            >
              Add PTM
            </button>

          </div>
        `
        : ""
    }

    <div class="list">

      ${
        list.length
          ? list.map(p => `
              <div class="card list-card">

                <div>
                  <h3>
                    ${esc(p.title)}
                  </h3>
                </div>

                <span class="badge">
                  ${formatDate(p.date)}
                  ·
                  ${esc(p.time)}
                </span>

              </div>
            `).join("")
          : emptyState(
              "No PTM scheduled."
            )
      }

    </div>
  `;
}


function feedbackPage() {
  const u = me();

  const list =
    state.feedback.filter(
      sameSchool
    );

  return `
    <div class="page-header">
      <div>

        <div class="eyebrow">
          COMMUNITY
        </div>

        <h1>
          Feedback
        </h1>

        <p>
          Share feedback with your school.
        </p>

      </div>
    </div>

    <div class="card form-card">

      <h2>
        Send Feedback
      </h2>

      <textarea
        id="feedbackMessage"
        placeholder="Write your feedback"
      ></textarea>

      <button
        class="primary"
        onclick="submitFeedback()"
      >
        Submit Feedback
      </button>

    </div>

    ${
      u.role !== "student"
        ? `
          <div class="list">

            ${
              list.length
                ? list
                    .slice()
                    .reverse()
                    .map(f => {

                      const author =
                        state.users.find(
                          x =>
                            x.id ===
                            f.userId
                        );

                      return `
                        <div class="card list-card">

                          <div>

                            <h3>
                              ${esc(
                                author?.name ||
                                "User"
                              )}
                            </h3>

                            <p>
                              ${esc(
                                f.message
                              )}
                            </p>

                          </div>

                          <span class="badge">
                            ${formatDate(
                              f.date
                            )}
                          </span>

                        </div>
                      `;
                    })
                    .join("")
                : emptyState(
                    "No feedback yet."
                  )
            }

          </div>
        `
        : ""
    }
  `;
}


function schoolManagementPage() {
  const u = me();

  if (u.role === "student") {
    return `
      <div class="card">

        <h2>
          Access restricted
        </h2>

        <p>
          Only school Admin and Teachers
          can access this section.
        </p>

      </div>
    `;
  }

  const users =
    schoolUsers();

  return `
    <div class="page-header">
      <div>

        <div class="eyebrow">
          ADMINISTRATION
        </div>

        <h1>
          School Management
        </h1>

        <p>
          Manage accounts inside
          ${esc(mySchool().name)}
          only.
        </p>

      </div>
    </div>

    <div class="card school-info">

      <strong>
        ${esc(mySchool().name)}
      </strong>

      <span>
        School Code:
        ${esc(mySchool().code)}
      </span>

      <span>
        ${esc(mySchool().city)}
      </span>

    </div>

    ${
      u.role === "admin"
        ? `
          <div class="card form-card">

            <h2>
              Add Student / Teacher
            </h2>

            <div class="form-grid">

              <select id="newUserRole">

                <option value="student">
                  Student
                </option>

                <option value="teacher">
                  Teacher
                </option>

              </select>

              <input
                id="newUserName"
                placeholder="Full name"
              >

              <input
                id="newUserPhone"
                placeholder="Phone number"
              >

              <select id="newUserClass">
                ${classOptions()}
              </select>

              <select id="newUserSection">
                ${sectionOptions()}
              </select>

              <select id="newUserSubject">
                ${subjectOptions()}
              </select>

            </div>

            <button
              class="primary"
              onclick="addUser()"
            >
              Create Account
            </button>

          </div>
        `
        : ""
    }

    <div class="table-wrap card">

      <table>

        <thead>
          <tr>

            <th>
              Name
            </th>

            <th>
              Role
            </th>

            <th>
              Phone
            </th>

            <th>
              Class
            </th>

            <th>
              Section
            </th>

            ${
              u.role === "admin"
                ? "<th>Action</th>"
                : ""
            }

          </tr>
        </thead>

        <tbody>

          ${
            users.map(user => `
              <tr>

                <td>
                  ${esc(user.name)}
                </td>

                <td>
                  ${roleLabel(user.role)}
                </td>

                <td>
                  ${esc(user.phone)}
                </td>

                <td>
                  ${esc(
                    user.className ||
                    "-"
                  )}
                </td>

                <td>
                  ${esc(
                    user.section ||
                    "-"
                  )}
                </td>

                ${
                  u.role === "admin"
                    ? `
                      <td>

                        ${
                          user.id !== u.id
                            ? `
                              <button
                                class="danger small"
                                onclick="
                                  removeUser(
                                    '${user.id}'
                                  )
                                "
                              >
                                Remove
                              </button>
                            `
                            : "You"
                        }

                      </td>
                    `
                    : ""
                }

              </tr>
            `).join("")
          }

        </tbody>

      </table>

    </div>
  `;
}


function studyAIPage() {
  return `
    <div class="page-header">
      <div>

        <div class="eyebrow">
          LEARNING
        </div>

        <h1>
          Study AI
        </h1>

        <p>
          Study helper interface.
        </p>

      </div>
    </div>

    <div class="card ai-card">

      <div class="ai-icon">
        🤖
      </div>

      <h2>
        EduConnect Study AI
      </h2>

      <p>
        Ask questions, explain concepts,
        solve academic problems, translate
        text and work with study material.
      </p>

      <textarea
        placeholder="Type your study question..."
        id="aiQuestion"
      ></textarea>

      <button
        class="primary"
        onclick="studyAI()"
      >
        Ask Study AI
      </button>

      <div class="ai-note">
        Demo mode: real AI requires a
        secure backend/API integration.
      </div>

    </div>
  `;
                    }
function profilePage() {
  const u = me();
  const s = mySchool();

  return `
    <div class="page-header">
      <div>

        <div class="eyebrow">
          ACCOUNT
        </div>

        <h1>
          Profile
        </h1>

        <p>
          Your EduConnect account.
        </p>

      </div>
    </div>

    <div class="card profile-card">

      <div class="avatar">
        ${esc(
          u.name
            .charAt(0)
            .toUpperCase()
        )}
      </div>

      <h2>
        ${esc(u.name)}
      </h2>

      <p>
        ${roleLabel(u.role)}
      </p>

      <div class="profile-info">

        <div>
          <span>School</span>
          <strong>
            ${esc(s.name)}
          </strong>
        </div>

        <div>
          <span>School Code</span>
          <strong>
            ${esc(s.code)}
          </strong>
        </div>

        <div>
          <span>Phone</span>
          <strong>
            ${esc(u.phone)}
          </strong>
        </div>

        ${
          u.className
            ? `
              <div>
                <span>Class</span>
                <strong>
                  ${esc(u.className)}
                  -
                  ${esc(u.section)}
                </strong>
              </div>
            `
            : ""
        }

      </div>

    </div>
  `;
}


function settingsPage() {
  const dark =
    localStorage.getItem(
      "educonnect_dark"
    ) === "1";

  return `
    <div class="page-header">
      <div>

        <div class="eyebrow">
          APP
        </div>

        <h1>
          Settings
        </h1>

        <p>
          Customize EduConnect.
        </p>

      </div>
    </div>

    <div class="card settings-row">

      <div>
        <strong>
          Dark Mode
        </strong>

        <p>
          Switch between light and
          dark appearance.
        </p>
      </div>

      <button
        class="primary"
        onclick="toggleDark()"
      >
        ${dark ? "Disable" : "Enable"}
      </button>

    </div>

    <div class="card settings-row">

      <div>
        <strong>
          Account
        </strong>

        <p>
          ${esc(me().name)}
          ·
          ${roleLabel(me().role)}
        </p>
      </div>

      <button
        class="danger"
        onclick="logout()"
      >
        Logout
      </button>

    </div>
  `;
}


function accountsPage() {
  const users =
    schoolUsers();

  return `
    <div class="page-header">
      <div>

        <div class="eyebrow">
          ACCOUNTS
        </div>

        <h1>
          Switch Account
        </h1>

        <p>
          Switch between accounts
          available on this device.
        </p>

      </div>
    </div>

    <div class="list">

      ${
        users.map(user => `
          <button
            class="card account-card"
            onclick="
              switchAccount(
                '${user.id}'
              )
            "
          >

            <div class="avatar small">
              ${esc(
                user.name
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            <div>

              <strong>
                ${esc(user.name)}
              </strong>

              <p>
                ${roleLabel(user.role)}
                ·
                ${esc(mySchool().code)}
              </p>

            </div>

          </button>
        `).join("")
      }

    </div>
  `;
}


function loginPage() {
  return `
    <div class="login-shell">

      <div class="login-card card">

        <div class="brand-mark">
          EC
        </div>

        <div class="eyebrow">
          SCHOOL PLATFORM
        </div>

        <h1>
          EduConnect
        </h1>

        <p>
          One platform for students,
          teachers and school
          administration.
        </p>

        <div class="login-form">

          <label>
            School Code
          </label>

          <input
            id="schoolCode"
            placeholder="Example: EDU001"
            autocomplete="off"
          >

          <label>
            Phone Number
          </label>

          <input
            id="phone"
            placeholder="Enter registered phone number"
            inputmode="numeric"
          >

          <button
            class="primary login-btn"
            onclick="login()"
          >
            Continue
          </button>

          <button
            class="secondary"
            onclick="demoLogin()"
          >
            Demo Admin Login
          </button>

        </div>

        <div class="login-note">
          Each school has its own School
          Code and isolated school data.
        </div>

      </div>

    </div>
  `;
}


function layout(content) {
  const u = me();
  const s = mySchool();

  if (!u || !s) {
    return content;
  }

  const navItems = [

    ["dashboard", "Dashboard", "⌂"],

    ["homework", "Homework", "📚"],

    ["attendance", "Attendance", "✓"],

    ["results", "Results", "📊"],

    ["notices", "Notices", "🔔"],

    ["exams", "Exams", "📝"],

    ["fees", "Fees", "₹"],

    ["events", "Events", "📅"],

    ["leave", "Leave", "✈"],

    ["ptm", "PTM", "👥"],

    ["feedback", "Feedback", "💬"],

    ["studyai", "Study AI", "🤖"],

    ["profile", "Profile", "👤"]

  ];

  if (u.role !== "student") {

    navItems.splice(
      6,
      0,
      [
        "school-management",
        "School Management",
        "🏫"
      ]
    );

  }

  return `
    <div class="app-shell">

      <aside class="sidebar">

        <div class="brand">

          <div class="brand-logo">
            EC
          </div>

          <div>

            <strong>
              EduConnect
            </strong>

            <small>
              ${esc(s.code)}
            </small>

          </div>

        </div>

        <div class="user-mini">

          <div class="avatar small">
            ${esc(
              u.name
                .charAt(0)
                .toUpperCase()
            )}
          </div>

          <div>

            <strong>
              ${esc(u.name)}
            </strong>

            <small>
              ${roleLabel(u.role)}
            </small>

          </div>

        </div>

        <nav>

          ${
            navItems.map(item => `
              <button
                class="${
                  currentPage ===
                  item[0]
                    ? "active"
                    : ""
                }"
                onclick="
                  nav('${item[0]}')
                "
              >

                <span>
                  ${item[2]}
                </span>

                ${item[1]}

              </button>
            `).join("")
          }

        </nav>

        <div class="sidebar-bottom">

          <button
            onclick="nav('accounts')"
          >
            ⇄ Switch Account
          </button>

          <button
            onclick="nav('settings')"
          >
            ⚙ Settings
          </button>

          <button
            onclick="logout()"
          >
            ↪ Logout
          </button>

        </div>

      </aside>

      <main class="main-content">

        <div class="mobile-topbar">

          <strong>
            EduConnect
          </strong>

          <button
            onclick="nav('settings')"
          >
            ⚙
          </button>

        </div>

        ${content}

      </main>

    </div>
  `;
}


function classOptions() {
  return (
    mySchool()?.classes || []
  )
    .map(
      c =>
        `<option value="${esc(c)}">${esc(c)}</option>`
    )
    .join("");
}


function sectionOptions() {
  return (
    mySchool()?.sections || []
  )
    .map(
      s =>
        `<option value="${esc(s)}">${esc(s)}</option>`
    )
    .join("");
}


function subjectOptions() {
  return (
    mySchool()?.subjects || []
  )
    .map(
      s =>
        `<option value="${esc(s)}">${esc(s)}</option>`
    )
    .join("");
}


function studentOptions() {
  return schoolUsers()
    .filter(
      u => u.role === "student"
    )
    .map(
      s =>
        `<option value="${esc(s.id)}">${esc(s.name)} · ${esc(s.className)}-${esc(s.section)}</option>`
    )
    .join("");
}


function emptyState(message) {
  return `
    <div class="card empty-state">

      <div>
        📭
      </div>

      <strong>
        ${esc(message)}
      </strong>

    </div>
  `;
}


function pageContent() {

  switch (currentPage) {

    case "dashboard":
      return dashboard();

    case "homework":
      return homeworkPage();

    case "attendance":
      return attendancePage();

    case "results":
      return resultsPage();

    case "notices":
      return noticesPage();

    case "exams":
      return examsPage();

    case "fees":
      return feesPage();

    case "events":
      return eventsPage();

    case "leave":
      return leavePage();

    case "ptm":
      return ptmPage();

    case "feedback":
      return feedbackPage();

    case "school-management":
      return schoolManagementPage();

    case "studyai":
      return studyAIPage();

    case "profile":
      return profilePage();

    case "settings":
      return settingsPage();

    case "accounts":
      return accountsPage();

    default:
      return dashboard();
  }
}


function render() {

  document.body.classList.toggle(
    "dark",
    localStorage.getItem(
      "educonnect_dark"
    ) === "1"
  );

  const root =
    document.getElementById("app");

  if (!root) {
    return;
  }

  if (!me()) {

    root.innerHTML =
      loginPage();

    return;
  }

  root.innerHTML =
    layout(
      pageContent()
    );
}


document.addEventListener(
  "DOMContentLoaded",
  startApp
);
