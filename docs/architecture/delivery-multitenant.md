# KODEXA Delivery — arquitectura multi-comercio (borrador)

**Estado:** diseño preparado; no desplegado.  
**Alcance:** convertir el alta local de comercios en registro autenticado y gestión real, manteniendo el marketplace público separado de los paneles privados.

## Decisiones

- Un comercio = una tienda/tenant. Los datos operativos siempre llevan `store_id`.
- Una persona puede pertenecer a varias tiendas mediante `store_members`.
- Roles iniciales: `owner`, `manager`, `staff`. El owner se identifica en `stores.owner_user_id`; los colaboradores usan `store_members`.
- El cliente debe autenticarse para confirmar pedidos en la primera versión conectada. El catálogo activo puede consultarse públicamente.
- Los registros nuevos quedan `pending` hasta revisión/activación. No se publican automáticamente.
- Ningún dato de un comercio debe depender de filtros del frontend: PostgreSQL RLS es la frontera de seguridad.
- Las claves `service_role`/secret nunca llegan al navegador. El frontend solo usa URL y publishable key.
- Fotos públicas de catálogo se alojan en un bucket público dedicado; la escritura/eliminación queda restringida por carpeta `<store_id>/...`.
- Pagos online, liquidaciones, GPS, chat y asignación automática de repartidores quedan fuera de esta fase.

## Modelo de datos

| Tabla | Finalidad |
|---|---|
| `stores` | Identidad, contacto, dirección, estado y propietario |
| `store_members` | Accesos de colaboradores y roles |
| `products` | Catálogo, precio, disponibilidad e imágenes |
| `orders` | Pedido, cliente, dirección, pago coordinado y estado |
| `order_items` | Copia del nombre/precio al momento de compra |

Las líneas del pedido conservan `product_name` y `unit_price` como snapshot: cambios futuros del catálogo no alteran pedidos históricos. Claves foráneas compuestas impiden asociar productos de otra tienda a un pedido.

## Flujos

1. **Alta:** registro con Supabase Auth → crear tienda como `pending` → propietario queda asociado por `owner_user_id`.
2. **Activación:** revisión de KODEXA → `active`. Solo tiendas activas aparecen en el catálogo público.
3. **Equipo:** owner/manager invita o incorpora usuarios como manager/staff. La invitación debe validarse en backend; no se acepta un rol enviado libremente desde el navegador.
4. **Catálogo:** owner/manager/staff autorizado administra productos según permisos acordados; las escrituras siempre se limitan a su tienda.
5. **Pedido:** cliente autenticado crea pedido y líneas para una sola tienda; el comercio consulta solo sus pedidos y actualiza estados permitidos.
6. **Imágenes:** bucket `store-media`; carpeta raíz por UUID de tienda. Validar MIME, tamaño y extensión.

## Permisos previstos

- Público (`anon`): leer tiendas `active` y productos `active`; no leer miembros, clientes ni pedidos.
- Cliente autenticado: leer catálogo público; crear y consultar sus propios pedidos.
- Staff: gestionar catálogo y consultar pedidos de su tienda; sin administrar miembros ni datos de facturación.
- Manager: permisos de staff + gestión operativa y colaboradores no propietarios.
- Owner: control total de su tienda y miembros.
- KODEXA operador: revisión de altas y soporte mediante un rol administrativo separado y auditado; no reutilizar una cuenta personal como mecanismo de autorización.

## Secuencia de implementación

1. Revisar el proyecto Supabase objetivo, Auth, Data API y políticas actuales.
2. Crear migración versionada en entorno local/staging, no en producción.
3. Aplicar RLS y ejecutar pruebas negativas: usuario A no puede leer/escribir tienda B; cliente no puede leer pedidos ajenos; staff no puede cambiar owner ni administrar miembros.
4. Configurar bucket y políticas de Storage.
5. Conectar frontend con Auth y consultas; eliminar persistencia local como fuente de verdad.
6. Implementar panel de pedidos y estados permitidos.
7. Prueba integral con dos tiendas y dos usuarios antes de piloto.

## Bloqueos antes de conectar

Se requiere autorización expresa para conectar el proyecto Supabase correcto y ejecutar migraciones. También hay que confirmar si el proyecto actual contiene tablas/datos que deban preservarse. Este documento no modifica ninguna base de datos.

## Riesgos que deben cerrarse antes de producción

- Definir quién aprueba tiendas y qué documentación comercial se exige.
- Definir si el cliente podrá comprar como invitado (no incluido en este primer diseño).
- Definir cancelaciones, reembolsos, retención y privacidad de datos.
- Definir permisos exactos de staff/manager y auditoría de cambios.
- Definir cómo se gestiona una tienda suspendida y sus pedidos abiertos.
- Añadir límites anti-spam, validación de teléfono y controles de abuso.

## Referencias técnicas

- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Storage Access Control](https://supabase.com/docs/guides/storage/security/access-control)
- [Supabase Storage Buckets](https://supabase.com/docs/guides/storage/buckets/fundamentals)

**Nota de compatibilidad:** el changelog vigente indica que desde el 30 de octubre de 2026 las tablas nuevas ya no quedan expuestas automáticamente en Data API. La futura migración debe declarar explícitamente los GRANT mínimos y RLS; no asumir exposición automática. CLI v3 también cambia el comportamiento local/hosted, por lo que antes de ejecutar se debe revisar la versión y su confirmación de cambios hosted.
