# Contrato de arquitectura v2 — Shadow Portrait Studio

Estado: **decisión de diseño**, no declaración de implementación. Fecha: 2026-10-11. Idioma de producto: **español**. Nombre propio del producto: Shadow Portrait Studio.

## 1. Propósito y definición de éxito

Aplicación web local-first, gratuita y de código abierto para construir esculturas tridimensionales cuya sombra, bajo una escena de iluminación calibrada, reproduzca una imagen elegida. La identidad visual del objeto puede ser libre, inspirada en una segunda imagen o guiada por un modelo 3D.

**Principio rector:** la imagen que debe producir la sombra y la forma que deseamos darle al objeto son objetivos distintos. Nunca se equipara buena sombra con geometría fabricable.

Éxito de producto: una persona sin experiencia CAD puede importar la imagen objetivo, seleccionar cómo desea la forma de la escultura, previsualizar tanto el objeto como su sombra, entender las limitaciones físicas y exportar un archivo verificable para fabricar una pieza. Las primeras versiones no cumplirán aún todo esto.

## 2. Vocabulario obligatorio en español

- **Imagen de sombra**: imagen primaria, obligatoria; define la proyección deseada.
- **Referencia de forma**: intención escultórica opcional.
- **Escultura libre**: forma creada por el algoritmo, sin imagen o malla externa.
- **Escultura guiada por imagen**: referencia 2D secundaria distinta de la imagen de sombra.
- **Escultura guiada por modelo 3D**: referencia volumétrica aportada por el usuario.
- **Estilo de forma**: ordenado, geométrico, orgánico, caótico, minimalista, ramificado (presets, no garantías estéticas).
- **Fidelidad de sombra**, **fidelidad de forma**, **viabilidad de impresión**, **escena óptica** y **vista previa**.
- **Filamentos** y **volumen** son **familias de representación geométrica**, no sustituyen a los tres modos de intención escultórica.

Se admiten nombres en inglés solamente en APIs de bibliotecas externas, formatos, identificadores internos y nombre propio de la app. Etiquetas, ayuda, mensajes de error y documentación de uso se escriben en español.

## 3. Matriz de funcionamiento

| Intención de forma | Filamentos | Volumen |
|---|---|---|
| Escultura libre | Objetivo inicial; estilos parametrizados | Futuro |
| Guiada por imagen | Extraer contornos/esqueleto de imagen secundaria y usarlo como preferencia formal | Futuro |
| Guiada por modelo 3D | Ajustar recorridos a una envolvente/malla de referencia | Futuro; deformación y vaciados |

La aplicación debe distinguir una **opción visible planificada** de una **función operativa**. No mostrar un resultado calculado por un modo diferente como si proviniera del modo seleccionado.

## 4. Contratos conceptuales

```ts
type ModoForma = "libre" | "guiado-imagen" | "guiado-modelo";
type Representacion = "filamentos" | "volumen";
type EstiloForma = "ordenado" | "geometrico" | "organico" | "caotico" | "minimalista" | "ramificado";

interface ObjetivoSombra {
  anchuraPx: number;
  alturaPx: number;
  intensidades: Float32Array; // 0 oscuro, 1 claro
  mascara?: Uint8Array;
  transformacionImagen: number[]; // definida por esquema versionado
}
interface ReferenciaForma {
  tipo: "sin-referencia" | "estilo" | "imagen" | "malla";
  estilo?: EstiloForma;
  imagen?: ObjetivoSombra;       // imagen distinta de la sombra
  malla?: MallaReferencia;       // definida en modulo de geometria
}
interface EscenaOptica {
  luz: {
    tipo: "puntual" | "extendida" | "direccional";
    posicionMm: [number, number, number];
    radioEmisorMm?: number;
  };
  planoReceptor: { origenMm: [number,number,number]; normal: [number,number,number]; ejeHorizontal: [number,number,number] };
  volumenConstruccionMm: [number,number,number];
  toleranciaCalibracionMm: number;
}
interface ParametrosBusqueda {
  modoForma: ModoForma;
  representacion: Representacion;
  referencia: ReferenciaForma;
  pesoFidelidadSombra: number;
  pesoFidelidadForma: number;
  pesoViabilidadImpresion: number;
  semilla: number;
}
interface Evaluacion {
  errorSombra: number;
  errorForma?: number;
  componentesConectados: number;
  mallaCerrada: boolean;
  espesorMinimoObservadoMm?: number;
  advertencias: string[];
  estado: "conceptual" | "experimental" | "validado-geometricamente" | "verificado-fisicamente";
}
```

Los tipos anteriores son especificación de arquitectura, no interfaces implementadas. Al convertirlos en código se definirán sistemas de coordenadas, versiones de serialización, unidades y validación de entrada. La intensidad en grises expresa un objetivo; un material opaco y una única proyección binaria no garantizan reproducirla.

## 5. Pipeline común

1. **Ingesta**: cargar imagen de sombra y, según modo, segunda imagen o malla STL/OBJ/GLB. Limitar tamaño y validar contenidos. El procesamiento ocurre localmente; no enviar fotografías a servicios externos.
2. **Normalización**: recorte, orientación, transparencia, gamma y segmentación; preservar original y transformación.
3. **Configuración óptica**: declarar coordenadas en milímetros y marco de referencia, luz, orientación y plano de proyección. La escala de la máscara no debe confundirse con la escala de la pieza.
4. **Inicialización geométrica**: cada motor crea una candidata a partir de la imagen de sombra y la referencia de forma.
5. **Evaluación compartida**: proyectar la malla candidata completa, incluidas uniones y base; medir error respecto de la sombra y restricciones físicas.
6. **Optimización**: buscar candidatos mejores con restricciones duras (seguridad geométrica) y preferencias ponderadas; permitir rechazar soluciones imposibles en vez de prometer coincidencia perfecta.
7. **Validación y exportación**: malla cerrada, componentes, espesores, orientación, unidades; STL/3MF en etapas posteriores; conservar archivo de proyecto versionado.

## 6. Función objetivo y prioridades

Sea G la geometría, S la imagen objetivo, R la forma guía y C la escena óptica.

`E(G) = w_s E_sombra(proyectar(G,C),S) + w_f E_forma(G,R) + w_e E_estetica(G) + w_m E_material(G)`

Sujeta a restricciones de fabricación (conectividad, espesor, volumen, dimensiones, ausencia de geometría degenerada). Pesos configurables **no** deben permitir etiquetar una malla inválida como imprimible. La calidad de forma para imagen 2D se medirá inicialmente en una vista de referencia explícita; una única imagen no define un volumen 3D único. Para malla se estudiarán distancias de superficie y preservación de silueta.

El control de usuario **Prioridad de sombra ↔ Prioridad de forma** ajustará pesos pero mostrará advertencias de inviabilidad. Cada ejecución debe guardar semilla, parámetros y métricas para reproducibilidad.

## 7. Estrategias por modo

### Escultura libre
Generar recorridos conectables, estructuras orgánicas/ramificadas o campos volumétricos, sin plantilla importada. Los estilos regulan regularidad, curvatura, densidad, simetría, variación de profundidad y distribución de ramas. Aleatoriedad controlada con semilla.

### Guiada por imagen
Segunda imagen opcional: extraer contornos dominantes y/o esqueleto 2D; definir dirección de observación de la pieza; usarlo como restricción suave de distribución de filamentos o envolvente volumétrica. Mostrar ambas imágenes con títulos inequívocos: **imagen de sombra** y **referencia de forma**. No prometer recuperación 3D exacta desde una sola vista.

### Guiada por modelo 3D
Validar unidades, tamaño, malla y orientación. Empezar con mallas simples; permitir selección de cara/vista preferente y definir volumen máximo de modificación. Herramientas candidatas: desplazamiento de vértices, vaciados, nervaduras y perforaciones. Preservar original; aplicar cambios de manera no destructiva. No aceptar geometrías complejas arbitrarias como garantía de resultado.

## 8. Física y simulación

El render inicial de máscara plana y luz puntual es **referencia matemática**, no prueba de la sombra de un objeto 3D. La simulación final debe calcular o rasterizar oclusión de la **malla real**, incluidos soportes, y contemplar área emisora, penumbra, distancia y resolución. Para corroborar el método, usar escenas canónicas con sombras analíticas, métricas de intersección/contorno y fotografías de pruebas físicas calibradas. No comparar únicamente imágenes idealizadas.

## 9. Fabricación

Una malla STL descargable no equivale a una escultura imprimible. Validar: estanqueidad/topología, conectividad de piezas, auto-intersecciones, dimensiones y grosor mínimo según material y proceso, orientación, puentes y voladizos, anclaje a base, necesidad de soportes y tolerancias. La base y las uniones forman parte de la sombra y deben simularse. Un estado **verificado físicamente** requiere objeto fabricado y sombra observada bajo condiciones documentadas.

## 10. Arquitectura de software

Separar: interfaz; preprocesamiento; contratos y esquema de proyecto; escena/calibración; simulación; motores de filamentos y volumen; adaptadores de guía libre/imagen/malla; optimización; evaluación; fabricación; exportación. Operaciones pesadas en Web Workers y, si se justifica, WebAssembly. Three.js para representación visual y exportación cuando corresponda, sin acoplar datos de dominio al visor. Cloudflare Pages como alojamiento estático. Las fotografías deben permanecer en el navegador en operación estándar.

## 11. Compatibilidad y evolución

El JSON de proyecto lleva versión de esquema y migraciones. Separar versiones de aplicación de versiones de contrato. No sobreescribir resultados históricos ni perder el original de la referencia. Definir límite razonable de memoria, cancelación y progreso. Cada algoritmo expone capacidades, advertencias y métricas homogéneas.

## 12. Estado conocido al redactar

- **Implementado en GitHub (informado por commits):** carga de imagen, umbral/contraste, referencia óptica puntual para máscara plana, barras 3D experimentales independientes, exportación STL experimental y pruebas fuente.
- **Prueba de usuario:** la sombra y proyección de v0.3 se ven bastante bien; la geometría del objeto no presenta todavía una forma escultórica inteligible.
- **No verificado:** ejecutabilidad de pruebas en CI, imprimibilidad física, fidelidad de sombra tras unir barras.
- **Decidido, no implementado:** estilos libres, generación guiada por segunda imagen, generación guiada por malla, optimización de doble objetivo y simulación realista de objeto completo.
- **Pendiente:** generador volumétrico, piezas conectadas y diagnóstico de impresión.

## 13. Criterios de cambio de contrato

Un cambio en significados de modos, unidades, coordenadas, esquema de proyecto, funciones objetivo o estado de imprimibilidad requiere decisión de arquitectura documentada (ADR), modificación de este contrato y pruebas. Cambios estéticos menores de interfaz no requieren ADR salvo que alteren la interpretación del resultado.

Ver también `docs/plan-versiones-v04-v07.md` y `docs/contrato-documentacion.md`.
