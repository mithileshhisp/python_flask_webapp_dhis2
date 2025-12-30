const API_BASE = "http://localhost:5000"; // CHANGE if needed

const runBtn = document.getElementById("runBtn");
const refreshBtn = document.getElementById("refreshBtn");
const statusBox = document.getElementById("statusBox");
const logsDiv = document.getElementById("logs");

const downloadLogBtn = document.getElementById("downloadLogBtn");
const logSelect = document.getElementById("logSelect");
logSelect.innerHTML = "<option>TEST OPTION</option>";


let wasRunning = false;
function updateStatus() {
    fetch(API_BASE + "/status")
        .then(r => r.json())
        .then(data => {
            statusBox.textContent = JSON.stringify(data, null, 2);

            runBtn.disabled = data.running === true;
            runBtn.textContent = data.running ? "Running..." : "Run Aggregation";
			
			// prevent downloading incomplete logs
            downloadLogBtn.disabled = data.running === true;
			
			// 🔹 Detect job finish (true → false)
            if (wasRunning && data.running === false) {
                console.log("Job completed → refreshing log list");
                loadLogList();          // ✅ refresh log history
            }

            wasRunning = data.running;
        })
        .catch(() => {
            statusBox.textContent = "Unable to connect to server";
        });
}
/*
function runJob() {
    runBtn.disabled = true;
    runBtn.textContent = "Starting...";

    fetch(API_BASE + "/run", { method: "POST" })
        .then(r => r.json())
        .then(data => {
            updateStatus();
        })
        .catch(err => {
            alert("Failed to start job");
            runBtn.disabled = false;
            runBtn.textContent = "Run Aggregation";
        });
}
*/

function runJob() {
	let statusTimer = null;

    runBtn.disabled = true;
    runBtn.textContent = "Starting...";

    fetch(API_BASE + "/run", { method: "POST" })
        .then(r => r.json())
        .then(data => {
            // ✅ start auto status refresh
            if (!statusTimer) {
                statusTimer = setInterval(updateStatus, 2000);
            }
        })
        .catch(err => {
            alert("Failed to start job");
            runBtn.disabled = false;
            runBtn.textContent = "Run Aggregation";
        });
}


function fetchLogs() {
    fetch(API_BASE + "/logs")
        .then(r => r.json())
        .then(data => {
            if (Array.isArray(data)) {
                data.forEach(log => {
                    const div = document.createElement("div");
                    div.textContent = log;
                    logsDiv.appendChild(div);
                });
                logsDiv.scrollTop = logsDiv.scrollHeight;
            }
        });
}

function downloadLatestLog() {
    window.location.href = API_BASE + "/logs/latest";
}




if (!logSelect) {
    console.error("logSelect element not found in DOM");
}

/*
function loadLogList() {
    fetch(API_BASE + "/logs/list")
        .then(r => r.json())
        .then(files => {
            logSelect.innerHTML = "";
            files.forEach(f => {
                const opt = document.createElement("option");
                opt.value = f;
                opt.textContent = f;
                logSelect.appendChild(opt);
            });
        });
}
*/

function loadLogList() {
    fetch(API_BASE + "/logs/list")
        .then(r => r.json())
        .then(files => {
            logSelect.innerHTML = "";

            files.forEach(f => {
                const opt = document.createElement("option");
                opt.value = f.name;        // 🔴 key fix
                opt.textContent = f.name;  // 🔴 key fix
                logSelect.appendChild(opt);
            });

            if (files.length > 0) {
                logSelect.selectedIndex = 0;
            }
        })
        .catch(err => console.error(err));
}


function downloadSelectedLog() {
    const file = logSelect.value;
    if (!file) return;

    window.location.href = API_BASE + "/logs/" + file;
}


function cleanupLogs() {
    fetch(API_BASE + "/logs/cleanup", { method: "POST" })
        .then(r => r.json())
        .then(res => {
            alert(`Deleted ${res.count} old logs`);
            loadLogList();
        });
}


// Events
runBtn.addEventListener("click", runJob);
refreshBtn.addEventListener("click", updateStatus);
downloadLogBtn.addEventListener("click", downloadSelectedLog);

// Auto refresh
//setInterval(updateStatus, 5000);
setInterval(fetchLogs, 3000);

// Initial load
updateStatus();
loadLogList()
