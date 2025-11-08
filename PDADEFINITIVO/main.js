// --- main.js con animación + pausa + limpiar + sonidos corregidos ---
let intervalo; // controlador global
let pausado = false;
let idxGlobal = 0;
let pasosGlobal = [];

function simularPDA() {
  const cadena = document.getElementById("cadena").value.trim();
  const resultado = document.getElementById("resultado");
  const pilaDiv = document.getElementById("pila");
  const btnSimular = document.getElementById("btnSimular");
  const btnPausa = document.getElementById("btnPausa");
  const btnLimpiar = document.getElementById("btnLimpiar");

  // Reset visual
  clearInterval(intervalo);
  resultado.textContent = "";
  pilaDiv.innerHTML = "";
  resultado.className = "resultado-box";
  idxGlobal = 0;
  pasosGlobal = [];
  pausado = false;

  // ✅ Sonidos actualizados (usa tus archivos en /sounds)
  const successSound = new Audio("sounds/success.wav");
  const errorSound = new Audio("sounds/error.mp3");

  if (!cadena) {
    resultado.textContent = "❌ Ingrese una cadena.";
    resultado.classList.add("error");
    errorSound.play();
    return;
  }

  const posX = cadena.indexOf("x");
  if (posX === -1 || cadena.indexOf("x", posX + 1) !== -1) {
    resultado.textContent = "❌ Error: debe existir exactamente una 'x' separadora.";
    resultado.classList.add("error");
    errorSound.play();
    return;
  }

  const left = cadena.slice(0, posX);
  const right = cadena.slice(posX + 1);

  const leftMatch = left.match(/^a{2,}b+$/);
  if (!leftMatch) {
    resultado.textContent = "❌ Error: la parte izquierda debe ser aⁿ bᵐ con n≥2 y m≥1 (ej: 'aa...bb...').";
    resultado.classList.add("error");
    errorSound.play();
    return;
  }

  const aIniciales = left.match(/^a+/)[0];
  const bBloque = left.match(/b+$/)[0];
  const n = aIniciales.length;
  const m = bBloque.length;

  const rightMatch = right.match(/^y*(c+)(a+)$/);
  if (!rightMatch) {
    resultado.textContent = "❌ Error: la parte derecha debe tener (posibles 'y') luego cᵐ y luego aⁿ finales.";
    resultado.classList.add("error");
    errorSound.play();
    return;
  }

  const cBloque = rightMatch[1];
  const aFinales = rightMatch[2];
  const cCount = cBloque.length;
  const aFinalCount = aFinales.length;

  if (cCount !== m) {
    resultado.textContent = `❌ Error: número de 'c' (${cCount}) no coincide con número de 'b' (${m}).`;
    resultado.classList.add("error");
    errorSound.play();
    return;
  }

  if (aFinalCount !== n) {
    resultado.textContent = `❌ Error: número de 'a' finales (${aFinalCount}) no coincide con número de a's iniciales (${n}).`;
    resultado.classList.add("error");
    errorSound.play();
    return;
  }

  if (n < 2 || m < 1) {
    resultado.textContent = "❌ Error: se requiere n ≥ 2 y m ≥ 1.";
    resultado.classList.add("error");
    errorSound.play();
    return;
  }

  // --- Simulación ---
  let pila = ["Z"];
  let cadenaIndex = 0;

  function registrarPaso(estado) {
    const resto = cadena.slice(cadenaIndex) || "λ";
    pasosGlobal.push({ estado, resto, pila: [...pila] });
  }

  function push(sym) { pila.push(sym); }
  function pop() { if (pila.length > 1) pila.pop(); }

  registrarPaso("q0");
  for (let i = 0; i < n; i++) { push("A"); cadenaIndex++; registrarPaso("q0"); }
  for (let i = 0; i < m; i++) { push("B"); cadenaIndex++; registrarPaso("q1"); }
  cadenaIndex++; registrarPaso("q2");

  const yMatch = right.match(/^y*/);
  const yCount = yMatch ? yMatch[0].length : 0;
  for (let i = 0; i < yCount; i++) { cadenaIndex++; registrarPaso("q2"); }
  for (let i = 0; i < m; i++) { pop(); cadenaIndex++; registrarPaso("q3"); }
  for (let i = 0; i < n; i++) { pop(); cadenaIndex++; registrarPaso("q4"); }

  resultado.textContent = "⏳ Simulando PDA...\n";
  btnPausa.style.display = "inline-block";
  btnLimpiar.style.display = "inline-block";

  idxGlobal = 0;
  intervalo = setInterval(() => ejecutarPaso(pasosGlobal, resultado, pilaDiv, successSound, errorSound), 700);
}

function ejecutarPaso(pasos, resultado, pilaDiv, successSound, errorSound) {
  if (pausado) return;

  if (idxGlobal >= pasos.length) {
    clearInterval(intervalo);
    const pilaFinal = pasos[pasos.length - 1].pila.join("");
    const restoFinal = pasos[pasos.length - 1].resto;

    if (pilaFinal === "Z" && restoFinal === "λ") {
      resultado.textContent += "\n✅ Cadena aceptada por el PDA (Por Pila Vacía).";
      resultado.classList.add("exito");
      successSound.play();
    } else {
      resultado.textContent += `\n❌ Cadena no aceptada (Pila final: ${pilaFinal}, Resto: ${restoFinal}).`;
      resultado.classList.add("error");
      errorSound.play();
    }
    return;
  }

  const paso = pasos[idxGlobal];
  resultado.textContent += `${idxGlobal}. (${paso.estado}, ${paso.resto}, ${paso.pila.join("")})\n`;
  mostrarPilaAnimada(paso.pila);
  idxGlobal++;
}

// --- Botones extra ---
function pausarReanudar() {
  pausado = !pausado;
  const btnPausa = document.getElementById("btnPausa");
  btnPausa.textContent = pausado ? "▶ Reanudar" : "⏸ Pausar";
}

function limpiarSimulador() {
  clearInterval(intervalo);
  document.getElementById("resultado").textContent = "";
  document.getElementById("pila").innerHTML = "";
  document.getElementById("btnPausa").style.display = "none";
  document.getElementById("btnLimpiar").style.display = "none";
  document.getElementById("resultado").className = "resultado-box";
}

// --- Animación visual de pila ---
function mostrarPilaAnimada(pila) {
  const pilaDiv = document.getElementById("pila");
  pilaDiv.innerHTML = "";

  pila.forEach((sym, i) => {
    const el = document.createElement("div");
    el.className = "pila-item pila-animada";
    el.textContent = sym;
    pilaDiv.appendChild(el);
    setTimeout(() => el.classList.add("pila-visible"), 100 * i);
  });
}
