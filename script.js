// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
    apiKey: "AIzaSyDYDZYdUmfx7vOZOsJ9Ou9pZjAtydLMybU",
    authDomain: "academic-risk-analyzer.firebaseapp.com",
    projectId: "academic-risk-analyzer",
    storageBucket: "academic-risk-analyzer.appspot.com",
    messagingSenderId: "108167958186",
    appId: "1:108167958186:web:3a4e42a85acfbbdcbdcad3"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Global Variables
let allStudents = [];
let myRiskChart = null;       
let studentRadarChart = null; 

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById('toast-container')) {
        const toastCont = document.createElement('div');
        toastCont.id = 'toast-container';
        document.body.appendChild(toastCont);
    }

    if (document.getElementById('classChart')) initFacultyPage();
    else if (document.getElementById('reg-name')) initAdminPage();
    else if (document.getElementById('analyze-btn')) initStudentPage();
    else if (document.getElementById('login-header')) initLoginPage();
});

// --- TOAST NOTIFICATIONS ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '✅' : '⚠️';
    toast.innerHTML = `<div class="toast-icon">${icon}</div><div class="toast-msg">${message}</div>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

window.logout = function() {
    auth.signOut().then(() => window.location.href = 'login.html');
};

// ==========================================
//  1. FACULTY PAGE LOGIC
// ==========================================
function initFacultyPage() {
    auth.onAuthStateChanged(async (user) => {
        if (!user) return window.location.href = 'login.html';
        try {
            const userDoc = await db.collection("users").doc(user.uid).get();
            if (!userDoc.exists) return logout();

            const userData = userDoc.data();
            document.getElementById('fac-name').innerText = `Welcome, ${userData.name}`;
            document.getElementById('class-title').innerText = `Class: ${userData.dept}`;
            loadFacultyData(userData.dept);
        } catch (e) { console.error(e); }
    });

    document.getElementById('facultySearch').addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = allStudents.filter(s => s.name.toLowerCase().includes(term));
        renderTable(filtered, 'student-list');
    });
}

function loadFacultyData(dept) {
    db.collection("student_records").where("dept", "==", dept).onSnapshot(snapshot => {
        allStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                                   .sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

        const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
        allStudents.forEach(s => counts[s.riskLevel] = (counts[s.riskLevel] || 0) + 1);

        updateChart(counts);
        renderTable(allStudents, 'student-list');
    });
}

function updateChart(counts) {
    const ctx = document.getElementById('classChart')?.getContext('2d');
    if (!ctx) return;
    if (myRiskChart) myRiskChart.destroy();

    myRiskChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['High', 'Medium', 'Low'],
            datasets: [{
                data: [counts.HIGH, counts.MEDIUM, counts.LOW],
                backgroundColor: ['#ef4444', '#f59e0b', '#10b981'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'right' } }
        }
    });
}

// --- MODAL LOGIC ---
window.openDetailsModal = function(id) {
    const s = allStudents.find(s => s.id === id);
    if (!s) return;

    document.getElementById('detailsModal').style.display = 'flex';

    const formatVal = (val, isTime) => {
        if (val === undefined || val === null || val === "") return "-";
        return isTime ? val + "h" : val + "%";
    };

    document.getElementById('modal-student-name').innerText = s.name;
    document.getElementById('m-dept').innerText = s.dept;
    document.getElementById('m-att').innerText = formatVal(s.attendance, false);
    document.getElementById('m-marks').innerText = formatVal(s.marks, false);
    document.getElementById('m-study').innerText = formatVal(s.study, true);
    document.getElementById('m-sleep').innerText = formatVal(s.sleep, true);
    document.getElementById('m-phone').innerText = formatVal(s.phone, true);

    setTimeout(() => {
        const ctx = document.getElementById('studentRadarChart').getContext('2d');
        if (studentRadarChart) studentRadarChart.destroy();

        const scaledStudy = (Number(s.study) || 0) * 10;
        const scaledSleep = (Number(s.sleep) || 0) * 10;
        const scaledPhone = (Number(s.phone) || 0) * 10;

        studentRadarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Attendance', 'Marks', 'Study', 'Sleep', 'Phone'],
                datasets: [{
                    label: 'Profile',
                    data: [s.attendance || 0, s.marks || 0, scaledStudy, scaledSleep, scaledPhone],
                    backgroundColor: 'rgba(79, 70, 229, 0.2)',
                    borderColor: '#4f46e5',
                    pointBackgroundColor: '#4f46e5',
                    pointBorderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: { color: '#e2e8f0' },
                        grid: { color: '#e2e8f0' },
                        pointLabels: { font: { size: 12 }, color: '#64748b' },
                        suggestedMin: 0,
                        suggestedMax: 100,
                        ticks: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label;
                                let val = context.raw;
                                if(['Study','Sleep','Phone'].includes(label)) return label + ': ' + (val/10) + ' hrs';
                                return label + ': ' + val + '%';
                            }
                        }
                    }
                }
            }
        });
    }, 50);
};

window.closeModal = function() { 
    document.getElementById('detailsModal').style.display = 'none'; 
};

// ==========================================
//  2. STUDENT PAGE LOGIC (Tips Engine)
// ==========================================
function initStudentPage() {
    const btn = document.getElementById('analyze-btn');
    if (btn) btn.onclick = analyzeStudent;
}

async function analyzeStudent() {
    const name = document.getElementById('name').value.trim();
    const dept = document.getElementById('dept').value;
    const att = Number(document.getElementById('attendance').value);
    const study = Number(document.getElementById('study').value);
    const sleep = Number(document.getElementById('sleep').value);
    const phone = Number(document.getElementById('phone').value);
    const marks = Number(document.getElementById('marks').value);
    const btn = document.getElementById('analyze-btn');
    const resultArea = document.getElementById('result-area');

    if (!name || !dept) return showToast("Name & Dept required", "error");
    if (att < 0 || att > 100) return showToast("Attendance must be 0-100", "error");

    let risk = "LOW";
    if (att < 75 || marks < 50) risk = "HIGH";
    else if (att < 85 || marks < 70) risk = "MEDIUM";

    // --- TIP GENERATION ENGINE ---
    let tips = [];
    
    // Attendance Tips
    if (att < 75) tips.push("⚠️ <b>Attendance Critical:</b> You are below 75%. You must attend all upcoming classes to avoid debarment.");
    else if (att < 85) tips.push("ℹ️ <b>Attendance:</b> Good, but keep it above 85% to stay safe.");

    // Marks Tips
    if (marks < 50) tips.push("📚 <b>Academics:</b> Your marks are low. Dedicate at least 2 hours daily specifically to revision.");
    else if (marks > 90) tips.push("🌟 <b>Academics:</b> Excellent performance! Keep maintaining this consistency.");

    // Lifestyle Tips
    if (sleep < 6) tips.push("😴 <b>Sleep:</b> You're getting less than 6 hours. Sleep is crucial for memory retention.");
    else if (sleep > 9) tips.push("🛌 <b>Sleep:</b> Oversleeping can make you lethargic. Aim for 7-8 hours.");

    if (phone > 3) tips.push("📱 <b>Focus:</b> High phone usage detected. Try using 'Focus Mode' apps while studying.");
    if (study < 2 && marks < 70) tips.push("📖 <b>Study Time:</b> Try to increase your daily study time by 30 minutes.");

    if (tips.length === 0) tips.push("✅ <b>Great Job!</b> Your academic and lifestyle habits look balanced.");

    btn.disabled = true;
    btn.innerText = "Analyzing...";

    try {
        await db.collection("student_records").add({
            name, dept, attendance: att, study, sleep, phone, marks,
            riskLevel: risk,
            timestamp: new Date()
        });

        const color = risk === 'HIGH' ? '#ef4444' : (risk === 'MEDIUM' ? '#f59e0b' : '#10b981');
        const bg = risk === 'HIGH' ? '#fef2f2' : (risk === 'MEDIUM' ? '#fffbeb' : '#ecfdf5');
        
        resultArea.innerHTML = `
            <div class="card" style="border-left: 8px solid ${color}; background: ${bg}; margin-top: 20px; animation: slideIn 0.5s;">
                <h2 style="color:${color}; margin-bottom:10px;">Result: ${risk} RISK</h2>
                <p><b>${name}</b>, here is your personalized analysis:</p>
                
                <div style="text-align:left; background:rgba(255,255,255,0.8); padding:15px; border-radius:8px; margin-top:10px; box-shadow:0 2px 4px rgba(0,0,0,0.05);">
                     <h4 style="margin-top:0; color:#334155;">💡 Recommendations for You:</h4>
                     <ul style="padding-left: 20px; line-height: 1.6; color:#334155; margin-bottom:0;">
                        ${tips.map(t => `<li>${t}</li>`).join('')}
                    </ul>
                </div>
                <button onclick="location.reload()" class="btn-primary" style="margin-top:15px; background:#334155;">Analyze Another</button>
            </div>
        `;
        showToast("Analysis Sent", "success");
        resultArea.scrollIntoView({ behavior: 'smooth' });
    } catch (e) { showToast(e.message, "error"); }
    btn.disabled = false;
    btn.innerText = "Run Analysis";
}

// ==========================================
//  3. ADMIN & LOGIN
// ==========================================
function initAdminPage() {
    auth.onAuthStateChanged(async (user) => {
        if (!user) return window.location.href = 'login.html';
        const doc = await db.collection("users").doc(user.uid).get();
        if (!doc.exists || doc.data().role !== 'admin') return window.location.href = 'login.html';

        db.collection("student_records").onSnapshot(snap => {
            const data = snap.docs.map(d => ({id:d.id, ...d.data()})).sort((a,b)=> (b.timestamp?.seconds||0)-(a.timestamp?.seconds||0));
            renderTable(data, 'student-list', true);
        });
        loadFacultyAccounts();
        document.getElementById('create-fac-btn').addEventListener('click', createFaculty);
    });
}

async function createFaculty() {
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    const dept = document.getElementById('reg-dept').value;
    const btn = document.getElementById('create-fac-btn');

    if (!name || !email || !pass) return showToast("All fields required", "error");

    btn.disabled = true;
    btn.innerText = "Creating...";
    try {
        const secondaryApp = firebase.initializeApp(firebaseConfig, "Secondary");
        const userCred = await secondaryApp.auth().createUserWithEmailAndPassword(email, pass);
        await db.collection("users").doc(userCred.user.uid).set({ name, email, dept, role: 'faculty' });
        await secondaryApp.delete();
        showToast("Faculty Created!", "success");
        document.getElementById('reg-name').value = ""; document.getElementById('reg-email').value = ""; document.getElementById('reg-pass').value = "";
    } catch (e) { showToast(e.message, "error"); }
    btn.disabled = false; btn.innerText = "Register Faculty";
}

function loadFacultyAccounts() {
    db.collection("users").where("role", "==", "faculty").onSnapshot(snap => {
        const list = document.getElementById('faculty-list');
        if(!list) return;
        const html = snap.docs.map(doc => {
            const f = doc.data();
            return `<tr><td><b>${f.name}</b></td><td>${f.dept}</td><td><button class="btn-danger-small" onclick="removeFaculty('${doc.id}')">Remove</button></td></tr>`;
        }).join('');
        list.innerHTML = html;
    });
}
window.removeFaculty = async function(id) { if(confirm("Delete faculty?")) await db.collection("users").doc(id).delete(); };

function initLoginPage() {
    window.handleLogin = function() {
        const email = document.getElementById('email').value;
        const pass = document.getElementById('pass').value;
        if(!email || !pass) return showToast("Enter credentials", "error");
        auth.signInWithEmailAndPassword(email, pass).then(async (cred) => {
            const doc = await db.collection("users").doc(cred.user.uid).get();
            if(doc.exists) {
                showToast("Login Success!");
                window.location.href = doc.data().role === 'admin' ? 'admin.html' : 'faculty.html';
            } else { showToast("User not found", "error"); }
        }).catch(e => showToast("Invalid Login", "error"));
    };
}
function renderTable(data, tableId, isAdmin = false) {
    const list = document.getElementById(tableId);
    if (!list) return;
    if (data.length === 0) { list.innerHTML = "<tr><td colspan='5' style='text-align:center;'>No records found.</td></tr>"; return; }
    list.innerHTML = data.map(item => {
        const color = item.riskLevel === "HIGH" ? "#ef4444" : (item.riskLevel === "MEDIUM" ? "#f59e0b" : "#10b981");
        const btn = isAdmin 
            ? `<button class="btn-danger-small" onclick="deleteStudentRecord('${item.id}')">Delete</button>`
            : `<button class="view-btn" onclick="openDetailsModal('${item.id}')">View</button>`;
        return `<tr><td><b>${item.name}</b></td>${isAdmin?`<td>${item.dept}</td>`:''}<td style="color:${color};font-weight:bold;">${item.riskLevel}</td><td>${item.attendance}%</td><td>${btn}</td></tr>`;
    }).join('');
}
window.deleteStudentRecord = function(id) { if(confirm("Delete record?")) db.collection("student_records").doc(id).delete(); };