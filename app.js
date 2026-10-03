/* EduConnect — Production Frontend MVP
 * Standalone browser application.
 * Storage: localStorage only.
 * Roles: Student, Teacher, Admin
 */

(function () {
  "use strict";

  var APP_NAME = "EduConnect";
  var APP_VERSION = "13";
  var STORAGE_KEY = "educonnect_v13";
  var SESSION_KEY = "educonnect_session_v13";

  var ROLE_STUDENT = "Student";
  var ROLE_TEACHER = "Teacher";
  var ROLE_ADMIN = "Admin";

  var ROLES = [ROLE_STUDENT, ROLE_TEACHER, ROLE_ADMIN];

  var ROUTES = {
    dashboard: "dashboard",
    homework: "homework",
    attendance: "attendance",
    timetable: "timetable",
    results: "results",
    exams: "exams",
    fees: "fees",
    events: "events",
    ptm: "ptm",
    leave: "leave",
    feedback: "feedback",
    documents: "documents",
    studyAI: "study-ai",
    profile: "profile",
    schoolManagement: "school-management"
  };

  var state = null;
  var currentRoute = ROUTES.dashboard;
  var saveTimer = null;

  /* ----------------------------- Utilities ----------------------------- */

  function uid(prefix) {
    return String(prefix || "id") + "_" + Date.now().toString(36) + "_" +
      Math.random().toString(36).slice(2, 9);
  }

  function nowISO() {
    return new Date().toISOString();
  }

  function todayISO() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function escapeHTML(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function safeObject(value) {
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : {};
  }

  function normalizeRole(role) {
    return ROLES.indexOf(role) >= 0 ? role : null;
  }

  function hasRole() {
    var user = getCurrentUser();
    if (!user) return false;

    for (var i = 0; i < arguments.length; i++) {
      if (user.role === arguments[i]) return true;
    }

    return false;
  }

  function canManageAcademic() {
    return hasRole(ROLE_ADMIN, ROLE_TEACHER);
  }

  function canManageSchool() {
    return hasRole(ROLE_ADMIN);
  }

  function canViewAdminData() {
    return hasRole(ROLE_ADMIN);
  }

  function formatDate(value) {
    if (!value) return "—";

    var d = new Date(value + (String(value).length === 10 ? "T00:00:00" : ""));
    if (isNaN(d.getTime())) return escapeHTML(value);

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function formatMoney(value) {
    var number = Number(value);
    if (!isFinite(number)) number = 0;

    return "₹" + number.toLocaleString("en-IN", {
      maximumFractionDigits: 2
    });
  }

  function option(value, label, selected) {
    return '<option value="' + escapeHTML(value) + '"' +
      (String(value) === String(selected) ? " selected" : "") + ">" +
      escapeHTML(label) + "</option>";
  }

  function emptyState(message) {
    return '<div class="empty-state">' +
      '<div class="empty-state-icon">📭</div>' +
      "<h3>No records found</h3>" +
      "<p>" + escapeHTML(message || "There is nothing to show here yet.") + "</p>" +
      "</div>";
  }

  function toast(message, type) {
    var old = document.getElementById("educonnectToast");
    if (old) old.remove();

    var el = document.createElement("div");
    el.id = "educonnectToast";
    el.className = "educonnect-toast " + (type || "success");
    el.textContent = message;

    document.body.appendChild(el);

    setTimeout(function () {
      if (el.parentNode) el.remove();
    }, 2800);
  }

  function debounceSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveState, 50);
  }

  /* ----------------------------- Storage ----------------------------- */

  function createDefaultState() {
    var school1 = {
      id: "sch1",
      code: "EDU001",
      name: "EduConnect Demo School Indore",
      address: "Indore, Madhya Pradesh",
      phone: "0731-0000000",
      email: "admin@educonnect-demo.in",
      principal: "Demo Administrator"
    };

    var school2 = {
      id: "sch2",
      code: "EDU002",
      name: "Sunrise Public School Khargone",
      address: "Khargone, Madhya Pradesh",
      phone: "07282-000000",
      email: "admin@sunrise-demo.in",
      principal: "Sunrise Administrator"
    };

    var users = [
      {
        id: "u_sch1_admin",
        schoolId: "sch1",
        name: "Amit Sharma",
        role: ROLE_ADMIN,
        account: "admin001",
        phone: "9000000001",
        password: "admin123"
      },
      {
        id: "u_sch1_teacher",
        schoolId: "sch1",
        name: "Neha Verma",
        role: ROLE_TEACHER,
        account: "teacher001",
        phone: "9000000002",
        password: "teacher123",
        subjects: ["Mathematics", "Science"],
        classes: ["10"]
      },
      {
        id: "u_sch1_student",
        schoolId: "sch1",
        name: "Rahul Patidar",
        role: ROLE_STUDENT,
        account: "student001",
        phone: "9000000003",
        password: "student123",
        className: "10",
        section: "A",
        rollNo: "01"
      },
      {
        id: "u_sch2_admin",
        schoolId: "sch2",
        name: "Rajesh Singh",
        role: ROLE_ADMIN,
        account: "admin002",
        phone: "9100000001",
        password: "admin123"
      },
      {
        id: "u_sch2_teacher",
        schoolId: "sch2",
        name: "Pooja Joshi",
        role: ROLE_TEACHER,
        account: "teacher002",
        phone: "9100000002",
        password: "teacher123",
        subjects: ["English", "Social Science"],
        classes: ["9"]
      },
      {
        id: "u_sch2_student",
        schoolId: "sch2",
        name: "Arjun Sharma",
        role: ROLE_STUDENT,
        account: "student002",
        phone: "9100000003",
        password: "student123",
        className: "9",
        section: "A",
        rollNo: "01"
      }
    ];

    return {
      version: APP_VERSION,
      createdAt: nowISO(),
      schools: [school1, school2],

      classes: [
        { id: "c1", schoolId: "sch1", name: "9" },
        { id: "c2", schoolId: "sch1", name: "10" },
        { id: "c3", schoolId: "sch1", name: "11" },
        { id: "c4", schoolId: "sch1", name: "12" },
        { id: "c5", schoolId: "sch2", name: "8" },
        { id: "c6", schoolId: "sch2", name: "9" },
        { id: "c7", schoolId: "sch2", name: "10" },
        { id: "c8", schoolId: "sch2", name: "11" }
      ],

      sections: [
        { id: "sec1", schoolId: "sch1", name: "A", className: "9" },
        { id: "sec2", schoolId: "sch1", name: "A", className: "10" },
        { id: "sec3", schoolId: "sch1", name: "B", className: "10" },
        { id: "sec4", schoolId: "sch1", name: "A", className: "11" },
        { id: "sec5", schoolId: "sch2", name: "A", className: "8" },
        { id: "sec6", schoolId: "sch2", name: "A", className: "9" },
        { id: "sec7", schoolId: "sch2", name: "A", className: "10" },
        { id: "sec8", schoolId: "sch2", name: "A", className: "11" }
      ],

      subjects: [
        { id: "sub1", schoolId: "sch1", name: "Mathematics" },
        { id: "sub2", schoolId: "sch1", name: "Science" },
        { id: "sub3", schoolId: "sch1", name: "English" },
        { id: "sub4", schoolId: "sch1", name: "Social Science" },
        { id: "sub5", schoolId: "sch2", name: "Mathematics" },
        { id: "sub6", schoolId: "sch2", name: "English" },
        { id: "sub7", schoolId: "sch2", name: "Social Science" },
        { id: "sub8", schoolId: "sch2", name: "Science" }
      ],

      users: users,

      homework: [
        {
          id: "hw1",
          schoolId: "sch1",
          teacherId: "u_sch1_teacher",
          className: "10",
          section: "A",
          subject: "Mathematics",
          title: "Quadratic Equations Practice",
          description: "Complete the assigned practice questions.",
          dueDate: "2026-10-08",
          status: "Pending",
          createdAt: nowISO()
        },
        {
          id: "hw2",
          schoolId: "sch2",
          teacherId: "u_sch2_teacher",
          className: "9",
          section: "A",
          subject: "English",
          title: "Grammar Worksheet",
          description: "Complete the grammar worksheet.",
          dueDate: "2026-10-07",
          status: "Pending",
          createdAt: nowISO()
        }
      ],

      attendance: [
        {
          id: "att1",
          schoolId: "sch1",
          studentId: "u_sch1_student",
          date: "2026-10-01",
          status: "Present",
          markedBy: "u_sch1_teacher"
        },
        {
          id: "att2",
          schoolId: "sch1",
          studentId: "u_sch1_student",
          date: "2026-10-02",
          status: "Present",
          markedBy: "u_sch1_teacher"
        },
        {
          id: "att3",
          schoolId: "sch2",
          studentId: "u_sch2_student",
          date: "2026-10-01",
          status: "Absent",
          markedBy: "u_sch2_teacher"
        }
      ],

      timetable: [
        {
          id: "tt1",
          schoolId: "sch1",
          day: "Monday",
          period: "09:00 - 09:45",
          subject: "Mathematics",
          teacherId: "u_sch1_teacher",
          className: "10",
          section: "A"
        },
        {
          id: "tt2",
          schoolId: "sch1",
          day: "Monday",
          period: "10:00 - 10:45",
          subject: "Science",
          teacherId: "u_sch1_teacher",
          className: "10",
          section: "A"
        },
        {
          id: "tt3",
          schoolId: "sch2",
          day: "Monday",
          period: "09:00 - 09:45",
          subject: "English",
          teacherId: "u_sch2_teacher",
          className: "9",
          section: "A"
        },
        {
          id: "tt4",
          schoolId: "sch2",
          day: "Monday",
          period: "10:00 - 10:45",
          subject: "Social Science",
          teacherId: "u_sch2_teacher",
          className: "9",
          section: "A"
        }
      ],

      results: [
        {
          id: "res1",
          schoolId: "sch1",
          studentId: "u_sch1_student",
          exam: "Unit Test 1",
          subject: "Mathematics",
          marks: 86,
          maxMarks: 100,
          grade: "A"
        },
        {
          id: "res2",
          schoolId: "sch2",
          studentId: "u_sch2_student",
          exam: "Unit Test 1",
          subject: "English",
          marks: 79,
          maxMarks: 100,
          grade: "B+"
        }
      ],

      exams: [
        {
          id: "ex1",
          schoolId: "sch1",
          name: "Unit Test 2",
          date: "2026-10-15",
          subject: "Mathematics",
          className: "10",
          section: "A"
        },
        {
          id: "ex2",
          schoolId: "sch2",
          name: "Mid Term",
          date: "2026-10-20",
          subject: "English",
          className: "9",
          section: "A"
        }
      ],

      fees: [
        {
          id: "fee1",
          schoolId: "sch1",
          studentId: "u_sch1_student",
          title: "Term 1 Fee",
          amount: 8500,
          status: "Paid",
          dueDate: "2026-09-30"
        },
        {
          id: "fee2",
          schoolId: "sch2",
          studentId: "u_sch2_student",
          title: "Term 1 Fee",
          amount: 7200,
          status: "Pending",
          dueDate: "2026-10-15"
        }
      ],

      events: [
        {
          id: "ev1",
          schoolId: "sch1",
          name: "Annual Sports Day",
          date: "2026-11-10",
          location: "School Ground"
        },
        {
          id: "ev2",
          schoolId: "sch2",
          name: "Science Exhibition",
          date: "2026-11-05",
          location: "School Auditorium"
        }
      ],

      ptm: [
        {
          id: "ptm1",
          schoolId: "sch1",
          date: "2026-10-25",
          time: "10:00 AM - 01:00 PM",
          className: "10",
          section: "A",
          status: "Scheduled"
        },
        {
          id: "ptm2",
          schoolId: "sch2",
          date: "2026-10-28",
          time: "10:00 AM - 01:00 PM",
          className: "9",
          section: "A",
          status: "Scheduled"
        }
      ],

      leave: [
        {
          id: "lv1",
          schoolId: "sch1",
          studentId: "u_sch1_student",
          date: "2026-10-10",
          reason: "Family function",
          status: "Pending"
        }
      ],

      feedback: [
        {
          id: "fb1",
          schoolId: "sch1",
          userId: "u_sch1_student",
          message: "The homework section is useful.",
          createdAt: nowISO()
        }
      ],

      documents: [
        {
          id: "doc1",
          schoolId: "sch1",
          title: "School Handbook",
          category: "General",
          fileName: "school-handbook-demo.pdf",
          note: "Demo document record. No server upload is performed.",
          createdAt: nowISO()
        },
        {
          id: "doc2",
          schoolId: "sch2",
          title: "Academic Calendar",
          category: "Academic",
          fileName: "academic-calendar-demo.pdf",
          note: "Demo document record. No server upload is performed.",
          createdAt: nowISO()
        }
      ],

      notices: [
        {
          id: "notice1",
          schoolId: "sch1",
          title: "Welcome to EduConnect",
          message: "The new school-management dashboard is now available.",
          createdAt: nowISO(),
          createdBy: "u_sch1_admin"
        },
        {
          id: "notice2",
          schoolId: "sch2",
          title: "Science Exhibition",
          message: "Students are requested to prepare their exhibition projects.",
          createdAt: nowISO(),
          createdBy: "u_sch2_admin"
        }
      ],

      studyAI: []
    };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);

      if (!raw) {
        state = createDefaultState();
        saveState();
        return;
      }

      var parsed = JSON.parse(raw);

      if (!parsed || parsed.version !== APP_VERSION) {
        state = createDefaultState();
        saveState();
        return;
      }

      state = parsed;
      ensureStateShape();
      saveState();
    } catch (error) {
      console.error("EduConnect storage recovery:", error);
      state = createDefaultState();

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (storageError) {
        console.error("Unable to initialize localStorage:", storageError);
      }
    }
  }

  function ensureStateShape() {
    if (!state || typeof state !== "object") {
      state = createDefaultState();
      return;
    }

    var arrays = [
      "schools",
      "classes",
      "sections",
      "subjects",
      "users",
      "homework",
      "attendance",
      "timetable",
      "results",
      "exams",
      "fees",
      "events",
      "ptm",
      "leave",
      "feedback",
      "documents",
      "notices",
      "studyAI"
    ];

    arrays.forEach(function (key) {
      if (!Array.isArray(state[key])) state[key] = [];
    });

    if (!state.version) state.version = APP_VERSION;
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error("EduConnect save error:", error);
      toast("Storage is unavailable or full.", "error");
    }
  }

  function getSession() {
    try {
      var raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;

      var session = JSON.parse(raw);
      if (!session || !session.userId || !session.schoolId) return null;

      return session;
    } catch (error) {
      console.error("Session recovery error:", error);
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  function saveSession(userId, schoolId) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        userId: userId,
        schoolId: schoolId
      }));
    } catch (error) {
      console.error("Session save error:", error);
    }
  }

  function clearSession() {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error("Session clear error:", error);
    }
  }

  /* ----------------------------- Current Context ----------------------------- */

  function getCurrentUser() {
    if (!state) return null;

    var session = getSession();
    if (!session) return null;

    var user = state.users.find(function (item) {
      return item.id === session.userId &&
        item.schoolId === session.schoolId &&
        normalizeRole(item.role);
    });

    return user || null;
  }

  function getCurrentSchool() {
    var user = getCurrentUser();
    if (!user) return null;

    return state.schools.find(function (school) {
      return school.id === user.schoolId;
    }) || null;
  }

  function getSchoolUsers(schoolId) {
    var id = schoolId || (getCurrentSchool() || {}).id;
    return state.users.filter(function (user) {
      return user.schoolId === id;
    });
  }

  function getSchoolData(collection, schoolId) {
    var id = schoolId || (getCurrentSchool() || {}).id;
    return safeArray(state[collection]).filter(function (item) {
      return item.schoolId === id;
    });
  }

  function getStudents(schoolId) {
    return getSchoolUsers(schoolId).filter(function (user) {
      return user.role === ROLE_STUDENT;
    });
  }

  function getTeachers(schoolId) {
    return getSchoolUsers(schoolId).filter(function (user) {
      return user.role === ROLE_TEACHER;
    });
  }

  function getClasses(schoolId) {
    var id = schoolId || (getCurrentSchool() || {}).id;
    return state.classes.filter(function (item) {
      return item.schoolId === id;
    });
  }

  function getSections(schoolId, className) {
    var id = schoolId || (getCurrentSchool() || {}).id;

    return state.sections.filter(function (item) {
      return item.schoolId === id &&
        (!className || item.className === className);
    });
  }

  function getSubjects(schoolId) {
    var id = schoolId || (getCurrentSchool() || {}).id;

    return state.subjects.filter(function (item) {
      return item.schoolId === id;
    });
  }

  function getStudentName(studentId) {
    var student = state.users.find(function (user) {
      return user.id === studentId;
    });

    return student ? student.name : "Unknown student";
  }

  function getTeacherName(teacherId) {
    var teacher = state.users.find(function (user) {
      return user.id === teacherId;
    });

    return teacher ? teacher.name : "Unknown teacher";
  }

  function getUserById(userId) {
    return state.users.find(function (user) {
      return user.id === userId;
    }) || null;
  }

  /* ----------------------------- Login ----------------------------- */

  function renderLogin() {
    var root = document.getElementById("app");

    if (!root) {
      root = document.createElement("div");
      root.id = "app";
      document.body.appendChild(root);
    }

    root.innerHTML =
      '<div class="login-page">' +
        '<div class="login-card">' +
          '<div class="brand">' +
            '<div class="brand-mark">E</div>' +
            '<div>' +
              '<h1>EduConnect</h1>' +
              '<p>School Management Platform</p>' +
            '</div>' +
          '</div>' +

          '<form id="loginForm" class="login-form">' +
            '<h2>Sign in</h2>' +
            '<p class="muted">Use your school account to continue.</p>' +

            '<label for="schoolCode">School Code</label>' +
            '<input id="schoolCode" name="schoolCode" required ' +
              'autocomplete="organization" placeholder="Example: EDU001">' +

            '<label for="loginAccount">Phone / Account</label>' +
            '<input id="loginAccount" name="account" required ' +
              'autocomplete="username" placeholder="Example: student001">' +

            '<label for="loginPassword">Password</label>' +
            '<input id="loginPassword" name="password" type="password" required ' +
              'autocomplete="current-password" placeholder="Enter password">' +

            '<button type="submit" class="primary-btn">Login</button>' +
            '<div id="loginMessage" class="form-message"></div>' +
          '</form>' +

          '<div class="demo-accounts">' +
            '<h3>Demo Accounts</h3>' +
            '<div class="demo-school">' +
              '<strong>EDU001</strong>' +
              '<span>Admin: admin001 / admin123</span>' +
              '<span>Teacher: teacher001 / teacher123</span>' +
              '<span>Student: student001 / student123</span>' +
            '</div>' +
            '<div class="demo-school">' +
              '<strong>EDU002</strong>' +
              '<span>Admin: admin002 / admin123</span>' +
              '<span>Teacher: teacher002 / teacher123</span>' +
              '<span>Student: student002 / student123</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    var form = document.getElementById("loginForm");

    if (form) {
      form.addEventListener("submit", handleLogin);
    }
  }

  function handleLogin(event) {
    event.preventDefault();

    var form = event.currentTarget;
    var code = String(form.schoolCode.value || "").trim().toUpperCase();
    var account = String(form.account.value || "").trim().toLowerCase();
    var password = String(form.password.value || "");

    var school = state.schools.find(function (item) {
      return item.code.toUpperCase() === code;
    });

    var message = document.getElementById("loginMessage");

    if (!school) {
      if (message) message.textContent = "Invalid school code.";
      return;
    }

    var user = state.users.find(function (item) {
      return item.schoolId === school.id &&
        normalizeRole(item.role) &&
        (
          String(item.account || "").toLowerCase() === account ||
          String(item.phone || "") === account
        ) &&
        String(item.password || "") === password;
    });

    if (!user) {
      if (message) message.textContent = "Invalid account or password.";
      return;
    }

    saveSession(user.id, school.id);
    currentRoute = ROUTES.dashboard;
    renderApp();
  }

  function logout() {
    clearSession();
    currentRoute = ROUTES.dashboard;
    renderLogin();
  }

  /* ----------------------------- Navigation ----------------------------- */

  function navigationItems() {
    var user = getCurrentUser();
    if (!user) return [];

    var items = [
      ["dashboard", "Dashboard", "🏠"],
      ["homework", "Homework", "📚"],
      ["attendance", "Attendance", "✓"],
      ["timetable", "Timetable", "🗓"],
      ["results", "Results", "📊"],
      ["exams", "Exams", "📝"]
    ];

    if (user.role === ROLE_STUDENT || user.role === ROLE_ADMIN) {
      items.push(["fees", "Fees", "₹"]);
    }

    items.push(
      ["events", "Events", "🎉"],
      ["ptm", "PTM", "👥"],
      ["leave", "Leave", "📄"],
      ["feedback", "Feedback", "💬"],
      ["documents", "Documents", "📁"],
      ["study-ai", "Study AI", "🤖"],
      ["profile", "Profile", "👤"]
    );

    if (user.role === ROLE_ADMIN) {
      items.push(["school-management", "School Management", "⚙"]);
    }

    return items;
  }

  function navigate(route) {
    if (!ROUTES || Object.keys(ROUTES).map(function (key) {
      return ROUTES[key];
    }).indexOf(route) === -1) {
      route = ROUTES.dashboard;
    }

    currentRoute = route;
    renderApp();
    window.scrollTo(0, 0);
  }

  function pageFunction(route) {
    var pages = {
      "dashboard": dashboardPage,
      "homework": homeworkPage,
      "attendance": attendancePage,
      "timetable": timetablePage,
      "results": resultsPage,
      "exams": examsPage,
      "fees": feesPage,
      "events": eventsPage,
      "ptm": ptmPage,
      "leave": leavePage,
      "feedback": feedbackPage,
      "documents": documentsPage,
      "study-ai": studyAIPage,
      "profile": profilePage,
      "school-management": schoolManagementPage
    };

    return pages[route] || dashboardPage;
  }

  function renderApp() {
    var root = document.getElementById("app");

    if (!root) {
      root = document.createElement("div");
      root.id = "app";
      document.body.appendChild(root);
    }

    var user = getCurrentUser();
    var school = getCurrentSchool();

    if (!user || !school) {
      clearSession();
      renderLogin();
      return;
    }

    if (ROLES.indexOf(user.role) === -1) {
      clearSession();
      renderLogin();
      return;
    }

    try {
      var page = pageFunction(currentRoute);

      root.innerHTML =
        '<div class="app-shell">' +
          '<aside class="sidebar" id="sidebar">' +
            '<div class="sidebar-brand">' +
              '<div class="brand-mark">E</div>' +
              '<div>' +
                '<strong>EduConnect</strong>' +
                '<small>' + escapeHTML(school.code) + '</small>' +
              '</div>' +
            '</div>' +

            '<nav class="main-nav" aria-label="Main navigation">' +
              navigationItems().map(function (item) {
                return '<button class="nav-item ' +
                  (currentRoute === item[0] ? "active" : "") +
                  '" data-route="' + escapeHTML(item[0]) + '">' +
                  '<span class="nav-icon">' + item[2] + '</span>' +
                  '<span>' + escapeHTML(item[1]) + '</span>' +
                '</button>';
              }).join("") +
            '</nav>' +

            '<button class="logout-btn" id="logoutBtn">↪ Logout</button>' +
          '</aside>' +

          '<main class="main-content">' +
            '<header class="topbar">' +
              '<button class="menu-btn" id="menuBtn" aria-label="Open menu">☰</button>' +
              '<div class="topbar-school">' +
                '<strong>' + escapeHTML(school.name) + '</strong>' +
                '<span>' + escapeHTML(school.code) + '</span>' +
              '</div>' +
              '<div class="topbar-user">' +
                '<span class="avatar">' + escapeHTML(user.name.charAt(0).toUpperCase()) + '</span>' +
                '<div>' +
                  '<strong>' + escapeHTML(user.name) + '</strong>' +
                  '<small>' + escapeHTML(user.role) + '</small>' +
                '</div>' +
              '</div>' +
            '</header>' +

            '<section class="page-container" id="pageContainer">' +
              page() +
            '</section>' +
          '</main>' +
        '</div>';

      bindNavigation();
      bindGlobalUI();

    } catch (error) {
      console.error("EduConnect render error:", error);
      renderFatalError(error);
    }
  }

  function bindNavigation() {
    document.querySelectorAll("[data-route]").forEach(function (button) {
      button.addEventListener("click", function () {
        navigate(button.getAttribute("data-route"));
      });
    });
  }

  function bindGlobalUI() {
    var logoutButton = document.getElementById("logoutBtn");
    if (logoutButton) {
      logoutButton.addEventListener("click", logout);
    }

    var menuButton = document.getElementById("menuBtn");
    var sidebar = document.getElementById("sidebar");

    if (menuButton && sidebar) {
      menuButton.addEventListener("click", function () {
        sidebar.classList.toggle("open");
      });
    }
  }

  function renderFatalError(error) {
    var root = document.getElementById("app");

    if (!root) {
      root = document.createElement("div");
      root.id = "app";
      document.body.appendChild(root);
    }

    root.innerHTML =
      '<div class="error-page">' +
        '<div class="error-card">' +
          '<h1>EduConnect could not load</h1>' +
          '<p>Something unexpected happened while rendering this page.</p>' +
          '<button class="primary-btn" id="reloadAppBtn">Reload App</button>' +
          '<button class="secondary-btn" id="resetAppBtn">Reset Local Demo Data</button>' +
          '<details>' +
            '<summary>Technical details</summary>' +
            '<pre>' + escapeHTML(error && error.message ? error.message : "Unknown error") + '</pre>' +
          '</details>' +
        '</div>' +
      '</div>';

    var reload = document.getElementById("reloadAppBtn");
    if (reload) reload.addEventListener("click", function () {
      window.location.reload();
    });

    var reset = document.getElementById("resetAppBtn");
    if (reset) reset.addEventListener("click", resetApplication);
  }

  function resetApplication() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error(error);
    }

    state = createDefaultState();
    saveState();
    renderLogin();
  }

  /* ----------------------------- Shared UI ----------------------------- */

  function pageHeader(title, subtitle) {
    return '<div class="page-header">' +
      '<div>' +
        '<h1>' + escapeHTML(title) + '</h1>' +
        '<p>' + escapeHTML(subtitle || "") + '</p>' +
      '</div>' +
      (currentRoute !== ROUTES.dashboard
        ? '<button class="secondary-btn" data-route="dashboard">← Dashboard</button>'
        : "") +
    '</div>';
  }

  function statCard(label, value, icon) {
    return '<div class="stat-card">' +
      '<div class="stat-icon">' + icon + '</div>' +
      '<div>' +
        '<span>' + escapeHTML(label) + '</span>' +
        '<strong>' + escapeHTML(value) + '</strong>' +
      '</div>' +
    '</div>';
  }

  function card(title, body, extraClass) {
    return '<div class="content-card ' + (extraClass || "") + '">' +
      '<div class="card-header"><h2>' + escapeHTML(title) + '</h2></div>' +
      body +
    '</div>';
  }

  function table(headers, rows) {
    if (!rows.length) return emptyState("No records available.");

    return '<div class="table-wrap"><table>' +
      '<thead><tr>' +
      headers.map(function (header) {
        return "<th>" + escapeHTML(header) + "</th>";
      }).join("") +
      "</tr></thead>" +
      "<tbody>" +
      rows.join("") +
      "</tbody></table></div>";
  }

  function quickAction(route, label, icon) {
    return '<button class="quick-action" data-route="' + escapeHTML(route) + '">' +
      '<span>' + icon + '</span>' +
      '<strong>' + escapeHTML(label) + '</strong>' +
    '</button>';
  }

  /* ----------------------------- Dashboard ----------------------------- */

  function dashboardPage() {
    var user = getCurrentUser();
    var school = getCurrentSchool();

    var schoolId = school.id;
    var homework = getSchoolData("homework", schoolId);
    var events = getSchoolData("events", schoolId);
    var notices = getSchoolData("notices", schoolId);
    var exams = getSchoolData("exams", schoolId);

    var studentCount = getStudents(schoolId).length;
    var teacherCount = getTeachers(schoolId).length;

    var stats;

    if (user.role === ROLE_ADMIN) {
      stats =
        statCard("Students", String(studentCount), "🎓") +
        statCard("Teachers", String(teacherCount), "👨‍🏫") +
        statCard("Homework", String(homework.length), "📚") +
        statCard("Upcoming Exams", String(exams.length), "📝");
    } else if (user.role === ROLE_TEACHER) {
      var myHomework = homework.filter(function (item) {
        return item.teacherId === user.id;
      });

      stats =
        statCard("My Homework", String(myHomework.length), "📚") +
        statCard("Students", String(studentCount), "🎓") +
        statCard("Upcoming Exams", String(exams.length), "📝") +
        statCard("Events", String(events.length), "🎉");
    } else {
      var myAttendance = getSchoolData("attendance", schoolId).filter(function (item) {
        return item.studentId === user.id;
      });

      var present = myAttendance.filter(function (item) {
        return item.status === "Present";
      }).length;

      var attendanceText = myAttendance.length
        ? Math.round((present / myAttendance.length) * 100) + "%"
        : "—";

      var myResults = getSchoolData("results", schoolId).filter(function (item) {
        return item.studentId === user.id;
      });

      var myFees = getSchoolData("fees", schoolId).filter(function (item) {
        return item.studentId === user.id;
      });

      stats =
        statCard("Attendance", attendanceText, "✓") +
        statCard("Results", String(myResults.length), "📊") +
        statCard("Homework", String(homework.filter(function (item) {
          return item.className === user.className &&
            item.section === user.section;
        }).length), "📚") +
        statCard("Fee Records", String(myFees.length), "₹");
    }

    var noticeBody = notices.slice(-5).reverse().map(function (notice) {
      return '<div class="notice-item">' +
        '<strong>' + escapeHTML(notice.title) + '</strong>' +
        '<p>' + escapeHTML(notice.message) + '</p>' +
        '<small>' + formatDate(notice.createdAt) + '</small>' +
      '</div>';
    }).join("");

    if (!noticeBody) noticeBody = emptyState("No notices have been published.");

    var eventBody = events.slice(0, 4).map(function (event) {
      return '<div class="list-row">' +
        '<div><strong>' + escapeHTML(event.name) + '</strong>' +
        '<small>' + escapeHTML(event.location) + '</small></div>' +
        '<span>' + formatDate(event.date) + '</span>' +
      '</div>';
    }).join("");

    if (!eventBody) eventBody = emptyState("No upcoming events.");

    var actions =
      quickAction("homework", "Homework", "📚") +
      quickAction("attendance", "Attendance", "✓") +
      quickAction("results", "Results", "📊") +
      quickAction("exams", "Exams", "📝") +
      quickAction("events", "Events", "🎉") +
      quickAction("study-ai", "Study AI", "🤖");

    if (user.role === ROLE_ADMIN) {
      actions +=
        quickAction("school-management", "School Management", "⚙") +
        quickAction("fees", "Fees", "₹") +
        quickAction("ptm", "PTM", "👥");
    }

    return pageHeader(
      "Welcome, " + user.name,
      user.role + " • " + school.name
    ) +

      '<div class="stats-grid">' + stats + "</div>" +

      card("Quick Actions", '<div class="quick-actions">' + actions + "</div>") +

      '<div class="two-column-grid">' +
        card("School Notices", noticeBody) +
        card("Upcoming Events", eventBody) +
      "</div>";
  }

  /* ----------------------------- Homework ----------------------------- */

  function homeworkPage() {
    var user = getCurrentUser();
    var school = getCurrentSchool();

    var records = getSchoolData("homework", school.id);

    if (user.role === ROLE_STUDENT) {
      records = records.filter(function (item) {
        return item.className === user.className &&
          item.section === user.section;
      });
    }

    var rows = records.map(function (item) {
      var action = "";

      if (user.role === ROLE_ADMIN || user.role === ROLE_TEACHER) {
        action =
          '<button class="danger-link" data-action="delete-homework" data-id="' +
          escapeHTML(item.id) + '">Delete</button>';
      }

      return "<tr>" +
        "<td>" + escapeHTML(item.subject) + "</td>" +
        "<td>" + escapeHTML(item.title) + "</td>" +
        "<td>" + escapeHTML(item.description) + "</td>" +
        "<td>" + formatDate(item.dueDate) + "</td>" +
        "<td>" + escapeHTML(item.status) + "</td>" +
        "<td>" + action + "</td>" +
      "</tr>";
    });

    var body =
      table(
        ["Subject", "Title", "Description", "Due Date", "Status", "Action"],
        rows
      );

    if (canManageAcademic()) {
      body =
        '<form id="homeworkForm" class="form-grid">' +
          '<div>' +
            '<label>Class</label>' +
            '<select name="className" required>' +
              classOptions() +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label>Section</label>' +
            '<select name="section" required>' +
              sectionOptions() +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label>Subject</label>' +
            '<select name="subject" required>' +
              subjectOptions() +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label>Due Date</label>' +
            '<input type="date" name="dueDate" required value="' +
              escapeHTML(todayISO()) + '">' +
          '</div>' +
          '<div class="full-width">' +
            '<label>Title</label>' +
            '<input name="title" required maxlength="120" placeholder="Homework title">' +
          '</div>' +
          '<div class="full-width">' +
            '<label>Description</label>' +
            '<textarea name="description" rows="3" maxlength="500" ' +
              'placeholder="Instructions"></textarea>' +
          '</div>' +
          '<div class="full-width">' +
            '<button class="primary-btn" type="submit">Add Homework</button>' +
          '</div>' +
        '</form>' +
        '<hr>' +
        body;
    }

    return pageHeader("Homework", "View and manage school homework.") +
      card("Homework Records", body);
  }

  function addHomework(event) {
    event.preventDefault();

    if (!canManageAcademic()) return;

    var user = getCurrentUser();
    var school = getCurrentSchool();
    var form = event.currentTarget;

    state.homework.push({
      id: uid("hw"),
      schoolId: school.id,
      teacherId: user.id,
      className: form.className.value,
      section: form.section.value,
      subject: form.subject.value,
      title: String(form.title.value).trim(),
      description: String(form.description.value).trim(),
      dueDate: form.dueDate.value,
      status: "Pending",
      createdAt: nowISO()
    });

    debounceSave();
    toast("Homework added successfully.");
    renderApp();
  }

  function deleteHomework(id) {
    if (!canManageAcademic()) return;

    var school = getCurrentSchool();

    state.homework = state.homework.filter(function (item) {
      return !(item.id === id && item.schoolId === school.id);
    });

    debounceSave();
    toast("Homework deleted.");
    renderApp();
  }

  /* ----------------------------- Attendance ----------------------------- */

  function attendancePage() {
    var user = getCurrentUser();
    var school = getCurrentSchool();
    var records = getSchoolData("attendance", school.id);

    if (user.role === ROLE_STUDENT) {
      records = records.filter(function (item) {
        return item.studentId === user.id;
      });
    } else if (user.role === ROLE_TEACHER) {
      var teacherStudents = getStudents(school.id).filter(function (student) {
        return user.classes && user.classes.indexOf(student.className) >= 0;
      });

      var teacherStudentIds = teacherStudents.map(function (student) {
        return student.id;
      });

      records = records.filter(function (item) {
        return teacherStudentIds.indexOf(item.studentId) >= 0 ||
          item.markedBy === user.id;
      });
    }

    var rows = records.slice().reverse().map(function (item) {
      return "<tr>" +
        "<td>" + escapeHTML(getStudentName(item.studentId)) + "</td>" +
        "<td>" + formatDate(item.date) + "</td>" +
        "<td>" + escapeHTML(item.status) + "</td>" +
        "<td>" + escapeHTML(getTeacherName(item.markedBy)) + "</td>" +
      "</tr>";
    });

    var body = table(
      ["Student", "Date", "Status", "Marked By"],
      rows
    );

    if (canManageAcademic()) {
      body =
        '<form id="attendanceForm" class="form-grid">' +
          '<div>' +
            '<label>Student</label>' +
            '<select name="studentId" required>' +
              studentOptions() +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label>Date</label>' +
            '<input type="date" name="date" value="' + todayISO() + '" required>' +
          '</div>' +
          '<div>' +
            '<label>Status</label>' +
            '<select name="status" required>' +
              option("Present", "Present", "Present") +
              option("Absent", "Absent") +
              option("Late", "Late") +
              option("Leave", "Leave") +
            '</select>' +
          '</div>' +
          '<div>' +
            '<button class="primary-btn" type="submit">Mark Attendance</button>' +
          '</div>' +
        '</form><hr>' +
        body;
    }

    return pageHeader("Attendance", "Track attendance for your school.") +
      card("Attendance Records", body);
  }

  function addAttendance(event) {
    event.preventDefault();

    if (!canManageAcademic()) return;

    var school = getCurrentSchool();
    var form = event.currentTarget;
    var student = getUserById(form.studentId.value);

    if (!student || student.schoolId !== school.id || student.role !== ROLE_STUDENT) {
      toast("Invalid student.", "error");
      return;
    }

    state.attendance.push({
      id: uid("att"),
      schoolId: school.id,
      studentId: student.id,
      date: form.date.value,
      status: form.status.value,
      markedBy: getCurrentUser().id
    });

    debounceSave();
    toast("Attendance saved.");
    renderApp();
  }

  /* ----------------------------- Timetable ----------------------------- */

  function timetablePage() {
    var user = getCurrentUser();
    var school = getCurrentSchool();

    var records = getSchoolData("timetable", school.id);

    if (user.role === ROLE_STUDENT) {
      records = records.filter(function (item) {
        return item.className === user.className &&
          item.section === user.section;
      });
    } else if (user.role === ROLE_TEACHER) {
      records = records.filter(function (item) {
        return item.teacherId === user.id;
      });
    }

    var days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    var rows = records.sort(function (a, b) {
      return days.indexOf(a.day) - days.indexOf(b.day);
    }).map(function (item) {
      return "<tr>" +
        "<td>" + escapeHTML(item.day) + "</td>" +
        "<td>" + escapeHTML(item.period) + "</td>" +
        "<td>" + escapeHTML(item.subject) + "</td>" +
        "<td>" + escapeHTML(getTeacherName(item.teacherId)) + "</td>" +
        "<td>" + escapeHTML(item.className + " - " + item.section) + "</td>" +
      "</tr>";
    });

    return pageHeader("Timetable", "Your school timetable.") +
      card("Weekly Timetable", table(
        ["Day", "Period", "Subject", "Teacher", "Class / Section"],
        rows
      ));
  }

  /* ----------------------------- Results ----------------------------- */

  function resultsPage() {
    var user = getCurrentUser();
    var school = getCurrentSchool();

    var records = getSchoolData("results", school.id);

    if (user.role === ROLE_STUDENT) {
      records = records.filter(function (item) {
        return item.studentId === user.id;
      });
    }

    var rows = records.map(function (item) {
      return "<tr>" +
        "<td>" + escapeHTML(getStudentName(item.studentId)) + "</td>" +
        "<td>" + escapeHTML(item.exam) + "</td>" +
        "<td>" + escapeHTML(item.subject) + "</td>" +
        "<td>" + escapeHTML(String(item.marks) + " / " + String(item.maxMarks)) + "</td>" +
        "<td>" + escapeHTML(item.grade) + "</td>" +
      "</tr>";
    });

    var body = table(
      ["Student", "Exam", "Subject", "Marks", "Grade"],
      rows
    );

    if (canManageAcademic()) {
      body =
        '<form id="resultForm" class="form-grid">' +
          '<div>' +
            '<label>Student</label>' +
            '<select name="studentId" required>' + studentOptions() + '</select>' +
          '</div>' +
          '<div>' +
            '<label>Exam</label>' +
            '<input name="exam" required placeholder="Unit Test 1">' +
          '</div>' +
          '<div>' +
            '<label>Subject</label>' +
            '<select name="subject" required>' + subjectOptions() + '</select>' +
          '</div>' +
          '<div>' +
            '<label>Marks</label>' +
            '<input type="number" name="marks" min="0" required>' +
          '</div>' +
          '<div>' +
            '<label>Maximum Marks</label>' +
            '<input type="number" name="maxMarks" min="1" value="100" required>' +
          '</div>' +
          '<div>' +
            '<label>Grade</label>' +
            '<select name="grade">' +
              option("A+", "A+") +
              option("A", "A", "A") +
              option("B+", "B+") +
              option("B", "B") +
              option("C", "C") +
              option("D", "D") +
            '</select>' +
          '</div>' +
          '<div class="full-width">' +
            '<button class="primary-btn" type="submit">Add Result</button>' +
          '</div>' +
        '</form><hr>' +
        body;
    }

    return pageHeader("Results", "Academic performance and marks.") +
      card("Results", body);
  }

  function addResult(event) {
    event.preventDefault();

    if (!canManageAcademic()) return;

    var school = getCurrentSchool();
    var form = event.currentTarget;
    var student = getUserById(form.studentId.value);

    if (!student || student.schoolId !== school.id || student.role !== ROLE_STUDENT) {
      toast("Invalid student.", "error");
      return;
    }

    var marks = Number(form.marks.value);
    var maxMarks = Number(form.maxMarks.value);

    if (!isFinite(marks) || !isFinite(maxMarks) || maxMarks <= 0 ||
      marks < 0 || marks > maxMarks) {
      toast("Enter valid marks.", "error");
      return;
    }

    state.results.push({
      id: uid("res"),
      schoolId: school.id,
      studentId: student.id,
      exam: String(form.exam.value).trim(),
      subject: form.subject.value,
      marks: marks,
      maxMarks: maxMarks,
      grade: form.grade.value
    });

    debounceSave();
    toast("Result added successfully.");
    renderApp();
  }

  /* ----------------------------- Exams ----------------------------- */

  function examsPage() {
    var user = getCurrentUser();
    var school = getCurrentSchool();

    var records = getSchoolData("exams", school.id);

    if (user.role === ROLE_STUDENT) {
      records = records.filter(function (item) {
        return item.className === user.className &&
          item.section === user.section;
      });
    } else if (user.role === ROLE_TEACHER) {
      var teacherClasses = user.classes || [];
      records = records.filter(function (item) {
        return teacherClasses.indexOf(item.className) >= 0;
      });
    }

    var rows = records.map(function (item) {
      return "<tr>" +
        "<td>" + escapeHTML(item.name) + "</td>" +
        "<td>" + formatDate(item.date) + "</td>" +
        "<td>" + escapeHTML(item.subject) + "</td>" +
        "<td>" + escapeHTML(item.className + " - " + item.section) + "</td>" +
      "</tr>";
    });

    var body = table(
      ["Exam", "Date", "Subject", "Class / Section"],
      rows
    );

    if (canManageAcademic()) {
      body =
        '<form id="examForm" class="form-grid">' +
          '<div>' +
            '<label>Exam Name</label>' +
            '<input name="name" required placeholder="Unit Test 2">' +
          '</div>' +
          '<div>' +
            '<label>Date</label>' +
            '<input type="date" name="date" required>' +
          '</div>' +
          '<div>' +
            '<label>Subject</label>' +
            '<select name="subject" required>' + subjectOptions() + '</select>' +
          '</div>' +
          '<div>' +
            '<label>Class</label>' +
            '<select name="className" required>' + classOptions() + '</select>' +
          '</div>' +
          '<div>' +
            '<label>Section</label>' +
            '<select name="section" required>' + sectionOptions() + '</select>' +
          '</div>' +
          '<div>' +
            '<button class="primary-btn" type="submit">Add Exam</button>' +
          '</div>' +
        '</form><hr>' +
        body;
    }

    return pageHeader("Exams", "Upcoming examinations and schedules.") +
      card("Exam Schedule", body);
  }

  function addExam(event) {
    event.preventDefault();

    if (!canManageAcademic()) return;

    var school = getCurrentSchool();
    var form = event.currentTarget;

    state.exams.push({
      id: uid("exam"),
      schoolId: school.id,
      name: String(form.name.value).trim(),
      date: form.date.value,
      subject: form.subject.value,
      className: form.className.value,
      section: form.section.value
    });

    debounceSave();
    toast("Exam added successfully.");
    renderApp();
  }

  /* ----------------------------- Fees ----------------------------- */

  function feesPage() {
    var user = getCurrentUser();
    var school = getCurrentSchool();

    var records = getSchoolData("fees", school.id);

    if (user.role === ROLE_STUDENT) {
      records = records.filter(function (item) {
        return item.studentId === user.id;
      });
    }

    var rows = records.map(function (item) {
      return "<tr>" +
        "<td>" + escapeHTML(getStudentName(item.studentId)) + "</td>" +
        "<td>" + escapeHTML(item.title) + "</td>" +
        "<td>" + formatMoney(item.amount) + "</td>" +
        "<td>" + escapeHTML(item.status) + "</td>" +
        "<td>" + formatDate(item.dueDate) + "</td>" +
        (user.role === ROLE_ADMIN
          ? '<td><button class="danger-link" data-action="delete-fee" data-id="' +
            escapeHTML(item.id) + '">Delete</button></td>'
          : "<td>—</td>") +
      "</tr>";
    });

    var body = table(
      ["Student", "Title", "Amount", "Status", "Due Date", "Action"],
      rows
    );

    if (user.role === ROLE_ADMIN) {
      body =
        '<form id="feeForm" class="form-grid">' +
          '<div>' +
            '<label>Student</label>' +
            '<select name="studentId" required>' + studentOptions() + '</select>' +
          '</div>' +
          '<div>' +
            '<label>Title</label>' +
            '<input name="title" required placeholder="Term 1 Fee">' +
          '</div>' +
          '<div>' +
            '<label>Amount</label>' +
            '<input name="amount" type="number" min="0" step="0.01" required>' +
          '</div>' +
          '<div>' +
            '<label>Status</label>' +
            '<select name="status">' +
              option("Pending", "Pending", "Pending") +
              option("Paid", "Paid") +
              option("Partially Paid", "Partially Paid") +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label>Due Date</label>' +
            '<input name="dueDate" type="date" required>' +
          '</div>' +
          '<div>' +
            '<button class="primary-btn" type="submit">Add Fee</button>' +
          '</div>' +
        '</form><hr>' +
        body;
    }

    return pageHeader("Fees", "View and manage fee records.") +
      card("Fee Records", body);
  }

  function addFee(event) {
    event.preventDefault();

    if (!hasRole(ROLE_ADMIN)) return;

    var school = getCurrentSchool();
    var form = event.currentTarget;
    var student = getUserById(form.studentId.value);

    if (!student || student.schoolId !== school.id || student.role !== ROLE_STUDENT) {
      toast("Invalid student.", "error");
      return;
    }

    var amount = Number(form.amount.value);

    if (!isFinite(amount) || amount < 0) {
      toast("Enter a valid amount.", "error");
      return;
    }

    state.fees.push({
      id: uid("fee"),
      schoolId: school.id,
      studentId: student.id,
      title: String(form.title.value).trim(),
      amount: amount,
      status: form.status.value,
      dueDate: form.dueDate.value
    });

    debounceSave();
    toast("Fee record added.");
    renderApp();
  }

  function deleteFee(id) {
    if (!hasRole(ROLE_ADMIN)) return;

    var school = getCurrentSchool();

    state.fees = state.fees.filter(function (item) {
      return !(item.id === id && item.schoolId === school.id);
    });

    debounceSave();
    toast("Fee record deleted.");
    renderApp();
  }

  /* ----------------------------- Events ----------------------------- */

  function eventsPage() {
    var user = getCurrentUser();
    var school = getCurrentSchool();
    var records = getSchoolData("events", school.id);

    var rows = records.map(function (item) {
      return "<tr>" +
        "<td>" + escapeHTML(item.name) + "</td>" +
        "<td>" + formatDate(item.date) + "</td>" +
        "<td>" + escapeHTML(item.location) + "</td>" +
        (user.role === ROLE_ADMIN
          ? '<td><button class="danger-link" data-action="delete-event" data-id="' +
            escapeHTML(item.id) + '">Delete</button></td>'
          : "<td>—</td>") +
      "</tr>";
    });

    var body = table(
      ["Event", "Date", "Location", "Action"],
      rows
    );

    if (user.role === ROLE_ADMIN) {
      body =
        '<form id="eventForm" class="form-grid">' +
          '<div>' +
            '<label>Event Name</label>' +
            '<input name="name" required placeholder="Annual Sports Day">' +
          '</div>' +
          '<div>' +
            '<label>Date</label>' +
            '<input name="date" type="date" required>' +
          '</div>' +
          '<div>' +
            '<label>Location</label>' +
            '<input name="location" required placeholder="School Ground">' +
          '</div>' +
          '<div>' +
            '<button class="primary-btn" type="submit">Add Event</button>' +
          '</div>' +
        '</form><hr>' +
        body;
    }

    return pageHeader("Events", "School events and activities.") +
      card("Events", body);
  }

  function addEvent(event) {
    event.preventDefault();

    if (!hasRole(ROLE_ADMIN)) return;

    var form = event.currentTarget;
    var school = getCurrentSchool();

    state.events.push({
      id: uid("event"),
      schoolId: school.id,
      name: String(form.name.value).trim(),
      date: form.date.value,
      location: String(form.location.value).trim()
    });

    debounceSave();
    toast("Event added.");
    renderApp();
  }

  function deleteEvent(id) {
    if (!hasRole(ROLE_ADMIN)) return;

    var school = getCurrentSchool();

    state.events = state.events.filter(function (item) {
      return !(item.id === id && item.schoolId === school.id);
    });

    debounceSave();
    toast("Event deleted.");
    renderApp();
  }

  /* ----------------------------- PTM ----------------------------- */

  function ptmPage() {
    var user = getCurrentUser();
    var school = getCurrentSchool();
    var records = getSchoolData("ptm", school.id);

    var rows = records.map(function (item) {
      return "<tr>" +
        "<td>" + formatDate(item.date) + "</td>" +
        "<td>" + escapeHTML(item.time) + "</td>" +
        "<td>" + escapeHTML(item.className + " - " + item.section) + "</td>" +
        "<td>" + escapeHTML(item.status) + "</td>" +
        (canManageAcademic()
          ? '<td><button class="danger-link" data-action="delete-ptm" data-id="' +
            escapeHTML(item.id) + '">Delete</button></td>'
          : "<td>—</td>") +
      "</tr>";
    });

    var body = table(
      ["Date", "Time", "Class", "Status", "Action"],
      rows
    );

    if (canManageAcademic()) {
      body =
        '<form id="ptmForm" class="form-grid">' +
          '<div>' +
            '<label>Date</label>' +
            '<input name="date" type="date" required>' +
          '</div>' +
          '<div>' +
            '<label>Time</label>' +
            '<input name="time" required placeholder="10:00 AM - 01:00 PM">' +
          '</div>' +
          '<div>' +
            '<label>Class</label>' +
            '<select name="className" required>' + classOptions() + '</select>' +
          '</div>' +
          '<div>' +
            '<label>Section</label>' +
            '<select name="section" required>' + sectionOptions() + '</select>' +
          '</div>' +
          '<div>' +
            '<label>Status</label>' +
            '<select name="status">' +
              option("Scheduled", "Scheduled", "Scheduled") +
              option("Completed", "Completed") +
              option("Cancelled", "Cancelled") +
            '</select>' +
          '</div>' +
          '<div>' +
            '<button class="primary-btn" type="submit">Add PTM</button>' +
          '</div>' +
        '</form><hr>' +
        body;
    }

    return pageHeader("PTM", "Parent-teacher meeting schedule and status.") +
      card("PTM Schedule", body);
  }

  function addPTM(event) {
    event.preventDefault();

    if (!canManageAcademic()) return;

    var school = getCurrentSchool();
    var form = event.currentTarget;

    state.ptm.push({
      id: uid("ptm"),
      schoolId: school.id,
      date: form.date.value,
      time: String(form.time.value).trim(),
      className: form.className.value,
      section: form.section.value,
      status: form.status.value
    });

    debounceSave();
    toast("PTM added.");
    renderApp();
  }

  function deletePTM(id) {
    if (!canManageAcademic()) return;

    var school = getCurrentSchool();

    state.ptm = state.ptm.filter(function (item) {
      return !(item.id === id && item.schoolId === school.id);
    });

    debounceSave();
    toast("PTM deleted.");
    renderApp();
  }

  /* ----------------------------- Leave ----------------------------- */

  function leavePage() {
    var user = getCurrentUser();
    var school = getCurrentSchool();

    var records = getSchoolData("leave", school.id);

    if (user.role === ROLE_STUDENT) {
      records = records.filter(function (item) {
        return item.studentId === user.id;
      });
    }

    var rows = records.map(function (item) {
      return "<tr>" +
        "<td>" + escapeHTML(getStudentName(item.studentId)) + "</td>" +
        "<td>" + formatDate(item.date) + "</td>" +
        "<td>" + escapeHTML(item.reason) + "</td>" +
        "<td>" + escapeHTML(item.status) + "</td>" +
        (canManageAcademic()
          ? '<td>' +
            '<button class="small-btn" data-action="approve-leave" data-id="' +
            escapeHTML(item.id) + '">Approve</button> ' +
            '<button class="danger-link" data-action="reject-leave" data-id="' +
            escapeHTML(item.id) + '">Reject</button>' +
            '</td>'
          : "<td>—</td>") +
      "</tr>";
    });

    var body = table(
      ["Student", "Date", "Reason", "Status", "Action"],
      rows
    );

    if (user.role === ROLE_STUDENT) {
      body =
        '<form id="leaveForm" class="form-grid">' +
          '<div>' +
            '<label>Date</label>' +
            '<input type="date" name="date" required>' +
          '</div>' +
          '<div class="full-width">' +
            '<label>Reason</label>' +
            '<textarea name="reason" required maxlength="500" rows="3"></textarea>' +
          '</div>' +
          '<div>' +
            '<button class="primary-btn" type="submit">Submit Leave Request</button>' +
          '</div>' +
        '</form><hr>' +
        body;
    }

    return pageHeader("Leave", "Submit and review leave requests.") +
      card("Leave Requests", body);
  }

  function submitLeave(event) {
    event.preventDefault();

    if (!hasRole(ROLE_STUDENT)) return;

    var school = getCurrentSchool();
    var user = getCurrentUser();
    var form = event.currentTarget;

    state.leave.push({
      id: uid("leave"),
      schoolId: school.id,
      studentId: user.id,
      date: form.date.value,
      reason: String(form.reason.value).trim(),
      status: "Pending"
    });

    debounceSave();
    toast("Leave request submitted.");
    renderApp();
  }

  function updateLeave(id, status) {
    if (!canManageAcademic()) return;

    var school = getCurrentSchool();
    var item = state.leave.find(function (record) {
      return record.id === id && record.schoolId === school.id;
    });

    if (!item) return;

    item.status = status;
    debounceSave();
    toast("Leave status updated.");
    renderApp();
  }

  /* ----------------------------- Feedback ----------------------------- */

  function feedbackPage() {
    var user = getCurrentUser();
    var school = getCurrentSchool();
    var records = getSchoolData("feedback", school.id);

    if (user.role !== ROLE_ADMIN) {
      records = records.filter(function (item) {
        return item.userId === user.id;
      });
    }

    var rows = records.slice().reverse().map(function (item) {
      return "<tr>" +
        "<td>" + escapeHTML(getUserById(item.userId) ?
          getUserById(item.userId).name : "Unknown") + "</td>" +
        "<td>" + escapeHTML(getUserById(item.userId) ?
          getUserById(item.userId).role : "Unknown") + "</td>" +
        "<td>" + escapeHTML(item.message) + "</td>" +
        "<td>" + formatDate(item.createdAt) + "</td>" +
      "</tr>";
    });

    var body = table(
      ["User", "Role", "Feedback", "Date"],
      rows
    );

    if (user.role === ROLE_STUDENT || user.role === ROLE_TEACHER) {
      body =
        '<form id="feedbackForm">' +
          '<label for="feedbackMessage">Your Feedback</label>' +
          '<textarea id="feedbackMessage" name="message" rows="4" maxlength="1000" ' +
            'required placeholder="Write your feedback..."></textarea>' +
          '<button class="primary-btn" type="submit">Submit Feedback</button>' +
        '</form><hr>' +
        body;
    }

    return pageHeader("Feedback", "Share useful feedback with your school.") +
      card("Feedback", body);
  }

  function submitFeedback(event) {
    event.preventDefault();

    if (!hasRole(ROLE_STUDENT, ROLE_TEACHER)) return;

    var form = event.currentTarget;
    var message = String(form.message.value).trim();

    if (!message) return;

    state.feedback.push({
      id: uid("feedback"),
      schoolId: getCurrentSchool().id,
      userId: getCurrentUser().id,
      message: message,
      createdAt: nowISO()
    });

    debounceSave();
    toast("Feedback submitted.");
    renderApp();
  }

  /* ----------------------------- Documents ----------------------------- */

  function documentsPage() {
    var school = getCurrentSchool();
    var records = getSchoolData("documents", school.id);

    var rows = records.map(function (item) {
      return "<tr>" +
        "<td>" + escapeHTML(item.title) + "</td>" +
        "<td>" + escapeHTML(item.category) + "</td>" +
        "<td>" + escapeHTML(item.fileName) + "</td>" +
        "<td>" + escapeHTML(item.note || "Demo document record") + "</td>" +
        (hasRole(ROLE_ADMIN)
          ? '<td><button class="danger-link" data-action="delete-document" data-id="' +
            escapeHTML(item.id) + '">Delete</button></td>'
          : "<td>—</td>") +
      "</tr>";
    });

    var body = table(
      ["Title", "Category", "File Name", "Note", "Action"],
      rows
    );

    if (hasRole(ROLE_ADMIN)) {
      body =
        '<form id="documentForm" class="form-grid">' +
          '<div>' +
            '<label>Document Title</label>' +
            '<input name="title" required maxlength="120">' +
          '</div>' +
          '<div>' +
            '<label>Category</label>' +
            '<select name="category">' +
              option("Academic", "Academic") +
              option("General", "General") +
              option("Circular", "Circular") +
              option("Other", "Other") +
            '</select>' +
          '</div>' +
          '<div>' +
            '<label>File</label>' +
            '<input name="file" type="file">' +
          '</div>' +
          '<div>' +
            '<label>Demo Note</label>' +
            '<input name="note" value="Local demo record — no server upload.">' +
          '</div>' +
          '<div class="full-width">' +
            '<button class="primary-btn" type="submit">Add Document Record</button>' +
          '</div>' +
        '</form>' +
        '<p class="muted">This prototype stores document metadata only. Files are not uploaded to a server.</p>' +
        '<hr>' +
        body;
    }

    return pageHeader("Documents", "School document records.") +
      card("Documents", body);
  }

  function addDocument(event) {
    event.preventDefault();

    if (!hasRole(ROLE_ADMIN)) return;

    var form = event.currentTarget;
    var file = form.file.files && form.file.files[0];

    state.documents.push({
      id: uid("doc"),
      schoolId: getCurrentSchool().id,
      title: String(form.title.value).trim(),
      category: form.category.value,
      fileName: file ? file.name : "No file selected",
      note: String(form.note.value).trim(),
      createdAt: nowISO()
    });

    debounceSave();
    toast("Document record added.");
    renderApp();
  }

  function deleteDocument(id) {
    if (!hasRole(ROLE_ADMIN)) return;

    var school = getCurrentSchool();

    state.documents = state.documents.filter(function (item) {
      return !(item.id === id && item.schoolId === school.id);
    });

    debounceSave();
    toast("Document record deleted.");
    renderApp();
  }

  /* ----------------------------- Study AI ----------------------------- */

  function studyAIPage() {
    var user = getCurrentUser();
    var school = getCurrentSchool();

    var history = getSchoolData("studyAI", school.id).filter(function (item) {
      return item.userId === user.id;
    });

    var chat = history.slice(-20).map(function (item) {
      return '<div class="chat-message user-message">' +
        '<strong>You</strong><p>' + escapeHTML(item.question) + '</p>' +
      '</div>' +
      '<div class="chat-message ai-message">' +
        '<strong>EduConnect Study AI</strong><p>' + escapeHTML(item.answer) + '</p>' +
      '</div>';
    }).join("");

    if (!chat) {
      chat =
        '<div class="ai-welcome">' +
          '<div class="ai-icon">🤖</div>' +
          '<h3>Study AI Demo</h3>' +
          '<p>Ask a school-study question. This frontend demo generates local guidance and does not connect to an external AI service.</p>' +
        '</div>';
    }

    return pageHeader("Study AI", "A safe frontend study assistant demo.") +
      card("Study Assistant",
        '<div id="aiChat" class="ai-chat">' + chat + '</div>' +
        '<form id="studyAIForm" class="ai-form">' +
          '<textarea id="aiQuestion" name="question" rows="3" maxlength="1000" ' +
            'placeholder="Ask a study question..." required></textarea>' +
          '<div class="ai-controls">' +
            '<label class="file-label">' +
              '📎 Optional image/file ' +
              '<input id="aiFile" type="file" accept="image/*,.pdf,.txt">' +
            '</label>' +
            '<button type="button" class="secondary-btn" id="voiceInputBtn">🎤 Voice</button>' +
            '<button type="submit" class="primary-btn">Ask</button>' +
            '<button type="button" class="secondary-btn" id="speakLastBtn">🔊 Speak Last Answer</button>' +
          '</div>' +
          '<p id="aiStatus" class="muted"></p>' +
        '</form>'
      );
  }

  function generateStudyAnswer(question) {
    var q = String(question || "").trim().toLowerCase();

    if (!q) {
      return "Please enter a study question.";
    }

    if (q.indexOf("math") >= 0 || q.indexOf("equation") >= 0) {
      return "Demo guidance: identify the given values, choose the relevant formula, solve one step at a time, and verify the final answer.";
    }

    if (q.indexOf("physics") >= 0) {
      return "Demo guidance: write the known quantities with units, identify the governing formula, substitute carefully, and check the unit of the final result.";
    }

    if (q.indexOf("chemistry") >= 0) {
      return "Demo guidance: first identify the chemical concept involved, write the balanced equation when needed, track units, and verify the final result.";
    }

    if (q.indexOf("study") >= 0 || q.indexOf("revision") >= 0) {
      return "Demo guidance: choose one small topic, study actively for 25–40 minutes, solve questions without looking at the answer, then review mistakes.";
    }

    return "Demo response: break the question into smaller parts, identify the concept, work through the steps carefully, and verify your answer. This prototype is not connected to an external AI API.";
  }

  function submitStudyAI(event) {
    event.preventDefault();

    var form = event.currentTarget;
    var question = String(form.question.value || "").trim();
    if (!question) return;

    var answer = generateStudyAnswer(question);

    state.studyAI.push({
      id: uid("ai"),
      schoolId: getCurrentSchool().id,
      userId: getCurrentUser().id,
      question: question,
      answer: answer,
      createdAt: nowISO()
    });

    debounceSave();
    renderApp();

    setTimeout(function () {
      speakText(answer);
    }, 50);
  }

  function startVoiceInput() {
    var SpeechRecognition = window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    var status = document.getElementById("aiStatus");
    var input = document.getElementById("aiQuestion");

    if (!SpeechRecognition) {
      if (status) status.textContent = "Voice input is not supported by this browser.";
      return;
    }

    try {
      var recognition = new SpeechRecognition();

      recognition.lang = "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      if (status) status.textContent = "Listening...";

      recognition.onresult = function (event) {
        if (input) {
          input.value = event.results[0][0].transcript;
        }
        if (status) status.textContent = "Voice input captured.";
      };

      recognition.onerror = function (event) {
        console.error("Speech recognition:", event.error);
        if (status) status.textContent = "Voice input could not be completed.";
      };

      recognition.onend = function () {
        if (status && status.textContent === "Listening...") {
          status.textContent = "Voice input ended.";
        }
      };

      recognition.start();
    } catch (error) {
      console.error("Voice input error:", error);
      if (status) status.textContent = "Voice input is unavailable.";
    }
  }

  function speakText(text) {
    if (!("speechSynthesis" in window)) return;

    try {
      window.speechSynthesis.cancel();

      var utterance = new SpeechSynthesisUtterance(String(text || ""));
      utterance.lang = "en-IN";
      utterance.rate = 0.95;

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("Speech synthesis:", error);
    }
  }

  function speakLastAnswer() {
    var user = getCurrentUser();
    var school = getCurrentSchool();

    var history = getSchoolData("studyAI", school.id).filter(function (item) {
      return item.userId === user.id;
    });

    if (!history.length) {
      toast("No answer available yet.", "error");
      return;
    }

    speakText(history[history.length - 1].answer);
  }

  /* ----------------------------- Profile ----------------------------- */

  function profilePage() {
    var user = getCurrentUser();
    var school = getCurrentSchool();

    return pageHeader("Profile", "Manage your EduConnect profile.") +
      card("Profile Information",
        '<form id="profileForm" class="form-grid">' +
          '<div>' +
            '<label>Name</label>' +
            '<input name="name" value="' + escapeHTML(user.name) + '" required maxlength="100">' +
          '</div>' +
          '<div>' +
            '<label>Role</label>' +
            '<input value="' + escapeHTML(user.role) + '" disabled>' +
          '</div>' +
          '<div>' +
            '<label>School</label>' +
            '<input value="' + escapeHTML(school.name) + '" disabled>' +
          '</div>' +
          '<div>' +
            '<label>School Code</label>' +
            '<input value="' + escapeHTML(school.code) + '" disabled>' +
          '</div>' +
          '<div>' +
            '<label>Phone / Account</label>' +
            '<input value="' + escapeHTML(user.phone || user.account || "") + '" disabled>' +
          '</div>' +
          (user.role === ROLE_STUDENT
            ? '<div>' +
              '<label>Class / Section</label>' +
              '<input value="' +
              escapeHTML((user.className || "—") + " / " + (user.section || "—")) +
              '" disabled>' +
            '</div>'
            : "") +
          (user.role === ROLE_STUDENT
            ? '<div>' +
              '<label>Roll Number</label>' +
              '<input value="' + escapeHTML(user.rollNo || "—") + '" disabled>' +
            '</div>'
            : "") +
          '<div class="full-width">' +
            '<button class="primary-btn" type="submit">Save Profile</button>' +
          '</div>' +
        '</form>'
      );
  }

  function updateProfile(event) {
    event.preventDefault();

    var user = getCurrentUser();
    var form = event.currentTarget;
    var name = String(form.name.value || "").trim();

    if (!name) {
      toast("Name cannot be empty.", "error");
      return;
    }

    var record = state.users.find(function (item) {
      return item.id === user.id &&
        item.schoolId === user.schoolId;
    });

    if (!record) return;

    record.name = name;
    debounceSave();
    toast("Profile updated.");
    renderApp();
  }

  /* ----------------------------- School Management ----------------------------- */

  function schoolManagementPage() {
    if (!canManageSchool()) {
      return pageHeader("School Management", "Administrator access required.") +
        card("Access Restricted",
          '<p>You do not have permission to manage school data.</p>');
    }

    var school = getCurrentSchool();
    var students = getStudents(school.id);
    var teachers = getTeachers(school.id);
    var classes = getClasses(school.id);
    var sections = getSections(school.id);
    var subjects = getSubjects(school.id);

    var studentRows = students.map(function (student) {
      return "<tr>" +
        "<td>" + escapeHTML(student.name) + "</td>" +
        "<td>" + escapeHTML(student.account || "") + "</td>" +
        "<td>" + escapeHTML(student.className || "—") + "</td>" +
        "<td>" + escapeHTML(student.section || "—") + "</td>" +
        "<td>" +
          '<button class="small-btn" data-action="edit-student" data-id="' +
          escapeHTML(student.id) + '">Edit</button> ' +
          '<button class="danger-link" data-action="delete-user" data-id="' +
          escapeHTML(student.id) + '">Delete</button>' +
        "</td>" +
      "</tr>";
    });

    var teacherRows = teachers.map(function (teacher) {
      return "<tr>" +
        "<td>" + escapeHTML(teacher.name) + "</td>" +
        "<td>" + escapeHTML(teacher.account || "") + "</td>" +
        "<td>" + escapeHTML((teacher.subjects || []).join(", ") || "—") + "</td>" +
        "<td>" + escapeHTML((teacher.classes || []).join(", ") || "—") + "</td>" +
        "<td>" +
          '<button class="small-btn" data-action="edit-teacher" data-id="' +
          escapeHTML(teacher.id) + '">Edit</button> ' +
          '<button class="danger-link" data-action="delete-user" data-id="' +
          escapeHTML(teacher.id) + '">Delete</button>' +
        "</td>" +
      "</tr>";
    });

    var classRows = classes.map(function (item) {
      return "<tr>" +
        "<td>" + escapeHTML(item.name) + "</td>" +
        '<td><button class="danger-link" data-action="delete-class" data-id="' +
        escapeHTML(item.id) + '">Delete</button></td>' +
      "</tr>";
    });

    var sectionRows = sections.map(function (item) {
      return "<tr>" +
        "<td>" + escapeHTML(item.className) + "</td>" +
        "<td>" + escapeHTML(item.name) + "</td>" +
        '<td><button class="danger-link" data-action="delete-section" data-id="' +
        escapeHTML(item.id) + '">Delete</button></td>' +
      "</tr>";
    });

    var subjectRows = subjects.map(function (item) {
      return "<tr>" +
        "<td>" + escapeHTML(item.name) + "</td>" +
        '<td><button class="danger-link" data-action="delete-subject" data-id="' +
        escapeHTML(item.id) + '">Delete</button></td>' +
      "</tr>";
    });

    return pageHeader("School Management", "Manage only your current school.") +

      '<div class="stats-grid">' +
        statCard("Students", String(students.length), "🎓") +
        statCard("Teachers", String(teachers.length), "👨‍🏫") +
        statCard("Classes", String(classes.length), "🏫") +
        statCard("Subjects", String(subjects.length), "📚") +
      "</div>" +

      card("School Information",
        '<form id="schoolInfoForm" class="form-grid">' +
          '<div>' +
            '<label>School Name</label>' +
            '<input name="name" value="' + escapeHTML(school.name) + '" required>' +
          '</div>' +
          '<div>' +
            '<label>School Code</label>' +
            '<input value="' + escapeHTML(school.code) + '" disabled>' +
          '</div>' +
          '<div>' +
            '<label>Address</label>' +
            '<input name="address" value="' + escapeHTML(school.address || "") + '">' +
          '</div>' +
          '<div>' +
            '<label>Phone</label>' +
            '<input name="phone" value="' + escapeHTML(school.phone || "") + '">' +
          '</div>' +
          '<div>' +
            '<label>Email</label>' +
            '<input name="email" type="email" value="' + escapeHTML(school.email || "") + '">' +
          '</div>' +
          '<div>' +
            '<label>Principal / Administrator</label>' +
            '<input name="principal" value="' + escapeHTML(school.principal || "") + '">' +
          '</div>' +
          '<div class="full-width">' +
            '<button class="primary-btn" type="submit">Save School Information</button>' +
          '</div>' +
        '</form>'
      ) +

      card("Add Student",
        '<form id="studentForm" class="form-grid">' +
          '<div><label>Name</label><input name="name" required></div>' +
          '<div><label>Account</label><input name="account" required></div>' +
          '<div><label>Phone</label><input name="phone" required></div>' +
          '<div><label>Password</label><input name="password" required value="student123"></div>' +
          '<div><label>Class</label><select name="className" required>' + classOptions() + '</select></div>' +
          '<div><label>Section</label><select name="section" required>' + sectionOptions() + '</select></div>' +
          '<div><label>Roll No.</label><input name="rollNo"></div>' +
          '<div><button class="primary-btn" type="submit">Add Student</button></div>' +
        '</form>'
      ) +

      card("Students",
        table(["Name", "Account", "Class", "Section", "Action"], studentRows)
      ) +

      card("Add Teacher",
        '<form id="teacherForm" class="form-grid">' +
          '<div><label>Name</label><input name="name" required></div>' +
          '<div><label>Account</label><input name="account" required></div>' +
          '<div><label>Phone</label><input name="phone" required></div>' +
          '<div><label>Password</label><input name="password" required value="teacher123"></div>' +
          '<div><label>Subjects</label><input name="subjects" placeholder="Mathematics, Science"></div>' +
          '<div><label>Classes</label><input name="classes" placeholder="9, 10"></div>' +
          '<div><button class="primary-btn" type="submit">Add Teacher</button></div>' +
        '</form>'
      ) +

      card("Teachers",
        table(["Name", "Account", "Subjects", "Classes", "Action"], teacherRows)
      ) +

      card("Add Class",
        '<form id="classForm" class="inline-form">' +
          '<input name="name" required placeholder="Class name, e.g. 11">' +
          '<button class="primary-btn" type="submit">Add Class</button>' +
        '</form>'
      ) +

      card("Classes",
        table(["Class", "Action"], classRows)
      ) +

      card("Add Section",
        '<form id="sectionForm" class="inline-form">' +
          '<select name="className" required>' + classOptions() + '</select>' +
          '<input name="name" required placeholder="Section, e.g. A">' +
          '<button class="primary-btn" type="submit">Add Section</button>' +
        '</form>'
      ) +

      card("Sections",
        table(["Class", "Section", "Action"], sectionRows)
      ) +

      card("Add Subject",
        '<form id="subjectForm" class="inline-form">' +
          '<input name="name" required placeholder="Subject name">' +
          '<button class="primary-btn" type="submit">Add Subject</button>' +
        '</form>'
      ) +

      card("Subjects",
        table(["Subject", "Action"], subjectRows)
      );
  }

  function addStudent(event) {
    event.preventDefault();

    if (!canManageSchool()) return;

    var school = getCurrentSchool();
    var form = event.currentTarget;
    var account = String(form.account.value).trim().toLowerCase();

    if (state.users.some(function (user) {
      return user.schoolId === school.id &&
        String(user.account || "").toLowerCase() === account;
    })) {
      toast("This account already exists in this school.", "error");
      return;
    }

    state.users.push({
      id: uid("student"),
      schoolId: school.id,
      name: String(form.name.value).trim(),
      role: ROLE_STUDENT,
      account: account,
      phone: String(form.phone.value).trim(),
      password: String(form.password.value),
      className: form.className.value,
      section: form.section.value,
      rollNo: String(form.rollNo.value).trim()
    });

    debounceSave();
    toast("Student added.");
    renderApp();
  }

  function addTeacher(event) {
    event.preventDefault();

    if (!canManageSchool()) return;

    var school = getCurrentSchool();
    var form = event.currentTarget;
    var account = String(form.account.value).trim().toLowerCase();

    if (state.users.some(function (user) {
      return user.schoolId === school.id &&
        String(user.account || "").toLowerCase() === account;
    })) {
      toast("This account already exists in this school.", "error");
      return;
    }

    state.users.push({
      id: uid("teacher"),
      schoolId: school.id,
      name: String(form.name.value).trim(),
      role: ROLE_TEACHER,
      account: account,
      phone: String(form.phone.value).trim(),
      password: String(form.password.value),
      subjects: String(form.subjects.value)
        .split(",")
        .map(function (item) { return item.trim(); })
        .filter(Boolean),
      classes: String(form.classes.value)
        .split(",")
        .map(function (item) { return item.trim(); })
        .filter(Boolean)
    });

    debounceSave();
    toast("Teacher added.");
    renderApp();
  }

  function addClass(event) {
    event.preventDefault();

    if (!canManageSchool()) return;

    var school = getCurrentSchool();
    var form = event.currentTarget;
    var name = String(form.name.value).trim();

    if (!name) return;

    if (getClasses(school.id).some(function (item) {
      return item.name.toLowerCase() === name.toLowerCase();
    })) {
      toast("Class already exists.", "error");
      return;
    }

    state.classes.push({
      id: uid("class"),
      schoolId: school.id,
      name: name
    });

    debounceSave();
    toast("Class added.");
    renderApp();
  }

  function addSection(event) {
    event.preventDefault();

    if (!canManageSchool()) return;

    var school = getCurrentSchool();
    var form = event.currentTarget;
    var name = String(form.name.value).trim().toUpperCase();

    if (!name) return;

    if (getSections(school.id, form.className.value).some(function (item) {
      return item.name.toLowerCase() === name.toLowerCase();
    })) {
      toast("Section already exists for this class.", "error");
      return;
    }

    state.sections.push({
      id: uid("section"),
      schoolId: school.id,
      name: name,
      className: form.className.value
    });

    debounceSave();
    toast("Section added.");
    renderApp();
  }

  function addSubject(event) {
    event.preventDefault();

    if (!canManageSchool()) return;

    var school = getCurrentSchool();
    var form = event.currentTarget;
    var name = String(form.name.value).trim();

    if (!name) return;

    if (getSubjects(school.id).some(function (item) {
      return item.name.toLowerCase() === name.toLowerCase();
    })) {
      toast("Subject already exists.", "error");
      return;
    }

    state.subjects.push({
      id: uid("subject"),
      schoolId: school.id,
      name: name
    });

    debounceSave();
    toast("Subject added.");
    renderApp();
  }

  function updateSchoolInfo(event) {
    event.preventDefault();

    if (!canManageSchool()) return;

    var school = getCurrentSchool();
    var form = event.currentTarget;

    school.name = String(form.name.value).trim();
    school.address = String(form.address.value).trim();
    school.phone = String(form.phone.value).trim();
    school.email = String(form.email.value).trim();
    school.principal = String(form.principal.value).trim();

    debounceSave();
    toast("School information updated.");
    renderApp();
  }

  function deleteUser(id) {
    if (!canManageSchool()) return;

    var school = getCurrentSchool();
    var user = getUserById(id);

    if (!user || user.schoolId !== school.id) return;
    if (user.role === ROLE_ADMIN) return;

    state.users = state.users.filter(function (item) {
      return item.id !== id;
    });

    state.attendance = state.attendance.filter(function (item) {
      return item.studentId !== id;
    });

    state.results = state.results.filter(function (item) {
      return item.studentId !== id;
    });

    state.fees = state.fees.filter(function (item) {
      return item.studentId !== id;
    });

    state.leave = state.leave.filter(function (item) {
      return item.studentId !== id;
    });

    debounceSave();
    toast("Account deleted.");
    renderApp();
  }

  function editStudent(id) {
    if (!canManageSchool()) return;

    var student = getUserById(id);
    var school = getCurrentSchool();

    if (!student || student.schoolId !== school.id ||
      student.role !== ROLE_STUDENT) return;

    var name = window.prompt("Student name:", student.name);
    if (name === null) return;

    name = name.trim();
    if (!name) return;

    student.name = name;
    debounceSave();
    toast("Student updated.");
    renderApp();
  }

  function editTeacher(id) {
    if (!canManageSchool()) return;

    var teacher = getUserById(id);
    var school = getCurrentSchool();

    if (!teacher || teacher.schoolId !== school.id ||
      teacher.role !== ROLE_TEACHER) return;

    var name = window.prompt("Teacher name:", teacher.name);
    if (name === null) return;

    name = name.trim();
    if (!name) return;

    teacher.name = name;
    debounceSave();
    toast("Teacher updated.");
    renderApp();
  }

  function deleteClass(id) {
    if (!canManageSchool()) return;

    var school = getCurrentSchool();

    state.classes = state.classes.filter(function (item) {
      return !(item.id === id && item.schoolId === school.id);
    });

    debounceSave();
    toast("Class deleted.");
    renderApp();
  }

  function deleteSection(id) {
    if (!canManageSchool()) return;

    var school = getCurrentSchool();

    state.sections = state.sections.filter(function (item) {
      return !(item.id === id && item.schoolId === school.id);
    });

    debounceSave();
    toast("Section deleted.");
    renderApp();
  }

  function deleteSubject(id) {
    if (!canManageSchool()) return;

    var school = getCurrentSchool();

    state.subjects = state.subjects.filter(function (item) {
      return !(item.id === id && item.schoolId === school.id);
    });

    debounceSave();
    toast("Subject deleted.");
    renderApp();
  }

  /* ----------------------------- Select Helpers ----------------------------- */

  function classOptions() {
    var classes = getClasses();

    if (!classes.length) {
      return '<option value="">No classes</option>';
    }

    return classes.map(function (item) {
      return option(item.name, item.name);
    }).join("");
  }

  function sectionOptions() {
    var sections = getSections();

    if (!sections.length) {
      return '<option value="">No sections</option>';
    }

    return sections.map(function (item) {
      return option(item.name, item.className + " — " + item.name);
    }).join("");
  }

  function subjectOptions() {
    var subjects = getSubjects();

    if (!subjects.length) {
      return '<option value="">No subjects</option>';
    }

    return subjects.map(function (item) {
      return option(item.name, item.name);
    }).join("");
  }

  function studentOptions() {
    var students = getStudents();

    if (!students.length) {
      return '<option value="">No students</option>';
    }

    return students.map(function (student) {
      return option(
        student.id,
        student.name + " — " +
        (student.className || "—") + " " +
        (student.section || "")
      );
    }).join("");
  }

  /* ----------------------------- Notices ----------------------------- */

  function noticesPage() {
    var school = getCurrentSchool();
    var records = getSchoolData("notices", school.id);

    var rows = records.slice().reverse().map(function (item) {
      return "<tr>" +
        "<td>" + escapeHTML(item.title) + "</td>" +
        "<td>" + escapeHTML(item.message) + "</td>" +
        "<td>" + formatDate(item.createdAt) + "</td>" +
      "</tr>";
    });

    return pageHeader("Notices", "School announcements.") +
      card("Notices", table(
        ["Title", "Message", "Date"],
        rows
      ));
  }

  function addNotice(title, message) {
    if (!hasRole(ROLE_ADMIN)) return;

    state.notices.push({
      id: uid("notice"),
      schoolId: getCurrentSchool().id,
      title: String(title || "").trim(),
      message: String(message || "").trim(),
      createdAt: nowISO(),
      createdBy: getCurrentUser().id
    });

    debounceSave();
  }

  /* ----------------------------- Event Delegation ----------------------------- */

  function bindPageEvents() {
    var container = document.getElementById("pageContainer");
    if (!container) return;

    var formBindings = {
      homeworkForm: addHomework,
      attendanceForm: addAttendance,
      resultForm: addResult,
      examForm: addExam,
      feeForm: addFee,
      eventForm: addEvent,
      ptmForm: addPTM,
      leaveForm: submitLeave,
      feedbackForm: submitFeedback,
      documentForm: addDocument,
      studyAIForm: submitStudyAI,
      profileForm: updateProfile,
      studentForm: addStudent,
      teacherForm: addTeacher,
      classForm: addClass,
      sectionForm: addSection,
      subjectForm: addSubject,
      schoolInfoForm: updateSchoolInfo
    };

    Object.keys(formBindings).forEach(function (id) {
      var form = document.getElementById(id);
      if (form) {
        form.addEventListener("submit", formBindings[id]);
      }
    });

    var voiceButton = document.getElementById("voiceInputBtn");
    if (voiceButton) {
      voiceButton.addEventListener("click", startVoiceInput);
    }

    var speakButton = document.getElementById("speakLastBtn");
    if (speakButton) {
      speakButton.addEventListener("click", speakLastAnswer);
    }

    container.querySelectorAll("[data-action]").forEach(function (button) {
      button.addEventListener("click", function () {
        var action = button.getAttribute("data-action");
        var id = button.getAttribute("data-id");

        switch (action) {
          case "delete-homework":
            deleteHomework(id);
            break;

          case "delete-fee":
            deleteFee(id);
            break;

          case "delete-event":
            deleteEvent(id);
            break;

          case "delete-ptm":
            deletePTM(id);
            break;

          case "approve-leave":
            updateLeave(id, "Approved");
            break;

          case "reject-leave":
            updateLeave(id, "Rejected");
            break;

          case "delete-document":
            deleteDocument(id);
            break;

          case "delete-user":
            deleteUser(id);
            break;

          case "edit-student":
            editStudent(id);
            break;

          case "edit-teacher":
            editTeacher(id);
            break;

          case "delete-class":
            deleteClass(id);
            break;

          case "delete-section":
            deleteSection(id);
            break;

          case "delete-subject":
            deleteSubject(id);
            break;

          default:
            console.warn("Unknown EduConnect action:", action);
        }
      });
    });
  }

  /* ----------------------------- Render Hook ----------------------------- */

  function renderCurrentPageEvents() {
    try {
      bindPageEvents();
    } catch (error) {
      console.error("EduConnect page event error:", error);
      renderFatalError(error);
    }
  }

  /* ----------------------------- Safe Render Override ----------------------------- */

  var originalRenderApp = renderApp;

  renderApp = function () {
    try {
      originalRenderApp();
      renderCurrentPageEvents();
    } catch (error) {
      console.error("EduConnect application error:", error);
      renderFatalError(error);
    }
  };

  /* ----------------------------- Global API ----------------------------- */

  window.EduConnect = {
    version: APP_VERSION,
    navigate: navigate,
    logout: logout,
    render: renderApp,
    reset: resetApplication,
    getCurrentUser: getCurrentUser,
    getCurrentSchool: getCurrentSchool
  };

  /*
   * Global functions are intentionally exposed for compatibility with
   * existing HTML or future integrations.
   */
  window.addResult = addResult;
  window.addExam = addExam;
  window.addFee = addFee;
  window.addHomework = addHomework;
  window.addAttendance = addAttendance;
  window.addEvent = addEvent;
  window.addPTM = addPTM;
  window.submitLeave = submitLeave;
  window.submitFeedback = submitFeedback;
  window.addDocument = addDocument;
  window.schoolManagementPage = schoolManagementPage;
  window.homeworkPage = homeworkPage;
  window.resultsPage = resultsPage;
  window.examsPage = examsPage;
  window.feesPage = feesPage;
  window.eventsPage = eventsPage;
  window.ptmPage = ptmPage;
  window.leavePage = leavePage;
  window.feedbackPage = feedbackPage;
  window.documentsPage = documentsPage;
  window.studyAIPage = studyAIPage;
  window.profilePage = profilePage;
  window.attendancePage = attendancePage;
  window.timetablePage = timetablePage;
  window.dashboardPage = dashboardPage;

  /* ----------------------------- Startup ----------------------------- */

  function startApplication() {
    try {
      loadState();

      var session = getSession();

      if (session && getCurrentUser() && getCurrentSchool()) {
        currentRoute = ROUTES.dashboard;
        renderApp();
      } else {
        clearSession();
        renderLogin();
      }
    } catch (error) {
      console.error("EduConnect startup error:", error);

      try {
        state = createDefaultState();
      } catch (fallbackError) {
        console.error("EduConnect fallback initialization error:", fallbackError);
      }

      renderFatalError(error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startApplication);
  } else {
    startApplication();
  }

})();
