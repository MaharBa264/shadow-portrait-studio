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

## Corrección de referencia óptica y pruebas pendientes (11/10/2026)

Se detectó un sesgo conceptual en la comparación anterior: la proyección del sólido ocupaba un receptor visible de 300 mm, mientras la máscara ideal se calculaba como una placa de 160 mm a profundidad intermedia, ampliada según la posición de la luz. Como los filamentos v0.3 se generaron inversamente para una **sombra objetivo de 180 mm en el receptor**, comparar con aquella placa daba una puntuación no comparable.

**Corrección incorporada en la rama:** `drawTargetOnReceiver` coloca la imagen objetivo directamente en el plano receptor, centrada y con tamaño físico de 180 mm sobre un cuadro de 300 mm. La métrica IoU ahora compara la sombra de los triángulos contra esa referencia, con el mismo sistema de coordenadas. Se añadieron tests de escala y parámetros inválidos.

La corrección es una decisión óptica explícita: la referencia de 180 mm corresponde a la sombra final, **no** a una máscara real ubicada en el objeto. No resuelve el problema de estetizar la escultura ni de verificar físicamente la iluminación.

**Pendiente de verificación:** ejecutar CI en la rama y pruebas de navegador para confirmar el cambio. No se declara aprobado por el mero commit. Continuar con render acelerado/Worker, suavizado de malla, base y evaluación de manufacturabilidad.

## Revisión de seguridad del editor (12/10/2026)

Se añadió control explícito de vigencia de la malla. Al modificar el tamaño del vóxel se invalidan el resultado anterior, la vista sólida, la proyección y la habilitación de descarga. La exportación comprueba nuevamente el diagnóstico y exige un solo componente de ocupación, además de la comprobación preliminar de superficie cerrada.

**Límite de esta mitigación:** el diagnóstico actual `validateSurface` solo cuenta incidencia de aristas no orientadas; no comprueba intersecciones globales, orientación coherente, calidad de triángulos, resistencia mecánica, dimensiones reales ni accesibilidad de soportes. La UI debe mantener la leyenda «experimental».

**Estado de pruebas:** casos automáticos versionados en GitHub; no hay evidencia de ejecución satisfactoria revisada aquí. No fusionar a `main` hasta contar con señal CI o ejecución reproducible y revisión en navegador.

## Confirmación de CI y puerta de vista previa (12/10/2026)

Se consultó GitHub Actions para el commit `d13dae4e28d83d0a164b2ac7378f00582863ccae`. Workflow **Validate web prototype**, run **#21**, ID **38246740241**, estado `completed`, conclusión `success`. Esta evidencia confirma el resultado del workflow (pruebas de Node y compilación estática), **no** una prueba en navegador ni la validez de fabricación de las mallas.

El despliegue de vista previa de Cloudflare Pages para la rama `feature/v0.4-connected-filaments` **no está confirmado**. Antes de dar por publicada la v0.4 de prueba, verificar en Cloudflare Pages > Deployments que exista un preview deployment con el commit correcto. No realizar merge en main solamente para obtener una URL de prueba. El PR #1 permanece en borrador.

### Checklist para prueba manual de preview

1. Abrir la URL de preview que Cloudflare indique explícitamente y anotar commit y fecha.
2. Cargar imagen simple de alto contraste; generar filamentos y fusionar malla.
3. Girar el sólido con mouse/táctil; comprobar que no se congela ni queda en blanco.
4. Observar sombra proyectada y métrica IoU en el mismo plano de referencia.
5. Modificar resolución: vista y exportación previas deben invalidarse.
6. Verificar que STL fusionado solo se habilita con diagnóstico preliminar válido; abrirlo en laminador sin interpretar esto como prueba de impresión.
7. Repetir en escritorio y teléfono. Registrar errores, modelo de dispositivo y tiempo aproximado.

## Prueba visual de usuario: v0.4 rechazada (12/10/2026)

**Evidencia:** el usuario abrió la vista previa de Cloudflare e informó que el resultado se veía como barras dispuestas en una sinusoide, sin forma escultórica reconocible y sin sombra convincente. Este resultado prevalece sobre el éxito del CI: los tests no miden calidad estética ni fidelidad óptica real.

**Causa identificada en código:** `generateLineBars` asigna `z = objectZ + sin(row / rows * 6π) * depthVariationMm`. Esa sinusoide fue una heurística sin vínculo con la imagen ni criterios estéticos. La v0.4 agrega puentes y voxelizaciones, pero no optimización del resultado.

**Mitigación inmediata publicada en la rama:** desactivar la variación sinusoidal de profundidad para las llamadas de la interfaz (`depthVariationMm: 0`). Esto elimina el patrón injustificado, **NO soluciona la apariencia escultórica ni garantiza la sombra**, y reduce temporalmente la diversidad tridimensional. No se considera la v0.4 aprobada.

**Siguiente criterio de aceptación imprescindible:** implementar un ciclo de evaluación sombra objetivo vs. sombra de la malla, con umbral y rechazo por baja similitud; visualizar la diferencia; evaluar conectores con y sin puentes; diseñar un nuevo generador guiado por rasgos de imagen que no use sinusoides arbitrarias. Evitar fusionar en main hasta que un ejemplo sencillo supere visualmente el criterio. Se requiere captura, parámetros y puntuaciones de una ejecución reproducible para investigar la falla de sombra.

## Banco óptico de cuatro etapas (12/10/2026)

**Motivación:** la prueba visual del usuario no reconoció el retrato en la sombra de v0.4. La iteración no pasa el criterio funcional básico y no debe fusionarse a producción.

**Implementación en rama:**
- `src/optical-bench.js`: proyección de segmentos bajo una única luz puntual y escala común; cálculo de IoU, píxeles negros extra y faltantes; indicador de primera pérdida de más de 8 puntos de IoU.
- `index.html` y `src/main.js`: panel con (1) objetivo escalado a receptor 300 mm con imagen deseada de 180 mm, (2) barras originales, (3) barras + puentes y columna, (4) malla fusionada.
- `tests/optical-bench.test.mjs`: contraste de máscaras, falso positivo, localización de caída y rechazo de geometría fuera de la luz.

**Interpretación:** si la etapa 2 ya falla, investigar muestreo de filas, longitud/ancho de barras y escala. Si la etapa 3 falla respecto de la 2, conexiones y columna agregan sombra. Si la etapa 4 falla respecto de la 3, revisar voxelización y proyección de triángulos. Un descenso mayor a 0,08 en IoU es solo alerta diagnóstica, **no una condición suficiente de aceptación**. Aún no hay un umbral empírico calibrado para afirmar que un retrato es reconocible.

**Advertencia sobre el banco:** la etapa 2 y 3 aproximan filamentos como trazos de grosor proyectado; la etapa 4 rasteriza caras de malla. Las diferencias entre estos dos métodos pueden introducir variaciones. La oclusión y el acabado óptico reales todavía requieren pruebas físicas.

**Estado:** código y pruebas publicados en rama de desarrollo; resultados del último workflow **pendientes de consultar** y prueba visual **pendiente de repetir**. Mantener `main` en v0.3.

### Evidencia de CI del banco óptico

Para el commit `84b83ec699aceca00f5d37a60edfbe052b77430f` se verificó el workflow **Validate web prototype**, run **#28**, ID **38308494501**, estado `completed`, conclusión `success`. Este run valida el código y los tests del banco óptico agregados hasta ese commit. El cambio posterior es documentación. **No equivale a validación de navegación visual ni a resultado físico.**
