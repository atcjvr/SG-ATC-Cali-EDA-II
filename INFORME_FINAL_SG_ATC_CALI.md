SG-ATC Cali
Sistema de Gestión de Controladores de Tránsito Aéreo
Universidad: Universidad Autónoma de Occidente
Programa: Ingeniería Informática
Asignatura: Estructura de Datos y Algoritmos II
Estudiante: Jorge Luis Velásquez Reina
Código estudiantil: 2240590
Año: 2026
1. Introducción
El desarrollo de aplicaciones informáticas requiere implementar estructuras de datos que permitan organizar, almacenar, consultar y procesar información de manera eficiente. Estas estructuras constituyen una parte fundamental de la programación y permiten resolver problemas mediante algoritmos adecuados.
Para el proyecto final de la asignatura Estructura de Datos y Algoritmos II se desarrolló SG-ATC Cali, una aplicación web orientada a la gestión de información de controladores de tránsito aéreo.
La elección de este proyecto surge de la necesidad de organizar información relacionada con habilitaciones operativas, certificaciones de inglés, certificados médicos, cursos recurrentes, entrenamientos y solicitudes administrativas.
El sistema permite aplicar los conocimientos adquiridos durante el curso mediante la implementación de cinco estructuras de datos, integradas con una interfaz web y una base de datos PostgreSQL.
2. Objetivos
Objetivo general
Desarrollar una aplicación web para gestionar información de controladores de tránsito aéreo, utilizando estructuras de datos y algoritmos que permitan organizar y consultar la información.
Objetivos específicos
- Implementar cinco estructuras de datos mediante JavaScript.
- Desarrollar una interfaz web utilizando React.
- Integrar una base de datos PostgreSQL para almacenar información de manera persistente.
- Implementar mecanismos de búsqueda, organización y procesamiento de solicitudes.
- Publicar la aplicación para permitir su evaluación mediante internet.
3. Desarrollo del proyecto
SG-ATC Cali se desarrolló utilizando React y JavaScript, con Vite como herramienta de compilación.
El sistema está organizado mediante componentes que permiten gestionar diferentes aspectos de la información de los controladores.
Las principales funcionalidades son el registro de controladores, administración de habilitaciones, certificaciones de inglés OACI, certificados médicos, cursos recurrentes, entrenamientos y solicitudes.
3.1. Estructuras de datos implementadas
Estructura	Aplicación en SG-ATC Cali
Lista enlazada (LinkedList)	Organización y administración de los controladores registrados.
Árbol de prefijos (Trie)	Búsqueda de controladores mediante sus siglas.
Cola (Queue)	Administración de solicitudes mediante el principio FIFO.
Grafo (Graph)	Representación de relaciones entre controladores y habilitaciones.
Montículo mínimo (MinHeap)	Organización de elementos según criterios de prioridad.


Estas estructuras fueron implementadas en JavaScript y se encuentran en el directorio src/structures/.
Su integración permite demostrar cómo diferentes estructuras de datos pueden utilizarse dentro de una misma aplicación para resolver necesidades específicas.
3.2. Persistencia de datos
Para garantizar que la información permanezca disponible después de cerrar o actualizar el navegador, se integró Supabase como plataforma de servicios para PostgreSQL.
La base de datos contiene siete tablas principales:
Tabla	Información almacenada
controllers	Controladores de tránsito aéreo.
ratings	Habilitaciones operativas.
english_certifications	Certificaciones de inglés OACI.
medical_certificates	Certificados médicos.
recurrent_courses	Cursos recurrentes.
trainings	Entrenamientos realizados.
requests	Solicitudes registradas y su estado.


También se implementaron mecanismos de autenticación y políticas de seguridad mediante Row Level Security (RLS), que permiten separar la información de los usuarios autorizados.
3.3. Gestión de solicitudes mediante FIFO
Una de las funcionalidades desarrolladas es la administración de solicitudes mediante una cola.
Esta estructura aplica el principio First In, First Out (FIFO), según el cual la primera solicitud registrada es la primera que debe atenderse.
Las solicitudes se almacenan en PostgreSQL y se recuperan cuando el usuario vuelve a ingresar al sistema.
Durante las pruebas se verificó el registro y la atención de solicitudes, conservando sus identificadores originales y su información de creación.
4. Pruebas y funcionamiento
Durante el desarrollo se realizaron pruebas de las estructuras de datos y de las funcionalidades de la aplicación.
Se verificaron operaciones como el registro y consulta de controladores, administración de habilitaciones, almacenamiento de certificaciones, recuperación de información después de actualizar el navegador y atención de solicitudes.
También se comprobó la compilación del proyecto mediante el comando npm run build.
La aplicación fue publicada en Netlify y conectada con un repositorio independiente de GitHub.
5. Acceso al proyecto
Repositorio GitHub:
https://github.com/atcjvr/SG-ATC-Cali-EDA-II
Aplicación web:
https://sg-atc-cali-eda-ii.netlify.app
Usuario de demostración:
demo@sgatccali.test
La contraseña del usuario demo se encuentra indicada en el archivo README.md del repositorio, si se ha configurado allí.
El usuario de demostración permite evaluar las funcionalidades de la aplicación sin utilizar la cuenta administrativa.
6. Conclusiones
El desarrollo de SG-ATC Cali permitió aplicar de manera práctica los conocimientos adquiridos en la asignatura Estructura de Datos y Algoritmos II, integrando diferentes estructuras de datos en una aplicación orientada a resolver una necesidad de organización de información.
La implementación de listas enlazadas, árboles de prefijos, colas, grafos y montículos permitió comprender cómo cada estructura responde a necesidades específicas de almacenamiento, búsqueda y procesamiento.
La integración con PostgreSQL permitió complementar estas estructuras con un mecanismo de persistencia de datos, mientras que React facilitó la construcción de una interfaz para interactuar con el sistema.
Finalmente, la publicación mediante GitHub y Netlify permitió disponer de una aplicación accesible desde internet, demostrando la integración entre estructuras de datos, programación web y bases de datos.