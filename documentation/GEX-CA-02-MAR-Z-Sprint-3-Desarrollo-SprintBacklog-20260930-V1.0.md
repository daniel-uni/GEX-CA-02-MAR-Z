# Sprint Backlog 3 - Consulta, Indicadores, Auditoría y Cambio Controlado 2
**Código del Proyecto:** GEX-CA-02-MAR-Z  
**Sprint:** 3  
**Fase del Proyecto:** Desarrollo  
**Fecha:** 2026-09-30  
**Versión:** 1.0  

---

## 1. Objetivo del Sprint 3
Facilitar la búsqueda avanzada multicriterio en todos los roles, implementar panel de indicadores agregados con filtros reproducibles y tiempo mediano de ciclo, vista de auditoría de solo lectura con actores codificados, exportación de reportes CSV filtrados e integración del Cambio Controlado 2.

---

## 2. Historias de Usuario Comprometidas (23 Puntos) + Cambio Controlado 2

### HU09: Búsqueda y filtrado consistente (5 pts)
* **Criterios de Aceptación:**
  * Búsqueda en texto libre por título o descripción.
  * Filtros combinados por estado, prioridad y categoría en todos los roles autorizados.
  * Respeto estricto del ámbito de permisos por rol.
  * Comportamiento consistente y reactivo al cambiar criterios.
* **Tareas Técnicas:**
  * Integrar selects de estado, prioridad y categoría en paneles de Solicitante, Coordinador y Agente.
  * Unificar lógica de filtrado en funciones `getSolicitudesFiltradas()`, `getSolicitudesCoordFiltradas()` y `getSolicitudesAgenteFiltradas()`.

### HU10: Indicadores agregados y tiempo mediano de ciclo (8 pts)
* **Criterios de Aceptación:**
  * Volumen discriminado por estado (Nuevas, En proceso, Resueltas, Reabiertas).
  * Tasa global de resolución.
  * Cálculo estadístico del **Tiempo Mediano de Ciclo** (mediana sobre solicitudes resueltas/confirmadas).
  * Filtros de cálculo reproducibles por estado, prioridad y categoría.
  * Ausencia de métricas de vigilancia o rankings individuales de desempeño.
* **Tareas Técnicas:**
  * Implementar algoritmo de ordenamiento y cálculo de mediana en horas de ciclo de vida.
  * Diseñar tarjetas de indicadores visuales y distribución porcentual por categoría.
  * Barra de filtros dedicados para el recálculo de indicadores.

### HU11: Historial para Auditor (5 pts)
* **Criterios de Aceptación:**
  * Acceso de solo lectura restringido exclusivamente al rol Auditor.
  * Visualización de datos estructurados: fecha, ID solicitud, actor codificado (ej. `ACT-SOL01`, `ACT-COO01`), campo modificado, valor anterior y valor nuevo.
  * Exclusión de texto libre para proteger confidencialidad.
* **Tareas Técnicas:**
  * Estructurar log de eventos con campos `actorCodificado`, `campo`, `valorAnterior` y `valorNuevo`.
  * Filtro por tipo de campo y buscador por solicitud/actor.

### HU12: Exportar reporte para análisis autorizado (5 pts)
* **Criterios de Aceptación:**
  * Exportación en formato CSV descargable.
  * Respeta los filtros aplicados en la vista del Coordinador al momento de exportar.
  * Excluye credenciales y texto libre no necesario (descripciones y comentarios).
  * Registro obligatorio del evento de exportación en la auditoría del sistema.
* **Tareas Técnicas:**
  * Generar Blob CSV dinámico basado en `getSolicitudesCoordFiltradas()`.
  * Invocar `addHistorial(null, 'Exportación', '-', 'Reporte CSV (...)')`.
  * Notificación visual de confirmación en la UI.

### Cambio Controlado 2 (Inicio Sprint 3)
* **Requerimiento:** *"El auditor necesita acceso de solo lectura al historial y el reporte debe excluir texto libre; precisar HU11 y HU12."*
* **Tareas Técnicas:**
  * Anonimizar actores en auditoría con nomenclatura `ACT-XXX`.
  * Omitir columnas de descripción libre en la estructura del CSV exportado.

---

## 3. Criterios de Calidad y Definición de Terminado (DoD)
* Casos de prueba PA-09 a PA-12 ejecutados y superados.
* Batería completa de regresión (PA-01 a PA-12) 100% aprobada.
* Cumplimiento total de directrices de seguridad (no texto plano en contraseñas).
