const $ = id => document.getElementById(id);
const fields = ["name","title","email","phone","location","website","summary","education","college","eduYear","experienceRole","experienceCompany","experiencePeriod","experienceDetails","skills","certifications","projectName","projectDetails"];

$("menuBtn").addEventListener("click",()=>$("nav").classList.toggle("open"));
document.querySelectorAll("nav a").forEach(a=>a.addEventListener("click",()=> $("nav").classList.remove("open")));

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

function escapeHTML(str){
  return str.replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
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

document.querySelectorAll("[data-coming]").forEach(btn=>btn.addEventListener("click",()=>showToast("Template downloads will be connected in the next build.")));

function showToast(message){
  const t=$("toast");t.textContent=message;t.classList.add("show");
  clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove("show"),2400);
}
$("year").textContent=new Date().getFullYear();
updateCV();
