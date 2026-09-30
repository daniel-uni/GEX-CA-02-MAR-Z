# Registro de Defectos y Retrabajo (Quality Log)
**Código del Proyecto:** GEX-CA-02-MAR-Z  
**Fase del Proyecto:** Calidad / Control de Defectos  
**Fecha:** 2026-09-30  
**Versión:** 1.0  

---

## 1. Resumen de Defectos Identificados y Retrabajo Aplicado

Durante la auditoría de control de calidad sobre el incremento del Sprint 3 frente al Anexo 10 (Caso de estudio MAR-Z V2.0), se identificaron 8 no conformidades y defectos funcionales/normativos. A continuación se detalla su resolución y el retrabajo efectuado:

| ID Defecto | Sprint Origen | Componente | Descripción del Defecto | Severidad | Acción Correctiva / Retrabajo Ejecutado | Estado Final |
| :---: | :---: | :---: | :--- | :---: | :--- | :---: |
| **DEF-01** | Sprint 1 | Seguridad / Auth | Contraseñas almacenadas en texto plano en el arreglo de usuarios dentro de `app.js`. | **Crítica** | Se migraron las credenciales a hashes criptográficos SHA-256 (`crypto.subtle.digest`) y validación por hash. | **Resuelto** |
| **DEF-02** | Sprint 1 | HU02 | El estado inicial de las solicitudes se creaba como `pendiente` y no `Nuevo`. | **Media** | Se ajustó el estado inicial a `Nuevo` tanto en datos semilla como en la lógica de creación. | **Resuelto** |
| **DEF-03** | Sprint 1 | HU03 | La tabla de solicitudes del solicitante mostraba fecha de creación y no de última actualización. | **Baja** | Se actualizó la tabla para desplegar `s.fechaActualizacion` formateada. | **Resuelto** |
| **DEF-04** | Sprint 1 | HU04 | La tabla del coordinador tenía ordenamiento estático por prioridad y no permitía ordenar por estado ni fecha. | **Media** | Se implementó el control `coordOrdenamiento` con ordenamiento por prioridad, estado, fecha reciente, fecha antigua y actualización. | **Resuelto** |
| **DEF-05** | Sprint 2 | HU05 | No existía sistema de notificaciones en la aplicación al asignar solicitudes. | **Alta** | Se diseñó un centro de notificaciones in-app con contador en campana en el header superior. | **Resuelto** |
| **DEF-06** | Sprint 2 | Cambio Control 1 | No se exigía justificación ni fecha objetivo al crear o elevar solicitudes a prioridad Alta. | **Alta** | Se integró el bloque dinámico en el formulario de creación y el modal `#modalPrioridadAlta` para el Coordinador. | **Resuelto** |
| **DEF-07** | Sprint 2 | HU08 | Al reabrir una solicitud resuelta no se capturaba el motivo obligatorio de reapertura. | **Alta** | Se implementó `#modalReapertura` que exige y registra el motivo en auditoría y comentarios. | **Resuelto** |
| **DEF-08** | Sprint 3 | HU10 | El tiempo de ciclo se calculaba con media aritmética simple en vez de la mediana estadística. | **Alta** | Se reprogramó el cálculo utilizando el algoritmo de ordenamiento y cálculo exacto de la mediana en horas. | **Resuelto** |
| **DEF-09** | Sprint 3 | HU11 / HU12 | Auditoría no codificaba actores, mostraba texto libre y la exportación CSV no aplicaba filtros ni registraba evento. | **Alta** | Se codificaron los actores (`ACT-XXX`), se estructuró la tabla de auditoría, se filtró el CSV y se agregó el log de exportación. | **Resuelto** |

---

## 2. Esfuerzo de Retrabajo Estimado vs. Real

* **Horas de análisis y diagnóstico:** 1.5 horas.
* **Horas de corrección de código y refactorización:** 3.0 horas.
* **Horas de re-ejecución de pruebas (PA-01 a PA-12):** 1.5 horas.
* **Tasa de resolución de defectos:** 100% (9 de 9 defectos resueltos satisfactoriamente).
