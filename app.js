// ==========================================================================
// Sistema de Soporte Interno - Implementación MAR-Z Core (Sprints 1, 2 y 3)
// ==========================================================================

// Restricción de Seguridad: Contraseñas NUNCA en texto plano. Se almacenan como hash SHA-256.
// La clave para todos los usuarios semilla es: "123"
// SHA-256("123") = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3"
const users = [
    { username: 'solicitante', passwordHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', role: 'solicitante', name: 'Usuario Solicitante', estado: 'Activo', codigoActor: 'ACT-SOL01' },
    { username: 'coordinador', passwordHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', role: 'coordinador', name: 'Coordinador', estado: 'Activo', codigoActor: 'ACT-COO01' },
    { username: 'agente', passwordHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', role: 'agente', name: 'Agente Soporte 1', estado: 'Activo', codigoActor: 'ACT-AGE01' },
    { username: 'agente2', passwordHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', role: 'agente', name: 'Agente Soporte 2', estado: 'Activo', codigoActor: 'ACT-AGE02' },
    { username: 'auditor', passwordHash: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3', role: 'auditor', name: 'Auditor de Sistema', estado: 'Activo', codigoActor: 'ACT-AUD01' }
];

let currentUser = null;
let solicitudes = JSON.parse(localStorage.getItem('solicitudes_v2')) || [];
let historial = JSON.parse(localStorage.getItem('historial_v2')) || [];
let notificaciones = JSON.parse(localStorage.getItem('notificaciones_v2')) || [];

// Transiciones de estado permitidas (HU07)
const TRANSICIONES_PERMITIDAS = {
    'Nuevo': [{ destino: 'en_proceso', rol: 'agente', accion: 'Iniciar atención' }],
    'pendiente': [{ destino: 'en_proceso', rol: 'agente', accion: 'Iniciar atención' }], // compatibilidad
    'en_proceso': [{ destino: 'resuelto', rol: 'agente', accion: 'Marcar como resuelto' }],
    'resuelto': [
        { destino: 'confirmado', rol: 'solicitante', accion: 'Confirmar solución' },
        { destino: 'reabierto', rol: 'solicitante', accion: 'Reabrir solicitud' }
    ],
    'reabierto': [{ destino: 'en_proceso', rol: 'agente', accion: 'Retomar atención' }]
};

// ============ INICIALIZACIÓN DE DATOS SEMILLA ============
if (solicitudes.length === 0) {
    const ahora = Date.now();
    solicitudes = [
        {
            id: 101,
            titulo: 'Problema con impresora de red',
            descripcion: 'La impresora láser del piso 3 no responde a trabajos de impresión.',
            categoria: 'Hardware',
            solicitante: 'solicitante',
            asignado: 'agente',
            prioridad: 'media',
            estado: 'Nuevo',
            comentarios: [],
            fechaCreacion: new Date(ahora - 172800000).toISOString(),
            fechaActualizacion: new Date(ahora - 170000000).toISOString(),
            justificacionAlta: null,
            fechaObjetivoAlta: null
        },
        {
            id: 102,
            titulo: 'Fallo de autenticación en correo corporativo',
            descripcion: 'Servicio de correo rechaza credenciales en clientes de escritorio.',
            categoria: 'Software',
            solicitante: 'solicitante',
            asignado: 'agente2',
            prioridad: 'alta',
            estado: 'en_proceso',
            comentarios: [
                { autor: 'agente2', texto: 'Se reinició el servicio de autenticación LDAP y se verifica sincronización.', fecha: new Date(ahora - 80000000).toISOString() }
            ],
            fechaCreacion: new Date(ahora - 86400000).toISOString(),
            fechaActualizacion: new Date(ahora - 40000000).toISOString(),
            justificacionAlta: 'Impacto general en la comunicación de operaciones críticas',
            fechaObjetivoAlta: new Date(ahora + 86400000).toISOString().split('T')[0]
        },
        {
            id: 103,
            titulo: 'Intermitencia en gateway principal',
            descripcion: 'Pérdida de paquetes en enlace de fibra óptica.',
            categoria: 'Red',
            solicitante: 'solicitante',
            asignado: 'agente',
            prioridad: 'baja',
            estado: 'resuelto',
            comentarios: [
                { autor: 'agente', texto: 'Se reemplazó cable de parcheo en switch core.', fecha: new Date(ahora - 30000000).toISOString() }
            ],
            fechaCreacion: new Date(ahora - 259200000).toISOString(),
            fechaActualizacion: new Date(ahora - 28000000).toISOString(),
            justificacionAlta: null,
            fechaObjetivoAlta: null
        }
    ];

    // Historial con campos normativos: actor codificado, campo, valor anterior y nuevo (HU11 + Cambio 2)
    historial = [
        { id: 1, solicitudId: 101, actorCodificado: 'ACT-SOL01', campo: 'Creación', valorAnterior: '-', valorNuevo: 'Nuevo', fecha: solicitudes[0].fechaCreacion },
        { id: 2, solicitudId: 101, actorCodificado: 'ACT-COO01', campo: 'Asignación', valorAnterior: 'Sin asignar', valorNuevo: 'agente', fecha: solicitudes[0].fechaCreacion },
        { id: 3, solicitudId: 102, actorCodificado: 'ACT-SOL01', campo: 'Creación', valorAnterior: '-', valorNuevo: 'Nuevo', fecha: solicitudes[1].fechaCreacion },
        { id: 4, solicitudId: 102, actorCodificado: 'ACT-COO01', campo: 'Prioridad', valorAnterior: 'media', valorNuevo: 'alta', fecha: solicitudes[1].fechaCreacion },
        { id: 5, solicitudId: 102, actorCodificado: 'ACT-COO01', campo: 'Asignación', valorAnterior: 'Sin asignar', valorNuevo: 'agente2', fecha: solicitudes[1].fechaCreacion },
        { id: 6, solicitudId: 102, actorCodificado: 'ACT-AGE02', campo: 'Estado', valorAnterior: 'Nuevo', valorNuevo: 'en_proceso', fecha: solicitudes[1].fechaActualizacion },
        { id: 7, solicitudId: 103, actorCodificado: 'ACT-SOL01', campo: 'Creación', valorAnterior: '-', valorNuevo: 'Nuevo', fecha: solicitudes[2].fechaCreacion },
        { id: 8, solicitudId: 103, actorCodificado: 'ACT-COO01', campo: 'Asignación', valorAnterior: 'Sin asignar', valorNuevo: 'agente', fecha: solicitudes[2].fechaCreacion },
        { id: 9, solicitudId: 103, actorCodificado: 'ACT-AGE01', campo: 'Estado', valorAnterior: 'en_proceso', valorNuevo: 'resuelto', fecha: solicitudes[2].fechaActualizacion }
    ];

    notificaciones = [
        { id: 1, paraUsuario: 'agente', mensaje: 'Se le asignó la solicitud #101', fecha: solicitudes[0].fechaCreacion, leida: true },
        { id: 2, paraUsuario: 'agente2', mensaje: 'Se le asignó la solicitud #102', fecha: solicitudes[1].fechaCreacion, leida: false }
    ];

    saveData();
}

// ============ AUTENTICACIÓN SEGURA (HU01 + Restricciones) ============
// Algoritmo SHA-256 estándar puro para entornos locales o navegadores sin crypto.subtle en file://
function sha256Pure(ascii) {
    function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    }
    const mathPow = Math.pow;
    const maxWord = mathPow(2, 32);
    let result = '';
    const words = [];
    const asciiBitLength = ascii.length * 8;
    const hash = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];
    const k = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    let i = 0;
    while (i < ascii.length) {
        words[i >> 2] |= (ascii.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
        i++;
    }
    words[asciiBitLength >> 5] |= 0x80 << (24 - (asciiBitLength % 32));
    words[(((asciiBitLength + 64) >> 9) << 4) + 15] = asciiBitLength;

    for (let j = 0; j < words.length; j += 16) {
        const w = [];
        for (let idx = 0; idx < 16; idx++) w[idx] = words[j + idx] | 0;
        for (let idx = 16; idx < 64; idx++) {
            const s0 = rightRotate(w[idx - 15], 7) ^ rightRotate(w[idx - 15], 18) ^ (w[idx - 15] >>> 3);
            const s1 = rightRotate(w[idx - 2], 17) ^ rightRotate(w[idx - 2], 19) ^ (w[idx - 2] >>> 10);
            w[idx] = (w[idx - 16] + s0 + w[idx - 7] + s1) | 0;
        }

        let [a, b, c, d, e, f, g, h] = hash;
        for (let idx = 0; idx < 64; idx++) {
            const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
            const ch = (e & f) ^ (~e & g);
            const temp1 = (h + s1 + ch + k[idx] + w[idx]) | 0;
            const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = (s0 + maj) | 0;

            h = g;
            g = f;
            f = e;
            e = (d + temp1) | 0;
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) | 0;
        }

        hash[0] = (hash[0] + a) | 0;
        hash[1] = (hash[1] + b) | 0;
        hash[2] = (hash[2] + c) | 0;
        hash[3] = (hash[3] + d) | 0;
        hash[4] = (hash[4] + e) | 0;
        hash[5] = (hash[5] + f) | 0;
        hash[6] = (hash[6] + g) | 0;
        hash[7] = (hash[7] + h) | 0;
    }

    for (let idx = 0; idx < 8; idx++) {
        for (let b = 3; b >= 0; b--) {
            const byte = (hash[idx] >> (b * 8)) & 0xff;
            result += byte.toString(16).padStart(2, '0');
        }
    }
    return result;
}

async function hashSHA256(str) {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
        try {
            const encoder = new TextEncoder();
            const data = encoder.encode(str);
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (err) {
            // Usa fallback si el contexto bloquea SubtleCrypto
        }
    }
    return sha256Pure(str);
}

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const inputHash = await hashSHA256(password);
    const user = users.find(u => u.username === username && u.passwordHash === inputHash);

    if (user) {
        if (user.estado !== 'Activo') {
            showError('El usuario se encuentra inactivo en el sistema.');
            return;
        }
        currentUser = user;
        showApp();
    } else {
        // Mensaje uniforme que no revela si el usuario existe o la clave es incorrecta
        showError('Usuario o contraseña incorrectos');
    }
});

function showError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3500);
}

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('currentUser').innerHTML = 
        `<strong>${currentUser.name}</strong> <span class="actor-code">${currentUser.codigoActor}</span> (${currentUser.role})`;

    // Desactivar todos los dashboards
    document.querySelectorAll('.dashboard').forEach(d => d.classList.remove('active'));

    // Activar dashboard correspondiente asegurando aislamiento de roles
    if (currentUser.role === 'solicitante') {
        document.getElementById('solicitanteDashboard').classList.add('active');
        renderSolicitanteTable();
    } else if (currentUser.role === 'coordinador') {
        document.getElementById('coordinadorDashboard').classList.add('active');
        cargarFiltroAgentes();
        renderCoordinadorTable();
        renderIndicadores();
    } else if (currentUser.role === 'agente') {
        document.getElementById('agenteDashboard').classList.add('active');
        renderAgenteTable();
    } else if (currentUser.role === 'auditor') {
        document.getElementById('auditorDashboard').classList.add('active');
        cargarFiltroCamposAuditor();
        renderAuditorTable();
    }

    renderNotificaciones();
}

function logout() {
    currentUser = null;
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.querySelectorAll('.dashboard').forEach(d => d.classList.remove('active'));
    document.getElementById('dropdownNotificaciones').style.display = 'none';
}

function getActorCode(username) {
    const u = users.find(x => x.username === username);
    return u ? u.codigoActor : `ACT-${username.substring(0, 3).toUpperCase()}`;
}

// ============ NOTIFICACIONES EN LA APLICACIÓN (HU05) ============
function crearNotificacion(paraUsuario, mensaje) {
    notificaciones.unshift({
        id: Date.now() + Math.random(),
        paraUsuario: paraUsuario,
        mensaje: mensaje,
        fecha: new Date().toISOString(),
        leida: false
    });
    saveData();
    renderNotificaciones();
}

function renderNotificaciones() {
    if (!currentUser) return;
    const misNotifs = notificaciones.filter(n => n.paraUsuario === currentUser.username);
    const badge = document.getElementById('badgeNotificaciones');
    const noLeidas = misNotifs.filter(n => !n.leida).length;

    if (noLeidas > 0) {
        badge.textContent = noLeidas;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }

    const lista = document.getElementById('listaNotificaciones');
    if (misNotifs.length === 0) {
        lista.innerHTML = '<div style="padding: 15px; color: #888; text-align: center; font-size: 12px;">Sin notificaciones</div>';
        return;
    }

    let html = '';
    misNotifs.slice(0, 10).forEach(n => {
        html += `
            <div class="notify-item ${n.leida ? '' : 'unread'}">
                <div>${n.mensaje}</div>
                <span class="notify-time">${formatDate(n.fecha)}</span>
            </div>
        `;
    });
    lista.innerHTML = html;
}

function toggleNotificaciones() {
    const dropdown = document.getElementById('dropdownNotificaciones');
    const isVisible = dropdown.style.display === 'block';
    dropdown.style.display = isVisible ? 'none' : 'block';
}

function marcarTodasLeidas() {
    if (!currentUser) return;
    notificaciones.forEach(n => {
        if (n.paraUsuario === currentUser.username) n.leida = true;
    });
    saveData();
    renderNotificaciones();
}

// ============ HU02 + CAMBIO CONTROLADO 1: CREAR SOLICITUD ============
function toggleCamposPrioridadAltaCreacion() {
    const prioridad = document.getElementById('prioridadInicial').value;
    const container = document.getElementById('camposPrioridadAltaCreacion');
    if (prioridad === 'alta') {
        container.style.display = 'block';
        document.getElementById('justificacionAlta').required = true;
        document.getElementById('fechaObjetivoAlta').required = true;
    } else {
        container.style.display = 'none';
        document.getElementById('justificacionAlta').required = false;
        document.getElementById('fechaObjetivoAlta').required = false;
    }
}

document.getElementById('createForm').addEventListener('submit', function(e) {
    e.preventDefault();
    if (!currentUser || currentUser.role !== 'solicitante') {
        alert('Acceso restringido: Solo solicitantes pueden crear solicitudes.');
        return;
    }

    const titulo = document.getElementById('titulo').value.trim();
    const descripcion = document.getElementById('descripcion').value.trim();
    const categoria = document.getElementById('categoria').value;
    const prioridad = document.getElementById('prioridadInicial').value;

    let justificacion = null;
    let fechaObjetivo = null;

    if (prioridad === 'alta') {
        justificacion = document.getElementById('justificacionAlta').value.trim();
        fechaObjetivo = document.getElementById('fechaObjetivoAlta').value;
        if (!justificacion || !fechaObjetivo) {
            alert('Las solicitudes de prioridad Alta requieren obligatoriamente Justificación y Fecha Objetivo.');
            return;
        }
    }

    const nuevaSolicitud = {
        id: Math.floor(100 + Math.random() * 900),
        titulo: titulo,
        descripcion: descripcion,
        categoria: categoria,
        solicitante: currentUser.username,
        asignado: null,
        prioridad: prioridad,
        estado: 'Nuevo', // Estado normativo HU02
        comentarios: [],
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString(),
        justificacionAlta: justificacion,
        fechaObjetivoAlta: fechaObjetivo
    };

    solicitudes.push(nuevaSolicitud);

    // Registro estructurado en auditoría (HU11)
    addHistorial(nuevaSolicitud.id, 'Creación', '-', 'Estado Nuevo');
    if (prioridad === 'alta') {
        addHistorial(nuevaSolicitud.id, 'Prioridad', '-', `Alta (Obj: ${fechaObjetivo})`);
    }

    // Notificar al coordinador sobre la nueva solicitud
    crearNotificacion('coordinador', `Nueva solicitud creada #${nuevaSolicitud.id} por ${currentUser.name}`);

    saveData();
    document.getElementById('createForm').reset();
    document.getElementById('camposPrioridadAltaCreacion').style.display = 'none';

    const successDiv = document.getElementById('createSuccess');
    successDiv.textContent = `Solicitud #${nuevaSolicitud.id} creada exitosamente con estado 'Nuevo'.`;
    successDiv.style.display = 'block';
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3500);

    renderSolicitanteTable();
});

// ============ HU03 + HU09: MIS SOLICITUDES (SOLICITANTE) ============
function getSolicitudesFiltradas() {
    let filtradas = solicitudes.filter(s => s.solicitante === currentUser.username);

    const busqueda = (document.getElementById('searchInput')?.value || '').toLowerCase().trim();
    const estado = document.getElementById('filterEstado')?.value || '';
    const prioridad = document.getElementById('filterPrioridad')?.value || '';
    const categoria = document.getElementById('filterCategoria')?.value || '';

    if (busqueda) {
        filtradas = filtradas.filter(s =>
            s.titulo.toLowerCase().includes(busqueda) ||
            s.descripcion.toLowerCase().includes(busqueda)
        );
    }
    if (estado) filtradas = filtradas.filter(s => s.estado.toLowerCase() === estado.toLowerCase());
    if (prioridad) filtradas = filtradas.filter(s => s.prioridad === prioridad);
    if (categoria) filtradas = filtradas.filter(s => s.categoria === categoria);

    return filtradas.sort((a, b) => new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion));
}

function filtrarSolicitudes() {
    renderSolicitanteTable();
}

function renderSolicitanteTable() {
    const misSolicitudes = getSolicitudesFiltradas();
    const container = document.getElementById('solicitanteTable');

    if (misSolicitudes.length === 0) {
        container.innerHTML = '<div class="empty-state">No tiene solicitudes que coincidan con los filtros aplicados.</div>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Categoría</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Asignado a</th>
                    <th>Última Actualización</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    misSolicitudes.forEach(s => {
        html += `
            <tr>
                <td><strong>#${s.id}</strong></td>
                <td>${escapeHTML(s.titulo)}</td>
                <td>${s.categoria}</td>
                <td><span class="badge badge-${s.prioridad}">${s.prioridad}</span></td>
                <td><span class="badge badge-${s.estado}">${formatEstado(s.estado)}</span></td>
                <td>${s.asignado ? getActorCode(s.asignado) : '<span class="badge badge-sin_asignar">Sin asignar</span>'}</td>
                <td>${formatDate(s.fechaActualizacion)}</td>
                <td><button class="btn btn-small" onclick="verDetalle(${s.id})">Ver Detalle</button></td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// ============ HU04 + HU05 + HU09: COORDINADOR DASHBOARD ============
function getSolicitudesCoordFiltradas() {
    let filtradas = [...solicitudes];

    const busqueda = (document.getElementById('coordSearchInput')?.value || '').toLowerCase().trim();
    const estado = document.getElementById('coordFilterEstado')?.value || '';
    const prioridad = document.getElementById('coordFilterPrioridad')?.value || '';
    const categoria = document.getElementById('coordFilterCategoria')?.value || '';
    const agente = document.getElementById('coordFilterAgente')?.value || '';
    const criterioOrden = document.getElementById('coordOrdenamiento')?.value || 'prioridad';

    if (busqueda) {
        filtradas = filtradas.filter(s =>
            s.titulo.toLowerCase().includes(busqueda) ||
            s.descripcion.toLowerCase().includes(busqueda) ||
            s.solicitante.toLowerCase().includes(busqueda) ||
            s.id.toString().includes(busqueda)
        );
    }
    if (estado) filtradas = filtradas.filter(s => s.estado.toLowerCase() === estado.toLowerCase());
    if (prioridad) filtradas = filtradas.filter(s => s.prioridad === prioridad);
    if (categoria) filtradas = filtradas.filter(s => s.categoria === categoria);
    if (agente) filtradas = filtradas.filter(s => s.asignado === agente);

    // Ordenamiento configurable (HU04: ordenable por prioridad, estado, fecha)
    const ordenPrioridad = { alta: 1, media: 2, baja: 3 };
    if (criterioOrden === 'prioridad') {
        filtradas.sort((a, b) => (ordenPrioridad[a.prioridad] || 9) - (ordenPrioridad[b.prioridad] || 9));
    } else if (criterioOrden === 'estado') {
        filtradas.sort((a, b) => a.estado.localeCompare(b.estado));
    } else if (criterioOrden === 'fechaReciente') {
        filtradas.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
    } else if (criterioOrden === 'fechaAntigua') {
        filtradas.sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion));
    } else if (criterioOrden === 'actualizacion') {
        filtradas.sort((a, b) => new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion));
    }

    return filtradas;
}

function filtrarCoordinador() {
    renderCoordinadorTable();
}

function cargarFiltroAgentes() {
    const select = document.getElementById('coordFilterAgente');
    if (!select) return;
    const agentes = users.filter(u => u.role === 'agente' && u.estado === 'Activo');

    let html = '<option value="">Todos los agentes activos</option>';
    agentes.forEach(a => {
        html += `<option value="${a.username}">${a.name} (${a.codigoActor})</option>`;
    });
    select.innerHTML = html;
}

function renderCoordinadorTable() {
    const container = document.getElementById('coordinadorTable');
    const filtradas = getSolicitudesCoordFiltradas();
    const agentesActivos = users.filter(u => u.role === 'agente' && u.estado === 'Activo');

    if (filtradas.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay solicitudes que coincidan con los criterios seleccionados.</div>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Solicitante</th>
                    <th>Categoría</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Asignar Agente Activo</th>
                    <th>Última Act.</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    filtradas.forEach(s => {
        let agenteOptions = '<option value="">-- Sin asignar --</option>';
        agentesActivos.forEach(a => {
            const selected = s.asignado === a.username ? 'selected' : '';
            agenteOptions += `<option value="${a.username}" ${selected}>${a.name}</option>`;
        });

        html += `
            <tr>
                <td><strong>#${s.id}</strong></td>
                <td>${escapeHTML(s.titulo)}</td>
                <td>${getActorCode(s.solicitante)}</td>
                <td>${s.categoria}</td>
                <td><span class="badge badge-${s.prioridad}">${s.prioridad}</span></td>
                <td><span class="badge badge-${s.estado}">${formatEstado(s.estado)}</span></td>
                <td>
                    <select class="inline-select" onchange="asignarSolicitud(${s.id}, this.value)">
                        ${agenteOptions}
                    </select>
                </td>
                <td>${formatDate(s.fechaActualizacion)}</td>
                <td>
                    <div class="priority-controls">
                        <button class="btn btn-small btn-up" onclick="solicitarCambioPrioridad(${s.id}, 'up')" title="Elevar prioridad">▲</button>
                        <button class="btn btn-small btn-down" onclick="solicitarCambioPrioridad(${s.id}, 'down')" title="Disminuir prioridad">▼</button>
                        <button class="btn btn-small" onclick="verDetalle(${s.id})">Ver</button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// HU05: Asignar solicitud con agente activo y notificación
function asignarSolicitud(id, agenteUsername) {
    if (!currentUser || currentUser.role !== 'coordinador') {
        alert('Acceso restringido: Solo el coordinador puede asignar solicitudes.');
        return;
    }

    const solicitud = solicitudes.find(s => s.id === id);
    if (!solicitud) return;

    // Validación de agente activo
    if (agenteUsername) {
        const agente = users.find(u => u.username === agenteUsername && u.role === 'agente');
        if (!agente || agente.estado !== 'Activo') {
            alert('Error: La solicitud solo puede asignarse a un agente con estado Activo en el sistema.');
            renderCoordinadorTable();
            return;
        }
    }

    const anterior = solicitud.asignado;
    solicitud.asignado = agenteUsername || null;
    solicitud.fechaActualizacion = new Date().toISOString();

    const anteriorTexto = anterior ? getActorCode(anterior) : 'Sin asignar';
    const nuevoTexto = agenteUsername ? getActorCode(agenteUsername) : 'Sin asignar';

    addHistorial(id, 'Asignación', anteriorTexto, nuevoTexto);

    if (agenteUsername) {
        crearNotificacion(agenteUsername, `Se le ha asignado la solicitud #${id}: ${solicitud.titulo}`);
    }

    saveData();
    renderCoordinadorTable();
    renderIndicadores();
}

// HU04 + CAMBIO CONTROLADO 1: Priorización con justificación para Alta
function solicitarCambioPrioridad(id, direction) {
    if (!currentUser || currentUser.role !== 'coordinador') {
        alert('Acceso restringido: Solo el coordinador puede modificar prioridades.');
        return;
    }

    const solicitud = solicitudes.find(s => s.id === id);
    if (!solicitud) return;

    const prioridades = ['alta', 'media', 'baja'];
    const idx = prioridades.indexOf(solicitud.prioridad);

    let nuevaPrioridad = solicitud.prioridad;
    if (direction === 'up' && idx > 0) {
        nuevaPrioridad = prioridades[idx - 1];
    } else if (direction === 'down' && idx < prioridades.length - 1) {
        nuevaPrioridad = prioridades[idx + 1];
    }

    if (nuevaPrioridad === solicitud.prioridad) return;

    if (nuevaPrioridad === 'alta') {
        // Exigir justificación y fecha objetivo según Cambio Controlado 1
        abrirModalPrioridadAlta(id);
    } else {
        const anterior = solicitud.prioridad;
        solicitud.prioridad = nuevaPrioridad;
        solicitud.fechaActualizacion = new Date().toISOString();
        addHistorial(id, 'Prioridad', anterior, nuevaPrioridad);
        saveData();
        renderCoordinadorTable();
        renderIndicadores();
    }
}

function abrirModalPrioridadAlta(id) {
    document.getElementById('altaSolicitudId').value = id;
    document.getElementById('altaJustificacion').value = '';
    document.getElementById('altaFechaObjetivo').value = '';
    document.getElementById('modalPrioridadAlta').classList.add('active');
}

function cerrarModalPrioridadAlta() {
    document.getElementById('modalPrioridadAlta').classList.remove('active');
}

function confirmarPrioridadAlta(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('altaSolicitudId').value);
    const justificacion = document.getElementById('altaJustificacion').value.trim();
    const fechaObj = document.getElementById('altaFechaObjetivo').value;

    const solicitud = solicitudes.find(s => s.id === id);
    if (!solicitud) return;

    const anterior = solicitud.prioridad;
    solicitud.prioridad = 'alta';
    solicitud.justificacionAlta = justificacion;
    solicitud.fechaObjetivoAlta = fechaObj;
    solicitud.fechaActualizacion = new Date().toISOString();

    addHistorial(id, 'Prioridad', anterior, `alta (Obj: ${fechaObj})`);
    saveData();
    cerrarModalPrioridadAlta();
    renderCoordinadorTable();
    renderIndicadores();
}

// ============ HU06 + HU07 + HU09: AGENTE DASHBOARD ============
function getSolicitudesAgenteFiltradas() {
    let filtradas = solicitudes.filter(s => s.asignado === currentUser.username);

    const busqueda = (document.getElementById('agenteSearchInput')?.value || '').toLowerCase().trim();
    const estado = document.getElementById('agenteFilterEstado')?.value || '';
    const prioridad = document.getElementById('agenteFilterPrioridad')?.value || '';
    const categoria = document.getElementById('agenteFilterCategoria')?.value || '';

    if (busqueda) {
        filtradas = filtradas.filter(s =>
            s.titulo.toLowerCase().includes(busqueda) ||
            s.descripcion.toLowerCase().includes(busqueda) ||
            s.id.toString().includes(busqueda)
        );
    }
    if (estado) filtradas = filtradas.filter(s => s.estado.toLowerCase() === estado.toLowerCase());
    if (prioridad) filtradas = filtradas.filter(s => s.prioridad === prioridad);
    if (categoria) filtradas = filtradas.filter(s => s.categoria === categoria);

    return filtradas.sort((a, b) => new Date(b.fechaActualizacion) - new Date(a.fechaActualizacion));
}

function filtrarAgente() {
    renderAgenteTable();
}

function renderAgenteTable() {
    const misSolicitudes = getSolicitudesAgenteFiltradas();
    const container = document.getElementById('agenteTable');

    if (misSolicitudes.length === 0) {
        container.innerHTML = '<div class="empty-state">No tiene solicitudes asignadas con los filtros actuales.</div>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Solicitante</th>
                    <th>Prioridad</th>
                    <th>Estado</th>
                    <th>Última Act.</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    misSolicitudes.forEach(s => {
        html += `
            <tr>
                <td><strong>#${s.id}</strong></td>
                <td>${escapeHTML(s.titulo)}</td>
                <td>${getActorCode(s.solicitante)}</td>
                <td><span class="badge badge-${s.prioridad}">${s.prioridad}</span></td>
                <td><span class="badge badge-${s.estado}">${formatEstado(s.estado)}</span></td>
                <td>${formatDate(s.fechaActualizacion)}</td>
                <td><button class="btn btn-small" onclick="verDetalle(${s.id})">Gestionar</button></td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// ============ HU10: INDICADORES AGREGADOS Y TIEMPO MEDIANO ============
function renderIndicadores() {
    const container = document.getElementById('indicadoresContent');
    if (!container) return;

    const fEstado = document.getElementById('indFilterEstado')?.value || '';
    const fPrioridad = document.getElementById('indFilterPrioridad')?.value || '';
    const fCategoria = document.getElementById('indFilterCategoria')?.value || '';

    let base = [...solicitudes];
    if (fEstado) base = base.filter(s => s.estado.toLowerCase() === fEstado.toLowerCase());
    if (fPrioridad) base = base.filter(s => s.prioridad === fPrioridad);
    if (fCategoria) base = base.filter(s => s.categoria === fCategoria);

    const total = base.length;
    const nuevos = base.filter(s => s.estado.toLowerCase() === 'nuevo' || s.estado === 'pendiente').length;
    const enProceso = base.filter(s => s.estado === 'en_proceso').length;
    const resueltas = base.filter(s => s.estado === 'resuelto' || s.estado === 'confirmado').length;
    const reabiertas = base.filter(s => s.estado === 'reabierto').length;
    const tasaResolucion = total > 0 ? Math.round((resueltas / total) * 100) : 0;

    // Cálculo riguroso de TIEMPO MEDIANO DE CICLO (HU10)
    const cerradas = base.filter(s => s.estado === 'resuelto' || s.estado === 'confirmado');
    let tiempoMedianoTexto = 'Sin datos';

    if (cerradas.length > 0) {
        const tiemposHoras = cerradas.map(s => {
            const horas = (new Date(s.fechaActualizacion) - new Date(s.fechaCreacion)) / (1000 * 60 * 60);
            return Math.max(0.1, horas);
        }).sort((a, b) => a - b);

        const mid = Math.floor(tiemposHoras.length / 2);
        let mediana = tiemposHoras.length % 2 !== 0
            ? tiemposHoras[mid]
            : (tiemposHoras[mid - 1] + tiemposHoras[mid]) / 2;

        tiempoMedianoTexto = `${mediana.toFixed(1)} hrs`;
    }

    // Distribución por categoría
    const categorias = {};
    base.forEach(s => {
        categorias[s.categoria] = (categorias[s.categoria] || 0) + 1;
    });

    let html = `
        <div class="indicadores-grid">
            <div class="indicador-card highlight">
                <h4>Total Solicitudes</h4>
                <div class="valor">${total}</div>
                <div class="detalle">Muestra actual</div>
            </div>
            <div class="indicador-card">
                <h4>Nuevas / Pendientes</h4>
                <div class="valor">${nuevos}</div>
                <div class="detalle">${total > 0 ? Math.round((nuevos / total) * 100) : 0}% del volumen</div>
            </div>
            <div class="indicador-card">
                <h4>En Proceso</h4>
                <div class="valor">${enProceso}</div>
                <div class="detalle">En atención activa</div>
            </div>
            <div class="indicador-card">
                <h4>Resueltas / Confirmadas</h4>
                <div class="valor">${resueltas}</div>
                <div class="detalle">${tasaResolucion}% tasa de resolución</div>
            </div>
            <div class="indicador-card">
                <h4>Reabiertas</h4>
                <div class="valor">${reabiertas}</div>
                <div class="detalle">Cierres no conformes</div>
            </div>
            <div class="indicador-card highlight">
                <h4>Tiempo Mediano de Ciclo</h4>
                <div class="valor" style="font-size: 24px; color: #27ae60;">${tiempoMedianoTexto}</div>
                <div class="detalle">Mediana estadística de atención</div>
            </div>
        </div>

        <div class="tabla-indicadores">
            <h3 style="margin-bottom: 10px;">Distribución por Categoría</h3>
            <table>
                <thead>
                    <tr>
                        <th>Categoría</th>
                        <th>Cantidad</th>
                        <th>Porcentaje</th>
                    </tr>
                </thead>
                <tbody>
    `;

    Object.entries(categorias).sort((a, b) => b[1] - a[1]).forEach(([cat, cant]) => {
        const porc = total > 0 ? ((cant / total) * 100).toFixed(1) : '0';
        html += `
            <tr>
                <td><strong>${cat}</strong></td>
                <td>${cant}</td>
                <td>${porc}%</td>
            </tr>
        `;
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

function resetFiltrosIndicadores() {
    if (document.getElementById('indFilterEstado')) document.getElementById('indFilterEstado').value = '';
    if (document.getElementById('indFilterPrioridad')) document.getElementById('indFilterPrioridad').value = '';
    if (document.getElementById('indFilterCategoria')) document.getElementById('indFilterCategoria').value = '';
    renderIndicadores();
}

// ============ HU11 + CAMBIO CONTROLADO 2: AUDITORÍA DEL SISTEMA ============
function getHistorialFiltrado() {
    let filtrado = [...historial];

    const busqueda = (document.getElementById('auditorSearchInput')?.value || '').toLowerCase().trim();
    const campo = document.getElementById('auditorFilterCampo')?.value || '';

    if (busqueda) {
        filtrado = filtrado.filter(h =>
            h.solicitudId?.toString().includes(busqueda) ||
            h.actorCodificado.toLowerCase().includes(busqueda) ||
            (h.valorNuevo && h.valorNuevo.toLowerCase().includes(busqueda))
        );
    }
    if (campo) {
        filtrado = filtrado.filter(h => h.campo === campo);
    }

    return filtrado.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

function filtrarAuditor() {
    renderAuditorTable();
}

function cargarFiltroCamposAuditor() {
    const select = document.getElementById('auditorFilterCampo');
    if (!select) return;
    const camposUnicos = [...new Set(historial.map(h => h.campo))];

    let html = '<option value="">Todos los campos</option>';
    camposUnicos.forEach(c => {
        html += `<option value="${c}">${c}</option>`;
    });
    select.innerHTML = html;
}

function renderAuditorTable() {
    const container = document.getElementById('auditorTable');
    const filtrado = getHistorialFiltrado();

    if (filtrado.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay registros de auditoría que coincidan con la búsqueda.</div>';
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Solicitud</th>
                    <th>Actor Codificado</th>
                    <th>Campo Modificado</th>
                    <th>Valor Anterior</th>
                    <th>Valor Nuevo</th>
                </tr>
            </thead>
            <tbody>
    `;

    filtrado.forEach(h => {
        html += `
            <tr>
                <td>${formatDate(h.fecha)}</td>
                <td><strong>${h.solicitudId ? '#' + h.solicitudId : 'Sistema'}</strong></td>
                <td><span class="actor-code">${h.actorCodificado}</span></td>
                <td><strong>${h.campo}</strong></td>
                <td><span style="color: #888;">${escapeHTML(h.valorAnterior || '-')}</span></td>
                <td><span style="color: #2c3e50; font-weight: 500;">${escapeHTML(h.valorNuevo || '-')}</span></td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// ============ HU12 + CAMBIO CONTROLADO 2: EXPORTAR REPORTE CSV ============
function exportarReporte() {
    if (!currentUser || currentUser.role !== 'coordinador') {
        alert('Acceso restringido: Solo el coordinador puede exportar reportes.');
        return;
    }

    // Exporta aplicando los filtros actuales (HU12)
    const datosFiltrados = getSolicitudesCoordFiltradas();

    if (datosFiltrados.length === 0) {
        alert('No hay solicitudes coincidentes con los filtros para exportar.');
        return;
    }

    // Cambio Controlado 2: Excluir texto libre (descripciones libres/comentarios) y credenciales
    let csv = 'ID_Solicitud,Categoria,Prioridad,Estado,Actor_Solicitante,Actor_Asignado,Fecha_Creacion,Fecha_Ultima_Actualizacion,Fecha_Objetivo_Alta\n';

    datosFiltrados.forEach(s => {
        const fila = [
            s.id,
            `"${s.categoria}"`,
            s.prioridad,
            s.estado,
            getActorCode(s.solicitante),
            s.asignado ? getActorCode(s.asignado) : 'Sin_Asignar',
            formatDate(s.fechaCreacion),
            formatDate(s.fechaActualizacion),
            s.fechaObjetivoAlta || 'N/A'
        ];
        csv += fila.join(',') + '\n';
    });

    // Registrar evento de exportación en la auditoría del sistema (HU12)
    addHistorial(null, 'Exportación', '-', `Reporte CSV (${datosFiltrados.length} registros)`, currentUser.codigoActor);

    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `GEX-CA-02-MAR-Z_Reporte_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const successSpan = document.getElementById('exportSuccess');
    if (successSpan) {
        successSpan.style.display = 'inline';
        setTimeout(() => { successSpan.style.display = 'none'; }, 4000);
    }
}

// ============ DETALLE DE SOLICITUD Y GESTIÓN DE ACCIONES ============
function verDetalle(id) {
    const solicitud = solicitudes.find(s => s.id === id);
    if (!solicitud) return;

    const modal = document.getElementById('detailModal');
    const content = document.getElementById('modalContent');
    const title = document.getElementById('modalTitle');
    title.textContent = `Solicitud #${solicitud.id} - ${solicitud.titulo}`;

    let html = `
        <div class="detail-row">
            <span class="detail-label">Título:</span> ${escapeHTML(solicitud.titulo)}
        </div>
        <div class="detail-row">
            <span class="detail-label">Descripción:</span><br>
            <div style="margin-top: 5px; padding: 10px; background: #fafafa; border: 1px solid #eee; border-radius: 4px;">
                ${escapeHTML(solicitud.descripcion)}
            </div>
        </div>
        <div class="detail-row">
            <span class="detail-label">Categoría:</span> ${solicitud.categoria}
        </div>
        <div class="detail-row">
            <span class="detail-label">Solicitante:</span> ${getActorCode(solicitud.solicitante)}
        </div>
        <div class="detail-row">
            <span class="detail-label">Asignado a:</span> ${solicitud.asignado ? `${getActorCode(solicitud.asignado)}` : '<span class="badge badge-sin_asignar">Sin asignar</span>'}
        </div>
        <div class="detail-row">
            <span class="detail-label">Prioridad:</span> <span class="badge badge-${solicitud.prioridad}">${solicitud.prioridad}</span>
        </div>
        ${solicitud.prioridad === 'alta' && solicitud.justificacionAlta ? `
            <div class="detail-row" style="background: #fff8e1; padding: 8px;">
                <span class="detail-label" style="color: #b71c1c;">Justificación Alta:</span> ${escapeHTML(solicitud.justificacionAlta)}<br>
                <span class="detail-label" style="color: #b71c1c; margin-top: 4px;">Fecha Objetivo:</span> ${solicitud.fechaObjetivoAlta || 'No definida'}
            </div>
        ` : ''}
        <div class="detail-row">
            <span class="detail-label">Estado actual:</span> <span class="badge badge-${solicitud.estado}">${formatEstado(solicitud.estado)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Fecha de creación:</span> ${formatDate(solicitud.fechaCreacion)}
        </div>
        <div class="detail-row">
            <span class="detail-label">Última actualización:</span> ${formatDate(solicitud.fechaActualizacion)}
        </div>
    `;

    // HU06: Comentarios de trabajo (inmutables y visibles)
    html += `
        <div class="comments-section">
            <h4>Comentarios de trabajo registrados (HU06)</h4>
    `;

    if (solicitud.comentarios && solicitud.comentarios.length > 0) {
        solicitud.comentarios.forEach(c => {
            html += `
                <div class="comment-item">
                    <div class="comment-meta">${getActorCode(c.autor)} - ${formatDate(c.fecha)}</div>
                    <div class="comment-text">${escapeHTML(c.texto)}</div>
                </div>
            `;
        });
    } else {
        html += '<div class="empty-state" style="padding: 12px;">Sin avances documentados aún.</div>';
    }

    // Formulario de comentario solo para el agente asignado
    if (currentUser.role === 'agente' && solicitud.asignado === currentUser.username) {
        html += `
            <div class="comment-form">
                <textarea id="nuevoComentario" rows="3" placeholder="Registrar avance técnico inmutable..."></textarea>
                <button class="btn btn-small btn-success" onclick="agregarComentario(${solicitud.id})">Guardar comentario</button>
            </div>
        `;
    }
    html += '</div>';

    // Controles de transición de estado (HU07 y HU08)
    html += renderControlesEstado(solicitud);

    content.innerHTML = html;
    modal.classList.add('active');
}

function renderControlesEstado(solicitud) {
    let html = '<div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">';

    if (currentUser.role === 'agente' && solicitud.asignado === currentUser.username) {
        html += '<h4 style="margin-bottom: 10px; font-size: 14px;">Flujo de atención (Agente):</h4><div class="action-controls">';

        if (solicitud.estado.toLowerCase() === 'nuevo' || solicitud.estado === 'pendiente' || solicitud.estado === 'reabierto') {
            html += `<button class="btn btn-small btn-warning" onclick="cambiarEstado(${solicitud.id}, 'en_proceso')">Iniciar atención</button>`;
        }
        if (solicitud.estado === 'en_proceso') {
            html += `<button class="btn btn-small btn-success" onclick="cambiarEstado(${solicitud.id}, 'resuelto')">Marcar como resuelto</button>`;
        }
        html += '</div>';
    }

    if (currentUser.role === 'solicitante' && solicitud.solicitante === currentUser.username) {
        if (solicitud.estado === 'resuelto') {
            html += `
                <h4 style="margin-bottom: 10px; font-size: 14px;">Validación de cierre (Solicitante):</h4>
                <p class="help-text">¿La solución brindada resolvió completamente la solicitud?</p>
                <div class="action-controls">
                    <button class="btn btn-small btn-success" onclick="cambiarEstado(${solicitud.id}, 'confirmado')">✓ Confirmar solución</button>
                    <button class="btn btn-small btn-danger" onclick="abrirModalReapertura(${solicitud.id})">↺ Reabrir con motivo</button>
                </div>
            `;
        }
    }

    html += '</div>';
    return html;
}

// HU06: Agregar comentario inmutable
function agregarComentario(id) {
    const texto = (document.getElementById('nuevoComentario')?.value || '').trim();
    if (!texto) {
        alert('El comentario no puede estar vacío.');
        return;
    }

    const solicitud = solicitudes.find(s => s.id === id);
    if (!solicitud) return;

    if (!solicitud.comentarios) solicitud.comentarios = [];
    solicitud.comentarios.push({
        autor: currentUser.username,
        texto: texto,
        fecha: new Date().toISOString()
    });
    solicitud.fechaActualizacion = new Date().toISOString();

    addHistorial(id, 'Comentario', '-', 'Avance documentado');

    // Notificar al solicitante
    crearNotificacion(solicitud.solicitante, `Nuevo comentario en la solicitud #${id} por ${currentUser.name}`);

    saveData();
    verDetalle(id);
}

// HU07: Cambio de estado con validación estricta de transiciones
function cambiarEstado(id, nuevoEstado, motivo = null) {
    const solicitud = solicitudes.find(s => s.id === id);
    if (!solicitud) return;

    const estadoActual = solicitud.estado;
    const transiciones = TRANSICIONES_PERMITIDAS[estadoActual] || [];
    const esPermitida = transiciones.some(t => t.destino === nuevoEstado && t.rol === currentUser.role);

    if (!esPermitida) {
        alert(`Transición no autorizada: No es permitido cambiar de '${estadoActual}' a '${nuevoEstado}' con su rol.`);
        return;
    }

    solicitud.estado = nuevoEstado;
    solicitud.fechaActualizacion = new Date().toISOString();

    const valorNuevoHistorial = motivo ? `${formatEstado(nuevoEstado)} (Motivo: ${motivo})` : formatEstado(nuevoEstado);
    addHistorial(id, 'Estado', formatEstado(estadoActual), valorNuevoHistorial);

    if (nuevoEstado === 'resuelto') {
        crearNotificacion(solicitud.solicitante, `Su solicitud #${id} ha sido marcada como Resuelta. Por favor verifique el cierre.`);
    } else if (nuevoEstado === 'reabierto' && solicitud.asignado) {
        crearNotificacion(solicitud.asignado, `La solicitud #${id} ha sido reabierta por el solicitante.`);
    }

    saveData();
    closeModal();
    refreshCurrentView();
}

// HU08: Modal de reapertura con motivo obligatorio
function abrirModalReapertura(id) {
    document.getElementById('reabrirSolicitudId').value = id;
    document.getElementById('motivoReapertura').value = '';
    document.getElementById('modalReapertura').classList.add('active');
}

function cerrarModalReapertura() {
    document.getElementById('modalReapertura').classList.remove('active');
}

function confirmarReapertura(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('reabrirSolicitudId').value);
    const motivo = document.getElementById('motivoReapertura').value.trim();

    if (!motivo) {
        alert('Es obligatorio indicar el motivo de reapertura.');
        return;
    }

    const solicitud = solicitudes.find(s => s.id === id);
    if (!solicitud) return;

    if (!solicitud.comentarios) solicitud.comentarios = [];
    solicitud.comentarios.push({
        autor: currentUser.username,
        texto: `[REAPERTURA]: ${motivo}`,
        fecha: new Date().toISOString()
    });

    cerrarModalReapertura();
    cambiarEstado(id, 'reabierto', motivo);
}

function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
}

function refreshCurrentView() {
    if (!currentUser) return;
    if (currentUser.role === 'solicitante') renderSolicitanteTable();
    else if (currentUser.role === 'coordinador') {
        renderCoordinadorTable();
        renderIndicadores();
    } else if (currentUser.role === 'agente') renderAgenteTable();
    else if (currentUser.role === 'auditor') renderAuditorTable();
}

// ============ UTILIDADES Y PERSISTENCIA ============
function formatEstado(estado) {
    const map = {
        'nuevo': 'Nuevo',
        'Nuevo': 'Nuevo',
        'pendiente': 'Nuevo',
        'en_proceso': 'En proceso',
        'resuelto': 'Resuelto',
        'confirmado': 'Confirmado',
        'reabierto': 'Reabierto'
    };
    return map[estado] || estado;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
    }[tag] || tag));
}

function addHistorial(solicitudId, campo, valorAnterior, valorNuevo, actorCod = null) {
    const actor = actorCod || (currentUser ? currentUser.codigoActor : 'SISTEMA');
    historial.unshift({
        id: historial.length + 1,
        solicitudId: solicitudId,
        actorCodificado: actor,
        campo: campo,
        valorAnterior: valorAnterior || '-',
        valorNuevo: valorNuevo || '-',
        fecha: new Date().toISOString()
    });
}

function saveData() {
    localStorage.setItem('solicitudes_v2', JSON.stringify(solicitudes));
    localStorage.setItem('historial_v2', JSON.stringify(historial));
    localStorage.setItem('notificaciones_v2', JSON.stringify(notificaciones));
}

// Cerrar modales con clic fuera
window.onclick = function(event) {
    const detailModal = document.getElementById('detailModal');
    const altaModal = document.getElementById('modalPrioridadAlta');
    const reaperturaModal = document.getElementById('modalReapertura');

    if (event.target === detailModal) closeModal();
    if (event.target === altaModal) cerrarModalPrioridadAlta();
    if (event.target === reaperturaModal) cerrarModalReapertura();

    const notifDrop = document.getElementById('dropdownNotificaciones');
    const notifBtn = document.getElementById('btnNotificaciones');
    if (notifDrop && notifBtn && !notifBtn.contains(event.target) && !notifDrop.contains(event.target)) {
        notifDrop.style.display = 'none';
    }
};