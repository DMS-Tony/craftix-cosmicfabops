// data-loader.js — parses CSVs and renders all widgets on FabBoard 2.0

// marquee scroll for overflow — top-to-bottom then reset
typeof requestAnimationFrame === "function" || (window.requestAnimationFrame = cb => setTimeout(cb, 16));
function autoScroll(el, speed = 20, pause = 2000) {
  if (!el || el.scrollHeight <= el.clientHeight) return;
  let top = 0;
  setTimeout(step, pause);
  function step() {
    if (top + el.clientHeight < el.scrollHeight) {
      top++;
      el.scrollTop = top;
      setTimeout(step, speed);
    } else {
      setTimeout(() => {
        top = 0;
        el.scrollTop = 0;
        setTimeout(step, pause);
      }, pause);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // === 1) Code Red Jobs & Workstation Pie ===
  Papa.parse("Fab Critical List(Fab Critical List).csv", {
    download: true,
    header: false,
    skipEmptyLines: true,
    complete: function(results) {
      const data = results.data;
      const codeRedBody = document.querySelector("#code-red-table tbody");
      const validPartRx = /^\d{6}(?:-[A-Z]+)?$/;
      let totalValidJobs = 0;
      let codeRedCount = 0;
      let currentLine = "";

      data.forEach(row => {
        const dateCol  = (row[0] || "").trim();
        const partRaw  = (row[1] || "").trim();
        const station  = (row[2] || "").trim();
        const desc     = (row[3] || "").trim();
        const onHand   = (row[4] || "").trim();
        const priority = (row[6] || "").trim().toUpperCase();

        if (!dateCol && desc && !onHand) {
          currentLine = desc.slice(0, 2);
          return;
        }
        if (partRaw.toUpperCase() === 'PART #' && station === 'Current Station') return;
        if (!validPartRx.test(partRaw)) return;

        totalValidJobs++;
        if (priority === "CODE RED") {
          const tr = document.createElement("tr");
          tr.innerHTML = `<td>${currentLine}</td><td>${partRaw}</td><td>${station}</td>`;
          codeRedBody.appendChild(tr);
          codeRedCount++;
        }
      });

      if (codeRedCount === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = '<td colspan="3">No CODE RED jobs found.</td>';
        codeRedBody.appendChild(tr);
      }

      document.getElementById("total-jobs").textContent = totalValidJobs;

      // Workstation Pie
      (function() {
        const counts = data.slice(1).reduce((acc, row) => {
          const ws = (row[2] || "").trim();
          if (!ws || ws === 'Current Station') return acc;
          acc[ws] = (acc[ws] || 0) + 1;
          return acc;
        }, {});
        const idealOrder = ['Needs Programs','Laser EMLK','Laser West','Laser East','Tumble',
          'Form - ATC','Form - HRB','Form - Accurpress','Form - Small Amada',
          'Radius/Deburr','Spot Weld','Stud Weld / Mill','Pem','Riv Nut',
          'Passivation','Punch','Shear/Cut','Tap','Tubes','Outsourced','Complete'];
        const labels = []; idealOrder.forEach(ws => counts[ws]!=null && labels.push(ws));
        Object.keys(counts).forEach(ws => !labels.includes(ws) && labels.push(ws));
        const values = labels.map(ws => counts[ws]);
        const pieColors = { 'Needs Programs':'#EDA0A0','Laser EMLK':'#b22222','Laser West':'#dc143c',
          'Laser East':'#ef5350','Tumble':'#888','Form - ATC':'#1EA7DF','Form - HRB':'#457b9d',
          'Form - Accurpress':'#74a9cf','Form - Small Amada':'#a8dadc','Radius/Deburr':'#cbaacb',
          'Spot Weld':'#f4a261','Stud Weld / Mill':'#e9c46a','Pem':'#9b59b6','Riv Nut':'#f1c40f',
          'Passivation':'#a8e6cf','Punch':'#2e8b57','Shear/Cut':'#555','Tap':'#66a182','Tubes':'#b87333',
          'Outsourced':'#06d6a0','Complete':'#7DDA58' };
        const bgColors = labels.map(ws => pieColors[ws]||'#ccc');
        const ctx = document.getElementById('workstationChart').getContext('2d');
        const wsChart = new Chart(ctx, { type:'pie', data:{ labels, datasets:[{ data: values, backgroundColor: bgColors, radius:'85%' }]}, options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'bottom' }}, layout:{ padding:{ top:10, bottom:50 }}} });
        const legendColorMap = {};
        wsChart.legend.legendItems.forEach(item=> legendColorMap[item.text]=item.fillStyle);
        document.querySelectorAll('#code-red-table tbody tr').forEach(row => {
          const cell = row.cells[2]; const wsName = cell.textContent.trim();
          if (legendColorMap[wsName]) { cell.style.color = legendColorMap[wsName]; cell.style.fontWeight='600'; }
        });
      })();

      // Start auto-scrolling
      requestAnimationFrame(()=>{
        requestAnimationFrame(()=>{
          autoScroll(document.querySelector('#code-red-widget .widget-body.scrollable'),20,2000);
          autoScroll(document.querySelector('#challenges-widget .widget-body.scrollable'),20,2000);
        });
      });
    }
  });

  // === 2) Safety Days + Line Charts ===
  Papa.parse(`data.csv?cb=${Date.now()}`, {
    download: true,
    skipEmptyLines: true,
    complete: function(res) {
      const rows = res.data;
      const incRow = rows.find(r=>r[0].trim()==='IncidentDate');
      if (incRow && incRow[1]) {
        const days = Math.floor((new Date()-new Date(incRow[1]))/(1000*60*60*24));
        document.getElementById('safetyDays').textContent = days;
      }

      const startIdx = rows.findIndex(r=>r[0].trim()==='Date');
      const metrics = rows.slice(startIdx+1).map(r=>({ dateStr:r[0], goal:+r[1], done:+r[2], exp:+r[3], act:+r[4] })).filter(m=>m.dateStr);
      const last10 = metrics.slice(-10);
      const labels      = last10.map(m=>m.dateStr.slice(5));
      const goals       = last10.map(m=>m.goal);
      const completions = last10.map(m=>m.done);
      const expecteds   = last10.map(m=>m.exp);
      const actuals     = last10.map(m=>m.act);

      // Goal vs Completed as line
      new Chart(document.getElementById('goalChart').getContext('2d'), {
        type:'line',
        data:{ labels, datasets:[
          { label:'Goal',      data:goals,       borderColor:'#2B86C3', backgroundColor:'#2B86C3', fill:false, tension:0.1 },
          { label:'Completed', data:completions, borderColor:'#2BC359', backgroundColor:'#2BC359', fill:false, tension:0.1 }
        ]},
	options: {
 	 responsive: true,
 	 maintainAspectRatio: false,
  	layout: {
 	   padding: { top: 10, bottom: 30 }    // room for x-axis labels
 	 },
  	plugins: { legend: { position: 'top' } },
  	scales: {
  	  x: { ticks: { maxRotation: 45, autoSkip: true, padding: 4 } },
  	  y: { beginAtZero: true }
  }
}
      });

      // Expected vs Actual as line
      new Chart(document.getElementById('attendanceChart').getContext('2d'), {
        type:'line',
        data:{ labels, datasets:[
          { label:'Expected', data:expecteds,   borderColor:'#2B86C3', backgroundColor:'#2B86C3', fill:false, tension:0.1 },
          { label:'Actual',   data:actuals,     borderColor:'#2BC359', backgroundColor:'#2BC359', fill:false, tension:0.1 }
        ]},
options: {
  responsive: true,
  maintainAspectRatio: false,
  layout: {
    padding: { top: 10, bottom: 30 }    // room for x-axis labels
  },
  plugins: { legend: { position: 'top' } },
  scales: {
    x: { ticks: { maxRotation: 45, autoSkip: true, padding: 4 } },
    y: { beginAtZero: true }
  }
}
      });
    }
  });
});
