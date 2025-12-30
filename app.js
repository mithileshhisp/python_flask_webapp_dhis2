const logs = document.getElementById("logs")
const history = document.getElementById("history")

// Live logs
const es = new EventSource("http://localhost:5000/logs")

es.onmessage = (e) => {
    logs.textContent += e.data + "\n"
    logs.scrollTop = logs.scrollHeight

    if (e.data.includes("JOB_COMPLETED")) {
        es.close()

        runBtn.disabled = false
        runBtn.textContent = "Run Job"

        loadHistory()
    }
}


// Run job
/*
document.getElementById("runBtn").onclick = () => {
    logs.textContent = ""
    fetch("http://localhost:5000/run")
        .then(loadHistory)
}
*/

const runBtn = document.getElementById("runBtn")
//const logs = document.getElementById("logs")

function startJob() {
	if (runBtn.disabled) return
    runBtn.disabled = true
    runBtn.textContent = "Running..."

    logs.textContent = ""

    fetch("http://localhost:5000/run")
        .then(r => r.json())
		.then(loadHistory)
        .catch(err => {
            console.error(err)
            runBtn.disabled = false
            runBtn.textContent = "Run Job"
        })
}



function loadHistory() {
    fetch("http://localhost:5000/jobs")
        .then(r => r.json())
        .then(jobs => {
            history.innerHTML = ""

            jobs.forEach(j => {
                const li = document.createElement("li")

                li.innerHTML = `
                    <span>
                        Job ${j.id} —
                        <span class="status ${j.status}">
                            ${j.status}
                        </span>
                    </span>
                    <span>
                        <button class="secondary"
                            onclick="exportJob(${j.id})">
                            Download
                        </button>
                    </span>
					<span>
                        <button class="danger"
                            onclick="deleteJob(${j.id})">
                            Delete
                        </button>
                    </span>
                `

                history.appendChild(li)
            })
        })
}



/*
const history = document.getElementById("history")

function loadHistory() {
	const history = document.getElementById("history")
    fetch("http://localhost:5000/jobs")
        .then(r => r.json())
        .then(jobs => {
            history.innerHTML = ""

            jobs.forEach(j => {
                const li = document.createElement("li")

                li.innerHTML = `
                    Job ${j.id} - ${j.status}
                    <button onclick="exportJob(${j.id})">
                        Download
                    </button>
                `

                history.appendChild(li)
            })
        })
}
*/
function exportJob(jobId) {
    window.open(`http://localhost:5000/jobs/${jobId}/export`)
}


// Load job list
/*
function loadHistory() {
    fetch("http://localhost:5000/jobs")
        .then(r => r.json())
        .then(jobs => {
            history.innerHTML = ""
            jobs.forEach(j => {
                const li = document.createElement("li")
                li.textContent = `Job ${j.id} - ${j.status}`
                li.onclick = () => loadJobLogs(j.id)
                history.appendChild(li)
            })
        })
}
*/
// Load logs for one job
function loadJobLogs(jobId) {
    fetch(`http://localhost:5000/jobs/${jobId}/logs`)
        .then(r => r.json())
        .then(data => {
            logs.textContent = ""
            data.forEach(l => {
                logs.textContent += `${l.time} ${l.level} ${l.message}\n`
            })
        })
}





function cancelJob(id) {
    fetch(`http://localhost:5000/jobs/${id}/cancel`, { method: "POST" })
        .then(loadHistory)
}

function deleteJob(id) {
    //if (!confirm("Delete job?")) return
	if (!confirm("This will permanently delete the job. Continue?")) return

    fetch(`http://localhost:5000/jobs/${id}`, { method: "DELETE" })
        .then(loadHistory)
}



// Disable Run button if ANY job is running
function checkRunningJob() {
    fetch("http://localhost:5000/history")
        .then(r => r.json())
        .then(data => {
            const running = data.some(j => j.status === "RUNNING")
            runBtn.disabled = running
            runBtn.textContent = running ? "Running…" : "Run Job"
        })
}

checkRunningJob()
setInterval(checkRunningJob, 5000)


loadHistory()

