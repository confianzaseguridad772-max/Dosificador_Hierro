// CONFIGURACIÓN - REEMPLAZAR CON TU URL
const API_USERS = "https://script.google.com/macros/s/AKfycbxHG-9csNlwn6jntHSM6Hw-CgqMDrQqI722y7-bmfZYIDh2-GDutkxKUSUHB6o5tDE_FQ/exec"; 
const API_BASE_PUNTOS = "https://api.keyvalue.xyz/77e68224/puntosGustavo2026";

let SESION_ACTUAL = null;

const paisajesPeru = [
    "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1200",
    "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?q=80&w=1200"
];

window.onload = () => {
    const bg = paisajesPeru[Math.floor(Math.random() * paisajesPeru.length)];
    document.getElementById("bg-peru").style.background = `url('${bg}') center/cover`;
    obtenerPuntosGlobales();
};

// NAVEGACIÓN
function mostrarRegistro() {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("register-screen").classList.remove("hidden");
}

function mostrarLogin() {
    document.getElementById("register-screen").classList.add("hidden");
    document.getElementById("login-screen").classList.remove("hidden");
}

// LOGIN SOLO CON DNI
async function intentarLogin() {
    const dni = document.getElementById("user-input").value.trim();
    if (!dni) return;

    // Acceso Maestro Original
    if (dni === "Omg20") {
        SESION_ACTUAL = { dni: "Admin", nombre: "Gustabo Ortiz", eess: "Sede Central" };
        iniciarApp(); return;
    }

    try {
        document.getElementById("nurse-msg").innerText = "Buscando en la base de datos...";
        const res = await fetch(API_USERS);
        const usuarios = await res.json();
        const user = usuarios.find(u => u.dni == dni);

        if (user) {
            SESION_ACTUAL = user;
            iniciarApp();
        } else {
            document.getElementById("nurse-msg").innerText = "DNI no encontrado. Regístrate.";
        }
    } catch (e) { alert("Error de conexión"); }
}

function iniciarApp() {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app-container").classList.remove("hidden");
    document.getElementById("prof-display").innerText = "Dr(a). " + SESION_ACTUAL.nombre;
    document.getElementById("nurse-msg").innerText = "¡Excelente! Empecemos con el paciente.";
}

// CÁLCULO AUTOMÁTICO Y VALIDACIÓN ORIGINAL
function validarYCalcular() {
    const pesoInput = document.getElementById("peso");
    let peso = parseFloat(pesoInput.value);

    // Función original: Corrección de gramos a kilos
    if (peso > 100) {
        peso = peso / 1000;
        pesoInput.value = peso.toFixed(1);
    }

    const esquema = document.getElementById("esquema").value;
    const tipo = document.getElementById("tipoHierro").value;

    if (peso > 0 && esquema && tipo) {
        document.getElementById("result-card").classList.remove("hidden");
        
        // Lógica de cálculo original
        let mgDia = peso * parseFloat(esquema);
        let dosis = ""; let frascos = 0;

        // Alertas originales
        if (tipo.includes("_g") && peso >= 12) {
            document.getElementById("nurse-msg").innerText = "⚠️ Peso alto: Sugiero usar JARABE.";
        } else if (tipo.includes("_j") && peso < 8) {
            document.getElementById("nurse-msg").innerText = "⚠️ Peso bajo: Sugiero usar GOTAS.";
        } else {
            document.getElementById("nurse-msg").innerText = "La dosis es correcta según la NTS.";
        }

        switch(tipo) {
            case "polimaltosado_g": 
                dosis = Math.round(mgDia / 2.5) + " gotas"; 
                frascos = Math.ceil(((mgDia / 50) * 30) / 30); break;
            case "sulfato_g": 
                dosis = Math.round(mgDia / 1.25) + " gotas"; 
                frascos = Math.ceil(((mgDia / 25) * 30) / 30); break;
            case "sulfato_j": 
                dosis = (mgDia / 3).toFixed(1) + " ml"; 
                frascos = Math.ceil(((mgDia / 3) * 30) / 180); break;
            case "polimaltosado_j": 
                dosis = (mgDia / 10).toFixed(1) + " ml"; 
                frascos = Math.ceil(((mgDia / 10) * 30) / 100); break;
            case "micronutrientes": 
                dosis = "1 SOBRE"; frascos = 30; break;
        }

        document.getElementById("resDosis").innerText = dosis;
        document.getElementById("resFrascos").innerText = `ENTREGAR: ${frascos} Unidades`;
    } else {
        document.getElementById("result-card").classList.add("hidden");
    }
}

// REGISTRO Y ENVÍO OPTIMIZADO
async function registrarYReiniciar() {
    const btn = document.getElementById("okBtn");
    btn.disabled = true;
    btn.innerText = "REGISTRANDO...";

    const datos = {
        action: "registro_consulta",
        userDni: SESION_ACTUAL.dni,
        userName: SESION_ACTUAL.nombre,
        userEess: SESION_ACTUAL.eess,
        pesoPaciente: document.getElementById("peso").value,
        esquema: document.getElementById("esquema").value == "2" ? "Prev" : "Trat",
        tipoHierro: document.getElementById("tipoHierro").value,
        dosis: document.getElementById("resDosis").innerText,
        frascos: document.getElementById("resFrascos").innerText
    };

    try {
        await fetch(API_USERS, { method: 'POST', mode: 'no-cors', body: JSON.stringify(datos) });
        
        // Contador global original KeyValue
        const resCont = await fetch(API_BASE_PUNTOS);
        const actual = parseInt(await resCont.text()) || 0;
        await fetch(`${API_BASE_PUNTOS}/${actual + 1}`, { method: 'POST' });

        alert("¡Consulta registrada con éxito!");
        location.reload();
    } catch (e) { 
        alert("Error al guardar."); 
        btn.disabled = false; 
    }
}

// OTRAS FUNCIONES ORIGINALES
async function obtenerPuntosGlobales() {
    const res = await fetch(API_BASE_PUNTOS);
    const val = await res.text();
    document.getElementById("numConsultas").innerText = val || 0;
}

function abrirAdmin() {
    const p = prompt("Acceso Maestro:");
    if (p === "Sdmin2026*") {
        document.getElementById("admin-panel").classList.remove("hidden");
        listarUsuarios();
    }
}
