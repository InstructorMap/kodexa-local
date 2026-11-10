// Yuna Go V2: mobile cart bottom sheet, synchronized with existing demo cart.
const dock=document.createElement('button');dock.type='button';dock.className='go-cart-dock';dock.hidden=true;dock.setAttribute('aria-label','Ver mi pedido');dock.innerHTML='<span class="go-dock-count">0</span><span>Ver mi pedido</span><strong class="go-dock-total"></strong>';document.body.append(dock);
const aside=document.querySelector('.cart-column');const close=document.createElement('button');close.className='go-cart-close';close.type='button';close.setAttribute('aria-label','Cerrar carrito');close.textContent='×';aside?.querySelector('.cart-panel')?.prepend(close);
function sync(){const count=document.querySelector('#cart-count')?.textContent||'0';dock.querySelector('.go-dock-count').textContent=count;dock.querySelector('.go-dock-total').textContent=document.querySelector('#total')?.textContent||'';dock.hidden=Number(count)===0||document.querySelector('#catalog')?.classList.contains('hidden')}
function toggle(open){aside?.classList.toggle('go-cart-open',open);document.body.style.overflow=open?'hidden':'';if(open)close.focus()}
dock.addEventListener('click',()=>toggle(true));close.addEventListener('click',()=>toggle(false));aside?.addEventListener('click',e=>{if(e.target===aside)toggle(false)});document.addEventListener('keydown',e=>{if(e.key==='Escape')toggle(false)});
const observer=new MutationObserver(sync);['cart-count','total'].forEach(id=>{const el=document.getElementById(id);if(el)observer.observe(el,{childList:true,subtree:true,characterData:true})});
document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>{toggle(false);requestAnimationFrame(sync)}));
sync();
