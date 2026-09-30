// Datos iniciales
const users = [
    { username: 'solicitante', password: '123', role: 'solicitante', name: 'Usuario Solicitante' },
    { username: 'coordinador', password: '123', role: 'coordinador', name: 'Coordinador' }
];

let currentUser = null;
let solicitudes = JSON.parse(localStorage.getItem('solicitudes')) || [];

// Inicializar con datos de ejemplo si está vacío
if (solicitudes.length === 0) {
    solicitudes = [
        {
            id: 1,
            titulo: 'Problema con impresora',
            descripcion: 'La impresora del piso 3 no imprime',
            categoria: 'Hardware',
            solicitante: 'solicitante',
            prioridad: 'media',
            estado: 'pendiente',
            fechaCreacion: new Date().toISOString()
        }
    ];
    saveSolicitudes();
}

// Login
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

// Crear solicitud
document.getElementById('createForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nuevaSolicitud = {
        id: Date.now(),
        titulo: document.getElementById('titulo').value,
        descripcion: document.getElementById('descripcion').value,
        categoria: document.getElementById('categoria').value,
        solicitante: currentUser.username,
        prioridad: 'media',
        estado: 'pendiente',
        fechaCreacion: new Date().toISOString()
    };

    solicitudes.push(nuevaSolicitud);
    saveSolicitudes();

    document.getElementById('createForm').reset();
    
    const successDiv = document.getElementById('createSuccess');
    successDiv.textContent = 'Solicitud creada exitosamente';
    successDiv.style.display = 'block';
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);

    renderSolicitanteTable();
});

// Renderizar tabla del solicitante
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
                <td><span class="badge badge-${s.estado}">${s.estado}</span></td>
                <td>${formatDate(s.fechaCreacion)}</td>
                <td><button class="btn btn-small" onclick="verDetalle(${s.id})">Ver</button></td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// Renderizar tabla del coordinador
function renderCoordinadorTable() {
    const container = document.getElementById('coordinadorTable');

    if (solicitudes.length === 0) {
        container.innerHTML = '<div class="empty-state">No hay solicitudes registradas</div>';
        return;
    }

    // Ordenar por prioridad
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
                    <th>Fecha</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
    `;

    sorted.forEach(s => {
        html += `
            <tr>
                <td>${s.id}</td>
                <td>${s.titulo}</td>
                <td>${s.solicitante}</td>
                <td>${s.categoria}</td>
                <td><span class="badge badge-${s.prioridad}">${s.prioridad}</span></td>
                <td><span class="badge badge-${s.estado}">${s.estado}</span></td>
                <td>${formatDate(s.fechaCreacion)}</td>
                <td>
                    <div class="priority-controls">
                        <button class="btn btn-small btn-up" onclick="cambiarPrioridad(${s.id}, 'up')">↑</button>
                        <button class="btn btn-small btn-down" onclick="cambiarPrioridad(${s.id}, 'down')">↓</button>
                        <button class="btn btn-small" onclick="verDetalle(${s.id})">Ver</button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

// Cambiar prioridad
function cambiarPrioridad(id, direction) {
    const solicitud = solicitudes.find(s => s.id === id);
    if (!solicitud) return;

    const prioridades = ['alta', 'media', 'baja'];
    const currentIndex = prioridades.indexOf(solicitud.prioridad);

    if (direction === 'up' && currentIndex > 0) {
        solicitud.prioridad = prioridades[currentIndex - 1];
    } else if (direction === 'down' && currentIndex < prioridades.length - 1) {
        solicitud.prioridad = prioridades[currentIndex + 1];
    }

    saveSolicitudes();
    renderCoordinadorTable();
}

// Ver detalle
function verDetalle(id) {
    const solicitud = solicitudes.find(s => s.id === id);
    if (!solicitud) return;

    const modal = document.getElementById('detailModal');
    const content = document.getElementById('modalContent');

    content.innerHTML = `
        <div style="margin-bottom: 15px;">
            <strong>ID:</strong> ${solicitud.id}<br>
            <strong>Título:</strong> ${solicitud.titulo}<br>
            <strong>Descripción:</strong> ${solicitud.descripcion}<br>
            <strong>Categoría:</strong> ${solicitud.categoria}<br>
            <strong>Solicitante:</strong> ${solicitud.solicitante}<br>
            <strong>Prioridad:</strong> <span class="badge badge-${solicitud.prioridad}">${solicitud.prioridad}</span><br>
            <strong>Estado:</strong> <span class="badge badge-${solicitud.estado}">${solicitud.estado}</span><br>
            <strong>Fecha de creación:</strong> ${formatDate(solicitud.fechaCreacion)}
        </div>
    `;

    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('detailModal').classList.remove('active');
}

// Utilidades
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES') + ' ' + date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function saveSolicitudes() {
    localStorage.setItem('solicitudes', JSON.stringify(solicitudes));
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('detailModal');
    if (event.target === modal) {
        closeModal();
    }
}