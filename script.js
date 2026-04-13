const API_USERS = "https://script.google.com/macros/s/AKfycbyetvzKoi8PPF9P6IYZ3O3gjLESLm-KhKk0V71NyBuIrA9EZfiKSn6EKjoPNi0ugeXjuQ/exec"; 
const API_BASE_PUNTOS = "https://api.keyvalue.xyz/77e68224/puntosGustavo2026";
let SESION_ACTUAL = null;

// Imágenes de fondo dinámicas
const paisajesPeru = [
    "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1200",
    "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?q=80&w=1200"
];

window.onload = () => {
    document.getElementById("bg-peru").style.background = `url('${paisajesPeru[Math.floor(Math.random() * paisajesPeru.length)]}') center/cover`;
    obtenerPuntos();
};

async function intentarLogin() {
    const dni = document.getElementById("user-input").value.trim();
    if (!dni) return alert("Ingresa tu DNI");

    try {
        const res = await fetch(API_USERS);
        const db = await res.json();
        const user = db.find(u => u.dni == dni);
        
        if (user) {
            SESION_ACTUAL = user;
            document.getElementById("profesional-name").innerText = user.nombre;
            document.getElementById("login-screen").classList.add("hidden");
            document.getElementById("app-container").classList.remove("hidden");
        } else {
            alert("DNI no registrado en la Base de Datos.");
        }
    } catch (e) { alert("Error de conexión."); }
}

function seleccionarOpcion(id, btn) {
    btn.parentElement.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById(id).value = btn.dataset.value;
    autoCalcular();
}

function autoCalcular() {
    const peso = parseFloat(document.getElementById("peso").value);
    const meses = parseInt(document.getElementById("meses").value) || 1;
    const esquema = parseFloat(document.getElementById("esquema").value);
    const tipo = document.getElementById("tipoHierro").value;

    if (peso > 0 && esquema && tipo) {
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
                dosis = "1 SOBRE (Sachet)"; 
                frascos = 30 * meses; break;
        }

        document.getElementById("resDosis").innerText = dosis;
        document.getElementById("resFrascos").innerText = `Entregar: ${frascos} Unidades`;
        document.getElementById("result-card").classList.remove("hidden");
    }
}

async function registrarYReiniciar() {
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

    // Envío silencioso a Google Sheets
    fetch(API_USERS, { method: 'POST', mode: 'no-cors', body: JSON.stringify(datos) });
    
    // Sumar punto en KeyValue
    const actual = parseInt(document.getElementById("numConsultas").innerText);
    fetch(`${API_BASE_PUNTOS}/${actual + 1}`, { method: 'POST' });

    alert("Registro enviado a la Nube. ¡Siguiente paciente!");
    location.reload();
}

async function obtenerPuntos() {
    const res = await fetch(API_BASE_PUNTOS);
    const val = await res.text();
    document.getElementById("numConsultas").innerText = val || 0;
}
