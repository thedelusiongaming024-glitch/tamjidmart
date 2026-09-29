import {useEffect,useState} from 'react';
import {api,thumb} from './lib';

async function upload(f){ // resize in the browser: 1600px main + 480px thumbnail, both WebP
 const bm=await createImageBitmap(f),enc=w=>{const k=Math.min(1,w/Math.max(bm.width,bm.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(bm.width*k));c.height=Math.max(1,Math.round(bm.height*k));c.getContext('2d').drawImage(bm,0,0,c.width,c.height);return c.toDataURL('image/webp',.82)};
 return (await api('/admin/upload','POST',{data:enc(1600),thumb:enc(480)})).url;
}
const SCH={
 products:[['name','Product name','text'],['category','Collection','cat'],['description','Description','area',1],['highlights','Highlights (one per line)','area',1],['images','Images','imgs',1],['badge','Badge, e.g. New or Sale','text'],['seoTitle','SEO title (optional, up to 60 characters)','text'],['seoDescription','SEO description (optional, up to 160 characters)','text',1],['featured','Show in Recommended','chk'],['active','Visible on website','chk']],
 categories:[['name','Collection name','text'],['description','Short description','text',1],['image','Cover image','img',1]],
 banners:[['title','Headline','text',1],['subtitle','Subtitle','text',1],['btnText','Button text','text'],['btnLink','Button link, e.g. #products','text'],['image','Background image','img',1],['active','Visible on website','chk']]};
const ST=[['siteName','Business name','text'],['tagline','Tagline','text'],['whatsapp','WhatsApp number with country code, digits only, e.g. 8801XXXXXXXXX','text'],['phone','Phone number for calls','text'],['email','Email','text'],['address','Address','text'],['hours','Opening hours','text'],['facebook','Facebook page link','text'],['instagram','Instagram link','text'],['youtube','YouTube link','text'],['logo','Logo (optional)','img',1],['aboutText','About text in footer','area',1],['waMessage','WhatsApp message. Use {product} for the product name.','area',1]];
const SEOF=[['siteUrl','Website address, e.g. https://tamjidmart.com','text',1],['seoTitle','Home page title (up to 60 characters)','text'],['keywords','Keywords, separated by commas','text'],['seoDescription','Home page description (up to 160 characters)','area',1],['ogImage','Social sharing image','img',1],['gtmId','Google Tag Manager ID, e.g. GTM-XXXXXXX','text'],['gaId','Google Analytics ID, e.g. G-XXXXXXXXXX','text']];
const LBL={products:'product',categories:'collection',banners:'banner'},TTL={products:'Products',categories:'Collections',banners:'Hero banners'};

const Top=({title,children})=><div className="flex justify-between items-center flex-wrap gap-2.5 mb-4"><h2 className="text-4xl">{title}</h2><div className="flex gap-2 flex-wrap">{children}</div></div>;
const Th=({src})=>src?<img src={thumb(src)} alt="" className="w-11 h-11 rounded-xl object-cover"/>:<span className="block w-11 h-11 rounded-xl bg-[#dfe8e3]"/>;
const Err=({children})=><p className="text-red-600 text-[13px] min-h-5 my-2">{children}</p>;

function ImgField({value,multi,set,toast}){
 const a=multi?(value||[]):(value?[value]:[]),out=n=>set(multi?n:n[0]||'');
 const add=async e=>{const fs=[...e.target.files];e.target.value='';try{const n=[...a];for(const f of fs)n.push(await upload(f));out(n)}catch(x){toast(x.message||'Upload failed. Try another image.')}};
 return <div className="flex flex-wrap gap-2 mt-1.5">{a.map((u,i)=><div key={u} className="relative"><img src={thumb(u)} alt="" className="w-[74px] h-[74px] rounded-xl object-cover"/><button type="button" aria-label="Remove" onClick={()=>out(a.filter((_,j)=>j!==i))} className="absolute -top-1.5 -right-1.5 w-[22px] h-[22px] rounded-full bg-red-600 text-white text-sm">&times;</button></div>)}
 {(multi||!a.length)&&<label className="w-[74px] h-[74px] rounded-xl border-2 border-dashed border-black/20 grid place-items-center cursor-pointer text-mut text-2xl">+<input type="file" accept="image/*" hidden multiple={multi} onChange={add}/></label>}</div>;
}
function Fields({sch,v,set,cats=[],toast}){
 return <div className="grid sm:grid-cols-2 gap-x-5">{sch.map(([k,l,t,w])=>{const c=w?'sm:col-span-2':'',val=v[k]??'',on=e=>set(k,e.target.value);
  if(t==='chk')return <label key={k} className={`flex items-center gap-2 mb-3.5 text-[13px] font-semibold ${c}`}><input type="checkbox" checked={!!v[k]} onChange={e=>set(k,e.target.checked)}/>{l}</label>;
  if(t==='img'||t==='imgs')return <div key={k} className={`mb-3.5 ${c}`}><span className="text-[13px] font-semibold">{l}</span><ImgField value={v[k]} multi={t==='imgs'} set={x=>set(k,x)} toast={toast}/></div>;
  return <label key={k} className={`block mb-3.5 text-[13px] font-semibold ${c}`}>{l}
   {t==='area'?<textarea className="input mt-1.5 min-h-[90px] font-normal" value={val} onChange={on}/>
   :t==='cat'?<select className="input mt-1.5 font-normal" value={val} onChange={on}><option value="">None</option>{cats.map(x=><option key={x.id} value={x.id}>{x.name}</option>)}</select>
   :<input className="input mt-1.5 font-normal" value={val} onChange={on}/>}</label>})}</div>;
}
const Modal=({children,onClose})=><div className="fixed inset-0 z-50 bg-ink/35 backdrop-blur-sm flex items-start sm:items-center justify-center p-5 overflow-auto" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="glass !bg-white/90 rounded-3xl p-6 w-full max-w-2xl">{children}</div></div>;

function FormModal({col,item,D,onClose,done,toast}){
 const [v,setV]=useState(item||{active:true,featured:false,images:[],image:'',category:''}),[e,setE]=useState(''),[busy,setBusy]=useState(false),set=(k,x)=>setV(o=>({...o,[k]:x}));
 const save=async()=>{if(!(v.name||v.title))return setE('Please enter a name.');setBusy(true);try{await api(item?`/admin/${col}/${item.id}`:`/admin/${col}`,item?'PUT':'POST',v);toast('Saved');done()}catch(x){setE(x.message);setBusy(false)}};
 return <Modal onClose={onClose}><h2 className="text-3xl mb-4">{item?'Edit':'Add'} {LBL[col]}</h2><Fields sch={SCH[col]} v={v} set={set} cats={D.categories} toast={toast}/><Err>{e}</Err>
  <div className="flex gap-2.5 justify-end"><button className="btn btn-ghost" onClick={onClose}>Cancel</button><button className="btn" disabled={busy} onClick={save}>Save changes</button></div></Modal>;
}
function List({col,D,reload,toast}){
 const [q,setQ]=useState(''),[f,setF]=useState(null),cn=id=>D.categories.find(c=>c.id===id)?.name||'None',pr=col==='products',
 items=D[col].filter(i=>(i.name||i.title).toLowerCase().includes(q.toLowerCase()));
 const del=async i=>{if(confirm('Delete this permanently?')){await api(`/admin/${col}/${i.id}`,'DELETE');toast('Deleted');reload()}};
 return <><Top title={TTL[col]}><input className="input !w-48" placeholder="Search" aria-label="Search" value={q} onChange={e=>setQ(e.target.value)}/><button className="btn" onClick={()=>setF({})}>Add new</button></Top>
  <div className="panel"><table className="tbl"><thead><tr><th></th><th>Name</th>{pr&&<><th>Views</th><th>Contacts</th></>}<th>Status</th><th></th></tr></thead><tbody>
   {items.map(i=><tr key={i.id}><td><Th src={pr?i.images[0]:i.image}/></td><td><b>{i.name||i.title}</b><br/><small className="text-mut">{pr?cn(i.category)+(i.featured?' · Recommended':''):col==='categories'?D.products.filter(p=>p.category===i.id).length+' products':i.subtitle}</small></td>
    {pr&&<><td>{i.views}</td><td>{i.contacts}</td></>}<td>{'active' in i&&<span className={i.active?'pill':'pill off'}>{i.active?'Visible':'Hidden'}</span>}</td>
    <td className="text-right whitespace-nowrap"><button className="btn btn-ghost btn-sm" onClick={()=>setF(i)}>Edit</button> <button className="btn btn-ghost btn-sm !text-red-600" onClick={()=>del(i)}>Delete</button></td></tr>)}
   {!items.length&&<tr><td colSpan={6} className="text-mut p-8">Nothing here yet. Click Add new to create your first one.</td></tr>}</tbody></table></div>
  {f&&<FormModal key={f.id||'new'} col={col} item={f.id?f:null} D={D} onClose={()=>setF(null)} done={()=>{setF(null);reload()}} toast={toast}/>}</>;
}
function Dashboard({D}){
 const P=D.products,sum=k=>P.reduce((a,p)=>a+p[k],0),top=k=>[...P].sort((a,b)=>b[k]-a[k]).filter(p=>p[k]).slice(0,5);
 return <><Top title="Dashboard"/><div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3.5 mb-5">
  {[['Products',P.length],['Visible',P.filter(p=>p.active).length],['Collections',D.categories.length],['Product views',sum('views')],['Contact clicks',sum('contacts')],['New enquiries',D.enquiries.filter(e=>e.status==='new').length]].map(([l,n])=><div key={l} className="glass rounded-2xl p-4"><b className="font-serif text-4xl font-normal block">{n}</b><span className="text-[13px] text-mut">{l}</span></div>)}</div>
  <div className="grid md:grid-cols-2 gap-5">{[['views','Most viewed'],['contacts','Most contacted']].map(([k,t])=><div key={k} className="panel"><h3 className="text-2xl mb-2">{t}</h3>{top(k).map(p=><div key={p.id} className="flex justify-between py-1.5 border-t border-black/5"><span>{p.name}</span><b>{p[k]}</b></div>)}{!top(k).length&&<p className="text-mut">No data yet</p>}</div>)}</div></>;
}
const wnum=p=>{p=p.replace(/\D/g,'');return p.startsWith('0')?'880'+p.slice(1):p};
function Enquiries({D,reload,toast}){
 const st=async(e,s)=>{try{await api('/admin/enquiries/'+e.id,'PUT',{status:s});reload()}catch(x){toast(x.message)}},del=async e=>{if(confirm('Delete this enquiry?')){await api('/admin/enquiries/'+e.id,'DELETE');toast('Deleted');reload()}};
 return <><Top title="Enquiries"/>{D.enquiries.map(e=><div key={e.id} className={`panel ${e.status==='new'?'!border-l-4 !border-l-acc':''}`}>
  <div className="flex justify-between flex-wrap gap-2.5 mb-2"><div><b>{e.name}</b> <span className={e.status==='new'?'pill':'pill off'}>{e.status==='new'?'New':e.status==='replied'?'Replied':'Read'}</span><br/><small className="text-mut">{new Date(e.createdAt).toLocaleString()} · {e.phone}{e.productName&&` · ${e.productName}`}</small></div>
   <div className="flex gap-1.5 flex-wrap items-start"><a className="btn btn-sm" target="_blank" rel="noopener noreferrer" href={`https://wa.me/${wnum(e.phone)}`} onClick={()=>st(e,'replied')}>WhatsApp reply</a><a className="btn btn-ghost btn-sm" href={`tel:${e.phone}`} onClick={()=>st(e,'replied')}>Call</a>{e.status==='new'&&<button className="btn btn-ghost btn-sm" onClick={()=>st(e,'read')}>Mark read</button>}<button className="btn btn-ghost btn-sm !text-red-600" onClick={()=>del(e)}>Delete</button></div></div>
  <p className="whitespace-pre-wrap">{e.message}</p></div>)}
  {!D.enquiries.length&&<div className="panel text-mut">No enquiries yet. Messages from your website form will appear here.</div>}</>;
}
function SettingsPage({title,sch,D,reload,toast,actions,children}){
 const [v,setV]=useState(D.settings),[e,setE]=useState(''),set=(k,x)=>setV(o=>({...o,[k]:x}));
 const save=async()=>{try{const b={};sch.forEach(([k])=>b[k]=v[k]||'');await api('/admin/settings','PUT',b);toast('Saved');setE('');reload()}catch(x){setE(x.message)}};
 return <><Top title={title}>{actions}</Top><div className="panel">{children}<Fields sch={sch} v={v} set={set} toast={toast}/><Err>{e}</Err><button className="btn" onClick={save}>Save {title.toLowerCase()}</button></div></>;
}
function Seo(P){
 const {D}=P,[f,setF]=useState(null),issues=p=>{const i=[];if(!p.images.length)i.push('No image');if((p.description||'').length<50)i.push('Short description');if((p.seoTitle||p.name).length>60)i.push('Title over 60');if(!p.seoDescription)i.push('No SEO description');else if(p.seoDescription.length>160)i.push('Description over 160');return i};
 return <><SettingsPage title="SEO" sch={SEOF} {...P} actions={<><a className="btn btn-ghost btn-sm" href="/sitemap.xml" target="_blank" rel="noopener noreferrer">View sitemap</a><a className="btn btn-ghost btn-sm" href="/robots.txt" target="_blank" rel="noopener noreferrer">View robots.txt</a></>}>
  <p className="text-mut mb-4">Each product has its own page with structured data and a dataLayer. The sitemap updates automatically. Submit <b>/sitemap.xml</b> in Google Search Console.</p></SettingsPage>
  <div className="panel"><h3 className="text-2xl mb-2">Product SEO check</h3><table className="tbl"><thead><tr><th>Product</th><th>Issues</th><th></th></tr></thead><tbody>{D.products.map(p=>{const i=issues(p);return <tr key={p.id}><td><b>{p.name}</b></td><td className="space-x-1">{i.map(x=><span key={x} className="pill off">{x}</span>)}{!i.length&&<span className="pill">Good</span>}</td><td className="text-right"><button className="btn btn-ghost btn-sm" onClick={()=>setF(p)}>Fix</button></td></tr>})}</tbody></table></div>
  {f&&<FormModal col="products" item={f} D={D} onClose={()=>setF(null)} done={()=>{setF(null);P.reload()}} toast={P.toast}/>}</>;
}
function Account({D,toast}){
 const [v,setV]=useState({user:D.user,current:'',password:''}),[e,setE]=useState(''),s=k=>x=>setV(o=>({...o,[k]:x.target.value}));
 const save=async()=>{try{await api('/admin/password','POST',v);toast('Account updated');setE('');setV(o=>({...o,current:'',password:''}))}catch(x){setE(x.message)}};
 return <><Top title="Account"/><div className="panel max-w-md">{[['user','Username','text','username'],['current','Current password','password','current-password'],['password','New password, at least 8 characters','password','new-password']].map(([k,l,t,a])=><label key={k} className="block mb-3.5 text-[13px] font-semibold">{l}<input className="input mt-1.5 font-normal" type={t} autoComplete={a} value={v[k]} onChange={s(k)}/></label>)}<Err>{e}</Err><button className="btn" onClick={save}>Update account</button></div></>;
}
function Login({done}){
 const [u,setU]=useState(''),[p,setP]=useState(''),[e,setE]=useState('');
 const go=async ev=>{ev.preventDefault();try{await api('/login','POST',{user:u,password:p});done()}catch(x){setE(x.message)}};
 return <div className="min-h-screen grid place-items-center p-5"><form onSubmit={go} className="glass rounded-3xl p-8 w-full max-w-sm"><h1 className="text-4xl mb-1.5">Tamjid Mart</h1><p className="text-mut mb-5">Sign in to manage your website.</p>
  <label className="block mb-3.5 text-[13px] font-semibold">Username<input className="input mt-1.5 font-normal" autoComplete="username" value={u} onChange={x=>setU(x.target.value)}/></label>
  <label className="block mb-3.5 text-[13px] font-semibold">Password<input className="input mt-1.5 font-normal" type="password" autoComplete="current-password" value={p} onChange={x=>setP(x.target.value)}/></label><Err>{e}</Err><button className="btn w-full" type="submit">Sign in</button></form></div>;
}
const NAV=[['dashboard','Dashboard'],['products','Products'],['categories','Collections'],['banners','Hero banners'],['enquiries','Enquiries'],['seo','SEO'],['settings','Settings'],['account','Account']];
export default function Admin(){
 const [D,setD]=useState(null),[auth,setAuth]=useState(null),[tab,setTab]=useState('dashboard'),[msg,setMsg]=useState('');
 const toast=m=>{setMsg(m);setTimeout(()=>setMsg(''),2200)};
 const reload=()=>api('/admin/all').then(d=>{setD(d);setAuth(true)}).catch(e=>e.status===401?setAuth(false):toast(e.message));
 useEffect(()=>{document.title='Admin | Tamjid Mart';reload()},[]);
 if(auth===null)return null;
 if(!auth)return <Login done={reload}/>;
 const P={D,reload,toast},nw=D.enquiries.filter(e=>e.status==='new').length,list=['products','categories','banners'].includes(tab);
 return <div className="grid md:grid-cols-[230px_1fr] gap-5 p-5 max-w-[1400px] mx-auto">
  <aside className="glass rounded-3xl p-5 flex md:flex-col flex-wrap gap-1.5 md:sticky md:top-5 md:h-[calc(100vh-40px)]"><div className="font-serif text-[28px] mb-4 w-full">{D.settings.siteName}</div>
   {NAV.map(([k,l])=><button key={k} onClick={()=>setTab(k)} className={`text-left px-3.5 py-2.5 rounded-xl font-semibold ${tab===k?'bg-acc text-white':'text-mut hover:bg-white/60'}`}>{l}{k==='enquiries'&&nw>0&&` (${nw})`}</button>)}
   <a className="btn btn-ghost btn-sm md:mt-auto" href="/" target="_blank" rel="noopener noreferrer">View website</a><button className="btn btn-ghost btn-sm" onClick={()=>api('/logout','POST').then(()=>setAuth(false))}>Sign out</button></aside>
  <main className="min-w-0">{list?<List key={tab} col={tab} {...P}/>:tab==='dashboard'?<Dashboard D={D}/>:tab==='enquiries'?<Enquiries {...P}/>:tab==='seo'?<Seo {...P}/>:tab==='settings'?<SettingsPage title="Settings" sch={ST} {...P}/>:<Account {...P}/>}</main>
  {msg&&<div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-ink text-white px-5 py-3 rounded-2xl z-[60]">{msg}</div>}</div>;
}
