# Manual Técnico de Onboarding para Desarrolladores y QA — rnGuard

## Objetivo
- Proveer el contexto técnico necesario para empezar a trabajar en rnGuard.
- Establecer estándares de desarrollo, pruebas y entrega.
- Acelerar el ramp‑up de nuevos integrantes del equipo (dev/QA).

## Requisitos Previos
- `Node >= 18`, `npm` o `yarn`.
- Android: Android Studio, SDK y emulador (API 21+). 
- iOS: Xcode, CocoaPods (`bundle exec pod install` en `ios/`).
- Dispositivo físico recomendado para pruebas de cámara y notificaciones.

## Preparación del Entorno
- Instalar dependencias: `npm install`.
- Enlazar fuentes: `npx react-native-asset` si fuera necesario (config en `react-native.config.js`).
- Arranque local:
  - Android: `npm run android`.
  - iOS: `npm run ios`.
- Metro bundler: `npm start`.

## Estructura y Arquitectura
- Punto de entrada: `index.js` registra `App` (`index.js:5-9`).
- Composición de `App`: proveedores y navegación (`App.tsx:16-41`).
  - `NetworkProvider`: estado de red global (`mk/contexts/NetworkContext.tsx:21-72`).
  - `AxiosProvider` + `axiosInterceptors`: cliente HTTP y headers de token (`mk/contexts/AxiosContext.tsx:21-55`, `mk/interceptors/axiosInterceptors.tsx:4-24`).
  - `KeyboardProvider`: manejo de teclado.
  - `NavigationContainer` con `navigationRef`.
  - `AuthProvider`: sesión, login/logout, permisos y splash (`mk/contexts/AuthContext.tsx:36-302`).
  - `OneSignalContextProvider`: notificaciones push y estado de permisos (`mk/contexts/OneSignalContext.tsx:22-216`).
  - `InitProject`: listeners y enrutamiento desde push (`src/config/InitProject.tsx:8-115`).
  - `MyDrawer` → `Navigate` (Drawer + Stack) (`src/navigators/Drawer/Drawer.tsx:11-32`, `src/navigators/Navigate.tsx:6-96`).
- Separación de capas:
  - `src/`: características de negocio (pantallas, navegación, config).
  - `mk/`: librería interna (UI, hooks, contextos, estilos, utils).

## Conexiones Externas y Configuración
- Config en `src/config/config.tsx` con URLs y claves del entorno.
  - Por defecto `API_URL` apunta a DEMO y en `development` a DEV (`src/config/config.tsx:37-41`).
  - No exponer ni registrar secretos en logs.
  - Propuesta: migrar claves a variables de entorno seguras.

## Data Layer y Autenticación
- Cliente Axios desde contexto (`AxiosContext`).
- Interceptor añade `Authorization: Bearer <token>` desde `AsyncStorage` (`mk/interceptors/axiosInterceptors.tsx:5-20`).
- `useApi` realiza peticiones, administra loading/errores y navega a Login ante `401` (`mk/hooks/useApi.tsx:100-163`, `mk/hooks/useApi.tsx:155-157`).
- `AuthProvider`:
  - `login(credentials)`: guarda token y usuario, controla splash (`mk/contexts/AuthContext.tsx:195-238`).
  - `getUser()`: valida token y refresca datos (`mk/contexts/AuthContext.tsx:78-167`).
  - `logout()`: invalida sesión y limpia storage (`mk/contexts/AuthContext.tsx:240-267`).
  - `userCan(ability, action)`: permisos basados en habilidades (`mk/contexts/AuthContext.tsx:168-176`).

## Navegación
- Drawer externo con menú personalizado (`src/navigators/Drawer/Drawer.tsx`).
- Stack interno con carga perezosa por `getComponent` para performance (`src/navigators/Navigate.tsx:11-38`).
- Para agregar una pantalla:
  1. Crear el componente bajo `src/components/<Feature>/<Feature>.tsx`.
  2. Añadir entrada en `Navigate` usando `getComponent`.
  3. Opcional: sumar entrada al Drawer en `src/navigators/Drawer/Items/`.

## UI, Estilos y Componentes
- Sistema de temas y variables: `mk/styles/themes.tsx`.
  - Paleta `cssVar`, tipografías `FONTS` (Roboto en `assets/fonts/`).
- Componentes reutilizables:
  - Formularios: `mk/components/forms/*`.
  - UI básica: `mk/components/ui/*`.
  - Layout y utilidades: `mk/components/layout/*`.
- Convenciones:
  - Usar componentes de `mk/` antes de crear nuevos.
  - Evitar estilos hardcodeados; preferir `cssVar` y `FONTS`.

## Notificaciones y Tiempo Real
- OneSignal:
  - Inicialización, permisos, tokens y login de usuario (`mk/contexts/OneSignalContext.tsx:43-63`, `mk/contexts/OneSignalContext.tsx:155-189`).
  - Listeners de click/foreground y enrutamiento (`src/config/InitProject.tsx:70-111`).
- Event bus interno:
  - `useEvent(eventName, callback)` para comunicar módulos (`mk/hooks/useEvent.tsx:9-47`).
  - Ejemplo: `onReload` marca badges en Home (`src/components/Home/Home.tsx:139-158`).

## Desarrollo de Funcionalidades
- API y datos:
  - Preferir `useApi` con `execute(endpoint, method, payload)`.
  - Ordenamiento y manejo de estados según negocio (ejemplo en Home) (`src/components/Home/Home.tsx:176-194`).
- Formularios y validación:
  - Reglas con `mk/utils/validate/Rules.tsx` y helpers en `mk/utils/validations.tsx`.
  - Inputs y botones desde `mk/components/forms/*`.
- Permisos por rol:
  - Consultar `useAuth(ability, action)` o `userCan` antes de mostrar acciones.

## Estándares de Código
- ESLint: configuración base RN (`.eslintrc.js:1-9`).
- Prettier: estilo consistente (`.prettierrc.js:1-7`).
- TypeScript: `tsconfig` extiende configuración RN (`tsconfig.json:1-3`).
- Nomenclatura:
  - Archivos y carpetas en PascalCase para componentes.
  - Hooks en camelCase con prefijo `use`.

## Ejecución y Build
- Scripts útiles (`package.json:5-18`):
  - `npm start`, `npm run android`, `npm run ios`, `npm test`.
  - Builds Android: `apkdebug`, `apkandroid`, `abbstore`, `demo`, `demo-release`.
- iOS:
  - Revisar extensión de notificaciones en `ios/OneSignalNotificationServiceExtension/`.
  - Asegurar permisos y capabilities (Push, Background Modes).

## Pruebas (QA/Dev)
- Unit tests con Jest y `react-test-renderer` (ejemplo básico en `__tests__/App.test.tsx:9-13`).
- Recomendaciones:
  - Mock de red: simular `AxiosContext` o `axios`.
  - Mock de almacenamiento: `@react-native-async-storage/async-storage`.
  - Navegación: usar `@react-navigation/native` helpers para tests.
  - Eventos: validar `useEvent` con emisor global.
- Casos de prueba clave:
  - Autenticación: login válido/ inválido, expiración de token (`401`).
  - Home: carga de accesos, cambio de estados, QR.
  - Notificaciones: `click`, `foregroundWillDisplay` y enrutamiento.
  - Offline/online: transiciones de red (`mk/contexts/NetworkContext.tsx`).

## Troubleshooting
- `401` redirige a Login automáticamente (`mk/hooks/useApi.tsx:155-157`).
- Token ausente o inválido en `AsyncStorage` impide llamadas (ver interceptor).
- Permisos OneSignal no concedidos → solicitar y reintentar (`mk/contexts/OneSignalContext.tsx:145-154`).
- Fuentes no visibles → verificar `react-native.config.js` y `assets/fonts/`.
- Cámara/QR en emulador puede fallar; usar dispositivo físico.

## Seguridad y Buenas Prácticas
- No registrar tokens ni claves en consola.
- Rotar y proteger claves externas; evitar commits con secretos.
- Validar inputs en UI y servidor.
- Usar HTTPS y verificar errores de red antes de reintentos.

## Checklist de Onboarding
- Clonar repo y `npm install`.
- Configurar Android/iOS y ejecutar app.
- Leer `App.tsx`, `Navigate.tsx`, `AuthContext.tsx`, `useApi.tsx`.
- Correr `npm test` y agregar un test simple.
- Implementar una pantalla de ejemplo siguiendo convenciones.

## Contactos y Recursos
- Metro bundler, Flipper y DevTools para debugging.
- Documentar nuevos módulos con README local (cuando aplique).
- Mantener consistencia con componentes `mk/` y navegación `src/navigators/`.