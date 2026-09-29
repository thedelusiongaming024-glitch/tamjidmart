import {createContext,useContext,useEffect,useState} from 'react';
import {Link,Outlet,useLocation,useParams} from 'react-router-dom';
import {api,thumb,dl,track,hue,safe,waUrl,telUrl} from './lib';

const Ctx=createContext(),useD=()=>useContext(Ctx);
export function DataProvider({children}){
 const [d,setD]=useState(window.__DATA__||null),[err,setErr]=useState(false);
 useEffect(()=>{if(!d)api('/public').then(setD).catch(()=>setErr(true))},[]);
 if(err)return <p className="p-10 text-center">Could not load the site. Please refresh.</p>;
 if(!d)return <div className="min-h-screen grid place-items-center text-mut">Loading...</div>;
 return <Ctx.Provider value={{...d,cname:id=>d.categories.find(c=>c.id===id)?.name||''}}>{children}</Ctx.Provider>;
}
const Img=({src,name})=>src?<img loading="lazy" src={src} alt={name} className="w-full h-full object-cover"/>:<div className="w-full h-full grid place-items-center font-serif text-6xl text-white" style={{background:`linear-gradient(145deg,hsl(${hue(name)} 30% 62%),hsl(${hue(name)+40} 35% 78%))`}}>{name[0]}</div>;
function Contact({p,sm,one}){
 const {settings:S}=useD(),c=m=>{track(p.id,'contact');dl({event:'contact_click',method:m,item_id:p.id})},z=sm?'btn-sm':'';
 return <><a className={`btn ${z} flex-1`} href={waUrl(S,p)} target="_blank" rel="noopener noreferrer" onClick={()=>c('whatsapp')}>Contact us</a>
 {!one&&<a className={`btn btn-ghost ${z} flex-1`} href={telUrl(S)} onClick={()=>c('call')}>Call</a>}</>;
}
function Card({p}){
 const {cname}=useD(),to=`/p/${p.slug}`;
 return <article className="glass rounded-3xl p-3 flex flex-col transition hover:-translate-y-1 hover:shadow-xl">
  <Link to={to} className="relative block aspect-square rounded-2xl overflow-hidden bg-white"><Img src={thumb(p.images[0])} name={p.name}/>{p.badge&&<span className="absolute top-2.5 left-2.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/85 backdrop-blur">{p.badge}</span>}</Link>
  <div className="px-1.5 pt-3.5 pb-1 flex-1 flex flex-col gap-1"><span className="text-xs font-semibold text-acc">{cname(p.category)}</span>
   <h3 className="text-[22px]"><Link to={to}>{p.name}</Link></h3><p className="text-[13.5px] text-mut line-clamp-2">{p.description}</p>
   <div className="flex gap-2 mt-3"><Contact p={p} sm/></div></div></article>;
}
export function Shell(){
 const {settings:S}=useD();
 return <><header className="glass sticky top-3.5 z-20 mx-3 md:mx-auto mt-3.5 max-w-[1192px] rounded-2xl flex items-center gap-5 py-2.5 pl-5 pr-3.5">
  <Link to="/" className="font-serif text-[28px] flex items-center gap-2">{S.logo&&<img src={S.logo} alt="" className="h-[34px]"/>}{S.siteName}</Link>
  <nav className="hidden md:flex gap-6 mx-auto font-medium text-mut">{[['Home','/'],['Collections','/#collections'],['New','/#new'],['All products','/#products'],['Contact','/#contact']].map(([l,h])=><Link key={l} to={h} className="hover:text-ink">{l}</Link>)}</nav>
  <a className="btn btn-sm ml-auto md:ml-0" href={waUrl(S)} target="_blank" rel="noopener noreferrer">Contact us</a></header>
  <Outlet/><Footer/>
  <a href={waUrl(S)} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp" className="fixed right-5 bottom-5 z-30 w-[58px] h-[58px] rounded-full bg-[#25d366] text-white grid place-items-center shadow-lg text-3xl">&#9990;</a></>;
}
function Footer(){
 const {settings:S}=useD(),soc=[['Facebook',S.facebook],['Instagram',S.instagram],['YouTube',S.youtube]].filter(x=>x[1]),a='block hover:text-ink';
 return <footer className="mt-20 pt-11 pb-8 border-t border-black/5"><div className="max-w-[1240px] mx-auto px-6"><div className="grid md:grid-cols-[1.5fr_1fr_1fr] gap-8 text-mut">
  <div><div className="font-serif text-[28px] text-ink">{S.siteName}</div><p>{S.aboutText}</p></div>
  <div><h4 className="font-semibold text-ink mb-2.5">Contact</h4><a className={a} href={telUrl(S)}>{S.phone}</a><a className={a} href={`mailto:${S.email}`}>{S.email}</a><p>{S.address}</p><p>{S.hours}</p></div>
  <div><h4 className="font-semibold text-ink mb-2.5">Follow us</h4>{soc.map(([n,u])=><a key={n} className={a} href={safe(u)} target="_blank" rel="noopener noreferrer">{n}</a>)}{!soc.length&&<p>Coming soon</p>}</div></div>
  <p className="mt-8 text-[13px] text-mut">&copy; {new Date().getFullYear()} {S.siteName}. All rights reserved.</p></div></footer>;
}
const BG=['#cfe3d8','#ead9b8','#d9dcef'],ok=u=>/^(#|\/|https?:)/.test(u||'')?u:'#products';
function Hero(){
 const {banners:b}=useD(),n=b.length,[i,setI]=useState(0),go=d=>setI(x=>(x+d+n)%n);
 useEffect(()=>{if(n<2||matchMedia('(prefers-reduced-motion:reduce)').matches)return;const t=setInterval(()=>go(1),6500);return()=>clearInterval(t)},[n]);
 if(!n)return null;
 return <div className="relative mt-5 h-[460px] md:h-[520px] rounded-[30px] overflow-hidden shadow-glass">
  {b.map((x,k)=>{const l=ok(x.btnLink),t=x.btnText||'Explore';return <div key={x.id} className={`absolute inset-0 flex items-center px-5 md:px-14 bg-cover bg-center transition-opacity duration-700 ${k===i?'opacity-100':'opacity-0 pointer-events-none'}`} style={{backgroundColor:BG[k%3],backgroundImage:x.image?`url("${x.image}")`:undefined}}>
   <div className="glass rounded-3xl p-8 max-w-[520px]"><h1 className="text-[clamp(38px,5vw,64px)]">{x.title}</h1><p className="text-mut mt-3.5 mb-6">{x.subtitle}</p>
    {l.startsWith('#')?<Link className="btn" to={'/'+l}>{t}</Link>:<a className="btn" href={l}>{t}</a>}</div></div>})}
  {n>1&&<div className="absolute right-7 bottom-6 flex items-center gap-2"><div className="flex gap-1.5 mr-2">{b.map((_,k)=><i key={k} className={`h-2 rounded-full bg-white/70 transition-all ${k===i?'w-6 bg-white':'w-2'}`}/>)}</div>
   {[[-1,'\u2039','Previous'],[1,'\u203A','Next']].map(([d,c,l])=><button key={l} aria-label={l} onClick={()=>go(d)} className="w-11 h-11 rounded-full bg-ink/85 text-white text-lg">{c}</button>)}</div>}</div>;
}
const Sec=({id,title,sub,children})=><section id={id} className="pt-[70px]"><div className="text-center mb-8"><h2 className="text-[clamp(32px,4vw,48px)]">{title}</h2>{sub&&<p className="text-mut mt-2">{sub}</p>}</div>{children}</section>;
const Grid=({children})=><div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[22px]">{children}</div>;
function Enquiry({pre}){
 const {products:P}=useD(),e0={name:'',phone:'',product:'',message:'',website:''},[f,setF]=useState({...e0,product:pre||''}),[m,setM]=useState('');
 useEffect(()=>{if(pre)setF(o=>({...o,product:pre}))},[pre]);
 const s=k=>e=>setF(o=>({...o,[k]:e.target.value}));
 const submit=async e=>{e.preventDefault();setM('Sending...');try{await api('/enquiry','POST',f);dl({event:'enquiry_submit',item_id:f.product});setF(e0);setM('Thank you! We received your enquiry and will contact you soon.')}catch(x){setM(x.message||'Could not send. Please try WhatsApp instead.')}};
 return <form onSubmit={submit} className="glass rounded-3xl p-6 max-w-[640px] mx-auto grid gap-3 relative">
  <input className="input" placeholder="Your name" aria-label="Your name" required maxLength={80} value={f.name} onChange={s('name')}/>
  <input className="input" type="tel" placeholder="Phone or WhatsApp number" aria-label="Phone number" required maxLength={30} value={f.phone} onChange={s('phone')}/>
  <select className="input" aria-label="Product" value={f.product} onChange={s('product')}><option value="">General enquiry</option>{P.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
  <textarea className="input min-h-[120px]" placeholder="How can we help?" aria-label="Message" required maxLength={1500} value={f.message} onChange={s('message')}/>
  <input className="absolute -left-[9999px] opacity-0" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={s('website')}/>
  <button className="btn" type="submit">Send enquiry</button><p role="status" className="text-acc font-semibold min-h-6">{m}</p></form>;
}
export function Home(){
 const {settings:S,categories:C,products:P,cname}=useD(),{search}=useLocation(),[cat,setCat]=useState('all'),[q,setQ]=useState(''),[sort,setSort]=useState('new');
 useEffect(()=>{document.title=S.seoTitle||`${S.siteName} | ${S.tagline}`},[]);
 const newest=[...P].sort((a,b)=>b.createdAt-a.createdAt),feat=P.filter(p=>p.featured).slice(0,5);
 let list=newest.filter(p=>(cat==='all'||p.category===cat)&&(p.name+p.description+cname(p.category)).toLowerCase().includes(q.toLowerCase()));
 if(sort==='az')list=[...list].sort((a,b)=>a.name.localeCompare(b.name));
 const pick=id=>{setCat(id);dl({event:'select_collection',collection:cname(id)||'All'});document.getElementById('products')?.scrollIntoView({behavior:'smooth'})};
 return <main className="max-w-[1240px] mx-auto px-6"><Hero/>
  <Sec id="collections" title="Shop by collection" sub="Pick a collection to see what we have."><div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-5">
   {C.slice(0,4).map(c=>{const n=P.filter(p=>p.category===c.id).length,im=c.image||P.find(p=>p.category===c.id&&p.images[0])?.images[0];
    return <button key={c.id} onClick={()=>pick(c.id)} className="h-[300px] rounded-[26px] overflow-hidden bg-cover bg-center flex items-end p-4 text-left transition hover:-translate-y-1" style={{backgroundImage:im?`url("${im}")`:`linear-gradient(145deg,hsl(${hue(c.name)} 30% 68%),hsl(${hue(c.name)+40} 35% 84%))`}}>
     <div className="glass rounded-2xl px-[18px] py-4 w-full"><h3 className="text-[26px]">{c.name}</h3><span className="text-[13px] text-mut">{n} product{n===1?'':'s'}</span></div></button>})}</div></Sec>
  <Sec id="new" title="New arrivals" sub="The latest products on our shelves."><Grid>{newest.slice(0,6).map(p=><Card key={p.id} p={p}/>)}</Grid></Sec>
  {feat.length>0&&<Sec title="Recommended for you" sub="Hand-picked favourites from our team."><div className="grid grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr] auto-rows-[250px] gap-5">
   {feat.map((p,k)=><div key={p.id} className={`relative rounded-[26px] overflow-hidden bg-[#dfe8e3] ${k===0?'col-span-2 md:col-span-1 md:row-span-2':''}`}><Link to={`/p/${p.slug}`} className="absolute inset-0" aria-label={p.name}><Img src={p.images[0]} name={p.name}/></Link>
    <div className="glass rounded-2xl absolute inset-x-3.5 bottom-3.5 p-3.5 flex justify-between items-center gap-2.5"><h3 className="text-[22px]">{p.name}</h3><Contact p={p} sm one/></div></div>)}</div></Sec>}
  <Sec id="products" title="All products" sub="Message us for availability and details.">
   <div className="flex flex-wrap gap-2.5 justify-between items-center mb-6"><div className="flex flex-wrap gap-2">{[{id:'all',name:'All'},...C].map(c=><button key={c.id} onClick={()=>setCat(c.id)} className={`px-4 py-2 rounded-full border border-white/80 font-medium ${cat===c.id?'bg-acc text-white':'bg-white/60 text-mut'}`}>{c.name}</button>)}</div>
    <div className="flex gap-2"><input className="input !w-48" type="search" placeholder="Search products" aria-label="Search products" value={q} onChange={e=>setQ(e.target.value)}/><select className="input !w-auto" aria-label="Sort" value={sort} onChange={e=>setSort(e.target.value)}><option value="new">Newest first</option><option value="az">Name A to Z</option></select></div></div>
   {list.length?<Grid>{list.map(p=><Card key={p.id} p={p}/>)}</Grid>:<p className="text-center text-mut py-12">No products match. Try another search or collection.</p>}</Sec>
  <Sec id="enquiry" title="Send an enquiry" sub="Tell us what you need. We will reply by phone or WhatsApp."><Enquiry pre={new URLSearchParams(search).get('enquire')}/></Sec>
  <div id="contact" className="glass rounded-[30px] px-6 py-14 text-center mt-20 bg-gradient-to-br from-[#cfe6dbb3] to-[#efe0c2b3]"><h2 className="text-[clamp(30px,4vw,48px)] max-w-[640px] mx-auto mb-3">Not sure what to pick? Ask us.</h2><p className="text-mut mb-6">Message us on WhatsApp or call {S.phone}. {S.hours}.</p>
   <div className="flex gap-2 justify-center flex-wrap"><a className="btn" href={waUrl(S)} target="_blank" rel="noopener noreferrer">WhatsApp us</a><a className="btn btn-ghost" href={telUrl(S)}>Call us</a></div></div></main>;
}
export const NotFound=()=><main className="max-w-[1240px] mx-auto px-6 pt-20 text-center"><h1 className="text-5xl mb-4">Page not found</h1><Link className="btn" to="/">Back to home</Link></main>;
export function ProductPage(){
 const {slug}=useParams(),{settings:S,products:P,cname}=useD(),p=P.find(x=>x.id===slug.split('-').pop()),[k,setK]=useState(0);
 useEffect(()=>{if(!p)return;setK(0);document.title=p.seoTitle||`${p.name} | ${S.siteName}`;track(p.id,'view');dl({event:'view_item',item_id:p.id,item_name:p.name})},[p?.id]);
 if(!p)return <NotFound/>;
 const ims=p.images.length?p.images:[''],rel=P.filter(x=>x.id!==p.id&&x.category===p.category).slice(0,4);
 return <main className="max-w-[1240px] mx-auto px-6 pt-8"><nav className="text-[13px] text-mut mb-4"><Link to="/" className="hover:text-ink">Home</Link> / {cname(p.category)||'Products'}</nav>
  <div className="glass rounded-3xl p-5 grid md:grid-cols-2 gap-7"><div><div className="aspect-square rounded-2xl overflow-hidden bg-[#e8eeea]"><Img src={ims[k]} name={p.name}/></div>
   {ims.length>1&&<div className="flex gap-2 mt-2.5">{ims.map((u,j)=><button key={u+j} onClick={()=>setK(j)} aria-label={`Image ${j+1}`} className={`w-[60px] h-[60px] rounded-xl overflow-hidden border-2 ${j===k?'border-acc':'border-transparent opacity-60'}`}><img src={thumb(u)} alt="" className="w-full h-full object-cover"/></button>)}</div>}</div>
   <div><span className="text-xs font-semibold text-acc">{cname(p.category)}</span><h1 className="text-[42px] mt-1.5 mb-2.5">{p.name}</h1><p className="text-mut whitespace-pre-line">{p.description}</p>
    {p.highlights&&<ul className="list-disc ml-5 my-4 text-mut">{p.highlights.split('\n').filter(Boolean).map((h,i)=><li key={i}>{h}</li>)}</ul>}
    <div className="flex flex-wrap gap-2 mt-5"><Contact p={p}/><Link className="btn btn-ghost flex-1" to={`/?enquire=${p.id}#enquiry`}>Send enquiry</Link></div></div></div>
  {rel.length>0&&<Sec title={`More in ${cname(p.category)}`}><Grid>{rel.map(x=><Card key={x.id} p={x}/>)}</Grid></Sec>}</main>;
}
