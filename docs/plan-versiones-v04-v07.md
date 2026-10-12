# Plan técnico v0.4–v0.7 — Histórico, pendiente de replanificación

**AVISO (2026-10-12):** el orden de hitos de este plan quedó **en revisión** por [Arquitectura v3](arquitectura-v3.md) y [ADR-0001](decisiones/ADR-0001-escena-geometria-intencion.md). Prioridad nueva: editor de escena 2D y baseline Franjas antes de retomar conexiones complejas. Conservar este archivo sin reescribir su historia; preparar un nuevo plan detallado después de aprobar v3. La v0.4 conectada no pasó el criterio visual: caída de IoU 84,2 % → 38,3 % → 34,5 %.

Estado original: **plan propuesto y aprobado conceptualmente**; los hitos son metas, no prestaciones publicadas. Fecha: 2026-10-11. Fuente de verdad de arquitectura: `arquitectura-v2.md`.

## Línea base: v0.3 experimental

Existe un generador de barras 3D independientes, una proyección de referencia y exportación STL experimental. El usuario observó sombras prometedoras, pero la forma del objeto todavía no parece una escultura. No se realizaron pruebas físicas documentadas ni se verificó una geometría conectada imprimible. Conservar muestras y archivos de v0.3 como línea de comparación.

## v0.4 — Filamentos conectados y forma escultórica inicial

**Meta:** transformar segmentos flotantes en geometría con continuidad, preservar una sombra reconocible y producir STL etiquetado según su validación.

Tareas:
1. Definir coordenadas y unidades de la escena de punta a punta.
2. Construir un grafo de segmentos y puntos de unión. Estudiar recorridos continuos con curvas Bézier/splines y puentes en zonas de mínima importancia visual.
3. Añadir base opcional y anclajes; incluir cada conexión en la simulación.
4. Implementar generación de malla tubular con tapas y uniones resistentes, no mera superposición de STL independientes.
5. Validar conectividad, estanqueidad y espesor; registrar advertencias sobre voladizos.
6. Añadir visor 3D orbitable y superposición de diferencia entre sombra objetivo y sombra calculada del **objeto completo**.

**Criterios de aceptación:** fixture de silueta simple; una malla conectada y cerrada según validador independiente; prueba automatizada de exportación-reimportación sin pérdida de escala; métricas de sombra antes y después de puentes; comparación visible y no engañosa. La etiqueta «lista para imprimir» exige revisión de slicer/perfil y prueba física; si no, usar «prototipo geométrico».

**Riesgos:** uniones que introducen sombras espurias; exceso de puentes; autopuntos/intersecciones; fragilidad FDM. **Salida alternativa:** permitir soluciones de varias piezas con ensamblaje explícito, sin fingir continuidad.

## v0.5 — Escultura libre y estilos

**Meta:** ofrecer los estilos ordenado, geométrico, orgánico, caótico, minimalista y ramificado bajo el modo **Escultura libre**, independientemente de representación filamentos/volumen. Empezar con filamentos; motor volumétrico puede tener un prototipo separado.

Tareas:
1. Definir parámetros observables por estilo: curvatura, densidad, simetría, profundidad, regularidad, ramificación.
2. Crear generadores deterministas con semilla y control de variaciones.
3. Añadir ponderaciones de fidelidad de sombra / estética / restricciones físicas.
4. Buscar candidatas por iteraciones acotadas y presentar comparación de al menos dos variantes.
5. Guardar métricas, tiempo de ejecución y parámetros para reproducibilidad.

**Criterios:** mismo objetivo + misma semilla + configuración => misma candidata dentro del mismo motor y versión; estilos producen geometrías comparativamente diferentes; la evaluación de sombra se ejecuta sobre la geometría completa; UI distingue intento optimizado de éxito físico.

**Riesgos:** estilos poco diferenciables, resultados estéticamente arbitrarios, tiempo excesivo. **Mitigación:** presets transparentes y progreso/cancelación.

## v0.6 — Escultura guiada por imagen

**Meta:** una segunda imagen inspira la apariencia de la escultura sin sustituir la imagen de sombra.

Tareas:
1. Cargador de dos imágenes independientes con rótulos y vista previa persistentes.
2. Procesamiento 2D de la referencia: silueta, contornos y esqueleto (según tipo elegido).
3. Configurar vista desde la cual la pieza debe recordar la referencia (no inferir un 3D único).
4. Generación inicial por filamentos ajustados a envolvente/curvas extraídas y evaluación de forma explícita.
5. Control **Prioridad de sombra ↔ Prioridad de forma** y reporte de compromiso.

**Criterios:** pruebas con siluetas simples distintas; el usuario puede demostrar que cambiar solo imagen de forma cambia la pieza sin reemplazar el objetivo de sombra; las dos fidelidades tienen métricas separadas; mensajes claros cuando no existe solución aceptable.

**Riesgos:** imágenes contradictorias, referencias con fondo complejo, falsas promesas de parecido 3D. **Mitigación:** límites de complejidad y vista de evaluación fija declarada.

## v0.7 — Escultura guiada por modelo 3D

**Meta:** importar una malla simple para guiar una modificación controlada capaz de aproximar la imagen de sombra.

Tareas:
1. Importador STL/OBJ/GLB con límites de tamaño, cantidad de triángulos y validación de formato.
2. Normalización de escala/unidades y orientación, copia inmutable del original.
3. Definir región y presupuesto de deformación, preservando identidad general del volumen.
4. Explorar deformación de superficie, cavidades/perforaciones y adición de nervaduras; optimización por iteración.
5. Comparar forma de entrada / resultado / sombra; revisión de autointersecciones, topología y espesores.

**Criterios:** al menos dos fixtures 3D simples y dos objetivos binarios; importación y exportación con unidades explícitas; informe de diferencia formal y de sombra; ninguna geometría inválida etiquetada como imprimible; pruebas de regresión reproducibles.

**Riesgos:** problemas inversos incompatibles, complejidad alta, mallas abiertas, operaciones booleanas frágiles. **Mitigación:** casos restringidos primero; admitir la ausencia de solución.

## Línea paralela: motor volumétrico

No confundir la secuencia de versiones con la eliminación del segundo motor. El motor de **volumen** tiene contrato independiente y trabajo de investigación continuo: vóxeles, regularización, conectividad, conversión a malla y evaluación de sombras. Puede publicar pruebas detrás de una opción experimental; no se habilitará como completado por la mera presencia del selector.

## Estrategia transversal de pruebas

- Unitarias: proyección puntual, unidades, correspondencia inversa, curvas/mallas y exportación.
- Integración: foto -> máscara -> generador -> simulación -> STL -> reimportación.
- Regresión: fixtures públicos sin datos personales; imagen ideal, imagen simulada, métricas y semilla.
- Física: misma luz/distancias registradas, fotos de sombra y pieza, comparación con simulación y perfil FDM.
- Rendimiento: presupuesto de memoria/tiempo en móvil y escritorio; cancelar cálculos sin congelar interfaz.

## Definición de terminado

No declarar versión completa sin: funcionalidades demostrables, tests ejecutados con resultados, documentación de limitaciones actualizada, instrucciones reproducibles, despliegue identificado por commit y checklist de aceptación firmado con evidencia. Un commit publicado o un deploy exitoso **no** equivalen a verificación funcional.

## Secuencia de ejecución inmediata

1. Inventariar limitaciones de v0.3 (barras desconectadas y proyección de referencia).
2. Implementar grafo de conexión y malla tubular v0.4.
3. Proyectar sombra de malla completa y añadir comparación cuantitativa.
4. Validar STL y ejecutar prueba física antes de promover la etiqueta «imprimible».
5. Después avanzar sobre presets de estilo, segunda imagen y malla guía.

Los hitos pueden dividirse en versiones menores; cualquier cambio de alcance debe dejar registro de decisión.
