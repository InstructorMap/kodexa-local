import{money,read,write,id,dateTime}from'../../packages/core/demo.js';import{toast}from'../../packages/core/interactions.js';let trips=read('km-trips',[]),available=read('km-available',false);const $=x=>document.getElementById(x);function render(){
 $('trip-count').textContent=trips.length;
 $('metric-trips').textContent=trips.length;
 $('metric-active').textContent=trips.filter(t=>['Asignado · demo','En viaje · demo'].includes(t.status)).length;
 $('metric-done').textContent=trips.filter(t=>t.status==='Finalizado · demo').length;
 $('availability').textContent=available?'Disponible':'No disponible';
 $('toggle').textContent=available?'Desactivar disponibilidad':'Activar disponibilidad';
 $('toggle').setAttribute('aria-pressed',String(available));
 const root=$('trips'),dispatch=$('dispatch');root.replaceChildren();dispatch.replaceChildren();
 if(!trips.length){for(const node of [root,dispatch]){const p=document.createElement('p');p.className='empty';p.textContent='No hay solicitudes registradas.';node.append(p)}return}
 trips.slice().reverse().forEach(t=>{
  const card=document.createElement('div');card.className='ops-item';
  const info=document.createElement('span'),title=document.createElement('strong'),detail=document.createElement('small'),status=document.createElement('span');
  title.textContent=t.origin+' → '+t.destination;
  detail.textContent=t.date+' · '+t.mode+' · '+t.vehicle;
  status.className='chip';status.textContent=t.status;info.append(title,detail);card.append(info,status);root.append(card);
  const op=document.createElement('div');op.className='ops-item';
  const opInfo=document.createElement('span'),opTitle=document.createElement('strong'),opDetail=document.createElement('small');
  opTitle.textContent=t.origin+' → '+t.destination;
  opDetail.textContent=t.mode+' · '+money(t.fare)+' (estimación demo)';
  opInfo.append(opTitle,opDetail);
  const select=document.createElement('select');select.setAttribute('aria-label','Estado de viaje '+t.id);
  ['Pendiente · demo','Asignado · demo','En viaje · demo','Finalizado · demo','Cancelado · demo'].forEach(stage=>{const option=document.createElement('option');option.value=stage;option.textContent=stage;select.append(option)});
  select.value=t.status;
  select.addEventListener('change',()=>{t.status=select.value;write('km-trips',trips);render();toast('Viaje demo actualizado')});
  op.append(opInfo,select);dispatch.append(op);
 });
}
$('toggle').onclick=()=>{available=!available;write('km-available',available);render();toast(available?'Disponibilidad demo activada':'Disponibilidad demo desactivada')};$('request').onclick=()=>{const origin=$('origin').value.trim(),destination=$('destination').value.trim();if(!origin||!destination)return toast('Completá origen y destino.','error');if(origin.toLocaleLowerCase('es-AR')===destination.toLocaleLowerCase('es-AR'))return toast('El origen y el destino deben ser diferentes.','error');const fare=1800+Math.min(12000,(origin.length+destination.length)*260);trips.push({id:id(),origin,destination,mode:$('mode').value,vehicle:$('vehicle').value,date:dateTime(),fare,status:'Pendiente · demo'});write('km-trips',trips);render();toast('Solicitud demo guardada en este dispositivo')};render();