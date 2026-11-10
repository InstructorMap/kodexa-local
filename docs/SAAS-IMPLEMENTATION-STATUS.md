# Estado de implementación SaaS — 2026-11-10

## Cambios incorporados a main
- `packages/core/backend.js`: cliente de autenticación Supabase compartido, con fallo cerrado sin configuración.
- `docs/sql/movilidad-turnos-foundation.sql`: esquema propuesto para viajes y turnos con RLS de lectura por participantes.
- `docs/sql/delivery-multitenant-draft.sql`: borrador anterior de Delivery, **no aplicado**.

## Bloqueos actuales (no comercializar)
1. No existe un proyecto backend seleccionado ni credenciales públicas configuradas.
2. No se ejecutaron migraciones ni pruebas de RLS con dos cuentas distintas.
3. Las interfaces de Delivery, Movilidad y Turnos siguen usando almacenamiento local demostrativo.
4. Falta implementar operaciones transaccionales de pedidos, asignación de conductores, reservas sin doble ocupación, panel de administración y suscripciones.
5. No hay pruebas E2E ni de seguridad aprobadas.

## Condiciones para declarar terminado
- Login real y separación de datos entre clientes, verificada con pruebas negativas.
- Persistencia compartida entre dispositivos.
- Flujos cliente/comercio/repartidor, pasajero/conductor y cliente/prestador completos.
- Administración con autorización por rol y suscripciones verificables.
- Auditoría de permisos, políticas RLS, pruebas de aceptación y despliegue aprobados.

## Configuración
No publicar service_role ni secretos. La publishable key de Supabase es pública por diseño, pero requiere RLS correcto. Configurar `window.KODEXA_BACKEND = {url:'https://<project>.supabase.co',publishableKey:'<public-key>'}` antes de importar el cliente. Esta configuración por sí sola NO habilita los flujos comerciales.

**Estado: EN DESARROLLO. No apto para producción.**
