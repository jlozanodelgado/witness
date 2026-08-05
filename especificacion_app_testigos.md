# Documento de Especificación: App de Gestión de Testigos Electorales (Colombia)

## 1. Descripción General
Aplicación web/móvil para la gestión y control de la logística electoral en Colombia. Permite el monitoreo de testigos electorales, el registro de votantes y la consolidación de información desde las mesas de votación. 

**Stack Tecnológico:**
*   **Base de Datos y Autenticación:** Supabase (PostgreSQL).
*   **Seguridad:** Row Level Security (RLS) de Supabase estrictamente configurado para el control de acceso por roles.

---

## 2. Roles y Permisos (Supabase Auth)

El sistema cuenta con 3 roles activos que tienen acceso a la plataforma, y 1 entidad pasiva (Votantes).

### 2.1 Superadministrador
*   **Acceso:** Control total del sistema.
*   **Permisos:** Puede crear, leer, actualizar y eliminar (CRUD) cualquier registro.
*   **Funciones:** Gestiona roles de usuarios, asigna supervisores, tiene acceso a tableros de control (dashboards) globales con toda la información consolidada.

### 2.2 Supervisor
*   **Acceso:** Limitado a su jurisdicción (grupo de testigos, zonas y mesas asignadas).
*   **Permisos:** 
    *   Ver y gestionar la información de los **Testigos** que están bajo su cargo.
    *   Asignar/modificar información de testigos específicos.
    *   Ver las **Zonas y Mesas de Votación** asignadas a su grupo.
    *   Registrar, visualizar y gestionar los **Votantes** que están bajo su control para llevar el seguimiento de dónde votan.

### 2.3 Testigo (Testigo Electoral)
*   **Acceso:** Limitado estrictamente a su Zona y Mesa(s) de votación asignada.
*   **Permisos:** 
    *   Ver la información de su puesto de votación (Zona/Mesa).
    *   Subir información/reportes de su mesa (ej. conteo de votos, fotos de formularios E-14, reportes de incidencias).
    *   **Restricción:** No puede ver datos de otras mesas, ni información de otros testigos, ni la lista de votantes del supervisor.

### 2.4 Votantes (Entidad Pasiva)
*   **Acceso:** No tienen login en la aplicación.
*   **Uso:** Son registros en la base de datos (creados por los Supervisores) para llevar el control logístico de asistencia y ubicación de votación.

---

## 3. Arquitectura de Base de Datos (Esquema Supabase)

### Tablas Principales

**1. `perfiles` (Perfiles de Usuario extienden Supabase Auth)**
*   `id` (UUID, PK - Referencia a auth.users)
*   `nombre_completo` (Texto)
*   `cedula` (Texto, Único)
*   `rol` (Enum: 'superadmin', 'supervisor', 'testigo')
*   `supervisor_id` (UUID, FK a `perfiles.id` - Para enlazar testigos con su supervisor)

**2. `zonas_votacion` (Puestos de Votación)**
*   `id` (UUID, PK)
*   `nombre_puesto` (Texto)
*   `direccion` (Texto)
*   `municipio` (Texto)

**3. `mesas_votacion` (Mesas)**
*   `id` (UUID, PK)
*   `zona_id` (UUID, FK a `zonas_votacion`)
*   `numero_mesa` (Entero)
*   `testigo_asignado_id` (UUID, FK a `perfiles`, opcional/nullable)

**4. `votantes` (Control del Supervisor)**
*   `id` (UUID, PK)
*   `cedula` (Texto, Único)
*   `nombre_completo` (Texto)
*   `supervisor_id` (UUID, FK a `perfiles` - Quien lo registró)
*   `mesa_id` (UUID, FK a `mesas_votacion` - Dónde vota)
*   `voto_registrado` (Booleano - Para marcar si ya votó)

**5. `reportes_mesa` (Datos subidos por Testigos)**
*   `id` (UUID, PK)
*   `mesa_id` (UUID, FK a `mesas_votacion`)
*   `testigo_id` (UUID, FK a `perfiles`)
*   `total_votos` (Entero)
*   `foto_formulario_url` (Texto - URL de Supabase Storage)
*   `observaciones` (Texto)
*   `created_at` (Timestamp)

---

## 4. Requisitos de Seguridad (Row Level Security - RLS)
*   **Votantes:** `SELECT, INSERT, UPDATE` solo si `auth.uid() == supervisor_id` o si el rol del solicitante es `superadmin`.
*   **Testigos (Perfiles):** Un Supervisor solo puede consultar `perfiles` donde `perfiles.supervisor_id == auth.uid()`.
*   **Reportes:** Un Testigo solo puede hacer `INSERT` en `reportes_mesa` si su `auth.uid()` coincide con el `testigo_asignado_id` de esa mesa.

---

## 5. Gestión de Archivos y Formularios E-14 (Supabase Storage)

Para garantizar la transparencia y el respaldo de la información, la aplicación debe permitir a los Testigos capturar y subir la fotografía del formulario E-14 una vez finalizado el escrutinio de su mesa.

### 5.1 Estructura del Bucket (Almacenamiento)
*   **Nombre del Bucket:** `formularios_e14`
*   **Visibilidad:** Privado (Para evitar que cualquier persona externa pueda descargar los formularios sin autenticación).
*   **Estructura de Carpetas Sugerida:** `/{zona_id}/{mesa_id}/{nombre_archivo.jpg}`
    *(Esto facilita la organización y la aplicación de políticas de seguridad).*

### 5.2 Flujo de Carga (App para el Testigo)
1.  El Testigo usa la cámara desde la app o selecciona una foto de la galería.
2.  La app comprime la imagen (para ahorrar datos en zonas con mala conexión).
3.  La app sube la imagen al bucket `formularios_e14` de Supabase.
4.  Supabase devuelve la ruta del archivo.
5.  La app inserta un registro en la tabla `reportes_mesa` (definida en la sección 3), guardando esa ruta en el campo `foto_formulario_url` junto con los totales de los votos.

### 5.3 Políticas de Seguridad para Storage (Storage RLS)
Al igual que la base de datos, los archivos físicos deben tener seguridad:
*   **Permiso de Subida (INSERT):** Solo los usuarios con rol `testigo` autenticados pueden subir archivos a este bucket. Idealmente, solo pueden subir archivos con el prefijo de la mesa que tienen asignada.
*   **Permiso de Lectura (SELECT):** 
    *   El **Testigo** puede ver la foto que él mismo subió (por si necesita validar que quedó bien).
    *   El **Supervisor** puede leer/descargar las fotos de los formularios que pertenezcan a los testigos que él tiene a cargo.
    *   El **Superadministrador** tiene acceso de lectura total a todo el bucket.
*   **Permiso de Borrado/Edición (DELETE/UPDATE):** Bloqueado para Testigos y Supervisores. Una vez subido el E-14, no se puede alterar ni borrar para garantizar la cadena de custodia. Solo el Superadministrador podría hacerlo en casos excepcionales de error humano comprobado.

---
**Nota No Funcional para Frontend:** Agregar compresión de imágenes en el cliente (frontend) antes de enviarlas a Supabase Storage. El día de las elecciones las redes móviles pueden presentar intermitencia, por lo que subir imágenes optimizadas (ej. < 500KB) asegurará el éxito de la carga de los formularios E-14.
