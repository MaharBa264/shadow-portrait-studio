# Contrato vivo de documentación

Estado: **vigente desde 2026-10-11**. Este archivo formaliza la decisión de conservar y enriquecer documentos Markdown detallados dentro del repositorio como memoria técnica del proyecto.

## Reglas obligatorias

1. **GitHub es el registro técnico de referencia.** Toda decisión de arquitectura, algoritmo, cambio de alcance o hallazgo relevante se documentará dentro de `docs/`, mediante archivos Markdown versionados junto al código.
2. **El producto habla español.** Nombre propio Shadow Portrait Studio; etiquetas de modos, configuraciones, ayuda, mensajes y documentación explicativa en español. Nombres de identificadores internos/formatos/librerías pueden estar en inglés.
3. **No inventar progreso.** Distinguir expresamente: *idea*, *propuesta*, *decisión*, *implementado en código*, *prueba automatizada ejecutada*, *validado manualmente*, *verificado con impresión física*. Los estados requieren evidencias concretas.
4. **Preservar historia.** No borrar documentos históricos porque exista una revisión más nueva. Señalar en cabecera «sustituido por...» cuando corresponda, con enlace; evitar reescribir el pasado.
5. **Contratos verificables.** Cada documento técnico de implementación incluye propósito, alcance/no alcance, interfaces y unidades, algoritmos, limitaciones, riesgos, criterios de aceptación, pruebas y dependencias.
6. **No confundir STL con imprimibilidad.** Todo exportador indica si el resultado es exploratorio, verificado geométricamente o probado físicamente.
7. **Cambios de arquitectura documentados antes o junto a implementación.** Introducir ADR para decisiones irreversibles o incompatibles. Las alternativas descartadas se registran con motivos.
8. **Trazabilidad de releases.** Registrar commit/tag, estado de CI, despliegue y pruebas manuales. Si no hay evidencia, indicar «no verificado».
9. **Privacidad.** No subir retratos personales, mallas privadas, secretos, tokens ni fotografías de terceros sin permiso a fixtures, issues o documentación.
10. **Mantenimiento:** cuando una sesión alcance una decisión o implementación, actualizar el MD relevante y el índice documental; las tareas nuevas se consignan en el plan correspondiente.

## Estructura mínima

- `README.md`: introducción, estado actual y enlaces.
- `docs/arquitectura-v2.md`: contrato de diseño vigente.
- `docs/plan-versiones-v04-v07.md`: hitos y aceptación.
- `docs/contrato-documentacion.md`: presente contrato.
- `docs/decisiones/`: ADR numerados, cuando haya decisión significativa.
- `docs/experimentos/`: hipótesis, métodos, fixtures y mediciones cuando existan.
- `docs/pruebas/`: actas físicas y métricas cuando existan.
- `docs/architecture.md`: documento fundacional histórico; conservar.

## Plantilla de ADR

```md
# ADR-000X — Título
Fecha:
Estado: Propuesto | Aceptado | Sustituido
Contexto:
Opciones evaluadas:
Decisión:
Consecuencias y riesgos:
Plan de migración:
Evidencias y enlaces:
```

## Registro inicial de decisiones

- ADR inicial A: nombre de producto en inglés, experiencia y documentación en español.
- ADR inicial B: **Escultura libre**, **Escultura guiada por imagen**, **Escultura guiada por modelo 3D** como modos de intención; **Filamentos** y **Volumen** como representación ortogonal.
- ADR inicial C: evaluar el objeto físico completo y no declarar impresión validada sin prueba.

Estas decisiones se formalizan en `docs/arquitectura-v2.md`. Se abrirán ADR individuales si hay que reconsiderarlas.

## Arquitectura vigente (actualización 2026-10-12)

Contrato vigente: [arquitectura-v3.md](arquitectura-v3.md). Decisión formal: [ADR-0001](decisiones/ADR-0001-escena-geometria-intencion.md). La arquitectura v2 y el plan v0.4–v0.7 se conservan como históricos, y el trabajo experimental de la rama v0.4 no constituye una función aprobada.

## Actualización del estado

Cada hito debe consignar: fecha, commit, pruebas realmente ejecutadas, observación de usuario y pendientes. No alterar el estado de un hito basándose únicamente en la existencia de código fuente.
