# Smart Travel Planner

Aplicación web para la planificación y gestión de viajes personalizados. Permite a los usuarios crear itinerarios, organizar actividades en un calendario interactivo, visualizar ubicaciones en un mapa y explorar viajes públicos de otros usuarios.

---

## Índice

1. [Visión general](#1-visión-general)
2. [Funcionalidades principales](#2-funcionalidades-principales)
3. [Tech Stack](#3-tech-stack)
4. [Primeros pasos](#4-primeros-pasos)
5. [Estructura del proyecto](#5-estructura-del-proyecto)
6. [Flujo de autenticación](#6-flujo-de-autenticación)
7. [Rutas de la aplicación](#7-rutas-de-la-aplicación)
8. [Arquitectura de componentes](#8-arquitectura-de-componentes)
9. [Roles y permisos](#9-roles-y-permisos)
10. [Tests](#10-tests)
11. [Decisiones técnicas](#11-decisiones-técnicas)
12. [Capturas de pantalla](#12-capturas-de-pantalla)
13. [Demo](#13-demo)
14. [Repositorio del backend](#14-repositorio-del-backend)
15. [Licencia](#15-licencia)

---

## 1. Visión general

Smart Travel Planner es una aplicación full-stack que permite a los usuarios crear y gestionar viajes personalizados con un enfoque en la planificación detallada. Cada viaje puede contener actividades categorizadas, ubicadas en un mapa interactivo y organizadas en un calendario cronológico. Los viajes pueden marcarse como públicos para que otros usuarios los exploren.

---

## 2. Funcionalidades principales

- **Autenticación**: Registro e inicio de sesión con JWT
- **Gestión de viajes**: CRUD completo con filtrado por tipo (propios / públicos) y por fechas
- **Vista dual según rol**:
  - El creador del viaje accede a una vista de planificación con calendario y lista de actividades
  - Los visitantes acceden a una vista de exploración con mapa interactivo y drawer de solo lectura
- **Gestión de actividades**: CRUD con categorías, horarios, costes y ubicaciones
- **Calendario interactivo**: Visualización de actividades con FullCalendar, con soporte para drag & drop
- **Mapa interactivo**: Marcadores de actividades con Leaflet, resaltado al seleccionar una actividad y geolocalización del usuario
- **Drawer de actividad**: Panel lateral (bottom sheet en móvil) con detalle completo de la actividad, incluyendo imagen de la ubicación si está disponible
- **Gestión de ubicaciones**: Creación de localizaciones reutilizables con selección en mapa
- **Consulta agéntica IA**: Búsqueda de requisitos del viaje mediante un agente de IA
- **Diseño responsive**: Mobile-first con Tailwind CSS

---

## 3. Tech Stack

| Tecnología | Versión | Uso |
|---|---|---|
| [Angular](https://angular.dev/) | 21.x | Framework principal |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | Lenguaje de programación |
| [Tailwind CSS](https://tailwindcss.com/) | 4.x | Estilos |
| [Angular Material](https://material.angular.io/) | 19.x | Componentes UI (iconos, dialogs) |
| [Leaflet](https://leafletjs.com/) | 1.x | Mapas interactivos |
| [FullCalendar](https://fullcalendar.io/) | 6.x | Calendario de actividades |
| [Vitest](https://vitest.dev/) | - | Tests unitarios |

---

## 4. Primeros pasos

### Requisitos previos

- Node.js v18 o superior
- npm v9 o superior
- Backend de Smart Travel Planner en ejecución ([ver repositorio](https://github.com/Smart-Travel-Planner/smart-travel-planner-api))

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Smart-Travel-Planner/smart-travel-planner-web
cd smart-travel-planner-web

# Instalar dependencias
npm install
```

### Variables de entorno

El archivo `src/app/environments/environment.ts` contiene la URL base de la API:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

Para producción, edita `environment.prod.ts` con la URL del backend desplegado.

### Ejecución

```bash
# Desarrollo
ng serve

# Producción
ng build --configuration production
```

La aplicación estará disponible en `http://localhost:4200`

---

## 5. Estructura del proyecto

```
src/app/
├── core/
│   ├── enums/              # Categorías de actividades y colores
│   ├── guards/             # AuthGuard para rutas protegidas
│   ├── interceptors/       # JWT interceptor y error interceptor
│   ├── models/             # Interfaces TypeScript (Trip, Activity, Location...)
│   ├── services/           # Servicios de API (trips, activities, locations, map, geocoding...)
│   └── utils/              # Utilidades (date.utils)
│
├── features/
│   ├── auth/
│   │   ├── login/                      # Pantalla de inicio de sesión
│   │   └── register/                   # Pantalla de registro
│   ├── activities/
│   │   ├── activity-form/              # Formulario de creación/edición de actividad
│   │   ├── activity-list/              # Listado de actividades con mapa y drawer
│   │   └── location-dialog/            # Diálogo de creación de ubicación
│   ├── calendar/                       # Componente de calendario (FullCalendar)
│   └── trips/
│       ├── trip-detail/                # Shell del detalle del viaje
│       ├── trip-explorer/              # Vista pública: mapa + lista (visitantes)
│       ├── trip-form/                  # Formulario de creación/edición de viaje
│       ├── trip-list/                  # Listado de viajes con filtros
│       ├── trip-planner/               # Vista de planificación: calendario + lista (owner)
│       └── trip-requirements-dialog/   # Vista de requisitos del viaje: datos devueltos por el agente IA
│
└── shared/
    ├── components/
    │   ├── back-button/                # Botón de navegación atrás
    │   ├── confirm-dialog/             # Diálogo de confirmación reutilizable
    │   ├── auth-error-dialog/          # Diálogo de error de autenticación
    │   └── map/                        # Componente de mapa Leaflet reutilizable
    ├── footer/                         # Footer de la aplicación
    ├── home/                           # Pantalla de inicio con carrusel
    ├── navbar/                         # Barra de navegación
    └── pipes/
        └── format-date-pipe            # Pipe de formateo de fechas
```

---

## 6. Flujo de autenticación

1. El usuario se registra o inicia sesión a través de `POST /auth/register` o `POST /auth/login`
2. El backend devuelve un `access_token` JWT
3. El token se almacena en `localStorage` y se adjunta automáticamente en cada request mediante el `JwtInterceptor`
4. El `AuthGuard` protege las rutas privadas redirigiendo a `/login` si no hay token válido
5. El `ErrorInterceptor` gestiona los errores 401, mostrando un diálogo de sesión expirada

---

## 7. Rutas de la aplicación

| Ruta | Componente | Protegida |
|---|---|---|
| `/` | HomeComponent | No |
| `/login` | LoginComponent | No |
| `/register` | RegisterComponent | No |
| `/trips` | TripListComponent | Sí |
| `/trips/new` | TripFormComponent | Sí |
| `/trips/:id` | TripDetailComponent | Sí |
| `/trips/:id/edit` | TripFormComponent | Sí |
| `/trips/:id/activities` | ActivityListComponent | Sí |
| `/trips/:id/activities/new` | ActivityFormComponent | Sí |
| `/trips/:id/activities/:id/edit` | ActivityFormComponent | Sí |

---

## 8. Arquitectura de componentes

### Vista dual en `trip-detail`

`TripDetailComponent` actúa como shell: carga el viaje, las actividades y las ubicaciones una sola vez y los pasa como `@Input` a los componentes hijos según el rol del usuario:

```
TripDetailComponent (shell)
├── TripPlannerComponent   → si isOwner()  → calendario + lista + acceso al mapa
└── TripExplorerComponent  → si !isOwner() → mapa + lista + drawer solo lectura
```

### Componente de mapa reutilizable

`MapComponent` funciona en dos modos configurables:
- `mode="view"` — muestra marcadores de actividades y ubicaciones
- `mode="select"` — permite seleccionar una ubicación haciendo clic en el mapa

### Drawer de actividad

El drawer se implementa como bottom sheet en móvil y panel lateral en desktop, con animación CSS. En `activity-list` incluye botones de edición y eliminación; en `trip-explorer` es de solo lectura.

---

## 9. Roles y permisos

La aplicación diferencia dos tipos de acceso a un viaje:

| Acción | Owner | Visitante (viaje público) |
|---|---|---|
| Ver datos del viaje | ✅ | ✅ |
| Ver calendario | ✅ | ❌ |
| Ver mapa con actividades | ✅ | ✅ |
| Ver detalle de actividad (drawer) | ✅ | ✅ (solo lectura) |
| Crear / editar / eliminar actividades | ✅ | ❌ |
| Editar / eliminar el viaje | ✅ | ❌ |

---

## 10. Tests

El proyecto incluye tests unitarios de los módulos más críticos.

```bash
# Ejecutar todos los tests
npm test

# Ejecutar con informe de cobertura
npm run test -- --coverage
```

Los tests cubren: guards, interceptors, servicios (auth, trips, activities, locations, map, geocoding, navigation, notification) y pipes.

---

## 11. Decisiones técnicas

### Angular Signals sobre RxJS para estado local
Se utilizan Signals para la gestión del estado de los componentes por su simplicidad, mejor rendimiento y menor boilerplate. RxJS se mantiene para las llamadas HTTP a través de `HttpClient`.

### `computed()` sobre `signal()` para datos derivados
Los mapas de localización (`locationMap`) se implementan como `computed()` derivados del array de locations, evitando sincronización manual y garantizando reactividad automática.

### Shell pattern en `trip-detail`
`TripDetailComponent` centraliza la carga de datos (una sola llamada a la API por recurso) y los distribuye mediante `@Input` a `TripPlannerComponent` y `TripExplorerComponent`, evitando llamadas duplicadas y manteniendo los componentes hijos sin lógica de carga.

### `effect()` para inicialización dependiente de inputs
En `TripExplorerComponent`, la geocodificación del destino se lanza mediante `effect()` en lugar de `ngOnInit()`, garantizando que el valor del `input()` esté disponible en el momento de la ejecución.


---

## 12. Capturas de pantalla

### Login y Registro
![Login y Registro](/public/PantallaLogin.png)

### Listado de viajes
![Listado de viajes](/public/PantallaTripList.png)

### Detalle del viaje — Vista del owner
![Detalle del viaje](/public/PantallaTripDetail.gif)

### Listado de actividades con mapa
![Listado de actividades](/public/PantallaActivitiesList.png)

### Drawer de actividad
![Drawer de actividad](/public/PantallaDrawerActivity.png)

### Calendario con drag & drop
![Calendario](/public/PantallaCalendarDragAndDrop.gif)

---

## 13. Demo

Accede a la demo en producción: [smart-travel-planner-web.vercel.app](https://smart-travel-planner-web.vercel.app/)

---

## 14. Repositorio del backend

La API REST que alimenta esta aplicación está disponible en:
[github.com/Smart-Travel-Planner/smart-travel-planner-api](https://github.com/Smart-Travel-Planner/smart-travel-planner-api)

---

## 15. Licencia

Este proyecto está bajo la **Licencia Apache 2.0**. Para más detalles, consulta el archivo [LICENSE](./LICENSE) en este repositorio.
