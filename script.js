const API_URL = "https://script.google.com/macros/s/AKfycbzYn5XHXpukQ5xFg5RGjoVohAP5VL0tJ_Fzw2RuylPmAJOg2_hlnsaJa6DesGRTgUi6aQ/exec"; 
const API_KV = "https://api.keyvalue.xyz/77e68224/puntosGustavo2026";
let SESION = null;

const paisajes = [
    "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1200",
    "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?q=80&w=1200"
];

window.onload = () => {
    document.getElementById("bg-peru").style.background = `url('${paisajes[Math.floor(Math.random()*paisajes.length)]}') center/cover`;
    actualizarPuntos();
};

async function intentarLogin() {
    const dni = document.getElementById("user-input").value.trim();
    if (dni === "Omg20") { // Tu acceso maestro
        SESION = { dni: "Admin", nombre: "Gustabo Ortiz", eess: "Sede Central" };
        entrar(); return;
    }
    try {
        const res = await fetch(API_URL);
        const users = await res.json();
        const user = users.find(u => u.dni == dni);
        if (user) { SESION = user; entrar(); }
        else { alert("Usuario no encontrado."); }
    } catch (e) { alert("Error de conexión"); }
}

function entrar() {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app-container").classList.remove("hidden");
    document.getElementById("prof-display").innerText = "Dr(a). " + SESION.nombre;
    document.getElementById("nurse-msg").innerText = "¡Excelente! Empecemos el cálculo.";
}

function validarYCalcular() {
    const pInput = document.getElementById("peso");
    let peso = parseFloat(pInput.value);
    
    // Función original: corrección de gramos a kilos
    if (peso > 100) { peso = peso / 1000; pInput.value = peso.toFixed(1); }

    const esquema = document.getElementById("esquema").value;
    const tipo = document.getElementById("tipoHierro").value;

    if (peso > 0 && esquema && tipo) {
        document.getElementById("result-card").classList.remove("hidden");
        let mgDia = peso * parseFloat(esquema);
        let dosis = ""; let frascos = 0;

        // ALERTAS ORIGINALES
        if (tipo.includes("_g") && peso >= 12) {
            document.getElementById("nurse-msg").innerText = "⚠️ Sugiero usar JARABE por el peso del niño.";
        } else {
            document.getElementById("nurse-msg").innerText = "Dosis calculada según NTS 2024.";
        }

        // LÓGICA DE CÁLCULO ORIGINAL
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

async function registrarYReiniciar() {
    const btn = document.getElementById("okBtn");
    btn.innerText = "ENVIANDO...";
    const data = {
        action: "registro_consulta",
        userDni: SESION.dni,
        userName: SESION.nombre,
        userEess: SESION.eess,
        pesoPaciente: document.getElementById("peso").value,
        esquema: document.getElementById("esquema").value,
        tipoHierro: document.getElementById("tipoHierro").value,
        dosis: document.getElementById("resDosis").innerText,
        frascos: document.getElementById("resFrascos").innerText
    };
    try {
        await fetch(API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
        // Sumar punto en KeyValue
        const rCont = await fetch(API_KV);
        const actual = parseInt(await rCont.text()) || 0;
        await fetch(API_KV + "/" + (actual + 1), { method: 'POST' });
        
        alert("Consulta registrada.");
        location.reload();
    } catch (e) { alert("Error al guardar."); }
}

async function actualizarPuntos() {
    try {
        const res = await fetch(API_KV);
        document.getElementById("numConsultas").innerText = await res.text() || 0;
    } catch (e) {}
}

function mostrarRegistro() { document.getElementById("login-screen").classList.add("hidden"); document.getElementById("register-screen").classList.remove("hidden"); }
function mostrarLogin() { document.getElementById("register-screen").classList.add("hidden"); document.getElementById("login-screen").classList.remove("hidden"); }
