#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🏨 Configurando AHOTEC Chatbot...\n')

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  console.log('📝 Creando archivo .env.local...')
  
  const envContent = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ahotect_chatbot"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Mistral AI
MISTRAL_API_KEY="your-mistral-api-key-here"

# JWT
JWT_SECRET="your-jwt-secret-here"
`
  
  fs.writeFileSync(envPath, envContent)
  console.log('✅ Archivo .env.local creado')
  console.log('⚠️  Recuerda configurar las variables de entorno con tus valores reales\n')
} else {
  console.log('✅ Archivo .env.local ya existe\n')
}

// Generate Prisma client
console.log('🗄️  Generando cliente de Prisma...')
try {
  require('child_process').execSync('npx prisma generate', { stdio: 'inherit' })
  console.log('✅ Cliente de Prisma generado\n')
} catch (error) {
  console.log('❌ Error generando cliente de Prisma')
  console.log('💡 Asegúrate de tener PostgreSQL instalado y configurado\n')
}

console.log('🎉 Configuración completada!')
console.log('\n📋 Próximos pasos:')
console.log('1. Configura las variables de entorno en .env.local')
console.log('2. Configura tu base de datos PostgreSQL')
console.log('3. Ejecuta: npx prisma db push')
console.log('4. Ejecuta: npm run dev')
console.log('\n🌐 URLs disponibles:')
console.log('- Página principal: http://localhost:3000')
console.log('- Panel de admin: http://localhost:3000/admin')
console.log('- Demo del widget: http://localhost:3000/widget-demo') 