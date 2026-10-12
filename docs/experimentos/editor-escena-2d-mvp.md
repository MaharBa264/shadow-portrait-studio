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
