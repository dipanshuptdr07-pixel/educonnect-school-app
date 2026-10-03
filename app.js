const K="edu_";

const S={
 user:JSON.parse(localStorage.getItem(K+"user")||"null"),
 hw:JSON.parse(localStorage.getItem(K+"hw")||"null")||[
  {id:1,s:"Mathematics",t:"Trigonometric Functions — Exercise 3",d:"Tomorrow",st:"Pending"},
  {id:2,s:"Physics",t:"Laws of Motion DPP",d:"Friday",st:"Pending"},
  {id:3,s:"Chemistry",t:"Mole Concept practice",d:"Monday",st:"Submitted"}
 ],
 nt:JSON.parse(localStorage.getItem(K+"nt")||"null")||[
  {t:"Parent–Teacher Meeting",d:"10 Oct 2026",x:"Meeting schedule will be shared by class teachers."},
  {t:"Sports Registration",d:"12 Oct 2026",x:"Submit sports participation details to the office."}
 ]
};

let page="Dashboard";
let role=S.user?.role||"Parent";
let open=false;

const save=()=>{
 localStorage.setItem(K+"user",JSON.stringify(S.user));
 localStorage.setItem(K+"hw",JSON.stringify(S.hw));
 localStorage.setItem(K+"nt",JSON.stringify(S.nt));
};

const esc=x=>String(x??"").replace(/[&<>"']/g,m=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
}[m]));

const staff=()=>role==="Teacher"||role==="Admin";

function toast(x){
 const e=document.createElement("div");
 e.textContent=x;
 e.style="position:fixed;right:16px;bottom:16px;background:#172033;color:white;padding:12px 15px;border-radius:11px;z-index:9999";
 document.body.append(e);
 setTimeout(()=>e.remove(),2000);
}

function render(){
 S.user?app():login();
}

function login(){
 document.getElementById("app").innerHTML=`
 <div class="login">
  <div class="loginbox">
   <img src="./icon-192.png">
   <h1>EduConnect</h1>
   <p class="muted">Smart school management in one place.</p>

   <div class="form">
    <label>School code</label>
    <input id="sc" class="input" value="DEMO01">

    <label>Phone number</label>
    <input id="ph" class="input" inputmode="numeric" maxlength="10"
           placeholder="10-digit demo number">

    <label>Continue as</label>

    <div class="roles">
     ${["Parent","Student","Teacher","Admin"].map(r=>`
      <button type="button"
       class="role ${role===r?"sel":""}"
       onclick="pickRole('${r}')">
       ${r}
      </button>
     `).join("")}
    </div>

    <button type="button" class="btn" onclick="enter()">
     Enter EduConnect
    </button>

    <button type="button" class="btn ghost"
     onclick="toggleDark()" style="margin-top:8px">
     🌙 Dark Mode
    </button>

    <small class="muted">Demo mode • no real OTP</small>
   </div>
  </div>
 </div>`;
}

/* ROLE BUTTON FIX */
function pickRole(r){
 role=r;
 login();
}

function enter(){
 const p=document.getElementById("ph").value.trim();

 if(!/^\d{10}$/.test(p)){
  return toast("Enter a 10-digit number");
 }

 S.user={
  name:role==="Admin"?"School Admin":role,
  role:role,
  phone:p
 };

 save();
 page="Dashboard";
 render();
}

function logout(){
 S.user=null;
 role="Parent";
 save();
 render();
}

function go(x){
 page=x;
 open=false;
 render();
}

function side(){
 open=!open;
 render();
}

function toggleDark(){
 document.body.classList.toggle("dark");
 localStorage.setItem(
  "edu_dark",
  document.body.classList.contains("dark")?"1":"0"
 );
}

function loadDark(){
 if(localStorage.getItem("edu_dark")==="1"){
  document.body.classList.add("dark");
 }
}

function app(){
 document.getElementById("app").innerHTML=`
 <div class="shell">

  <aside class="side ${open?"open":""}">
   <div class="brand">
    <img src="./icon-192.png">
    EduConnect
   </div>

   <div class="nav">
    ${[
     "Dashboard","Homework","Attendance","Timetable",
     "Results","Notices","Documents","Study AI"
    ].map(x=>`
     <button class="${page===x?"on":""}" onclick="go('${x}')">
      ${x}
     </button>
    `).join("")}
   </div>

   <button class="btn ghost"
    style="position:absolute;bottom:18px;left:14px;right:14px"
    onclick="logout()">
    ↪ Logout
   </button>
  </aside>

  <main class="main">
   <div class="top">

    <div style="display:flex;gap:10px">
     <button class="mobile" onclick="side()">☰</button>

     <div>
      <h1>${page}</h
      function attendance(){
 return `
 <div class="grid2">

  <div class="card">
   <div class="muted">Monthly attendance</div>
   <div class="num" style="font-size:55px">92%</div>
   <div class="muted">23 present • 2 absent</div>
  </div>

  <div class="card">
   <h2>Recent days</h2>

   <table class="table">
    ${["01 Oct","30 Sep","29 Sep","28 Sep","27 Sep"].map((d,i)=>`
     <tr>
      <td>${d}</td>
      <td>
       <span class="badge ${i===2?"":"ok"}">
        ${i===2?"Absent":"Present"}
       </span>
      </td>
     </tr>
    `).join("")}
   </table>
  </div>

 </div>`;
}


function timetable(){
 return `
 <div class="card">

  <table class="table">

   <tr>
    <th>Day</th>
    <th>1st</th>
    <th>2nd</th>
    <th>3rd</th>
    <th>4th</th>
   </tr>

   ${["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"].map((d,i)=>`
    <tr>
     <td><b>${d}</b></td>
     <td>Physics</td>
     <td>Mathematics</td>
     <td>Chemistry</td>
     <td>${i%2?"English":"Computer"}</td>
    </tr>
   `).join("")}

  </table>

 </div>`;
}


function results(){
 return `
 <div class="grid">

  ${[
   ["Overall","8.4","CGPA"],
   ["Physics","88","Marks"],
   ["Mathematics","91","Marks"],
   ["Chemistry","86","Marks"]
  ].map(x=>`
   <div class="card">
    <div class="muted">${x[0]}</div>
    <div class="num">${x[1]}</div>
    <div class="muted">${x[2]}</div>
   </div>
  `).join("")}

 </div>

 <div class="card" style="margin-top:16px">

  <h2>Unit Test • September 2026</h2>

  <table class="table">

   <tr>
    <th>Subject</th>
    <th>Marks</th>
    <th>Grade</th>
   </tr>

   ${[
    ["Physics","88/100","A"],
    ["Mathematics","91/100","A+"],
    ["Chemistry","86/100","A"]
   ].map(x=>`
    <tr>
     <td>${x[0]}</td>
     <td>${x[1]}</td>
     <td>
      <span class="badge ok">${x[2]}</span>
     </td>
    </tr>
   `).join("")}

  </table>

 </div>`;
}


function notices(){
 return `
 <div class="head">

  <h2>Notices & Circulars</h2>

  ${staff()
   ?`<button class="btn" onclick="addN()">+ New notice</button>`
   :""
  }

 </div>

 ${S.nt.map(n=>`
  <div class="card" style="margin-bottom:10px">

   <b>${esc(n.t)}</b>

   <span class="badge" style="float:right">
    ${esc(n.d)}
   </span>

   <p class="muted">
    ${esc(n.x)}
   </p>

  </div>
 `).join("")}`;
}


function addN(){

 const t=prompt("Title?","School Notice");
 if(!t)return;

 const x=prompt("Text?","Important school update");
 if(!x)return;

 S.nt.unshift({
  t:t,
  x:x,
  d:"Today"
 });

 save();
 render();

 toast("Notice added");
}


function docs(){
 return `
 <div class="grid2">

  <div class="card">

   <h2>School Documents</h2>

   ${[
    "Academic Calendar 2026–27.pdf",
    "Holiday List.pdf",
    "Exam Guidelines.pdf"
   ].map(x=>`
    <div class="row">
     <b>${x}</b>

     <button
      class="btn alt"
      onclick="toast('Demo document')">
      Open
     </button>
    </div>
   `).join("")}

  </div>


  <div class="card">

   <h2>Upload</h2>

   <p class="muted">
    PDF/image upload UI for the MVP.
   </p>

   <input
    class="input"
    type="file"
    accept=".pdf,image/*"
    multiple
    onchange="toast(this.files.length+' file(s) selected')"
   >

  </div>

 </div>`;
}


function ai(){
 return `
 <div class="card">

  <h2>Study AI</h2>

  <p class="muted">
   Ask a study question.
  </p>

  <textarea
   id="q"
   class="textarea"
   rows="5"
   placeholder="Explain Newton's second law in simple Hindi..."
  ></textarea>

  <br><br>

  <button
   class="btn"
   onclick="ask()">
   Ask Study AI
  </button>

  <div id="out"></div>

 </div>`;
}


function ask(){

 const q=document.getElementById("q").value.trim();

 if(!q){
  return toast("Write a question first");
 }

 document.getElementById("out").innerHTML=`

  <div
   class="card"
   style="margin-top:15px;background:#f8f9ff">

   <b>Demo response</b>

   <p class="muted">
    Question received. Production AI can be
    connected through a secure backend later.
   </p>

  </div>

 `;
}


loadDark();
render();
