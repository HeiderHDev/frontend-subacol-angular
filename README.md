# 🎬 MovieDB - Gestor de Películas

Una aplicación moderna desarrollada en **Angular 19** que consume la API de **The Movie Database (TMDB)** para gestionar películas con operaciones CRUD locales, construida siguiendo las mejores prácticas de desarrollo.

## 🚀 Características Principales

- ✅ **Angular 19** con Standalone Components
- ✅ **Angular Material** para UI/UX consistente
- ✅ **Signals** para manejo reactivo del estado
- ✅ **CRUD Local** sin envío de cambios a la API
- ✅ **Formularios Reactivos** tipados
- ✅ **Arquitectura Core-Feature-Shared**
- ✅ **Pruebas Unitarias** con Jasmine (Patrón AAA + Builder)
- ✅ **SCSS con BEM** para estilos organizados
- ✅ **Principios SOLID, DRY, KISS**
- ✅ **TypeScript estricto** (sin tipos `any`)

## 🏗️ Arquitectura del Proyecto

```
src/app/
├── core/                 # Servicios centrales y funcionalidad base
│   ├── components/       # Componentes globales (spinner, etc.)
│   ├── services/         # Servicios principales (loading, toast)
│   └── interceptors/     # HTTP interceptors
├── features/             # Módulos de funcionalidad específica
│   └── movies/           # Feature de gestión de películas
│       ├── components/   # Componentes específicos de películas
│       ├── services/     # Servicios de películas (API, Store)
│       └── interfaces/   # Interfaces y tipos
├── shared/               # Componentes y utilidades reutilizables
│   └── components/ui/    # Componentes UI reutilizables
└── layout/               # Componentes de layout y navegación
```

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Angular 19.2.0** - Framework principal
- **Angular Material 19.2.19** - Biblioteca de componentes UI
- **RxJS 7.8.0** - Programación reactiva
- **TypeScript 5.7.2** - Tipado estático
- **SCSS** - Preprocesador CSS con metodología BEM

### Testing
- **Jasmine 5.6.0** - Framework de testing
- **Karma 6.4.0** - Test runner

### API Externa
- **The Movie Database (TMDB)** - API pública de películas

## 🔧 Configuración e Instalación

### Prerrequisitos
- Node.js 18+ 
- npm 9+
- Angular CLI 19+

### 1. Clonar el Repositorio
```bash
git clone [URL_DEL_REPOSITORIO]
cd frontend-subacol-angular
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar API Key de TMDB

1. Regístrate en [The Movie Database](https://www.themoviedb.org/)
2. Obtén tu API Key desde tu perfil → Settings → API
3. Crea el archivo de environments:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  tmdb: {
    apiKey: 'TU_API_KEY_AQUI',
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p',
    defaultLanguage: 'es-ES'
  }
};
```

### 4. Ejecutar la Aplicación
```bash
# Desarrollo
npm start
# o
ng serve

# La aplicación estará disponible en http://localhost:4200
```

## 🧪 Pruebas

### Ejecutar Pruebas Unitarias
```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar en modo watch
ng test

# Ejecutar sin watch (para CI/CD)
npm test -- --watch=false --browsers=ChromeHeadless

# Generar reporte de cobertura
ng test --code-coverage
```

### Cobertura de Pruebas
El proyecto incluye pruebas unitarias para:
- ✅ Servicios (MovieApiService, MovieStoreService)
- ✅ Componentes (CardComponent, SpinnerComponent)
- ✅ Interceptors (LoadingInterceptor)
- ✅ Patrones AAA (Arrange, Act, Assert)
- ✅ Patrón Builder para datos de prueba

## 🎯 Funcionalidades Implementadas

### 📚 Gestión de Películas
- **Listar películas** populares, en cartelera, mejor valoradas
- **Buscar películas** por título
- **Filtrar películas** por género, año, rating
- **Ordenar películas** por diferentes criterios

### ❤️ Operaciones CRUD Locales
- **Agregar a favoritos** - Marcar/desmarcar películas favoritas
- **Calificación personal** - Asignar rating personal (0-10)
- **Notas personales** - Añadir comentarios sobre películas
- **Estado de vista** - Marcar como vista/no vista
- **Eliminar de lista** - Remover películas localmente

### 🔍 Características Adicionales
- **Persistencia local** con localStorage
- **Filtros avanzados** (solo favoritas, solo vistas)
- **Interfaz responsive** con Material Design
- **Estados de carga** con spinners globales
- **Notificaciones** con toast messages
- **Manejo de errores** robusto

## 🎨 Metodología CSS - BEM

El proyecto utiliza la metodología **BEM (Block Element Modifier)** para organizar los estilos:

```scss
// Bloque
.card { }

// Elemento
.card__title { }
.card__image { }

// Modificador
.card--clickable { }
.card--loading { }
```

## 📊 Signals y Estado Reactivo

La aplicación utiliza **Angular Signals** para un manejo de estado moderno y reactivo:

```typescript
// Estado reactivo con signals
private readonly _movieState = signal<MovieState>({
  movies: [],
  favorites: [],
  isLoading: false
});

// Selectores computados
public readonly totalMovies = computed(() => this.movies().length);
public readonly isLoading = computed(() => this._movieState().isLoading);
```

## 🏛️ Principios de Diseño Aplicados

### SOLID
- **S** - Single Responsibility: Cada servicio tiene una responsabilidad específica
- **O** - Open/Closed: Componentes extensibles sin modificación
- **L** - Liskov Substitution: Interfaces bien definidas
- **I** - Interface Segregation: Interfaces específicas y cohesivas
- **D** - Dependency Inversion: Inyección de dependencias

### Otros Principios
- **DRY** - Don't Repeat Yourself: Componentes reutilizables
- **KISS** - Keep It Simple, Stupid: Código simple y mantenible
- **Composition over Inheritance**: Composición de componentes

## 📋 Scripts Disponibles

```json
{
  "start": "ng serve",
  "build": "ng build",
  "test": "ng test",
  "lint": "ng lint",
  "e2e": "ng e2e"
}
```

## 🔐 Variables de Entorno

```typescript
// Configuración de entorno
export interface Environment {
  production: boolean;
  tmdb: {
    apiKey: string;
    baseUrl: string;
    imageBaseUrl: string;
    defaultLanguage: string;
  };
}
```

## 🌟 Características Técnicas Destacadas

### Formularios Reactivos Tipados
```typescript
interface MovieFormData {
  personalRating: number | null;
  personalNotes: string;
  isFavorite: boolean;
}
```

### Manejo de Estado con Signals
```typescript
// Estado inmutable y reactivo
public readonly favorites = computed(() => 
  this.movies().filter(movie => movie.isFavorite)
);
```

### Interceptors HTTP
```typescript
// Interceptor global para estado de carga
export const loadingInterceptor = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  // Lógica de interceptor
};
```

## 🐛 Solución de Problemas

### Problemas Comunes

1. **Error de API Key**
   ```bash
   Error: Invalid API key
   ```
   - Verifica que tu API key esté configurada correctamente en `environment.ts`

2. **Problemas de CORS**
   - La API de TMDB permite requests desde cualquier origen

3. **Errores de TypeScript**
   - Asegúrate de usar TypeScript estricto sin tipos `any`

## 📝 Convenciones de Commits

El proyecto utiliza **Conventional Commits**:

```bash
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formateo de código
refactor: refactorización
test: añadir o corregir tests
```

## 👨‍💻 Autor

**Heider Hernandez**
- GitHub: [@HeiderHDev](https://github.com/HeiderHDev)
- LinkedIn: [heiderreyhernandez](https://www.linkedin.com/in/heiderreyhernandez/)

## 📚 Recursos Adicionales

- [Angular Documentation](https://angular.dev)
- [Angular Material](https://material.angular.io)
- [The Movie Database API](https://developers.themoviedb.org/3)
- [RxJS Documentation](https://rxjs.dev)
- [BEM Methodology](https://getbem.com)

---