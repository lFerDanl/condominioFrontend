# SecureWatch - Sistema de Monitoreo de Seguridad

## Descripción

SecureWatch es un sistema de monitoreo de seguridad moderno y completo para condominios, que incluye gestión de cámaras IP, reconocimiento facial, y control de acceso.

## Características Principales

### 🎥 Dashboard de Monitoreo de Cámaras

#### Funcionalidades Implementadas:

1. **Gestión de Cámaras**
   - ✅ Agregar nuevas cámaras (IP y Webcam)
   - ✅ Eliminar cámaras existentes
   - ✅ Visualización en tiempo real
   - ✅ Control de grabación y audio
   - ✅ Estados de cámara (online/offline/maintenance)

2. **Tipos de Cámara Soportados**
   - **Cámaras IP**: Configuración completa con IP, puerto, usuario y contraseña
   - **Cámaras Web**: Acceso directo a webcam del dispositivo para pruebas

3. **Interfaz de Usuario**
   - ✅ Diseño responsive (móvil, tablet, desktop)
   - ✅ Sidebar colapsible con lista de cámaras
   - ✅ Controles de video (play/pause, zoom, rotación, audio)
   - ✅ Indicadores de estado en tiempo real
   - ✅ Modal para agregar cámaras

4. **Componentes del Dashboard**
   - **Header**: Navegación principal y estado del sistema
   - **Sidebar**: Lista de cámaras, estadísticas y alertas
   - **VideoFeed**: Visualización de video con controles
   - **QuickActions**: Acciones rápidas del sistema
   - **ActivityLog**: Registro de actividad reciente
   - **SystemStatus**: Estado del sistema y recursos

5. **Funcionalidades Avanzadas**
   - ✅ Integración con webcam real
   - ✅ Gestión de streams de video
   - ✅ Cleanup automático de recursos
   - ✅ Manejo de permisos de cámara
   - ✅ Alertas y notificaciones

### 🏗️ Arquitectura Técnica

#### Tecnologías Utilizadas:
- **Frontend**: Next.js 14 con TypeScript
- **UI**: Tailwind CSS
- **Iconos**: Lucide React
- **Estado**: React Hooks (useState, useEffect, useRef)

#### Estructura de Componentes:
```
src/
├── app/
│   └── dashboard/
│       └── page.tsx (Dashboard principal)
├── components/
│   └── dashboard/
│       ├── Header.tsx (Navegación y estado)
│       ├── Sidebar.tsx (Lista de cámaras y alertas)
│       ├── VideoFeed.tsx (Visualización de video)
│       ├── QuickActions.tsx (Acciones rápidas)
│       ├── ActivityLog.tsx (Registro de actividad)
│       └── SystemStatus.tsx (Estado del sistema)
```

### 📱 Características Responsive

- **Móvil**: Sidebar colapsible, controles optimizados
- **Tablet**: Layout adaptativo, mejor uso del espacio
- **Desktop**: Vista completa con sidebar fijo

### 🔧 Configuración de Cámaras

#### Cámaras IP:
- Dirección IP configurable
- Puerto personalizable (por defecto 554)
- Autenticación opcional (usuario/contraseña)
- Soporte para protocolos estándar

#### Cámaras Web:
- Acceso directo a webcam del dispositivo
- Permisos automáticos del navegador
- Ideal para pruebas y desarrollo
- Cleanup automático de streams

### 🚀 Instalación y Uso

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar en desarrollo:**
   ```bash
   npm run dev
   ```

3. **Acceder al dashboard:**
   ```
   http://localhost:3000/dashboard
   ```

### 🎯 Próximas Funcionalidades

- [ ] Integración con APIs de cámaras IP reales
- [ ] Sistema de grabación y almacenamiento
- [ ] Reconocimiento facial avanzado
- [ ] Notificaciones push
- [ ] Reportes automáticos
- [ ] Configuración de usuarios y permisos
- [ ] Integración con sistemas de alarma

### 📋 Estado del Proyecto

- ✅ Dashboard básico implementado
- ✅ Gestión de cámaras funcional
- ✅ Interfaz responsive completa
- ✅ Integración webcam básica
- 🔄 Integración con APIs externas
- 🔄 Sistema de autenticación
- 🔄 Base de datos y persistencia

### 🤝 Contribución

Este proyecto es parte del curso de Ingeniería de Software 1. Para contribuir:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

### 📄 Licencia

Este proyecto es para fines educativos como parte del curso de Ingeniería de Software 1.
