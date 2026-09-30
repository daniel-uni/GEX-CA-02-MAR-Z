# Matriz de Trazabilidad: HU – Criterios – Pruebas – Commits
**Código del Proyecto:** GEX-CA-02-MAR-Z  
**Fase del Proyecto:** Pruebas / Aseguramiento de Calidad  
**Fecha:** 2026-09-30  
**Versión:** 1.0  

---

## 1. Matriz de Trazabilidad Integral

| ID HU | Historia de Usuario | Criterios de Aceptación Evaluados | Caso de Prueba | Resultado | Commit Asociado |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **HU01** | Iniciar sesión por rol | • Credenciales válidas dan acceso a rol.<br>• Inválidas no revelan si existe el usuario.<br>• Sesión puede cerrarse.<br>• Aislamiento entre roles.<br>• Contraseñas con hash SHA-256 (no texto plano). | **PA-01** | **Aprobado** | `3c873c2`<br>`41391d9` |
| **HU02** | Crear solicitud | • Título, descripción y categoría obligatorios.<br>• Genera ID, fecha, estado Nuevo y propietario.<br>• Justificación y fecha objetivo si prioridad es Alta (Cambio 1). | **PA-02** | **Aprobado** | `41391d9` |
| **HU03** | Consultar mis solicitudes | • Lista exclusivamente las propias.<br>• Apertura de modal con detalle completo.<br>• Muestra estado y última actualización.<br>• Filtro por estado, prioridad y categoría. | **PA-03** | **Aprobado** | `41391d9` |
| **HU04** | Priorizar solicitudes | • Valores Alta, Media, Baja válidos.<br>• Cambio trazable en historial.<br>• Lista ordenable por prioridad, estado y fecha.<br>• Solo coordinador modifica.<br>• Exige justificación y fecha objetivo para Alta (Cambio 1). | **PA-04** | **Aprobado** | `41391d9` |
| **HU05** | Asignar solicitud | • Asigna únicamente a agentes con estado Activo.<br>• Trazabilidad de actor y timestamp.<br>• Notificación en la aplicación para el agente.<br>• Evita asignación inválida. | **PA-05** | **Aprobado** | `a9b02ab` |
| **HU06** | Comentarios de trabajo | • Comentario no vacío.<br>• Autor y fecha inmutables.<br>• Visible para los roles autorizados.<br>• No editable ni eliminable tras su registro. | **PA-06** | **Aprobado** | `a9b02ab` |
| **HU07** | Cambiar estado | • Solo transiciones permitidas (Nuevo -> En proceso -> Resuelto; Reabierto -> En proceso).<br>• Historial completo.<br>• Rechaza transiciones no válidas. | **PA-07** | **Aprobado** | `a9b02ab` |
| **HU08** | Confirmar o reabrir solución | • Aceptar Resuelta pasa a Confirmado.<br>• Reabrir exige obligatoriamente motivo.<br>• Notifica al agente y registra en historial. | **PA-08** | **Aprobado** | `a9b02ab` |
| **HU09** | Buscar y filtrar solicitudes | • Búsqueda de texto en título y descripción.<br>• Filtros por estado, prioridad y categoría en todos los paneles.<br>• Respeta permisos por rol.<br>• Combinación consistente. | **PA-09** | **Aprobado** | `a9b02ab` |
| **HU10** | Indicadores agregados | • Volumen por estado (Nuevas, En proceso, Resueltas, Reabiertas).<br>• Tiempo mediano de ciclo (mediana estadística).<br>• Filtros reproducibles (estado, prioridad, categoría).<br>• Sin ranking individual de desempeño. | **PA-10** | **Aprobado** | `a9b02ab` |
| **HU11** | Consultar historial (Auditor) | • Modo solo lectura restringido al auditor.<br>• Actor codificado (ej. ACT-SOL01).<br>• Columnas: Fecha, Solicitud, Actor, Campo, Valor Anterior, Valor Nuevo.<br>• Exclusión de texto libre confidencial (Cambio 2). | **PA-11** | **Aprobado** | `a9b02ab` |
| **HU12** | Exportar reporte | • Exporta archivo CSV.<br>• Aplica filtros activos del Coordinador.<br>• Excluye credenciales y texto libre confidencial (Cambio 2).<br>• Registra la exportación en el historial de auditoría. | **PA-12** | **Aprobado** | `a9b02ab` |

---

## 2. Detalle de Ejecución de Casos de Prueba (Batería PA-01 a PA-12)

* **PA-01:** Verificación de inicio de sesión con usuario `coordinador` y clave `123`. Autenticación exitosa mediante SHA-256. Intento con clave incorrecta muestra error sin revelar existencia del usuario.
* **PA-02:** Creación de solicitud con prioridad Alta. El sistema despliega y exige justificación y fecha objetivo. Se crea con estado inicial `Nuevo`.
* **PA-03:** Verificación de aislamiento en Solicitante. Solo se listan solicitudes propias. La tabla exhibe la fecha de última actualización.
* **PA-04:** Ordenamiento en panel de Coordinador por fecha, estado y prioridad. Cambio de prioridad a Alta abre modal solicitando justificación y fecha objetivo.
* **PA-05:** Asignación de solicitud a `agente` (Activo). Se genera notificación visible en la campana superior del agente.
* **PA-06:** Registro de avance por parte del agente asignado. El comentario queda sellado con autor y fecha inmutables.
* **PA-07:** Verificación de transiciones: Agente inicia atención (`Nuevo` -> `En proceso`) y marca `Resuelto`. Intentos de saltar estados son bloqueados.
* **PA-08:** Solicitante abre solicitud resuelta. Al presionar "Reabrir con motivo", se exige el motivo y se registra en historial.
* **PA-09:** Filtro combinado en panel de Agente y Solicitante (Categoría + Prioridad + Estado). Resultados reactivos y coherentes.
* **PA-10:** Verificación del cálculo del Tiempo Mediano de Ciclo. Se constata la aplicación de la mediana estadística en lugar de la media.
* **PA-11:** Consulta de auditoría con usuario `auditor`. Se visualizan columnas estructuradas con actores codificados (`ACT-COO01`, `ACT-SOL01`, etc.) sin texto libre.
* **PA-12:** Descarga de CSV desde panel de Coordinador con filtro de categoría 'Hardware'. El archivo generado solo incluye las solicitudes filtradas y queda registrado el evento en auditoría.
