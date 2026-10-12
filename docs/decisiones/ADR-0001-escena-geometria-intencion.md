# ADR-0001 — Separar escena, familia geométrica e intención visual

**Fecha:** 2026-10-12  
**Estado:** Aceptado conceptualmente.  
**Ámbito:** arquitectura y hoja de ruta; no implementación.

## Contexto

La aplicación busca construir objetos cuya sombra forma un retrato, con una identidad tridimensional distinta. Los primeros prototipos v0.3 y v0.4 trataron la generación como líneas y volumen. En la prueba manual v0.4 la fidelidad cayó de **84,2 % IoU en barras** a **38,3 % en barras conectadas** y **34,5 % en malla**. Aunque se obtuvo una superficie geométrica fusionada, el retrato dejó de ser reconocible. CI verde no detectó esa falla. El usuario aportó referencias de objetos geométricos dispersos y masas orgánicas sin parecido visual con su sombra, y propuso mover luz y pared interactivamente.

## Opciones evaluadas

1. **Continuar solo con filamentos y suavizarlos.** Descartada como plan exclusivo: no arregla conectores proyectados ni contempla instalaciones de elementos separados.
2. **Agilizar únicamente optimización sin editor de escena.** Insuficiente: la escena óptica es una variable física crítica y sus distancias no pueden quedar ocultas entre sliders independientes.
3. **Escena + familias + intención artística, con guías opcionales.** Elegida: separa grados de libertad físicos, geométricos y estéticos y admite distintas estrategias con el mismo evaluador.

## Decisión

Aprobar contrato de [arquitectura v3](../arquitectura-v3.md):

- Editar escena óptica mediante **vista 2D lateral interactiva** al principio, respaldada por coordenadas físicas 3D completas y controles numéricos.
- Incorporar familias **Franjas/listones variables**, **Primitivas dispersas**, **Filamentos**, **Volumen abstracto**.
- Incorporar intención de parecido **Reconocible**, **Abstracta**, **Oculta/no literal**, sujeta a evaluación formal futura.
- Conservar modos de guía **Libre**, **Segunda imagen** y **Modelo 3D** como otra dimensión, no reemplazarlos.
- Evaluar sombra de geometría total; fallar explícitamente si ninguna candidata cumple restricciones; no confundir «cerrada» con «imprimible».
- Mantener nombres y documentación para usuarios en español, conservando marca Shadow Portrait Studio.

## Consecuencias

**A favor:** scene-first, mejor trazabilidad, posibilidad de instalación modular y modos artísticos diversos, compatibilidad conceptual con v2.  
**En contra:** más combinaciones, costo computacional, complejidad en optimización y pruebas, y riesgo de confundir capacidades futuras con funciones ya implementadas.

### Restricciones y obligaciones

La vista 2D lateral no representa rotaciones completas 3D. Fuentes extendidas necesitan penumbra simulada. Los soportes/montajes forman parte de la sombra. Algunas combinaciones geométricas pueden no tener solución factible. La diferencia estética no puede prometerse sin criterio cuantitativo y revisión humana.

## Migración y pruebas

- Retener v2 como histórico. Publicar v3 como contrato vigente.
- Mantener `main` estable, sin fusionar v0.4 fallida.
- Reconciliar plan por versiones con esta decisión; nuevos desarrollos siguen arquitectura v3.
- Testear arrastre y modelo de escena, rayo–plano, métricas y regresión, interpretación de render de piezas múltiples y validación física.
- Documentar mediciones de usuario sin publicar fotos privadas.

## Evidencia

Capturas y mediciones aportadas por el usuario el 12/10/2026 en conversación: 84,2 % / 38,3 % / 34,5 % IoU según etapas, antes de incorporar un nuevo generador. Evidencia técnica adicional: [experimento v0.4](../experimentos/v04-red-filamentos.md) en rama de desarrollo. Las imágenes de inspiración son guía artística, no verificación técnica.
