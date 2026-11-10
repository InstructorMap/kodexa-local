import{money,read,write,id,dateTime}from'../../packages/core/demo.js';import{toast}from'../../packages/core/interactions.js';const services=[{name:'Corte de cabello',provider:'Estudio Norte · Demo',price:6500,duration:'30 min'},{name:'Consulta nutricional',provider:'Espacio Salud · Demo',price:12000,duration:'45 min'},{name:'Manicuría',provider:'Punto Estética · Demo',price:8000,duration:'45 min'},{name:'Servicio técnico',provider:'Taller Centro · Demo',price:9500,duration:'60 min'}];let bookings=read('kt-bookings',[]);const $=x=>document.getElementById(x);function localDate(){const d=new Date(),offset=d.getTimezoneOffset()*60000;return new Date(d.getTime()-offset).toISOString().slice(0,10)}function init(){ $('services').innerHTML=services.map((s,i)=>'<div class="item"><span><strong>'+s.name+'</strong><small>'+s.provider+' · '+s.duration+'</small></span><span class="price">'+money(s.price)+'</span></div>').join('');$('service').innerHTML=services.map((s,i)=>'<option value="'+i+'">'+s.name+' · '+money(s.price)+'</option>').join();$('date').min=localDate();$('date').value=$('date').min;render()}function render(){
 $('count').textContent=bookings.length;
 $('metric-total').textContent=bookings.length;
 $('metric-pending').textContent=bookings.filter(b=>!b.status||b.status==='Solicitado').length;
 $('metric-confirmed').textContent=bookings.filter(b=>b.status==='Confirmado · demo').length;
 const root=$('appointments');root.replaceChildren();
 if(!bookings.length){const p=document.createElement('p');p.className='empty';p.textContent='Todavía no hay solicitudes.';root.append(p);return}
 bookings.slice().reverse().forEach(b=>{
  const item=document.createElement('div');item.className='ops-item';
  const info=document.createElement('span'),title=document.createElement('strong'),detail=document.createElement('small');
  title.textContent=b.service;detail.textContent=b.customer+' · '+b.date+' '+b.time;info.append(title,detail);
  const select=document.createElement('select');select.setAttribute('aria-label','Estado de turno '+b.id);
  ['Solicitado','Confirmado · demo','Completado · demo','Cancelado · demo'].forEach(status=>{const opt=document.createElement('option');opt.value=status;opt.textContent=status;select.append(opt)});
  select.value=b.status||'Solicitado';
  select.addEventListener('change',()=>{b.status=select.value;write('kt-bookings',bookings);render();toast('Turno demo actualizado')});
  item.append(info,select);root.append(item);
 });
}
$('book').onclick=()=>{const customer=$('customer').value.trim(),date=$('date').value;if(!customer||!date)return toast('Completá nombre y fecha.','error');if(date<new Date().toISOString().slice(0,10))return toast('Elegí una fecha futura.','error');const s=services[+$('service').value];if(bookings.some(b=>b.service===s.name&&b.date===date&&b.time===$('time').value))return toast('Ese horario ya tiene una solicitud demo para este servicio. Elegí otro.','error');bookings.push({id:id(),service:s.name,customer,contact:$('contact').value.trim(),date,time:$('time').value,price:s.price,status:'Solicitado',created:dateTime()});write('kt-bookings',bookings);render();toast('Solicitud demo registrada en este dispositivo')};$('reset').onclick=()=>{if(confirm('¿Borrar las solicitudes de demostración?')){bookings=[];write('kt-bookings',bookings);render();toast('Agenda demo restaurada')}};init();