# Sprint Backlog 2 - Asignación, Avance, Cierre Trazable y Cambio Controlado 1
**Código del Proyecto:** GEX-CA-02-MAR-Z  
**Sprint:** 2  
**Fase del Proyecto:** Desarrollo  
**Fecha:** 2026-09-30  
**Versión:** 1.0  

---

## 1. Objetivo del Sprint 2
Gestionar la asignación de solicitudes a agentes activos, registro inmutable de comentarios de trabajo, control formal de transiciones de estado, confirmación o reapertura con motivo obligatorio e incorporación del Cambio Controlado 1 (justificación y fecha objetivo para solicitudes de prioridad Alta).

---

## 2. Historias de Usuario Comprometidas (18 Puntos) + Cambio Controlado 1

### HU05: Asignar solicitud de soporte (5 pts)
* **Criterios de Aceptación:**
  * Asignación permitida únicamente a agentes con estado `Activo` en el sistema.
  * Registro de actor que asigna y fecha/hora exacta en el historial estructurado.
  * Notificación automática dentro de la aplicación para el agente asignado.
  * Prevención y rechazo de asignaciones a usuarios inválidos o inactivos.
* **Tareas Técnicas:**
  * Poblar selector con agentes filtrados por `estado === 'Activo'`.
  * Diseñar sistema de notificaciones in-app con contador en campana superior.
  * Disparar evento de auditoría de asignación.

### HU06: Comentarios de trabajo del agente (3 pts)
* **Criterios de Aceptación:**
  * Validación de contenido no vacío.
  * Inmutabilidad estricta: autor y fecha no modificables.
  * Visibilidad para todos los roles con acceso a la solicitud.
  * Comentario no editable ni eliminable una vez registrado.
* **Tareas Técnicas:**
  * Formulario de avance habilitado únicamente para el agente asignado.
  * Almacenamiento cronológico de comentarios en el objeto de la solicitud.

### HU07: Cambio de estado según flujo de atención (5 pts)
* **Criterios de Aceptación:**
  * Solo transiciones permitidas:
    * `Nuevo` -> `En proceso` (Agente asignado)
    * `En proceso` -> `Resuelto` (Agente asignado)
    * `Resuelto` -> `Confirmado` o `Reabierto` (Solicitante propietario)
    * `Reabierto` -> `En proceso` (Agente asignado)
  * Registro de estado anterior y nuevo en el historial.
  * Rechazo explícito de cualquier transición inválida o no autorizada.
* **Tareas Técnicas:**
  * Implementar tabla de transiciones legales `TRANSICIONES_PERMITIDAS`.
  * Verificación en cliente de permisos de rol antes de procesar el cambio.

### HU08: Confirmar o reabrir solución (5 pts)
* **Criterios de Aceptación:**
  * Solicitante puede marcar la solicitud como `Confirmado` si la solución fue satisfactoria.
  * Para reabrir, es obligatorio capturar el motivo de inconformidad (`Reabierto con motivo`).
  * Las acciones quedan debidamente trazadas en el historial y se notifica al agente.
* **Tareas Técnicas:**
  * Modal interactivo `#modalReapertura` que exige redacción de motivo.
  * Guardado del motivo como comentario y en el evento de auditoría.

### Cambio Controlado 1 (Inicio Sprint 2)
* **Requerimiento:** *"Las solicitudes de prioridad Alta requieren justificación y fecha objetivo; adaptar HU02 y HU04."*
* **Tareas Técnicas:**
  * Adaptar HU02: Mostrar y exigir justificación y fecha objetivo al seleccionar prioridad Alta en la creación.
  * Adaptar HU04: Modal `#modalPrioridadAlta` al subir prioridad a Alta por parte del Coordinador.

---

## 3. Criterios de Calidad y Definición de Terminado (DoD)
* Casos de prueba PA-05 a PA-08 ejecutados y aprobados.
* Pruebas de no regresión del Sprint 1 verificadas satisfactoriamente.
* Interfaz intuitiva y libre de errores en consola.
