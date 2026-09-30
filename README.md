# Plataforma de Gestión Colaborativa de Solicitudes de Soporte (MAR-Z Core)
**Código del Proyecto:** `GEX-CA-02-MAR-Z`  
**Metodología:** Modelo Ágil MAR-Z Core (Inspirado en El Principito) / Compatible con Scrum  
**Versión del Incremento:** 2.0 (Sprints 1, 2 y 3 Completados)  
**Fecha:** 2026-09-30  

---

## 1. Descripción del Producto
Plataforma web para registrar, priorizar, asignar, atender y auditar solicitudes de soporte interno en sitios de distribución a nivel nacional. Diseñada con estricto apego al Anexo 10 (Caso de estudio MAR-Z), sin funciones de vigilancia individual ni perfiles invasivos, implementando autenticación con contraseñas seguras (hashes SHA-256), transiciones controladas de estado, indicadores reproducibles con tiempo mediano de ciclo y auditoría con actores codificados.

---

## 2. Instrucciones Reproducibles de Ejecución

### Requisitos Previos
* Cualquier navegador web moderno (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).
* No requiere dependencias externas, compiladores, ni servidores backend adicionales.

### Pasos de Ejecución Local
1. **Clonar o descargar el repositorio:**
   ```bash
   git clone https://github.com/daniel-uni/GEX-CA-02-MAR-Z.git
   cd GEX-CA-02-MAR-Z
   ```
2. **Ejecutar la aplicación:**
   * **Opción A (Directa):** Haga doble clic en el archivo `index.html` para abrirlo en su navegador.
   * **Opción B (Servidor local ligero en terminal):**
     ```bash
     # Con Python 3
     python -m http.server 8080
     # Abrir en el navegador: http://localhost:8080
     ```
     o con Node.js / npx:
     ```bash
     npx serve .
     ```

---

## 3. Credenciales de Prueba y Roles del Sistema

Las contraseñas de prueba **nunca se transmiten ni almacenan en texto plano**; se validan mediante **SHA-256**. La clave para todas las cuentas de prueba es `123`.

| Rol | Usuario | Contraseña | Código de Actor | Funcionalidades Autorizadas y Límites |
| :--- | :--- | :--- | :---: | :--- |
| **Solicitante** | `solicitante` | `123` | `ACT-SOL01` | Crear solicitudes (con justificación si es Alta), consultar solo las propias, confirmar o reabrir con motivo obligatorio. *Límite:* No accede a solicitudes ajenas. |
| **Coordinador** | `coordinador` | `123` | `ACT-COO01` | Priorizar solicitudes (justificación obligatoria para Alta), asignar a agentes activos, ordenar tabla por estado/fecha/prioridad, consultar indicadores agregados y exportar reporte CSV filtrado. *Límite:* No modifica historial de auditoría. |
| **Agente 1** | `agente` | `123` | `ACT-AGE01` | Atender solicitudes asignadas, registrar comentarios de avance inmutables, transicionar estados permitidos (`Nuevo` -> `En proceso` -> `Resuelto`). *Límite:* No administra prioridades ni usuarios. |
| **Agente 2** | `agente2` | `123` | `ACT-AGE02` | Atender solicitudes asignadas secundarias. Mismas atribuciones de agente. |
| **Auditor** | `auditor` | `123` | `ACT-AUD01` | Vista de solo lectura del historial estructurado (fecha, solicitud, actor codificado, campo, valor anterior y nuevo). Excluye texto libre. *Límite:* No crea, asigna ni resuelve solicitudes. |

---

## 4. Estructura de Entregables y Evidencia Normativa

Todos los artefactos cumplen con la estructura de nombres normativos:  
`CódigoGrupoExperimental-Sprint-X-FaseDelProyecto-DescripciónContenidoDelArchivo-Fecha AAAAMMDD-Versión`

1. **Product Backlog:**  
   [`GEX-CA-02-MAR-Z-Sprint-1-Planificacion-ProductBacklog-20260930-V1.0.md`](./GEX-CA-02-MAR-Z-Sprint-1-Planificacion-ProductBacklog-20260930-V1.0.md)
2. **Sprint Backlog 1:**  
   [`GEX-CA-02-MAR-Z-Sprint-1-Desarrollo-SprintBacklog-20260930-V1.0.md`](./GEX-CA-02-MAR-Z-Sprint-1-Desarrollo-SprintBacklog-20260930-V1.0.md)
3. **Sprint Backlog 2:**  
   [`GEX-CA-02-MAR-Z-Sprint-2-Desarrollo-SprintBacklog-20260930-V1.0.md`](./GEX-CA-02-MAR-Z-Sprint-2-Desarrollo-SprintBacklog-20260930-V1.0.md)
4. **Sprint Backlog 3:**  
   [`GEX-CA-02-MAR-Z-Sprint-3-Desarrollo-SprintBacklog-20260930-V1.0.md`](./GEX-CA-02-MAR-Z-Sprint-3-Desarrollo-SprintBacklog-20260930-V1.0.md)
5. **Matriz de Trazabilidad HU–Criterios–Pruebas–Commits:**  
   [`GEX-CA-02-MAR-Z-Sprint-3-Pruebas-MatrizTrazabilidadHUCriteriosPruebasCommit-20260930-V1.0.md`](./GEX-CA-02-MAR-Z-Sprint-3-Pruebas-MatrizTrazabilidadHUCriteriosPruebasCommit-20260930-V1.0.md)
6. **Registro de Defectos y Retrabajo:**  
   [`GEX-CA-02-MAR-Z-Sprint-3-Calidad-RegistroDefectosRetrabajo-20260930-V1.0.md`](./GEX-CA-02-MAR-Z-Sprint-3-Calidad-RegistroDefectosRetrabajo-20260930-V1.0.md)
7. **Artefactos Complementarios MAR-Z:**  
   [`GEX-CA-02-MAR-Z-Sprint-3-Cierre-ArtefactosComplementariosMARZ-20260930-V1.0.md`](./GEX-CA-02-MAR-Z-Sprint-3-Cierre-ArtefactosComplementariosMARZ-20260930-V1.0.md)

---

## 5. Etiquetas de Cierre por Sprint (`git tag`)

* `Sprint-1`: Cierre formal del Sprint 1 (HU01 a HU04).
* `Sprint-2`: Cierre formal del Sprint 2 (HU05 a HU08 + Cambio Controlado 1).
* `Sprint-3`: Cierre formal del Sprint 3 (HU09 a HU12 + Cambio Controlado 2 + Regresión Completa).
