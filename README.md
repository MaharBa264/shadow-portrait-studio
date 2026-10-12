# Shadow Portrait Studio

**Generador experimental, gratuito y de código abierto de esculturas que proyectan sombras artísticas.**

🌐 [Abrir aplicación](https://shadow-portrait-studio.pages.dev/)

## Estado del proyecto

**Versión de código conocida: v0.3 experimental.** La aplicación permite cargar una imagen, ajustar contraste y umbral, configurar una luz puntual de referencia y generar barras tridimensionales experimentales, visualizarlas de forma esquemática y exportar un STL ASCII. **Las barras están desconectadas; el STL NO está validado para impresión.** El modo de volumen y los modos guiados por segunda imagen o malla 3D aún no están implementados.

**Observación del usuario:** la sombra y la proyección de v0.3 se ven razonablemente bien; el objeto no tiene todavía una forma escultórica convincente. No hay impresión física documentada ni prueba de validación geométrica final.

## Arquitectura vigente

**[Arquitectura v3 — Escena óptica, familias geométricas e intención artística](docs/arquitectura-v3.md)**. [ADR-0001: decisión y motivos](docs/decisiones/ADR-0001-escena-geometria-intencion.md).

La escena podrá editarse desde una vista lateral interactiva; las familias previstas son Franjas/listones variables, Primitivas dispersas, Filamentos y Volumen abstracto. La intención visual podrá ser Reconocible, Abstracta u Oculta. Todo esto es **contrato futuro**, no funcionalidad disponible en producción. La v0.4 de filamentos conectados no superó la prueba de sombra del usuario y permanece experimental.

## Contrato de idioma

El nombre propio **Shadow Portrait Studio** se mantiene en inglés. **Toda la experiencia de usuario y la documentación se redactarán en español**, incluidos los nombres de modos y mensajes. Los identificadores de código o bibliotecas externas pueden usar inglés. Algunos textos de la interfaz actual aún están pendientes de revisión.

## Modos definidos en la arquitectura (todavía no implementados por completo)

1. **Escultura libre:** estilo ordenado, geométrico, orgánico, caótico, minimalista o ramificado.
2. **Escultura guiada por imagen:** la segunda imagen inspira la forma del objeto; la primera determina la sombra.
3. **Escultura guiada por modelo 3D:** un modelo simple sirve de referencia para modificar la forma y aproximar la sombra.

Los motores **Filamentos** y **Volumen** son representaciones geométricas independientes de los tres modos anteriores.

## Contratos y documentación

- [Arquitectura v3 — contrato vigente](docs/arquitectura-v3.md)
- [ADR-0001 — motivo del cambio](docs/decisiones/ADR-0001-escena-geometria-intencion.md)
- [Arquitectura v2 — documento histórico](docs/arquitectura-v2.md)
- [Plan técnico v0.4–v0.7 — pendiente de reconciliar con v3](docs/plan-versiones-v04-v07.md)
- [Contrato vivo de documentación](docs/contrato-documentacion.md)
- [Arquitectura fundacional v0.1 — documento histórico](docs/architecture.md)

**Regla:** cada decisión o implementación relevante deberá reflejarse en Markdown dentro de este repositorio, con estado y evidencia. No confundir código escrito, compilación, validación geométrica ni verificación física.

## Ejecución local

Requiere un navegador moderno. Puede servirse el repositorio como sitio estático. Con Node.js 20 o superior:

```sh
npm test
npm run build
```

La compilación genera `dist/`, directorio de salida de Cloudflare Pages. Se utiliza `main` como rama de producción.

## Licencia

MIT. Consultar [LICENSE](LICENSE).
