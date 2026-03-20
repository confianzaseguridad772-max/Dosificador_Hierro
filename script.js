const IMGS_PATH = "img/"; 
// Nombre de la llave para tu contador global (puedes cambiar 'dosis_hierro_peru_2026' por lo que quieras)
const NAMESPACE = "dosis_hierro_peru_2026";
const KEY = "consultas_totales";

const paisajesPeru = [
    "https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=1600",
    "https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?q=80&w=1600",
    "https://images.unsplash.com/photo-1590050751217-23b609fc6f1c?q=80&w=1600"
];

window.onload = () => {
    obtenerPuntosGlobales();
    cambiarFondo();
};

// NUEVA FUNCIÓN: Trae los puntos desde la nube al cargar
async function obtenerPuntosGlobales() {
    try {
        const res = await fetch(`https://api.countapi.xyz/get/${NAMESPACE}/${KEY}`);
        const data = await res.json();
        document.getElementById("numConsultas").innerText = data.value || 0;
    } catch (err) {
        // Si hay error de red, muestra el local como respaldo
        let local = localStorage.getItem("puntosClinicos") || 0;
        document.getElementById("numConsultas").innerText = local;
    }
}

function cambiarFondo() {
    const bg = paisajesPeru[Math.floor(Math.random() * paisajesPeru.length)];
    document.getElementById("bg-peru").style.background = `url('${bg}')`;
}

function seleccionarOpcion(idHidden, elemento) {
    const botones = elemento.parentElement.querySelectorAll('.option-btn');
    botones.forEach(btn => btn.classList.remove('selected'));
    elemento.classList.add('selected');
    
    const valor = elemento.getAttribute('data-value');
    document.getElementById(idHidden).value = valor;

    if(idHidden === 'tipoHierro') {
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
        pesoInput.style.borderColor = "var(--neon-cyan)";
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
    document.getElementById("resFrascos").innerText = `ENTREGAR: ${frascos} Frascos.`;
    
    document.getElementById("form-wrapper").classList.add("hidden");
    document.getElementById("app-footer").classList.add("hidden");
    document.getElementById("result-card").classList.remove("hidden");
    document.getElementById("okBtn").classList.remove("hidden");
}

// NUEVA FUNCIÓN: Registra el punto en la nube antes de recargar
async function registrarYReiniciar() {
    try {
        // Incrementa el valor en la API global
        await fetch(`https://api.countapi.xyz/hit/${NAMESPACE}/${KEY}`);
    } catch (err) {
        // Respaldo local si falla el internet
        let local = parseInt(localStorage.getItem("puntosClinicos")) || 0;
        localStorage.setItem("puntosClinicos", local + 7);
    }
    location.reload(); 
}
