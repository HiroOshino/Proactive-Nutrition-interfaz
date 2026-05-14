# Proactive Nutrition - Gestión de Inventario Deportivo

**Proactive Nutrition** es una solución integral diseñada para la gestión eficiente de inventarios y personal en almacenes deportivos. Este sistema combina un robusto backend desarrollado en **Spring Boot** con una interfaz de usuario ágil y moderna.

---

##Requisitos del Sistema (Windows)
Para desplegar esta solución en un entorno Windows, asegúrese de contar con:
* **Java JDK 17** o superior.
* **Maven** (gestionado a través de IntelliJ IDEA o independiente).
* **Navegador Web** actualizado (Chrome, Edge o Firefox).
* **Git** (opcional, para clonar el repositorio).

---

## Guía de Instalación y Despliegue

Siga estos pasos para poner el sistema en marcha:

### 1. Clonación y Preparación
Descargue el código fuente desde el repositorio o extraiga el archivo comprimido en una carpeta local (Ej: `C:\Proyectos\SportiveDexter`).

### 2. Ejecución del Backend (Servidor)
1. Abra la carpeta `Back` en **IntelliJ IDEA**.
2. Espere a que Maven descargue las dependencias (verá una barra de progreso en la esquina inferior derecha).
3. Localice la clase principal en `src/main/java/TrabajoAPI/ApiApplication.java`.
4. Haga clic derecho y seleccione **Run 'ApiApplication'**.
5. El servidor estará activo cuando vea el mensaje: `Started ApiApplication in X.XXX seconds` en la consola (Puerto: 8080).

### 3. Ejecución del Frontend (Interfaz)
1. Navegue a la carpeta raíz del proyecto.
2. Haga clic derecho sobre el archivo `index.html` y seleccione **Abrir con > Su navegador preferido**.
3. ¡Listo! Ya puede navegar por el Dashboard, gestionar productos y usuarios.

---

## Diseño UI/UX y Estilos
El sistema ha sido desarrollado bajo principios de **Diseño Centrado en el Usuario**:
* **Prototipado:** Estructura tipo SPA (Single Page Application) que evita recargas innecesarias de página, mejorando la velocidad de respuesta.
* **Jerarquía Visual:** Uso de colores semánticos (Rojo para alertas críticas, Naranja para bajo stock y Verde para inventario óptimo) que permiten una toma de decisiones rápida.
* **Accesibilidad:** Menús laterales colapsables y botones de acción clara para facilitar la navegación a cualquier tipo de usuario (Vendedor o Administrador).
* **Estilo:** Diseño sobrio y funcional, enfocado en la productividad operativa del almacén.

---

## Funcionalidades Principales (CRUD)
* **Gestión de Inventario:** Registro, consulta, edición y eliminación de productos deportivos con control de stock y ubicación.
* **Gestión de Usuarios:** Control de personal con asignación de roles (Owner, Admin, Vendedor, Almacenista).
* **Análisis de Datos:** Dashboard en tiempo real con estadísticas generales y alertas automáticas de reabastecimiento.

---
Autor
* **Juan Sebastian Perez Poveda** (HiroOshino)
* Estudiante de Ingeniería de Software - **FET**
