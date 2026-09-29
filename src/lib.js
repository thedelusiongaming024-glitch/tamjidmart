export const api=async(u,m='GET',b)=>{const r=await fetch('/api'+u,{method:m,headers:{'Content-Type':'application/json'},body:b?JSON.stringify(b):undefined}),j=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(j.error||'Something went wrong.');e.status=r.status;throw e}return j};
export const thumb=u=>/^\/uploads\/.+\.webp$/.test(u||'')?u.replace(/\.webp$/,'-t.webp'):u;
export const dl=o=>(window.dataLayer=window.dataLayer||[]).push(o);
export const track=(id,type)=>fetch('/api/track',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,type})}).catch(()=>{});
export const hue=s=>[...String(s)].reduce((a,c)=>a+c.charCodeAt(0),0)%360;
export const safe=u=>/^https?:\/\//.test(u)?u:'#';
export const waUrl=(S,p)=>`https://wa.me/${S.whatsapp.replace(/\D/g,'')}?text=${encodeURIComponent((S.waMessage||'Hello! I am interested in {product}.').replace('{product}',p?p.name:'your products'))}`;
export const telUrl=S=>'tel:'+S.phone.replace(/[^\d+]/g,'');
