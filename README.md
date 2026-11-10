# TimeTracker - Frontend (Control de Jornada Laboral)

Esta aplicación web sirve para la marcación de inicio, finalizacion y cronometro en tiempo real de jornadas laborales. creado con la versión 21 de [Angular CLI](https://github.com/angular/angular-cli), en el cual el usuario puede marcar la entrada y salida de 1 o varios turnos de trabajo al mismo tiempo. manteniendo el cronometro sin importar si se recarga o se cierra el aplicativo web.

Aplicacion web cliente desarrollada con **Angular 21**, **Angular Signals** y **Tailwind CSS** para la marcacion de inicio, finalizacion y cronometro en tiempo real de jornadas laborales.

---

## 1. Arquitectura y Decisiones de Diseño

* **Estructura Modular por Capas (Pages & Core):**  
  * `src/app/pages/home/`: Vista principal desacoplada con carga perezosa (*Lazy Loading* nativo).
  * `src/app/core/models/`: Interfaces fuertemente tipadas en TypeScript.
  * `src/app/core/services/`: Capa de comunicacion HTTP con inyeccion moderna (`inject()`).
  * `src/app/app.routes.ts`: Enrutamiento granular desacoplado del componente raiz.
* **Angular 21 Standalone:** Eliminacion completa de modulos heredados (`NgModules`). Componentes autosuficientes con carga eficiente.
* **Reactividad con Signals:** Manejo de estado centralizado con `signal()` y propiedades derivadas computadas con `computed()`. Actualizaciones precisas del DOM sin sobrecosto de detección de cambios ni fugas de memoria.
* **Cronometro Sincronizado contra Servidor (Resiliente a Recargas):**  
  El cronometro **no es un contador local aislado**. Se inicializa a partir de la fecha de entrada oficial provista por el backend (`started_at`). En cada segundo, calcula la diferencia en tiempo real contra el reloj del servidor. Si el usuario recarga la pagina, cambia de pestana o cambia de trabajador, el cronometro refleja de inmediato el tiempo real exacto.
* **Diseno con Tailwind CSS:**  
  Paleta en tema oscuro basada en verdes esmeralda (`emerald-950`, `emerald-700`, `emerald-400`) y pizarra (`slate-900`), ofreciendo una estetica limpia, profesional y descansada a la vista.

---

## 2. Requisitos Previos

* Node.js >= 18.x (Recomendado v20.x o v22.x).
* npm >= 9.x.
* Backend de Laravel activo en `http://127.0.0.1:8000`.

---

## 3. Instalacion y Puesta en Marcha

1. **Ubicarse en el directorio:**
   ```bash
   cd time-tracker-frontend
   ```

2. **Instalar paquetes:**
   ```bash
   npm install
   ```

3. **Iniciar el servidor local:**
   ```bash
   npm start
   ```
   La aplicacion se ejecutara en: `http://localhost:4200`

4. **Compilacion para produccion:**
   ```bash
   npm run build
   ```

---

## 4. Funcionalidades de la Interfaz

* **Identificacion por Codigo Unico:** Permite escribir el codigo del trabajador (ej. `EMP-101`).
* **Display Digital del Cronometro:** Muestra en tiempo real las horas, minutos y segundos (`HH:mm:ss`).
* **Control de Botones Inteligente:**
  * **Iniciar jornada:** Habilitado solo cuando el trabajador esta consultado y no tiene jornada activa.
  * **Terminar jornada:** Habilitado solo cuando existe una jornada activa en curso.
* **Gestion Visual de Errores:** Notificaciones legibles en pantalla para conflictos (HTTP 409), turnos no iniciados (HTTP 422) y trabajadores inactivos (HTTP 403).
* **Historial de Jornadas:** Tabla dinamica que expone las ultimas jornadas completadas con fecha, hora de entrada, hora de salida y tiempo total laborado.
