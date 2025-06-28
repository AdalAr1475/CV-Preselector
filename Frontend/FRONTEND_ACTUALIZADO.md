# 🚀 Frontend Actualizado - CV Preselector con IA

## 📋 Nuevas Funcionalidades Agregadas

### 🎯 **Páginas Principales:**

1. **`/dashboard/documentos`** - Procesamiento de CVs con IA (Actualizada)
2. **`/dashboard/entrevistas`** - Generación de preguntas y evaluación de respuestas (Nueva)

---

## 📁 **Página de Documentos (`/dashboard/documentos`)**

### 🔧 **Funcionalidades:**

#### **Tab 1: Análisis Completo**
- **Upload de PDF** con selección de candidato y oferta
- **Procesamiento automático** usando `/procesamiento/analisis-completo/{candidato_id}/{oferta_id}`
- **Resultados completos:**
  - Datos extraídos del CV
  - Score de similitud semántica 
  - Nivel de compatibilidad (Excelente, Bueno, Regular, Bajo)
  - IDs de postulación generados

#### **Tab 2: Extraer CV**
- **Input de texto** para CVs copiados manualmente
- **Extracción estructurada** usando `/procesamiento/extraer-cv`
- **Visualización organizada:**
  - Información personal (nombre, email, teléfono)
  - Habilidades como badges
  - Experiencia laboral con timeline
  - Educación

#### **Tab 3: Similitud**
- **Comparación directa** entre CV y descripción de puesto
- **Score visual** con barra de progreso y porcentaje
- **Niveles de compatibilidad** con colores diferenciados
- **Recomendaciones automáticas** según el nivel

### 🎨 **Características UI:**
- **Diseño responsive** con grid adaptive
- **Loading states** con overlay y spinner
- **Toast notifications** para feedback
- **Badges coloridos** para scores y niveles
- **Tabs para organización** de funcionalidades

---

## 🎭 **Página de Entrevistas (`/dashboard/entrevistas`)**

### 🔧 **Funcionalidades:**

#### **Tab 1: Generar Preguntas**
- **Input dual** para CV del candidato y descripción del puesto
- **Generación automática** usando `/procesamiento/generar-preguntas`
- **Preguntas personalizadas** basadas en el perfil
- **Funciones de utilidad:**
  - Copiar preguntas al portapapeles
  - Usar primera pregunta para evaluación
  - Indicador de fuente (IA real vs simulado)

#### **Tab 2: Evaluar Respuestas**
- **Input de pregunta y respuesta** del candidato
- **Evaluación automática** usando `/procesamiento/evaluar-respuesta`
- **Scoring detallado:**
  - Relevancia (1-5)
  - Profundidad técnica (1-5)  
  - Claridad (1-5)
  - Identificación de desafíos y soluciones (1-5)
- **Feedback inteligente:**
  - Comentario detallado de la evaluación
  - Pregunta de seguimiento sugerida
  - Score promedio con colores
- **Funciones avanzadas:**
  - Usar pregunta de seguimiento automáticamente
  - Generar reporte completo
  - Copiar evaluación al portapapeles

### 🎨 **Características UI:**
- **Scoring visual** con badges coloridos según puntuación
- **Layout de dos columnas** para input y resultados
- **Feedback contextual** con notas y avisos
- **Interactividad avanzada** con botones de acción rápida

---

## 🔗 **API Integration (`lib/api.ts`)**

### 📡 **Nuevos Endpoints Agregados:**

```typescript
// 1. Extracción de datos de CV
export const extractCVData = (data: CVExtractionRequest) => ...

// 2. Cálculo de similitud semántica  
export const calculateSimilarity = (data: SimilarityRequest) => ...

// 3. Generación de preguntas de entrevista
export const generateInterviewQuestions = (data: QuestionGenerationRequest) => ...

// 4. Evaluación de respuestas
export const evaluateAnswer = (data: AnswerEvaluationRequest) => ...

// 5. Análisis completo de CV
export const completeAnalysis = (file: File, candidateId: number, offerId: number) => ...
```

### 🏗️ **Interfaces TypeScript:**
- **CVExtractionRequest/Response** - Para extracción de datos
- **SimilarityRequest/Response** - Para cálculo de similitud
- **QuestionGenerationRequest/Response** - Para generación de preguntas
- **AnswerEvaluationRequest/Response** - Para evaluación de respuestas
- **CompleteAnalysisResponse** - Para análisis completo

### 🛡️ **Manejo de Errores:**
- **Error logging** detallado en consola
- **Fallbacks graceful** cuando la IA no está disponible
- **Toast notifications** para feedback al usuario
- **Loading states** durante procesamiento

---

## 🧭 **Navegación Actualizada**

### 📍 **Nueva entrada en el menú:**
- **Icono:** MessageSquare (Lucide React)
- **Label:** "Entrevistas IA"
- **Ruta:** `/dashboard/entrevistas`

### 🎯 **Flujo de Usuario Completo:**

1. **Crear Candidato** → `/dashboard/candidatos`
2. **Subir CV y Analizar** → `/dashboard/documentos` (Tab: Análisis Completo)
3. **Generar Preguntas** → `/dashboard/entrevistas` (Tab: Generar Preguntas)
4. **Realizar Entrevista** → (Proceso manual)
5. **Evaluar Respuestas** → `/dashboard/entrevistas` (Tab: Evaluar Respuestas)

---

## 🚀 **Casos de Uso Principales**

### **Caso 1: Proceso de Selección Automatizado**
```
Candidato aplica → Upload PDF → Análisis completo → 
Ranking automático → Preguntas generadas → 
Entrevista → Evaluación IA → Decisión final
```

### **Caso 2: Evaluación de CVs Masiva**
```
Múltiples CVs → Extracción batch → Similitud vs ofertas → 
Ranking por score → Preselección automática
```

### **Caso 3: Entrevistas Asistidas por IA**
```
CV + Puesto → Preguntas personalizadas → 
Entrevista humana → Evaluación IA → 
Score objetivo → Feedback estructurado
```

---

## 🎨 **Características de UX/UI**

### ✨ **Elementos Visuales:**
- **Badges dinámicos** con colores según performance
- **Progress bars** para scores de similitud
- **Loading overlays** durante procesamiento IA
- **Toast notifications** para feedback inmediato
- **Responsive design** para todos los dispositivos

### 🔄 **Estados de Interacción:**
- **Loading states** durante llamadas API
- **Disabled states** para validación de formularios
- **Success/Error states** con feedback visual
- **Empty states** cuando no hay datos

### 📱 **Responsive Design:**
- **Grid adaptativo** (1 columna en móvil, 2 en desktop)
- **Tabs navigation** para organización en móvil
- **Fixed overlays** para loading en todas las pantallas

---

## 🛠️ **Configuración y Uso**

### **Variables de Entorno:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### **Comandos de Desarrollo:**
```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build para producción
npm run build
```

### **Dependencias Principales:**
- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Styling
- **Lucide React** - Iconos
- **shadcn/ui** - Componentes UI

---

## 🔮 **Próximas Mejoras Sugeridas**

1. **Dashboard de Analytics** - Métricas de entrevistas y scores
2. **Histórico de Evaluaciones** - Tracking de candidatos en el tiempo
3. **Comparación de Candidatos** - Vista side-by-side
4. **Exportación de Reportes** - PDF/Excel con evaluaciones
5. **Integración de Calendario** - Agendar entrevistas
6. **Notificaciones Push** - Alertas de nuevos candidatos
7. **Bulk Operations** - Procesamiento masivo de CVs
8. **Advanced Filtering** - Filtros por skills, experiencia, etc.

---

¡El frontend ahora está completamente integrado con todas las funcionalidades de IA del backend! 🎉
