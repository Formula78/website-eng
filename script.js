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

const canvas = document.getElementById("flow");
const ctx = canvas.getContext("2d");

let w, h;

function resize() {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

// Partikel
const particles = [];
const N = 250;

for (let i = 0; i < N; i++) {
  particles.push({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: 1 + Math.random() * 1.5,
    vy: (Math.random() - 0.5) * 0.5
  });
}

// Maus
let mouse = { x: -1000, y: -1000 };

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function draw() {
  ctx.fillStyle = "rgba(15, 23, 42, 0.25)";
  ctx.fillRect(0, 0, w, h);

  for (let p of particles) {

    // Abstand zur Maus
    let dx = p.x - mouse.x;
    let dy = p.y - mouse.y;
    let dist = Math.sqrt(dx * dx + dy * dy);

    // Maus beeinflusst Strömung
    if (dist < 150) {
      p.vy += dy * 0.002;
      p.vx += dx * 0.002;
    }

    // Grundströmung links → rechts
    p.vx += 0.02;

    // Dämpfung
    p.vx *= 0.98;
    p.vy *= 0.98;

    // Bewegung
    p.x += p.vx;
    p.y += p.vy;

    // Wrap-around
    if (p.x > w) p.x = 0;
    if (p.x < 0) p.x = w;
    if (p.y > h) p.y = 0;
    if (p.y < 0) p.y = h;

    // Zeichnen (Stromlinien-Look)
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = "#38bdf8";
    ctx.fill();
  }

  requestAnimationFrame(draw);
}

draw();