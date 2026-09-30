// Datos iniciales
const users = [
    { username: 'solicitante', password: '123', role: 'solicitante', name: 'Usuario Solicitante' },
    { username: 'coordinador', password: '123', role: 'coordinador', name: 'Coordinador' },
    { username: 'agente', password: '123', role: 'agente', name: 'Agente Soporte' },
    { username: 'agente2', password: '123', role: 'agente', name: 'Agente Soporte 2' },
    { username: 'auditor', password: '123', role: 'auditor', name: 'Auditor' }
];

let currentUser = null;
let solicitudes = JSON.parse(localStorage.getItem('solicitudes')) || [];
let historial = JSON.parse(localStorage.getItem('historial')) || [];

// Inicializar con datos de ejemplo si está vacío
if (solicitudes.length === 0) {
    solicitudes = [
        {
            id: 1,
            titulo: 'Problema con impresora',
            descripcion: 'La impresora del piso 3 no imprime',
            categoria: 'Hardware',
            solicitante: 'solicitante',
            asignado: 'agente',
            prioridad: 'media',
            estado: 'pendiente',
            comentarios: [],
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString()
        },
        {
            id: 2,
            titulo: 'No puedo acceder al correo',
            descripcion: 'El cliente de correo muestra error de autenticación',
            categoria: 'Software',
            solicitante: 'solicitante',
            asignado: 'agente2',
            prioridad: 'alta',
            estado: 'en_proceso',
            comentarios: [
                { autor: 'agente2', texto: 'Se está revisando la configuración del servidor', fecha: new Date().toISOString() }
            ],
            fechaCreacion: new Date(Date.now() - 86400000).toISOString(),
            fechaActualizacion: new Date().toISOString()
        }
    ];
    historial = [
        { id: 1, solicitudId: 1, accion: 'Solicitud creada', usuario: 'solicitante', fecha: solicitudes[0].fechaCreacion },
        { id: 2, solicitudId: 1, accion: 'Asignada a agente', usuario: 'coordinador', fecha: solicitudes[0].fechaCreacion },
        { id: 3, solicitudId: 2, accion: 'Solicitud creada', usuario: 'solicitante', fecha: solicitudes[1].fechaCreacion },
        { id: 4, solicitudId: 2, accion: 'Asignada a agente2', usuario: 'coordinador', fecha: solicitudes[1].fechaCreacion },
        { id: 5, solicitudId: 2, accion: 'Estado cambiado a en_proceso', usuario: 'agente2', fecha: solicitudes[1].fechaActualizacion }
    ];
    saveData();
}

// ============ LOGIN ============
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        currentUser = user;
        showApp();
    } else {
        showError('Usuario o contraseña incorrectos');
    }
});

function showError(message) {
    const errorDiv = document.getElementById('loginError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

function showApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('currentUser').textContent = 
        `${currentUser.name} (${currentUser.role})`;

    if (currentUser.role === 'solicitante') {
        document.getElementById('solicitanteDashboard').classList.add('active');
        renderSolicitanteTable();
    } else if (currentUser.role === 'coordinador') {
        document.getElementById('coordinadorDashboard').classList.add('active');
        renderCoordinadorTable();
    } else if (currentUser.role === 'agente') {
        document.getElementById('agenteDashboard').classList.add('active');
        renderAgenteTable();
    } else if (currentUser.role === 'auditor') {
        document.getElementById('auditorDashboard').classList.add('active');
        renderAuditorTable();
    }
}

function logout() {
    currentUser = null;
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.querySelectorAll('.dashboard').forEach(d => d.classList.remove('active'));
}

// ============ HU02: Crear solicitud ============
document.getElementById('createForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nuevaSolicitud = {
        id: Date.now(),
        titulo: document.getElementById('titulo').value,
        descripcion: document.getElementById('descripcion').value,
        categoria: document.getElementById('categoria').value,
        solicitante: currentUser.username,
        asignado: null,
        prioridad: 'media',
        estado: 'pendiente',
        comentarios: [],
        fechaCreacion: new Date().toISOString(),
        fechaActualizacion: new Date().toISOString()
    };

    solicitudes.push(nuevaSolicitud);
    addHistorial(nuevaSolicitud.id, 'Solicitud creada', currentUser.username);
    saveData();

    document.getElementById('createForm').reset();
    
    const successDiv = document.getElementById('createSuccess');
    successDiv.textContent = 'Solicitud creada exitosamente';
    successDiv.style.display = 'block';
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);

    renderSolicitanteTable();
});

// ============ HU03: Consultar mis solicitudes ============
function renderSolicitanteTable() {
    const misSolicitudes = solicitudes.filter(s => s.solicitante === currentUser.username);
    const container = document.getElementById('solicitanteTable');

    if (misSolicitudes.length === 0) {
        container.innerHTML = '<div class="empty-state">No tiene solicitudes registradas</div>';
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
                    <th>Fecha</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    misSolicitudes.forEach(s => {
        html += `
            <tr>
                <td>${s.id}</td>
                <td>${s.titulo}</td>
                <td>${s.categoria}</td>
                <td><span class="badge badge-${s.prioridad}">${s.prioridad}</span></td>
                <td><span class="badge badge-${s.estado}">${formatEstado(s.estado)}</span></td>
                <td>${s.asignado || '<span class="badge badge-sin_asignar">Sin asignar</span>'}</td>
                <td>${formatDate(s.fechaCreacion)}</td>
                <td><button class="btn btn-small" onclick="verDetalle(${s.id})">Ver</button></td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// ============ HU04: Priorizar + HU05: Asignar ============
function renderCoordinadorTable() {
    const container = document.getElementById('coordinadorTable');
    const agentes = users.filter(u => u.role === 'agente');

    if (solicitudes.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay solicitudes registradas</div>';
        return;
    }

    const ordenPrioridad = { alta: 1, media: 2, baja: 3 };
    const sorted = [...solicitudes].sort((a, b) => 
        ordenPrioridad[a.prioridad] - ordenPrioridad[b.prioridad]
    );

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
                    <th>Asignado a</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    sorted.forEach(s => {
        let asignadoHtml = '';
        if (s.asignado) {
            asignadoHtml = `<span>${s.asignado}</span>`;
        } else {
            asignadoHtml = '<span class="badge badge-sin_asignar">Sin asignar</span>';
        }

        let agenteOptions = '<option value="">-- Sin asignar --</option>';
        agentes.forEach(a => {
            const selected = s.asignado === a.username ? 'selected' : '';
            agenteOptions += `<option value="${a.username}" ${selected}>${a.name}</option>`;
        });

        html += `
            <tr>
                <td>${s.id}</td>
                <td>${s.titulo}</td>
                <td>${s.solicitante}</td>
                <td>${s.categoria}</td>
                <td><span class="badge badge-${s.prioridad}">${s.prioridad}</span></td>
                <td><span class="badge badge-${s.estado}">${formatEstado(s.estado)}</span></td>
                <td>
                    <select class="inline-select" onchange="asignarSolicitud(${s.id}, this.value)">
                        ${agenteOptions}
                    </select>
                </td>
                <td>${formatDate(s.fechaCreacion)}</td>
                <td>
                    <div class="priority-controls">
                        <button class="btn btn-small btn-up" onclick="cambiarPrioridad(${s.id}, 'up')" title="Subir prioridad">↑</button>
                        <button class="btn btn-small btn-down" onclick="cambiarPrioridad(${s.id}, 'down')" title="Bajar prioridad">↓</button>
                        <button class="btn btn-small" onclick="verDetalle(${s.id})">Ver</button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// HU05: Asignar solicitud a agente
function asignarSolicitud(id, agenteUsername) {
    const solicitud = solicitudes.find(s => s.id === id);
    if (!solicitud) return;

    const anterior = solicitud.asignado;
    solicitud.asignado = agenteUsername || null;
    solicitud.fechaActualizacion = new Date().toISOString();

    if (agenteUsername && anterior !== agenteUsername) {
        addHistorial(id, `Asignada a ${agenteUsername}`, currentUser.username);
    } else if (!agenteUsername && anterior) {
        addHistorial(id, `Desasignada (antes: ${anterior})`, currentUser.username);
    }

    saveData();
    renderCoordinadorTable();
}

function cambiarPrioridad(id, direction) {
    const solicitud = solicitudes.find(s => s.id === id);
    if (!solicitud) return;

    const prioridades = ['alta', 'media', 'baja'];
    const currentIndex = prioridades.indexOf(solicitud.prioridad);
    const anterior = solicitud.prioridad;

    if (direction === 'up' && currentIndex > 0) {
        solicitud.prioridad = prioridades[currentIndex - 1];
    } else if (direction === 'down' && currentIndex < prioridades.length - 1) {
        solicitud.prioridad = prioridades[currentIndex + 1];
    }

    if (anterior !== solicitud.prioridad) {
        solicitud.fechaActualizacion = new Date().toISOString();
        addHistorial(id, `Prioridad cambiada de ${anterior} a ${solicitud.prioridad}`, currentUser.username);
        saveData();
    }
    renderCoordinadorTable();
}

// ============ HU06 + HU07: Agente ============
function renderAgenteTable() {
    const misSolicitudes = solicitudes.filter(s => s.asignado === currentUser.username);
    const container = document.getElementById('agenteTable');

    if (misSolicitudes.length === 0) {
        container.innerHTML = '<div class="empty-state">No tiene solicitudes asignadas</div>';
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
                    <th>Fecha</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    misSolicitudes.forEach(s => {
        html += `
            <tr>
                <td>${s.id}</td>
                <td>${s.titulo}</td>
                <td>${s.solicitante}</td>
                <td><span class="badge badge-${s.prioridad}">${s.prioridad}</span></td>
                <td><span class="badge badge-${s.estado}">${formatEstado(s.estado)}</span></td>
                <td>${formatDate(s.fechaCreacion)}</td>
                <td><button class="btn btn-small" onclick="verDetalle(${s.id})">Ver / Gestionar</button></td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// ============ HU08: Auditor ============
function renderAuditorTable() {
    const container = document.getElementById('auditorTable');

    if (historial.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay registros de auditoría</div>';
        return;
    }

    const sorted = [...historial].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Solicitud</th>
                    <th>Usuario</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
    `;

    sorted.forEach(h => {
        html += `
            <tr>
                <td>${formatDate(h.fecha)}</td>
                <td>#${h.solicitudId}</td>
                <td>${h.usuario}</td>
                <td>${h.accion}</td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// ============ Modal de detalles ============
function verDetalle(id) {
    const solicitud = solicitudes.find(s => s.id === id);
    if (!solicitud) return;

    const modal = document.getElementById('detailModal');
    const content = document.getElementById('modalContent');
    const title = document.getElementById('modalTitle');
    title.textContent = `Solicitud #${solicitud.id}`;

    let html = `
        <div class="detail-row">
            <span class="detail-label">Título:</span> ${solicitud.titulo}
        </div>
        <div class="detail-row">
            <span class="detail-label">Descripción:</span><br>
            <div style="margin-top: 5px; padding: 10px; background: #f9f9f9; border: 1px solid #eee;">${solicitud.descripcion}</div>
        </div>
        <div class="detail-row">
            <span class="detail-label">Categoría:</span> ${solicitud.categoria}
        </div>
        <div class="detail-row">
            <span class="detail-label">Solicitante:</span> ${solicitud.solicitante}
        </div>
        <div class="detail-row">
            <span class="detail-label">Asignado a:</span> ${solicitud.asignado || 'Sin asignar'}
        </div>
        <div class="detail-row">
            <span class="detail-label">Prioridad:</span> <span class="badge badge-${solicitud.prioridad}">${solicitud.prioridad}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Estado:</span> <span class="badge badge-${solicitud.estado}">${formatEstado(solicitud.estado)}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Creada:</span> ${formatDate(solicitud.fechaCreacion)}
        </div>
        <div class="detail-row">
            <span class="detail-label">Actualizada:</span> ${formatDate(solicitud.fechaActualizacion)}
        </div>
    `;

    // Comentarios (HU06)
    html += `
        <div class="comments-section">
            <h4>Comentarios de trabajo</h4>
    `;

    if (solicitud.comentarios && solicitud.comentarios.length > 0) {
        solicitud.comentarios.forEach(c => {
            html += `
                <div class="comment-item">
                    <div class="comment-meta">${c.autor} - ${formatDate(c.fecha)}</div>
                    <div class="comment-text">${c.texto}</div>
                </div>
            `;
        });
    } else {
        html += '<div class="empty-state" style="padding: 15px;">Sin comentarios</div>';
    }

    // Formulario de comentario (solo agente asignado)
    if (currentUser.role === 'agente' && solicitud.asignado === currentUser.username) {
        html += `
            <div class="comment-form">
                <textarea id="nuevoComentario" rows="3" placeholder="Registrar avance o comentario..."></textarea>
                <button class="btn btn-small" onclick="agregarComentario(${solicitud.id})">Agregar comentario</button>
            </div>
        `;
    }

    html += '</div>';

    // Acciones según rol
    html += renderAcciones(solicitud);

    // Historial
    const histSolicitud = historial.filter(h => h.solicitudId === solicitud.id)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    if (histSolicitud.length > 0) {
        html += `
            <div class="history-section">
                <h4>Historial de cambios</h4>
        `;
        histSolicitud.forEach(h => {
            html += `
                <div class="history-item">
                    <span class="history-date">${formatDate(h.fecha)}</span> - 
                    <strong>${h.usuario}</strong>: ${h.accion}
                </div>
            `;
        });
        html += '</div>';
    }

    content.innerHTML = html;
    modal.classList.add('active');
}

// Renderiza acciones según el rol y estado
function renderAcciones(solicitud) {
    let html = '<div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">';

    // HU07: Agente puede cambiar estado
    if (currentUser.role === 'agente' && solicitud.asignado === currentUser.username) {
        html += '<h4 style="margin-bottom: 10px; font-size: 14px;">Cambiar estado:</h4>';
        html += '<div class="action-controls">';
        
        if (solicitud.estado === 'pendiente' || solicitud.estado === 'reabierto') {
            html += `<button class="btn btn-small btn-warning" onclick="cambiarEstado(${solicitud.id}, 'en_proceso')">Iniciar atención</button>`;
        }
        if (solicitud.estado === 'en_proceso') {
            html += `<button class="btn btn-small btn-success" onclick="cambiarEstado(${solicitud.id}, 'resuelto')">Marcar como resuelto</button>`;
        }
        
        html += '</div>';
    }

    // HU08: Solicitante puede confirmar o reabrir
    if (currentUser.role === 'solicitante' && solicitud.solicitante === currentUser.username) {
        if (solicitud.estado === 'resuelto') {
            html += '<h4 style="margin-bottom: 10px; font-size: 14px;">¿La solución fue satisfactoria?</h4>';
            html += '<div class="action-controls">';
            html += `<button class="btn btn-small btn-success" onclick="cambiarEstado(${solicitud.id}, 'confirmado')">Confirmar solución</button>`;
            html += `<button class="btn btn-small btn-danger" onclick="cambiarEstado(${solicitud.id}, 'reabierto')">Reabrir solicitud</button>`;
            html += '</div>';
        }
    }

    html += '</div>';
    return html;
}

// HU06: Agregar comentario
function agregarComentario(id) {
    const texto = document.getElementById('nuevoComentario').value.trim();
    if (!texto) {
        alert('El comentario no puede estar vacío');
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

    addHistorial(id, 'Comentario registrado', currentUser.username);
    saveData();
    verDetalle(id);
}

// HU07 + HU08: Cambiar estado
function cambiarEstado(id, nuevoEstado) {
    const solicitud = solicitudes.find(s => s.id === id);
    if (!solicitud) return;

    const anterior = solicitud.estado;
    solicitud.estado = nuevoEstado;
    solicitud.fechaActualizacion = new Date().toISOString();

    addHistorial(id, `Estado cambiado de ${formatEstado(anterior)} a ${formatEstado(nuevoEstado)}`, currentUser.username);
    saveData();

    closeModal();
    refreshCurrentView();
}

function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
}

function refreshCurrentView() {
    if (currentUser.role === 'solicitante') renderSolicitanteTable();
    else if (currentUser.role === 'coordinador') renderCoordinadorTable();
    else if (currentUser.role === 'agente') renderAgenteTable();
    else if (currentUser.role === 'auditor') renderAuditorTable();
}

// ============ Utilidades ============
function formatEstado(estado) {
    const map = {
        pendiente: 'Pendiente',
        en_proceso: 'En proceso',
        resuelto: 'Resuelto',
        confirmado: 'Confirmado',
        reabierto: 'Reabierto'
    };
    return map[estado] || estado;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function addHistorial(solicitudId, accion, usuario) {
    historial.push({
        id: historial.length + 1,
        solicitudId: solicitudId,
        accion: accion,
        usuario: usuario,
        fecha: new Date().toISOString()
    });
}

function saveData() {
    localStorage.setItem('solicitudes', JSON.stringify(solicitudes));
    localStorage.setItem('historial', JSON.stringify(historial));
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('detailModal');
    if (event.target === modal) {
        closeModal();
    }
}