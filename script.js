// --- CONFIGURACIÓN GLOBAL ---
const IMGS_PATH = "img/"; 
const USER_TOKEN = "77e68224"; 
const KEY_NAME = "puntosGustavo2026"; 
const API_BASE = `https://api.keyvalue.xyz/${USER_TOKEN}/${KEY_NAME}`;

// --- URL DE TU IMPLEMENTACIÓN DE GOOGLE APPS SCRIPT ---
const API_USERS = "https://script.google.com/macros/s/AKfycbxsZsab_GYsvSzwuVhMD89WmxaH35mnlHsaXP1cH3FgriUzklPQOA4rkk7Lu10642dMRA/exec"; 

const paisajesPeru = [
    "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1600",
    "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?q=80&w=1600",
    "https://images.unsplash.com/photo-1590050751217-23b609fc6f1c?q=80&w=1600"
];

window.onload = () => {
    obtenerPuntosGlobales();
    cambiarFondo();
};

// --- NAVEGACIÓN ---
function mostrarRegistro() {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("register-screen").classList.remove("hidden");
}

function mostrarLogin() {
    document.getElementById("register-screen").classList.add("hidden");
    document.getElementById("login-screen").classList.remove("hidden");
}

function entrarApp() {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app-container").classList.remove("hidden");
}

// --- SEGURIDAD Y LOGIN ---
async function intentarLogin() {
    const dni = document.getElementById("user-input").value.trim();
    const pass = document.getElementById("pass-input").value.trim();

    if (!dni || !pass) { alert("DNI y Contraseña requeridos"); return; }

    // Acceso Maestro
    if (dni === "Omg20" && pass === "Sdmin2026*") { entrarApp(); return; }

    try {
        const res = await fetch(API_USERS);
        const db = await res.json();
        const user = db.find(u => u.dni == dni && u.p == pass);
        
        if (user) entrarApp();
        else alert("DNI o contraseña incorrectos.");
    } catch (e) { alert("Error de conexión con el servidor."); }
}

async function crearCuentaPropia() {
    const datos = {
        action: "crear",
        dni: document.getElementById("reg-dni").value.trim(),
        nombre: document.getElementById("reg-nombre").value.trim(),
        prof: document.getElementById("reg-profesion").value.trim(),
        cel: document.getElementById("reg-cel").value.trim(),
        reg: document.getElementById("reg-region").value.trim(),
        prov: document.getElementById("reg-prov").value.trim(),
        dist: document.getElementById("reg-dist").value.trim(),
        eess: document.getElementById("reg-eess").value.trim(),
        p: document.getElementById("reg-pass").value.trim()
    };

    if (!datos.dni || !datos.p || !datos.nombre) { 
        alert("Campos obligatorios: DNI, Nombre y Contraseña"); 
        return; 
    }

    const btn = document.querySelector("#register-screen .btn-calc");
    btn.innerText = "ENVIANDO DATOS...";
    btn.disabled = true;

    try {
        await fetch(API_USERS, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        alert("¡Registro exitoso! Ya puedes iniciar sesión.");
        mostrarLogin();
    } catch (err) { 
        alert("Error al registrar."); 
    } finally { 
        btn.innerText = "FINALIZAR REGISTRO"; 
        btn.disabled = false; 
    }
}

// --- PANEL ADMIN ---
function abrirAdmin() {
    const p = prompt("Acceso Maestro:");
    if (p === "Sdmin2026*") {
        document.getElementById("app-container").classList.add("hidden");
        document.getElementById("admin-panel").classList.remove("hidden");
        listarUsuarios();
    }
}

function cerrarAdmin() {
    document.getElementById("admin-panel").classList.add("hidden");
    document.getElementById("app-container").classList.remove("hidden");
}

async function listarUsuarios() {
    try {
        const res = await fetch(API_USERS);
        const db = await res.json();
        const container = document.getElementById("lista-usuarios");
        container.innerHTML = "<h3>Usuarios (DNI):</h3>";
        db.forEach(u => { 
            container.innerHTML += `<div class="user-item">👤 ${u.dni} | 🔑 ${u.p}</div>`; 
        });
    } catch (e) { console.log("Error listando."); }
}

// --- CALCULADORA Y ALERTAS CLÍNICAS ---

async function obtenerPuntosGlobales() {
    try {
        const res = await fetch(API_BASE);
        const valor = await res.text();
        document.getElementById("numConsultas").innerText = valor || 0;
    } catch (err) { 
        document.getElementById("numConsultas").innerText = localStorage.getItem("puntosClinicos") || 0; 
    }
}

function cambiarFondo() {
    const bg = paisajesPeru[Math.floor(Math.random() * paisajesPeru.length)];
    document.getElementById("bg-peru").style.background = `url('${bg}')`;
}

function seleccionarOpcion(idHidden, elemento) {
    elemento.parentElement.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    elemento.classList.add('selected');
    document.getElementById(idHidden).value = elemento.getAttribute('data-value');
    
    if (idHidden === 'tipoHierro') {
        document.getElementById("imgHierro").src = IMGS_PATH + document.getElementById(idHidden).value + ".jpg";
        document.getElementById("result-card").classList.remove("hidden");
        document.getElementById("okBtn").classList.add("hidden");
    }
    validar();
}

function validar() {
    const pesoInput = document.getElementById("peso");
    let peso = parseFloat(pesoInput.value);
    
    // Auto-corrección de gramos a kilos (ej. 8500 -> 8.5)
    if (peso > 100) { 
        peso = peso / 1000; 
        pesoInput.value = peso.toFixed(1); 
    }

    const esquema = document.getElementById("esquema").value;
    const tipo = document.getElementById("tipoHierro").value;
    const btn = document.getElementById("actionBtn");

    // --- ALERTAS DE SEGURIDAD CLÍNICA REINTEGRADAS ---
    if (peso > 0 && tipo) {
        if (tipo.includes("_g") && peso >= 12) {
            alert("⚠️ ALERTA: El peso es de " + peso + " kg. Se sugiere usar JARABE para mayor precisión en la dosis.");
        } else if (tipo.includes("_j") && peso < 8) {
            alert("⚠️ ALERTA: El peso es de " + peso + " kg. Se sugiere usar GOTAS por el volumen pequeño de la dosis.");
        }
    }

    if (peso > 0 && peso < 100 && esquema && tipo) {
        btn.disabled = false;
        btn.className = "btn-cyber btn-calc";
    } else {
        btn.disabled = true;
        btn.className = "btn-cyber btn-disabled";
    }
}

function calcularDosis() {
    const peso = parseFloat(document.getElementById("peso").value);
    const tipo = document.getElementById("tipoHierro").value;
    const meses = parseInt(document.getElementById("meses").value) || 1;
    const esquema = parseFloat(document.getElementById("esquema").value);
    
    let mgDia = peso * esquema;
    let dosis = ""; let frascos = 0;

    switch(tipo) {
        case "polimaltosado_g": 
            dosis = Math.round(mgDia / 2.5) + " gotas"; 
            frascos = Math.ceil(((mgDia / 50) * 30 * meses) / 30); break;
        case "sulfato_g": 
            dosis = Math.round(mgDia / 1.25) + " gotas"; 
            frascos = Math.ceil(((mgDia / 25) * 30 * meses) / 30); break;
        case "sulfato_j": 
            dosis = (mgDia / 3).toFixed(1) + " ml"; 
            frascos = Math.ceil(((mgDia / 3) * 30 * meses) / 180); break;
        case "polimaltosado_j": 
            dosis = (mgDia / 10).toFixed(1) + " ml"; 
            frascos = Math.ceil(((mgDia / 10) * 30 * meses) / 100); break;
        case "micronutrientes": 
            dosis = "1 SOBRE"; 
            frascos = 30 * meses; break;
    }

    document.getElementById("resDosis").innerText = dosis;
    document.getElementById("resFrascos").innerText = `ENTREGAR: ${frascos} Unidades.`;
    
    document.getElementById("form-wrapper").classList.add("hidden");
    document.getElementById("app-footer").classList.add("hidden");
    document.getElementById("result-card").classList.remove("hidden");
    document.getElementById("okBtn").classList.remove("hidden");
}

async function registrarYReiniciar() {
    try {
        const res = await fetch(API_BASE);
        const actual = parseInt(await res.text()) || 0;
        await fetch(`${API_BASE}/${actual + 1}`, { method: 'POST' });
        localStorage.setItem("puntosClinicos", actual + 1);
    } catch (e) { console.log("Error puntos."); }
    location.reload(); 
}
