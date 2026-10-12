# v0.4 — Bitácora técnica: red de filamentos conectados

Fecha inicial: 2026-10-11. Estado: **prototipo de centros de línea en rama de desarrollo**, NO geometría apta para impresión.

## Hipótesis

Agrupar todos los trazos de sombra mediante puentes a un eje lateral ubicado fuera del campo proyectado permite obtener una red 3D topológicamente conectada con poca interferencia en la sombra visible. Es una estrategia inicial para verificar el pipeline, no la estética definitiva ni una solución de fabricación.

## Implementado en rama

- `src/connected-paths.js`: transforma barras de v0.3 en una red de ejes conectados por puentes y columna externa; calcula segmentos y permite proyección conjunta.
- Métricas binarias (IoU y fracción de píxeles discrepantes).
- Casos unitarios de red vacía, conectividad conceptual y métrica.

## Advertencias fundamentales

- **Conexión de centros de línea NO implica unión booleana de sólidos**. Las primitivas STL intersectadas pueden contener superficies internas y no ser estancas.
- Puentes laterales y columna pueden producir sombras espurias o quedar dentro del volumen de construcción.
- La representación actual es un grafo de segmentos, no una red de curvas suaves/optimizadas.
- La evaluación se debe hacer sobre el objeto completo y verificar unidades, penumbra, escala y perfil de impresión.
- El atributo `components:1` describe conectividad del **grafo idealizado**, no una validación de malla.

## Criterios pendientes antes del hito v0.4

1. Conexión de tubos en malla única, cerrada y sin auto-intersecciones.
2. Unión a una base y validación de adherencia y estabilidad.
3. Vista 3D orbitable y sombreado del sólido, no de líneas.
4. Simulador de oclusión de la malla final, más evaluación cuantitativa.
5. Test ejecutado en CI y registro del resultado.
6. Prueba de importación en slicer y prueba física documentada.

## Siguiente experimento

Proyectar juntas barras y puentes para medir cuánto error produce la columna externa. Adaptar el anclaje para mantener los puentes fuera del plano receptor visible. Después, construir una malla tubular verdaderamente fusionada y verificarla.

## Experimento adicional — unión volumétrica discretizada

**Estado:** implementado en código de la rama, pruebas escritas pero **no ejecutadas/verificadas en esta sesión**.

- `src/voxel-mesh.js`: rellena vóxeles alrededor de segmentos, extrae solo caras exteriores, produce triángulos orientados y STL ASCII.
- Diagnósticos: componentes de ocupación (adyacencia de 6 vecinos), bordes de malla con incidencia distinta de 2, límite de 2,5 millones de vóxeles para acotar memoria.
- `tests/voxel-mesh.test.mjs`: casos de tubo único, piezas separadas, unión en codo y límite de memoria.
- Interfaz de la rama: controles de resolución, botón de fusión y descarga solo cuando el diagnóstico preliminar da un componente y aristas pareadas.

**Advertencias:** una superficie voxelizada puede ser cerrada y tener todavía problemas de fabricación, orientación, estabilidad o uniones delgadas. El proceso puede bloquear brevemente la interfaz al ser síncrono; moverlo a Web Worker es pendiente. Las superficies de vóxel presentan escalones visibles. La vista 3D sigue esquemática y no representa la malla fusionada. El método aún no evalúa la sombra de la malla sólida; el STL no debe considerarse listo para imprimir.

## Experimento de visualización y sombra de malla (11/10/2026)

- Se incorporó `src/mesh-view.js` con una vista orbitable Canvas 2D de la malla fusionada (arrastrar para girar).
- Se dibuja la proyección de **cada triángulo de la malla**, en vez de basarse exclusivamente en barras y ejes. La escena usa luz puntual y plano receptor z=0.
- La interfaz reporta una comparación de píxeles entre esta proyección y la vista de referencia de máscara plana (IoU y diferencia binaria). La comparación es orientativa: incluso los diferentes tamaños físicos de referencia pueden introducir diferencias que no son errores geométricos de fabricación.
- Se escribieron `tests/mesh-view.test.mjs` con caja delimitadora y comprobaciones de proyección. **Ejecución en CI aún no verificada en esta sesión.**

**Límites:** el visor ordena caras por profundidad media (no tiene z-buffer preciso), no usa Three.js, puede mostrar artefactos de oclusión y puede consumir bastante CPU. La sombra es geométrica sin penumbra, sin iluminación extendida y sin análisis de estabilidad ni resistencia. No se ha hecho calibración física. El modo desarrollo todavía no se ha publicado en producción.

**Próxima tarea bloqueante:** probar CI/preview de la rama, corregir cualquier fallo, mover cálculos pesados a Worker, validar que proyección y geometría usen el mismo tamaño de receptor, optimizar el anclaje lateral y crear una base verificable antes de considerar terminada v0.4.
