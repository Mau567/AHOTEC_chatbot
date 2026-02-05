# 📚 AHOTEC Chatbot - Documentación Completa

## Índice / Table of Contents

### Español
1. [Introducción](#1-introducción)
2. [Guía para Usuarios](#2-guía-para-usuarios)
3. [Guía para Hoteles](#3-guía-para-hoteles)
4. [Guía para Administradores](#4-guía-para-administradores)
5. [Arquitectura Técnica](#5-arquitectura-técnica)
6. [Cómo Funciona el Chatbot](#6-cómo-funciona-el-chatbot)

### English
7. [User Guide (English)](#7-user-guide-english)
8. [Technical Overview (English)](#8-technical-overview-english)

---

# 🇪🇸 ESPAÑOL

## 1. Introducción

AHOTEC Chatbot es una plataforma inteligente diseñada para ayudar a turistas y locales a encontrar los mejores hoteles en Ecuador. El sistema utiliza inteligencia artificial (Mistral AI) para proporcionar recomendaciones personalizadas basadas en ubicación, preferencias y tipo de alojamiento.

### ¿Qué puedes hacer con AHOTEC Chatbot?

- **Para Turistas**: Buscar y descubrir hoteles en cualquier región de Ecuador
- **Para Hoteles**: Registrar tu establecimiento en la plataforma
- **Para Administradores**: Gestionar solicitudes y aprobar hoteles

---

## 2. Guía para Usuarios

### 2.1 Cómo Buscar un Hotel

#### Opción 1: Chatbot en la Página Principal

1. **Accede a la página principal** de AHOTEC
2. En la sección del chatbot, verás dos preguntas guiadas:
   
   **Paso 1: ¿Dónde te gustaría buscar un hotel?**
   - Escribe la ciudad, región o dirección donde deseas hospedarte
   - Ejemplos válidos:
     - "Quito"
     - "Costa"
     - "Aeropuerto Mariscal Sucre"
     - "Baños de Agua Santa"
     - "Parque La Carolina"
   - Haz clic en **"Siguiente"**

   **Paso 2: ¿Qué tipo de hotel buscas?**
   - Selecciona uno o varios tipos de alojamiento:
     - 🏨 Hotel / Resort / 5* o 4*
     - 🏨 Hotel / 2* o 3*
     - 🏠 Hostal / Bed and Breakfast / 3*, 2* o 1*
     - 🏡 Hostería / Hacienda / Lodge / 5*, 4* o 3*
   - Haz clic en **"Siguiente"**

3. **Resultados**: El sistema te mostrará una lista de hoteles que coinciden con tu búsqueda
   - Cada hotel muestra:
     - Fotografía del hotel
     - Nombre y descripción
     - Dirección completa
     - Ubicación (frase descriptiva)
     - Servicios y áreas recreativas
     - Puntos de interés alrededor
     - Enlaces al sitio web y reservas

4. **Ver Detalles**: Haz clic en cualquier hotel para ver información completa en un modal

5. **Reiniciar Búsqueda**: Haz clic en el botón "Reiniciar búsqueda" para comenzar una nueva consulta

#### Opción 2: Widget Flotante

En cualquier página del sitio web, encontrarás un botón flotante de chat en la esquina inferior derecha:

1. **Haz clic en el ícono de mensaje** (círculo azul con icono de chat)
2. Sigue el mismo proceso guiado del chatbot principal
3. Puedes cambiar el idioma usando el botón de idioma arriba del chat
4. El widget es minimalista y no interrumpe tu navegación

### 2.2 Búsquedas Comunes

#### Por Ciudad
```
- "Quito"
- "Guayaquil"
- "Cuenca"
- "Baños"
- "Montañita"
- "Puerto Ayora"
```

#### Por Región
```
- "Sierra"
- "Costa"
- "Amazonía"
- "Galápagos"
```

#### Por Aeropuerto
```
- "Aeropuerto Mariscal Sucre"
- "UIO" (código del aeropuerto de Quito)
- "GYE" (código del aeropuerto de Guayaquil)
- "LTX" (código del aeropuerto de Latacunga)
```

#### Por Punto de Interés
```
- "Parque La Carolina"
- "Centro Histórico de Quito"
- "Malecón 2000"
- "Volcán Cotopaxi"
```

### 2.3 Cambiar Idioma

La plataforma está disponible en **Español** e **Inglés**:
- En la esquina superior derecha, encontrarás un botón para cambiar el idioma
- El widget flotante también tiene su propio botón de idioma
- Todo el contenido se traduce automáticamente

---

## 3. Guía para Hoteles

### 3.1 Cómo Registrar tu Hotel

1. **Accede al formulario de registro** en la página principal (sección "Registra tu Hotel")

2. **Completa la información requerida** (campos marcados con *):

   **Información Básica**
   - **Nombre del Hotel**: Especifica el tipo (Hotel, Hostal, Hostería, Lodge, Resort)
     - Ejemplo: "Hotel Quito Plaza", "Hostería La Floresta"
   
   - **Región**: Selecciona una opción:
     - Costa
     - Sierra
     - Amazonía
     - Galápagos
   
   - **Ciudad**: Escribe la ciudad donde se encuentra tu hotel
     - Ejemplo: "Quito", "Guayaquil", "Cuenca"
   
   - **Dirección**: Dirección completa del hotel
     - Ejemplo: "Av. Amazonas N34-120 y Av. Naciones Unidas, Quito"

   **Ubicación y Descripción**
   - **Frase de ubicación**: Describe en una frase dónde está ubicado (máximo 150 caracteres)
     - Ejemplo: "En el corazón de Quito, cerca del parque La Carolina"
   
   - **Tipo/Categoría de hotel**: Selecciona el tipo que mejor describa tu establecimiento
     - Hotel / Resort / 5* o 4*
     - Hotel / 2* o 3*
     - Hostal / Bed and Breakfast / 3*, 2* o 1*
     - Hostería / Hacienda / Lodge / 5*, 4* o 3*
   
   - **Descripción**: Describe las características únicas de tu hotel (máximo 200 caracteres)
     - Ejemplo: "Hotel boutique en zona exclusiva, con vista panorámica de la ciudad..."

   **Servicios y Amenidades**
   - Selecciona **al menos un servicio** de la lista (puedes seleccionar múltiples):
     - Restaurante, Bar
     - Instalaciones para conferencias
     - Centro de Negocios / Coworking
     - Facilidades para discapacitados
     - SPA / Sauna / turco / hidromasaje
     - WiFi gratuito
     - Parqueadero propio
     - Gimnasio, Sala de juegos, Juegos infantiles
     - Mascotas permitidas
     - Estación de carga para coches eléctricos
     - Traslado al aeropuerto
     - Acceso a la playa (Cerca / Directamente)
     - Jardines privados
     - Piscina (al aire libre / cubierta)
     - Áreas deportivas (canchas)
     - Generador eléctrico

   **Alrededores**
   - **6 puntos importantes alrededor del hotel** (obligatorio):
     - Ejemplos: "Estadio Atahualpa", "Centro Comercial Quicentro", "Parque La Carolina", "Metro Línea 1", "Hospital Metropolitano", "Universidad San Francisco"

   **Enlaces Web** (opcional)
   - **Link al sitio web del hotel**: URL completa de tu sitio web
   - **Link a reservas**: URL directa para hacer reservas

   **Fotografía** (obligatoria)
   - Sube una imagen del hotel
   - Formatos permitidos: JPG, JPEG, PNG, WEBP, GIF
   - Tamaño máximo: 4MB
   - **Recomendación**: Usa una foto de alta calidad de la fachada o área principal

3. **Envía la solicitud**
   - Haz clic en el botón **"Enviar Solicitud"**
   - Recibirás un mensaje de confirmación: "¡Hotel enviado exitosamente! Nuestro equipo lo revisará y te contactaremos pronto."

4. **Proceso de Revisión**
   - Tu solicitud quedará en estado **"PENDIENTE"**
   - El equipo de AHOTEC revisará la información
   - Recibirás notificación del estado:
     - ✅ **APROBADO**: Tu hotel aparecerá en las búsquedas del chatbot
     - ❌ **RECHAZADO**: Recibirás retroalimentación para mejorar tu solicitud

### 3.2 Requisitos para la Aprobación

Para que tu hotel sea aprobado, debe cumplir con:
- ✅ Información completa y veraz
- ✅ Fotografía de buena calidad
- ✅ Descripción clara y profesional
- ✅ Dirección verificable
- ✅ Servicios reales que ofreces

### 3.3 Consejos para una Mejor Presentación

- 📸 **Fotografía**: Usa una imagen brillante y atractiva de tu hotel
- 📝 **Descripción**: Destaca lo que hace único a tu establecimiento
- 🎯 **Precisión**: Sé específico con la ubicación y servicios
- 🌟 **Puntos de interés**: Menciona lugares reconocidos cercanos
- 🔗 **Enlaces**: Proporciona URLs válidas y funcionales

---

## 4. Guía para Administradores

### 4.1 Acceso al Panel de Administración

1. **Navega a**: `/admin`
2. **Credenciales de acceso**:
   - **Clave**: AHOTEC2025
   - **Contraseña**: AHOTEC2025
   - ⚠️ **Nota de seguridad**: Cambia estas credenciales en producción

### 4.2 Dashboard Principal

Al ingresar al panel, verás:

**Estadísticas en Tiempo Real**
- 🕐 **Pendientes**: Hoteles esperando revisión
- ✅ **Aprobados**: Hoteles activos en el sistema
- ❌ **Rechazados**: Solicitudes rechazadas
- 💰 **Pagados**: Hoteles con pago confirmado

### 4.3 Gestión de Hoteles

#### Filtros Disponibles
- **Todos**: Muestra todos los hoteles
- **Pendientes**: Solo solicitudes nuevas
- **Aprobados**: Hoteles activos
- **Rechazados**: Solicitudes rechazadas

#### Acciones sobre Hoteles

Para cada hotel en la lista, puedes:

1. **👁️ Ver Detalles** (ícono de ojo)
   - Abre un modal con toda la información del hotel
   - Muestra: descripción, ubicación, servicios, alrededores, foto, enlaces

2. **✏️ Editar** (ícono de lápiz)
   - Permite modificar cualquier campo del hotel
   - Puedes cambiar:
     - Nombre, región, ciudad, dirección
     - Descripción y mensaje
     - Servicios y áreas recreativas
     - Frase de ubicación
     - Puntos importantes alrededor
     - Tipo de hotel
     - Enlaces web y de reservas
     - **Cambiar fotografía**: Sube una nueva imagen si es necesario
   - Haz clic en **"Guardar"** para aplicar cambios
   - Haz clic en **"Cancelar"** para descartar

3. **✅ Aprobar** (ícono verde de check) - Solo para hoteles PENDIENTES
   - Marca el hotel como APROBADO
   - El hotel comenzará a aparecer en las búsquedas del chatbot
   - Se registra quién aprobó y cuándo

4. **❌ Rechazar** (ícono rojo de X) - Solo para hoteles PENDIENTES
   - Marca el hotel como RECHAZADO
   - El hotel NO aparecerá en las búsquedas
   - Se registra quién rechazó y cuándo

5. **🗑️ Eliminar** (ícono de papelera)
   - Elimina permanentemente el hotel de la base de datos
   - Pide confirmación antes de eliminar
   - ⚠️ **Acción irreversible**

### 4.4 Flujo de Trabajo Recomendado

1. **Revisar Pendientes Diariamente**
   - Filtra por "PENDIENTES"
   - Revisa cada solicitud nueva

2. **Evaluar Cada Hotel**
   - Haz clic en 👁️ para ver detalles completos
   - Verifica:
     - ✓ Información completa
     - ✓ Dirección válida
     - ✓ Descripción profesional
     - ✓ Fotografía de calidad
     - ✓ Servicios coherentes

3. **Tomar Acción**
   - Si cumple requisitos → ✅ Aprobar
   - Si falta información o tiene errores → ✏️ Editar primero, luego aprobar
   - Si no cumple estándares → ❌ Rechazar o 🗑️ Eliminar

4. **Gestión Continua**
   - Puedes editar hoteles aprobados si necesitan actualización
   - Revisa periódicamente la información para mantenerla actualizada

### 4.5 Tabla de Hoteles

La tabla muestra:
- **Hotel**: Nombre del establecimiento
- **Ubicación**: Ciudad y región
- **Estado**: PENDING / APPROVED / REJECTED (con colores distintivos)
- **Fecha**: Fecha de creación de la solicitud
- **Acciones**: Botones de acción disponibles

### 4.6 Cambiar Idioma

El panel administrativo también está disponible en español e inglés. Usa el botón en la esquina superior derecha.

---

## 5. Arquitectura Técnica

### 5.1 Stack Tecnológico

**Frontend**
- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **UI**: React 18
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **Markdown**: React Markdown

**Backend**
- **API Routes**: Next.js API Routes
- **Base de Datos**: PostgreSQL
- **ORM**: Prisma 6.17.1
- **Almacenamiento**: Supabase Storage (para imágenes)
- **IA**: Mistral AI (modelo mistral-small-latest)

**Despliegue**
- **Hosting**: Vercel (recomendado)
- **Base de Datos**: Supabase PostgreSQL

### 5.2 Estructura del Proyecto

```
AHOTEC_chatbot/
│
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Página principal (formulario + chatbot guiado)
│   ├── admin/
│   │   └── page.tsx              # Panel de administración
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts          # API del chatbot (POST)
│   │   ├── hotels/
│   │   │   ├── route.ts          # GET (listar) y POST (crear)
│   │   │   └── [id]/
│   │   │       └── route.ts      # PATCH (editar) y DELETE
│   │   └── upload-image/
│   │       └── route.ts          # Subir imágenes a Supabase
│   ├── layout.tsx                # Layout raíz
│   └── globals.css               # Estilos globales
│
├── components/
│   ├── ChatWidget.tsx            # Widget flotante de chat (free-form)
│   ├── HotelDetailModal.tsx      # Modal de detalles de hotel
│   └── MapModal.tsx              # Modal de mapa (comentado)
│
├── lib/
│   ├── db.ts                     # Cliente Prisma + Supabase
│   └── mistral.ts                # Integración con Mistral AI
│
├── prisma/
│   ├── schema.prisma             # Esquema de base de datos
│   └── migrations/               # Migraciones de BD
│
├── public/
│   └── images/
│       └── logoAHOTEC2022.png    # Logo de AHOTEC
│
├── .env.local                    # Variables de entorno (no incluido)
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

### 5.3 Modelos de Datos (Prisma Schema)

#### **Hotel**
```prisma
model Hotel {
  id              String       @id @default(cuid())
  name            String       // Nombre del hotel
  region          String       // Costa, Sierra, Amazonía, Galápagos
  city            String       // Ciudad
  description     String       // Descripción (max 200 caracteres)
  websiteLink     String?      // URL sitio web
  bookingLink     String?      // URL reservas
  status          HotelStatus  @default(PENDING) // PENDING, APPROVED, REJECTED
  isPaid          Boolean      @default(false)
  price           Float?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  approvedBy      String?      // ID del admin que aprobó
  approvedAt      DateTime?
  imageUrl        String?      // URL de Supabase Storage
  aboutMessage    String?
  recreationAreas String?      // Servicios separados por comas
  locationPhrase  String?      // Frase de ubicación (max 150 caracteres)
  address         String?      // Dirección completa
  surroundings    String[]     // Array de 6 puntos importantes
  hotelType       String?      // Tipo/categoría
}
```

#### **ChatSession**
```prisma
model ChatSession {
  id        String   @id @default(cuid())
  sessionId String   @unique
  messages  Json[]   // Array de mensajes
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### **User** (para futura autenticación)
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String   // Hasheada con bcryptjs
  role      UserRole @default(ADMIN) // ADMIN, MODERATOR
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 5.4 APIs Disponibles

#### **POST /api/hotels**
Crea un nuevo hotel
```typescript
Body (FormData):
- name: string (requerido)
- region: string (requerido)
- city: string (requerido)
- description: string (requerido)
- websiteLink: string (opcional)
- bookingLink: string (opcional)
- address: string (requerido)
- locationPhrase: string (requerido)
- hotelType: string (requerido)
- recreationAreas: string (requerido, separado por comas)
- surroundings: string (requerido, 6 items separados por comas)
- image: File (requerido, max 4MB)

Response:
{
  "success": true,
  "hotel": { ... },
  "message": "Hotel submitted successfully!"
}
```

#### **GET /api/hotels**
Obtiene lista de hoteles con filtros opcionales
```typescript
Query params:
- status?: 'PENDING' | 'APPROVED' | 'REJECTED'
- region?: string
- city?: string

Response:
{
  "hotels": [ ... ]
}
```

#### **PATCH /api/hotels/[id]**
Actualiza un hotel existente
```typescript
Body:
{
  name?: string,
  region?: string,
  city?: string,
  description?: string,
  status?: 'APPROVED' | 'REJECTED',
  approvedBy?: string,
  isPaid?: boolean,
  price?: number,
  // ... otros campos opcionales
}

Response:
{
  "success": true,
  "hotel": { ... }
}
```

#### **DELETE /api/hotels/[id]**
Elimina un hotel
```typescript
Response:
{
  "success": true,
  "message": "Hotel deleted successfully"
}
```

#### **POST /api/chat**
Procesa consultas del chatbot
```typescript
Body:
{
  "message": string,      // Formato: "Ubicación: {location}\nTipo de hotel: {types|||separated}"
  "sessionId": string,    // ID de sesión único
  "lang"?: "es" | "en"    // Idioma (default: "es")
}

Response:
{
  "message": string,      // Respuesta del bot (puede estar vacía)
  "hotels": [ ... ]       // Array de hoteles coincidentes
}
```

---

## 6. Cómo Funciona el Chatbot

### 6.1 Flujo General

```
Usuario → Ingresa ubicación
  ↓
Usuario → Selecciona tipo(s) de hotel
  ↓
Frontend → Envía request a /api/chat
  ↓
Backend → Filtra por tipo de hotel
  ↓
Backend → Usa Mistral AI para filtrar por ubicación semántica
  ↓
Backend → Refina resultados (proximidad a aeropuertos si aplica)
  ↓
Backend → Retorna lista de hoteles
  ↓
Frontend → Muestra resultados al usuario
```

### 6.2 Sistema de Inteligencia Artificial (Mistral AI)

El chatbot utiliza **Mistral AI** (modelo `mistral-small-latest`) para:

1. **Interpretación Semántica de Ubicaciones**
   - Entiende consultas en lenguaje natural
   - Mapea aeropuertos a ciudades (UIO → Quito, GYE → Guayaquil)
   - Reconoce puntos de interés (Parque La Carolina → Quito)
   - Maneja búsquedas regionales (Sierra, Costa, etc.)

2. **Filtrado Inteligente**
   - Compara la consulta del usuario con:
     - Ciudad del hotel
     - Región (Sierra, Costa, Amazonía, Galápagos)
     - Dirección completa
     - Frase de ubicación
     - Alrededores (6 puntos importantes)
   
3. **Precisión Alta**
   - Prioriza coincidencias exactas de ciudad
   - Evita mezclar hoteles de diferentes ciudades
   - Maneja consultas ambiguas con reglas deterministas

### 6.3 Lógica de Filtrado en 3 Pasos

#### **Paso 1: Filtrado por Tipo de Hotel**
```typescript
// Frontend envía tipos seleccionados separados por "|||"
const types = ["Hotel / Resort / 5* o 4*", "Hotel / 2* o 3*"]
message = `Ubicación: ${location}\nTipo de hotel: ${types.join('|||')}`
```

El backend filtra hoteles que coincidan con los tipos seleccionados.

#### **Paso 2: Filtrado Semántico de Ubicación**
```typescript
// Envía a Mistral AI:
// - Inventario de hoteles con ubicaciones
// - Consulta del usuario
// - Instrucciones de precisión

Mistral AI retorna: ["hotelId1", "hotelId2", ...]
```

#### **Paso 3: Refinamiento de Aeropuertos** (si aplica)
```typescript
// Si la consulta menciona aeropuertos:
if (query.includes("aeropuerto") || query.includes("airport")) {
  // Solo retorna hoteles que explícitamente mencionen proximidad al aeropuerto
  // en sus campos (nombre, descripción, alrededores, etc.)
}
```

### 6.4 Ejemplos de Consultas

#### Ejemplo 1: Búsqueda por Ciudad
```
Entrada:
  Ubicación: "Quito"
  Tipos: ["Hotel / Resort / 5* o 4*"]

Proceso:
  1. Filtra hoteles tipo "Hotel / Resort / 5* o 4*"
  2. Mistral AI identifica que "Quito" es una ciudad
  3. Retorna solo hoteles cuya ciudad sea "Quito"

Resultado: Lista de hoteles 4*/5* en Quito
```

#### Ejemplo 2: Búsqueda por Aeropuerto
```
Entrada:
  Ubicación: "Aeropuerto Mariscal Sucre"
  Tipos: ["Todos"]

Proceso:
  1. Resuelve "Aeropuerto Mariscal Sucre" → Quito
  2. Filtra hoteles en Quito
  3. Refina: Solo hoteles que mencionan "aeropuerto" en sus datos
  4. Prioriza hoteles con "traslado al aeropuerto" en servicios

Resultado: Hoteles cerca del aeropuerto de Quito
```

#### Ejemplo 3: Búsqueda por Región
```
Entrada:
  Ubicación: "Sierra"
  Tipos: ["Hostería / Hacienda / Lodge"]

Proceso:
  1. Filtra hoteles tipo "Hostería / Hacienda / Lodge"
  2. Mistral AI identifica "Sierra" como región
  3. Retorna hoteles cuya región sea "Sierra"

Resultado: Hosterías/Haciendas/Lodges en toda la Sierra
```

### 6.5 Manejo de Sesiones

Cada conversación tiene un `sessionId` único:
```typescript
const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2,9)}`
```

El sistema guarda:
- Historial de mensajes
- Contexto de la conversación
- Preferencias del usuario

### 6.6 Soporte Multilingüe

El chatbot detecta el idioma y ajusta:
- Mensajes del bot
- Prompts a Mistral AI
- Mensajes de error

```typescript
const lang = language // "es" o "en"

const prompt = lang === 'en' 
  ? `You are Lucía, a hotel assistant for AHOTEC...`
  : `Eres Lucía, una asistente hotelera para AHOTEC...`
```

### 6.7 Nombre del Asistente

El chatbot se llama **"Lucía"** [[memory:7743120]] en todos los componentes:
- ChatWidget
- Página principal
- Prompts de Mistral AI

---

## 7. Guía Rápida de Mantenimiento

### 7.1 Regenerar Cliente Prisma
Si modificas el schema, ejecuta:
```bash
npx prisma generate
```

### 7.2 Aplicar Migraciones
```bash
npx prisma migrate deploy
```

### 7.3 Ver Base de Datos
```bash
npx prisma studio
```

### 7.4 Variables de Entorno Necesarias

Crea un archivo `.env.local`:
```env
# Base de datos
DATABASE_URL="postgresql://user:pass@host:5432/db"

# Supabase (para imágenes)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_BUCKET="hotel-images"

# Mistral AI
MISTRAL_API_KEY="your-mistral-api-key"
```

### 7.5 Comandos Útiles
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start

# Linting
npm run lint

# Setup inicial
npm run setup
```

---

# 🇬🇧 ENGLISH

## 7. User Guide (English)

### 7.1 How to Search for a Hotel

#### Option 1: Main Page Chatbot

1. **Go to the AHOTEC homepage**
2. In the chatbot section, type your question or request in natural language (e.g. "Hotels near the airport in Quito", "I want a 4-star hotel in Guayaquil").
3. **Results**: Lucía will reply with relevant hotels and links. You can keep the conversation going with follow-up questions.
4. **View Details**: Click on any hotel in the main page results to see complete information in a modal.

#### Option 2: Floating Widget

On any page of the website, you'll find a floating chat button in the bottom-right corner:

1. **Click the message icon** (blue circle with chat icon)
2. Use the same free-form chat: type your question and Lucía will respond with hotel suggestions and links
3. You can change the language using the language button above the chat
4. The widget is minimalist and doesn't interrupt your browsing

### 7.2 Common Searches

#### By City
```
- "Quito"
- "Guayaquil"
- "Cuenca"
- "Baños"
- "Montañita"
- "Puerto Ayora"
```

#### By Region
```
- "Sierra" (Highlands)
- "Costa" (Coast)
- "Amazonía" (Amazon)
- "Galápagos"
```

#### By Airport
```
- "Mariscal Sucre Airport"
- "UIO" (Quito airport code)
- "GYE" (Guayaquil airport code)
- "LTX" (Latacunga airport code)
```

#### By Point of Interest
```
- "La Carolina Park"
- "Quito Historic Center"
- "Malecón 2000"
- "Cotopaxi Volcano"
```

### 7.3 Language Toggle

The platform is available in **Spanish** and **English**:
- In the top-right corner, you'll find a button to change the language
- The floating widget also has its own language button
- All content translates automatically

---

## 8. Technical Overview (English)

### 8.1 Technology Stack

**Frontend**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: React 18
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Markdown**: React Markdown

**Backend**
- **API Routes**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Prisma 6.17.1
- **Storage**: Supabase Storage (for images) [[memory:7743129]]
- **AI**: Mistral AI (mistral-small-latest model)

**Deployment**
- **Hosting**: Vercel (recommended)
- **Database**: Supabase PostgreSQL

### 8.2 How the AI Chatbot Works

The chatbot uses **Mistral AI** for:

1. **Semantic Location Interpretation**
   - Understands natural language queries
   - Maps airports to cities (UIO → Quito, GYE → Guayaquil)
   - Recognizes points of interest (La Carolina Park → Quito)
   - Handles regional searches (Sierra, Coast, etc.)

2. **Intelligent Filtering**
   - Compares user query with:
     - Hotel city
     - Region (Sierra, Costa, Amazonía, Galápagos)
     - Full address
     - Location phrase
     - Surroundings (6 important points)
   
3. **High Precision**
   - Prioritizes exact city matches
   - Avoids mixing hotels from different cities
   - Handles ambiguous queries with deterministic rules

### 8.3 Three-Step Filtering Logic

#### **Step 1: Hotel Type Filtering**
```typescript
// Frontend sends selected types separated by "|||"
const types = ["Hotel / Resort / 5* or 4*", "Hotel / 2* or 3*"]
message = `Location: ${location}\nHotel type: ${types.join('|||')}`
```

Backend filters hotels matching selected types.

#### **Step 2: Semantic Location Filtering**
```typescript
// Sends to Mistral AI:
// - Hotel inventory with locations
// - User query
// - Precision instructions

Mistral AI returns: ["hotelId1", "hotelId2", ...]
```

#### **Step 3: Airport Refinement** (if applicable)
```typescript
// If query mentions airports:
if (query.includes("aeropuerto") || query.includes("airport")) {
  // Only return hotels that explicitly mention airport proximity
  // in their fields (name, description, surroundings, etc.)
}
```

### 8.4 API Endpoints

#### **POST /api/hotels**
Creates a new hotel
```typescript
Body (FormData):
- name, region, city, description (required)
- websiteLink, bookingLink (optional)
- address, locationPhrase, hotelType (required)
- recreationAreas (required, comma-separated)
- surroundings (required, 6 comma-separated items)
- image (required, max 4MB)
```

#### **GET /api/hotels**
Lists hotels with optional filters
```typescript
Query params:
- status?: 'PENDING' | 'APPROVED' | 'REJECTED'
- region?: string
- city?: string
```

#### **PATCH /api/hotels/[id]**
Updates an existing hotel

#### **DELETE /api/hotels/[id]**
Deletes a hotel

#### **POST /api/chat**
Processes chatbot queries
```typescript
Body:
{
  "message": "Location: {location}\nHotel type: {types|||separated}",
  "sessionId": "unique-session-id",
  "lang"?: "es" | "en"
}
```

### 8.5 Admin Panel

Access at `/admin` with credentials:
- **Username**: AHOTEC2025
- **Password**: AHOTEC2025

Features:
- View all hotel submissions
- Approve/reject pending hotels
- Edit hotel information
- Delete hotels
- Real-time statistics dashboard
- Filter by status (All, Pending, Approved, Rejected)

---

## 📞 Contacto / Contact

Para más información / For more information:
- **Email**: info@ahotec.ec
- **Website**: https://ahotec.ec

---

**Desarrollado con ❤️ para la Federación Hotelera del Ecuador**
**Developed with ❤️ for the Ecuador Hotels Federation**

