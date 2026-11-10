// Indicador de entorno para las tres PWA.
// No se interpretan credenciales presentes como prueba de migraciones o seguridad.
import {backendConfigured} from './backend.js';
const banner=document.createElement('aside');
banner.setAttribute('role','status');
banner.style.cssText='margin:12px auto;padding:12px 16px;max-width:1120px;border:1px solid #d6b879;border-radius:12px;background:#fff7e5;color:#523c19;font:500 14px/1.5 system-ui,sans-serif';
banner.textContent=backendConfigured
 ? 'KODEXA Local · Configuración de backend detectada. Esta interfaz sigue en modo demostración: no envía operaciones comerciales reales.'
 : 'KODEXA Local · Modo demostración local. Los datos no se comparten entre dispositivos ni representan operaciones reales.';
document.body.prepend(banner);
