const API_USERS = "https://script.google.com/macros/s/AKfycby8bgaCP7S3fUYoPvkRIliJd6rSfHu4dBtumMBpL87DhFNatpByA0LenbWOu-QkbCmxug/exec"; 
const API_PUNTOS = "https://api.keyvalue.xyz/77e68224/puntosGustavo2026";
let SESION_ACTUAL = null;

window.onload = () => {
    document.getElementById("bg-peru").style.background = "url('https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1200') center/cover";
    actualizarPuntosContador();
};

async function intentarLogin() {
    const dni = document.getElementById("user-input").value.trim();
    if (dni === "Omg20") { // Admin bypass
        SESION_ACTUAL = { dni: "Admin", nombre: "Gustabo Ortiz", eess: "Sede Central" };
        loginExitoso(); return;
    }

    try {
        document.getElementById("nurse-msg").innerText = "Verificando DNI...";
        const res = await fetch(API_USERS);
        const data = await res.json();
        const user = data.find(u => u.dni == dni);
        
        if (user) {
            SESION_ACTUAL = user;
            loginExitoso();
        } else {
            document.getElementById("nurse-msg").innerText = "DNI no registrado.";
        }
    } catch (e) { alert("Error de red."); }
}

function loginExitoso() {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app-container").classList.remove("hidden");
    document.getElementById("prof-display").innerText = "Dr(a). " + SESION_ACTUAL.nombre;
    document.getElementById("nurse-msg").innerText = "¡Todo listo para calcular!";
}

function validarYCalcular() {
    const pesoInput = document.getElementById("peso");
    let peso = parseFloat(pesoInput.value);
    
    // Función original de corrección de peso
    if (peso > 100) { peso = peso / 1000; pesoInput.value = peso.toFixed(1); }

    const esquema = document.getElementById("esquema").value;
    const tipo = document.getElementById("tipoHierro").value;

    if (peso > 0 && esquema && tipo) {
        document.getElementById("result-card").classList.remove("hidden");
        
        let mgDia = peso * parseFloat(esquema);
        let dosis = ""; let frascos = 0;

        // Lógica de cálculo según NTS
        switch(tipo) {
            case "polimaltosado_g": 
                dosis = Math.round(mgDia / 2.5) + " gotas"; 
                frascos = Math.ceil((mgDia * 30 / 50) / 30); break;
            case "sulfato_g": 
                dosis = Math.round(mgDia / 1.25) + " gotas"; 
                frascos = Math.ceil((mgDia * 30 / 25) / 30); break;
            case "sulfato_j": 
                dosis = (mgDia / 3).toFixed(1) + " ml"; 
                frascos = Math.ceil((mgDia * 30 / 3) / 180); break;
            case "polimaltosado_j": 
                dosis = (mgDia / 10).toFixed(1) + " ml"; 
                frascos = Math.ceil((mgDia * 30 / 10) / 100); break;
            case "micronutrientes": 
                dosis = "1 SOBRE"; frascos = 30; break;
        }

        document.getElementById("resDosis").innerText = dosis;
        document.getElementById("resFrascos").innerText = "ENTREGAR: " + frascos + " Unid.";
    } else {
        document.getElementById("result-card").classList.add("hidden");
    }
}

async function registrarYReiniciar() {
    const btn = document.getElementById("okBtn");
    btn.innerText = "ENVIANDO...";
    
    const data = {
        action: "registro_consulta",
        userDni: SESION_ACTUAL.dni,
        userName: SESION_ACTUAL.nombre,
        userEess: SESION_ACTUAL.eess,
        pesoPaciente: document.getElementById("peso").value,
        esquema: document.getElementById("esquema").value,
        tipoHierro: document.getElementById("tipoHierro").value,
        dosis: document.getElementById("resDosis").innerText,
        frascos: document.getElementById("resFrascos").innerText
    };

    try {
        await fetch(API_USERS, { method: 'POST', mode: 'no-cors', body: JSON.stringify(data) });
        
        // Sumar punto en contador global
        const res = await fetch(API_PUNTOS);
        const puntos = parseInt(await res.text()) || 0;
        await fetch(API_PUNTOS + "/" + (puntos + 1), { method: 'POST' });

        alert("Consulta guardada.");
        location.reload();
    } catch (e) { alert("Error al guardar."); }
}

async function actualizarPuntosContador() {
    const res = await fetch(API_PUNTOS);
    const val = await res.text();
    document.getElementById("numConsultas").innerText = val || 0;
}

function mostrarRegistro() { 
    document.getElementById("login-screen").classList.add("hidden"); 
    document.getElementById("register-screen").classList.remove("hidden"); 
}
function mostrarLogin() { 
    document.getElementById("register-screen").classList.add("hidden"); 
    document.getElementById("login-screen").classList.remove("hidden"); 
}
