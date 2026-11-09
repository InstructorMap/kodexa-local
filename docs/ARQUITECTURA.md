# Arquitectura KODEXA Local

## Estado de esta entrega

Monorepo estático con tres PWA independientes y un portal. Los módulos usan JavaScript nativo y almacenamiento local para demostraciones. No existe backend conectado.

## Estructura

- `apps/delivery`: catálogo, carrito, pedido demo e interfaces comercio/repartidor.
- `apps/movilidad`: solicitud demo, panel conductor y vista central.
- `apps/turnos`: catálogo de servicios y solicitudes de agenda.
- `packages/core`: utilidades compartidas de persistencia local y formato.
- `packages/ui`: sistema visual responsive compartido.
- `supabase/migrations`: reservado para una futura integración revisada.

## Límites deliberados

No hay autenticación, sincronización multiusuario, pagos, GPS, notificaciones, mensajería ni operación comercial real. El almacenamiento local pertenece al navegador/dispositivo y no es compartido entre usuarios. Los precios y perfiles son ilustrativos.

## Próxima etapa técnica

1. Pruebas funcionales y accesibilidad en móviles.
2. Definición de modelo multi-tenant y matriz de roles.
3. Diseño de esquema PostgreSQL y políticas RLS.
4. Integración Supabase solo con aprobación explícita.
5. Pruebas de seguridad, privacidad, respaldo y recuperación.

## Publicación

Cada carpeta de aplicación puede publicarse como sitio estático independiente. El portal raíz enlaza los tres módulos. Para instalar como PWA en producción faltan iconos definitivos y pruebas de instalación por navegador.
