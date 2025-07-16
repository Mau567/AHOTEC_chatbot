# AHOTEC Chatbot - Asociación de Hoteles del Ecuador

Un sistema completo de chatbot inteligente para la Asociación de Hoteles del Ecuador (AHOTEC) que permite a turistas y locales encontrar los mejores hoteles en Ecuador mediante inteligencia artificial.

## 🏨 **Características Principales**

### **1. Widget de Chat Flotante**
- Botón flotante que se puede integrar en el sitio web de AHOTEC
- Interfaz de chat intuitiva y responsive
- Temas personalizables (claro/oscuro)
- Posicionamiento configurable (esquina inferior derecha/izquierda)

### **2. Panel de Administración**
- Dashboard completo para gestionar solicitudes de hoteles
- Estadísticas en tiempo real (pendientes, aprobados, rechazados, pagados)
- Filtros por estado de solicitud
- Vista detallada de cada hotel
- Aprobación/rechazo de solicitudes
- Gestión de pagos

### **3. Formulario de Registro de Hoteles**
- Formulario completo para que hoteles se registren
- Campos: nombre, región, ciudad, descripción, amenities, link de reserva, tags
- Información de contacto del solicitante
- Validación de campos requeridos
- Confirmación de envío exitoso

### **4. Chatbot Inteligente**
- Integración con Mistral AI para respuestas inteligentes
- Base de datos de hoteles aprobados y pagados
- Respuestas en español
- Recomendaciones personalizadas por región y preferencias
- Historial de conversaciones

## 🚀 **Tecnologías Utilizadas**

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Base de Datos**: PostgreSQL con Prisma ORM
- **IA**: Mistral AI para el chatbot
- **Autenticación**: NextAuth.js
- **Hosting**: Vercel (recomendado)
- **Iconos**: Lucide React

## 📋 **Requisitos Previos**

- Node.js 18+
- PostgreSQL (local o en la nube)
- Cuenta de Mistral AI para la API key
- Cuenta de Vercel (opcional, para hosting)

## 🛠️ **Instalación y Configuración**

### 1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd AHOTECT_chatbot
```

### 2. **Instalar dependencias**
```bash
npm install
```

### 3. **Configurar variables de entorno**
Copia el archivo `env.example` a `.env.local` y configura las variables:

```bash
cp env.example .env.local
```

Edita `.env.local` con tus valores:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ahotect_chatbot"

# NextAuth
NEXTAUTH_SECRET="tu-secret-key-aqui"
NEXTAUTH_URL="http://localhost:3000"

# Mistral AI
MISTRAL_API_KEY="tu-mistral-api-key-aqui"

# JWT
JWT_SECRET="tu-jwt-secret-aqui"
```

### 4. **Configurar la base de datos**
```bash
# Generar el cliente de Prisma
npx prisma generate

# Ejecutar las migraciones
npx prisma db push

# (Opcional) Abrir Prisma Studio para ver la base de datos
npx prisma studio
```

### 5. **Ejecutar el proyecto**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 **Estructura del Proyecto**

```
AHOTECT_chatbot/
├── app/
│   ├── admin/
│   │   └── page.tsx              # Panel de administración
│   ├── api/
│   │   ├── chat/
│   │   │   └── route.ts          # API del chatbot
│   │   └── hotels/
│   │       ├── route.ts          # API de hoteles (GET/POST)
│   │       └── [id]/
│   │           └── route.ts      # API de hoteles (PATCH/DELETE)
│   ├── widget-demo/
│   │   └── page.tsx              # Demo del widget
│   ├── globals.css               # Estilos globales
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página principal
├── components/
│   └── ChatWidget.tsx            # Widget de chat flotante
├── lib/
│   ├── db.ts                     # Configuración de Prisma
│   └── mistral.ts                # Integración con Mistral AI
├── prisma/
│   └── schema.prisma             # Esquema de la base de datos
├── package.json
├── tailwind.config.js
└── README.md
```

## 🎯 **Páginas y Funcionalidades**

### **Página Principal (`/`)**
- Formulario de registro de hoteles
- Chatbot integrado para consultas
- Navegación al panel de administración

### **Panel de Administración (`/admin`)**
- Dashboard con estadísticas
- Lista de hoteles con filtros
- Gestión de solicitudes (aprobar/rechazar)
- Vista detallada de hoteles

### **Demo del Widget (`/widget-demo`)**
- Ejemplo de cómo se ve el widget integrado
- Contenido de ejemplo del sitio web de AHOTEC

## 🔧 **API Endpoints**

### **POST /api/hotels**
Registra un nuevo hotel
```json
{
  "name": "Hotel Ejemplo",
  "region": "Sierra",
  "city": "Quito",
  "description": "Descripción del hotel",
  "amenities": ["WiFi", "Piscina"],
  "bookingLink": "https://ejemplo.com",
  "tags": ["lujo", "familiar"],
  "submittedBy": "Juan Pérez",
  "contactEmail": "juan@ejemplo.com"
}
```

### **GET /api/hotels**
Obtiene la lista de hoteles con filtros opcionales
```
/api/hotels?status=PENDING&region=Sierra&city=Quito
```

### **PATCH /api/hotels/[id]**
Actualiza los datos de un hotel. Puede enviarse JSON o `multipart/form-data` si se va a subir una nueva imagen.
```json
{
  "status": "APPROVED",
  "approvedBy": "admin",
  "price": 100.00,
  "isPaid": true,
  "name": "Nuevo nombre",
  "region": "Costa"
  // ...otros campos
}
```

### **POST /api/chat**
Procesa mensajes del chatbot
```json
{
  "message": "Busco hoteles en Quito",
  "sessionId": "session_123"
}
```

## 🎨 **Personalización del Widget**

El widget de chat se puede personalizar con diferentes props:

```tsx
<ChatWidget 
  apiUrl="/api/chat"           // URL de la API
  theme="light"                // "light" o "dark"
  position="bottom-right"      // "bottom-right" o "bottom-left"
/>
```

## 💰 **Sistema de Pagos**

El sistema incluye un campo `isPaid` para gestionar qué hoteles han pagado por aparecer en el chatbot. Solo los hoteles aprobados y pagados aparecen en las recomendaciones del chatbot.

## 🚀 **Despliegue en Vercel**

1. **Conectar con GitHub**
   - Sube el código a un repositorio de GitHub
   - Conecta el repositorio con Vercel

2. **Configurar variables de entorno en Vercel**
   - Ve a Settings > Environment Variables
   - Agrega todas las variables del archivo `.env.local`

3. **Configurar la base de datos**
   - Usa Vercel Postgres o conecta una base de datos externa
   - Actualiza `DATABASE_URL` en las variables de entorno

4. **Desplegar**
   - Vercel detectará automáticamente que es un proyecto Next.js
   - El despliegue se realizará automáticamente

## 🔒 **Seguridad**

- Autenticación con NextAuth.js
- Validación de datos en el servidor
- Sanitización de inputs
- Rate limiting en las APIs
- Variables de entorno seguras

## 📈 **Próximas Mejoras**

- [ ] Sistema de pagos integrado (Stripe/PayPal)
- [ ] Notificaciones por email
- [ ] Dashboard de analytics
- [ ] Sistema de reseñas de hoteles
- [ ] Integración con sistemas de reserva
- [ ] App móvil
- [ ] Chatbot multilingüe
- [ ] Sistema de recomendaciones más avanzado

## 🤝 **Contribución**

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 **Contacto**

Para más información sobre el proyecto AHOTEC Chatbot, contacta a:
- **Email**: info@ahotec.ec
- **Sitio Web**: https://ahotec.ec

---

**Desarrollado con ❤️ para la Asociación de Hoteles del Ecuador** 