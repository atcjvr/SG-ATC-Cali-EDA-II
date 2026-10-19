# SG-ATC Cali
## Sistema de Gestión de Controladores de Tránsito Aéreo

**Proyecto final – Estructura de Datos y Algoritmos II**

Universidad Autónoma de Occidente  
Ingeniería Informática  
Jorge Luis Velásquez Reina  
Código: 2240590  
2026
## 1. Tecnologías utilizadas

- React
- JavaScript
- Vite
- CSS
- Supabase
- PostgreSQL
- Git y GitHub
- Netlify

## 2. Estructuras de datos implementadas

El sistema utiliza cinco estructuras de datos:

| Estructura | Implementación | Función |
|---|---|---|
| Lista enlazada | LinkedList.js | Administración de controladores |
| Árbol de prefijos | Trie.js | Búsqueda de controladores por siglas |
| Cola | Queue.js | Gestión FIFO de solicitudes |
| Grafo | Graph.js | Relaciones entre controladores y habilitaciones |
| Montículo mínimo | MinHeap.js | Organización de prioridades |

Estas estructuras fueron desarrolladas en JavaScript y se encuentran en `src/structures/`.

## 3. Funcionalidades

SG-ATC Cali permite:

- Registrar y consultar controladores de tránsito aéreo.
- Administrar habilitaciones operativas.
- Registrar certificaciones de inglés OACI.
- Gestionar certificados médicos.
- Registrar cursos recurrentes.
- Administrar entrenamientos.
- Registrar y atender solicitudes mediante una cola FIFO.
- Consultar relaciones mediante grafos.
- Visualizar información organizada por prioridades.
- Buscar controladores mediante un árbol de prefijos.

## 4. Persistencia de datos

La aplicación utiliza Supabase como servicio de base de datos PostgreSQL.

Se implementaron las siguientes tablas:

- `controllers`
- `ratings`
- `english_certifications`
- `medical_certificates`
- `recurrent_courses`
- `trainings`
- `requests`

El sistema utiliza autenticación y políticas de seguridad Row Level Security (RLS) para controlar el acceso a la información.

Los registros se conservan después de cerrar o actualizar el navegador.

## 5. Acceso de demostración

El proyecto dispone de un usuario de demostración para que el docente pueda evaluar las funcionalidades del sistema.

**Usuario:**

`demo@sgatccali.test`

**Contraseña:**

`sgatc01`

Este usuario permite ingresar al sistema y realizar pruebas de las funcionalidades disponibles.

La información del usuario demo está separada de la información del administrador mediante las políticas de acceso de la base de datos.

**Nota:** Las credenciales administrativas no se publican en este repositorio.

## 6. Instalación local

Clonar el repositorio:

```bash
git clone https://github.com/atcjvr/SG-ATC-Cali-EDA-II.git
```

Ingresar al directorio:

```bash
cd SG-ATC-Cali-EDA-II
```

Instalar dependencias:

```bash
npm install
```

Crear un archivo `.env.local` con las variables públicas del proyecto Supabase:

```env
VITE_SUPABASE_URL=URL_DEL_PROYECTO
VITE_SUPABASE_PUBLISHABLE_KEY=CLAVE_PUBLICA
```

Iniciar la aplicación:

```bash
npm run dev
```

Abrir la dirección local indicada por Vite.

## 7. Compilación

Para generar la versión de producción:

```bash
npm run build
```

Los archivos compilados se generan en la carpeta `dist`.

## 8. Despliegue

La aplicación está preparada para publicarse en Netlify.

Configuración:

- Rama: `main`
- Comando de compilación: `npm run build`
- Directorio de publicación: `dist`

Las variables de entorno de Supabase deben configurarse en Netlify.

**Aplicación publicada:**

[ENLACE DE NETLIFY PENDIENTE]

## 9. Pruebas

El proyecto incluye archivos de prueba para verificar las estructuras de datos y diferentes operaciones del sistema.

Las pruebas permiten comprobar el comportamiento de listas enlazadas, colas, árboles de prefijos, grafos y montículos.

También se han realizado pruebas funcionales de registro, consulta y recuperación de información almacenada en PostgreSQL.

## 10. Repositorio

https://github.com/atcjvr/SG-ATC-Cali-EDA-II

## 11. Información académica

**Universidad:** Universidad Autónoma de Occidente (UAO)

**Programa académico:** Ingeniería Informática

**Asignatura:** Estructura de Datos y Algoritmos II

**Estudiante:** Jorge Luis Velásquez Reina

**Código estudiantil:** 2240590

**Proyecto:** SG-ATC Cali – Sistema de Gestión de Controladores de Tránsito Aéreo

**Año:** 2026