# 🤖 Chat con IA para Cannabis Medicinal - Guía de Configuración

## 📋 Descripción del Sistema

El sistema de Chat con IA integrado en BruceApp permite conversar con un experto virtual especializado en cannabis medicinal. La IA actúa como un profesor de la Universidad de Utah con más de 20 años de experiencia, proporcionando consejos personalizados basados en el contexto específico de cada cultivo.

### ✨ Funcionalidades Principales

1. **Chat Inteligente con Contexto**: La IA conoce todos los detalles de tu cultivo específico
2. **Análisis de Imágenes**: Sube fotos de tus plantas para diagnóstico visual
3. **Sistema de Comentarios**: Documenta observaciones y notas por cultivo
4. **Consejos Especializados**: Recomendaciones científicamente respaldadas
5. **Historial de Conversaciones**: Mantiene contexto de conversaciones anteriores

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias

```bash
# Instalar la nueva dependencia de OpenAI
npm install

# Si tienes problemas, puedes instalar manualmente:
npm install openai@^4.67.1
```

### 2. Configurar API Key de OpenAI

1. **Obtener API Key**:
   - Ve a [OpenAI Platform](https://platform.openai.com/api-keys)
   - Inicia sesión o crea una cuenta
   - Genera una nueva API key

2. **Configurar Variables de Entorno**:
   - Crea un archivo `.env.local` en la raíz del proyecto:
   ```bash
   # En la raíz de /Users/fede/Bruce/bruceapp/
   touch .env.local
   ```
   
   - Agrega tu API key al archivo `.env.local`:
   ```env
   # Configuración de OpenAI para el Chat con IA
   OPENAI_API_KEY=sk-tu-api-key-aqui
   
   # Configuración opcional
   APP_NAME="BruceApp - Cannabis Medicinal"
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

### 3. Iniciar la Aplicación

```bash
# Iniciar en modo desarrollo
npm run dev

# La aplicación estará disponible en:
# http://localhost:3000
```

## 📱 Cómo Usar el Sistema

### Acceder al Chat con IA

1. Ve a cualquier cultivo desde la página de cultivos
2. En la página de detalles del cultivo, verás 3 pestañas:
   - **Detalles**: Información técnica del cultivo
   - **Chat con IA**: Conversación con el experto virtual
   - **Comentarios**: Sistema de notas y observaciones

### Usando el Chat con IA

1. **Escribir Mensajes**:
   - Describe problemas, haz preguntas específicas
   - La IA conoce toda la información de tu cultivo

2. **Subir Imágenes**:
   - Haz clic en el ícono de imagen (📷)
   - Selecciona fotos de tus plantas
   - La IA analizará visualmente los problemas

3. **Ejemplos de Preguntas**:
   - "¿Cómo puedo mejorar la densidad de tricomas?"
   - "¿Estas hojas se ven normales?" (con foto)
   - "¿Cuándo debería cambiar a floración?"
   - "¿Qué EC recomiendas para esta genética?"

### Sistema de Comentarios

1. **Agregar Comentarios**:
   - Haz clic en "Nuevo Comentario"
   - Elige el tipo (Observación, Problema, Solución, etc.)
   - Asigna prioridad (Baja, Media, Alta, Crítica)

2. **Tipos de Comentarios**:
   - 👁️ Observación: Notas generales
   - ⚠️ Problema: Problemas detectados
   - ✅ Solución: Soluciones aplicadas
   - 🌱 Fertilización: Cambios de nutrientes
   - 💧 Riego: Manejo del agua
   - 🐛 Plagas: Control de plagas
   - 🏥 Enfermedad: Problemas de salud
   - 🌿 Cosecha: Información de cosecha
   - 🔧 Mantenimiento: Mantenimiento de equipos

## 🛠️ Estructura Técnica

### Archivos Creados/Modificados

1. **Tipos TypeScript**:
   - `src/types/chat.ts` - Definiciones de tipos para chat y comentarios

2. **APIs Backend**:
   - `src/app/api/chat/route.ts` - Integración con OpenAI
   - `src/app/api/comentarios/route.ts` - CRUD de comentarios
   - `src/app/api/comentarios/[id]/route.ts` - Operaciones individuales

3. **Servicios Client-Side**:
   - `src/lib/services/chat.ts` - Lógica de chat con IA
   - `src/lib/services/comentarios.ts` - Gestión de comentarios

4. **Componentes UI**:
   - `src/app/components/ChatIA.tsx` - Interfaz de chat
   - `src/app/components/ComentariosCultivo.tsx` - Sistema de comentarios

5. **Página Modificada**:
   - `src/app/cultivo/[id]/page.tsx` - Integración de nuevas funcionalidades

6. **Base de Datos**:
   - `db.json` - Actualizada con estructura de comentarios

### Modelos de IA Utilizados

- **GPT-4 Turbo**: Para conversaciones de texto
- **GPT-4 Vision**: Para análisis de imágenes
- **Temperatura 0.7**: Balance entre creatividad y precisión
- **Max Tokens 1500**: Respuestas detalladas pero eficientes

## 💰 Costos Estimados de OpenAI

### Precios Aproximados (Octubre 2024)
- **GPT-4 Turbo**: ~$0.01 por 1K tokens input, ~$0.03 por 1K tokens output
- **GPT-4 Vision**: ~$0.01 por imagen + tokens de texto

### Estimaciones de Uso
- **Conversación típica**: 500-1000 tokens ≈ $0.02-0.04
- **Análisis de imagen**: 1 imagen + respuesta ≈ $0.05-0.10
- **Uso mensual moderado**: ~$5-15 USD

## 🔧 Solución de Problemas

### Error: "Configuración de OpenAI no encontrada"
- Verifica que `.env.local` existe en la raíz del proyecto
- Confirma que `OPENAI_API_KEY` está correctamente configurada
- Reinicia el servidor de desarrollo (`npm run dev`)

### Error: "Rate limit exceeded"
- Has excedido el límite de peticiones por minuto
- Espera unos minutos antes de continuar
- Considera actualizar tu plan de OpenAI

### Error: "Insufficient quota"
- Tu cuenta de OpenAI ha agotado los créditos
- Agrega créditos en tu cuenta de OpenAI
- Verifica tu método de pago

### Chat no responde
- Verifica la conexión a internet
- Revisa la consola del navegador para errores
- Confirma que la API key es válida

## 🎯 Consejos de Uso

### Para Obtener Mejores Respuestas

1. **Sé Específico**:
   - "Las hojas inferiores se ven amarillas" en lugar de "problema con plantas"
   - Incluye detalles como semana de cultivo, último riego, cambios recientes

2. **Usa Imágenes**:
   - Las fotos permiten diagnósticos mucho más precisos
   - Toma fotos con buena iluminación
   - Incluye tanto hojas afectadas como sanas para comparación

3. **Proporciona Contexto**:
   - Menciona que otros síntomas has observado
   - Describe que has probado anteriormente
   - Indica urgencia del problema

### Mejores Prácticas

1. **Documenta en Comentarios**:
   - Agrega comentarios antes y después de implementar soluciones
   - Esto ayuda a la IA a aprender de tu historial

2. **Mantén Conversaciones Organizadas**:
   - Una conversación por problema específico
   - Usa el sistema de comentarios para documentación persistente

3. **Aprovecha el Contexto**:
   - La IA conoce tu setup específico (genética, sustrato, luces, etc.)
   - No necesitas repetir información básica del cultivo

## 📞 Soporte

Si tienes problemas técnicos:
1. Revisa esta guía de configuración
2. Verifica la consola de desarrollador (F12)
3. Consulta los logs del servidor (`npm run dev`)

¡Disfruta cultivando con tu asistente de IA especializado! 🌱🤖
