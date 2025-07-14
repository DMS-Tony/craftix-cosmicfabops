// Filename: data-form.js
(function() {
    // Hold parsed entries
    const entries = [];

    document.addEventListener('DOMContentLoaded', () => {
        const incidentInput = document.getElementById('incidentDate');
        const dateInput     = document.getElementById('entryDate');
        const goalInput     = document.getElementById('goal');
        const doneInput     = document.getElementById('completed');
        const expInput      = document.getElementById('expectedAttendance');
        const actInput      = document.getElementById('actualAttendance');
        const previewBody   = document.querySelector('#previewTable tbody');

        // Load data.csv via fetch + PapaParse
        fetch(`data.csv?cb=${Date.now()}`)
            .then(r => r.text())
            .then(text => {
                const res = Papa.parse(text, { skipEmptyLines: true });
                const rows = res.data;

                // IncidentDate row
                const idRow = rows.find(r => r[0].trim() === 'IncidentDate');
                if (idRow) incidentInput.value = idRow[1];

                // Find header index for metrics
                const headerIdx = rows.findIndex(r => r[0].trim() === 'Date');
                // Parse subsequent rows into entries[]
                for (let i = headerIdx + 1; i < rows.length; i++) {
                    const r = rows[i];
                    if (r.length >= 5) {
                        entries.push({
                            date: r[0].trim(),
                            goal: r[1].trim(),
                            completed: r[2].trim(),
                            expectedAttendance: r[3].trim(),
                            actualAttendance: r[4].trim()
                        });
                    }
                }
                renderPreview();
            });

        // Render preview table
        function renderPreview() {
            previewBody.innerHTML = '';
            entries.forEach(e => {
                const tr = document.createElement('tr');
                [e.date, e.goal, e.completed, e.expectedAttendance, e.actualAttendance]
                    .forEach(val => {
                        const td = document.createElement('td');
                        td.textContent = val;
                        tr.appendChild(td);
                    });
                previewBody.appendChild(tr);
            });
        }

        // Add a new entry
        document.getElementById('addEntry').addEventListener('click', () => {
            if (!dateInput.value) return alert('Please choose a date.');
            entries.push({
                date: dateInput.value,
                goal: goalInput.value,
                completed: doneInput.value,
                expectedAttendance: expInput.value,
                actualAttendance: actInput.value
            });
            renderPreview();
            // Clear inputs
            dateInput.value = goalInput.value = doneInput.value = expInput.value = actInput.value = '';
        });

        // Save updated CSV to server
        document.getElementById('downloadCsv').addEventListener('click', () => {
            const out = [];
            out.push([ 'IncidentDate', incidentInput.value ]);
            out.push([]);
            out.push([ 'Date','Goal','Completed','ExpectedAttendance','ActualAttendance' ]);
            entries.forEach(e => out.push([
                e.date,
                e.goal,
                e.completed,
                e.expectedAttendance,
                e.actualAttendance
            ]));

            const csv = Papa.unparse(out);
            // POST to save.php
            fetch('save.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ csv })
            })
            .then(r => r.text())
            .then(res => {
                if (res.trim() === 'OK') {
                    alert('Saved to server!');
                } else {
                    alert('Save failed: ' + res);
                }
            })
            .catch(err => alert('Error saving: ' + err));
        });
    });
})();
