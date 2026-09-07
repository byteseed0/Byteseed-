const $ = id => document.getElementById(id);

/* ---------- Shared: nav, footer year, toast ---------- */
if($("menuBtn")){
  $("menuBtn").addEventListener("click",()=>{$("nav").classList.toggle("open");$("menuBtn").classList.toggle("open");});
  document.querySelectorAll("nav a").forEach(a=>a.addEventListener("click",()=>{ $("nav").classList.remove("open"); $("menuBtn").classList.remove("open"); }));
}
if($("year")) $("year").textContent=new Date().getFullYear();

function showToast(message){
  const t=$("toast");
  if(!t) return;
  t.textContent=message;t.classList.add("show");
  clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove("show"),2400);
}

function escapeHTML(str){
  return str.replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
}

/* ---------- Copy buttons (shared across tool pages) ---------- */
document.querySelectorAll(".copy-btn").forEach(btn=>{
  btn.addEventListener("click",async ()=>{
    const targetId=btn.dataset.copy;
    const el=$(targetId);
    if(!el || !el.value){ showToast("Nothing to copy yet."); return; }
    try{
      await navigator.clipboard.writeText(el.value);
      showToast("Copied to clipboard.");
    }catch(e){
      el.select();
      document.execCommand("copy");
      showToast("Copied to clipboard.");
    }
  });
});

/* ---------- CV Builder (cv-builder.html) ---------- */
(function cvBuilder(){
  const form=$("cvForm");
  if(!form) return;

  const fields=["name","title","email","phone","location","website","summary","education","college","eduYear","experienceRole","experienceCompany","experiencePeriod","experienceDetails","skills","certifications","projectName","projectDetails"];

  function value(id, fallback){return $(id).value.trim() || fallback;}

  function updateCV(){
    $("pName").textContent=value("name","Your Name");
    $("pTitle").textContent=value("title","Professional Title");
    const contact=[value("email","Email"),value("phone","Phone"),value("location","Location"),value("website","")].filter(Boolean);
    $("pContact").textContent=contact.join(" • ");
    $("pSummary").textContent=value("summary","Your professional summary will appear here.");
    $("pExpRole").textContent=value("experienceRole","Your Role");
    $("pExpCompany").textContent=value("experienceCompany","Company");
    $("pExpPeriod").textContent=value("experiencePeriod","Period");
    $("pExpDetails").textContent=value("experienceDetails","Your experience details.");
    $("pEducation").textContent=value("education","Degree / Course");
    $("pCollege").textContent=value("college","Institution");
    $("pEduYear").textContent=value("eduYear","Period");
    $("pProjectName").textContent=value("projectName","Project Name");
    $("pProjectDetails").textContent=value("projectDetails","Project details.");

    const skills=value("skills","Example Skill").split(",").map(x=>x.trim()).filter(Boolean);
    $("pSkills").innerHTML=skills.map(x=>`<span>${escapeHTML(x)}</span>`).join("");

    const certs=$("certifications").value.trim();
    $("pCertifications").innerHTML=certs ? certs.split("\n").filter(Boolean).map(x=>`<div class="cert-line">${escapeHTML(x)}</div>`).join("") : "Certificate details";
  }

  fields.forEach(id=>{
    const saved=localStorage.getItem("byteseed_"+id);
    if(saved!==null) $(id).value=saved;
    $(id).addEventListener("input",()=>{
      localStorage.setItem("byteseed_"+id,$(id).value);
      updateCV();
    });
  });

  $("printBtn").addEventListener("click",()=>window.print());
  $("clearBtn").addEventListener("click",()=>{
    if(!confirm("Clear all CV information?")) return;
    fields.forEach(id=>{localStorage.removeItem("byteseed_"+id);$(id).value="";});
    updateCV();
    showToast("CV information cleared.");
  });

  /* ---- Template + photo selection ---- */
  const preview=$("cvPreview");
  const swatches=document.querySelectorAll(".tpl-swatch");
  const includePhoto=$("includePhoto");
  const photoLabel=$("photoUploadLabel");
  const photoInput=$("photoInput");
  const photoThumb=$("photoPreviewThumb");
  const photoRow=$("photoPreviewRow");

  function setThumb(dataUrl){
    if(dataUrl){
      photoThumb.src=dataUrl;
      photoRow.classList.add("has-photo");
    }else{
      photoThumb.removeAttribute("src");
      photoRow.classList.remove("has-photo");
    }
  }

  function applyTemplate(tpl){
    preview.className="cv-paper tpl-"+tpl;
    if(includePhoto.checked && tpl!=="ats") preview.classList.add("show-photo");
    swatches.forEach(s=>s.classList.toggle("active", s.dataset.tpl===tpl));
    if(tpl==="ats"){
      photoLabel.style.display="none";
      includePhoto.checked=false;
      includePhoto.disabled=true;
      preview.classList.remove("show-photo");
    }else{
      photoLabel.style.display="";
      includePhoto.disabled=false;
    }
    localStorage.setItem("byteseed_template",tpl);
  }

  swatches.forEach(s=>s.addEventListener("click",()=>applyTemplate(s.dataset.tpl)));

  includePhoto.addEventListener("change",()=>{
    preview.classList.toggle("show-photo", includePhoto.checked);
    localStorage.setItem("byteseed_includePhoto", includePhoto.checked ? "1":"0");
  });

  photoInput.addEventListener("change",()=>{
    const file=photoInput.files[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>{
      $("pPhoto").src=reader.result;
      localStorage.setItem("byteseed_photo",reader.result);
      includePhoto.checked=true;
      preview.classList.add("show-photo");
      setThumb(reader.result);
      showToast("Photo added to your CV.");
    };
    reader.readAsDataURL(file);
  });

  const params=new URLSearchParams(location.search);
  const urlTpl=params.get("template");
  const urlPhoto=params.get("photo");
  const savedTpl=localStorage.getItem("byteseed_template") || "classic";
  const savedPhotoFlag=localStorage.getItem("byteseed_includePhoto")==="1";
  const savedPhotoData=localStorage.getItem("byteseed_photo");

  if(savedPhotoData){ $("pPhoto").src=savedPhotoData; setThumb(savedPhotoData); }
  includePhoto.checked = urlPhoto!==null ? urlPhoto==="1" : savedPhotoFlag;
  applyTemplate(urlTpl || savedTpl);

  updateCV();
})();

/* ---------- Text Counter (text-counter.html) ---------- */
(function textCounter(){
  const input=$("tcInput");
  if(!input) return;
  function update(){
    const text=input.value;
    const trimmed=text.trim();
    const words=trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars=text.length;
    const charsNoSpace=text.replace(/\s/g,"").length;
    const lines=text ? text.split(/\n/).length : 0;
    const sentences=trimmed ? (trimmed.match(/[^.!?]+[.!?]+/g) || (trimmed?[trimmed]:[])).length : 0;
    const paragraphs=trimmed ? trimmed.split(/\n\s*\n/).filter(p=>p.trim()).length : 0;
    $("tcWords").textContent=words;
    $("tcChars").textContent=chars;
    $("tcCharsNoSpace").textContent=charsNoSpace;
    $("tcLines").textContent=lines;
    $("tcSentences").textContent=sentences;
    $("tcParagraphs").textContent=paragraphs;
  }
  input.addEventListener("input",update);
  update();
})();

/* ---------- Case Converter (case-converter.html) ---------- */
(function caseConverter(){
  const input=$("ccInput"), output=$("ccOutput");
  if(!input) return;
  function toTitle(s){return s.replace(/\w\S*/g,t=>t.charAt(0).toUpperCase()+t.slice(1).toLowerCase());}
  function toSentence(s){
    const lower=s.toLowerCase();
    return lower.replace(/(^\s*\w|[.!?]\s*\w)/g,c=>c.toUpperCase());
  }
  document.querySelectorAll("[data-case]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const text=input.value;
      let result="";
      switch(btn.dataset.case){
        case "upper": result=text.toUpperCase(); break;
        case "lower": result=text.toLowerCase(); break;
        case "title": result=toTitle(text); break;
        case "sentence": result=toSentence(text); break;
      }
      output.value=result;
    });
  });
})();

/* ---------- Password Generator (password-generator.html) ---------- */
(function passwordGenerator(){
  const output=$("pgOutput");
  if(!output) return;
  const lengthInput=$("pgLength"), lengthVal=$("pgLengthVal");
  const upper="ABCDEFGHIJKLMNOPQRSTUVWXYZ", lower="abcdefghijklmnopqrstuvwxyz", numbers="0123456789", symbols="!@#$%^&*()_-+=?";

  lengthInput.addEventListener("input",()=>lengthVal.textContent=lengthInput.value);

  function strength(pw, poolSize){
    const bits=Math.log2(Math.max(poolSize,1))*pw.length;
    if(bits<40) return {label:"Weak",pct:30};
    if(bits<70) return {label:"Fair",pct:55};
    if(bits<95) return {label:"Strong",pct:80};
    return {label:"Very strong",pct:100};
  }

  function generate(){
    let pool="";
    if($("pgUpper").checked) pool+=upper;
    if($("pgLower").checked) pool+=lower;
    if($("pgNumbers").checked) pool+=numbers;
    if($("pgSymbols").checked) pool+=symbols;
    if(!pool){ showToast("Select at least one character type."); return; }
    const len=parseInt(lengthInput.value,10);
    let pw="";
    const arr=new Uint32Array(len);
    (window.crypto || window.msCrypto).getRandomValues(arr);
    for(let i=0;i<len;i++) pw+=pool[arr[i]%pool.length];
    output.value=pw;
    const s=strength(pw,pool.length);
    $("pgStrengthFill").style.width=s.pct+"%";
    $("pgStrengthLabel").textContent="Strength: "+s.label;
  }
  $("pgGenerate").addEventListener("click",generate);
  generate();
})();

/* ---------- JSON Formatter (json-formatter.html) ---------- */
(function jsonFormatter(){
  const input=$("jsonInput"), output=$("jsonOutput"), status=$("jsonStatus");
  if(!input) return;
  function setStatus(msg, ok){
    status.textContent=msg;
    status.className="json-status "+(ok?"ok":"error");
  }
  $("jsonFormat").addEventListener("click",()=>{
    try{
      const parsed=JSON.parse(input.value);
      output.value=JSON.stringify(parsed,null,2);
      setStatus("Valid JSON — formatted.",true);
    }catch(e){ setStatus("Invalid JSON: "+e.message,false); }
  });
  $("jsonMinify").addEventListener("click",()=>{
    try{
      const parsed=JSON.parse(input.value);
      output.value=JSON.stringify(parsed);
      setStatus("Valid JSON — minified.",true);
    }catch(e){ setStatus("Invalid JSON: "+e.message,false); }
  });
  $("jsonValidate").addEventListener("click",()=>{
    try{
      JSON.parse(input.value);
      setStatus("Valid JSON.",true);
    }catch(e){ setStatus("Invalid JSON: "+e.message,false); }
  });
})();

/* ---------- Attendance Calculator (student-tools.html) ---------- */
(function attendanceCalculator(){
  const btn=$("attCalc");
  if(!btn) return;
  btn.addEventListener("click",()=>{
    const total=parseFloat($("attTotal").value);
    const attended=parseFloat($("attAttended").value);
    const target=parseFloat($("attTarget").value)||75;
    const box=$("attResult");
    if(!total || total<=0 || isNaN(attended) || attended<0 || attended>total){
      box.className="result-box warn"; box.textContent="Please enter valid class numbers (attended can't exceed total).";
      return;
    }
    const current=(attended/total*100);
    if(current>=target){
      const canMiss=Math.max(Math.floor((attended*100/target)-total),0);
      box.className="result-box ok";
      box.textContent=`Current attendance: ${current.toFixed(2)}%. You can miss ${canMiss} more class(es) in a row and stay at or above ${target}%.`;
    }else{
      const need=Math.max(Math.ceil((target*total-100*attended)/(100-target)),0);
      box.className="result-box warn";
      box.textContent=`Current attendance: ${current.toFixed(2)}%. Attend the next ${need} class(es) in a row to reach ${target}%.`;
    }
  });
})();

/* ---------- CGPA Calculator (student-tools.html) ---------- */
(function cgpaCalculator(){
  const addBtn=$("cgpaAddRow");
  if(!addBtn) return;
  const rows=$("cgpaRows");

  function bindRemove(row){
    row.querySelector(".remove-row").addEventListener("click",()=>{
      if(rows.children.length>1) row.remove();
    });
  }
  rows.querySelectorAll(".cgpa-row").forEach(bindRemove);

  addBtn.addEventListener("click",()=>{
    const div=document.createElement("div");
    div.className="cgpa-row";
    div.innerHTML=`<input type="number" placeholder="Credits" class="cgpaCredit" min="0"><input type="number" placeholder="Grade point (0-10)" class="cgpaPoint" min="0" max="10" step="0.1"><button type="button" class="remove-row">×</button>`;
    rows.appendChild(div);
    bindRemove(div);
  });

  $("cgpaCalc").addEventListener("click",()=>{
    const creditEls=rows.querySelectorAll(".cgpaCredit");
    const pointEls=rows.querySelectorAll(".cgpaPoint");
    let totalCredits=0, totalPoints=0, valid=false;
    creditEls.forEach((el,i)=>{
      const c=parseFloat(el.value), p=parseFloat(pointEls[i].value);
      if(!isNaN(c) && !isNaN(p) && c>0){ totalCredits+=c; totalPoints+=c*p; valid=true; }
    });
    const box=$("cgpaResult");
    if(!valid || totalCredits===0){ box.className="result-box warn"; box.textContent="Enter at least one valid credit and grade point."; return; }
    const cgpa=totalPoints/totalCredits;
    box.className="result-box ok";
    box.textContent=`Your CGPA: ${cgpa.toFixed(2)} (≈ ${(cgpa*9.5).toFixed(2)}% using the common ×9.5 formula — check what your university uses).`;
  });
})();

/* ---------- Percentage Calculator (student-tools.html) ---------- */
(function percentageCalculator(){
  const btn=$("pctCalc");
  if(!btn) return;
  btn.addEventListener("click",()=>{
    const obtained=parseFloat($("pctObtained").value), total=parseFloat($("pctTotal").value);
    const box=$("pctResult");
    if(isNaN(obtained) || !total || total<=0 || obtained<0 || obtained>total){
      box.className="result-box warn"; box.textContent="Please enter valid marks."; return;
    }
    box.className="result-box ok";
    box.textContent=`Percentage: ${(obtained/total*100).toFixed(2)}%`;
  });

  $("cgpaToPctCalc").addEventListener("click",()=>{
    const cgpa=parseFloat($("pctCgpa").value);
    const box=$("cgpaToPctResult");
    if(isNaN(cgpa) || cgpa<0 || cgpa>10){ box.className="result-box warn"; box.textContent="Enter a valid CGPA between 0 and 10."; return; }
    box.className="result-box ok";
    box.textContent=`Estimated percentage: ${(cgpa*9.5).toFixed(2)}% (formula varies by university — check yours).`;
  });
})();

/* ---------- HTML Compiler (html-compiler.html) ---------- */
(function htmlCompiler(){
  const runBtn=$("compilerRun");
  if(!runBtn) return;
  const htmlArea=$("compilerHtml"), cssArea=$("compilerCss"), jsArea=$("compilerJs"), frame=$("compilerFrame");
  const tabs=document.querySelectorAll(".tab-btn");
  const panels={html:htmlArea, css:cssArea, js:jsArea};
  const defaults={html:htmlArea.value, css:cssArea.value, js:jsArea.value};

  tabs.forEach(btn=>btn.addEventListener("click",()=>{
    tabs.forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    Object.entries(panels).forEach(([key,el])=>{ el.style.display = key===btn.dataset.tab ? "block":"none"; });
  }));

  function run(){
    const doc="<!DOCTYPE html><html><head><style>"+cssArea.value+"</style></head><body>"+htmlArea.value+"<script>"+jsArea.value+"<\/script></body></html>";
    frame.srcdoc=doc;
  }

  runBtn.addEventListener("click",run);
  $("compilerReset").addEventListener("click",()=>{
    htmlArea.value=defaults.html; cssArea.value=defaults.css; jsArea.value=defaults.js;
    run();
    showToast("Editor reset to the starting example.");
  });

  run();
})();
