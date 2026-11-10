# KODEXA Delivery — pruebas de aceptación multi-comercio

**Estado:** plan de pruebas; no ejecutado. **Entorno:** local/staging con dos tiendas y tres cuentas de prueba. No usar datos personales reales.

## Preparación

- Crear usuario A (propietario tienda A), usuario B (propietario tienda B) y usuario C (cliente).
- Dar de alta ambas tiendas como `pending`, activar A por proceso administrativo confiable y dejar B pendiente.
- Crear dos productos en A y un producto en B, usando datos ficticios.
- No usar credenciales privilegiadas en el frontend. La validación de autorización debe probarse con JWT de cada usuario.

## Matriz mínima de aceptación

| ID | Prueba | Resultado esperado |
|---|---|---|
| A01 | Usuario A crea tienda con `owner_user_id` de B | Denegado |
| A02 | Usuario A intenta insertar tienda ya `active` | Denegado |
| A03 | Usuario A intenta cambiar `status` de `pending` a `active` | Denegado |
| A04 | Usuario A intenta modificar `owner_user_id` | Denegado |
| A05 | Usuario B intenta ver datos privados de tienda A | Denegado |
| A06 | Público consulta tienda A activa | Permitido |
| A07 | Público consulta tienda B pendiente | No aparece |
| A08 | Público consulta producto de tienda B pendiente | No aparece |
| A09 | Usuario A edita producto de tienda B | Denegado |
| A10 | Usuario A agrega producto a su tienda | Permitido |
| A11 | Cliente C consulta pedidos de otro cliente | Denegado |
| A12 | Cliente C intenta crear pedido con precio manipulado vía API | Denegado: sin INSERT directo |
| A13 | Cliente C intenta actualizar `status` de pedido | Denegado: sin UPDATE directo |
| A14 | Usuario A intenta insertar `order_items` de otra tienda | Denegado |
| A15 | Staff intenta cambiar propietario o estado de aprobación | Denegado |
| A16 | Público intenta listar miembros o pedidos | Denegado |
| A17 | Usuario A intenta insertar miembro arbitrario sin invitación | Denegado |
| A18 | Intento de subida de imagen a carpeta de otra tienda | Denegado al implementar Storage |
| A19 | Checkout confiable calcula precios desde base de datos | Subtotal y snapshots correctos |
| A20 | Dos tiendas simultáneas reciben pedidos | Cada una ve únicamente los suyos |
| A21 | Comercio suspendido intenta recibir nuevo pedido | Denegado |
| A22 | Pedido completado intenta volver a pendiente | Denegado por validador de transiciones |
| A23 | Dos solicitudes idénticas de checkout | No crean pedido duplicado con idempotency key |
| A24 | Un usuario intenta acceder a URL de panel de otra tienda | Denegado por RLS, incluso alterando ID |

## Bloqueos conocidos del SQL preliminar

1. La función de pertenencia `private.is_store_member` debe auditarse como código privilegiado y probarse para owner/manager/staff. Confirmar que el schema `private` **no esté expuesto** en Data API.
2. La creación de pedidos, líneas, snapshots y cambios de estado **no están implementados**: necesitan una operación transaccional de servidor.
3. Falta implementar las invitaciones seguras de colaboradores y sus permisos.
4. Falta bucket, políticas de Storage, límites de archivos y validación MIME.
5. El catálogo público necesita decidir qué datos de contacto y ubicación son publicables; no almacenar información privada en columnas de lectura pública.
6. El esquema es un borrador: no convertirlo en migración sin revisar compatibilidad con el proyecto real y ejecutar pruebas negativas.

## Criterio para habilitar un piloto

No habilitar altas públicas ni pedidos reales hasta que las 24 pruebas se ejecuten y aprueben, la base de datos esté aislada por tienda, el checkout sea transaccional, se validen roles y se documente el procedimiento de recuperación.

**Nota:** los resultados de esta matriz todavía no se verificaron. Ninguna prueba de base de datos fue ejecutada.
