
//
// ==========================
// PROJECT SECTION (SAFE)
// ==========================
//

const container = document.getElementById("project-list");

if (container) {
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

  projects.forEach(p => {
    const div = document.createElement("div");
    div.className = "project";

    div.innerHTML = `
      <h3>${p.title}</h3>
      <p>${p.desc}</p>
    `;

    container.appendChild(div);
  });
}

//
// ==========================
// FLOW CANVAS (SAFE)
// ==========================
//

const canvas = document.getElementById("flow");

if (canvas) {
  const ctx = canvas.getContext("2d");

  let w, h;
  const airfoil = {
    x: 0,
    y: 0,
    size: 180,
    coords: [
      { x: 1.0000, y: 0.0000 }, { x: 0.9500, y: 0.0086 }, { x: 0.9000, y: 0.0138 },
      { x: 0.8000, y: 0.0242 }, { x: 0.7000, y: 0.0340 }, { x: 0.6000, y: 0.0418 },
      { x: 0.5000, y: 0.0480 }, { x: 0.4000, y: 0.0520 }, { x: 0.3000, y: 0.0528 },
      { x: 0.2000, y: 0.0508 }, { x: 0.1500, y: 0.0472 }, { x: 0.1000, y: 0.0392 },
      { x: 0.0750, y: 0.0352 }, { x: 0.0500, y: 0.0292 }, { x: 0.0250, y: 0.0210 },
      { x: 0.0125, y: 0.0154 }, { x: 0.0000, y: 0.0000 }, { x: 0.0125, y: -0.0152 },
      { x: 0.0250, y: -0.0200 }, { x: 0.0500, y: -0.0280 }, { x: 0.0750, y: -0.0348 },
      { x: 0.1000, y: -0.0386 }, { x: 0.1500, y: -0.0440 }, { x: 0.2000, y: -0.0480 },
      { x: 0.3000, y: -0.0518 }, { x: 0.4000, y: -0.0500 }, { x: 0.5000, y: -0.0470 },
      { x: 0.6000, y: -0.0418 }, { x: 0.7000, y: -0.0340 }, { x: 0.8000, y: -0.0246 },
      { x: 0.9000, y: -0.0134 }, { x: 0.9500, y: -0.0080 }, { x: 1.0000, y: 0.0000 }
    ],
    scaled: []
  };

  function updateAirfoilPath() {
    const scaleX = airfoil.size * 0.96;
    const scaleY = airfoil.size * 1.3;
    airfoil.scaled = airfoil.coords.map((point) => ({
      x: airfoil.x + (point.x - 0.5) * scaleX,
      y: airfoil.y - point.y * scaleY
    }));
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    airfoil.x = w * 0.45;
    airfoil.y = h * 0.5;
    airfoil.size = Math.min(300, w * 0.4, h * 0.45);
    updateAirfoilPath();
    draw();
  }

  window.addEventListener("resize", resize);
  resize();

  function drawAirfoil() {
    ctx.save();
    ctx.beginPath();
    airfoil.scaled.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
    ctx.fill();
    ctx.strokeStyle = "rgba(56, 189, 248, 1)";
    ctx.lineWidth = 3.5;
    ctx.stroke();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  function streamlineOffset(baseY, x) {
    const centerX = airfoil.x;
    const width = airfoil.size * 0.9;
    const dx = x - centerX;
    if (dx < -width || dx > width * 1.1) return 0;
    const t = (dx + width) / (width * 2.1);
    const sign = baseY < airfoil.y ? -1 : 1;
    const magnitude = (1 - Math.min(Math.abs(baseY - airfoil.y) / (h * 0.28), 1)) * 18;
    return Math.sin(Math.PI * t) * magnitude * sign * 0.85;
  }

  function drawStreamline(baseY, alpha) {
    ctx.beginPath();
    for (let i = 0; i <= 80; i++) {
      const x = -40 + (w + 80) * (i / 80);
      const y = baseY + streamlineOffset(baseY, x);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  function draw() {
    ctx.fillStyle = "rgba(15, 23, 42, 1)";
    ctx.fillRect(0, 0, w, h);

    [h * 0.17, h * 0.27, h * 0.37, h * 0.47, h * 0.57, h * 0.67, h * 0.77].forEach((y, index) => {
      drawStreamline(y, 0.22 - index * 0.02);
    });

    drawAirfoil();
  }

  draw();
}
