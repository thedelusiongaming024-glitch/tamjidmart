import {lazy,Suspense,useEffect} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,Routes,Route,useLocation} from 'react-router-dom';
import './index.css';
import {DataProvider,Shell,Home,ProductPage,NotFound} from './Store';
const Admin=lazy(()=>import('./Admin'));
function Scroll(){const {pathname,hash}=useLocation();useEffect(()=>{if(hash){const t=setTimeout(()=>document.getElementById(hash.slice(1))?.scrollIntoView({behavior:'smooth'}),80);return()=>clearTimeout(t)}window.scrollTo(0,0)},[pathname,hash]);return null}
createRoot(document.getElementById('root')).render(
 <BrowserRouter><Scroll/><Routes>
  <Route path="/admin/*" element={<Suspense fallback={null}><Admin/></Suspense>}/>
  <Route element={<DataProvider><Shell/></DataProvider>}><Route path="/" element={<Home/>}/><Route path="/p/:slug" element={<ProductPage/>}/><Route path="*" element={<NotFound/>}/></Route>
 </Routes></BrowserRouter>);
