const API_URL = "https://script.google.com/macros/s/AKfycbwMenRVJHIwZQAM8XG8sSoW0Vxsj-cldX_xEjHJvXJP0_FYk4yJYUTxLzrSR7Nmr6ZNXA/exec"; 
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
    if (dni === "Omg20") {
        SESION = { dni: "Admin", nombre: "Gustabo Ortiz", eess: "Sede Central" };
        lanzarApp(); return;
    }
    try {
        const res = await fetch(API_URL);
        const db = await res.json();
        const user = db.find(u => u.dni == dni);
        if (user) { SESION = user; lanzarApp(); }
        else { alert("DNI no autorizado."); }
    } catch (e) { alert("Error de red."); }
}

function lanzarApp() {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app-container").classList.remove("hidden");
    document.getElementById("prof-display").innerText = SESION.nombre;
    document.getElementById("dni-display").innerText = SESION.dni;
}

function validarYCalcular() {
    const pInput = document.getElementById("peso");
    let peso = parseFloat(pInput.value);
    
    // Función original: corrección automática de peso
    if (peso > 100) { peso = peso / 1000; pInput.value = peso.toFixed(1); }

    const esquema = document.getElementById("esquema").value;
    const tipo = document.getElementById("tipoHierro").value;
    const msg = document.getElementById("global-msg");

    if (peso > 0 && esquema && tipo) {
        document.getElementById("result-card").classList.remove("hidden");
        let mgDia = peso * parseFloat(esquema);
        let dosis = ""; let frascos = 0;

        // ALERTAS ORIGINALES GUSTABO
        if (tipo.includes("_g") && peso >= 12) {
            msg.innerHTML = "⚠️ <b style='color:red'>AVISO:</b> Sugiero usar JARABE por el peso.";
        } else if (tipo.includes("_j") && peso < 8) {
            msg.innerHTML = "⚠️ <b style='color:orange'>AVISO:</b> Sugiero usar GOTAS por el peso.";
        } else {
            msg.innerText = "Cálculo optimizado según NTS 213-2024.";
        }

        // ALGORITMO ORIGINAL
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
        document.getElementById("resFrascos").innerText = frascos + " Unid.";
    } else {
        document.getElementById("result-card").classList.add("hidden");
    }
}

async function registrarYReiniciar() {
    const okBtn = document.getElementById("okBtn");
    okBtn.innerText = "ENVIANDO...";
    okBtn.disabled = true;

    const info = {
        action: "registro_consulta",
        userDni: SESION.dni,
        userName: SESION.nombre,
        userEess: SESION.eess,
        pesoPaciente: document.getElementById("peso").value,
        esquema: document.getElementById("esquema").value == "2" ? "Prev" : "Trat",
        tipoHierro: document.getElementById("tipoHierro").value,
        dosis: document.getElementById("resDosis").innerText,
        frascos: document.getElementById("resFrascos").innerText
    };

    try {
        await fetch(API_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(info) });
        const rCount = await fetch(API_KV);
        const val = parseInt(await rCount.text()) || 0;
        await fetch(API_KV + "/" + (val + 1), { method: 'POST' });
        
        alert("¡Registro guardado!");
        location.reload();
    } catch (e) { alert("Error al registrar."); okBtn.disabled = false; }
}

async function actualizarPuntos() {
    try {
        const r = await fetch(API_KV);
        document.getElementById("numConsultas").innerText = await r.text() || 0;
    } catch (e) {}
}

function mostrarRegistro() { document.getElementById("login-screen").classList.add("hidden"); document.getElementById("register-screen").classList.remove("hidden"); }
function mostrarLogin() { document.getElementById("register-screen").classList.add("hidden"); document.getElementById("login-screen").classList.remove("hidden"); }
