function calculateRisk() {
  let name = document.getElementById("name").value.trim();
  let dept = document.getElementById("dept").value.trim();
  let attendance = Number(document.getElementById("attendance").value);
  let study = Number(document.getElementById("study").value);
  let phone = Number(document.getElementById("phone").value);
  let sleep = Number(document.getElementById("sleep").value);
  let marks = Number(document.getElementById("marks").value);

  if(!name || !dept || attendance<=0 || study<0 || phone<0 || sleep<=0 || marks<0){
    alert("Please fill in all fields correctly!");
    return;
  }

  let score = 0, status=[];

  if (attendance < 75) { score+=25; status.push("❌ Poor attendance"); }
  else status.push("✅ Good attendance");

  if (study < 2) { score+=30; status.push("❌ Very low study time"); }
  else status.push("✅ Study habit good");

  if (phone > 5) { score+=25; status.push("❌ Excessive phone usage"); }
  else status.push("✅ Phone usage controlled");

  if (sleep < 6) { score+=20; status.push("⚠ Lack of sleep"); }
  else status.push("✅ Healthy sleep");

  if (marks < 50) { score+=25; status.push("❌ Weak internal marks"); }
  else status.push("✅ Good internal marks");

  let riskLevel="LOW", color="green";
  if(score>=80){ riskLevel="HIGH"; color="red"; }
  else if(score>=45){ riskLevel="MEDIUM"; color="orange"; }

  let academicHealth = 100 - score;
  let predictedMarks = Math.min(100, Math.round(attendance*0.2 + study*8 - phone*3 + sleep*4 + marks*0.5));
  let now = new Date().toLocaleString();

  // ---- HISTORY & COMPARISON ----
  let records = JSON.parse(localStorage.getItem("studentRecords")) || [];

  let previous = records.filter(r => r.name===name && r.dept===dept).slice(-1)[0];

  let comparisonText = "";
  if(previous){
    let diff = previous.academicHealth - academicHealth;
    comparisonText = `
    <div class='section-title'>Comparison With Previous</div>
    Previous Check: ${previous.date}<br>
    Previous Risk: ${previous.riskLevel} (${previous.academicHealth}/100)<br>
    Current Risk: ${riskLevel} (${academicHealth}/100)<br>
    Change in Health: ${Math.abs(diff)} points ${diff>0 ? "⬇ Worsened" : "⬆ Improved"}
    `;
  }

  // Save record
  records.push({name, dept, attendance, study, phone, sleep, marks, riskLevel, academicHealth, predictedMarks, date: now});
  localStorage.setItem("studentRecords", JSON.stringify(records));

  // ---- OUTPUT ----
  let output = `
  <b>Student:</b> ${name} (${dept})<br>
  <b>Date:</b> ${now}
  <div class='risk-bar' id='riskFill' style='background:${color}'></div>
  <b>Risk Level:</b> <span style="color:${color}">${riskLevel}</span><br>
  <b>Academic Health:</b> ${academicHealth}/100<br>
  <b>Predicted Marks:</b> ${predictedMarks}%<br>

  <div class='section-title'>Evaluation</div>
  <ul>${status.map(s=>`<li>${s}</li>`).join("")}</ul>

  ${comparisonText}
  `;

  document.getElementById("result").innerHTML = output;
  setTimeout(()=>{ document.getElementById("riskFill").style.width = score+"%"; },100);
}


// -------- SHOW HISTORY GROUPED BY NAME --------
function showHistory() {
  let records = JSON.parse(localStorage.getItem("studentRecords")) || [];
  if(records.length===0){ alert("No records found"); return; }

  let grouped = {};

  records.forEach(r=>{
    let key = r.name + " - " + r.dept;
    if(!grouped[key]) grouped[key]=[];
    grouped[key].push(r);
  });

  let out = "<div class='section-title'>Previous Records</div>";

  for(let key in grouped){
    out += `<h4>${key}</h4>`;
    grouped[key].forEach(r=>{
      out += `
      <div style="background:#eef2ff;padding:8px;margin:6px;border-radius:8px;">
        Date: ${r.date} |
        Risk: <b>${r.riskLevel}</b> |
        Health: ${r.academicHealth}/100 |
        Predicted: ${r.predictedMarks}%
      </div>`;
    });
  }

  document.getElementById("result").innerHTML = out;
}


// -------- CLEAR HISTORY --------
function clearHistory(){
  localStorage.removeItem("studentRecords");
  alert("History cleared!");
  document.getElementById("result").innerHTML="";
}


// -------- EXPORT FOR POWER BI --------
function exportData(){
  let records = JSON.parse(localStorage.getItem("studentRecords")) || [];
  if(records.length===0){ alert("No data to export"); return; }

  let csv = "Name,Department,Attendance,Study,Phone,Sleep,Marks,Risk,Health,Predicted,Date\n";

  records.forEach(r=>{
    csv += `${r.name},${r.dept},${r.attendance},${r.study},${r.phone},${r.sleep},${r.marks},${r.riskLevel},${r.academicHealth},${r.predictedMarks},${r.date}\n`;
  });

  let blob = new Blob([csv], {type: "text/csv"});
  let a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "acadalyze_data.csv";
  a.click();
}
