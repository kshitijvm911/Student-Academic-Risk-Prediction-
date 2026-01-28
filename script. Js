function calculateRisk() {
  let name = document.getElementById("name").value.trim();
  let dept = document.getElementById("dept").value.trim();
  let attendance = Number(document.getElementById("attendance").value);
  let study = Number(document.getElementById("study").value);
  let phone = Number(document.getElementById("phone").value);
  let sleep = Number(document.getElementById("sleep").value);
  let marks = Number(document.getElementById("marks").value);

  if(!name || !dept || attendance<0 || study<0 || phone<0 || sleep<0 || marks<0){
    alert("Please fill in all fields correctly!");
    return;
  }

  let score = 0, improvements=[], warnings=[], status=[];

  // Risk calculation
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

  // Critical warnings
  if (phone>=8) warnings.push("⚠ Dangerous phone addiction");
  if (sleep<=5) warnings.push("⚠ Severe sleep deprivation");
  if (attendance<50) warnings.push("⚠ Risk of semester backlog");

  // Risk level
  let riskLevel="LOW", color="green";
  if(score>=80){ riskLevel="HIGH"; color="red"; }
  else if(score>=45){ riskLevel="MEDIUM"; color="orange"; }

  let academicHealth = 100 - score;

  // Predicted marks
  let predictedMarks = Math.min(100, Math.round(attendance*0.2 + study*8 - phone*3 + sleep*4 + marks*0.5));

  // Student type
  let studentType="";
  if(study<2 && phone>6) studentType="Distracted Learner";
  else if(attendance<60) studentType="Irregular Attendee";
  else if(sleep<6) studentType="Fatigued Learner";
  else studentType="Balanced Learner";

  // Improvements
  improvements.push(
    "Follow a fixed daily study schedule",
    "Keep phone away during study hours",
    "Sleep 7–8 hours for brain efficiency",
    "Revise daily and practice past papers",
    "Maintain attendance above 80%",
    "Use Pomodoro technique for better focus"
  );

  let now = new Date().toLocaleString();

  // --- Save current report to history ---
  let records = JSON.parse(localStorage.getItem("studentRecords")) || [];

  // Find previous record for comparison (same name + department)
  let previousRecords = records.filter(r => r.name === name && r.dept === dept);
  let lastRecord = previousRecords.length ? previousRecords[previousRecords.length-1] : null;

  let studentRecord = { name, dept, attendance, study, phone, sleep, marks, riskLevel, academicHealth, predictedMarks, studentType, date: now };
  records.push(studentRecord);
  localStorage.setItem("studentRecords", JSON.stringify(records));

  // --- Output current report ---
  let output = `
  <b>Student:</b> ${name} (${dept})<br>
  <b>Report Generated:</b> ${now}<br>
  <div class='risk-bar' id='riskFill' style='background:${color}'></div>
  <b>Risk Level:</b> <span style="color:${color}">${riskLevel}</span><br>
  <b>Risk Score:</b> ${score}%<br>
  <b>Academic Health:</b> ${academicHealth}/100<br>
  <b>Predicted Final Marks:</b> ${predictedMarks}%<br>
  <b>Student Type:</b> ${studentType}

  <div class='section-title'>Evaluation</div>
  <ul>${status.map(s=>`<li>${s}</li>`).join("")}</ul>
  `;

  if(warnings.length){
    output+=`<div class='section-title'>Critical Warnings</div>
    <ul>${warnings.map(w=>`<li>${w}</li>`).join("")}</ul>`;
  }

  output+=`
  <div class='section-title'>Improvements</div>
  <ul>${improvements.map(i=>`<li>${i}</li>`).join("")}</ul>
  <div class='section-title'>Motivation</div>
  Immediate discipline can change your result within 30 days.
  `;

  // --- Comparison Section ---
  if(lastRecord){
    let improvementMsg = "";
    if(studentRecord.score > lastRecord.score || studentRecord.academicHealth > lastRecord.academicHealth){
      improvementMsg = "🎉 You have improved since last report!";
    } else if(studentRecord.score < lastRecord.score || studentRecord.academicHealth < lastRecord.academicHealth){
      improvementMsg = "⚠ Needs more improvement compared to last report.";
    } else {
      improvementMsg = "No change since last report.";
    }

    output += `
    <div class='section-title'>Comparison with Last Report</div>
    <ul>
      <li><b>Previous Report:</b> ${lastRecord.date} | Risk: ${lastRecord.riskLevel} | Score: ${lastRecord.academicHealth}/100</li>
      <li><b>Current Report:</b> ${now} | Risk: ${studentRecord.riskLevel} | Score: ${studentRecord.academicHealth}/100</li>
      <li>${improvementMsg}</li>
    </ul>
    `;
  }

  document.getElementById("result").innerHTML = output;

  setTimeout(()=>{ document.getElementById("riskFill").style.width = score+"%"; }, 100);
}

// --- Show previous records ---
function showHistory() {
  let records = JSON.parse(localStorage.getItem("studentRecords")) || [];
  if(records.length===0){ alert("No previous records found!"); return; }

  // Group by name + department
  let grouped = {};
  records.forEach(r=>{
    let key = r.name+"-"+r.dept;
    if(!grouped[key]) grouped[key]=[];
    grouped[key].push(r);
  });

  let historyOutput = "<div class='section-title'>Previous Records</div>";
  for(let key in grouped){
    let arr = grouped[key];
    arr.forEach((r,index)=>{
      historyOutput += `
      <div style="background:#eef2ff; padding:10px; margin-bottom:8px; border-radius:10px;">
        <b>${r.name} (${r.dept})</b><br>
        Attendance: ${r.attendance}% | Study: ${r.study} hrs/day | Phone: ${r.phone} hrs/day<br>
        Sleep: ${r.sleep} hrs/day | Marks: ${r.marks}%<br>
        Risk Level: <span style="color:${r.riskLevel==="HIGH"?"red":r.riskLevel==="MEDIUM"?"orange":"green"}">${r.riskLevel}</span> | Academic Health: ${r.academicHealth}/100<br>
        Predicted Marks: ${r.predictedMarks}% | Type: ${r.studentType}<br>
        Date: ${r.date}
      </div>`;
    });
  }

  document.getElementById("result").innerHTML = historyOutput;
}

// --- Clear history ---
function clearHistory() {
  if(confirm("Are you sure you want to clear all records?")){
    localStorage.removeItem("studentRecords");
    document.getElementById("result").innerHTML = "";
    alert("History cleared!");
  }
}
