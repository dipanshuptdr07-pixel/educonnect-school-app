/* =========================================================
   EDUCONNECT v7 — COMPLETE MOBILE-FIRST SCHOOL APP
   Roles: Student, Teacher, Admin
   Storage: localStorage
   Demo School: DEMO01
   Demo OTP: 123456
========================================================= */

(() => {
  "use strict";

  const APP = "EduConnect";
  const OTP = "123456";

  const K = {
    users:"ec7_users", accounts:"ec7_accounts", current:"ec7_current",
    homework:"ec7_homework", notices:"ec7_notices", notifications:"ec7_notifications",
    attendance:"ec7_attendance", results:"ec7_results", ptm:"ec7_ptm",
    contacts:"ec7_contacts", settings:"ec7_settings", events:"ec7_events",
    leaves:"ec7_leaves", feedback:"ec7_feedback", exams:"ec7_exams",
    fees:"ec7_fees", ai:"ec7_ai", school:"ec7_school", theme:"ec7_theme"
  };

  const DEMO_SCHOOL = {
    code:"DEMO01",
    name:"EduConnect Demo School",
    address:"India",
    classes:["9","10","11","12"],
    sections:["A","B"],
    subjects:["Physics","Chemistry","Mathematics","English","Computer Science"]
  };

  const DEMO_USERS = [
    {id:"STU001",role:"Student",name:"Dipanshu Patidar",phone:"9999999999",school:"DEMO01",class:"11",section:"A",roll:"01"},
    {id:"STU002",role:"Student",name:"Demo Student",phone:"8888888888",school:"DEMO01",class:"11",section:"A",roll:"02"},
    {id:"STU003",role:"Student",name:"Student Three",phone:"7777777777",school:"DEMO01",class:"11",section:"A",roll:"03"},
    {id:"T001",role:"Teacher",name:"Amit Sharma",phone:"9000000001",school:"DEMO01",subject:"Physics",classes:["11"],sections:["A"]},
    {id:"T002",role:"Teacher",name:"Neha Verma",phone:"9000000002",school:"DEMO01",subject:"Chemistry",classes:["11"],sections:["A"]},
    {id:"T003",role:"Teacher",name:"Rahul Joshi",phone:"9000000003",school:"DEMO01",subject:"Mathematics",classes:["11"],sections:["A"]},
    {id:"ADMIN001",role:"Admin",name:"School Admin",phone:"9000000000",school:"DEMO01"}
  ];

  const S = { page:"dashboard", menu:false, editing:null };

  /* ================= STORAGE ================= */

  const read = (key, fallback=[]) => {
    try {
      const x = localStorage.getItem(key);
      return x === null ? fallback : JSON.parse(x);
    } catch {
      return fallback;
    }
  };

  const write = (key,val) => localStorage.setItem(key,JSON.stringify(val));

  const uid = p =>
    (p + Date.now().toString(36) + Math.random().toString(36).slice(2,7)).toUpperCase();

  const today = () => new Date().toISOString().slice(0,10);

  const esc = v => String(v ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");

  const fmt = v => {
    if(!v) return "-";
    const d = new Date(v+"T00:00:00");
    return Number.isNaN(d.getTime()) ? v :
      d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
  };

  const users = () => read(K.users,[]);
  const current = () => {
    const id = localStorage.getItem(K.current);
    return users().find(x=>x.id===id) || null;
  };

  const school = () => read(K.school,DEMO_SCHOOL);

  const saveUsers = x => write(K.users,x);

  const staff = () => {
    const u=current();
    return !!u && (u.role==="Teacher" || u.role==="Admin");
  };

  const admin = () => current()?.role==="Admin";

  const initials = n =>
    String(n||"U").split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase();

  /* ================= SEED ================= */

  function seed(){
    if(!localStorage.getItem(K.school)) write(K.school,DEMO_SCHOOL);
    if(!localStorage.getItem(K.users)) write(K.users,DEMO_USERS);

    if(!localStorage.getItem(K.settings))
      write(K.settings,{notifications:true,language:"English"});

    if(!localStorage.getItem(K.theme)) write(K.theme,"system");

    if(!localStorage.getItem(K.homework))
      write(K.homework,[
        {id:"HW001",title:"Physics — Units & Dimensions",subject:"Physics",class:"11",section:"A",due:"2026-10-05",description:"Complete the assigned questions from the school module.",files:[],createdBy:"T001",createdAt:today()},
        {id:"HW002",title:"Chemistry — Mole Concept",subject:"Chemistry",class:"11",section:"A",due:"2026-10-07",description:"Solve the numerical questions given in today's class.",files:[],createdBy:"T002",createdAt:today()}
      ]);

    if(!localStorage.getItem(K.notices))
      write(K.notices,[
        {id:"N001",title:"Unit Test Schedule",message:"The upcoming unit test schedule has been uploaded.",class:"11",section:"A",attachment:null,createdBy:"ADMIN001",createdAt:today()}
      ]);

    if(!localStorage.getItem(K.notifications))
      write(K.notifications,[
        {id:"NT001",title:"Welcome to EduConnect",message:"Your school management dashboard is ready.",type:"system",date:today(),userId:null,class:null,section:null,read:false}
      ]);

    if(!localStorage.getItem(K.attendance)) write(K.attendance,[]);

    if(!localStorage.getItem(K.results))
      write(K.results,[
        {id:"R001",studentId:"STU001",class:"11",section:"A",test:"Unit Test 1",subject:"Physics",marks:82,max:100,published:true},
        {id:"R002",studentId:"STU001",class:"11",section:"A",test:"Unit Test 1",subject:"Chemistry",marks:76,max:100,published:true},
        {id:"R003",studentId:"STU001",class:"11",section:"A",test:"Unit Test 1",subject:"Mathematics",marks:89,max:100,published:true}
      ]);

    if(!localStorage.getItem(K.contacts))
      write(K.contacts,[
        {id:"T001",name:"Amit Sharma",subject:"Physics",phone:"9000000001",classes:["11"],sections:["A"]},
        {id:"T002",name:"Neha Verma",subject:"Chemistry",phone:"9000000002",classes:["11"],sections:["A"]},
        {id:"T003",name:"Rahul Joshi",subject:"Mathematics",phone:"9000000003",classes:["11"],sections:["A"]}
      ]);

    if(!localStorage.getItem(K.ptm)) write(K.ptm,[]);
    if(!localStorage.getItem(K.leaves)) write(K.leaves,[]);
    if(!localStorage.getItem(K.feedback)) write(K.feedback,[]);
    if(!localStorage.getItem(K.ai)) write(K.ai,[]);

    if(!localStorage.getItem(K.events))
      write(K.events,[{id:"E001",title:"Annual Sports Practice",date:"2026-10-10",description:"School sports practice and selection activity."}]);

    if(!localStorage.getItem(K.exams))
      write(K.exams,[
        {id:"EX001",class:"11",section:"A",subject:"Physics",date:"2026-10-15",time:"09:00",room:"Hall 1"},
        {id:"EX002",class:"11",section:"A",subject:"Chemistry",date:"2026-10-17",time:"09:00",room:"Hall 1"}
      ]);

    if(!localStorage.getItem(K.fees))
      write(K.fees,[{id:"F001",studentId:"STU001",title:"Annual School Fee",amount:25000,paid:15000,dueDate:"2026-10-30"}]);
  }

  /* ================= THEME ================= */

  function applyTheme(){
    const t=read(K.theme,"system");
    let dark=t==="dark";
    if(t==="system")
      dark=window.matchMedia?.("(prefers-color-scheme: dark)")?.matches || false;
    document.documentElement.classList.toggle("ec-dark",dark);
  }

  /* ================= CSS ================= */

  function css(){
    if(document.getElementById("ec-css")) return;

    const s=document.createElement("style");
    s.id="ec-css";
    s.textContent=`
:root{
--b:#3157d5;--b2:#5575ea;--bg:#f5f7fb;--card:#fff;--text:#172033;
--muted:#70798c;--border:#e4e8f0;--soft:#eef2ff;--green:#15945d;
--red:#dc3545;--orange:#c97516;--shadow:0 12px 35px rgba(31,50,100,.08)
}
*{box-sizing:border-box}
html,body{margin:0;min-height:100%;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;background:var(--bg);color:var(--text)}
body{min-height:100vh}button,input,textarea,select{font:inherit}button{cursor:pointer}
.ec-shell{min-height:100vh;display:flex}
.ec-side{width:250px;position:fixed;inset:0 auto 0 0;background:var(--card);border-right:1px solid var(--border);padding:18px 14px;z-index:50}
.ec-brand{display:flex;align-items:center;gap:10px;padding:5px 8px 20px;font-weight:900;font-size:20px;cursor:pointer}
.ec-logo{width:40px;height:40px;border-radius:13px;object-fit:cover;background:var(--soft)}
.ec-profile{padding:13px;border:1px solid var(--border);border-radius:17px;background:var(--soft);margin-bottom:18px}
.ec-profile-line{display:flex;gap:10px;align-items:center}
.ec-avatar{width:42px;height:42px;border-radius:14px;background:var(--b);color:#fff;display:grid;place-items:center;font-weight:900}
.ec-name{font-weight:850;font-size:14px}.ec-role{font-size:12px;color:var(--muted);margin-top:3px}
.ec-nav{display:grid;gap:6px}.ec-nav button{border:0;background:transparent;color:var(--text);text-align:left;padding:12px;border-radius:12px;display:flex;gap:10px;align-items:center}
.ec-nav button:hover{background:var(--soft);color:var(--b);font-weight:800}
.ec-main{width:calc(100% - 250px);margin-left:250px;padding:22px}
.ec-top{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:20px}
.ec-title h1{margin:0;font-size:27px}.ec-title p{margin:5px 0;color:var(--muted)}
.ec-actions{display:flex;gap:8px;flex-wrap:wrap}.ec-icon{width:43px;height:43px;border:1px solid var(--border);background:var(--card);border-radius:13px}
.ec-mobile{display:none}
.ec-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px}
.ec-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.ec-card{background:var(--card);border:1px solid var(--border);border-radius:20px;box-shadow:var(--shadow);padding:18px}
.ec-dashboard{position:relative;min-height:155px;overflow:hidden;cursor:pointer;transition:.2s}
.ec-dashboard:hover{transform:translateY(-2px)}
.ec-card-icon{width:48px;height:48px;border-radius:15px;background:var(--soft);color:var(--b);display:grid;place-items:center;font-size:23px}
.ec-dashboard h3{margin:17px 0 4px;font-size:16px}.ec-dashboard p{margin:0;color:var(--muted);font-size:13px}
.ec-art{position:absolute;right:-8px;bottom:-18px;font-size:75px;opacity:.07}
.ec-section{margin-top:22px}.ec-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:11px}.ec-head h2{margin:0;font-size:18px}
.ec-btn{border:0;border-radius:11px;padding:10px 14px;background:var(--b);color:#fff;font-weight:800}
.ec-btn.alt{background:var(--soft);color:var(--b)}.ec-btn.red{background:#ffecef;color:var(--red)}
.ec-btn.green{background:#e8f8f0;color:var(--green)}.ec-btn.sm{padding:7px 10px;font-size:12px}
.ec-input,.ec-select,.ec-textarea{width:100%;border:1px solid var(--border);border-radius:11px;padding:11px 12px;background:var(--card);color:var(--text);outline:0}
.ec-textarea{min-height:100px;resize:vertical}.ec-form{display:grid;gap:12px}
.ec-formgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.ec-field label{display:block;font-size:12px;color:var(--muted);font-weight:750;margin-bottom:5px}
.ec-list{display:grid;gap:10px}.ec-item{border:1px solid var(--border);border-radius:15px;padding:14px;background:var(--card)}
.ec-itemtop{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.ec-itemtitle{font-weight:850}
.ec-muted{color:var(--muted)}.ec-badge{display:inline-flex;border-radius:999px;padding:5px 9px;background:var(--soft);color:var(--b);font-size:11px;font-weight:800}
.ec-badge.green{background:#e8f8f0;color:var(--green)}.ec-badge.red{background:#ffecef;color:var(--red)}.ec-badge.orange{background:#fff3e2;color:var(--orange)}
.ec-tablewrap{overflow:auto}.ec-table{width:100%;border-collapse:collapse;min-width:650px}.ec-table th,.ec-table td{padding:10px;border-bottom:1px solid var(--border);text-align:left;font-size:13px}.ec-table th{font-size:11px;color:var(--muted);text-transform:uppercase}
.ec-empty{text-align:center;padding:32px;color:var(--muted)}
.ec-login{min-height:100vh;display:grid;place-items:center;padding:18px;background:radial-gradient(circle at top left,#e9edff,transparent 35%),var(--bg)}
.ec-loginbox{width:min(470px,100%);background:var(--card);border:1px solid var(--border);border-radius:25px;box-shadow:0 25px 70px rgba(31,50,100,.12);padding:28px}
.ec-loginhead{text-align:center}.ec-loginlogo{width:72px;height:72px;border-radius:21px;object-fit:cover}.ec-loginhead h1{margin:10px 0 3px}.ec-loginhead p{color:var(--muted);margin:5px}
.ec-roles{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.ec-rolebtn{border:1px solid var(--border);background:var(--card);border-radius:11px;padding:10px}.ec-rolebtn.sel{background:var(--soft);border-color:var(--b);color:var(--b);font-weight:800}
.ec-note{background:var(--soft);padding:10px;border-radius:11px;font-size:12px;color:var(--b);margin-top:12px}
.ec-stat{display:flex;justify-content:space-between;align-items:center}.ec-num{font-size:28px;font-weight:900;margin-top:5px}
.ec-check{display:flex;gap:8px;align-items:center;padding:9px;border:1px solid var(--border);border-radius:10px}
.ec-divider{height:1px;background:var(--border);margin:15px 0}
.ec-overlay{position:fixed;inset:0;background:#0006;z-index:40;display:none}
.ec-toast{position:fixed;right:18px;bottom:18px;background:#172033;color:#fff;padding:12px 16px;border-radius:12px;z-index:100;box-shadow:0 10px 30px #0003}
.ec-hidden{display:none!important}
@media(max-width:900px){.ec-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:700px){
.ec-side{transform:translateX(-105%);transition:.2s}.ec-side.open{transform:translateX(0)}
.ec-main{margin:0;width:100%;padding:15px}.ec-mobile{display:block}
.ec-grid,.ec-grid2,.ec-formgrid{grid-template-columns:1fr}
.ec-title h1{font-size:23px}.ec-top{align-items:flex-start}
.ec-loginbox{padding:21px}.ec-dashboard{min-height:145px}
}
.ec-dark{--bg:#0b1220;--card:#111827;--text:#e5e7eb;--muted:#9ca3af;--border:#293548;--soft:#1c2943;--shadow:0 12px 35px rgba(0,0,0,.25)}
.ec-dark .ec-login{background:#0b1220}.ec-dark .ec-btn.red{background:#3a1820}
`;
    document.head.appendChild(s);
  }

  /* ================= HELPERS ================= */

  function toast(msg){
    const old=document.querySelector(".ec-toast");
    old?.remove();
    const x=document.createElement("div");
    x.className="ec-toast";
    x.textContent=msg;
    document.body.appendChild(x);
    setTimeout(()=>x.remove(),2200);
  }

  function notify(title,message,type="system",userId=null,cl=null,sec=null){
    const a=read(K.notifications,[]);
    a.unshift({id:uid("NT"),title,message,type,date:today(),userId,class:cl,section:sec,read:false});
    write(K.notifications,a);
  }

  function visibleNotifications(){
    const u=current();
    if(!u) return [];
    return read(K.notifications,[]).filter(n=>
      !n.userId || n.userId===u.id ||
      (u.class && n.class===u.class && (!n.section || n.section===u.section))
    );
  }

  function visibleHomework(){
    const u=current();
    const a=read(K.homework,[]);
    if(!u || staff()) return a;
    return a.filter(x=>x.class===u.class && (!x.section || x.section===u.section));
  }

  function visibleNotices(){
    const u=current();
    const a=read(K.notices,[]);
    if(!u || staff()) return a;
    return a.filter(x=>x.class===u.class && (!x.section || x.section===u.section));
  }

  function visibleExams(){
    const u=current();
    const a=read(K.exams,[]);
    if(!u || staff()) return a;
    return a.filter(x=>x.class===u.class && x.section===u.section);
  }

  function studentsFor(c=null,s=null){
    return users().filter(u=>u.role==="Student" &&
      (!c || u.class===c) && (!s || u.section===s));
  }

  function grade(p){
    if(p>=90)return"A+";
    if(p>=80)return"A";
    if(p>=70)return"B+";
    if(p>=60)return"B";
    if(p>=50)return"C";
    if(p>=40)return"D";
    return"F";
  }

  function nav(page){
    S.page=page; S.editing=null; S.menu=false; render();
  }

  /* ================= LOGIN ================= */

  function login(){
    const role="Student";
    document.body.innerHTML=`
      <div class="ec-login">
        <div class="ec-loginbox">
          <div class="ec-loginhead">
            <img class="ec-loginlogo" src="./icon-192.png" onerror="this.style.display='none'">
            <h1>EduConnect</h1>
            <p>Smart School Management</p>
          </div>

          <div class="ec-form" style="margin-top:22px">
            <div class="ec-field">
              <label>Role</label>
              <div class="ec-roles">
                <button class="ec-rolebtn sel" data-role="Student">Student</button>
                <button class="ec-rolebtn" data-role="Teacher">Teacher</button>
                <button class="ec-rolebtn" data-role="Admin">Admin</button>
              </div>
            </div>

            <div class="ec-field">
              <label>School Code</label>
              <input id="loginSchool" class="ec-input" value="DEMO01">
            </div>

            <div class="ec-field">
              <label>Phone Number</label>
              <input id="loginPhone" class="ec-input" inputmode="numeric" placeholder="Enter phone number">
            </div>

            <div class="ec-field">
              <label>OTP</label>
              <input id="loginOtp" class="ec-input" inputmode="numeric" maxlength="6" placeholder="Demo OTP: 123456">
            </div>

            <button id="loginBtn" class="ec-btn">Login</button>

            <div class="ec-note">
              Demo Student: 9999999999<br>
              Demo Teacher: 9000000001<br>
              Demo Admin: 9000000000<br>
              OTP: <b>123456</b>
            </div>
          </div>
        </div>
      </div>
    `;

    let selected=role;

    document.querySelectorAll("[data-role]").forEach(b=>{
      b.onclick=()=>{
        selected=b.dataset.role;
        document.querySelectorAll("[data-role]").forEach(x=>x.classList.remove("sel"));
        b.classList.add("sel");
      };
    });

    document.getElementById("loginBtn").onclick=()=>{
      const schoolCode=document.getElementById("loginSchool").value.trim().toUpperCase();
      const phone=document.getElementById("loginPhone").value.trim();
      const otp=document.getElementById("loginOtp").value.trim();

      const u=users().find(x=>
        x.role===selected &&
        x.school===schoolCode &&
        x.phone===phone
      );

      if(schoolCode!=="DEMO01") return toast("Invalid school code");
      if(otp!==OTP) return toast("Wrong demo OTP");
      if(!u) return toast("Demo account not found");

      localStorage.setItem(K.current,u.id);

      const ac=read(K.accounts,[]);
      if(!ac.some(x=>x.id===u.id)){
        ac.push({id:u.id,name:u.name,role:u.role,phone:u.phone,school:u.school});
        write(K.accounts,ac);
      }

      render();
    };
  }

  /* ================= SIDEBAR ================= */

  function sidebar(){
    const u=current();
    return `
      <aside class="ec-side ${S.menu?"open":""}">
        <div class="ec-brand" onclick="EC.nav('dashboard')">
          <img class="ec-logo" src="./icon-192.png" onerror="this.style.display='none'">
          EduConnect
        </div>

        <div class="ec-profile">
          <div class="ec-profile-line">
            <div class="ec-avatar">${initials(u.name)}</div>
            <div>
              <div class="ec-name">${esc(u.name)}</div>
              <div class="ec-role">${esc(u.role)}</div>
            </div>
          </div>
        </div>

        <div class="ec-nav">
          <button onclick="EC.nav('profile')">👤 Profile</button>
          <button onclick="EC.nav('settings')">⚙️ Settings</button>
          <button onclick="EC.nav('accounts')">🔄 Multiple Accounts</button>
          <button onclick="EC.logout()">🚪 Logout</button>
        </div>
      </aside>
      <div class="ec-overlay" style="${S.menu?"display:block":""}" onclick="EC.toggleMenu()"></div>
    `;
  }

  /* ================= DASHBOARD ================= */

  const cards=[
    ["attendance","📊","Attendance","Track attendance","📅"],
    ["homework","📚","Homework","Assignments & submissions","📖"],
    ["notices","📢","Notices","School announcements","📣"],
    ["results","🏆","Results","Tests & performance","🎓"]
