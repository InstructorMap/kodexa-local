const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
if (!reduced && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.panel,.app-card,.mini-stat,.section-head').forEach(el => observer.observe(el));
}
document.addEventListener('pointerdown', event => {
  const target = event.target.closest('.action,.btn,.tab,.app-card');
  if (!target || reduced) return;
  target.classList.remove('tap-feedback');
  requestAnimationFrame(() => target.classList.add('tap-feedback'));
  window.setTimeout(() => target.classList.remove('tap-feedback'), 220);
});
export function toast(message, kind = 'success') {
  let host = document.querySelector('.toast-host');
  if (!host) {
    host = document.createElement('div');
    host.className = 'toast-host';
    host.setAttribute('aria-live', 'polite');
    host.setAttribute('aria-atomic', 'true');
    Object.assign(host.style, { position:'fixed', zIndex:'1000', left:'50%', bottom:'22px', transform:'translateX(-50%)', width:'min(92vw,440px)', display:'grid', gap:'8px', pointerEvents:'none' });
    document.body.append(host);
  }
  const node = document.createElement('div');
  node.className = 'kodexa-toast';
  node.textContent = message;
  Object.assign(node.style, { padding:'13px 16px', borderRadius:'14px', background:kind==='error'?'#a83245':'#17212b', color:'#fff', boxShadow:'0 12px 32px #17212b30', fontWeight:'750', fontSize:'13px', opacity:'0', transform:'translateY(10px)', transition:'opacity .2s,transform .2s' });
  host.append(node);
  requestAnimationFrame(() => { node.style.opacity='1'; node.style.transform='translateY(0)'; });
  window.setTimeout(() => { node.style.opacity='0'; node.style.transform='translateY(8px)'; window.setTimeout(()=>node.remove(),220); }, 2800);
}