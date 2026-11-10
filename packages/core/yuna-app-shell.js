// Native-feeling navigation for Yuna local PWAs. No backend side effects.
const app=document.body;
const mode=app.classList.contains('module-delivery')?'delivery':app.classList.contains('module-movilidad')?'move':'agenda';
const config={
delivery:[['home','Inicio','house'],['orders','Pedidos','receipt'],['merchant','Comercio','store'],['courier','Reparto','bike']],
move:[['home','Viajar','car-front'],['trips','Mis viajes','route'],['driver','Conductor','steering-wheel'],['dispatch','Central','radio']],
agenda:[['home','Reservar','calendar-plus'],['services','Servicios','grid-2x2'],['appointments','Mis turnos','calendar-check'],['professional','Profesional','briefcase-business']]
};
const iconPaths={
'house':'M3 10 12 3l9 7v10H3z M9 20v-7h6v7',
'receipt':'M5 3h14v18l-3-2-4 2-4-2-3 2z M8 8h8 M8 12h8',
'store':'M3 9l2-5h14l2 5-2 3H5z M5 12v9h14v-9 M9 21v-6h6v6',
'bike':'M5 17a3 3 0 1 0 0 .1 M19 17a3 3 0 1 0 0 .1 M5 17l4-8 4 8h6l-4-8H9',
'car-front':'M5 16l1-8 2-3h8l2 3 1 8v4h-3v-2H8v2H5z M5 12h14 M8 15h1 M15 15h1',
'route':'M6 5a2 2 0 1 0 0 .1 M18 19a2 2 0 1 0 0 .1 M6 7v7q0 3 4 3h5',
'steering-wheel':'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M4 12h16 M12 20l-3-8 M12 20l3-8',
'radio':'M5 8h14v12H5z M8 12h8 M9 16h6 M8 8l8-5',
'calendar-plus':'M4 5h16v16H4z M8 3v4 M16 3v4 M4 10h16 M12 13v6 M9 16h6',
'grid-2x2':'M3 3h8v8H3z M13 3h8v8h-8z M3 13h8v8H3z M13 13h8v8h-8z',
'calendar-check':'M4 5h16v16H4z M8 3v4 M16 3v4 M4 10h16 M8 16l3 3 5-6',
'briefcase-business':'M3 8h18v13H3z M9 8V5h6v3 M3 13h18'
};
const nav=document.createElement('nav');nav.className='yuna-bottom-nav';nav.setAttribute('aria-label','Navegación principal');
const svg=(name)=>'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+iconPaths[name]+'"/></svg>';
nav.innerHTML=config[mode].map(([key,label,ico],i)=>'<button type="button" data-yuna-nav="'+key+'" class="'+(i===0?'selected':'')+'" aria-label="'+label+'" aria-current="'+(i===0?'page':'false')+'">'+svg(ico)+'<span>'+label+'</span></button>').join('');
document.body.append(nav);
const nodes=(s)=>Array.from(document.querySelectorAll(s));
function navigate(key){
if(mode==='delivery'){
 const tabKey=key==='home'?'catalog':key;
 const target=document.querySelector('[data-tab="'+tabKey+'"]');
 if(target)target.click();
 if(key==='home')document.querySelector('#catalog')?.scrollIntoView({behavior:'smooth',block:'start'});
}else{
 const selectors=mode==='move'?{home:'#origin',trips:'#trips',driver:'#toggle',dispatch:'#dispatch'}:{home:'#service',services:'#services',appointments:'#appointments',professional:'#reset'};
 const target=document.querySelector(selectors[key]);
 if(target){target.scrollIntoView({behavior:'smooth',block:'center'});if(key==='home')target.focus({preventScroll:true})}
}
nodes('[data-yuna-nav]').forEach(b=>{const active=b.dataset.yunaNav===key;b.classList.toggle('selected',active);b.setAttribute('aria-current',active?'page':'false')});
}
nav.addEventListener('click',e=>{const button=e.target.closest('[data-yuna-nav]');if(button)navigate(button.dataset.yunaNav)});
if(mode==='delivery')nodes('[data-tab]').forEach(b=>b.addEventListener('click',()=>{const key=b.dataset.tab==='catalog'?'home':b.dataset.tab;nodes('[data-yuna-nav]').forEach(n=>n.classList.toggle('selected',n.dataset.yunaNav===key))}));
