# Product Backlog Normativo - Sistema de Soporte Interno
**Código del Proyecto:** GEX-CA-02-MAR-Z  
**Metodología:** MAR-Z Core (Modelo Ágil de la Rosa y el Zorro) / Scrum Compatible  
**Versión:** 1.0  
**Fecha:** 2026-09-30  

---

## 1. Visión del Producto
Plataforma web de gestión colaborativa para registrar, priorizar, asignar, atender y auditar solicitudes de soporte interno en una organización con sitios de distribución a nivel nacional. La solución garantiza la trazabilidad del servicio, el cumplimiento de la privacidad (sin vigilancia personal ni perfiles individuales) y una estricta autenticación por roles con contraseñas seguras y auditoría no intrusiva.

---

## 2. Definición de Roles del Producto
* **Solicitante (`solicitante` / `ACT-SOL01`):** Crear y consultar sus solicitudes. *Límite:* No accede a solicitudes ajenas.
* **Coordinador (`coordinador` / `ACT-COO01`):** Priorizar, asignar a agentes activos y consultar indicadores agregados. *Límite:* No modifica el historial de auditoría.
* **Agente (`agente` / `ACT-AGE01`, `agente2` / `ACT-AGE02`):** Atender solicitudes asignadas y registrar avances inmutables. *Límite:* No administra usuarios ni prioridades globales.
* **Auditor (`auditor` / `ACT-AUD01`):** Consultar el historial de cambios en modo lectura con actores codificados. *Límite:* No crea, asigna ni resuelve solicitudes.

---

## 3. Catálogo de Historias de Usuario (Backlog Completo)

| ID | Historia de Usuario | Criterios de Aceptación Mínimos | Puntos | Sprint Objetivo |
| :--- | :--- | :--- | :---: | :---: |
| **HU01** | Como usuario, quiero iniciar sesión para acceder solo a las funciones de mi rol. | Credenciales válidas permiten acceso; inválidas no revelan si el usuario existe; la sesión puede cerrarse; un usuario no puede acceder a funciones de otro rol; contraseñas nunca en texto plano (SHA-256). | 5 | Sprint 1 |
| **HU02** | Como solicitante, quiero crear una solicitud para pedir soporte. | Título, descripción y categoría son obligatorios; se genera ID, fecha, estado Nuevo y propietario. *(Adaptado con Cambio Controlado 1: justificación y fecha objetivo si prioridad es Alta)*. | 5 | Sprint 1 |
| **HU03** | Como solicitante, quiero consultar mis solicitudes para conocer su estado. | Lista solo las propias; permite abrir detalle; muestra estado y última actualización; filtra por estado, prioridad y categoría. | 3 | Sprint 1 |
| **HU04** | Como coordinador, quiero priorizar solicitudes para ordenar la atención. | Prioridad válida; cambio trazable; lista ordenable por prioridad, estado, fecha; solo coordinador modifica. *(Adaptado con Cambio Controlado 1: justificación y fecha objetivo para prioridad Alta)*. | 3 | Sprint 1 |
| **HU05** | Como coordinador, quiero asignar una solicitud para establecer responsabilidad. | Asigna a agente activo (con estado Activo en el sistema); registra quién/cuándo; notifica en la aplicación; evita asignación inválida. | 5 | Sprint 2 |
| **HU06** | Como agente, quiero registrar comentarios de trabajo para documentar avances. | Comentario no vacío; autor y fecha inmutables; visible a roles; comentario no editable una vez creado. | 3 | Sprint 2 |
| **HU07** | Como agente, quiero cambiar el estado para reflejar el flujo de atención. | Solo transiciones permitidas (Nuevo -> En proceso -> Resuelto; Reabierto -> En proceso); historial completo; rechaza transiciones inválidas. | 5 | Sprint 2 |
| **HU08** | Como solicitante, quiero confirmar o reabrir una solución para controlar el cierre. | Búsqueda por texto en título y descripción; puede aceptar Resuelta (Confirmar) o reabrir con motivo obligatorio; acciones quedan trazadas. | 5 | Sprint 2 |
| **HU09** | Como usuario, quiero buscar y filtrar solicitudes para localizar información autorizada. | Búsqueda por texto en título y descripción; filtra por estado, prioridad y categoría; respeta permisos de rol; combinación de filtros consistente. | 5 | Sprint 3 |
| **HU10** | Como coordinador, quiero consultar indicadores agregados para gestionar el servicio. | Muestra volumen por estado y tiempo mediano de ciclo (mediana estadística); filtros reproducibles (estado, prioridad, categoría); sin ranking individual ni vigilancia. | 8 | Sprint 3 |
| **HU11** | Como auditor, quiero consultar el historial para verificar decisiones. | Solo lectura; muestra actor codificado, fecha, campo y valores anterior/nuevo; acceso restringido. *(Adaptado con Cambio Controlado 2: excluye texto libre)*. | 5 | Sprint 3 |
| **HU12** | Como coordinador, quiero exportar un reporte para análisis autorizado. | Exporta CSV aplicando los filtros activos; excluye credenciales y texto no necesario/libre; registra la exportación en auditoría. | 5 | Sprint 3 |

---

## 4. Cambios Controlados Integrados
1. **Cambio Controlado 1 (Sprint 2):** Las solicitudes de prioridad Alta requieren justificación obligatoria y fecha objetivo de atención (adaptación en HU02 y HU04).
2. **Cambio Controlado 2 (Sprint 3):** El auditor accede en modo solo lectura con exclusión de texto libre en historial y en la exportación estructurada de reportes en CSV (precisión en HU11 y HU12).
