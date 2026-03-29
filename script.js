const IMGS_PATH = "img/"; 
const USER_TOKEN = "77e68224"; 
const KEY_NAME = "puntosGustavo2026"; 
const API_BASE = `https://api.keyvalue.xyz/${USER_TOKEN}/${KEY_NAME}`;

// --- CONFIGURACIÓN DE APPS SCRIPT ---
const API_USERS = "https://script.google.com/macros/s/AKfycbyevNF0dg4V_3PjldD97IbOfaB57_FY2Wn1dX-7bwKWUMXgO6FTDClge-0-3yPJcO_TPw/exec";

const paisajesPeru = [
    "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1600",
    "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?q=80&w=1600",
    "https://images.unsplash.com/photo-1590050751217-23b609fc6f1c?q=80&w=1600"
];

window.onload = () => {
    obtenerPuntosGlobales();
    cambiarFondo();
};

// --- NAVEGACIÓN ENTRE PANTALLAS ---

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

// --- LÓGICA DE USUARIOS Y SEGURIDAD ---

async function intentarLogin() {
    const dni = document.getElementById("user-input").value.trim();
    const pass = document.getElementById("pass-input").value.trim();

    if (!dni || !pass) { alert("Ingresa tu DNI y contraseña"); return; }

    // Acceso Maestro
    if (dni === "Omg20" && pass === "Sdmin2026*") {
        entrarApp();
        return;
    }

    try {
        const res = await fetch(API_USERS);
        const db = await res.json();
        
        // Buscamos coincidencia de DNI y Password
        const usuarioValido = db.find(item => item.dni == dni && item.p == pass);
        
        if (usuarioValido) {
            entrarApp();
        } else {
            alert("DNI o contraseña incorrectos. Si no tienes cuenta, regístrate.");
        }
    } catch (e) {
        alert("Error de conexión con la base de datos.");
    }
}

async function crearCuentaPropia() {
    const dni = document.getElementById("reg-dni").value.trim();
    const nombre = document.getElementById("reg-nombre").value.trim();
    const prof = document.getElementById("reg-profesion").value.trim();
    const cel = document.getElementById("reg-cel").value.trim();
    const reg = document.getElementById("reg-region").value.trim();
    const prov = document.getElementById("reg-prov").value.trim();
    const dist = document.getElementById("reg-dist").value.trim();
    const eess = document.getElementById("reg-eess").value.trim();
    const pass = document.getElementById("reg-pass").value.trim();

    if (!dni || !pass || !nombre) { 
        alert("DNI, Nombre y Contraseña son campos obligatorios."); 
        return; 
    }

    const btn = document.querySelector("#register-screen .btn-calc");
    btn.innerText = "PROCESANDO...";
    btn.disabled = true;

    const datos = {
        action: "crear",
        dni: dni,
        nombre: nombre,
        prof: prof,
        cel: cel,
        reg: reg,
        prov: prov,
        dist: dist,
        eess: eess,
        p: pass
    };

    try {
        await fetch(API_USERS, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        alert("¡Registro exitoso! Ya puedes iniciar sesión con tu DNI.");
        mostrarLogin();
    } catch (err) {
        alert("Hubo un problema al enviar el registro.");
    } finally {
        btn.innerText = "FINALIZAR REGISTRO";
        btn.disabled = false;
    }
}

// --- FUNCIONES DE ADMINISTRADOR ---

function abrirAdmin() {
    const p = prompt("Clave de Administrador:");
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
        container.innerHTML = "<h3>Usuarios Registrados (Excel):</h3>";
        db.forEach(user => {
            container.innerHTML += `<div class="user-item">👤 DNI: ${user.dni} | 🔑 ${user.p}</div>`;
        });
    } catch (e) {
        console.log("Error al listar desde Excel.");
    }
}

// --- CALCULADORA Y FUNCIONES ORIGINALES ---

async function obtenerPuntosGlobales() {
    try {
        const res = await fetch(API_BASE);
        if (!res.ok) throw new Error();
        const valor = await res.text();
        document.getElementById("numConsultas").innerText = valor || 0;
    } catch (err) {
        let local = localStorage.getItem("puntosClinicos") || 0;
        document.getElementById("numConsultas").innerText = local;
    }
}

function cambiarFondo() {
    const bg = paisajesPeru[Math.floor(Math.random() * paisajesPeru.length)];
    const bgElement = document.getElementById("bg-peru");
    if (bgElement) bgElement.style.background = `url('${bg}')`;
}

function seleccionarOpcion(idHidden, elemento) {
    const botones = elemento.parentElement.querySelectorAll('.option-btn');
    botones.forEach(btn => btn.classList.remove('selected'));
    elemento.classList.add('selected');
    
    const valor = elemento.getAttribute('data-value');
    document.getElementById(idHidden).value = valor;

    if (idHidden === 'tipoHierro') {
        const img = document.getElementById("imgHierro");
        img.src = IMGS_PATH + valor + ".jpg";
        document.getElementById("result-card").classList.remove("hidden");
        document.getElementById("okBtn").classList.add("hidden"); 
    }
    validar();
}

function validar() {
    const pesoInput = document.getElementById("peso");
    let peso = parseFloat(pesoInput.value);
    
    if (peso > 100) { 
        peso = peso / 1000; 
        pesoInput.value = peso.toFixed(1); 
        pesoInput.style.borderColor = "#00f2fe";
        setTimeout(() => { pesoInput.style.borderColor = "rgba(255,255,255,0.2)"; }, 500);
    }

    const esquema = document.getElementById("esquema").value;
    const tipo = document.getElementById("tipoHierro").value;
    const btn = document.getElementById("actionBtn");
    const alerta = document.getElementById("alerta-clinica");
    const msg = document.getElementById("msg-alerta");

    if (peso > 0 && tipo) {
        if (tipo.includes("_g") && peso > 12) {
            msg.innerText = "Peso alto para gotas (>12kg). Se sugiere Jarabe.";
            alerta.classList.remove("hidden");
        } else if (tipo.includes("_j") && peso < 8) {
            msg.innerText = "Peso bajo para jarabe (<8kg). Se sugiere Gotas.";
            alerta.classList.remove("hidden");
        } else {
            alerta.classList.add("hidden");
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
        let actual = 0;
        if (res.ok) {
            const texto = await res.text();
            actual = parseInt(texto) || 0;
        }
        let nuevoTotal = actual + 1;
        await fetch(`${API_BASE}/${nuevoTotal}`, { method: 'POST' });
        localStorage.setItem("puntosClinicos", nuevoTotal);
    } catch (err) {
        let local = parseInt(localStorage.getItem("puntosClinicos")) || 0;
        localStorage.setItem("puntosClinicos", local + 1);
    }
    location.reload(); 
}
