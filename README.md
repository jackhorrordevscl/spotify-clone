# Spotify Clone 🎵

Una aplicación de streaming de música completa inspirada en Spotify, con soporte multi-plataforma (web, móvil) y un backend API robusto.

## ✨ Características principales

- **Autenticación de usuarios** - Registro y login con JWT
- **Gestión de canciones** - Subir, reproducir y administrar canciones
- **Playlists personalizadas** - Crear, editar y compartir playlists
- **Canciones favoritas** - Marcar canciones como "liked"
- **Álbumes** - Organizar canciones en álbumes
- **Almacenamiento en la nube** - Integración con Cloudinary para archivos de audio e imágenes
- **Aplicación multiplataforma** - Web (React), Móvil (React Native)

## 🏗️ Estructura del Proyecto

```
spotify-clon/
├── backend/                    # API REST con Express + TypeScript
│   ├── src/
│   │   ├── controllers/       # Lógica de negocio
│   │   ├── routes/            # Rutas de la API
│   │   ├── middlewares/       # Middlewares de autenticación
│   │   ├── config/            # Configuraciones (Prisma, Multer, Cloudinary)
│   │   └── types/             # Tipos TypeScript
│   ├── prisma/
│   │   ├── schema.prisma      # Esquema de base de datos
│   │   └── migrations/        # Migraciones de Prisma
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                  # Aplicación web con React + Vite
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   ├── pages/             # Páginas de la aplicación
│   │   ├── services/          # Servicios API (axios)
│   │   ├── store/             # Gestión de estado (Zustand)
│   │   ├── hooks/             # Custom hooks
│   │   └── App.tsx            # Componente principal
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   ├── vite.config.js
│   └── package.json
│
├── mobile/                    # Aplicación móvil con React Native + Expo
│   ├── src/
│   │   ├── components/        # Componentes React Native
│   │   ├── screens/           # Pantallas de la aplicación
│   │   ├── services/          # Servicios API
│   │   ├── store/             # Gestión de estado (Zustand)
│   │   ├── navigation/        # Navegación
│   │   ├── hooks/             # Custom hooks
│   │   └── theme/             # Temas y estilos
│   ├── App.tsx
│   ├── app.json
│   └── package.json
│
├── docker-compose.yml         # Orquestación de servicios (producción)
├── docker-compose.dev.yml     # Orquestación de servicios (desarrollo)
└── .env                       # Variables de entorno
```

## 🛠️ Stack Tecnológico

### Backend
- **Node.js 20** - Runtime de JavaScript
- **Express 5** - Framework web
- **TypeScript 5.9** - Tipado estático
- **Prisma 7.5** - ORM para PostgreSQL
- **PostgreSQL 16** - Base de datos
- **JWT** - Autenticación
- **Bcryptjs** - Hash de contraseñas
- **Cloudinary** - Almacenamiento de archivos
- **Multer** - Upload de archivos
- **CORS** - Gestión de CORS

### Frontend (Web)
- **React 19** - Librería UI
- **Vite 7** - Build tool
- **TypeScript 5.9** - Tipado estático
- **React Router DOM 7** - Enrutamiento
- **Tailwind CSS 4** - Estilos
- **Zustand 5** - Gestión de estado
- **Axios** - Cliente HTTP
- **Howler.js** - Reproductor de audio
- **Lucide React** - Iconos

### Mobile (React Native)
- **React Native 0.83** - Framework UI nativo
- **Expo 55** - Plataforma de desarrollo
- **React Navigation 7** - Navegación
- **Zustand 5** - Gestión de estado
- **Expo Audio/AV** - Reproducción de audio
- **Expo Secure Store** - Almacenamiento seguro
- **Axios** - Cliente HTTP

## 📋 Requisitos Previos

- **Node.js 20+** - [Descargar](https://nodejs.org)
- **npm** o **yarn** - Gestor de paquetes
- **Docker & Docker Compose** - Para ejecutar con contenedores
- **PostgreSQL 16** - Base de datos (si no usas Docker)
- **Cuenta en Cloudinary** - Para almacenamiento de archivos
- **Expo CLI** - Para desarrollo mobile: `npm install -g expo-cli`

## 🚀 Guía de Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/spotify-clon.git
cd spotify-clon
```

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos
POSTGRES_DB=spotify_clone
POSTGRES_USER=spotify_user
POSTGRES_PASSWORD=tu_password_aqui

# Backend
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}

# JWT
JWT_SECRET=tu_jwt_secret_aqui

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# Frontend
VITE_API_URL=http://localhost:3001/api
```

## 📦 Instalación sin Docker

### Backend

```bash
cd backend

# Instalar dependencias
npm install

# Configurar base de datos
npm run migrate

# Iniciar desarrollo
npm run dev

# En otra terminal, para build:
npm run build
```

El servidor Backend estará disponible en `http://localhost:3001`

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build
```

La aplicación web estará disponible en `http://localhost:5173`

### Mobile

```bash
cd mobile

# Instalar dependencias
npm install

# Iniciar Expo
npm start

# Opciones:
# android - Ejecutar en Android
# ios - Ejecutar en iOS
# web - Ejecutar en navegador
```

## 🐳 Instalación con Docker

### Desarrollo

```bash
docker-compose -f docker-compose.dev.yml up --build
```

### Producción

```bash
docker-compose up --build -d
```

Los servicios estarán disponibles en:
- **Backend**: `http://localhost:3001`
- **Frontend**: `http://localhost:80`
- **PostgreSQL**: `localhost:5432`

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### Canciones
- `GET /api/songs` - Obtener todas las canciones
- `GET /api/songs/:id` - Obtener canción por ID
- `POST /api/songs` - Crear canción (upload)
- `PUT /api/songs/:id` - Actualizar canción
- `DELETE /api/songs/:id` - Eliminar canción

### Playlists
- `GET /api/playlists` - Obtener playlists del usuario
- `GET /api/playlists/:id` - Obtener playlist por ID
- `POST /api/playlists` - Crear playlist
- `PUT /api/playlists/:id` - Actualizar playlist
- `DELETE /api/playlists/:id` - Eliminar playlist
- `POST /api/playlists/:id/songs` - Agregar canción a playlist
- `DELETE /api/playlists/:id/songs/:songId` - Remover canción de playlist

### Canciones Favoritas
- `GET /api/liked` - Obtener canciones favoritas
- `POST /api/liked/:songId` - Marcar como favorita
- `DELETE /api/liked/:songId` - Remover de favoritas

## 📊 Modelo de Datos

### Usuario (User)
```typescript
{
  id: string (UUID)
  email: string (única)
  password: string (hasheada)
  name: string
  avatarUrl?: string
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relaciones
  songs: Song[]
  playlists: Playlist[]
  likedSongs: LikedSong[]
}
```

### Canción (Song)
```typescript
{
  id: string (UUID)
  title: string
  duration: number (segundos)
  audioUrl: string (Cloudinary)
  coverUrl?: string
  plays: number
  createdAt: DateTime
  
  // Relaciones
  authorId: string
  author: User
  albumId?: string
  album?: Album
  likedBy: LikedSong[]
  playlists: PlaylistSong[]
}
```

### Playlist (Playlist)
```typescript
{
  id: string (UUID)
  title: string
  coverUrl?: string
  createdAt: DateTime
  updatedAt: DateTime
  
  // Relaciones
  userId: string
  user: User
  songs: PlaylistSong[]
}
```

## 🔐 Autenticación

La aplicación utiliza **JWT (JSON Web Tokens)** para autenticación:

1. El usuario se registra o inicia sesión
2. El servidor devuelve un token JWT
3. El cliente envía el token en el header `Authorization: Bearer <token>`
4. El servidor valida el token en cada solicitud

Las contraseñas se hashean con **bcryptjs** antes de almacenarlas.

## 📁 Configuración de Multer

Multer está configurado para manejar uploads de archivos:
- Ubicación temporal: `/uploads`
- Ficheros soportados: Audio (mp3, wav, etc.), Imágenes (jpeg, png, etc.)
- Los archivos se suben a Cloudinary después de procesados

## ☁️ Cloudinary Integration

Cloudinary se utiliza para almacenar:
- **Archivos de audio**: Canciones/Tracks
- **Imágenes**: Covers de playlists, álbumes y avatares de usuario

Asegúrate de configurar las credenciales en el archivo `.env`

## 📱 Desarrollo Mobile

### Ejecutar en emulador Android/iOS

```bash
cd mobile

# Android
npm run android

# iOS (solo en macOS)
npm run ios
```

### Ejecutar en navegador

```bash
npm run web
```

## 🧪 Próximas Mejoras (Roadmap)

- [ ] Búsqueda de canciones avanzada
- [ ] Recomendaciones personalizadas
- [ ] Historial de reproducción
- [ ] Sincronización de múltiples dispositivos
- [ ] Modo offline
- [ ] Integración con Spotify API
- [ ] Sistema de seguimiento de artistas
- [ ] Estadísticas de reproducción
- [ ] Funcionalidad de social (compartir, seguir usuarios)

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu característica (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia ISC.

## ⚠️ Notas de Seguridad

- Nunca commits las variables de entorno con datos sensibles
- Usa variables de entorno para todos los datos sensibles
- Mantén las dependencias actualizadas: `npm update`
- Revisa vulnerabilidades: `npm audit`

## 📞 Soporte

Para reportar bugs o solicitar features, abre un issue en el repositorio.

## 🎯 Links Útiles

- [Documentación de Express](https://expressjs.com)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Documentación de React](https://react.dev)
- [Documentación de React Native](https://reactnative.dev)
- [Documentación de Expo](https://docs.expo.dev)
- [Documentación de Cloudinary](https://cloudinary.com/documentation)

---

**Hecho con ❤️ para amantes de la música**
