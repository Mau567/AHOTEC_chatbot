# Incrustar el chat de AHOTEC en cualquier sitio web

El widget de chat se puede añadir a **cualquier página web** como un widget flotante. Funciona en un iframe y se comunica con la API de tu aplicación AHOTEC.

## 1. Añadir el chat a un sitio web

### Opción A: Etiqueta script (recomendado)

Añade esto antes de `</body>` en la página donde quieras el chat:

```html
<script src="https://ahotec-chatbot.vercel.app/embed.js" async></script>
```

El script insertará un iframe flotante en la esquina inferior derecha.

### Opción B: Solo iframe

También puedes incrustar el chat con un iframe directo:

```html
<iframe
  src="https://ahotec-chatbot.vercel.app/embed/chat"
  title="Chat AHOTEC"
  style="position: fixed; bottom: 20px; right: 20px; width: 380px; height: 520px; border: none; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.15); z-index: 2147483647;"
></iframe>
```

## 2. Cómo funciona

- El widget se carga desde **tu** dominio AHOTEC (`/embed/chat`).
- Todas las llamadas a la API van a **tu** dominio (`/api/chat`), así que el sitio que lo incrusta no necesita configurar CORS.
- El sitio que incrusta solo carga tu script o tu iframe; no tiene que exponer ninguna API.
- El chat se muestra como una burbuja y panel flotante sobre la página.

## 3. Requisitos

- La aplicación AHOTEC (este repositorio) debe estar desplegada y ser accesible públicamente.
- El sitio que incrusta debe permitir cargar tu dominio (que la política CSP no bloquee tu origen).
- Para la **Opción A**, el sitio debe permitir cargar el script desde tu dominio.
