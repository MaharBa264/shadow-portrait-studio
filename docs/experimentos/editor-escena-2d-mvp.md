# Experimento — Editor de escena lateral 2D (MVP)

**Fecha:** 2026-10-12  
**Estado:** implementado en rama de desarrollo, revisión manual y despliegue de preview pendientes.  
**Contrato:** [Arquitectura v3](../arquitectura-v3.md), [ADR-0001](../decisiones/ADR-0001-escena-geometria-intencion.md).

## Alcance implementado

- Vista lateral en Canvas 2D: pared fija `z=0`, luz puntual y sección del volumen de objeto.
- Arrastre de fuente de luz (horizontal del dibujo = profundidad Z, vertical = desplazamiento lateral X).
- Arrastre del objeto con restricciones geométricas; sincronización bidireccional con sliders numéricos.
- Cono de rayos límite proyectado sobre la pared y cotas de la escena.
- Restablecer escena y validación básica de parámetros.
- Cuando la escena cambia, se invalida cualquier STL de barras anterior.
- El cambio lateral de la pieza modifica tanto el cálculo de sombra de máscara plana como las coordenadas X de barras nuevas.
- Se conserva el esquema JSON 0.3, con clave opcional `editorSceneVersion` y `scene.objectX` para compatibilidad experimental.

## Convención de ejes y límites

El diagrama representa un corte lateral abstracto X–Z (Z en horizontal del dibujo, X en vertical), con pared a Z=0; no es una vista perspectiva ni representa eje Y. La luz usa `lightX,lightZ`, la pieza `objectX,objectZ`. El eje de pared permanece fijo en esta etapa para no simular un grado de libertad que aún no está implementado; no se puede arrastrar la pared todavía. La región visual de la pieza es representativa, no una malla.

La máscara ideal usa tamaño virtual fijo de 160 mm en un receptor de 300 mm. La escultura de barras es un baseline experimental: **mover la pieza cambia su sombra, no optimiza el objeto para conservar el objetivo**.

## Pruebas escritas

`tests/scene-editor.test.mjs`: posiciones esperables pared–pieza–luz, hit-test y arrastre, cambio de proyección por desplazamiento de objeto. El workflow de GitHub ejecuta `npm test` y `npm run build`; verificar su resultado para el último commit antes de merge.

## Pendientes y criterios de aceptación

1. Confirmación CI verde, luego prueba real en Firefox/Chrome y móvil.
2. Comprobar arrastre de luz/pieza, actualización de sliders y de máscara, restablecimiento.
3. Precisar que los rayos y el rectángulo son una idealización y que no existe fuente extendida.
4. Permitir edición real del plano receptor con origen y normal arbitrarios solo después de ampliar la formulación rayo-plano.
5. Añadir anchos/alturas y límites explícitos del volumen, cuadrícula escalable y precisión de controles.
6. Integrar una sombra real del sólido en vez de únicamente la máscara ideal y de las barras.
7. Resolver el límite de arrastre y valores numéricos en los rangos del MVP, y no validar impresión a partir de esta escena.

**No significa terminación del hito del editor completo; es MVP de la vista lateral con pared fija.**

## Iteración 2: zona de proyección y escala visible (12/10/2026)

**Validación manual comunicada:** el usuario abrió la vista previa de Cloudflare de la rama y confirmó que **la luz y la pieza se mueven correctamente** mediante arrastre. También se observó una superposición de rótulos «Pared» y «Pieza». Esa prueba valida arrastre básico en el navegador utilizado, pero no equivalencia óptica física.

**Cambios implementados:**
- Función pura `shadowFootprint(scene)`: calcula factor de aumento de la luz puntual, centro y ancho del intervalo de sombra de la sección idealizada del objeto en el receptor z=0.
- El plano receptor muestra zona útil en azul y huella proyectada en verde, o rojo si excede la zona útil.
- Etiquetas de Pared/Pieza/Luz ancladas a ubicaciones distintas para evitar superposición.
- El panel de datos indica tamaño proyectado, posición del centro, distancias y si la sombra cabe en la zona disponible.
- Tests para factor de aumento, desplazamiento lateral y luz a distinta distancia.

**Límite físico esencial:** «huella proyectada» significa el intervalo geométrico de la **sección abstracta del volumen permitido**, NO la silueta calculada de la escultura y tampoco la fotografía real de una pared. No implica que los píxeles oscuros del retrato se adapten automáticamente al mover la luz. El receptor sigue fijo en z=0, se usa fuente puntual y se omite la tercera dimensión.

**Pendiente:** confirmar CI para el último commit, revisar la vista previa en navegador, ajustar el diseño responsivo y recién entonces planificar edición de la pared y orientación real del receptor.

### Incidente de integración: variable lateral no declarada

GitHub Actions run **#43**, ID `38313707105`, falló en `npm test`: 3 pruebas de `generator-lines.test.mjs` encontraron `ReferenceError: objectX is not defined`. El desplazamiento lateral había sido usado en `generateLineBars` sin desestructurar el parámetro opcional. El 12/10/2026 se publicó la corrección en commit `cd1402a671cf3976eca87b4f026ef09effe08556`, con `objectX=0` para preservar el comportamiento de v0.3. **Esperar la nueva ejecución de CI; no describir como tests aprobados hasta confirmación.**

El usuario ya validó por navegador el arrastre básico de la versión previa del editor; todavía no validó la visualización de huella ni la corrección del generador.
