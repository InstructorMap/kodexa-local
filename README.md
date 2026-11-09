# KODEXA Local

Ecosistema de tres aplicaciones PWA independientes para Dolores, Buenos Aires:

- **KODEXA Delivery** — plataforma de pedidos y comercios. Primera prioridad de desarrollo.
- **KODEXA Movilidad** — solicitudes y gestión de viajes.
- **KODEXA Turnos** — reservas y agendas para profesionales y comercios.

## Arquitectura

Monorepo con aplicaciones independientes y paquetes compartidos. La primera etapa utiliza datos de demostración y no conecta Supabase ni procesa pagos reales.

## Principios

- Mobile-first y experiencia PWA.
- Datos de demostración claramente identificados.
- Separación de permisos y datos por producto, comercio y rol.
- Integración de backend y políticas RLS en una etapa posterior.
- No asumir acuerdos comerciales, prestadores ni operaciones reales.

## Estado

Planificación inicial. KODEXA Delivery es la primera aplicación del roadmap.
