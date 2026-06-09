/**
 * ABUNDANT MERCHANDISE — True Rebuild
 * Built from full source code analysis of the Emergent repo.
 * Exact match: Outfit+Manrope fonts, ink-* color tokens, lucide icons,
 * am-logo-mark starburst, product-image-wrap hover swap, skeleton shimmer,
 * all data-testid attributes, real product images from seed_data.py
 */

import { useState, useEffect, useContext, createContext, useCallback, useRef } from "react";
import { Analytics } from '@vercel/analytics/react';

// ── Font injection ──────────────────────────────────────────
if (!document.getElementById("am-fonts")) {
  const l = document.createElement("link");
  l.id = "am-fonts"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap";
  document.head.appendChild(l);
}

// ── Global CSS — exact index.css tokens ────────────────────
if (!document.getElementById("am-styles")) {
  const s = document.createElement("style");
  s.id = "am-styles";
  s.textContent = `
:root {
  --brand:#E8621A; --brand-h:#D05515; --brand-50:#FFF4ED; --brand-100:#FFE3D0;
  --ink-900:#111827; --ink-800:#1F2937; --ink-700:#374151; --ink-600:#4A4A4A;
  --ink-500:#6B7280; --ink-400:#9CA3AF; --ink-300:#D1D5DB; --ink-200:#E5E7EB;
  --ink-100:#F3F4F6; --ink-50:#F9FAFB; --r:0.5rem;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Manrope',ui-sans-serif,system-ui,sans-serif;color:var(--ink-900);background:#fff;-webkit-font-smoothing:antialiased;}
h1,h2,h3,h4,h5,h6{font-family:'Outfit',ui-sans-serif,system-ui,sans-serif;letter-spacing:-0.01em;}
button,input,select,textarea{font-family:inherit;}
a{text-decoration:none;color:inherit;}
input:focus,select:focus,textarea:focus{outline:none;border-color:var(--brand)!important;box-shadow:0 0 0 3px rgba(232,98,26,.15);}
::selection{background:var(--brand);color:white;}

/* am-logo-mark starburst — exact from index.css */
.am-logo-mark{position:relative;width:28px;height:28px;display:inline-block;flex-shrink:0;}
.am-logo-mark::before,.am-logo-mark::after{content:'';position:absolute;inset:0;background:var(--brand);clip-path:polygon(50% 0%,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0% 50%,40% 40%);}
.am-logo-mark::after{transform:rotate(22deg);background:var(--ink-800);opacity:.85;clip-path:polygon(50% 10%,56% 44%,90% 50%,56% 56%,50% 90%,44% 56%,10% 50%,44% 44%);}

/* product-image-wrap hover swap — exact from index.css */
.product-image-wrap{position:relative;overflow:hidden;}
.product-image-wrap img.primary,.product-image-wrap img.secondary{transition:opacity .35s ease,transform .6s ease;}
.product-image-wrap img.secondary{position:absolute;inset:0;opacity:0;}
.product-image-wrap:hover img.primary{opacity:0;transform:scale(1.04);}
.product-image-wrap:hover img.secondary{opacity:1;transform:scale(1.04);}

/* skeleton shimmer — exact from index.css */
.skeleton{position:relative;overflow:hidden;background-color:var(--ink-100);border-radius:4px;}
.skeleton::after{content:'';position:absolute;inset:0;background-image:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);transform:translateX(-100%);animation:shimmer 1.4s infinite;}
@keyframes shimmer{100%{transform:translateX(100%);}}

/* form-input — used in admin modal */
.form-input{width:100%;height:40px;padding:0 12px;font-size:14px;background:white;border:1.5px solid var(--ink-300);border-radius:var(--r);transition:border-color .15s,box-shadow .15s;}
.form-input:focus{border-color:var(--brand)!important;box-shadow:0 0 0 3px rgba(232,98,26,.15);}
textarea.form-input{height:auto;padding:10px 12px;resize:vertical;}

@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.fade-up{animation:fadeUp .4s ease both;}
@keyframes toastIn{from{transform:translateX(110%);opacity:0}to{transform:translateX(0);opacity:1}}
.toast-enter{animation:toastIn .28s ease;}
::-webkit-scrollbar{width:6px;height:6px;}
::-webkit-scrollbar-thumb{background:var(--ink-300);border-radius:3px;}
`;
  document.head.appendChild(s);
}

// ── Data — from seed_data.py and server.py ──────────────────
const CATEGORIES = [
  {slug:"electronics",  name:"Electronics",        image:"https://images.pexels.com/photos/705164/computer-laptop-work-place-camera-705164.jpeg?auto=compress&cs=tinysrgb&w=800", count:7},
  {slug:"home-garden",  name:"Home & Garden",       image:"https://images.unsplash.com/photo-1724582586529-62622e50c0b3?auto=format&fit=crop&w=800&q=80", count:6},
  {slug:"fashion",      name:"Fashion",             image:"https://images.pexels.com/photos/13158675/pexels-photo-13158675.jpeg?auto=compress&cs=tinysrgb&w=800", count:4},
  {slug:"beauty",       name:"Beauty",              image:"https://images.pexels.com/photos/7256102/pexels-photo-7256102.jpeg?auto=compress&cs=tinysrgb&w=800", count:3},
  {slug:"sports",       name:"Sports & Outdoors",   image:"https://images.pexels.com/photos/6740821/pexels-photo-6740821.jpeg?auto=compress&cs=tinysrgb&w=800", count:3},
  {slug:"tools",        name:"Tools & Hardware",    image:"https://images.pexels.com/photos/220639/pexels-photo-220639.jpeg?auto=compress&cs=tinysrgb&w=800", count:2},
  {slug:"toys",         name:"Toys & Games",        image:"https://images.pexels.com/photos/3661193/pexels-photo-3661193.jpeg?auto=compress&cs=tinysrgb&w=800", count:2},
  {slug:"office",       name:"Office & Stationery", image:"https://images.pexels.com/photos/5872176/pexels-photo-5872176.jpeg?auto=compress&cs=tinysrgb&w=800", count:2},
];

const PRODUCTS = [
  {id:"p1",title:"AeroBook 14 Ultra Laptop",category:"electronics",brand:"Voltura",price:1299,sale_price:1099,sku:"VLT-AERO-14",stock_quantity:24,rating:4.7,review_count:312,fulfillment_type:"warehouse",featured:true,
   images:["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=800&q=80"],
   description:"14-inch ultrabook with Intel Core Ultra 7, 16GB RAM, 512GB NVMe SSD, 2.8K OLED display.",specs:{CPU:"Intel Core Ultra 7",RAM:"16GB",Storage:"512GB NVMe",Display:"14\" 2.8K OLED"}},
  {id:"p2",title:"Pulse Mechanical Keyboard 75%",category:"electronics",brand:"OrbitGear",price:119,sale_price:99,sku:"OG-PULSE-75",stock_quantity:87,rating:4.6,review_count:189,fulfillment_type:"warehouse",featured:true,
   images:["https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=800&q=80"],
   description:"75% layout mechanical keyboard with Gateron Yellow switches, PBT keycaps, RGB backlight.",specs:{Switch:"Gateron Yellow",Layout:"75%",Backlight:"RGB"}},
  {id:"p3",title:"Glide ErgoMouse Wireless",category:"electronics",brand:"OrbitGear",price:49,sale_price:null,sku:"OG-GLIDE-WL",stock_quantity:0,rating:4.4,review_count:98,fulfillment_type:"dropship",featured:false,
   images:["https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80"],
   description:"Ergonomic vertical wireless mouse, 2.4GHz + Bluetooth, 90-day battery life.",specs:{DPI:"800-3200",Battery:"90 days",Connection:"2.4GHz + BT"}},
  {id:"p4",title:"Echelon Pro Wireless Headphones",category:"electronics",brand:"Voltura",price:249,sale_price:199,sku:"VLT-ECHO-PRO",stock_quantity:56,rating:4.8,review_count:421,fulfillment_type:"warehouse",featured:true,
   images:["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=800&q=80"],
   description:"ANC over-ear headphones, 40hr battery, Hi-Res Audio certified, foldable design.",specs:{ANC:"Yes",Battery:"40hr",Driver:"40mm"}},
  {id:"p5",title:"Tide Wireless Earbuds Pro",category:"electronics",brand:"Voltura",price:119,sale_price:89,sku:"VLT-TIDE-EP",stock_quantity:132,rating:4.6,review_count:287,fulfillment_type:"warehouse",featured:true,
   images:["https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1631867675167-90a456a90863?auto=format&fit=crop&w=800&q=80"],
   description:"True wireless earbuds with ANC, 8hr playback + 24hr case, IPX5 waterproof.",specs:{Battery:"8+24hr",ANC:"Yes",IP:"IPX5"}},
  {id:"p6",title:"Vertex Active Smartwatch",category:"electronics",brand:"Vertex",price:199,sale_price:169,sku:"VTX-ACTIVE-1",stock_quantity:41,rating:4.7,review_count:356,fulfillment_type:"warehouse",featured:true,
   images:["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80"],
   description:"GPS smartwatch, heart rate + SpO2, 14-day battery, AMOLED display, 50m water resistant.",specs:{Battery:"14 days",GPS:"Built-in",Water:"50m"},variants:[{name:"Colour",options:["Black","Silver","Rose Gold"]}]},
  {id:"p7",title:"Lumen 4K Monitor 27\"",category:"electronics",brand:"Lumenco",price:379,sale_price:319,sku:"LMC-4K-27",stock_quantity:0,rating:4.5,review_count:143,fulfillment_type:"dropship",featured:false,
   images:["https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1593640408182-31c228b2c2db?auto=format&fit=crop&w=800&q=80"],
   description:"27\" 4K IPS monitor, 144Hz, HDR400, USB-C 90W charging, slim bezel design.",specs:{Resolution:"4K UHD",Refresh:"144Hz",Panel:"IPS"}},
  {id:"p8",title:"Hearthline Linen Sofa 3-Seat",category:"home-garden",brand:"Hearthline",price:899,sale_price:749,sku:"HL-SOFA-3S",stock_quantity:14,rating:4.6,review_count:78,fulfillment_type:"warehouse",featured:true,
   images:["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=800&q=80"],
   description:"Mid-century 3-seat sofa in premium linen blend, solid wood legs, removable covers.",specs:{Material:"Linen blend",Legs:"Solid oak",Dimensions:"220×85×80cm"}},
  {id:"p9",title:"Copper Pot Set 8-Piece",category:"home-garden",brand:"Kindle & Co.",price:219,sale_price:179,sku:"KC-POTS-8P",stock_quantity:33,rating:4.8,review_count:234,fulfillment_type:"warehouse",featured:true,
   images:["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1584990347449-39ad749df763?auto=format&fit=crop&w=800&q=80"],
   description:"8-piece non-stick cookware set with copper exterior, induction-compatible, dishwasher safe.",specs:{Pieces:"8",Material:"Aluminium + copper",Induction:"Yes"}},
  {id:"p10",title:"Espresso Maker Pro 15-Bar",category:"home-garden",brand:"Kindle & Co.",price:449,sale_price:379,sku:"KC-ESPRO-15",stock_quantity:18,rating:4.7,review_count:189,fulfillment_type:"warehouse",featured:true,
   images:["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80"],
   description:"15-bar semi-automatic espresso machine with built-in grinder and steam wand.",specs:{Pressure:"15-bar",Tank:"1.8L",Grinder:"Built-in"}},
  {id:"p11",title:"Halo Floor Lamp Brass",category:"home-garden",brand:"Lumenco",price:189,sale_price:null,sku:"LMC-HALO-BR",stock_quantity:27,rating:4.5,review_count:67,fulfillment_type:"warehouse",featured:false,
   images:["https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80"],
   description:"Arc floor lamp in brushed brass, dimmable LED 2700K, premium fabric shade.",specs:{Bulb:"LED 9W","Color Temp":"2700K",Height:"170cm"}},
  {id:"p12",title:"Northcross Wool Topcoat",category:"fashion",brand:"Northcross",price:329,sale_price:269,sku:"NC-TOPCOAT-M",stock_quantity:18,rating:4.8,review_count:112,fulfillment_type:"warehouse",featured:true,
   images:["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"],
   description:"Single-breasted wool-blend topcoat, Italian fabric, fully lined, regular fit.",specs:{Material:"70% wool, 30% polyester",Lining:"Full",Fit:"Regular"},variants:[{name:"Size",options:["XS","S","M","L","XL","XXL"]}]},
  {id:"p13",title:"Drape Knit Midi Dress",category:"fashion",brand:"Studio Bloom",price:119,sale_price:null,sku:"SB-MIDI-DRS",stock_quantity:26,rating:4.6,review_count:89,fulfillment_type:"warehouse",featured:true,
   images:["https://images.unsplash.com/photo-1539008835657-9e8e9680c956?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=80"],
   description:"Fluid knit midi dress in viscose blend, V-neckline, elasticated waist, lined.",specs:{Material:"90% viscose",Length:"Midi"},variants:[{name:"Size",options:["XS","S","M","L","XL"]},{name:"Colour",options:["Sage","Ivory","Black"]}]},
  {id:"p14",title:"Trail Blaze Running Shoes",category:"sports",brand:"Trailbreak",price:139,sale_price:109,sku:"TB-TRAIL-RUN",stock_quantity:44,rating:4.7,review_count:298,fulfillment_type:"warehouse",featured:true,
   images:["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=800&q=80"],
   description:"Lightweight trail running shoe, Vibram outsole, waterproof membrane, reflective details.",specs:{Outsole:"Vibram",Weight:"280g",Drop:"8mm"},variants:[{name:"Size",options:["US 7","US 8","US 9","US 10","US 11","US 12"]}]},
  {id:"p15",title:"Iron Core Adjustable Dumbbell Set",category:"sports",brand:"ForgeAthletics",price:299,sale_price:249,sku:"FA-DUMBB-ADJ",stock_quantity:12,rating:4.9,review_count:456,fulfillment_type:"warehouse",featured:true,
   images:["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=800&q=80"],
   description:"Adjustable dumbbell set 5–50 lbs, 15 weight settings, quick-select dial.",specs:{Range:"5-50 lbs",Settings:"15",Material:"Steel + rubber"}},
  {id:"p16",title:"Vitamin C Brightening Serum",category:"beauty",brand:"GlowLab",price:49,sale_price:38,sku:"GL-VTC-SRM",stock_quantity:89,rating:4.7,review_count:534,fulfillment_type:"dropship",featured:true,
   images:["https://images.pexels.com/photos/7256102/pexels-photo-7256102.jpeg?auto=compress&cs=tinysrgb&w=800","https://images.unsplash.com/photo-1556228578-626bd2df8d0a?auto=format&fit=crop&w=800&q=80"],
   description:"20% Vitamin C + Hyaluronic Acid serum. Brightens, firms, and hydrates in 4 weeks.",specs:{"Vitamin C":"20%",Size:"30ml",Type:"All skin types"}},
  {id:"p17",title:"Pro Skincare Gift Set 5-Piece",category:"beauty",brand:"GlowLab",price:89,sale_price:69,sku:"GL-GIFT-5P",stock_quantity:45,rating:4.6,review_count:178,fulfillment_type:"dropship",featured:true,
   images:["https://images.unsplash.com/photo-1522335789203-aaa222caf32f?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1556228578-626bd2df8d0a?auto=format&fit=crop&w=800&q=80"],
   description:"5-piece skincare set: cleanser, toner, serum, moisturiser, SPF50 sunscreen. Cruelty-free.",specs:{Pieces:"5","Skin Type":"All","Cruelty-free":"Yes"}},
  {id:"p18",title:"Cordless Drill 20V Brushless",category:"tools",brand:"IronForge",price:129,sale_price:99,sku:"IF-DRILL-20V",stock_quantity:38,rating:4.8,review_count:312,fulfillment_type:"warehouse",featured:false,
   images:["https://images.pexels.com/photos/220639/pexels-photo-220639.jpeg?auto=compress&cs=tinysrgb&w=800","https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80"],
   description:"20V brushless cordless drill, 2-speed, 530 in-lbs torque, includes 2×2Ah batteries.",specs:{Voltage:"20V",Torque:"530 in-lbs",Battery:"2×2Ah included"}},
  {id:"p19",title:"LEGO Technic Sports Car 620pc",category:"toys",brand:"LEGO",price:79,sale_price:64,sku:"LG-TECH-SC",stock_quantity:31,rating:4.9,review_count:621,fulfillment_type:"warehouse",featured:false,
   images:["https://images.pexels.com/photos/3661193/pexels-photo-3661193.jpeg?auto=compress&cs=tinysrgb&w=800","https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=800&q=80"],
   description:"620-piece Technic sports car with working suspension and V6 engine. Ages 10+.",specs:{Pieces:"620",Age:"10+",Theme:"Technic"}},
  {id:"p20",title:"Ergonomic Mesh Office Chair",category:"office",brand:"Solace",price:349,sale_price:279,sku:"SLC-MESH-CHR",stock_quantity:0,rating:4.5,review_count:156,fulfillment_type:"dropship",featured:true,
   images:["https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=800&q=80","https://images.unsplash.com/photo-1591370874773-6702e8f12fd8?auto=format&fit=crop&w=800&q=80"],
   description:"Full-mesh ergonomic chair, adjustable lumbar, 4D armrests, 300lb capacity.",specs:{Material:"Mesh",Capacity:"300 lbs",Armrests:"4D adjustable"}},
];

// ── Helpers ────────────────────────────────────────────────
const formatPrice = (v) => Number(v||0).toLocaleString("en-US",{style:"currency",currency:"USD"});

// ── Contexts ───────────────────────────────────────────────
const AuthCtx   = createContext(null);
const RouterCtx = createContext(null);
const ToastCtx  = createContext(null);

// ── Toast Provider ─────────────────────────────────────────
function ToastProvider({children}) {
  const [toasts,setToasts] = useState([]);
  const add = useCallback((msg,type="success") => {
    const id = Date.now();
    setToasts(t => [...t,{id,msg,type}]);
    setTimeout(() => setToasts(t => t.filter(x=>x.id!==id)), 3000);
  },[]);
  return (
    <ToastCtx.Provider value={add}>
      {children}
      <div style={{position:"fixed",bottom:20,right:20,zIndex:9999,display:"flex",flexDirection:"column",gap:8}}>
        {toasts.map(t => (
          <div key={t.id} className="toast-enter" style={{
            background:t.type==="error"?"#FEF2F2":"white",
            border:`1px solid ${t.type==="error"?"#FECACA":"var(--ink-200)"}`,
            color:t.type==="error"?"#B91C1C":"var(--ink-900)",
            padding:"12px 16px",borderRadius:8,fontSize:13,fontWeight:500,
            display:"flex",alignItems:"center",gap:8,
            boxShadow:"0 4px 20px rgba(0,0,0,.1)",maxWidth:320
          }}>
            <span style={{width:8,height:8,borderRadius:"50%",flexShrink:0,
              background:t.type==="error"?"#EF4444":"var(--brand)"}}/>
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => useContext(ToastCtx);

// ── Auth Provider ──────────────────────────────────────────
function AuthProvider({children}) {
  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(false);
  const login = async (email,password) => {
    if (password.length < 4) throw new Error("Invalid credentials");
    const u = {id:"u1",email,name:email.split("@")[0],role:email.includes("admin")?"admin":"customer",created_at:new Date().toISOString()};
    setUser(u); return u;
  };
  const register = async (name,email,password) => {
    if (password.length < 8) throw new Error("Password must be at least 8 characters.");
    const u = {id:"u2",email,name,role:"customer",created_at:new Date().toISOString()};
    setUser(u); return u;
  };
  const logout = async () => setUser(null);
  return (
    <AuthCtx.Provider value={{user,loading,login,register,logout,isAdmin:user?.role==="admin"}}>
      {children}
    </AuthCtx.Provider>
  );
}
const useAuth = () => useContext(AuthCtx);

// ── Router Provider ────────────────────────────────────────
function RouterProvider({children}) {
  const [page,setPage] = useState({name:"home",params:{}});
  const navigate = useCallback((name,params={}) => {
    setPage({name,params});
    window.scrollTo({top:0,behavior:"smooth"});
  },[]);
  return <RouterCtx.Provider value={{page,navigate}}>{children}</RouterCtx.Provider>;
}
const useNavigate = () => useContext(RouterCtx).navigate;
const usePage = () => useContext(RouterCtx).page;

// ── Lucide-style icons (strokeWidth 1.5/1.75) ──────────────
const Ic = (paths,sw=1.5) => ({size=20,color="currentColor",cls="",style={}}={}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"
    className={cls} style={style} aria-hidden="true">
    {(Array.isArray(paths)?paths:[paths]).map((d,i) => <path key={i} d={d}/>)}
  </svg>
);
const icons = {
  Truck:     Ic(["M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v7a2 2 0 0 1-2 2h-2","M14 17H9","M16 21a2 2 0 1 0-4 0 2 2 0 0 0 4 0","M23 21a2 2 0 1 0-4 0 2 2 0 0 0 4 0"],1.75),
  Shield:    Ic("M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10",1.75),
  Sparkles:  Ic("m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z",1.75),
  Search:    Ic(["M11 4a7 7 0 1 0 0 14A7 7 0 0 0 11 4z","m21 21-4.35-4.35"],1.75),
  ShoppingBag: Ic(["M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z","M3 6h18","M16 10a4 4 0 0 1-8 0"],1.5),
  User:      Ic(["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"],1.5),
  Menu:      Ic("M3 12h18M3 6h18M3 18h18",1.75),
  X:         Ic("M18 6 6 18M6 6l12 12",1.75),
  ChevronDown: Ic("m6 9 6 6 6-6",1.75),
  ChevronRight: Ic("m9 18 6-6-6-6",2),
  ChevronLeft: Ic("m15 18-6-6 6-6",2),
  ArrowRight: Ic("M5 12h14M12 5l7 7-7 7",2),
  ArrowLeft: Ic("M19 12H5M12 19l-7-7 7-7",1.75),
  Heart:     Ic("M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",1.5),
  Share2:    Ic(["M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8","M16 6l-4-4-4 4","M12 2v13"],1.5),
  Plus:      Ic("M5 12h14M12 5v14",1.75),
  Minus:     Ic("M5 12h14",1.75),
  Package2:  Ic(["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"],1.75),
  Filter:    Ic("M22 3H2l8 9.46V19l4 2v-8.54L22 3",1.75),
  Pencil:    Ic(["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7","M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"],1.75),
  Trash:     Ic(["M3 6h18","M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6","M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"],1.75),
  LayoutDashboard: Ic(["M3 9h18M3 15h18","M9 3v18"],1.75),
  Tag:       Ic(["M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z","M7 7h.01"],1.75),
  AlertTriangle: Ic(["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"],1.75),
  Users:     Ic(["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75"],1.75),
  Mail:      Ic(["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"],1.75),
  Phone:     Ic("M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 13 19.79 19.79 0 0 1 1.08 4.4 2 2 0 0 1 3.05 2.25h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z",1.75),
  MapPin:    Ic(["M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z","M12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],1.75),
  RotateCcw: Ic(["M3 2v6h6","M3.05 13A9 9 0 1 0 6 5.3L3 8"],1.5),
  Lock:      Ic(["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z","M7 11V7a5 5 0 0 1 10 0v4"],1.75),
  AlertCircle: Ic(["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 8v4","M12 16h.01"],1.75),
  Facebook:  Ic("M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",1.5),
  Instagram: Ic(["M16 4H8a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4z","M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z","M17.5 6.5h.01"],1.5),
  Twitter:   Ic("M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z",1.5),
  Youtube:   Ic(["M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z","M9.75 15.02l5.75-3.02-5.75-3.02v6.04z"],1.5),
};

// ── Star Rating ────────────────────────────────────────────
function StarRating({rating,size=14}) {
  return (
    <div style={{display:"flex",gap:1}}>
      {[1,2,3,4,5].map(n => (
        <svg key={n} width={size} height={size} viewBox="0 0 24 24"
          fill={n<=Math.round(rating)?"var(--brand)":"none"}
          stroke="var(--brand)" strokeWidth={0} aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </div>
  );
}

// ── Logo — exact Logo.jsx ──────────────────────────────────
function Logo({inverted=false}) {
  const navigate = useNavigate();
  return (
    <button data-testid="navbar-logo-link" onClick={()=>navigate("home")}
      style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",
        cursor:"pointer",padding:0,transition:"opacity .2s"}}
      aria-label="Abundant Merchandise — Home">
      <span className="am-logo-mark"
        style={{transition:"transform .3s"}}
        onMouseEnter={e=>e.currentTarget.style.transform="rotate(12deg)"}
        onMouseLeave={e=>e.currentTarget.style.transform=""}/>
      <span style={{lineHeight:"1.15",fontFamily:"'Outfit',sans-serif"}}>
        <span style={{display:"block",fontSize:17,fontWeight:700,letterSpacing:"-0.01em",
          color:inverted?"white":"var(--ink-900)"}}>Abundant</span>
        <span style={{display:"block",fontSize:11,fontWeight:600,textTransform:"uppercase",
          letterSpacing:"0.22em",color:"var(--brand)"}}>Merchandise</span>
      </span>
    </button>
  );
}

// ── Announcement Bar — exact AnnouncementBar.jsx ───────────
function AnnouncementBar() {
  const {Truck,Shield,Sparkles} = icons;
  return (
    <div data-testid="announcement-bar" style={{background:"var(--ink-900)",color:"white",fontSize:12}}>
      <div style={{maxWidth:1280,margin:"0 auto",padding:"0 32px",height:36,
        display:"flex",alignItems:"center",justifyContent:"space-between",gap:24}}>
        <div style={{display:"flex",alignItems:"center",gap:24}}>
          <span style={{display:"flex",alignItems:"center",gap:6}}>
            <Truck size={14} color="var(--brand)"/>Free shipping over $49
          </span>
          <span style={{display:"flex",alignItems:"center",gap:6}}>
            <Shield size={14} color="var(--brand)"/>30-day returns
          </span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <Sparkles size={14} color="var(--brand)"/>
          <span style={{fontWeight:500,letterSpacing:"0.02em"}}>FLASH SALE — up to 40% off select categories</span>
        </div>
      </div>
    </div>
  );
}

// ── Navbar — exact Navbar.jsx ──────────────────────────────
function Navbar() {
  const {user,logout} = useAuth();
  const navigate = useNavigate();
  const page = usePage();
  const toast = useToast();
  const {Search,Menu,X,ChevronDown,User,ShoppingBag,ArrowLeft} = icons;
  const [search,setSearch] = useState("");
  const [accOpen,setAccOpen] = useState(false);
  const [deptOpen,setDeptOpen] = useState(false);
  const [mobileOpen,setMobileOpen] = useState(false);
  const accRef = useRef(null);

  useEffect(() => {
    const h = e => { if(accRef.current && !accRef.current.contains(e.target)) setAccOpen(false); };
    document.addEventListener("mousedown",h);
    return () => document.removeEventListener("mousedown",h);
  },[]);

  const submitSearch = e => {
    e.preventDefault();
    if(search.trim()) navigate("shop",{q:search.trim()});
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    await logout(); setAccOpen(false); navigate("home");
    toast("Signed out successfully");
  };

  const navLinkStyle = (active) => ({
    padding:"8px 12px",fontSize:13.5,fontWeight:500,
    color:active?"var(--brand)":"var(--ink-700)",
    background:"none",border:"none",cursor:"pointer",
    borderRadius:6,transition:"color .15s",whiteSpace:"nowrap"
  });

  return (
    <header data-testid="navbar" style={{position:"sticky",top:0,zIndex:40,background:"white",borderBottom:"1px solid var(--ink-200)"}}>
      <AnnouncementBar/>
      <div style={{maxWidth:1280,margin:"0 auto",padding:"0 32px"}}>
        <div style={{height:64,display:"flex",alignItems:"center",gap:16}}>

          <Logo/>

          {/* Departments toggle */}
          <button data-testid="navbar-departments-toggle" onClick={()=>setDeptOpen(v=>!v)}
            style={{display:"inline-flex",alignItems:"center",gap:6,marginLeft:16,
              padding:"8px 12px",fontSize:13.5,fontWeight:500,color:"var(--ink-700)",
              background:"none",border:"none",cursor:"pointer",borderRadius:6,transition:"color .15s"}}
            onMouseEnter={e=>e.currentTarget.style.color="var(--brand)"}
            onMouseLeave={e=>e.currentTarget.style.color="var(--ink-700)"}>
            <Menu size={16}/>All Departments<ChevronDown size={14}/>
          </button>

          {/* Search bar */}
          <form onSubmit={submitSearch} style={{flex:1,maxWidth:480}}>
            <div style={{position:"relative"}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}}>
                <Search size={16} color="var(--ink-400)"/>
              </span>
              <input data-testid="navbar-search-input" value={search}
                onChange={e=>setSearch(e.target.value)} type="text"
                placeholder="Search products, brands and more…"
                style={{width:"100%",height:40,paddingLeft:36,paddingRight:80,fontSize:13.5,
                  background:"var(--ink-50)",border:"1px solid var(--ink-200)",borderRadius:6}}/>
              <button data-testid="navbar-search-submit" type="submit"
                style={{position:"absolute",right:4,top:4,height:32,padding:"0 12px",
                  fontSize:12,fontWeight:600,color:"white",background:"var(--brand)",
                  border:"none",borderRadius:4,cursor:"pointer"}}>
                Search
              </button>
            </div>
          </form>

          {/* Right icons */}
          <div style={{display:"flex",alignItems:"center",gap:4,marginLeft:"auto"}}>
            <button onClick={()=>navigate("shop")}
              style={navLinkStyle(page.name==="shop")}
              onMouseEnter={e=>e.currentTarget.style.color="var(--brand)"}
              onMouseLeave={e=>e.currentTarget.style.color=page.name==="shop"?"var(--brand)":"var(--ink-700)"}>
              Shop
            </button>

            {/* Account dropdown */}
            <div style={{position:"relative"}} ref={accRef}>
              <button data-testid="navbar-account-button" onClick={()=>setAccOpen(v=>!v)}
                style={{padding:8,color:"var(--ink-700)",background:"none",border:"none",
                  display:"flex",alignItems:"center",gap:6,cursor:"pointer",
                  borderRadius:6,transition:"color .15s"}}
                onMouseEnter={e=>e.currentTarget.style.color="var(--brand)"}
                onMouseLeave={e=>e.currentTarget.style.color="var(--ink-700)"}>
                <User size={20}/><span style={{fontSize:12,fontWeight:500}}>Account</span>
              </button>
              {accOpen && (
                <div style={{position:"absolute",right:0,top:"calc(100% + 8px)",width:240,
                  background:"white",border:"1px solid var(--ink-200)",borderRadius:8,
                  boxShadow:"0 8px 32px rgba(0,0,0,.12)",zIndex:50,overflow:"hidden"}}>
                  {!user ? (
                    <>
                      <div style={{padding:"12px 16px 8px",borderBottom:"1px solid var(--ink-100)"}}>
                        <p style={{fontSize:12,color:"var(--ink-500)"}}>Welcome to Abundant</p>
                      </div>
                      {[["Sign in","login","navbar-login-link"],["Create account","register","navbar-register-link"]].map(([l,p,t])=>(
                        <button key={p} data-testid={t} onClick={()=>{navigate(p);setAccOpen(false);}}
                          style={{display:"block",width:"100%",textAlign:"left",padding:"10px 16px",
                            background:"none",border:"none",fontSize:13.5,color:"var(--ink-700)",
                            cursor:"pointer",borderBottom:"1px solid var(--ink-50)"}}
                          onMouseEnter={e=>{e.currentTarget.style.background="var(--brand-50)";e.currentTarget.style.color="var(--brand)";}}
                          onMouseLeave={e=>{e.currentTarget.style.background="";e.currentTarget.style.color="var(--ink-700)";}}>
                          {l}
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      <div style={{padding:"10px 16px",borderBottom:"1px solid var(--ink-100)"}}>
                        <p style={{fontSize:11,color:"var(--ink-500)"}}>Signed in as</p>
                        <p style={{fontSize:13,fontWeight:500,color:"var(--ink-900)"}}>{user.email}</p>
                      </div>
                      <button data-testid="navbar-account-link" onClick={()=>{navigate("account");setAccOpen(false);}}
                        style={{display:"flex",alignItems:"center",gap:8,width:"100%",
                          textAlign:"left",padding:"10px 16px",background:"none",
                          border:"none",fontSize:13.5,color:"var(--ink-700)",cursor:"pointer",
                          borderBottom:"1px solid var(--ink-50)"}}
                        onMouseEnter={e=>{e.currentTarget.style.background="var(--brand-50)";e.currentTarget.style.color="var(--brand)";}}
                        onMouseLeave={e=>{e.currentTarget.style.background="";e.currentTarget.style.color="var(--ink-700)";}}>
                        <User size={14}/>My Account
                      </button>
                      {user.role==="admin" && (
                        <button data-testid="navbar-admin-link" onClick={()=>{navigate("admin");setAccOpen(false);}}
                          style={{display:"flex",alignItems:"center",gap:8,width:"100%",
                            textAlign:"left",padding:"10px 16px",background:"none",
                            border:"none",fontSize:13.5,color:"var(--ink-700)",cursor:"pointer",
                            borderBottom:"1px solid var(--ink-50)"}}
                          onMouseEnter={e=>{e.currentTarget.style.background="var(--brand-50)";e.currentTarget.style.color="var(--brand)";}}
                          onMouseLeave={e=>{e.currentTarget.style.background="";e.currentTarget.style.color="var(--ink-700)";}}>
                          <icons.LayoutDashboard size={14}/>Admin
                        </button>
                      )}
                      <button data-testid="navbar-logout-button" onClick={handleLogout}
                        style={{display:"flex",alignItems:"center",gap:8,width:"100%",
                          textAlign:"left",padding:"10px 16px",background:"none",
                          border:"none",fontSize:13.5,color:"var(--ink-700)",cursor:"pointer"}}
                        onMouseEnter={e=>{e.currentTarget.style.background="var(--brand-50)";e.currentTarget.style.color="var(--brand)";}}
                        onMouseLeave={e=>{e.currentTarget.style.background="";e.currentTarget.style.color="var(--ink-700)";}}>
                        Sign out
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <button data-testid="navbar-cart-button"
              style={{position:"relative",padding:8,color:"var(--ink-700)",
                background:"none",border:"none",cursor:"pointer",borderRadius:6,
                transition:"color .15s"}}
              aria-label="Cart"
              onMouseEnter={e=>e.currentTarget.style.color="var(--brand)"}
              onMouseLeave={e=>e.currentTarget.style.color="var(--ink-700)"}>
              <ShoppingBag size={20}/>
              <span style={{position:"absolute",top:-2,right:-2,background:"var(--brand)",
                color:"white",fontSize:10,fontWeight:700,borderRadius:"50%",
                width:16,height:16,display:"flex",alignItems:"center",justifyContent:"center"}}>0</span>
            </button>
          </div>
        </div>

        {/* Category rail */}
        <nav style={{display:"flex",alignItems:"center",gap:4,height:44,
          borderTop:"1px solid var(--ink-100)",overflowX:"auto"}}>
          {CATEGORIES.map(c => (
            <button key={c.slug} data-testid="navbar-department-link"
              onClick={()=>navigate("category",{slug:c.slug})}
              style={{...navLinkStyle(page.params?.slug===c.slug),whiteSpace:"nowrap"}}
              onMouseEnter={e=>e.currentTarget.style.color="var(--brand)"}
              onMouseLeave={e=>e.currentTarget.style.color=page.params?.slug===c.slug?"var(--brand)":"var(--ink-700)"}>
              {c.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Departments mega-dropdown */}
      {deptOpen && (
        <div style={{position:"absolute",left:0,right:0,background:"white",
          borderBottom:"1px solid var(--ink-200)",boxShadow:"0 8px 32px rgba(0,0,0,.1)",zIndex:30}}
          onClick={()=>setDeptOpen(false)}>
          <div style={{maxWidth:1280,margin:"0 auto",padding:"24px 32px",
            display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
            {CATEGORIES.map(c => (
              <button key={c.slug} onClick={()=>navigate("category",{slug:c.slug})}
                style={{display:"flex",alignItems:"center",gap:12,padding:12,
                  border:"1px solid var(--ink-200)",borderRadius:8,background:"none",
                  cursor:"pointer",transition:"all .15s",textAlign:"left"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--brand)";e.currentTarget.style.background="var(--brand-50)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--ink-200)";e.currentTarget.style.background="";}}>
                <img src={c.image} alt={c.name}
                  style={{width:40,height:40,objectFit:"cover",borderRadius:6,flexShrink:0}}/>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:"var(--ink-900)"}}>{c.name}</div>
                  <div style={{fontSize:12,color:"var(--ink-500)"}}>{c.count} items</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

// ── Footer — exact Footer.jsx ──────────────────────────────
function Footer() {
  const navigate = useNavigate();
  const toast = useToast();
  const {Mail,Phone,MapPin,Facebook,Instagram,Twitter,Youtube} = icons;
  const [email,setEmail] = useState("");
  const [subscribed,setSubscribed] = useState(false);

  const cols = [
    {title:"Shop",links:[["All Products","shop"],["Electronics","cat-electronics"],["Home & Garden","cat-home-garden"],["Fashion","cat-fashion"],["Beauty","cat-beauty"]]},
    {title:"Help",links:[["Contact Us","#"],["Shipping & Returns","#"],["Track Order","#"],["FAQ","#"]]},
    {title:"Company",links:[["About Us","#"],["Blog","#"],["Careers","#"],["Privacy Policy","#"]]},
  ];

  const go = href => {
    if (href.startsWith("cat-")) navigate("category",{slug:href.slice(4)});
    else if (href !== "#") navigate(href);
  };

  return (
    <footer data-testid="footer" style={{background:"var(--ink-900)",color:"var(--ink-200)",marginTop:96}}>
      <div style={{maxWidth:1280,margin:"0 auto",padding:"56px 32px"}}>
        <div style={{display:"grid",gridTemplateColumns:"4fr 2fr 2fr 2fr 2fr",gap:40,flexWrap:"wrap"}}>
          <div>
            <Logo inverted/>
            <p style={{marginTop:16,fontSize:13.5,color:"var(--ink-400)",lineHeight:1.7,maxWidth:300}}>
              Your one-stop destination for quality merchandise across home, tech, fashion and beyond. Curated value, every day.
            </p>
            <div style={{marginTop:24,display:"flex",flexDirection:"column",gap:8}}>
              {[[Mail,"hello@abundantmerchandise.com"],[Phone,"+1 (555) 010-2030"],[MapPin,"Distribution HQ, Reno NV"]].map(([Ico,t])=>(
                <div key={t} style={{display:"flex",alignItems:"center",gap:8,fontSize:13.5}}>
                  <Ico size={16} color="var(--brand)"/><span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {cols.map(col=>(
            <div key={col.title}>
              <h4 style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.14em",color:"white",marginBottom:16}}>{col.title}</h4>
              <ul style={{listStyle:"none",display:"flex",flexDirection:"column",gap:10}}>
                {col.links.map(([label,href])=>(
                  <li key={label}>
                    <button onClick={()=>go(href)}
                      style={{background:"none",border:"none",fontSize:13.5,color:"var(--ink-400)",cursor:"pointer",padding:0,transition:"color .15s"}}
                      onMouseEnter={e=>e.currentTarget.style.color="white"}
                      onMouseLeave={e=>e.currentTarget.style.color="var(--ink-400)"}>
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.14em",color:"white",marginBottom:16}}>Newsletter</h4>
            <p style={{fontSize:13.5,color:"var(--ink-400)",marginBottom:12}}>10% off your first order.</p>
            {subscribed ? (
              <p style={{fontSize:13.5,color:"var(--brand)"}}>Thanks — check your inbox!</p>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                <input data-testid="footer-newsletter-input" type="email" value={email}
                  onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"
                  style={{height:40,padding:"0 12px",fontSize:13,background:"var(--ink-800)",
                    border:"1px solid var(--ink-700)",borderRadius:6,color:"white"}}/>
                <button data-testid="footer-newsletter-submit"
                  onClick={()=>{if(email){setSubscribed(true);toast("Subscribed! Check your inbox.");}}}
                  style={{height:40,background:"var(--brand)",color:"white",border:"none",
                    borderRadius:6,fontSize:13.5,fontWeight:600,cursor:"pointer",transition:"background .15s"}}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--brand-h)"}
                  onMouseLeave={e=>e.currentTarget.style.background="var(--brand)"}>
                  Subscribe
                </button>
              </div>
            )}
          </div>
        </div>

        <div style={{marginTop:48,paddingTop:24,borderTop:"1px solid var(--ink-800)",
          display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <p style={{fontSize:12,color:"var(--ink-500)"}}>© {new Date().getFullYear()} Abundant Merchandise. All rights reserved.</p>
          <div style={{display:"flex",gap:8}}>
            {[[Facebook,"Facebook"],[Instagram,"Instagram"],[Twitter,"Twitter"],[Youtube,"YouTube"]].map(([Ico,label])=>(
              <a key={label} href="#" aria-label={label}
                style={{width:32,height:32,display:"inline-flex",alignItems:"center",justifyContent:"center",
                  borderRadius:"50%",background:"var(--ink-800)",transition:"background .15s",color:"white"}}
                onMouseEnter={e=>e.currentTarget.style.background="var(--brand)"}
                onMouseLeave={e=>e.currentTarget.style.background="var(--ink-800)"}>
                <Ico size={16}/>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── ProductCard — exact ProductCard.jsx ────────────────────
function ProductCard({product}) {
  const navigate = useNavigate();
  const toast = useToast();
  const {Package2,Truck} = icons;
  if (!product) return null;
  const img1 = product.images?.[0] || "https://placehold.co/600x600?text=No+Image";
  const img2 = product.images?.[1] || img1;
  const onSale = !!product.sale_price && product.sale_price < product.price;
  const discPct = onSale ? Math.round(((product.price-product.sale_price)/product.price)*100) : 0;
  const finalPrice = onSale ? product.sale_price : product.price;
  const isDropship = product.fulfillment_type === "dropship";

  return (
    <div data-testid="product-card-link"
      onClick={()=>navigate("product",{id:product.id})}
      style={{background:"white",border:"1.5px solid var(--ink-100)",borderRadius:12,
        overflow:"hidden",cursor:"pointer",display:"block",
        transition:"border-color .3s,box-shadow .3s,transform .3s"}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(232,98,26,.3)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,.1)";e.currentTarget.style.transform="translateY(-4px)";}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--ink-100)";e.currentTarget.style.boxShadow="";e.currentTarget.style.transform="translateY(0)";}}>

      {/* Image with hover-swap from index.css */}
      <div className="product-image-wrap" data-testid="product-card"
        style={{aspectRatio:"1",background:"var(--ink-50)"}}>
        <img src={img1} alt={product.title} className="primary"
          style={{width:"100%",height:"100%",objectFit:"cover"}} loading="lazy"/>
        <img src={img2} alt="" className="secondary"
          style={{width:"100%",height:"100%",objectFit:"cover"}} aria-hidden="true" loading="lazy"/>
        {onSale && (
          <span data-testid="product-card-sale-badge"
            style={{position:"absolute",top:12,left:12,background:"#EF4444",color:"white",
              fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:4,
              textTransform:"uppercase",letterSpacing:"0.06em",zIndex:2}}>
            -{discPct}%
          </span>
        )}
        <span data-testid="product-card-fulfillment-badge"
          style={{position:"absolute",top:12,right:12,background:"var(--ink-900)",color:"white",
            fontSize:10,fontWeight:600,padding:"3px 8px",borderRadius:4,
            display:"flex",alignItems:"center",gap:4,zIndex:2}}>
          {isDropship ? <Package2 size={11}/> : <Truck size={11}/>}
          {isDropship ? "DROPSHIP" : "WAREHOUSE"}
        </span>
      </div>

      {/* Info */}
      <div style={{padding:16}}>
        {product.brand && (
          <p style={{fontSize:11,textTransform:"uppercase",letterSpacing:"0.12em",
            color:"var(--ink-500)",fontWeight:600,marginBottom:4}}>{product.brand}</p>
        )}
        <h3 data-testid="product-card-title"
          style={{fontSize:14,fontWeight:600,color:"var(--ink-900)",lineHeight:1.4,
            display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",
            overflow:"hidden",minHeight:"2.4em"}}>{product.title}</h3>
        <div style={{display:"flex",alignItems:"center",gap:6,marginTop:8}}>
          <StarRating rating={product.rating} size={13}/>
          <span style={{fontSize:12,color:"var(--ink-700)",fontWeight:500}}>{(product.rating||0).toFixed(1)}</span>
          <span style={{fontSize:12,color:"var(--ink-400)"}}>({product.review_count||0})</span>
        </div>
        <div data-testid="product-card-price"
          style={{marginTop:12,display:"flex",alignItems:"baseline",gap:8}}>
          <span style={{fontSize:18,fontWeight:700,color:onSale?"#DC2626":"var(--ink-900)"}}>
            {formatPrice(finalPrice)}
          </span>
          {onSale && <span style={{fontSize:13,color:"var(--ink-400)",textDecoration:"line-through"}}>{formatPrice(product.price)}</span>}
        </div>
      </div>
    </div>
  );
}

// ── ProductGrid — exact ProductGrid.jsx ────────────────────
function ProductGrid({products,loading,columns=4,skeletonCount=8}) {
  const grid = {display:"grid",gridTemplateColumns:`repeat(${columns},minmax(0,1fr))`,gap:24};
  if (loading) return (
    <div style={grid} data-testid="shop-product-grid">
      {Array.from({length:skeletonCount}).map((_,i)=>(
        <div key={i} style={{background:"white",border:"1px solid var(--ink-100)",borderRadius:12,overflow:"hidden"}}>
          <div className="skeleton" style={{aspectRatio:"1"}}/>
          <div style={{padding:16,display:"flex",flexDirection:"column",gap:8}}>
            <div className="skeleton" style={{height:11,width:60}}/>
            <div className="skeleton" style={{height:14,width:"100%"}}/>
            <div className="skeleton" style={{height:14,width:"75%"}}/>
            <div className="skeleton" style={{height:20,width:90,marginTop:4}}/>
          </div>
        </div>
      ))}
    </div>
  );
  if (!products?.length) return (
    <div data-testid="shop-empty-state"
      style={{textAlign:"center",padding:"80px 20px",border:"1.5px dashed var(--ink-200)",borderRadius:12}}>
      <p style={{fontWeight:600,color:"var(--ink-700)"}}>No products match your filters.</p>
      <p style={{fontSize:14,color:"var(--ink-500)",marginTop:4}}>Try adjusting filters or clearing them all.</p>
    </div>
  );
  return (
    <div style={grid} data-testid="shop-product-grid">
      {products.map(p=><ProductCard key={p.id} product={p}/>)}
    </div>
  );
}

// ── Home Page — exact Home.jsx ─────────────────────────────
const TRUST = [
  {Icon:icons.Truck,     title:"Free shipping",   sub:"On orders over $49"},
  {Icon:icons.RotateCcw, title:"30-day returns",  sub:"Hassle-free refunds"},
  {Icon:icons.Shield,    title:"Secure checkout", sub:"PCI-DSS encrypted"},
  {Icon:icons.User,      title:"24/7 support",    sub:"We are here to help"},
];

function HomePage() {
  const navigate = useNavigate();
  const {ArrowRight} = icons;
  const [loading,setLoading] = useState(true);
  const featured = PRODUCTS.filter(p=>p.featured);

  useEffect(()=>{
    const t = setTimeout(()=>setLoading(false),700);
    return ()=>clearTimeout(t);
  },[]);

  return (
    <div data-testid="home-page">

      {/* HERO — from Home.jsx */}
      <section style={{position:"relative",background:"var(--ink-900)",color:"white",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,opacity:0.3}}>
          <img src="https://images.pexels.com/photos/5625003/pexels-photo-5625003.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        </div>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to right,var(--ink-900) 0%,rgba(17,24,39,.85) 50%,transparent 100%)"}}/>
        <div style={{position:"relative",maxWidth:1280,margin:"0 auto",padding:"80px 32px",
          display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,alignItems:"center"}}>
          <div>
            <span style={{display:"inline-block",padding:"4px 12px",background:"rgba(232,98,26,.15)",
              border:"1px solid rgba(232,98,26,.3)",color:"var(--brand)",fontSize:11,fontWeight:700,
              textTransform:"uppercase",letterSpacing:"0.12em",borderRadius:20}}>
              Flash Sale · Limited Time
            </span>
            <h1 style={{marginTop:20,fontSize:"clamp(2.2rem,4vw,3.5rem)",fontWeight:800,lineHeight:1.1,letterSpacing:"-0.02em"}}>
              Abundant deals.<br/>
              <span style={{color:"var(--brand)"}}>Every day, every aisle.</span>
            </h1>
            <p style={{marginTop:20,fontSize:16,color:"var(--ink-300)",maxWidth:480,lineHeight:1.75}}>
              Shop thousands of products across electronics, home, fashion, and more — with up to 40% off this week and free shipping on orders over $49.
            </p>
            <div style={{marginTop:32,display:"flex",gap:12,flexWrap:"wrap"}}>
              <button data-testid="home-hero-cta-button" onClick={()=>navigate("shop")}
                style={{display:"inline-flex",alignItems:"center",gap:8,background:"var(--brand)",
                  color:"white",fontWeight:600,borderRadius:8,padding:"12px 24px",border:"none",
                  fontSize:14,cursor:"pointer",transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="var(--brand-h)"}
                onMouseLeave={e=>e.currentTarget.style.background="var(--brand)"}>
                Shop the sale <ArrowRight size={16}/>
              </button>
              <button data-testid="home-hero-secondary-cta-button"
                onClick={()=>navigate("category",{slug:"electronics"})}
                style={{display:"inline-flex",alignItems:"center",gap:8,
                  background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",
                  color:"white",fontWeight:600,borderRadius:8,padding:"12px 24px",
                  fontSize:14,cursor:"pointer",transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.2)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.1)"}>
                Browse Electronics
              </button>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <img src="https://images.pexels.com/photos/705164/computer-laptop-work-place-camera-705164.jpeg?auto=compress&cs=tinysrgb&w=600"
              alt="" style={{borderRadius:12,aspectRatio:"4/5",objectFit:"cover",width:"100%"}}/>
            <div style={{display:"flex",flexDirection:"column",gap:16,paddingTop:40}}>
              <img src="https://images.unsplash.com/photo-1724582586529-62622e50c0b3?auto=format&fit=crop&w=400&q=80"
                alt="" style={{borderRadius:12,aspectRatio:"1",objectFit:"cover",width:"100%"}}/>
              <img src="https://images.pexels.com/photos/13158675/pexels-photo-13158675.jpeg?auto=compress&cs=tinysrgb&w=400"
                alt="" style={{borderRadius:12,aspectRatio:"1",objectFit:"cover",width:"100%"}}/>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section style={{borderBottom:"1px solid var(--ink-200)",background:"var(--ink-50)"}}>
        <div style={{maxWidth:1280,margin:"0 auto",padding:"24px 32px",
          display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24}}>
          {TRUST.map(({Icon,title,sub})=>(
            <div key={title} style={{display:"flex",alignItems:"center",gap:12}}>
              <Icon size={24} color="var(--brand)"/>
              <div>
                <p style={{fontSize:13.5,fontWeight:600,color:"var(--ink-900)"}}>{title}</p>
                <p style={{fontSize:12,color:"var(--ink-500)"}}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{maxWidth:1280,margin:"0 auto",padding:"64px 32px"}}>
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:32}}>
          <div>
            <p style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:"var(--brand)"}}>Shop by department</p>
            <h2 style={{fontSize:"clamp(1.5rem,3vw,2rem)",fontWeight:700,color:"var(--ink-900)",marginTop:4}}>Explore categories</h2>
          </div>
          <button data-testid="home-shop-all-cta-button" onClick={()=>navigate("shop")}
            style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:13.5,fontWeight:600,
              color:"var(--brand)",background:"none",border:"none",cursor:"pointer"}}>
            View all <ArrowRight size={16}/>
          </button>
        </div>
        <div data-testid="home-categories-grid"
          style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:20}}>
          {CATEGORIES.slice(0,8).map(c=>(
            <button key={c.slug} data-testid="home-category-tile"
              onClick={()=>navigate("category",{slug:c.slug})}
              style={{position:"relative",aspectRatio:"5/6",borderRadius:12,overflow:"hidden",
                border:"1px solid var(--ink-100)",cursor:"pointer",background:"none",padding:0,
                transition:"all .3s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(232,98,26,.3)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,.1)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--ink-100)";e.currentTarget.style.boxShadow="";}}>
              <img src={c.image} alt={c.name}
                style={{width:"100%",height:"100%",objectFit:"cover",transition:"transform .5s"}}
                onMouseEnter={e=>e.target.style.transform="scale(1.05)"}
                onMouseLeave={e=>e.target.style.transform="scale(1)"}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(17,24,39,.85) 0%,rgba(17,24,39,.3) 50%,transparent 100%)"}}/>
              <div style={{position:"absolute",bottom:0,left:0,right:0,padding:16}}>
                <h3 style={{color:"white",fontWeight:600,fontSize:15}}>{c.name}</h3>
                <p style={{color:"rgba(255,255,255,.7)",fontSize:12,marginTop:2}}>{c.count} items</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section style={{background:"var(--ink-50)",borderTop:"1px solid var(--ink-200)",borderBottom:"1px solid var(--ink-200)"}}>
        <div style={{maxWidth:1280,margin:"0 auto",padding:"64px 32px"}}>
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:32}}>
            <div>
              <p style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:"var(--brand)"}}>Hand-picked for you</p>
              <h2 style={{fontSize:"clamp(1.5rem,3vw,2rem)",fontWeight:700,color:"var(--ink-900)",marginTop:4}}>Featured products</h2>
            </div>
            <button onClick={()=>navigate("shop")}
              style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:13.5,fontWeight:600,
                color:"var(--brand)",background:"none",border:"none",cursor:"pointer"}}>
              Shop all <ArrowRight size={16}/>
            </button>
          </div>
          <div data-testid="home-featured-grid">
            <ProductGrid products={featured} loading={loading} columns={4}/>
          </div>
        </div>
      </section>

      {/* PROMO BENTO */}
      <section style={{maxWidth:1280,margin:"0 auto",padding:"64px 32px"}}>
        <div style={{display:"grid",gridTemplateColumns:"8fr 4fr",gap:24}}>
          <div style={{position:"relative",borderRadius:12,overflow:"hidden",background:"var(--ink-900)",
            color:"white",padding:48,minHeight:260,display:"flex",alignItems:"flex-end"}}>
            <img src="https://images.pexels.com/photos/5872176/pexels-photo-5872176.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:.4}}/>
            <div style={{position:"relative"}}>
              <p style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:"var(--brand)"}}>New arrivals</p>
              <h3 style={{fontSize:"clamp(1.3rem,2.5vw,1.75rem)",fontWeight:700,marginTop:8,lineHeight:1.25}}>Fresh picks for your workspace</h3>
              <p style={{color:"var(--ink-300)",fontSize:13.5,marginTop:8,maxWidth:380}}>Tech, gear, and office essentials — updated weekly.</p>
              <button onClick={()=>navigate("category",{slug:"office"})}
                style={{display:"inline-flex",alignItems:"center",gap:8,marginTop:20,
                  background:"white",color:"var(--ink-900)",fontWeight:600,borderRadius:8,
                  padding:"10px 20px",fontSize:13.5,border:"none",cursor:"pointer",transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.background="var(--brand)";e.currentTarget.style.color="white";}}
                onMouseLeave={e=>{e.currentTarget.style.background="white";e.currentTarget.style.color="var(--ink-900)";}}>
                Shop now <ArrowRight size={16}/>
              </button>
            </div>
          </div>
          <div style={{position:"relative",borderRadius:12,overflow:"hidden",background:"var(--brand)",
            color:"white",padding:32,minHeight:260,display:"flex",flexDirection:"column",justifyContent:"flex-end"}}>
            <p style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:"rgba(255,255,255,.8)"}}>Member exclusive</p>
            <h3 style={{fontSize:"1.5rem",fontWeight:700,marginTop:8}}>Save 10%</h3>
            <p style={{color:"rgba(255,255,255,.9)",fontSize:13.5,marginTop:8}}>Sign up & unlock first-order savings.</p>
            <button onClick={()=>navigate("register")}
              style={{display:"inline-flex",alignItems:"center",gap:8,marginTop:20,
                background:"white",color:"var(--brand)",fontWeight:600,borderRadius:8,
                padding:"10px 20px",fontSize:13.5,border:"none",cursor:"pointer",
                width:"fit-content",transition:"all .15s"}}
              onMouseEnter={e=>{e.currentTarget.style.background="var(--ink-900)";e.currentTarget.style.color="white";}}
              onMouseLeave={e=>{e.currentTarget.style.background="white";e.currentTarget.style.color="var(--brand)";}}>
              Create account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Filters — exact Filters.jsx ────────────────────────────
function FilterGroup({title,children,defaultOpen=true}) {
  const [open,setOpen] = useState(defaultOpen);
  const {ChevronDown} = icons;
  return (
    <div data-testid="filter-group" style={{borderBottom:"1px solid var(--ink-200)",padding:"16px 0"}}>
      <button onClick={()=>setOpen(v=>!v)}
        style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",
          fontSize:13.5,fontWeight:600,color:"var(--ink-900)",marginBottom:open?12:0,
          background:"none",border:"none",cursor:"pointer"}}>
        {title}<ChevronDown size={16} style={{transition:"transform .2s",transform:open?"":"rotate(-90deg)"}}/>
      </button>
      {open && <div style={{display:"flex",flexDirection:"column",gap:8}}>{children}</div>}
    </div>
  );
}

function FilterCheck({label,checked,onChange,count,testid}) {
  return (
    <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",
      fontSize:13.5,color:"var(--ink-700)",transition:"color .12s"}}
      onMouseEnter={e=>e.currentTarget.style.color="var(--brand)"}
      onMouseLeave={e=>e.currentTarget.style.color="var(--ink-700)"}>
      <input type="checkbox" data-testid={testid} checked={checked} onChange={onChange}
        style={{width:14,height:14,accentColor:"var(--brand)",flexShrink:0}}/>
      <span style={{flex:1}}>{label}</span>
      {count!=null && <span style={{fontSize:12,color:"var(--ink-400)"}}>{count}</span>}
    </label>
  );
}

// ── Shop — exact Shop.jsx ──────────────────────────────────
function ShopPage({fixedCategory=null,headerTitle="All Products",headerSub="Discover thousands of curated finds across every department."}) {
  const navigate = useNavigate();
  const {Filter,X,ChevronLeft,ChevronRight} = icons;
  const [loading,setLoading] = useState(true);
  const [searchInput,setSearchInput] = useState("");
  const [sort,setSort] = useState("newest");
  const [page,setPage] = useState(1);
  const [drawerOpen,setDrawerOpen] = useState(false);
  const [sel,setSel] = useState({
    category:fixedCategory?[fixedCategory]:[],
    brand:[],fulfillment:[],
    min_price:"",max_price:"",on_sale:false
  });

  useEffect(()=>{
    setLoading(true);
    const t = setTimeout(()=>setLoading(false),600);
    return ()=>clearTimeout(t);
  },[sel,sort,page]);

  // Client-side filter (mirrors FastAPI logic)
  let results = [...PRODUCTS];
  const activeCat = fixedCategory || sel.category[0];
  if (activeCat) results = results.filter(p=>p.category===activeCat);
  if (sel.brand.length) results = results.filter(p=>sel.brand.includes(p.brand));
  if (sel.fulfillment.length) results = results.filter(p=>sel.fulfillment.includes(p.fulfillment_type));
  if (sel.min_price) results = results.filter(p=>p.price>=Number(sel.min_price));
  if (sel.max_price) results = results.filter(p=>p.price<=Number(sel.max_price));
  if (sel.on_sale) results = results.filter(p=>p.sale_price&&p.sale_price<p.price);
  if (searchInput.trim()) {
    const q = searchInput.toLowerCase();
    results = results.filter(p=>p.title.toLowerCase().includes(q)||p.brand?.toLowerCase().includes(q)||p.category.toLowerCase().includes(q));
  }
  if (sort==="price_asc") results.sort((a,b)=>a.price-b.price);
  else if (sort==="price_desc") results.sort((a,b)=>b.price-a.price);
  else if (sort==="rating") results.sort((a,b)=>b.rating-a.rating);
  else if (sort==="popular") results.sort((a,b)=>b.review_count-a.review_count);

  const PAGE_SIZE = 12;
  const total = results.length;
  const pages = Math.max(1,Math.ceil(total/PAGE_SIZE));
  const pageItems = results.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE);
  const brands = [...new Set(PRODUCTS.map(p=>p.brand).filter(Boolean))].sort();

  const toggle = (key,val) => {
    const cur = new Set(sel[key]||[]);
    cur.has(val)?cur.delete(val):cur.add(val);
    setSel(s=>({...s,[key]:Array.from(cur)})); setPage(1);
  };
  const clearAll = () => { setSel({category:[],brand:[],fulfillment:[],min_price:"",max_price:"",on_sale:false}); setPage(1); };

  const appliedPills = [
    ...(sel.category.map(s=>({key:`cat-${s}`,label:CATEGORIES.find(c=>c.slug===s)?.name||s,remove:()=>toggle("category",s)}))),
    ...(sel.brand.map(b=>({key:`br-${b}`,label:b,remove:()=>toggle("brand",b)}))),
    ...(sel.fulfillment.map(f=>({key:`ful-${f}`,label:f,remove:()=>toggle("fulfillment",f)}))),
    ...(sel.min_price?[{key:"min",label:`Min $${sel.min_price}`,remove:()=>setSel(s=>({...s,min_price:""}))}]:[]),
    ...(sel.max_price?[{key:"max",label:`Max $${sel.max_price}`,remove:()=>setSel(s=>({...s,max_price:""}))}]:[]),
    ...(sel.on_sale?[{key:"sale",label:"On sale",remove:()=>setSel(s=>({...s,on_sale:false}))}]:[]),
  ];

  const Sidebar = ()=>(
    <aside style={{width:"100%"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <h3 style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:"var(--ink-900)"}}>Filters</h3>
        <button data-testid="shop-clear-all-button" onClick={clearAll}
          style={{fontSize:12,fontWeight:600,color:"var(--brand)",background:"none",border:"none",cursor:"pointer"}}>
          Clear all
        </button>
      </div>
      {!fixedCategory && (
        <FilterGroup title="Category">
          {CATEGORIES.map(c=>(
            <FilterCheck key={c.slug} testid="filter-category-checkbox"
              label={c.name} count={c.count}
              checked={sel.category.includes(c.slug)}
              onChange={()=>toggle("category",c.slug)}/>
          ))}
        </FilterGroup>
      )}
      <FilterGroup title="Price">
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <input data-testid="filter-price-min-input" type="number" min={0} placeholder="Min"
            value={sel.min_price} onChange={e=>setSel(s=>({...s,min_price:e.target.value}))}
            style={{width:"100%",height:36,padding:"0 8px",fontSize:13,
              background:"white",border:"1px solid var(--ink-300)",borderRadius:6}}/>
          <span style={{color:"var(--ink-400)"}}>—</span>
          <input data-testid="filter-price-max-input" type="number" min={0} placeholder="Max"
            value={sel.max_price} onChange={e=>setSel(s=>({...s,max_price:e.target.value}))}
            style={{width:"100%",height:36,padding:"0 8px",fontSize:13,
              background:"white",border:"1px solid var(--ink-300)",borderRadius:6}}/>
        </div>
      </FilterGroup>
      <FilterGroup title="Brand">
        <div style={{maxHeight:220,overflowY:"auto",display:"flex",flexDirection:"column",gap:8,paddingRight:4}}>
          {brands.map(b=>(
            <FilterCheck key={b} testid="filter-brand-checkbox" label={b}
              checked={sel.brand.includes(b)} onChange={()=>toggle("brand",b)}/>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Fulfillment">
        {["warehouse","dropship","digital"].map(f=>(
          <FilterCheck key={f} testid="filter-fulfillment-checkbox"
            label={f.charAt(0).toUpperCase()+f.slice(1)}
            checked={sel.fulfillment.includes(f)}
            onChange={()=>toggle("fulfillment",f)}/>
        ))}
      </FilterGroup>
      <FilterGroup title="Promotions">
        <FilterCheck testid="filter-on-sale-checkbox" label="On sale only"
          checked={sel.on_sale}
          onChange={()=>{setSel(s=>({...s,on_sale:!s.on_sale}));setPage(1);}}/>
      </FilterGroup>
    </aside>
  );

  return (
    <div data-testid="shop-page" style={{maxWidth:1280,margin:"0 auto",padding:"32px 32px"}}>
      <div style={{marginBottom:32}}>
        <h1 style={{fontSize:"clamp(1.75rem,3vw,2.25rem)",fontWeight:800,color:"var(--ink-900)"}}>{headerTitle}</h1>
        <p style={{color:"var(--ink-500)",marginTop:8,fontSize:14}}>{headerSub}</p>
      </div>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,gap:16,flexWrap:"wrap"}}>
        <form onSubmit={e=>{e.preventDefault();setPage(1);}} style={{flex:1,maxWidth:480}}>
          <div style={{position:"relative"}}>
            <input data-testid="shop-search-input" value={searchInput}
              onChange={e=>{setSearchInput(e.target.value);setPage(1);}}
              placeholder="Search products…"
              style={{width:"100%",height:44,padding:"0 80px 0 16px",fontSize:13.5,
                background:"white",border:"1.5px solid var(--ink-300)",borderRadius:8}}/>
            <button data-testid="shop-search-submit" type="submit"
              style={{position:"absolute",right:4,top:4,height:36,padding:"0 16px",
                fontSize:12,fontWeight:600,color:"white",background:"var(--brand)",
                border:"none",borderRadius:6,cursor:"pointer"}}>
              Search
            </button>
          </div>
        </form>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button data-testid="shop-filter-toggle-button" onClick={()=>setDrawerOpen(true)}
            style={{display:"inline-flex",alignItems:"center",gap:8,height:40,padding:"0 16px",
              fontSize:13.5,fontWeight:600,color:"var(--ink-900)",background:"white",
              border:"1.5px solid var(--ink-300)",borderRadius:8,cursor:"pointer"}}>
            <Filter size={16}/>Filters
          </button>
          <select data-testid="shop-sort-select" value={sort} onChange={e=>{setSort(e.target.value);setPage(1);}}
            style={{height:40,padding:"0 12px",fontSize:13.5,background:"white",
              border:"1.5px solid var(--ink-300)",borderRadius:8}}>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"260px 1fr",gap:32}}>
        <div><Sidebar/></div>
        <div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <p data-testid="shop-results-count" style={{fontSize:13.5,color:"var(--ink-500)"}}>
              <span style={{fontWeight:600,color:"var(--ink-900)"}}>{total}</span> products
            </p>
          </div>
          {appliedPills.length>0 && (
            <div data-testid="shop-applied-pills"
              style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:16}}>
              {appliedPills.map(p=>(
                <button key={p.key} onClick={p.remove}
                  style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",
                    fontSize:12,fontWeight:500,background:"var(--brand-50)",color:"var(--brand)",
                    border:"1px solid rgba(232,98,26,.2)",borderRadius:20,cursor:"pointer",transition:"all .15s"}}
                  onMouseEnter={e=>{e.currentTarget.style.background="var(--brand)";e.currentTarget.style.color="white";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="var(--brand-50)";e.currentTarget.style.color="var(--brand)";}}>
                  {p.label}<X size={12}/>
                </button>
              ))}
            </div>
          )}
          <ProductGrid products={pageItems} loading={loading} columns={3}/>
          {pages>1 && (
            <div style={{marginTop:40,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <button data-testid="shop-prev-page-button"
                onClick={()=>{setPage(p=>Math.max(1,p-1));window.scrollTo({top:0,behavior:"smooth"});}}
                disabled={page<=1}
                style={{display:"inline-flex",alignItems:"center",gap:4,height:40,padding:"0 16px",
                  fontSize:13.5,fontWeight:500,border:"1.5px solid var(--ink-300)",borderRadius:8,
                  background:"white",cursor:page<=1?"not-allowed":"pointer",opacity:page<=1?0.4:1}}>
                <ChevronLeft size={16}/>Prev
              </button>
              <span style={{fontSize:13.5,color:"var(--ink-700)",padding:"0 12px"}}>Page {page} of {pages}</span>
              <button data-testid="shop-next-page-button"
                onClick={()=>{setPage(p=>Math.min(pages,p+1));window.scrollTo({top:0,behavior:"smooth"});}}
                disabled={page>=pages}
                style={{display:"inline-flex",alignItems:"center",gap:4,height:40,padding:"0 16px",
                  fontSize:13.5,fontWeight:500,border:"1.5px solid var(--ink-300)",borderRadius:8,
                  background:"white",cursor:page>=pages?"not-allowed":"pointer",opacity:page>=pages?0.4:1}}>
                Next<ChevronRight size={16}/>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <div style={{position:"fixed",inset:0,zIndex:50}}>
          <div style={{position:"absolute",inset:0,background:"rgba(17,24,39,.6)"}} onClick={()=>setDrawerOpen(false)}/>
          <div style={{position:"absolute",right:0,top:0,bottom:0,width:"85%",maxWidth:380,
            background:"white",overflowY:"auto",boxShadow:"-4px 0 32px rgba(0,0,0,.12)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:16,borderBottom:"1px solid var(--ink-200)"}}>
              <h3 style={{fontWeight:700,color:"var(--ink-900)"}}>Filters</h3>
              <button onClick={()=>setDrawerOpen(false)} style={{background:"none",border:"none",cursor:"pointer"}}><X size={20}/></button>
            </div>
            <div style={{padding:16}}>
              <Sidebar/>
              <button onClick={()=>setDrawerOpen(false)}
                style={{marginTop:24,width:"100%",height:44,background:"var(--brand)",
                  color:"white",border:"none",borderRadius:8,fontSize:13.5,fontWeight:600,cursor:"pointer"}}>
                View {total} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Category Page — exact Category.jsx ─────────────────────
function CategoryPage({params}) {
  const slug = params?.slug||"";
  const meta = CATEGORIES.find(c=>c.slug===slug)||{slug,name:slug,count:0};
  return <ShopPage key={slug} fixedCategory={slug}
    headerTitle={meta.name||"Category"}
    headerSub={`Curated picks in ${meta.name} — ${meta.count} products available.`}/>;
}

// ── ProductDetail — exact ProductDetail.jsx ────────────────
function ProductDetailPage({params}) {
  const navigate = useNavigate();
  const toast = useToast();
  const {ChevronRight,Plus,Minus,Heart,Share2,RotateCcw,Shield,Truck,Package2} = icons;
  const product = PRODUCTS.find(p=>p.id===params?.id);
  const [activeImg,setActiveImg] = useState(0);
  const [qty,setQty] = useState(1);
  const [variants,setVariants] = useState({});
  const [tab,setTab] = useState("description");
  const related = product ? PRODUCTS.filter(p=>p.category===product.category&&p.id!==product.id).slice(0,4) : [];

  useEffect(()=>{
    if (!product) return;
    const init={};
    (product.variants||[]).forEach(v=>{if(v.options?.length)init[v.name]=v.options[0];});
    setVariants(init); setActiveImg(0); setQty(1);
  },[params?.id]);

  if (!product) return (
    <div style={{maxWidth:700,margin:"0 auto",padding:"96px 32px",textAlign:"center"}}>
      <h1 style={{fontSize:"1.75rem",fontWeight:700,color:"var(--ink-900)"}}>Product not found</h1>
      <p style={{marginTop:12,color:"var(--ink-500)"}}>The product you're looking for may have been removed.</p>
      <button onClick={()=>navigate("shop")} style={{display:"inline-block",marginTop:24,
        background:"var(--brand)",color:"white",fontWeight:600,borderRadius:8,
        padding:"12px 24px",border:"none",cursor:"pointer",fontSize:14}}>
        Continue shopping
      </button>
    </div>
  );

  const onSale = !!product.sale_price&&product.sale_price<product.price;
  const finalPrice = onSale?product.sale_price:product.price;
  const discPct = onSale?Math.round(((product.price-product.sale_price)/product.price)*100):0;
  const inStock = (product.stock_quantity||0)>0;
  const images = product.images?.length?product.images:["https://placehold.co/800x800?text=No+Image"];

  const fulfillMeta = {
    warehouse:{Icon:Truck,    label:"Warehouse fulfillment",sub:"Ships in 1-2 business days"},
    dropship: {Icon:Package2, label:"Dropship",             sub:"Direct from supplier · 3-7 days"},
    digital:  {Icon:Shield,   label:"Digital delivery",     sub:"Instant access on purchase"},
  }[product.fulfillment_type]||{Icon:Truck,label:"Standard delivery",sub:""};

  const tabStyle = (id) => ({
    position:"relative",paddingBottom:12,fontSize:13.5,fontWeight:600,
    color:tab===id?"var(--brand)":"var(--ink-500)",background:"none",
    border:"none",cursor:"pointer",transition:"color .15s"
  });

  return (
    <div data-testid="product-detail-page" style={{maxWidth:1280,margin:"0 auto",padding:"32px 32px"}}>
      {/* Breadcrumb */}
      <nav data-testid="product-detail-breadcrumb"
        style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--ink-500)",marginBottom:24}}>
        {[["Home","home"],["Shop","shop"]].map(([l,p])=>(
          <span key={p} style={{display:"flex",alignItems:"center",gap:6}}>
            <button onClick={()=>navigate(p)} style={{background:"none",border:"none",color:"var(--brand)",cursor:"pointer",fontSize:12,fontWeight:500}}>{l}</button>
            <ChevronRight size={12}/>
          </span>
        ))}
        <button onClick={()=>navigate("category",{slug:product.category})}
          style={{background:"none",border:"none",color:"var(--brand)",cursor:"pointer",fontSize:12,fontWeight:500,textTransform:"capitalize"}}>
          {product.category.replace("-"," ")}
        </button>
        <ChevronRight size={12}/>
        <span style={{color:"var(--ink-700)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200}}>{product.title}</span>
      </nav>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,marginBottom:64}}>
        {/* Gallery */}
        <div>
          <div data-testid="product-detail-image-main"
            style={{position:"relative",aspectRatio:"1",background:"var(--ink-50)",
              borderRadius:12,overflow:"hidden",border:"1.5px solid var(--ink-200)"}}>
            <img src={images[activeImg]} alt={product.title}
              style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            {onSale && (
              <span style={{position:"absolute",top:16,left:16,background:"#EF4444",color:"white",
                fontSize:12,fontWeight:700,padding:"4px 10px",borderRadius:4,
                textTransform:"uppercase",letterSpacing:"0.06em"}}>
                -{discPct}%
              </span>
            )}
          </div>
          {images.length>1 && (
            <div style={{marginTop:12,display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
              {images.map((img,i)=>(
                <button key={i} data-testid="product-detail-thumb" onClick={()=>setActiveImg(i)}
                  style={{aspectRatio:"1",borderRadius:8,overflow:"hidden",
                    border:`2px solid ${i===activeImg?"var(--brand)":"var(--ink-200)"}`,
                    cursor:"pointer",background:"none",padding:0,transition:"border-color .15s"}}>
                  <img src={img} alt={`Thumb ${i+1}`} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info panel */}
        <div>
          {product.brand && <p style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:"var(--brand)",marginBottom:8}}>{product.brand}</p>}
          <h1 data-testid="product-detail-title"
            style={{fontSize:"clamp(1.5rem,2.5vw,2.25rem)",fontWeight:800,color:"var(--ink-900)",lineHeight:1.2,letterSpacing:"-0.01em"}}>
            {product.title}
          </h1>

          <div style={{display:"flex",alignItems:"center",gap:12,marginTop:12}}>
            <StarRating rating={product.rating} size={16}/>
            <span style={{fontSize:13.5,color:"var(--ink-700)",fontWeight:500}}>{(product.rating||0).toFixed(1)}</span>
            <span style={{color:"var(--ink-400)"}}>·</span>
            <span style={{fontSize:13.5,color:"var(--ink-500)"}}>{product.review_count||0} reviews</span>
            <span style={{color:"var(--ink-400)"}}>·</span>
            <span style={{fontSize:13.5,color:"var(--ink-500)"}}>SKU: {product.sku}</span>
          </div>

          <div data-testid="product-detail-price"
            style={{marginTop:24,display:"flex",alignItems:"baseline",gap:12}}>
            <span style={{fontSize:"clamp(1.75rem,3vw,2.25rem)",fontWeight:700,color:onSale?"#DC2626":"var(--ink-900)"}}>
              {formatPrice(finalPrice)}
            </span>
            {onSale&&<span style={{fontSize:18,color:"var(--ink-400)",textDecoration:"line-through"}}>{formatPrice(product.price)}</span>}
            {onSale&&<span style={{padding:"4px 8px",background:"#FEF2F2",color:"#DC2626",fontSize:12,fontWeight:700,borderRadius:6}}>
              SAVE {formatPrice(product.price-product.sale_price)}
            </span>}
          </div>

          <p data-testid="product-detail-stock-status"
            style={{marginTop:12,fontSize:13.5,fontWeight:600,color:inStock?"#059669":"#DC2626"}}>
            {inStock?`● In stock — ${product.stock_quantity} available`:"○ Out of stock"}
          </p>

          <p data-testid="product-detail-description"
            style={{marginTop:20,fontSize:14,lineHeight:1.8,color:"var(--ink-600)"}}>
            {product.description}
          </p>

          {/* Variants */}
          {(product.variants||[]).map(v=>(
            <div key={v.name} style={{marginTop:24}}>
              <p style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:"var(--ink-900)",marginBottom:8}}>{v.name}</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {v.options.map(opt=>{
                  const active=variants[v.name]===opt;
                  return (
                    <button key={opt} data-testid="product-detail-variant-select"
                      onClick={()=>setVariants(p=>({...p,[v.name]:opt}))}
                      style={{padding:"0 16px",height:40,fontSize:13.5,fontWeight:500,borderRadius:8,
                        border:`1.5px solid ${active?"var(--brand)":"var(--ink-300)"}`,
                        background:active?"var(--brand)":"white",color:active?"white":"var(--ink-700)",
                        cursor:"pointer",transition:"all .15s"}}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Qty + ATC */}
          <div style={{marginTop:32,display:"flex",gap:12}}>
            <div style={{display:"flex",alignItems:"center",border:"1.5px solid var(--ink-300)",borderRadius:8,height:48,overflow:"hidden",background:"white"}}>
              <button onClick={()=>setQty(q=>Math.max(1,q-1))} disabled={qty<=1}
                style={{width:44,height:"100%",display:"flex",alignItems:"center",justifyContent:"center",
                  background:"none",border:"none",cursor:qty<=1?"not-allowed":"pointer",
                  color:"var(--ink-700)",opacity:qty<=1?0.4:1,transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="var(--ink-50)"}
                onMouseLeave={e=>e.currentTarget.style.background=""}>
                <Minus size={16}/>
              </button>
              <input data-testid="product-detail-qty-input" type="number" value={qty}
                min={1} max={product.stock_quantity||99}
                onChange={e=>setQty(Math.max(1,parseInt(e.target.value||"1",10)))}
                style={{width:56,textAlign:"center",fontSize:14,fontWeight:600,
                  border:"none",height:"100%",background:"transparent"}}/>
              <button onClick={()=>setQty(q=>Math.min(product.stock_quantity||99,q+1))}
                style={{width:44,height:"100%",display:"flex",alignItems:"center",justifyContent:"center",
                  background:"none",border:"none",cursor:"pointer",color:"var(--ink-700)",transition:"background .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background="var(--ink-50)"}
                onMouseLeave={e=>e.currentTarget.style.background=""}>
                <Plus size={16}/>
              </button>
            </div>
            <button data-testid="product-detail-add-to-cart-button"
              onClick={()=>{if(!inStock)return;toast(`Added ${qty} × ${product.title}`);}}
              disabled={!inStock}
              style={{flex:1,height:48,background:inStock?"var(--brand)":"var(--ink-300)",
                color:"white",fontWeight:600,borderRadius:8,border:"none",fontSize:14,
                cursor:inStock?"pointer":"not-allowed",transition:"background .15s"}}
              onMouseEnter={e=>{if(inStock)e.currentTarget.style.background="var(--brand-h)";}}
              onMouseLeave={e=>{if(inStock)e.currentTarget.style.background="var(--brand)";}}>
              {inStock?"Add to cart":"Out of stock"}
            </button>
            {[[Heart,"Wishlist"],[Share2,"Share"]].map(([Ico,lbl])=>(
              <button key={lbl} aria-label={lbl}
                style={{width:48,height:48,display:"flex",alignItems:"center",justifyContent:"center",
                  border:"1.5px solid var(--ink-300)",borderRadius:8,background:"white",
                  color:"var(--ink-700)",cursor:"pointer",transition:"all .15s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--brand)";e.currentTarget.style.color="var(--brand)";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--ink-300)";e.currentTarget.style.color="var(--ink-700)";}}>
                <Ico size={20}/>
              </button>
            ))}
          </div>

          {/* Trust strip */}
          <div style={{marginTop:32,display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,
            padding:16,background:"var(--ink-50)",borderRadius:10,border:"1px solid var(--ink-200)"}}>
            {[fulfillMeta,{Icon:RotateCcw,label:"30-day returns",sub:"No-hassle refunds"},{Icon:Shield,label:"Secure checkout",sub:"256-bit encryption"}].map(m=>(
              <div key={m.label} style={{display:"flex",alignItems:"flex-start",gap:8}}>
                <m.Icon size={20} color="var(--brand)" style={{flexShrink:0,marginTop:1}}/>
                <div>
                  <p style={{fontSize:12,fontWeight:600,color:"var(--ink-900)"}}>{m.label}</p>
                  <p style={{fontSize:11,color:"var(--ink-500)",marginTop:2}}>{m.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{marginTop:64}}>
        <div style={{borderBottom:"1.5px solid var(--ink-200)",display:"flex",gap:24}}>
          {[["description","Description"],["specs","Specifications"],["shipping","Shipping & Returns"]].map(([id,lbl])=>(
            <button key={id} onClick={()=>setTab(id)} style={tabStyle(id)}>
              {lbl}
              {tab===id&&<span style={{position:"absolute",bottom:-1.5,left:0,right:0,height:2,background:"var(--brand)",borderRadius:1}}/>}
            </button>
          ))}
        </div>
        <div style={{paddingTop:24,maxWidth:700}}>
          {tab==="description"&&<p style={{fontSize:14,lineHeight:1.8,color:"var(--ink-700)"}}>{product.description||"No description provided."}</p>}
          {tab==="specs"&&(
            product.specs&&Object.keys(product.specs).length
            ? <dl style={{border:"1.5px solid var(--ink-200)",borderRadius:8,overflow:"hidden"}}>
                {Object.entries(product.specs).map(([k,v],i)=>(
                  <div key={k} style={{display:"grid",gridTemplateColumns:"1fr 2fr",padding:"12px 16px",fontSize:13.5,
                    background:i%2===0?"white":"var(--ink-50)",borderBottom:"1px solid var(--ink-100)"}}>
                    <dt style={{fontWeight:600,color:"var(--ink-900)",textTransform:"capitalize"}}>{k}</dt>
                    <dd style={{color:"var(--ink-700)"}}>{v}</dd>
                  </div>
                ))}
              </dl>
            : <p style={{fontSize:13.5,color:"var(--ink-500)"}}>No specifications listed.</p>
          )}
          {tab==="shipping"&&(
            <div style={{fontSize:14,color:"var(--ink-700)",lineHeight:1.8,display:"flex",flexDirection:"column",gap:12}}>
              <p><strong>Shipping:</strong> Free standard shipping on orders over $49. Expedited options available at checkout.</p>
              <p><strong>Returns:</strong> 30-day no-questions-asked returns. Items must be unused and in original packaging.</p>
              <p><strong>Warranty:</strong> Manufacturer warranty applies where indicated.</p>
            </div>
          )}
        </div>
      </div>

      {related.length>0&&(
        <div style={{marginTop:80}}>
          <h2 style={{fontSize:"1.4rem",fontWeight:700,color:"var(--ink-900)",marginBottom:24}}>You may also like</h2>
          <ProductGrid products={related} columns={4}/>
        </div>
      )}
    </div>
  );
}

// ── Auth Pages — exact Login.jsx / Register.jsx ────────────
function AuthPage({mode}) {
  const {login,register} = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const {Mail,Lock,User,AlertCircle} = icons;
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [confirm,setConfirm] = useState("");
  const [error,setError] = useState("");
  const [submitting,setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(""); setSubmitting(true);
    try {
      if (mode==="login") {
        const u = await login(email,password);
        toast(`Welcome back, ${u.name||u.email}`);
        navigate(u.role==="admin"?"admin":"home");
      } else {
        if (password.length<8) throw new Error("Password must be at least 8 characters.");
        if (password!==confirm) throw new Error("Passwords do not match.");
        const u = await register(name,email,password);
        toast(`Welcome, ${u.name||u.email}!`);
        navigate("home");
      }
    } catch(err) {
      setError(err.message||"Something went wrong. Please try again.");
    } finally { setSubmitting(false); }
  };

  const inputStyle = {
    width:"100%",height:44,paddingLeft:36,paddingRight:12,fontSize:13.5,
    background:"white",border:"1.5px solid var(--ink-300)",borderRadius:8
  };

  return (
    <div style={{minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",
      padding:"64px 16px",background:"var(--ink-50)"}}>
      <div style={{width:"100%",maxWidth:440}}>
        <div style={{background:"white",border:"1px solid var(--ink-200)",borderRadius:12,
          boxShadow:"0 2px 12px rgba(0,0,0,.06)",padding:32}}>
          <h1 style={{fontSize:"1.6rem",fontWeight:800,color:"var(--ink-900)"}}>
            {mode==="login"?"Welcome back":"Create your account"}
          </h1>
          <p style={{fontSize:13.5,color:"var(--ink-500)",marginTop:4}}>
            {mode==="login"?"Sign in to continue shopping.":"Join Abundant for exclusive deals and faster checkout."}
          </p>

          {error&&(
            <div style={{marginTop:20,display:"flex",alignItems:"flex-start",gap:8,
              padding:"10px 12px",background:"#FEF2F2",border:"1px solid #FECACA",
              borderRadius:8,fontSize:13,color:"#B91C1C"}}>
              <AlertCircle size={16} style={{flexShrink:0,marginTop:1}}/>{error}
            </div>
          )}

          <div style={{marginTop:24,display:"flex",flexDirection:"column",gap:16}}>
            {mode==="register"&&(
              <label>
                <span style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",color:"var(--ink-700)"}}>Full Name</span>
                <div style={{position:"relative",marginTop:6}}>
                  <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}><User size={16} color="var(--ink-400)"/></span>
                  <input data-testid="register-name-input" type="text" value={name}
                    onChange={e=>setName(e.target.value)} placeholder="Jane Doe" required style={inputStyle}/>
                </div>
              </label>
            )}
            <label>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",color:"var(--ink-700)"}}>Email</span>
              </div>
              <div style={{position:"relative",marginTop:6}}>
                <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}><Mail size={16} color="var(--ink-400)"/></span>
                <input data-testid={mode==="login"?"login-email-input":"register-email-input"}
                  type="email" value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="you@example.com" required style={inputStyle}/>
              </div>
            </label>
            <label>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",color:"var(--ink-700)"}}>Password</span>
                {mode==="login"&&<button data-testid="login-forgot-password-link"
                  style={{fontSize:12,color:"var(--brand)",background:"none",border:"none",cursor:"pointer"}}>Forgot?</button>}
              </div>
              <div style={{position:"relative",marginTop:6}}>
                <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}><Lock size={16} color="var(--ink-400)"/></span>
                <input data-testid={mode==="login"?"login-password-input":"register-password-input"}
                  type="password" value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder={mode==="register"?"At least 8 characters":"••••••••"} required style={inputStyle}/>
              </div>
            </label>
            {mode==="register"&&(
              <label>
                <span style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",color:"var(--ink-700)"}}>Confirm Password</span>
                <div style={{position:"relative",marginTop:6}}>
                  <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)"}}><Lock size={16} color="var(--ink-400)"/></span>
                  <input data-testid="register-password-confirm-input" type="password"
                    value={confirm} onChange={e=>setConfirm(e.target.value)}
                    placeholder="Re-enter password" required style={inputStyle}/>
                </div>
              </label>
            )}
            <button data-testid={mode==="login"?"login-submit-button":"register-submit-button"}
              onClick={handleSubmit} disabled={submitting}
              style={{height:44,background:submitting?"var(--ink-300)":"var(--brand)",color:"white",
                fontWeight:600,borderRadius:8,border:"none",fontSize:14,
                cursor:submitting?"not-allowed":"pointer",transition:"background .15s"}}
              onMouseEnter={e=>{if(!submitting)e.currentTarget.style.background="var(--brand-h)";}}
              onMouseLeave={e=>{if(!submitting)e.currentTarget.style.background="var(--brand)";}}>
              {submitting?(mode==="login"?"Signing in…":"Creating account…"):(mode==="login"?"Sign in":"Create account")}
            </button>
          </div>

          <p style={{marginTop:20,textAlign:"center",fontSize:13.5,color:"var(--ink-500)"}}>
            {mode==="login"?"New to Abundant? ":"Already have an account? "}
            <button data-testid={mode==="login"?"login-register-link":"register-login-link"}
              onClick={()=>navigate(mode==="login"?"register":"login")}
              style={{fontWeight:600,color:"var(--brand)",background:"none",border:"none",cursor:"pointer",fontSize:13.5}}>
              {mode==="login"?"Create an account":"Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Account — exact Account.jsx ────────────────────────────
function AccountPage() {
  const {user} = useAuth();
  const navigate = useNavigate();
  const {Package2,MapPin,User} = icons;
  if (!user) { navigate("login"); return null; }
  return (
    <div style={{maxWidth:900,margin:"0 auto",padding:"48px 32px"}}>
      <div style={{marginBottom:40}}>
        <p style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:"var(--brand)"}}>My Account</p>
        <h1 style={{marginTop:4,fontSize:"clamp(1.6rem,3vw,2.25rem)",fontWeight:800,color:"var(--ink-900)"}}>
          Hi, {user?.name||"there"} 👋
        </h1>
        <p style={{color:"var(--ink-500)",marginTop:8}}>{user?.email}</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:16}}>
        {[
          {Icon:Package2,title:"My Orders",      desc:"Track packages and view order history (launches Phase 2)"},
          {Icon:MapPin,  title:"Addresses",       desc:"Manage shipping and billing addresses"},
          {Icon:User,    title:"Payment Methods", desc:"Saved cards and payment preferences"},
          {Icon:User,    title:"Profile",         desc:"Update name, email, and password"},
        ].map(({Icon,title,desc})=>(
          <div key={title}
            style={{padding:24,border:"1.5px solid var(--ink-200)",borderRadius:12,
              background:"white",cursor:"pointer",transition:"all .2s"}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--brand)";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.08)";}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--ink-200)";e.currentTarget.style.boxShadow="";}}>
            <Icon size={24} color="var(--brand)"/>
            <h3 style={{marginTop:12,fontWeight:600,fontSize:15,color:"var(--ink-900)"}}>{title}</h3>
            <p style={{fontSize:13.5,color:"var(--ink-500)",marginTop:4}}>{desc}</p>
          </div>
        ))}
      </div>
      <div style={{marginTop:32,padding:16,background:"var(--brand-50)",border:"1px solid rgba(232,98,26,.2)",
        borderRadius:12,fontSize:13.5,color:"var(--ink-700)"}}>
        Cart, checkout, and detailed order history are coming in <strong>Phase 2</strong> along with Stripe payments.
      </div>
    </div>
  );
}

// ── Admin Dashboard — exact AdminDashboard.jsx ──────────────
function AdminDashboard() {
  const {user} = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const {Plus,Search,Pencil,Trash,Package2,Users,AlertTriangle,Tag,LayoutDashboard,X} = icons;
  const [adminTab,setAdminTab] = useState("overview");
  const [products,setProducts] = useState(PRODUCTS);
  const [modalOpen,setModalOpen] = useState(false);
  const [editing,setEditing] = useState(null);
  const [deleting,setDeleting] = useState(null);
  const [search,setSearch] = useState("");

  if (!user||user.role!=="admin") return (
    <div style={{maxWidth:500,margin:"96px auto",textAlign:"center",padding:32}}>
      <h1 style={{fontSize:"1.6rem",fontWeight:800,color:"var(--ink-900)",marginBottom:8}}>Admin access required</h1>
      <p style={{color:"var(--ink-500)",marginBottom:24}}>Sign in with an admin account to access this area.</p>
      <button onClick={()=>navigate("login")} style={{background:"var(--brand)",color:"white",
        border:"none",borderRadius:8,padding:"12px 24px",fontWeight:600,cursor:"pointer",fontSize:14}}>
        Sign in
      </button>
    </div>
  );

  const stats = {
    products:products.length, users:1,
    out_of_stock:products.filter(p=>p.stock_quantity<=0).length,
    on_sale:products.filter(p=>p.sale_price&&p.sale_price<p.price).length,
  };

  const filtered = products.filter(p=>!search||
    p.title.toLowerCase().includes(search.toLowerCase())||
    p.sku.toLowerCase().includes(search.toLowerCase())||
    (p.brand||"").toLowerCase().includes(search.toLowerCase()));

  const statCards = [
    {Icon:Package2,      label:"Total products",  value:stats.products,     testid:"admin-stats-products"},
    {Icon:Users,         label:"Registered users", value:stats.users,        testid:"admin-stats-users"},
    {Icon:AlertTriangle, label:"Out of stock",     value:stats.out_of_stock, testid:"admin-stats-out-of-stock"},
    {Icon:Tag,           label:"On sale",          value:stats.on_sale,      testid:"admin-stats-on-sale"},
  ];

  return (
    <div data-testid="admin-dashboard" style={{background:"var(--ink-50)",minHeight:"calc(100vh - 100px)"}}>
      <div style={{maxWidth:1280,margin:"0 auto",padding:"32px 32px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:32}}>
          <div>
            <p style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:"var(--brand)"}}>Admin</p>
            <h1 style={{marginTop:4,fontSize:"clamp(1.6rem,3vw,2.25rem)",fontWeight:800,color:"var(--ink-900)"}}>Control panel</h1>
          </div>
          <button onClick={()=>navigate("home")}
            style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:13.5,fontWeight:600,
              color:"var(--ink-700)",background:"none",border:"none",cursor:"pointer"}}
            onMouseEnter={e=>e.currentTarget.style.color="var(--brand)"}
            onMouseLeave={e=>e.currentTarget.style.color="var(--ink-700)"}>
            ← Back to store
          </button>
        </div>

        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:32}}>
          {statCards.map(s=>(
            <div key={s.label} data-testid="admin-stats-card"
              style={{padding:20,background:"white",border:"1.5px solid var(--ink-200)",borderRadius:12,
                display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
              <div>
                <p style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",color:"var(--ink-500)"}}>{s.label}</p>
                <p style={{marginTop:8,fontSize:"1.6rem",fontWeight:800,color:"var(--ink-900)",letterSpacing:"-0.01em"}}>{s.value}</p>
              </div>
              <div style={{width:40,height:40,borderRadius:10,background:"var(--brand-50)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <s.Icon size={20} color="var(--brand)"/>
              </div>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div style={{background:"white",border:"1px solid var(--ink-200)",borderRadius:12,padding:6,
          display:"inline-flex",gap:4,marginBottom:24}}>
          {[["overview",LayoutDashboard,"Overview"],["products",Package2,"Products"]].map(([id,Ico,lbl])=>(
            <button key={id} onClick={()=>setAdminTab(id)}
              style={{display:"inline-flex",alignItems:"center",gap:6,height:36,padding:"0 16px",
                fontSize:13.5,fontWeight:600,borderRadius:8,border:"none",cursor:"pointer",
                background:adminTab===id?"var(--brand)":"transparent",
                color:adminTab===id?"white":"var(--ink-700)",transition:"all .15s"}}>
              <Ico size={16}/>{lbl}
            </button>
          ))}
        </div>

        {/* Overview */}
        {adminTab==="overview"&&(
          <div style={{background:"white",border:"1.5px solid var(--ink-200)",borderRadius:12,padding:32}}>
            <h2 style={{fontSize:"1.4rem",fontWeight:700,color:"var(--ink-900)"}}>Welcome back, admin.</h2>
            <p style={{marginTop:8,color:"var(--ink-500)",maxWidth:600,lineHeight:1.7,fontSize:14}}>
              Manage your catalog from one place. Create, edit, and delete products — feature them on the homepage, adjust pricing, and monitor inventory.
            </p>
            <div style={{marginTop:24,display:"flex",gap:12}}>
              <button onClick={()=>setAdminTab("products")}
                style={{display:"inline-flex",alignItems:"center",gap:6,height:40,padding:"0 20px",
                  fontSize:13.5,fontWeight:600,background:"var(--brand)",color:"white",border:"none",borderRadius:8,cursor:"pointer"}}>
                <Package2 size={16}/>Manage products ({stats.products})
              </button>
              <button onClick={()=>navigate("shop")}
                style={{display:"inline-flex",alignItems:"center",gap:6,height:40,padding:"0 20px",
                  fontSize:13.5,fontWeight:600,color:"var(--ink-700)",border:"1.5px solid var(--ink-300)",borderRadius:8,background:"white",cursor:"pointer"}}>
                View storefront
              </button>
            </div>
          </div>
        )}

        {/* Products table */}
        {adminTab==="products"&&(
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:24,flexWrap:"wrap"}}>
              <div>
                <h2 style={{fontSize:"1.4rem",fontWeight:700,color:"var(--ink-900)"}}>Products</h2>
                <p style={{fontSize:13.5,color:"var(--ink-500)",marginTop:2}}>{filtered.length} total</p>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{position:"relative"}}>
                  <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}}><Search size={16} color="var(--ink-400)"/></span>
                  <input data-testid="admin-products-search-input" value={search}
                    onChange={e=>setSearch(e.target.value)} placeholder="Search title, SKU, brand…"
                    style={{height:40,paddingLeft:34,paddingRight:12,width:280,fontSize:13.5,
                      background:"white",border:"1.5px solid var(--ink-300)",borderRadius:8}}/>
                </div>
                <button data-testid="admin-create-product-button" onClick={()=>{setEditing(null);setModalOpen(true);}}
                  style={{display:"inline-flex",alignItems:"center",gap:6,height:40,padding:"0 16px",
                    fontSize:13.5,fontWeight:600,background:"var(--brand)",color:"white",border:"none",borderRadius:8,cursor:"pointer"}}>
                  <Plus size={16}/>New product
                </button>
              </div>
            </div>

            <div style={{background:"white",border:"1.5px solid var(--ink-200)",borderRadius:12,overflow:"hidden"}}>
              <div style={{overflowX:"auto"}}>
                <table data-testid="admin-products-table" style={{width:"100%",borderCollapse:"collapse",fontSize:13.5}}>
                  <thead>
                    <tr style={{background:"var(--ink-50)",borderBottom:"1px solid var(--ink-200)"}}>
                      {["Product","SKU","Category","Price","Stock","Status",""].map(h=>(
                        <th key={h} style={{padding:"10px 16px",textAlign:"left",fontSize:11,fontWeight:700,
                          color:"var(--ink-500)",textTransform:"uppercase",letterSpacing:"0.08em"}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(p=>{
                      const os=p.sale_price&&p.sale_price<p.price;
                      const sc=p.stock_quantity<=0?"#DC2626":p.stock_quantity<10?"#D97706":"#059669";
                      return (
                        <tr key={p.id} data-testid="admin-product-row"
                          style={{borderBottom:"1px solid var(--ink-100)"}}
                          onMouseEnter={e=>e.currentTarget.style.background="rgba(249,250,251,.6)"}
                          onMouseLeave={e=>e.currentTarget.style.background=""}>
                          <td style={{padding:"12px 16px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:12}}>
                              <div style={{width:40,height:40,borderRadius:8,background:"var(--ink-100)",overflow:"hidden",flexShrink:0}}>
                                {p.images?.[0]&&<img src={p.images[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
                              </div>
                              <div style={{minWidth:0}}>
                                <p style={{fontWeight:600,color:"var(--ink-900)",maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title}</p>
                                <p style={{fontSize:12,color:"var(--ink-500)"}}>{p.brand||"—"}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{padding:"12px 16px",fontFamily:"monospace",fontSize:12,color:"var(--ink-700)"}}>{p.sku}</td>
                          <td style={{padding:"12px 16px",textTransform:"capitalize",color:"var(--ink-700)"}}>{p.category}</td>
                          <td style={{padding:"12px 16px"}}>
                            <div style={{display:"flex",alignItems:"baseline",gap:6}}>
                              <span style={{fontWeight:600,color:os?"#DC2626":"var(--ink-900)"}}>{formatPrice(os?p.sale_price:p.price)}</span>
                              {os&&<span style={{fontSize:12,textDecoration:"line-through",color:"var(--ink-400)"}}>{formatPrice(p.price)}</span>}
                            </div>
                          </td>
                          <td style={{padding:"12px 16px",fontWeight:600,color:sc}}>{p.stock_quantity}</td>
                          <td style={{padding:"12px 16px"}}>
                            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                              {p.featured&&<span style={{padding:"2px 8px",fontSize:11,fontWeight:600,background:"var(--brand-50)",color:"var(--brand)",borderRadius:20}}>Featured</span>}
                              {os&&<span style={{padding:"2px 8px",fontSize:11,fontWeight:600,background:"#FEF2F2",color:"#DC2626",borderRadius:20}}>Sale</span>}
                            </div>
                          </td>
                          <td style={{padding:"12px 16px",textAlign:"right"}}>
                            <div style={{display:"inline-flex",gap:4}}>
                              <button data-testid="admin-product-edit-button"
                                onClick={()=>{setEditing(p);setModalOpen(true);}} aria-label="Edit"
                                style={{padding:8,background:"none",border:"none",color:"var(--ink-500)",borderRadius:8,cursor:"pointer",transition:"all .15s"}}
                                onMouseEnter={e=>{e.currentTarget.style.background="var(--brand-50)";e.currentTarget.style.color="var(--brand)";}}
                                onMouseLeave={e=>{e.currentTarget.style.background="";e.currentTarget.style.color="var(--ink-500)";}}>
                                <Pencil size={16}/>
                              </button>
                              <button data-testid="admin-product-delete-button"
                                onClick={()=>setDeleting(p)} aria-label="Delete"
                                style={{padding:8,background:"none",border:"none",color:"var(--ink-500)",borderRadius:8,cursor:"pointer",transition:"all .15s"}}
                                onMouseEnter={e=>{e.currentTarget.style.background="#FEF2F2";e.currentTarget.style.color="#DC2626";}}
                                onMouseLeave={e=>{e.currentTarget.style.background="";e.currentTarget.style.color="var(--ink-500)";}}>
                                <Trash size={16}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filtered.length===0&&<tr><td colSpan={7} style={{padding:"48px",textAlign:"center",color:"var(--ink-500)"}}>No products match your search.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Product Form Modal */}
      {modalOpen&&(
        <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:"32px 16px"}}>
          <div style={{position:"absolute",inset:0,background:"rgba(17,24,39,.7)"}} onClick={()=>setModalOpen(false)}/>
          <div data-testid="admin-modal"
            style={{position:"relative",width:"100%",maxWidth:700,maxHeight:"90vh",overflowY:"auto",
              background:"white",borderRadius:12,boxShadow:"0 20px 60px rgba(0,0,0,.2)",border:"1px solid var(--ink-200)"}}>
            <div style={{position:"sticky",top:0,background:"white",borderBottom:"1px solid var(--ink-200)",
              padding:"16px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:10}}>
              <h2 style={{fontSize:"1.1rem",fontWeight:700,color:"var(--ink-900)"}}>
                {editing?"Edit product":"Create new product"}
              </h2>
              <button data-testid="admin-modal-cancel" onClick={()=>setModalOpen(false)}
                style={{padding:8,background:"none",border:"none",color:"var(--ink-500)",cursor:"pointer"}}>
                <X size={20}/>
              </button>
            </div>
            <ProductFormModal editing={editing} onClose={()=>setModalOpen(false)}
              onSaved={(p,mode)=>{
                if(mode==="create") setProducts(ps=>[p,...ps]);
                else setProducts(ps=>ps.map(x=>x.id===p.id?p:x));
                toast(mode==="create"?`Created "${p.title}"`:`Updated "${p.title}"`);
              }}/>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleting&&(
        <div style={{position:"fixed",inset:0,zIndex:50,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
          <div style={{position:"absolute",inset:0,background:"rgba(17,24,39,.7)"}} onClick={()=>setDeleting(null)}/>
          <div style={{position:"relative",width:"100%",maxWidth:440,background:"white",
            borderRadius:12,boxShadow:"0 20px 60px rgba(0,0,0,.2)",padding:24}}>
            <h3 style={{fontSize:"1.1rem",fontWeight:700,color:"var(--ink-900)"}}>Delete product?</h3>
            <p style={{marginTop:8,fontSize:13.5,color:"var(--ink-500)"}}>
              "{deleting?.title}" will be permanently removed. This cannot be undone.
            </p>
            <div style={{marginTop:24,display:"flex",justifyContent:"flex-end",gap:10}}>
              <button data-testid="admin-confirm-cancel" onClick={()=>setDeleting(null)}
                style={{height:40,padding:"0 16px",fontSize:13.5,fontWeight:600,
                  border:"1.5px solid var(--ink-300)",borderRadius:8,background:"white",cursor:"pointer"}}>
                Cancel
              </button>
              <button data-testid="admin-confirm-delete"
                onClick={()=>{setProducts(ps=>ps.filter(p=>p.id!==deleting.id));toast(`Deleted "${deleting.title}"`);setDeleting(null);}}
                style={{height:40,padding:"0 16px",fontSize:13.5,fontWeight:600,
                  background:"#DC2626",color:"white",border:"none",borderRadius:8,cursor:"pointer"}}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Product Form Modal (from AdminDashboard.jsx) ───────────
function ProductFormModal({editing,onClose,onSaved}) {
  const [form,setForm] = useState(()=>editing?{
    title:editing.title||"",description:editing.description||"",
    price:editing.price||0,sale_price:editing.sale_price??"",
    sku:editing.sku||"",brand:editing.brand||"",category:editing.category||"",
    stock_quantity:editing.stock_quantity||0,fulfillment_type:editing.fulfillment_type||"warehouse",
    images:(editing.images||[]).join("\n"),featured:!!editing.featured
  }:{title:"",description:"",price:0,sale_price:"",sku:"",brand:"",category:"",
     stock_quantity:0,fulfillment_type:"warehouse",images:"",featured:false});
  const [error,setError] = useState("");
  const set = k => e => setForm(f=>({...f,[k]:e.target.type==="checkbox"?e.target.checked:e.target.value}));

  const handleSave = () => {
    if(!form.title||!form.sku||!form.category){setError("Title, SKU and Category are required.");return;}
    const p = {
      ...(editing||{}),
      id:editing?.id||`p${Date.now()}`,
      title:form.title.trim(),description:form.description,
      price:parseFloat(form.price)||0,
      sale_price:form.sale_price===""?null:parseFloat(form.sale_price),
      sku:form.sku.trim(),brand:form.brand.trim(),
      category:form.category.trim().toLowerCase(),
      stock_quantity:parseInt(form.stock_quantity,10)||0,
      fulfillment_type:form.fulfillment_type||"warehouse",
      images:form.images.split("\n").map(s=>s.trim()).filter(Boolean),
      featured:!!form.featured,
      rating:editing?.rating||4.5,review_count:editing?.review_count||0,specs:editing?.specs||{}
    };
    onSaved(p,editing?"update":"create"); onClose();
  };

  const F=({label,required,children,span2=false})=>(
    <label style={{display:"block",gridColumn:span2?"span 2":""}}>
      <span style={{fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.07em",color:"var(--ink-700)"}}>
        {label}{required&&<span style={{color:"var(--brand)"}}> *</span>}
      </span>
      <div style={{marginTop:6}}>{children}</div>
    </label>
  );

  return (
    <div style={{padding:24}}>
      {error&&<div style={{marginBottom:16,padding:"10px 12px",background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:8,fontSize:13,color:"#B91C1C"}}>{error}</div>}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <F label="Title" required><input data-testid="admin-modal-title" value={form.title} onChange={set("title")} className="form-input" required/></F>
        <F label="SKU" required><input data-testid="admin-modal-sku" value={form.sku} onChange={set("sku")} className="form-input" required/></F>
        <F label="Price (USD)" required><input data-testid="admin-modal-price" type="number" min={0} step={0.01} value={form.price} onChange={set("price")} className="form-input"/></F>
        <F label="Sale price"><input data-testid="admin-modal-sale-price" type="number" min={0} step={0.01} value={form.sale_price} onChange={set("sale_price")} className="form-input" placeholder="Leave empty = no sale"/></F>
        <F label="Category" required><input data-testid="admin-modal-category" value={form.category} onChange={set("category")} className="form-input" placeholder="electronics"/></F>
        <F label="Brand"><input data-testid="admin-modal-brand" value={form.brand} onChange={set("brand")} className="form-input"/></F>
        <F label="Stock quantity"><input data-testid="admin-modal-stock" type="number" min={0} value={form.stock_quantity} onChange={set("stock_quantity")} className="form-input"/></F>
        <F label="Fulfillment">
          <select data-testid="admin-modal-fulfillment" value={form.fulfillment_type} onChange={set("fulfillment_type")} className="form-input">
            <option value="warehouse">Warehouse</option>
            <option value="dropship">Dropship</option>
            <option value="digital">Digital</option>
          </select>
        </F>
        <F label="Description" span2><textarea data-testid="admin-modal-description" value={form.description} onChange={set("description")} className="form-input" rows={4}/></F>
        <F label="Image URLs (one per line)" span2>
          <textarea data-testid="admin-modal-images" value={form.images} onChange={set("images")} className="form-input" rows={3} style={{fontFamily:"monospace",fontSize:12}} placeholder="https://…"/>
        </F>
        <label style={{gridColumn:"span 2",display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
          <input data-testid="admin-modal-featured" type="checkbox" checked={form.featured} onChange={set("featured")} style={{width:16,height:16,accentColor:"var(--brand)"}}/>
          <span style={{fontSize:13.5,color:"var(--ink-700)"}}>Feature this product on the homepage</span>
        </label>
      </div>
      <div style={{marginTop:24,paddingTop:16,borderTop:"1px solid var(--ink-100)",display:"flex",justifyContent:"flex-end",gap:10}}>
        <button onClick={onClose} style={{height:40,padding:"0 20px",fontSize:13.5,fontWeight:600,border:"1.5px solid var(--ink-300)",borderRadius:8,background:"white",cursor:"pointer"}}>Cancel</button>
        <button data-testid="admin-modal-save" onClick={handleSave}
          style={{height:40,padding:"0 20px",fontSize:13.5,fontWeight:600,background:"var(--brand)",color:"white",border:"none",borderRadius:8,cursor:"pointer"}}
          onMouseEnter={e=>e.currentTarget.style.background="var(--brand-h)"}
          onMouseLeave={e=>e.currentTarget.style.background="var(--brand)"}>
          {editing?"Save changes":"Create product"}
        </button>
      </div>
    </div>
  );
}

// ── NotFound — exact NotFound.jsx ──────────────────────────
function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div style={{maxWidth:600,margin:"0 auto",padding:"96px 32px",textAlign:"center"}}>
      <p style={{fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.12em",color:"var(--brand)"}}>404</p>
      <h1 style={{marginTop:8,fontSize:"clamp(2rem,5vw,3.5rem)",fontWeight:800,color:"var(--ink-900)",letterSpacing:"-0.02em"}}>Page not found</h1>
      <p style={{marginTop:16,fontSize:15,color:"var(--ink-500)"}}>The page you're looking for doesn't exist or has been moved.</p>
      <button onClick={()=>navigate("home")} style={{display:"inline-block",marginTop:32,
        background:"var(--brand)",color:"white",fontWeight:600,borderRadius:8,
        padding:"12px 24px",border:"none",cursor:"pointer",fontSize:14}}>
        Back to homepage
      </button>
    </div>
  );
}

// ── Layout — exact Layout.jsx ──────────────────────────────
function Layout({children}) {
  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",background:"white"}}>
      <Navbar/>
      <main style={{flex:1}}>{children}</main>
      <Footer/>
    </div>
  );
}

// ── ProtectedRoute ─────────────────────────────────────────
function ProtectedRoute({children,adminOnly=false}) {
  const {user} = useAuth();
  const navigate = useNavigate();
  useEffect(()=>{
    if (!user) navigate("login");
    else if (adminOnly&&user.role!=="admin") navigate("home");
  },[user]);
  if (!user) return null;
  if (adminOnly&&user.role!=="admin") return null;
  return children;
}

// ── Page Switch (mirrors BrowserRouter Routes in App.js) ───
function PageSwitch() {
  const p = usePage();
  switch(p.name) {
    case "home":     return <HomePage/>;
    case "shop":     return <ShopPage/>;
    case "category": return <CategoryPage params={p.params}/>;
    case "product":  return <ProductDetailPage params={p.params}/>;
    case "login":    return <AuthPage mode="login"/>;
    case "register": return <AuthPage mode="register"/>;
    case "account":  return <ProtectedRoute><AccountPage/></ProtectedRoute>;
    case "admin":    return <AdminDashboard/>;
    default:         return <NotFoundPage/>;
  }
}

// ── Root App — mirrors App.js structure ────────────────────
export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <ToastProvider>
          <Layout>
            <PageSwitch/>
          </Layout>
        </ToastProvider>
      </AuthProvider>
      <Analytics />
    </RouterProvider>
  );
}
