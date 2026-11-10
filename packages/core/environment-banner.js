// Discreet, accessible demo-state notice shared across the three Yuna products.
import {backendConfigured} from './backend.js';
const banner=document.createElement('aside');
banner.setAttribute('role','status');
banner.className='yuna-demo-status';
banner.innerHTML='<span class="yuna-demo-dot" aria-hidden="true"></span><span><strong>Versión de demostración</strong> · Los datos y solicitudes no se envían a servicios reales.</span>';
const style=document.createElement('style');
style.textContent=`
.yuna-demo-status{display:flex;align-items:center;justify-content:center;gap:9px;max-width:1180px;margin:10px auto 0;padding:9px 15px;border:1px solid #e4e7ee;border-radius:12px;background:#f8f9fc;color:#596275;font:500 12px/1.45 system-ui,sans-serif}
.yuna-demo-status strong{color:#354054;font-weight:750}
.yuna-demo-dot{display:inline-block;flex:0 0 7px;width:7px;height:7px;border-radius:50%;background:#e8a44d}
@media(max-width:600px){.yuna-demo-status{margin:8px 16px 0;padding:8px 11px;font-size:11px;line-height:1.35}}
`;
document.head.append(style);
document.body.prepend(banner);
