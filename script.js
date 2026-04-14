const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxprAOnhlcpo44O2YZglBQTR6zbHiDjYLyaxkPfD1V1ahjb40kU3Tmw8wnq51AREPRtBw/exec"; 
const KV_URL = "https://api.keyvalue.xyz/77e68224/puntosGustavo2026";
let USER_DATA = null;

window.onload = () => {
    document.getElementById("bg-peru").style.background = "url('https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1200') center/cover";
    updatePuntos();
};

async function intentarLogin() {
    const dni = document.getElementById("user-input").value;
    if(!dni) return alert("Ingrese su DNI");
    
    // Modo Administrador
    if(dni === "Omg20") { 
        USER_DATA = { dni: "999", nombre: "GUSTABO ORTIZ", cel: "956113989", eess: "SEDE CENTRAL" }; 
        startApp(); 
        return; 
    }

    try {
        const res = await fetch(SCRIPT_URL);
        const users = await res.json();
        const found = users.find(u => u.dni == dni);
        if(found) { 
            USER_DATA = found; 
            startApp(); 
        } else { 
            alert("DNI no registrado."); 
        }
    } catch(e) { 
        alert("Error de conexión con la base de datos."); 
    }
}

function startApp() {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("register-screen").classList.add("hidden");
    document.getElementById("app-container").classList.remove("hidden");
    document.getElementById("prof-display").innerText = USER_DATA.nombre;
    document.getElementById("eess-display").innerText = USER_DATA.eess;
}

function validarYCalcular() {
    const pIn = document.getElementById("peso");
    let peso = parseFloat(pIn.value);
    if(!peso) return;

    // Autocorrección de gramos a kilos
    if(peso > 100) { peso = peso / 1000; pIn.value = peso.toFixed(1); }

    const esc = document.getElementById("esquema").value;
    const tipo = document.getElementById("tipoHierro").value;
    const msg = document.getElementById("global-msg");

    if(peso > 0 && esc && tipo) {
        document.getElementById("result-card").classList.remove("hidden");
        let mgDia = peso * parseFloat(esc);
        let dosis = ""; let f1 = 0;

        // Alertas de seguridad NTS
        if (tipo.includes("_g") && peso >= 12) {
            msg.innerHTML = "⚠️ <b style='color:red'>AVISO:</b> Sugiero Jarabe por el peso.";
        } else if (tipo.includes("_j") && peso < 8) {
            msg.innerHTML = "⚠️ <b style='color:orange'>AVISO:</b> Sugiero Gotas por el peso.";
        } else {
            msg.innerText = "Cálculo optimizado según NTS 213-2024.";
        }

        switch(tipo) {
            case "polimaltosado_g": dosis = Math.round(mgDia / 2.5) + " gotas"; f1 = Math.ceil((mgDia * 30 / 50) / 30); break;
            case "sulfato_g": dosis = Math.round(mgDia / 1.25) + " gotas"; f1 = Math.ceil((mgDia * 30 / 25) / 30); break;
            case "sulfato_j": dosis = (mgDia / 3).toFixed(1) + " ml"; f1 = Math.ceil((mgDia * 30 / 3) / 180); break;
            case "polimaltosado_j": dosis = (mgDia / 10).toFixed(1) + " ml"; f1 = Math.ceil((mgDia * 30 / 10) / 100); break;
            case "micronutrientes": dosis = "1 SOBRE"; f1 = 1; break;
        }

        document.getElementById("resDosis").innerText = dosis;
        const etiqueta = (tipo == "micronutrientes") ? " caj" : " fr";
        document.getElementById("m1").innerText = f1 + etiqueta;
        document.getElementById("m2").innerText = (f1 * 2) + etiqueta;
        document.getElementById("m3").innerText = (f1 * 3) + etiqueta;
    }
}

async function registrarYReiniciar() {
    const btn = document.getElementById("okBtn");
    btn.innerText = "💾 GUARDANDO...";
    btn.disabled = true;

    const payload = {
        action: "registro_consulta",
        userDni: USER_DATA.dni,
        userName: USER_DATA.nombre,
        userEess: USER_DATA.eess,
        peso: document.getElementById("peso").value,
        esquema: document.getElementById("esquema").options[document.getElementById("esquema").selectedIndex].text,
        hierro: document.getElementById("tipoHierro").options[document.getElementById("tipoHierro").selectedIndex].text,
        dosis: document.getElementById("resDosis").innerText,
        total: document.getElementById("m1").innerText
    };

    try {
        await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
        
        // Actualizar contador en KeyValue
        try {
            const rCount = await fetch(KV_URL);
            let val = parseInt(await rCount.text()) || 0;
            await fetch(KV_URL + "/" + (val + 1), { method: 'POST' });
        } catch(e) {}

        alert("✅ Felicitaciones");
    } catch (e) {
        alert("⚠️ Registro enviado (Verificar conexión).");
    } finally {
        btn.innerText = "NUEVA CONSULTA";
        btn.disabled = false;
        document.getElementById("peso").value = "";
        document.getElementById("result-card").classList.add("hidden");
        updatePuntos();
    }
}

async function crearCuentaPropia() {
    const btn = document.getElementById("btnReg");
    btn.innerText = "🚀 ENVIANDO...";
    btn.disabled = true;

    const payload = {
        action: "crear",
        dni: document.getElementById("reg-dni").value,
        nombre: document.getElementById("reg-nombre").value,
        prof: document.getElementById("reg-profesion").value,
        cel: document.getElementById("reg-cel").value,
        region: document.getElementById("reg-region").value,
        provincia: document.getElementById("reg-provincia").value,
        distrito: document.getElementById("reg-distrito").value,
        eess: document.getElementById("reg-eess").value
    };

    try {
        await fetch(SCRIPT_URL, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
        alert("✅ Ya puede intentar iniciar sesión, con su N° DNI.");
        mostrarLogin();
    } catch(e) {
        alert("Error al enviar registro.");
    } finally {
        btn.innerText = "FINALIZAR REGISTRO";
        btn.disabled = false;
    }
}

async function updatePuntos() { 
    try {
        const r = await fetch(KV_URL); 
        const t = await r.text(); 
        document.getElementById("numConsultas").innerText = t || 0; 
    } catch(e) {}
}

function mostrarRegistro() { 
    document.getElementById("login-screen").classList.add("hidden"); 
    document.getElementById("register-screen").classList.remove("hidden"); 
}

function mostrarLogin() { 
    document.getElementById("register-screen").classList.add("hidden"); 
    document.getElementById("login-screen").classList.remove("hidden"); 
}
