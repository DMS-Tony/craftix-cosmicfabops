# 🚀 Craftix CosmicFabOps

**Skins & Custom UI Modules for FabBoard2 under the Craftix Platform**

Welcome aboard the CosmicFabOps module! This repo contains skin overrides, modular widgets, and cosmic-themed enhancements for the FabBoard2 live production dashboard, deployed inside the Craftix system at Digital Manufacturing Solutions.

---

## 🧰 Included Features

- Live Chart.js widgets (pie, bar, line, animated comet graphs)
- Custom nebula gradient themes & alternate fonts (Orbitron, Audiowide)
- Fixed-position headers/footers with glowing cosmic trims
- CSS keyframe animations (flicker, pulse, comet tails)
- Modular JS widgets in `/skins/cosmicfabops/widgets/`:
  - `comet-graph.js` (Goal vs Completed)
  - `attendance.js` (Expected vs Actual Attendance)
  - `alerts.js` (Mission Log / Dynamic Challenges)

---

## 📦 Folder Structure

```bash
📁 craftix-cosmicfabops/
├── data-loader.js
├── index.html
├── style.css
├── daily-form.html
├── data-form.js
├── save.php
├── *.csv (data files feeding FabBoard)
└── skins/
    └── cosmicfabops/
        ├── skin.css
        └── widgets/
            ├── comet-graph.js
            ├── attendance.js
            └── alerts.js
