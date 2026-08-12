# Vexel

App de escritorio para trabajar imágenes en tres frentes: convertir formatos raster, vectorizar de verdad (paths reales, no PNG envuelto en SVG) y mejorar calidad sin depender de la nube.

## Stack

- Electron + electron-vite
- React + TypeScript
- Tailwind CSS
- Vitest + Testing Library

## Desarrollo

```
npm install
npm run dev
```

## Scripts

| Script              | Descripción                       |
| ------------------- | --------------------------------- |
| `npm run dev`       | Levanta la app en modo desarrollo |
| `npm run build`     | Compila main, preload y renderer  |
| `npm start`         | Sirve el build de producción      |
| `npm run lint`      | Corre ESLint                      |
| `npm run format`    | Formatea con Prettier             |
| `npm run typecheck` | Chequeo de tipos de TypeScript    |
| `npm test`          | Corre los tests con Vitest        |

## Licencia

[PolyForm Noncommercial License 1.0.0](LICENSE). Uso, modificación y distribución libres para fines no comerciales; uso comercial requiere autorización.
