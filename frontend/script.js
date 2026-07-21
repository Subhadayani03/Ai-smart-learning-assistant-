// =========================
// Backend URL
// =========================
const API_URL = "https://ai-smart-learning-assistant-s98c.onrender.com";

// =========================
// Current User
// =========================

let currentUser = JSON.parse(localStorage.getItem("user")) || null;

// =========================
// Helper Function
// =========================

function showMessage(message){

    alert(message);

}

// =========================
// Switch Forms
// =========================

document.getElementById("show-register").onclick = function(){

    document.getElementById("login-form").style.display="none";

    document.getElementById("register-form").style.display="block";

}

document.getElementById("show-login").onclick=function(){

    document.getElementById("register-form").style.display="none";

    document.getElementById("login-form").style.display="block";

}

document.getElementById("show-forgot").onclick=function(){

    document.getElementById("login-form").style.display="none";

    document.getElementById("forgot-form").style.display="block";

}

document.getElementById("back-login").onclick=function(){

    document.getElementById("forgot-form").style.display="none";

    document.getElementById("login-form").style.display="block";

}

// =========================
// Register
// =========================

document.getElementById("register-form").onsubmit=async(e)=>{

    e.preventDefault();

    const response=await fetch(API+"/register",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            name:document.getElementById("register-name").value,

            email:document.getElementById("register-email").value,

            password:document.getElementById("register-password").value

        })

    });

    const data=await response.json();

    showMessage(data.message);

    if(data.success){

        document.getElementById("show-login").click();

    }

};

// =========================
// Login
// =========================

document.getElementById("login-form").onsubmit=async(e)=>{

    e.preventDefault();

    const response=await fetch(API+"/login",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            email:document.getElementById("login-email").value,

            password:document.getElementById("login-password").value

        })

    });

    const data=await response.json();

    if(data.success){

        currentUser=data.user;

        localStorage.setItem("user",JSON.stringify(currentUser));

        startApplication();

    }

    else{

        showMessage(data.message);

    }

};

// =========================
// Forgot Password
// =========================

document.getElementById("forgot-form").onsubmit=async(e)=>{

    e.preventDefault();

    const response=await fetch(API+"/forgot-password",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            email:document.getElementById("forgot-email").value,

            new_password:document.getElementById("forgot-password").value

        })

    });

    const data=await response.json();

    showMessage(data.message);

};

// =========================
// Logout
// =========================

document.getElementById("logout-btn").onclick=function(){

    localStorage.removeItem("user");

    location.reload();

};

// =========================
// Menu Navigation
// =========================

document.querySelectorAll(".menu-item").forEach(item=>{

    item.onclick=function(){

        document.querySelectorAll(".menu-item").forEach(x=>x.classList.remove("active"));

        item.classList.add("active");

        document.querySelectorAll(".page-section").forEach(x=>x.classList.remove("active"));

        document.getElementById("section-"+item.dataset.section).classList.add("active");

        document.getElementById("page-title").innerHTML=item.innerText;

    }

});

// =========================
// Start Application
// =========================

function startApplication(){

    document.getElementById("auth-page").style.display="none";

    document.getElementById("main-app").style.display="flex";

    document.getElementById("user-name").innerHTML=currentUser.name;

    document.getElementById("profile-name").value=currentUser.name;

    document.getElementById("profile-email").value=currentUser.email;

    loadDashboard();

}

// =========================
// Dashboard
// =========================

let dashboardChart = null;

async function loadDashboard() {

    try {

        const response = await fetch(

            API + "/dashboard?email=" + currentUser.email

        );

        const data = await response.json();

        if (!data.success) return;

        const dashboard = data.dashboard;

        // Statistics

        document.getElementById("usage-count").textContent =
            dashboard.usage;

        document.getElementById("notes-count").textContent =
            dashboard.notes;

        document.getElementById("quiz-count").textContent =
            dashboard.quizzes;

        document.getElementById("overall-progress").textContent =
            dashboard.overall_progress + "%";

        // Progress Card

        document.getElementById("progress-text").textContent =
            dashboard.overall_progress + "%";

        document.getElementById("progress-fill").style.width =
            dashboard.overall_progress + "%";

        createDashboardChart(dashboard.graph);

    }

    catch (error) {

        console.log(error);

    }

}

// =========================
// Dashboard Graph
// =========================

function createDashboardChart(graphData) {

    const ctx = document
        .getElementById("dashboardChart")
        .getContext("2d");

    if (dashboardChart) {

        dashboardChart.destroy();

    }

    dashboardChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels: Object.keys(graphData),

            datasets: [

                {

                    label: "Weekly Activity",

                    data: Object.values(graphData),

                    backgroundColor: [

                        "#2563eb",

                        "#22c55e",

                        "#f59e0b",

                        "#ef4444",

                        "#8b5cf6",

                        "#06b6d4",

                        "#ec4899"

                    ],

                    borderRadius: 10

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    display: false

                }

            },

            scales: {

                y: {

                    beginAtZero: true,

                    ticks: {

                        stepSize: 1

                    }

                }

            }

        }

    });

}

// =========================
// Auto Refresh Dashboard
// =========================

setInterval(() => {

    if (currentUser) {

        loadDashboard();

    }

}, 10000);


// =========================
// AI CHAT
// =========================

document.getElementById("chat-form").onsubmit = async (e) => {

    e.preventDefault();

    const question = document.getElementById("chat-question").value.trim();

    if (question === "") return;

    const chatBox = document.getElementById("chat-messages");

    // Show user's message
    chatBox.innerHTML += `
        <div class="user-message">
            <strong>You:</strong><br>
            ${question}
        </div>
    `;

    document.getElementById("chat-question").value = "";

    chatBox.scrollTop = chatBox.scrollHeight;

    try {

        const response = await fetch(API + "/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                question: question,

                email: currentUser.email

            })

        });

        const data = await response.json();

        if (data.success) {

            chatBox.innerHTML += `
                <div class="ai-message">
                    <strong>AI:</strong><br>
                    ${marked.parse(data.answer)}
                </div>
            `;

            chatBox.scrollTop = chatBox.scrollHeight;

            loadDashboard();

        } else {

            chatBox.innerHTML += `
                <div class="ai-message">
                    ❌ ${data.message}
                </div>
            `;

        }

    } catch (error) {

        console.log(error);

        chatBox.innerHTML += `
            <div class="ai-message">
                ❌ Unable to connect to AI server.
            </div>
        `;

    }

};
// =========================
// AI NOTES
// =========================

let generatedNotes = "";

document.getElementById("notes-form").onsubmit = async (e) => {

    e.preventDefault();

    const topic = document.getElementById("notes-topic").value;

    const response = await fetch(API + "/notes", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            topic: topic,

            email: currentUser.email

        })

    });

    const data = await response.json();

    if (data.success) {

        generatedNotes = data.notes;

        document.getElementById("notes-result").innerHTML =
            marked.parse(data.notes);

        loadDashboard();

    }

};


// =========================
// DOWNLOAD NOTES AS PDF
// =========================

document.getElementById("download-notes").onclick = function () {

    if (generatedNotes === "") {

        alert("Please generate notes first.");

        return;

    }

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    const title = document.getElementById("notes-topic").value;

    doc.setFontSize(18);

    doc.text(title, 20, 20);

    doc.setFontSize(12);

    const lines = doc.splitTextToSize(generatedNotes, 170);

    doc.text(lines, 20, 35);

    doc.save(title + ".pdf");

};
// =========================
// QUIZ
// =========================

let currentQuiz = [];

// Generate Quiz
document.getElementById("quiz-form").onsubmit = async (e) => {

    e.preventDefault();

    const topic = document.getElementById("quiz-topic").value;

    const response = await fetch(API + "/quiz", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            topic: topic,
            email: currentUser.email

        })

    });

    const data = await response.json();

    if (!data.success) {

        alert(data.message);

        return;

    }

    currentQuiz = data.quiz;

    const container = document.getElementById("quiz-container");

    container.innerHTML = "";

    currentQuiz.forEach((q, index) => {

        container.innerHTML += `

        <div class="quiz-card">

            <h5>

                ${index + 1}. ${q.question}

            </h5>

            ${q.options.map((option, i) => `

                <label class="quiz-option">

                    <input

                        type="radio"

                        name="question${index}"

                        value="${i}">

                    ${option}

                </label>

            `).join("")}

        </div>

        `;

    });

    document.getElementById("submit-quiz").style.display = "block";

};

// =========================
// SUBMIT QUIZ
// =========================

document.getElementById("submit-quiz").onclick = async () => {

    let score = 0;

    currentQuiz.forEach((q, index) => {

        const options = document.querySelectorAll(
            `input[name="question${index}"]`
        );

        options.forEach((option) => {

            const label = option.parentElement;

            // Correct answer → Green
            if (Number(option.value) === Number(q.answer)) {

                label.style.background = "#d1fae5";
                label.style.border = "2px solid #22c55e";

            }

            // Wrong selected answer → Red
            if (
                option.checked &&
                Number(option.value) !== Number(q.answer)
            ) {

                label.style.background = "#fee2e2";
                label.style.border = "2px solid #ef4444";

            }

        });

        const selected = document.querySelector(
            `input[name="question${index}"]:checked`
        );

        if (
            selected &&
            Number(selected.value) === Number(q.answer)
        ) {

            score++;

        }

    });

    const percentage = Math.round(
        (score / currentQuiz.length) * 100
    );

    document.getElementById("quiz-score").innerHTML = `
        <h2>Score: ${score}/${currentQuiz.length}</h2>
        <h3>${percentage}%</h3>
    `;

    // Save Progress
    const response = await fetch(API + "/progress", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            email: currentUser.email,

            course: document.getElementById("quiz-topic").value,

            percentage: percentage

        })

    });

    const result = await response.json();

    console.log(result);

    loadProgress();

    loadDashboard();

};
// =========================
// LOAD PROGRESS
// =========================

async function loadProgress() {

    try {

        const response = await fetch(
            API + "/progress/" + currentUser.email
        );

        const data = await response.json();

        if (!data.success) return;

        const progressList = document.getElementById("progress-list");

        progressList.innerHTML = "";

        // Overall Progress
        document.getElementById("progress-text").innerHTML =
            data.overall + "%";

        document.getElementById("progress-fill").style.width =
            data.overall + "%";

        // Individual Course Progress

        data.progress.forEach(item => {

            progressList.innerHTML += `

            <div class="mini-card">

                <h3>${item.course}</h3>

                <div class="progress-bar">

                    <div class="progress-fill"
                        style="width:${item.percentage}%">
                    </div>

                </div>

                <p>${item.percentage}% Completed</p>

            </div>

            `;

        });

    }

    catch (error) {

        console.log(error);

    }

}

// =========================
// PROFILE UPDATE
// =========================

document.getElementById("profile-form").onsubmit = async (e) => {

    e.preventDefault();

    currentUser.name =
        document.getElementById("profile-name").value;

    localStorage.setItem(

        "user",

        JSON.stringify(currentUser)

    );

    document.getElementById("user-name").innerHTML =
        currentUser.name;

    alert("Profile Updated Successfully!");

};

// =========================
// AUTO LOGIN
// =========================

window.onload = function () {

    if (currentUser) {

        startApplication();

        loadProgress();

    }

};


// =========================
// DARK MODE
// =========================

const darkBtn = document.getElementById("dark-mode-btn");

if (darkBtn) {

    if (localStorage.getItem("theme") === "dark") {

        document.body.classList.add("dark-mode");

        darkBtn.innerHTML = "☀️ Light Mode";

    }

    darkBtn.onclick = function () {

        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {

            localStorage.setItem("theme", "dark");

            darkBtn.innerHTML = "☀️ Light Mode";

        } else {

            localStorage.setItem("theme", "light");

            darkBtn.innerHTML = "🌙 Dark Mode";

        }

    };

}

