// Tamjid Mart - zero-dependency Node.js server (no npm install needed)
const http=require('http'),fs=require('fs'),path=require('path'),crypto=require('crypto');
const PORT=process.env.PORT||3000,D=path.join(__dirname,'data'),U=path.join(__dirname,'uploads'),DBF=path.join(D,'db.json');
[D,U].forEach(d=>fs.mkdirSync(d,{recursive:true}));
const hash=(p,s)=>crypto.scryptSync(p,s,32).toString('hex'),uid=()=>crypto.randomBytes(4).toString('hex');
let db,timer;
const save=()=>fs.writeFileSync(DBF,JSON.stringify(db,null,1)),saveSoon=()=>{clearTimeout(timer);timer=setTimeout(save,1500)};
if(fs.existsSync(DBF))db=JSON.parse(fs.readFileSync(DBF));else{
 const salt=crypto.randomBytes(8).toString('hex'),now=Date.now();
 const cats=['Electronics','Home & Kitchen','Fashion','Beauty & Care'].map((name,i)=>({id:uid(),name,description:'',image:''}));
 const demo=[['Wireless Earbuds Pro',0,'Clear sound, deep bass and a compact charging case.'],['Smart Watch Series 5',0,'Fitness tracking, notifications and a bright AMOLED display.'],['Non-stick Cookware Set',1,'Durable 7-piece set that is easy to clean.'],['Ceramic Dinner Set',1,'Elegant 24-piece set for family dinners.'],['Cotton Panjabi',2,'Soft breathable cotton with a tailored fit.'],['Leather Wallet',2,'Slim genuine leather with RFID protection.'],['Vitamin C Serum',3,'Brightening daily serum for a fresh glow.'],['Hair Dryer 2000W',3,'Fast drying with three heat settings.']];
 db={settings:{siteName:'Tamjid Mart',tagline:'Quality products, chosen with care.',logo:'',whatsapp:'8801700000000',phone:'+8801700000000',email:'hello@tamjidmart.com',address:'Savar, Dhaka, Bangladesh',hours:'Saturday to Thursday, 10am to 9pm',aboutText:'Tamjid Mart brings you trusted, genuine products at honest value. Message us to check availability and get help choosing.',waMessage:"Hello Tamjid Mart! I'm interested in {product}. Could you share more details?",facebook:'',instagram:'',youtube:''},
 admin:{user:'admin',salt,hash:hash(process.env.ADMIN_PASSWORD||'admin123',salt)},categories:cats,
 products:demo.map((p,i)=>({id:uid(),name:p[0],category:cats[p[1]].id,description:p[2],highlights:'Genuine product\nFast delivery available',images:[],badge:i<3?'New':'',featured:i%3==0,active:true,views:0,contacts:0,createdAt:now-i*1000})),
 banners:[{id:uid(),title:'Everyday essentials, beautifully curated',subtitle:'Discover trusted products and message us to order.',btnText:'Explore collection',btnLink:'#products',image:'',active:true},{id:uid(),title:'New arrivals just landed',subtitle:'Fresh picks across electronics, home, fashion and care.',btnText:'See what is new',btnLink:'#new',image:'',active:true}]};
 save();}
db.settings={siteUrl:'',seoTitle:'',seoDescription:'',keywords:'',ogImage:'',gtmId:'',gaId:'',...db.settings};db.enquiries=db.enquiries||[];
const ssr=require('./ssr')(()=>db),enqRate=new Map(),DIST=path.join(__dirname,'dist');
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.svg':'image/svg+xml'};
const sessions=new Map(),fails=new Map();
const send=(res,c,o,h={})=>{res.writeHead(c,{'Content-Type':'application/json',...h});res.end(JSON.stringify(o))};
const body=(req,max=1e6)=>new Promise((ok,no)=>{let n=0,c=[];req.on('data',d=>{n+=d.length;if(n>max){no(new Error('Too large'));req.destroy()}else c.push(d)});req.on('end',()=>{try{ok(JSON.parse(Buffer.concat(c).toString()||'{}'))}catch(e){no(new Error('Bad JSON'))}})});
const authed=req=>{const t=(req.headers.cookie||'').match(/sid=([a-f0-9]+)/)?.[1];return t&&sessions.get(t)>Date.now()?t:null};
const ALLOW={products:['name','category','description','highlights','images','badge','featured','active','seoTitle','seoDescription'],categories:['name','description','image'],banners:['title','subtitle','btnText','btnLink','image','active'],enquiries:['status']};
const pick=(o,keys)=>Object.fromEntries(keys.filter(k=>k in o).map(k=>[k,o[k]]));
function serve(res,base,rel){const f=path.normalize(path.join(base,rel));if(!f.startsWith(base+path.sep)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream','Cache-Control':base===U?'public,max-age=31536000':'no-cache'});fs.createReadStream(f).pipe(res)}
http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,'http://x'),p=decodeURIComponent(url.pathname),m=req.method;
 if(!p.startsWith('/api/')){
  if(m==='GET'){if(p==='/')return ssr.home(req,res);const pm=/^\/p\/([^/]+)$/.exec(p);if(pm)return ssr.prod(req,res,pm[1]);if(p==='/sitemap.xml')return ssr.sitemap(req,res);if(p==='/robots.txt')return ssr.robots(req,res)}
  if(p==='/admin'||p.startsWith('/admin/'))return ssr.spa(req,res);
  if(p.startsWith('/uploads/'))return serve(res,U,p.slice(9));
  {const f=path.join(DIST,p.slice(1));if(p!=='/'&&fs.existsSync(f)&&fs.statSync(f).isFile())return serve(res,DIST,p.slice(1));return ssr.spa(req,res,404)}}
 if(p==='/api/public'&&m==='GET')return send(res,200,ssr.pub());
 if(p==='/api/track'&&m==='POST'){const b=await body(req),x=db.products.find(i=>i.id===b.id);if(x){x[b.type==='contact'?'contacts':'views']++;saveSoon()}return send(res,200,{ok:1})}
 if(p==='/api/enquiry'&&m==='POST'){const ip=req.socket.remoteAddress,f=enqRate.get(ip)||{n:0,t:Date.now()};if(Date.now()-f.t>6e5){f.n=0;f.t=Date.now()}
  if(f.n>=5)return send(res,429,{error:'Too many enquiries. Please contact us on WhatsApp.'});
  const b=await body(req,2e4);if(b.website)return send(res,200,{ok:1});
  const c=(k,n)=>String(b[k]||'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,n),name=c('name',80),phone=c('phone',30),msg=String(b.message||'').trim().slice(0,1500);
  if(!name||!/^[+\d][\d\s()+-]{6,}$/.test(phone)||msg.length<3)return send(res,400,{error:'Please enter your name, a valid phone number and a message.'});
  const pr=db.products.find(x=>x.id===b.product);f.n++;enqRate.set(ip,f);
  db.enquiries.unshift({id:uid(),name,phone,message:msg,productId:pr?pr.id:'',productName:pr?pr.name:'',status:'new',createdAt:Date.now()});db.enquiries.length=Math.min(db.enquiries.length,2000);save();return send(res,200,{ok:1})}
 if(p==='/api/login'&&m==='POST'){
  const ip=req.socket.remoteAddress,f=fails.get(ip)||{n:0,t:Date.now()};if(Date.now()-f.t>6e5){f.n=0;f.t=Date.now()}
  if(f.n>=5)return send(res,429,{error:'Too many attempts. Try again in 10 minutes.'});
  const b=await body(req),a=db.admin,ok=b.user===a.user&&crypto.timingSafeEqual(Buffer.from(hash(String(b.password||''),a.salt)),Buffer.from(a.hash));
  if(!ok){f.n++;fails.set(ip,f);return send(res,401,{error:'Wrong username or password.'})}
  const t=crypto.randomBytes(24).toString('hex');sessions.set(t,Date.now()+864e5);fails.delete(ip);
  return send(res,200,{ok:1},{'Set-Cookie':`sid=${t}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400`})}
 if(p==='/api/logout'){const t=authed(req);if(t)sessions.delete(t);return send(res,200,{ok:1},{'Set-Cookie':'sid=; Path=/; Max-Age=0'})}
 if(!p.startsWith('/api/admin/'))return send(res,404,{error:'Not found'});
 if(!authed(req))return send(res,401,{error:'Please sign in.'});
 const [,, ,r,id]=p.split('/');
 if(r==='all')return send(res,200,{settings:db.settings,categories:db.categories,products:db.products,banners:db.banners,enquiries:db.enquiries,user:db.admin.user});
 if(r==='settings'&&m==='PUT'){const b=await body(req);for(const k in db.settings)if(k in b)db.settings[k]=String(b[k]).slice(0,2000);save();return send(res,200,db.settings)}
 if(r==='password'&&m==='POST'){const b=await body(req),a=db.admin;
  if(!crypto.timingSafeEqual(Buffer.from(hash(String(b.current||''),a.salt)),Buffer.from(a.hash)))return send(res,400,{error:'Current password is wrong.'});
  if(String(b.password||'').length<8)return send(res,400,{error:'New password must be at least 8 characters.'});
  a.salt=crypto.randomBytes(8).toString('hex');a.hash=hash(b.password,a.salt);if(b.user)a.user=String(b.user).slice(0,40);save();return send(res,200,{ok:1})}
 if(r==='upload'&&m==='POST'){const b=await body(req,8e6),mt=/^data:image\/(png|jpeg|webp|gif);base64,(.+)$/.exec(b.data||'');
  if(!mt)return send(res,400,{error:'Use a PNG, JPG, WEBP or GIF image.'});const buf=Buffer.from(mt[2],'base64');
  if(buf.length>5e6)return send(res,400,{error:'Image must be under 5 MB.'});
  const id=crypto.randomBytes(8).toString('hex'),n=id+'.'+(mt[1]==='jpeg'?'jpg':mt[1]);fs.writeFileSync(path.join(U,n),buf);
  const tt=mt[1]==='webp'&&/^data:image\/webp;base64,(.+)$/.exec(b.thumb||'');if(tt)fs.writeFileSync(path.join(U,id+'-t.webp'),Buffer.from(tt[1],'base64'));return send(res,200,{url:'/uploads/'+n})}
 if(ALLOW[r]){const list=db[r];
  if(m==='POST'&&r!=='enquiries'){const it={id:uid(),...pick(await body(req),ALLOW[r])};if(r==='products')Object.assign(it,{views:0,contacts:0,createdAt:Date.now()});list.push(it);save();return send(res,200,it)}
  const it=list.find(x=>x.id===id);if(!it)return send(res,404,{error:'Not found'});
  if(m==='PUT'){Object.assign(it,pick(await body(req),ALLOW[r]));it.updatedAt=Date.now();save();return send(res,200,it)}
  if(m==='DELETE'){list.splice(list.indexOf(it),1);if(r==='categories')db.products.forEach(x=>{if(x.category===id)x.category=''});save();return send(res,200,{ok:1})}}
 send(res,404,{error:'Not found'});
}catch(e){send(res,400,{error:e.message})}}).listen(PORT,()=>console.log(`Tamjid Mart running: http://localhost:${PORT}  |  Admin: http://localhost:${PORT}/admin`));
process.on('SIGINT',()=>{save();process.exit()});
