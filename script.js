const IMGS_PATH = "img/"; 
const USER_TOKEN = "77e68224"; 
const KEY_NAME = "puntosGustavo2026"; 
const API_BASE = `https://api.keyvalue.xyz/${USER_TOKEN}/${KEY_NAME}`;

// --- IMPORTANTE: PEGA AQUÍ TU NUEVA URL DE GOOGLE APPS SCRIPT ---
const API_USERS = "https://script.google.com/macros/s/AKfycbyq8Uz_fSHtTicpMBa77suuz-EhrewprwNO91QyxjYGwmpqcLOpiYlY-UaTbZ2xXyrVKA/exec"; 

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

// --- LOGIN Y SEGURIDAD ---
async function intentarLogin() {
    const dni = document.getElementById("user-input").value.trim();
    const pass = document.getElementById("pass-input").value.trim();

    if (!dni || !pass) { alert("DNI y Contraseña requeridos"); return; }

    // Acceso Administrador (Tuyo)
    if (dni === "Omg20" && pass === "Sdmin2026*") { entrarApp(); return; }

    try {
        const res = await fetch(API_USERS);
        const db = await res.json();
        const user = db.find(u => u.dni == dni && u.p == pass);
        
        if (user) entrarApp();
        else alert("DNI o contraseña incorrectos.");
    } catch (e) { alert("Error al conectar con la base de datos."); }
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
    btn.innerText = "REGISTRANDO...";
    btn.disabled = true;

    try {
        await fetch(API_USERS, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(datos)
        });
        alert("¡Registro exitoso! Ya puedes ingresar con tu DNI.");
        mostrarLogin();
    } catch (err) { alert("Error en el registro."); }
    finally { btn.innerText = "FINALIZAR REGISTRO"; btn.disabled = false; }
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
        container.innerHTML = "<h3>Usuarios Activos (Excel):</h3>";
        db.forEach(u => { 
            container.innerHTML += `<div class="user-item">👤 DNI: ${u.dni} | 🔑: ${u.p}</div>`; 
        });
    } catch (e) { console.log("Error cargando lista."); }
}

// --- CALCULADORA ---
async function obtenerPuntosGlobales() {
    try {
        const res = await fetch(API_BASE);
        const valor = await res.text();
        document.getElementById("numConsultas").innerText = valor || 0;
    } catch (err) { document.getElementById("numConsultas").innerText = localStorage.getItem("puntosClinicos") || 0; }
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
    let val = parseFloat(pesoInput.value);
    if (val > 100) { pesoInput.value = (val/1000).toFixed(1); }

    const esc = document.getElementById("esquema").value;
    const tip = document.getElementById("tipoHierro").value;
    const btn = document.getElementById("actionBtn");

    if (parseFloat(pesoInput.value) > 0 && esc && tip) {
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
    document.getElementById("resFrascos").innerText = `ENTREGAR: ${frascos} Unid.`;
    document.getElementById("form-wrapper").classList.add("hidden");
    document.getElementById("app-footer").classList.add("hidden");
    document.getElementById("result-card").classList.remove("hidden");
    document.getElementById("okBtn").classList.remove("hidden");
}

async function registrarYReiniciar() {
    try {
        const res = await fetch(API_BASE);
        const act = parseInt(await res.text()) || 0;
        await fetch(`${API_BASE}/${act + 1}`, { method: 'POST' });
        localStorage.setItem("puntosClinicos", act + 1);
    } catch (e) { console.log("Error puntos."); }
    location.reload(); 
}
