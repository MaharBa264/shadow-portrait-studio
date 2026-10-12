# Contrato de arquitectura v3 — Escena, geometría e intención artística

**Proyecto:** Shadow Portrait Studio  
**Fecha:** 2026-10-12  
**Estado:** decisión de arquitectura aprobada conceptualmente. **No describe funciones ya implementadas.**  
**Idioma público:** español; se conserva el nombre propio Shadow Portrait Studio.  
**Sustituye como contrato vigente:** [arquitectura-v2.md](arquitectura-v2.md), que permanece como documento histórico.

## 1. Visión artística no negociable

Construir una herramienta libre y local-first que encuentre esculturas tridimensionales capaces de proyectar una **imagen reconocible elegida por el usuario** cuando se iluminan bajo una configuración concreta. **La escultura puede —y en ciertos modos debe— parecer completamente distinta de la imagen que revela su sombra.**

La obra tiene dos lecturas: la forma tridimensional autónoma y la imagen bidimensional proyectada. Ninguna debe deducirse automáticamente de la otra. La solución no tiene por qué ser una pieza monolítica: módulos separados, fijaciones, soportes transparentes, objetos ensamblados o instalaciones sobre pared son alternativas válidas **si se describen sus restricciones**.

Referencias visuales aportadas por el usuario: (a) varias primitivas geométricas separadas que en conjunto producen una silueta, y (b) un volumen orgánico y aparentemente caótico cuya sombra revela una figura. **Son referencias de intención artística, no especificaciones geométricas ni pruebas de fabricabilidad.** No incorporar a GitHub las fotografías personales de prueba ni las imágenes de referencia sin revisar autoría/licencias.

## 2. Tres dimensiones ortogonales de configuración

Una configuración no se reduce a «modo filamentos» o «modo volumen». Separar **escena óptica**, **familia de geometría** e **intención formal**. Adicionalmente, conservar la **fuente de referencia formal** definida en v2.

### 2.1 Eje A — Escena óptica

El usuario define físicamente fuente de luz, volumen permitido del objeto, plano receptor/pared y ubicación relativa. La escena es **fuente de verdad compartida** por todos los algoritmos. La imagen objetivo se interpreta **sobre el receptor**, no como una máscara situada arbitrariamente dentro del volumen.

### 2.2 Eje B — Familia de generación

| Familia (nombre visible) | Idea | Resultado y límite |
|---|---|---|
| **Franjas / listones variables** | Recorridos horizontales, verticales o mixtos; amplitud/espesor/separación variables | Referencia reproducible de sombra. Puede delatar la imagen desde ciertos ángulos y requerir montaje |
| **Primitivas dispersas** | Bloques, cilindros, prismas, cuñas, sectores curvos, separados u orientados | Busca una segunda lectura espacial. No garantiza que una colección de sólidos opacos aislados produzca detalles arbitrarios |
| **Filamentos** | Caminos y curvas tridimensionales, unidos o ensamblados | Favorece tramas orgánicas; conexiones pueden tapar blancos |
| **Volumen abstracto** | Masa, vacíos, nervaduras y topologías no triviales | Mayor complejidad geométrica, óptica y de fabricación |

«Franjas» no reemplaza «Filamentos»; tiene objetivos y parámetros propios. Las **barras por filas v0.3** son un prototipo relacionado, no implementación definitiva del nuevo modo Franjas. «Primitivas dispersas» **no es** una colección de objetos colocados al azar: se eligen y orientan según su proyección. Las familias pueden evolucionar a sistemas híbridos.

### 2.3 Eje C — Intención formal (grado de ocultamiento)

- **Reconocible:** la forma del objeto puede recordar la imagen proyectada.
- **Abstracta:** la forma mantiene composición escultórica propia y alude indirectamente a la imagen.
- **Oculta / no literal:** se penaliza que el objeto recuerde visualmente a la sombra desde vistas ordinarias, manteniendo una forma artística autónoma.

Un deslizador «**Parecido visible entre escultura y sombra**» podrá controlar esta preferencia. **No es una magnitud física universal**; exige definir desde qué ángulos se evalúa la similitud y con qué descriptor. Debe marcarse experimental hasta disponer de un evaluador. El parecido cero no se promete: una sombra concreta impone restricciones geométricas.

### 2.4 Fuente de guía formal, conservada de v2

- **Escultura libre:** sin guía adicional; puede combinarse con estilo.
- **Guiada por segunda imagen:** la otra imagen inspira siluetas/curvas desde una vista explícita.
- **Guiada por modelo 3D:** un modelo importado inspira masa y proporciones dentro de una tolerancia de deformación.

La guía de forma, el ocultamiento y la familia son parámetros diferentes. Por ejemplo: «Primitivas dispersas + segunda imagen de árbol + ocultamiento alto + sombra de rostro». No implicar que todas las combinaciones son factibles o estarán disponibles en cada versión.

## 3. Editor de escena óptica 2D — prioridad inmediata

**Decisión:** incorporar un editor interactivo de escena antes de seguir prometiendo escultura lista para imprimir.

### 3.1 Vista inicial

Plano de **perfil X–Z** (más adelante, planta Y–Z o vista perspectiva): pared sobre `Z=0`, fuente de luz con `Z>0`, objeto entre ambos. El dibujo muestra:

- fuente de luz arrastrable y sus coordenadas;
- sección del **volumen permitido**, arrastrable y dimensionable (sin mover automáticamente la geometría ya creada);
- plano receptor arrastrable en profundidad, dimensiones y región útil;
- rayos límite y punto/área aproximada de incidencia;
- medidas en milímetros, distancia fuente–pared, fuente–pieza, pieza–pared;
- controles numéricos equivalentes para precisión y accesibilidad;
- límites y avisos (fuente detrás de pared, geometría fuera de cono, fuente dentro del objeto, intersección, distancias inválidas).

**La vista 2D no es un simulador físico completo ni suficiente para definir orientación en 3D.** El perfil deja oculto el desplazamiento lateral y la inclinación del receptor; por eso el MVP mantendrá `Y=0` y planos paralelos al receptor, con una configuración completa y versionable debajo. La vista de planta, rotaciones y luz extendida llegarán después. La interfaz no debe aparentar que el usuario controla grados de libertad que aún no existen.

### 3.2 Interacción y actualización

- Arrastrar mueve el elemento; mostrar durante arrastre coordenadas y distancias. Opcional snap configurable.
- Cambios sincronizados entre drag, controles numéricos, modelo y previsualización.
- Si se mueve luz u objeto después de generar, **la sombra anterior deja de ser válida**. Se puede actualizar la sombra de la geometría congelada para ver el efecto, pero la nueva geometría optimizada requiere regeneración explícita.
- Debounce/progreso/cancelación y Web Worker para cálculos intensivos; no congelar UI.
- Permitir «restablecer escena», «bloquear fuente», «bloquear pared» y exportar/importar configuración versionada.
- En viewport se distingue el **objetivo en el receptor**, la sombra realmente simulada y su diferencia, siempre con el mismo sistema de unidades.
- Para producción artística, permitir guardar la posición de luz como requisito de instalación y mostrar tolerancia a errores de montaje.

### 3.3 Modelo geométrico y óptico

Convención MVP: origen en centro del receptor; pared `z=0`, normal `+z`, eje `x` horizontal, `y` vertical, unidades **mm**; luz puntual `L=(Lx,Ly,Lz)`; objeto con `0<z<Lz`. Para punto `P`, la intersección del rayo `L→P` con el plano es:

`t = Lz / (Lz - Pz)` y `Sxy = Lxy + t (Pxy - Lxy)`.

La fórmula anterior presupone receptor plano `z=0`, orientación fija y emisor puntual. Para planos arbitrarios se implementará intersección general rayo–plano con chequeo de paralelismo y orientación. El tamaño y escala de imagen objetivo **son mm sobre pared**, no mm sobre objeto.

Variar el ángulo de la luz es distinto de rotar el sólido: exigir transformación matricial/normal de receptor cuando existan rotaciones. Para fuente de área, integrar muestras del emisor y simular penumbra; no representar sombra puntual como validación física de una lámpara extensa.

## 4. Contratos de software propuestos (no implementados)

```ts
type FamiliaGeometrica = 'franjas'|'primitivas'|'filamentos'|'volumen';
type IntencionVisual = 'reconocible'|'abstracta'|'oculta';
type GuiaFormal = 'libre'|'imagen'|'modelo-3d';
type EstadoValidacion = 'idea'|'experimental'|'validado-geometricamente'|'probado-fisicamente';

interface EscenaOpticaV3 {
  unidades: 'mm';
  luz: {tipo:'puntual'|'area'|'direccional'; posicion:[number,number,number]; dimensionMm?:number};
  receptor: {origen:[number,number,number]; normal:[number,number,number];
    ejeHorizontal:[number,number,number]; anchoMm:number; altoMm:number};
  volumenPermitido: {centro:[number,number,number]; dimensiones:[number,number,number]; orientacion?:number[]};
  configuracionMontaje?: {toleranciaPosicionMm:number; toleranciaAnguloGrados:number};
}
interface ConfiguracionGeneracionV3 {
  schemaVersion:'3';
  escena:EscenaOpticaV3;
  imagenSombra:{anchoPx:number;altoPx:number;anchoMm:number;altoMm:number};
  familia:FamiliaGeometrica;
  intencion:IntencionVisual;
  guia:GuiaFormal;
  parecidoVisual:number; // 0..1, semántica pendiente de calibración
  semilla:number;
  fabricacion:{proceso:'FDM'|'SLA'|'corte'|'instalacion'; material?:string};
}
interface ResultadoEvaluacion {
  fidelidadSombra:{iou:number;falsosPositivos:number;falsosNegativos:number};
  fidelidadForma?:number;
  similitudVisualDesdeVistas?:number;
  componentes:number;
  superficieCerrada?:boolean;
  estado:EstadoValidacion;
  restriccionesIncumplidas:string[];
  evidencia?:string[];
}
```

Separar persistencia del proyecto, referencias originales y generación candidata. Los tipos son contrato conceptual, no código existente; no romper JSON 0.3 sin migrador.

## 5. El motor común obligatorio

```text
Imagen de sombra ─┐
Escena óptica ────┼──> Construcción de candidatos (familia + guía + intención)
Guía de forma ────┘                        │
                                          ▼
                                 Geometría candidata
                                          │
                    ┌─────────────────────┴───────────────────┐
                    ▼                                         ▼
             Simulación óptica                       Análisis de estructura
                    │                                         │
                    └────────────> Evaluación <───────────────┘
                                         │
                                  Aceptar / rechazar
                                         │
                             Exportación y plan de montaje
```

**Invariante:** la sombra se evalúa usando la geometría **completa**: soportes, uniones, base, fijaciones y objetos separados. Nunca aceptar una optimización solo porque mejora la sombra de barras idealizadas. Exponer comparación: objetivo, elementos independientes, conexiones y modelo final; calcular IoU/errores y variación de etapa con la misma escala de receptor. Ante deterioro, mostrar causa y bloquear la etiqueta «válido».

### Limitación física clave

Todas las regiones oscuras de una sombra binaria por oclusión deben estar cubiertas por proyecciones de material opaco; los píxeles blancos requieren **ningún bloqueador a lo largo de los rayos correspondientes**. No hay garantía de acomodar una malla que conserve cualquier otra forma y reproduzca una sombra arbitraria. Configuraciones con requisitos contradictorios deben admitir respuesta: **«no se encontró una solución dentro de estas restricciones»**.

La escena determina dónde puede colocarse material sin modificar la sombra, pero mover la pieza **no garantiza preservar el objetivo**: si cambia la luz, pared o el sólido, hay que recalcular su proyección. Los grados de libertad disponibles a lo largo de cada rayo permiten distribuir profundidad, pero no libertad geométrica ilimitada.

## 6. Reglas particulares de los generadores

### 6.1 Franjas / listones variables

Generar bandas orientadas horizontal, vertical o mixtas, con espesor/ancho variable **en función del objetivo de sombra y de la proyección**, no por una sinusoide ornamental fija. Optimizar continuidad de bandas, separación, mínimo detalle representable, solidez y número de elementos. Empezar con referencia plana predecible, después variar profundidad a lo largo de los rayos y permitir ensamblaje. Comparar sombras **antes y después** de dar espesor real.

### 6.2 Primitivas dispersas

Catalogar piezas simples y su proyección paramétrica (posición XYZ, orientación, dimensiones). Usar búsqueda iterativa sobre un presupuesto de piezas y volumen, minimizando error de sombra y maximizando legibilidad/composición tridimensional. Permitir montaje espacial, incluso elementos no conectados, con soportes/fijaciones documentados. Objetivos simples antes de retratos detallados. Comparar variante «sin soportes» vs «con todos los soportes».

### 6.3 Filamentos

Generar caminos ligados a rasgos del objetivo y/o a preferencias formales, no barridos sinusoidales sin información. Uniones deben evitar regiones blancas proyectadas; pueden estar detrás de material que **ya** oculta el mismo conjunto de rayos. El conector horizontal global actual queda expresamente **descartado como solución general**; usar ruteo ópticamente penalizado, estructuras modulares o estrategias híbridas. Comprobar sombra después de cada paso.

### 6.4 Volumen abstracto

Partir de vóxeles/campo implícito/mallas que permitan perforaciones y regularización. Integrar evaluador de proyección y topología en ciclo de optimización. No asumir que una malla watertight es imprimible.

## 7. Optimización multobjetivo y criterios de aceptación

Minimizar simultáneamente:
- **Error de sombra**: falsos positivos y negativos, IoU y errores localizados que afecten rasgos clave.
- **Error de forma** (cuando exista referencia): silueta desde vistas especificadas o distancia geométrica.
- **Parecido no deseado** entre objeto y retrato (modo oculto), estimado desde **vistas de observación definidas**.
- **Costos físicos**: espesor mínimo, estabilidad, conectividad o montaje, volumen material, complejidad.
- **Calidad de composición**: regularidad/variación deliberada, densidad, balance y curvatura, con indicadores interpretables.

Las restricciones duras de fabricación no pueden relajarse sin advertencia. La UI debe separar fidelidad óptica, estética/formalidad y fabricación. Un IoU alto no certifica retrato reconocible para todos los observadores ni montaje fácil. Los umbrales deben calibrarse mediante experimentos y conservar valores, semilla, escena y método de evaluación.

## 8. Por qué la v0.4 actual no satisface el contrato

Observación manual del usuario el 12/10/2026: en rama experimental, ejemplo real **barras individuales IoU 84,2 %, barras conectadas 38,3 %, malla fusionada 34,5 %**; geometría sin identidad escultórica, sombra final no reconocible. El CI pasó, pero los conectores horizontales y columna fabricaron una masa negra proyectada.

**Decisión:** retener `main` en v0.3; el trabajo de v0.4 sirve como banco diagnóstico y experimento de mallado, **no como generador aprobado**. No añadir detalles cosméticos para encubrir el fallo. Reorientar hacia (1) editor de escena, (2) franjas como baseline controlable, (3) primitivos dispersos optimizados, (4) filamentos conectados sin violar sombra, según criterios objetivos.

## 9. Diseño de interfaz por tareas

**Preparar imagen de sombra** → **Configurar escena** (editor 2D y campos precisos) → **Elegir familia** → **Elegir intención visual** → **Opcional: guía imagen / malla** → **Generar variantes** → **Comparar sombra y pieza** → **Revisar fabricación/montaje** → **Exportar**.

La UI deberá mostrar de forma inequívoca qué opciones son operativas o están «próximamente». Para instalaciones de piezas dispersas, exportar además plantilla con coordenadas, orientación y distancias de montaje. La simulación de fuente de área deberá distinguirse de la fuente puntual. Toda interfaz visible orientada al usuario, en español.

## 10. Verificación y entregables

1. **Escena:** pruebas matemáticas rayo–plano, límites y drag ↔ valores en mm, zoom y transformación; escenas guardadas/cargadas sin pérdida de unidades.
2. **Franjas:** siluetas sintéticas y retratos; comparar máscara deseada con barras reales; reportar IoU y rasgos perdidos.
3. **Primitivas:** reproducir sombras simples con posición y orientación verificadas; render del **conjunto** incluyendo sistemas de montaje.
4. **Filamentos:** rechazo automático de conexiones con caída de fidelidad; reporte visual de error por etapa.
5. **Interfaz:** preview de Cloudflare, navegador escritorio/móvil, fluidez, accesibilidad básica, fallas claras.
6. **Fabricación:** validación de mallas con herramientas independientes, prueba en slicer, prototipo físico con luz y pared medidos. El montaje modular no se evalúa con criterios de malla monolítica.
7. **Documentación:** publicar ADR, prueba visual registrada sin fotos privadas, plan versionado, y estado real con commit/CI.

No declarar completado un hito por CI verde si el objeto no produce una sombra reconocible.

## 11. Mapa documental

- [Arquitectura v2](arquitectura-v2.md): histórico del modelo anterior; permanece accesible.
- [ADR-0001](decisiones/ADR-0001-escena-geometria-intencion.md): motivos, alternativas y consecuencias del cambio.
- [Contrato de documentación](contrato-documentacion.md): reglas de mantenimiento.
- [Plan v0.4–v0.7](plan-versiones-v04-v07.md): **histórico en revisión**, no ejecutar prioridades anteriores sin reconciliar con esta arquitectura.
- [Experimento v0.4](experimentos/v04-red-filamentos.md): evidencia del fracaso de las conexiones y diagnóstico.
