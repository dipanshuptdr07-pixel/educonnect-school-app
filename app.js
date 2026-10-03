/* =========================================================
   EDUCONNECT — FINAL MOBILE-FIRST SCHOOL MANAGEMENT APP
   =========================================================
   Roles: Student, Teacher, Admin
   Demo School: DEMO01
   Demo OTP: 123456

   Prototype limitations:
   - localStorage only
   - OTP is demo only
   - file uploads store metadata, not cloud files
   - Study AI is demo/local, no external AI API
   - notifications are in-app only
========================================================= */

(() => {
  "use strict";

  const APP = "EduConnect";
  const VERSION = "6";

  const KEYS = {
    users: "ec_users_v6",
    accounts: "ec_accounts_v6",
    current: "ec_current_v6",
    homework: "ec_homework_v6",
    notices: "ec_notices_v6",
    notifications: "ec_notifications_v6",
    attendance: "ec_attendance_v6",
    results: "ec_results_v6",
    ptm: "ec_ptm_v6",
    contacts: "ec_contacts_v6",
    settings: "ec_settings_v6",
    events: "ec_events_v6",
    leaves: "ec_leaves_v6",
    feedback: "ec_feedback_v6",
    exams: "ec_exams_v6",
    fees: "ec_fees_v6",
    ai: "ec_ai_v6",
    school: "ec_school_v6",
    theme: "ec_theme_v6"
  };

  const DEMO_SCHOOL = {
    code: "DEMO01",
    name: "EduConnect Demo School",
    address: "India",
    classes: ["9", "10", "11", "12"],
    sections: ["A", "B"],
    subjects: [
      "Physics",
      "Chemistry",
      "Mathematics",
      "English",
      "Computer Science"
    ]
  };

  const DEMO_USERS = [
    {
      id: "STU001",
      role: "Student",
      name: "Dipanshu Patidar",
      phone: "9999999999",
      school: "DEMO01",
      class: "11",
      section: "A",
      roll: "01"
    },
    {
      id: "STU002",
      role: "Student",
      name: "Demo Student",
      phone: "8888888888",
      school: "DEMO01",
      class: "11",
      section: "A",
      roll: "02"
    },
    {
      id: "STU003",
      role: "Student",
      name: "Student Three",
      phone: "7777777777",
      school: "DEMO01",
      class: "11",
      section: "A",
      roll: "03"
    },
    {
      id: "T001",
      role: "Teacher",
      name: "Amit Sharma",
      phone: "9000000001",
      school: "DEMO01",
      subject: "Physics",
      classes: ["11"],
      sections: ["A"]
    },
    {
      id: "T002",
      role: "Teacher",
      name: "Neha Verma",
      phone: "9000000002",
      school: "DEMO01",
      subject: "Chemistry",
      classes: ["11"],
      sections: ["A"]
    },
    {
      id: "T003",
      role: "Teacher",
      name: "Rahul Joshi",
      phone: "9000000003",
      school: "DEMO01",
      subject: "Mathematics",
      classes: ["11"],
      sections: ["A"]
    },
    {
      id: "ADMIN001",
      role: "Admin",
      name: "School Admin",
      phone: "9000000000",
      school: "DEMO01"
    }
  ];

  const state = {
    page: "dashboard",
    menu: false
  };

  /* =========================================================
     BASIC STORAGE
  ========================================================= */

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid(prefix = "ID") {
    return (
      prefix +
      Date.now().toString(36) +
      Math.random().toString(36).slice(2, 7)
    ).toUpperCase();
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

  function fmtDate(value) {
    if (!value) return "-";

    const d = new Date(value + "T00:00:00");

    if (Number.isNaN(d.getTime())) return value;

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function getUsers() {
    return read(KEYS.users, []);
  }

  function getCurrent() {
    const id = localStorage.getItem(KEYS.current);

    if (!id) return null;

    return getUsers().find(u => u.id === id) || null;
  }

  function saveUsers(users) {
    write(KEYS.users, users);
  }

  function school() {
    return read(KEYS.school, DEMO_SCHOOL);
  }

  function isStaff() {
    const u = getCurrent();
    return u && (u.role === "Teacher" || u.role === "Admin");
  }

  function isAdmin() {
    const u = getCurrent();
    return u && u.role === "Admin";
  }

  /* =========================================================
     INITIAL DATA
  ========================================================= */

  function seed() {
    if (!localStorage.getItem(KEYS.school)) {
      write(KEYS.school, DEMO_SCHOOL);
    }

    if (!localStorage.getItem(KEYS.users)) {
      saveUsers(DEMO_USERS);
    }

    if (!localStorage.getItem(KEYS.settings)) {
      write(KEYS.settings, {
        notifications: true,
        language: "English"
      });
    }

    if (!localStorage.getItem(KEYS.theme)) {
      write(KEYS.theme, "system");
    }

    if (!localStorage.getItem(KEYS.homework)) {
      write(KEYS.homework, [
        {
          id: "HW001",
          title: "Physics — Units & Dimensions",
          subject: "Physics",
          class: "11",
          section: "A",
          due: "2026-10-05",
          description:
            "Complete the assigned questions from the school module.",
          files: [],
          createdBy: "T001",
          createdAt: today()
        },
        {
          id: "HW002",
          title: "Chemistry — Mole Concept",
          subject: "Chemistry",
          class: "11",
          section: "A",
          due: "2026-10-07",
          description:
            "Solve the numerical questions given in today's class.",
          files: [],
          createdBy: "T002",
          createdAt: today()
        }
      ]);
    }

    if (!localStorage.getItem(KEYS.notices)) {
      write(KEYS.notices, [
        {
          id: "N001",
          title: "Unit Test Schedule",
          message:
            "The upcoming unit test schedule has been uploaded.",
          class: "11",
          section: "A",
          attachment: null,
          createdBy: "ADMIN001",
          createdAt: today()
        }
      ]);
    }

    if (!localStorage.getItem(KEYS.events)) {
      write(KEYS.events, [
        {
          id: "E001",
          title: "Annual Sports Practice",
          date: "2026-10-10",
          description: "School sports practice and selection activity."
        }
      ]);
    }

    if (!localStorage.getItem(KEYS.exams)) {
      write(KEYS.exams, [
        {
          id: "EX001",
          class: "11",
          section: "A",
          subject: "Physics",
          date: "2026-10-15",
          time: "09:00",
          room: "Hall 1"
        },
        {
          id: "EX002",
          class: "11",
          section: "A",
          subject: "Chemistry",
          date: "2026-10-17",
          time: "09:00",
          room: "Hall 1"
        }
      ]);
    }

    if (!localStorage.getItem(KEYS.contacts)) {
      write(KEYS.contacts, [
        {
          id: "T001",
          name: "Amit Sharma",
          subject: "Physics",
          phone: "9000000001",
          classes: ["11"],
          sections: ["A"]
        },
        {
          id: "T002",
          name: "Neha Verma",
          subject: "Chemistry",
          phone: "9000000002",
          classes: ["11"],
          sections: ["A"]
        },
        {
          id: "T003",
          name: "Rahul Joshi",
          subject: "Mathematics",
          phone: "9000000003",
          classes: ["11"],
          sections: ["A"]
        }
      ]);
    }

    if (!localStorage.getItem(KEYS.notifications)) {
      write(KEYS.notifications, [
        {
          id: "NT001",
          title: "Welcome to EduConnect",
          message: "Your school management dashboard is ready.",
          type: "system",
          date: today(),
          userId: null,
          class: null,
          section: null,
          read: false
        }
      ]);
    }

    if (!localStorage.getItem(KEYS.attendance)) {
      write(KEYS.attendance, []);
    }

    if (!localStorage.getItem(KEYS.results)) {
      write(KEYS.results, [
        {
          id: "R001",
          studentId: "STU001",
          class: "11",
          section: "A",
          test: "Unit Test 1",
          subject: "Physics",
          marks: 82,
          max: 100,
          published: true
        },
        {
          id: "R002",
          studentId: "STU001",
          class: "11",
          section: "A",
          test: "Unit Test 1",
          subject: "Chemistry",
          marks: 76,
          max: 100,
          published: true
        },
        {
          id: "R003",
          studentId: "STU001",
          class: "11",
          section: "A",
          test: "Unit Test 1",
          subject: "Mathematics",
          marks: 89,
          max: 100,
          published: true
        }
      ]);
    }

    if (!localStorage.getItem(KEYS.ptm)) {
      write(KEYS.ptm, []);
    }

    if (!localStorage.getItem(KEYS.leaves)) {
      write(KEYS.leaves, []);
    }

    if (!localStorage.getItem(KEYS.feedback)) {
      write(KEYS.feedback, []);
    }

    if (!localStorage.getItem(KEYS.fees)) {
      write(KEYS.fees, [
        {
          id: "F001",
          studentId: "STU001",
          title: "Annual School Fee",
          amount: 25000,
          paid: 15000,
          dueDate: "2026-10-30"
        }
      ]);
    }

    if (!localStorage.getItem(KEYS.ai)) {
      write(KEYS.ai, []);
    }
  }

  /* =========================================================
     THEME
  ========================================================= */

  function applyTheme() {
    const theme = read(KEYS.theme, "system");

    let dark = false;

    if (theme === "dark") {
      dark = true;
    }

    if (theme === "system") {
      dark = window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    document.documentElement.classList.toggle("ec-dark", dark);
  }

  /* =========================================================
     GLOBAL CSS
  ========================================================= */

  function injectCSS() {
    if (document.getElementById("educonnect-final-css")) return;

    const css = `
      :root{
        --blue:#3157d5;
        --blue2:#5575ea;
        --bg:#f5f7fb;
        --card:#ffffff;
        --text:#172033;
        --muted:#70798c;
        --border:#e4e8f0;
        --soft:#eef2ff;
        --green:#15945d;
        --red:#dc3545;
        --orange:#e98b25;
        --shadow:0 12px 35px rgba(31,50,100,.08);
      }

      *{
        box-sizing:border-box;
      }

      html,body{
        margin:0;
        min-height:100%;
        font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,
        "Segoe UI",sans-serif;
        background:var(--bg);
        color:var(--text);
      }

      body{
        min-height:100vh;
      }

      button,input,textarea,select{
        font:inherit;
      }

      button{
        cursor:pointer;
      }

      a{
        color:inherit;
      }

      .ec-app{
        min-height:100vh;
      }

      .ec-shell{
        display:flex;
        min-height:100vh;
      }

      .ec-side{
        width:250px;
        position:fixed;
        left:0;
        top:0;
        bottom:0;
        background:var(--card);
        border-right:1px solid var(--border);
        padding:20px 14px;
        z-index:50;
        transition:.25s;
      }

      .ec-brand{
        display:flex;
        align-items:center;
        gap:11px;
        padding:5px 9px 24px;
        font-size:20px;
        font-weight:900;
      }

      .ec-logo{
        width:40px;
        height:40px;
        border-radius:13px;
        object-fit:cover;
        background:var(--soft);
      }

      .ec-profile-mini{
        padding:14px;
        border:1px solid var(--border);
        border-radius:18px;
        margin-bottom:18px;
        background:var(--soft);
      }

      .ec-avatar{
        width:42px;
        height:42px;
        border-radius:14px;
        display:grid;
        place-items:center;
        background:var(--blue);
        color:#fff;
        font-weight:900;
        flex:none;
      }

      .ec-profile-line{
        display:flex;
        align-items:center;
        gap:10px;
      }

      .ec-profile-name{
        font-weight:800;
        font-size:14px;
      }

      .ec-profile-role{
        color:var(--muted);
        font-size:12px;
        margin-top:3px;
      }

      .ec-nav{
        display:grid;
        gap:7px;
      }

      .ec-nav button{
        width:100%;
        border:0;
        background:transparent;
        color:var(--text);
        text-align:left;
        padding:12px 13px;
        border-radius:13px;
        display:flex;
        gap:11px;
        align-items:center;
      }

      .ec-nav button:hover,
      .ec-nav button.active{
        background:var(--soft);
        color:var(--blue);
        font-weight:800;
      }

      .ec-main{
        width:calc(100% - 250px);
        margin-left:250px;
        padding:22px;
      }

      .ec-topbar{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:15px;
        margin-bottom:20px;
      }

      .ec-title h1{
        margin:0;
        font-size:27px;
        letter-spacing:-.5px;
      }

      .ec-title p{
        margin:5px 0 0;
        color:var(--muted);
      }

      .ec-top-actions{
        display:flex;
        align-items:center;
        gap:8px;
      }

      .ec-icon-btn{
        width:43px;
        height:43px;
        border:1px solid var(--border);
        background:var(--card);
        border-radius:13px;
        display:grid;
        place-items:center;
        color:var(--text);
      }

      .ec-mobile{
        display:none;
      }

      .ec-grid{
        display:grid;
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:15px;
      }

      .ec-grid-2{
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:16px;
      }

      .ec-card{
        background:var(--card);
        border:1px solid var(--border);
        border-radius:20px;
        box-shadow:var(--shadow);
        padding:18px;
      }

      .ec-dashboard-card{
        position:relative;
        min-height:155px;
        overflow:hidden;
        cursor:pointer;
        transition:.2s;
      }

      .ec-dashboard-card:hover{
        transform:translateY(-2px);
      }

      .ec-card-icon{
        width:48px;
        height:48px;
        display:grid;
        place-items:center;
        border-radius:15px;
        background:var(--soft);
        color:var(--blue);
        font-size:23px;
      }

      .ec-dashboard-card h3{
        margin:18px 0 4px;
        font-size:16px;
      }

      .ec-dashboard-card p{
        margin:0;
        color:var(--muted);
        font-size:13px;
      }

      .ec-illustration{
        position:absolute;
        right:-12px;
        bottom:-17px;
        font-size:76px;
        opacity:.07;
        pointer-events:none;
      }

      .ec-section{
        margin-top:22px;
      }

      .ec-section-head{
        display:flex;
        justify-content:space-between;
        align-items:center;
        gap:10px;
        margin-bottom:11px;
      }

      .ec-section-head h2{
        margin:0;
        font-size:18px;
      }

      .ec-btn{
        border:0;
        border-radius:12px;
        padding:10px 14px;
        background:var(--blue);
        color:white;
        font-weight:800;
      }

      .ec-btn.secondary{
        background:var(--soft);
        color:var(--blue);
      }

      .ec-btn.danger{
        background:#ffecef;
        color:var(--red);
      }

      .ec-btn.green{
        background:#e8f8f0;
        color:var(--green);
      }

      .ec-btn.small{
        padding:7px 10px;
        font-size:12px;
      }

      .ec-input,
      .ec-select,
      .ec-textarea{
        width:100%;
        border:1px solid var(--border);
        border-radius:12px;
        padding:11px 12px;
        background:var(--card);
        color:var(--text);
        outline:none;
      }

      .ec-input:focus,
      .ec-select:focus,
      .ec-textarea:focus{
        border-color:var(--blue);
      }

      .ec-textarea{
        min-height:100px;
        resize:vertical;
      }

      .ec-form{
        display:grid;
        gap:12px;
      }

      .ec-form-grid{
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:12px;
      }

      .ec-field label{
        display:block;
        font-size:12px;
        color:var(--muted);
        font-weight:700;
        margin-bottom:6px;
      }

      .ec-list{
        display:grid;
        gap:10px;
      }

      .ec-list-item{
        border:1px solid var(--border);
        border-radius:15px;
        padding:14px;
        background:var(--card);
      }

      .ec-list-top{
        display:flex;
        justify-content:space-between;
        gap:10px;
        align-items:flex-start;
      }

      .ec-list-title{
        font-weight:850;
      }

      .ec-muted{
        color:var(--muted);
      }

      .ec-badge{
        display:inline-flex;
        align-items:center;
        border-radius:999px;
        padding:5px 9px;
        font-size:11px;
        font-weight:800;
        background:var(--soft);
        color:var(--blue);
      }

      .ec-badge.green{
        background:#e8f8f0;
        color:var(--green);
      }

      .ec-badge.red{
        background:#ffecef;
        color:var(--red);
      }

      .ec-badge.orange{
        background:#fff3e2;
        color:#bd6913;
      }

      .ec-actions{
        display:flex;
        flex-wrap:wrap;
        gap:7px;
        margin-top:12px;
      }

      .ec-stat{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
      }

      .ec-stat-num{
        font-size:29px;
        font-weight:900;
        margin-top:5px;
      }

      .ec-table-wrap{
        overflow:auto;
      }

      .ec-table{
        width:100%;
        border-collapse:collapse;
        min-width:650px;
      }

      .ec-table th,
      .ec-table td{
        padding:11px;
        border-bottom:1px solid var(--border);
        text-align:left;
        font-size:13px;
      }

      .ec-table th{
        color:var(--muted);
        font-size:11px;
        text-transform:uppercase;
      }

      .ec-empty{
        text-align:center;
        padding:35px 15px;
        color:var(--muted);
      }

      .ec-login{
        min-height:100vh;
        display:grid;
        place-items:center;
        padding:18px;
        background:
          radial-gradient(circle at top left,#e9edff,transparent 35%),
          var(--bg);
      }

      .ec-login-box{
        width:min(470px,100%);
        background:var(--card);
        border:1px solid var(--border);
        border-radius:25px;
        box-shadow:0 25px 70px rgba(31,50,100,.12);
        padding:28px;
      }

      .ec-login-head{
        text-align:center;
      }

      .ec-login-logo{
        width:72px;
        height:72px;
        border-radius:21px;
        object-fit:cover;
        margin-bottom:12px;
      }

      .ec-login-head h1{
        margin:0;
      }

      .ec-login-head p{
        color:var(--muted);
        margin:6px 0;
      }

      .ec-role-grid{
        display:grid;
        grid-template-columns:repeat(3,1fr);
        gap:8px;
        margin-top:10px;
      }

      .ec-role{
        border:1px solid var(--border);
        background:var(--card);
        border-radius:12px;
        padding:10px;
        font-w
