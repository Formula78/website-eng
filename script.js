const projects = [
  {
    title: "Hydrofoil Moth Design",
    desc: "VLM Analyse und Lift/Drag Optimierung"
  },
  {
    title: "Human Powered Aircraft Propeller",
    desc: "JavaProp basierte Effizienzoptimierung"
  },
  {
    title: "OpenFOAM CFD Study",
    desc: "Strömungsanalyse und Konvergenzstudien"
  }
];

const container = document.getElementById("project-list");

projects.forEach(p => {
  const div = document.createElement("div");
  div.className = "project";

  div.innerHTML = `
    <h3>${p.title}</h3>
    <p>${p.desc}</p>
  `;

  container.appendChild(div);
});