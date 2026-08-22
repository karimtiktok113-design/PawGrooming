
/* ================================================================
   PawBook Pro — core state, storage, helpers, sample data
   ================================================================ */
'use strict';
/* ---- Demo build: freeze "today" so seed data & every today-based view (overdue radar,
   this-month revenue, birthdays, dashboard greeting, etc.) stay permanently correct
   regardless of when the demo is actually viewed. ---- */
(function(){
  var FIXED=new Date(2026,6,22,10,0,0); // Wed Jul 22 2026, 10:00 — fixed reference "today"
  var RealDate=Date;
  function DemoDate(){
    if(arguments.length===0)return new RealDate(FIXED.getTime());
    return new (Function.prototype.bind.apply(RealDate,[null].concat(Array.prototype.slice.call(arguments))))();
  }
  DemoDate.prototype=RealDate.prototype;
  DemoDate.now=function(){return FIXED.getTime()};
  DemoDate.parse=RealDate.parse;
  DemoDate.UTC=RealDate.UTC;
  window.Date=DemoDate;
})();
const NS='pawbook_demo_v1';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CURRENCIES=[
  {code:'USD',sym:'$',label:'$ US Dollar'},
  {code:'EUR',sym:'€',label:'€ Euro'},
  {code:'GBP',sym:'£',label:'£ British Pound'},
  {code:'CAD',sym:'CA$',label:'CA$ Canadian Dollar'},
  {code:'AUD',sym:'A$',label:'A$ Australian Dollar'},
  {code:'NZD',sym:'NZ$',label:'NZ$ New Zealand Dollar'},
  {code:'PKR',sym:'₨',label:'₨ Pakistani Rupee'},
  {code:'INR',sym:'₹',label:'₹ Indian Rupee'},
  {code:'AED',sym:'د.إ',label:'د.إ UAE Dirham'},
  {code:'SAR',sym:'﷼',label:'﷼ Saudi Riyal'},
  {code:'ZAR',sym:'R',label:'R South African Rand'},
  {code:'EUR2',sym:'€',label:'€ Euro (IE)'},
  {code:'MXN',sym:'MX$',label:'MX$ Mexican Peso'},
  {code:'BRL',sym:'R$',label:'R$ Brazilian Real'},
  {code:'SGD',sym:'S$',label:'S$ Singapore Dollar'},
  {code:'CHF',sym:'CHF',label:'CHF Swiss Franc'},
  {code:'SEK',sym:'kr',label:'kr Swedish Krona'},
  {code:'PHP',sym:'₱',label:'₱ Philippine Peso'},
  {code:'JPY',sym:'¥',label:'¥ Japanese Yen'},
  {code:'PLN',sym:'zł',label:'zł Polish Złoty'},
];
const getCurrSym=()=>{const c=DB?.settings?.currency||'USD';return(CURRENCIES.find(x=>x.code===c)||CURRENCIES[0]).sym;};
const money=n=>{const s=getCurrSym();const v=(Math.round((n||0)*100)/100).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});return s+v;};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parseISO=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
const todayISO=()=>iso(new Date());
const addDays=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
const fmtDate=s=>parseISO(s).toLocaleDateString(undefined,{weekday:'short',month:'short',day:'numeric'});
const fmtDateLong=s=>parseISO(s).toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'});
const fmtTime=t=>{let[h,m]=t.split(':').map(Number);const am=h<12?'AM':'PM';h=h%12||12;return`${h}:${pad(m)} ${am}`};
const minOf=t=>{const[h,m]=t.split(':').map(Number);return h*60+m};
const timeOf=m=>`${pad(Math.floor(m/60))}:${pad(m%60)}`;
const daysBetween=(a,b)=>Math.round((parseISO(b)-parseISO(a))/864e5);

/* ---------- State ---------- */
let DB=null;
function save(){try{localStorage.setItem(NS,JSON.stringify(DB))}catch(e){toast('⚠ Storage full — remove some photos or download a backup')}}
function load(){try{const raw=localStorage.getItem(NS);if(raw){DB=JSON.parse(raw);migrate();return}}catch(e){}DB=sampleData();save()}
function migrate(){ // ensure shape for older saves
  DB.redemptions=DB.redemptions||[];DB.packages=DB.packages||[];
  DB.inventory=DB.inventory||[];DB.giftcards=DB.giftcards||[];
  DB.expenses=DB.expenses||[];DB.waitlist=DB.waitlist||[];
  DB.clients.forEach(c=>{c.photos=c.photos||[];c.points=c.points||0});
  DB.settings=Object.assign({name:'My Grooming Studio',phone:'',open:8,close:18,slot:30,ppd:1,redeem:10,bday:2,theme:'light',accent:'clay',invSeq:1,currency:'USD'},DB.settings);
  DB.unlocked=DB.unlocked||{};
  if(DB.settings.onboarded===undefined)DB.settings.onboarded=1; // existing users skip wizard
}

const STAFF_COLORS=['#2F7E78','#D4794E','#8B6D9C','#C9974A','#6E93B0','#B0684E','#5E9E86'];
// Service "type" palette — coloured by the kind of groom, not a spa category
const SVC_COLORS={fullgroom:'#2F7E78',bath:'#8FB9C4',tidy:'#C9974A',deshed:'#8B6D9C',nails:'#D4794E',puppy:'#5E9E86',addon:'#B0684E',other:'#93A69B'};
const CATEGORIES=['fullgroom','bath','tidy','deshed','nails','puppy','addon','other'];
const CAT_LABEL={fullgroom:'Full Groom',bath:'Bath & Brush',tidy:'Tidy / Trim',deshed:'De-shed',nails:'Nails & Feet',puppy:'Puppy',addon:'Add-on',other:'Other'};
// Dog size scale — grooming-native, drives suggested time & price mentally
const SIZES=['toy','small','medium','large','giant'];
const SIZE_LABEL={toy:'Toy',small:'Small',medium:'Medium',large:'Large',giant:'Giant'};

/* ---------- Sample data (relative to today so demo stays alive) ---------- */
function sampleData(){
  const t=new Date();
  const d=n=>iso(addDays(t,n));
  const staff=[
    {id:'st1',name:'Dani Brooks',role:'Lead Groomer',services:[],commission:0,salary:0,color:STAFF_COLORS[0],avail:{1:[8,17],2:[8,17],3:[8,17],4:[8,18],5:[8,17],6:[9,15],0:null}},
    {id:'st2',name:'Marcus Reed',role:'Groomer & Bather',services:[],commission:45,salary:0,color:STAFF_COLORS[1],avail:{1:[9,17],2:[9,17],3:null,4:[9,17],5:[9,17],6:[9,15],0:null}},
  ];
  const services=[
    {id:'sv1',name:'Full Groom — Small',category:'fullgroom',duration:75,price:55,buffer:15,staffIds:['st1','st2']},
    {id:'sv2',name:'Full Groom — Medium',category:'fullgroom',duration:90,price:70,buffer:15,staffIds:['st1','st2']},
    {id:'sv3',name:'Full Groom — Large',category:'fullgroom',duration:120,price:90,buffer:15,staffIds:['st1']},
    {id:'sv4',name:'Bath & Brush',category:'bath',duration:45,price:38,buffer:10,staffIds:['st1','st2']},
    {id:'sv5',name:'Tidy & Face Trim',category:'tidy',duration:40,price:35,buffer:10,staffIds:['st1','st2']},
    {id:'sv6',name:'De-shed Treatment',category:'deshed',duration:60,price:60,buffer:15,staffIds:['st1']},
    {id:'sv7',name:'Nail Trim & Grind',category:'nails',duration:15,price:18,buffer:0,staffIds:['st1','st2']},
    {id:'sv8',name:'Puppy First Groom',category:'puppy',duration:45,price:40,buffer:10,staffIds:['st1']},
    {id:'sv9',name:'Teeth Brushing (add-on)',category:'addon',duration:10,price:12,buffer:0,staffIds:['st1','st2']},
    {id:'sv10',name:'Sanitary Trim (add-on)',category:'addon',duration:15,price:15,buffer:0,staffIds:['st1','st2']},
  ];
  staff.forEach(s=>s.services=services.filter(v=>v.staffIds.includes(s.id)).map(v=>v.id));
  const packages=[
    {id:'pk1',name:'The Spa Day',serviceIds:['sv2','sv6','sv9'],price:130,duration:160},
    {id:'pk2',name:'Puppy Starter',serviceIds:['sv8','sv7'],price:52,duration:60},
  ];
  // dogs (primary record) with embedded owner
  const dogs=[
    {name:'Bella',breed:'Cockapoo',size:'small',coat:'Curly, prone to matting',owner:'Emma Clark',fav:'sv1',cyc:6,groomer:'st1',beh:['Nervous at the dryer'],sens:'Sensitive skin — oatmeal shampoo only',lastCut:'#4F body, scissored face, 1/2" legs'},
    {name:'Max',breed:'Golden Retriever',size:'large',coat:'Thick double coat, heavy shed',owner:'James Okafor',fav:'sv6',cyc:8,groomer:'st1',beh:[],sens:'',lastCut:'De-shed + bath, feet tidied, feathering trimmed'},
    {name:'Luna',breed:'Shih Tzu',size:'small',coat:'Long, silky, tangles behind ears',owner:'Priya Nair',fav:'sv1',cyc:5,groomer:'st1',beh:['Wriggly — go slow on face'],sens:'',lastCut:'Teddy bear face, #7 body, topknot'},
    {name:'Cooper',breed:'Labradoodle',size:'large',coat:'Dense wavy fleece',owner:'Sofia Reyes',fav:'sv3',cyc:6,groomer:'st1',beh:['Mouths the brush'],sens:'',lastCut:'#3 all over, scissored legs & face'},
    {name:'Daisy',breed:'Bichon Frise',size:'small',coat:'Soft, dense, curls tightly',owner:'Grace Bennett',fav:'sv1',cyc:5,groomer:'st1',beh:[],sens:'Ears prone to infection — pluck & dry',lastCut:'Round powder-puff head, #5 body'},
    {name:'Rocky',breed:'French Bulldog',size:'small',coat:'Short, smooth',owner:'Aisha Malik',fav:'sv4',cyc:6,groomer:'st2',beh:['Skin folds need drying'],sens:'',lastCut:'Bath, ears & folds cleaned, nails'},
    {name:'Charlie',breed:'Miniature Schnauzer',size:'small',coat:'Wiry, harsh double coat',owner:'Noah Dune',fav:'sv2',cyc:6,groomer:'st1',beh:[],sens:'',lastCut:'Schnauzer clip — #7 body, skirt & beard scissored'},
    {name:'Milo',breed:'Yorkshire Terrier',size:'toy',coat:'Fine, silky, floor-length if grown',owner:'Chloe Woods',fav:'sv1',cyc:5,groomer:'st1',beh:['Snappy at feet'],sens:'',lastCut:'Puppy cut #5, bow in topknot'},
    {name:'Ruby',breed:'Cavalier King Charles',size:'small',coat:'Silky, feathered ears & legs',owner:'Liam Costa',fav:'sv5',cyc:7,groomer:'st2',beh:[],sens:'',lastCut:'Tidy ears/feet, feathering trimmed, bath'},
    {name:'Bailey',breed:'Border Collie',size:'medium',coat:'Medium double coat, feathering',owner:'Zara Ali',fav:'sv6',cyc:8,groomer:'st1',beh:[],sens:'',lastCut:'De-shed, sanitary, feet & hocks tidied'},
    {name:'Teddy',breed:'Pomeranian',size:'toy',coat:'Fluffy double coat',owner:'Hana Sato',fav:'sv2',cyc:6,groomer:'st1',beh:['Vocal in the bath'],sens:'Do NOT shave — coat may not regrow',lastCut:'Teddy-bear trim, tidy only, no clipper on back'},
    {name:'Zeus',breed:'German Shepherd',size:'giant',coat:'Heavy double coat',owner:'Marco Rivas',fav:'sv6',cyc:10,groomer:'st1',beh:['Muzzle for nails'],sens:'',lastCut:'Full de-shed, bath, nails ground'},
    {name:'Coco',breed:'Toy Poodle',size:'toy',coat:'Curly, non-shed, mats fast',owner:'Ivy Holt',fav:'sv1',cyc:4,groomer:'st1',beh:[],sens:'',lastCut:'#7 body, clean face/feet/tail, pom on tail'},
    {name:'Buddy',breed:'Beagle',size:'medium',coat:'Short, dense',owner:'Ruth Vance',fav:'sv4',cyc:8,groomer:'st2',beh:[],sens:'',lastCut:'Bath, de-shed rake, nails, ears'},
    {name:'Willow',breed:'Cocker Spaniel',size:'medium',coat:'Silky, feathered, mats in armpits',owner:'Nadia Farah',fav:'sv2',cyc:6,groomer:'st1',beh:['Ticklish feet'],sens:'',lastCut:'Cocker trim — #7 back, hand-strip skirt, feet tidy'},
    {name:'Ollie',breed:'Maltese',size:'toy',coat:'Long, white, tear-stains',owner:'Amber Cole',fav:'sv1',cyc:5,groomer:'st1',beh:[],sens:'Tear-stain wipe, gentle face',lastCut:'Puppy cut #4, face rounded, tidy tear area'},
  ];
  const firstFav=(id)=>services.find(s=>s.id===id).staffIds[0];
  const bdayOffsets=[1,4,0,7,2,9,3,11,5,8,6,2,10,1,4,7]; // month spread
  const clients=dogs.map((g,i)=>{
    const bMonth=(t.getMonth()+bdayOffsets[i])%12;
    const rabiesMonths=[8,3,11,6,1,9,4,14,7,2,10,5,13,8,3,12][i]; // months until expiry (some soon, some far)
    return {id:'cl'+(i+1),name:g.name,owner:g.owner,phone:'555-01'+pad(10+i),email:(g.owner.split(' ')[0]+'.'+g.owner.split(' ')[1]).toLowerCase()+'@mail.com',
      birthday:`20${18+(i%6)}-${pad(bMonth+1)}-${pad((i%27)+1)}`,address:(120+i*3)+' '+['Maple','Cedar','Birch','Willow','Oak','Elm','Pine','Ash'][i%8]+' St',
      breed:g.breed,size:g.size,coat:g.coat,weight:'',
      behaviorNotes:g.beh,sensitivities:g.sens,lastCut:g.lastCut,
      rabiesExpiry:iso(addDays(t,rabiesMonths*30)),
      freqWeeks:g.cyc,staffId:g.groomer,fav:g.fav,
      points:[280,120,510,80,340,160,600,45,220,100,30,410,185,130,360,90][i],
      photos:[],createdAt:d(-((i+4)*30))};
  });
  const appts=[];let n=0;
  const A=(cl,sv,st,dayOff,start,status,extra)=>{const s=services.find(x=>x.id===sv);appts.push(Object.assign({id:'ap'+(++n),clientId:cl,serviceId:sv,staffId:st,date:d(dayOff),start,duration:s.duration,price:s.price,status,retail:0,notes:''},extra||{}))};
  const lastGap=[-2,-9,-3,-15,-4,-5,-1,-19,-6,-8,-13,-3,-2,-7,-5,-4]; // weeks ago last groom
  clients.forEach((c,i)=>{
    const sv=c.fav;const st=c.staffId;const wk=lastGap[i];
    A(c.id,sv,st,wk*7,'10:00','completed',{retail:i%4===0?14:0});
    A(c.id,sv,st,(wk-c.freqWeeks)*7,'11:00','completed');
    if(i%3===0)A(c.id,'sv7','st1',(wk-1)*7,'14:00','completed');
  });
  // recent days for earnings trend — fill last 21 days
  A('cl1','sv4','st1',-1,'09:30','completed',{retail:12});A('cl5','sv7','st2',-1,'11:00','completed');
  A('cl9','sv1','st1',-1,'14:00','completed',{retail:16});
  A('cl3','sv2','st1',-2,'15:00','completed');A('cl7','sv2','st1',-2,'10:00','completed',{retail:20});
  A('cl12','sv7','st1',-2,'16:00','completed');
  A('cl9','sv5','st2',-3,'10:30','completed');A('cl2','sv6','st1',-3,'14:00','completed');
  A('cl12','sv1','st1',-4,'14:00','completed');A('cl15','sv2','st1',-4,'10:00','completed',{retail:22});
  A('cl6','sv4','st2',-5,'11:00','completed');A('cl1','sv1','st1',-5,'09:00','completed');
  A('cl10','sv6','st1',-6,'10:00','completed');A('cl14','sv2','st1',-6,'13:00','completed',{retail:14});
  A('cl4','sv3','st1',-7,'11:00','completed');A('cl8','sv1','st1',-7,'15:00','completed');
  A('cl5','sv1','st1',-8,'09:30','completed',{retail:18});A('cl11','sv2','st1',-8,'14:00','completed');
  A('cl13','sv4','st2',-9,'10:00','completed');A('cl7','sv2','st1',-9,'12:00','completed');
  A('cl2','sv6','st1',-10,'10:00','completed',{retail:16});A('cl15','sv1','st1',-10,'14:30','completed');
  A('cl3','sv7','st1',-11,'09:00','completed');A('cl6','sv4','st2',-11,'11:00','completed');
  A('cl1','sv5','st2',-12,'10:00','completed');A('cl9','sv1','st1',-12,'15:30','completed',{retail:12});
  A('cl12','sv1','st1',-13,'13:00','completed');A('cl4','sv6','st1',-13,'09:30','completed');
  A('cl10','sv6','st1',-14,'11:00','completed',{retail:16});A('cl8','sv1','st1',-14,'10:00','completed');
  A('cl14','sv2','st1',-15,'13:00','completed');A('cl11','sv2','st1',-15,'16:00','completed');
  A('cl5','sv2','st1',-16,'10:00','completed',{retail:24});
  A('cl13','sv4','st2',-17,'11:00','completed');A('cl7','sv2','st1',-17,'14:00','completed');
  A('cl2','sv4','st2',-18,'10:00','completed');A('cl15','sv1','st1',-18,'12:00','completed',{retail:10});
  A('cl6','sv4','st2',-19,'15:00','completed');A('cl3','sv2','st1',-19,'10:00','completed');
  A('cl1','sv6','st1',-20,'13:00','completed',{retail:16});A('cl9','sv7','st1',-20,'09:00','completed');
  A('cl4','sv3','st1',-21,'10:30','completed');A('cl12','sv1','st1',-21,'14:00','completed',{retail:12});
  // today & this-week completed (keep Day/Week earnings lively)
  A('cl1','sv6','st1',0,'09:00','completed',{retail:16});A('cl5','sv2','st1',0,'10:00','completed');
  A('cl7','sv7','st2',-1,'10:00','completed',{retail:8});A('cl9','sv1','st1',0,'11:30','completed');
  A('cl3','sv2','st1',-1,'12:00','completed',{retail:20});A('cl12','sv4','st2',-1,'13:30','completed');
  A('cl6','sv4','st2',-2,'10:30','completed');A('cl8','sv1','st1',-2,'14:00','completed',{retail:14});
  // upcoming this week
  A('cl1','sv1','st1',0,'13:30','confirmed');A('cl3','sv2','st1',0,'15:00','booked');
  A('cl6','sv4','st2',1,'11:00','booked');A('cl2','sv6','st1',1,'10:00','confirmed');
  A('cl4','sv3','st1',2,'09:30','booked');A('cl10','sv6','st1',2,'14:00','booked');
  A('cl13','sv4','st2',3,'10:00','booked');A('cl11','sv2','st1',4,'12:00','booked');
  A('cl8','sv1','st1',-6,'16:00','noshow');A('cl14','sv2','st1',-8,'12:00','cancelled');
  const inventory=[
    {id:'in1',name:'Oatmeal Shampoo 500ml',price:18,cost:7,stock:12,lowAt:5},
    {id:'in2',name:'De-shed Conditioner 500ml',price:20,cost:9,stock:7,lowAt:5},
    {id:'in3',name:'Detangling Spray 250ml',price:14,cost:5,stock:4,lowAt:5},
    {id:'in4',name:'Ear Cleaner 120ml',price:12,cost:4,stock:9,lowAt:4},
    {id:'in5',name:'Dental Chews (bag)',price:10,cost:4,stock:15,lowAt:6},
    {id:'in6',name:'Bandana / Bow',price:6,cost:2,stock:3,lowAt:6},
    {id:'in7',name:'Paw Balm 30ml',price:11,cost:4,stock:8,lowAt:4}];
  const giftcards=[
    {id:'gc1',code:'GC-WOOF24',amount:60,balance:35,note:'Sold to Emma — gift for a friend',issued:d(-38)},
    {id:'gc2',code:'GC-PAWS10',amount:50,balance:50,note:'Holiday voucher',issued:d(-5)}];
  const expenses=[
    {id:'ex1',date:d(-1),category:'supplies',desc:'Shampoo & conditioner re-order',amount:96.40},
    {id:'ex2',date:d(-3),category:'equipment',desc:'Blade sharpening (×6)',amount:54.00},
    {id:'ex3',date:d(-6),category:'vehicle',desc:'Van fuel',amount:78.20},
    {id:'ex4',date:d(-8),category:'supplies',desc:'Bandanas, bows & chews',amount:41.90},
    {id:'ex5',date:d(-11),category:'insurance',desc:'Grooming liability insurance',amount:62.00},
    {id:'ex6',date:d(-13),category:'marketing',desc:'Facebook local ad',amount:35.00},
    {id:'ex7',date:d(-16),category:'equipment',desc:'New clipper guards set',amount:47.50},
    {id:'ex8',date:d(-20),category:'vehicle',desc:'Van water tank service',amount:88.00}];
  const waitlist=[
    {id:'wl1',clientId:'cl8',serviceId:'sv1',staffId:'',pref:'Weekday mornings — Milo hates afternoons',created:d(-2)},
    {id:'wl2',clientId:'cl11',serviceId:'sv2',staffId:'st1',pref:'Saturday only if possible',created:d(-1)}];
  return {settings:{name:'Bubbles & Barks Grooming',phone:'(555) 018-2400',open:8,close:18,slot:30,ppd:1,redeem:10,bday:2,theme:'light',accent:'clay',invSeq:1,currency:'USD',onboarded:1,mobile:1},
    staff,services,packages,clients,appointments:appts,redemptions:[],inventory,giftcards,expenses,waitlist,unlocked:{}};
}

/* ---------- Toast / modal ---------- */
let toastT;function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>el.classList.remove('show'),2600)}
let lastFocus=null;
function openModal(html,wide){
  lastFocus=document.activeElement;
  const box=$('modalBox');box.className='modal'+(wide?' wide':'');box.innerHTML=html;
  const bg=$('modalBg');bg.classList.add('open');bg.setAttribute('role','dialog');bg.setAttribute('aria-modal','true');
  setTimeout(()=>{const f=box.querySelector('input:not([type=file]),select,textarea')||box.querySelector('.m-actions button');if(f)f.focus()},60);
}
function closeModal(){$('modalBg').classList.remove('open');if(lastFocus&&lastFocus.focus)try{lastFocus.focus()}catch(e){}}
/* Guard against rapid double-click / double-tap re-submitting the same form
   (e.g. saveClient firing twice before the modal has visually closed). */
document.addEventListener('click',function(e){
  const btn=e.target.closest('.m-actions .btn-primary');
  if(!btn)return;
  const now=Date.now();
  if(btn._lastClick&&now-btn._lastClick<700){e.preventDefault();e.stopImmediatePropagation();return}
  btn._lastClick=now;
},true);

/* ---------- Nav ---------- */
document.querySelectorAll('.nav-btn[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
function showView(v){
  if(v==='revenue')revStatsAnimated=false;
  document.querySelectorAll('.nav-btn').forEach(b=>{const on=b.dataset.view===v;b.classList.toggle('active',on);b.setAttribute('aria-current',on?'page':'false')});
  document.querySelectorAll('.view').forEach(s=>s.classList.toggle('active',s.id==='view-'+v));
  window.scrollTo({top:0});
  const main=$('main');if(main)main.scrollTop=0;
  renderView(v);
}
function renderView(v){
  ({dashboard:renderDashboard,calendar:renderCalendar,clients:renderClients,services:renderServices,
    staff:renderStaff,loyalty:renderLoyalty,alerts:renderRetention,revenue:renderRevenue,
    business:renderBusiness,gallery:renderGallery,settings:renderSettings}[v]||(()=>{}))();
}
function refreshAll(){save();const active=document.querySelector('.view.active').id.replace('view-','');renderView(active);updateAlertDot()}

/* ---------- Lookups ---------- */
const getClient=id=>DB.clients.find(c=>c.id===id);
const getStaff=id=>DB.staff.find(s=>s.id===id);
const getService=id=>DB.services.find(s=>s.id===id)||DB.packages.find(p=>p.id===id);
const svcName=id=>{const s=getService(id);return s?s.name:'—'};
const initials=n=>String(n||'?').split(' ').map(w=>w[0]).slice(0,2).join('').toUpperCase();
function chipColor(a){const mode=$('calColorBy')?$('calColorBy').value:'staff';
  if(mode==='service'){const s=DB.services.find(x=>x.id===a.serviceId);return SVC_COLORS[s?s.category:'other']||'#93A69B'}
  const st=getStaff(a.staffId);return st?st.color:'#2F7E78'}
// how a dog is labelled: "Bella (Emma Clark)"
const dogLabel=c=>c?esc(c.name)+(c.owner?' · '+esc(c.owner.split(' ')[0]):''):'Walk-in';
const dogLabelFull=c=>c?esc(c.name)+(c.owner?' ('+esc(c.owner)+')':''):'Walk-in';

/* ---------- Groom-Due math (retention) ---------- */
function lastCompleted(c){const done=DB.appointments.filter(a=>a.clientId===c.id&&a.status==='completed').sort((a,b)=>b.date.localeCompare(a.date));return done[0]||null}
function nextDue(c){const l=lastCompleted(c);if(!l)return null;return iso(addDays(parseISO(l.date),c.freqWeeks*7))}
function hasUpcoming(c){const t=todayISO();return DB.appointments.some(a=>a.clientId===c.id&&a.date>=t&&(a.status==='booked'||a.status==='confirmed'))}
function retStatus(c){ // 'current' | 'due' | 'overdue' | 'risk' | 'new'
  const l=lastCompleted(c);if(!l)return'new';
  const t=todayISO();
  if(daysBetween(l.date,t)>=90)return'risk';
  const due=nextDue(c);
  if(t>due)return'overdue';
  if(daysBetween(t,due)<=7)return'due';
  return'current';
}
function daysOverdue(c){const due=nextDue(c);if(!due)return 0;return Math.max(0,daysBetween(due,todayISO()))}
function rabiesStatus(c){ // returns null | 'expired' | 'soon'
  if(!c.rabiesExpiry)return null;
  const days=daysBetween(todayISO(),c.rabiesExpiry);
  if(days<0)return'expired';if(days<=30)return'soon';return null;
}
function updateAlertDot(){
  const n=DB.clients.filter(c=>!hasUpcoming(c)&&['due','overdue','risk'].includes(retStatus(c))).length;
  const el=$('alertDot');if(el){el.style.display=n?'':'none';el.textContent=n;}
}

/* ---------- Confetti ---------- */
function confetti(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  let cv=$('confettiCv');
  if(!cv){cv=document.createElement('canvas');cv.id='confettiCv';cv.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:200';document.body.appendChild(cv)}
  cv.width=innerWidth;cv.height=innerHeight;const ctx=cv.getContext('2d');
  const cols=['#D4794E','#2F7E78','#E0A44E','#8B6D9C','#8FB9C4','#5E9E86'];
  const parts=[...Array(120)].map(()=>({x:Math.random()*cv.width,y:-20-Math.random()*cv.height*.3,r:6+Math.random()*7,
    c:cols[Math.floor(Math.random()*cols.length)],vy:2+Math.random()*3.5,vx:-1.5+Math.random()*3,rot:Math.random()*6.28,vr:-.2+Math.random()*.4}));
  const t0=performance.now();
  (function step(t){
    ctx.clearRect(0,0,cv.width,cv.height);
    parts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.rot+=p.vr;
      ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);ctx.fillStyle=p.c;
      ctx.fillRect(-p.r/2,-p.r/3,p.r,p.r*.66);ctx.restore()});
    if(t-t0<2400)requestAnimationFrame(step);else ctx.clearRect(0,0,cv.width,cv.height);
  })(t0);
}

/* ---------- Milestones ---------- */
const ACH=[
  {id:'first',   icon:'🐾',name:'First Groom',     desc:'Book your first groom',              test:s=>s.totalAppts>=1},
  {id:'done10',  icon:'✂️',name:'Warmed Up',        desc:'Complete 10 grooms',                 test:s=>s.completed>=10},
  {id:'done50',  icon:'💫',name:'In Full Swing',    desc:'Complete 50 grooms',                 test:s=>s.completed>=50},
  {id:'day300',  icon:'💰',name:'$300 Day',         desc:'Earn $300+ in a single day',         test:s=>s.bestDay>=300},
  {id:'week1k',  icon:'🏆',name:'$1,000 Week',      desc:'Earn $1,000+ in a single week',      test:s=>s.bestWeek>=1000},
  {id:'loyal5',  icon:'⭐',name:'Loyal Pack',       desc:'5 dogs over 300 points',             test:s=>s.bigMembers>=5},
  {id:'gift1',   icon:'🎁',name:'Gift a Groom',     desc:'Sell your first gift card',          test:s=>s.gifts>=1},
  {id:'photos5', icon:'📸',name:'Portfolio Pro',    desc:'Add 5 transformation photos',        test:s=>s.photos>=5},
  {id:'busy15',  icon:'🔥',name:'Fully Booked',     desc:'15+ grooms in one week',             test:s=>s.busiestWeek>=15},
  {id:'radar',   icon:'📡',name:'Radar Clear',      desc:'Zero overdue dogs',                  test:s=>s.overdue===0&&s.completed>=5},
];
function achStats(){
  const byDay={},cntWk={},revWk={};
  let completed=0;
  DB.appointments.forEach(a=>{
    if(a.status==='completed'){completed++;
      const v=a.price+(a.retail||0)-(a.redeemed||0);
      byDay[a.date]=(byDay[a.date]||0)+v;
      const wk=iso(startOfWeek(parseISO(a.date)));
      revWk[wk]=(revWk[wk]||0)+v;}
    if(a.status!=='cancelled'){const wk=iso(startOfWeek(parseISO(a.date)));cntWk[wk]=(cntWk[wk]||0)+1}});
  return{totalAppts:DB.appointments.length,completed,
    bestDay:Math.max(0,...Object.values(byDay)),bestWeek:Math.max(0,...Object.values(revWk)),
    busiestWeek:Math.max(0,...Object.values(cntWk)),
    bigMembers:DB.clients.filter(c=>(c.points||0)>=300).length,
    gifts:DB.giftcards.length,
    photos:DB.clients.reduce((s,c)=>s+c.photos.length,0),
    overdue:DB.clients.filter(c=>['overdue'].includes(retStatus(c))&&!hasUpcoming(c)).length};
}
function checkAchievements(celebrate){
  DB.unlocked=DB.unlocked||{};
  const s=achStats();let fresh=[];
  ACH.forEach(a=>{if(!DB.unlocked[a.id]&&a.test(s)){DB.unlocked[a.id]=todayISO();fresh.push(a)}});
  if(fresh.length){save();
    if(celebrate){confetti();toast('🎉 Milestone unlocked: '+fresh.map(a=>a.icon+' '+a.name).join(' · '));window._freshAch=fresh.map(a=>a.id)}}
  return fresh;
}

/* ---------- Insights engine ---------- */
function computeInsights(from,to){
  const done=DB.appointments.filter(a=>a.status==='completed'&&(!from||a.date>=from)&&(!to||a.date<=to));
  const act=DB.appointments.filter(a=>a.status!=='cancelled'&&(!from||a.date>=from)&&(!to||a.date<=to));
  const byWd={},byHr={},bySvc={},byClient={};
  act.forEach(a=>{byWd[parseISO(a.date).getDay()]=(byWd[parseISO(a.date).getDay()]||0)+1;
    byHr[+a.start.split(':')[0]]=(byHr[+a.start.split(':')[0]]||0)+1});
  done.forEach(a=>{bySvc[a.serviceId]=(bySvc[a.serviceId]||0)+a.price;
    byClient[a.clientId]=(byClient[a.clientId]||0)+apptNet(a)});
  const top=o=>Object.entries(o).sort((a,b)=>b[1]-a[1])[0];
  const wd=top(byWd),hr=top(byHr),sv=top(bySvc),cl=top(byClient);
  const noshows=DB.appointments.filter(a=>a.status==='noshow').length;
  const doneAll=DB.appointments.filter(a=>a.status==='completed').length;
  return{
    busiestDay:wd?['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][wd[0]]:null,
    peakHour:hr?fmtTime(pad(hr[0])+':00'):null,
    topService:sv?{name:svcName(sv[0]),rev:sv[1]}:null,
    topClient:cl?{name:getClient(cl[0])?.name,spend:cl[1]}:null,
    noShowRate:(noshows+doneAll)?Math.round(noshows/(noshows+doneAll)*100):0,
    byHr};
}
function monthProjection(){
  const t=new Date();const from=iso(new Date(t.getFullYear(),t.getMonth(),1));
  const rev=DB.appointments.filter(a=>a.status==='completed'&&a.date>=from).reduce((s,a)=>s+apptNet(a),0);
  const daysIn=new Date(t.getFullYear(),t.getMonth()+1,0).getDate();
  return t.getDate()>=3?rev/t.getDate()*daysIn:null;
}

/* ---------- Theme ---------- */
const ACCENT_PRESETS=[
  {id:'clay',label:'Clay',euca:'#D4794E',eucaD:'#B25E38'},
  {id:'teal',label:'Teal',euca:'#2F7E78',eucaD:'#215E59'},
  {id:'plum',label:'Plum',euca:'#8B6D9C',eucaD:'#6E5480'},
  {id:'honey',label:'Honey',euca:'#D9992F',eucaD:'#B67C1E'},
  {id:'ocean',label:'Ocean',euca:'#3F7C97',eucaD:'#2C5E74'},
  {id:'rose',label:'Rosewood',euca:'#B4636B',eucaD:'#934E56'},
  {id:'moss',label:'Moss',euca:'#5E8A5E',eucaD:'#456945'},
  {id:'slate',label:'Slate',euca:'#5C7186',eucaD:'#42566A'},
];
function applyTheme(){
  const t=DB.settings.theme||'light';
  document.documentElement.setAttribute('data-theme',t);
  const d=$('dashTheme');if(d){d.textContent=t==='dark'?'☀️':'🌙';d.title=t==='dark'?'Switch to light mode':'Switch to dark mode';d.setAttribute('aria-label',d.title)}
  const si=$('sidebarThemeIco');const sl=$('sidebarThemeLbl');
  if(si){si.innerHTML=t==='dark'?'<circle cx="12" cy="12" r="5"/><path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>':'<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';}
  if(sl){sl.textContent=t==='dark'?'Light Mode':'Dark Mode';}
  applyAccentColor();
}
function applyAccentColor(){
  const id=DB.settings.accent||'clay';
  const p=ACCENT_PRESETS.find(x=>x.id===id)||ACCENT_PRESETS[0];
  document.documentElement.style.setProperty('--clay',p.euca);
  document.documentElement.style.setProperty('--clay-d',p.eucaD);
  const style=document.getElementById('accentOverride');
  if(style)style.remove();
  const s=document.createElement('style');s.id='accentOverride';
  s.textContent=`.nav-btn.active{background:${p.euca}}.btn-primary{background:${p.euca}}.btn-primary:hover{background:${p.eucaD}}.stat-card::after{background:linear-gradient(90deg,${p.euca} 0%,var(--mist2) 90%)}`;
  document.head.appendChild(s);
}
function renderColorSwatches(){
  const el=$('colorSwatches');if(!el)return;
  const cur=DB.settings.accent||'clay';
  el.innerHTML=ACCENT_PRESETS.map(p=>`<div class="color-swatch${p.id===cur?' active':''}" style="background:${p.euca}" title="${p.label}" onclick="setAccentColor('${p.id}')"></div>`).join('');
}
function setAccentColor(id){
  DB.settings.accent=id;save();applyAccentColor();renderColorSwatches();toast('Accent color updated');
}
function toggleTheme(){DB.settings.theme=DB.settings.theme==='dark'?'light':'dark';save();applyTheme()}

/* ---------- Animated counters ---------- */
function countUp(el,val,fmt){
  fmt=fmt||(v=>Math.round(v).toLocaleString());
  if(el._countUpRAF){cancelAnimationFrame(el._countUpRAF);el._countUpRAF=null}
  if(matchMedia('(prefers-reduced-motion: reduce)').matches||Math.abs(val)<1){el.textContent=fmt(val);return}
  const dur=620,t0=performance.now();
  const step=t=>{const p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);
    el.textContent=fmt(val*e);if(p<1)el._countUpRAF=requestAnimationFrame(step);else el._countUpRAF=null};
  el._countUpRAF=requestAnimationFrame(step);
}
function miniSpark(vals,w,h){
  w=w||96;h=h||26;const mx=Math.max(1,...vals);
  const pts=vals.map((v,i)=>`${(i/(vals.length-1)*w).toFixed(1)},${(h-2-(v/mx)*(h-4)).toFixed(1)}`);
  return`<svg class="kpi-spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
    <polygon points="0,${h} ${pts.join(' ')} ${w},${h}"/><polyline points="${pts.join(' ')}"/></svg>`;
}
function apptNet(a){return a.price+(a.retail||0)-(a.redeemed||0)}
/* ================================================================
   Calendar: week / month / day, booking, drag-reschedule, checkout
   ================================================================ */
let calMode='week', calAnchor=new Date(), calStaffFilter='';
function startOfWeek(d){const x=new Date(d);const day=(x.getDay()+6)%7;x.setDate(x.getDate()-day);x.setHours(0,0,0,0);return x}
function setCalMode(m){calMode=m;
  $('tabDay').classList.toggle('active',m==='day');$('tabWeek').classList.toggle('active',m==='week');$('tabMonth').classList.toggle('active',m==='month');
  $('weekWrap').style.display=m==='month'?'none':'';$('monthGrid').style.display=m==='month'?'grid':'none';renderCalendar()}
function calNav(dir){calAnchor=calMode==='day'?addDays(calAnchor,dir):calMode==='week'?addDays(calAnchor,dir*7):new Date(calAnchor.getFullYear(),calAnchor.getMonth()+dir,1);renderCalendar()}
function calToday(){calAnchor=new Date();renderCalendar()}

function renderCalendar(){
  calMode==='day'?renderDay():calMode==='week'?renderWeek():renderMonth();
  renderLegend();renderStaffChips();renderWaitlist()}
function renderStaffChips(){
  const el=$('staffChips');if(!el)return;
  if(calMode==='month'||calMode==='day'){el.innerHTML='';return}
  el.innerHTML=`<button class="${calStaffFilter?'':'on'}" onclick="calStaffFilter='';renderCalendar()">All groomers</button>`+
    DB.staff.map(s=>`<button class="${calStaffFilter===s.id?'on':''}" onclick="calStaffFilter='${s.id}';renderCalendar()">
      <span class="dot" style="background:${s.color}"></span>${esc(s.name.split(' ')[0])}</button>`).join('');
}
function renderLegend(){
  const mode=$('calColorBy').value;let html='';
  if(mode==='service'&&calMode!=='month')
    html=Object.entries(SVC_COLORS).filter(([c])=>DB.services.some(s=>s.category===c)).map(([c,col])=>`<span><span class="sw" style="background:${col}"></span>${CAT_LABEL[c]||c}</span>`).join('');
  $('calLegend').innerHTML=html+`<span style="margin-left:auto">✓ completed fade · ✕ no-show striped</span>`;
}
function layoutLanes(appts){ // cluster overlapping same-day appts into columns
  const pos={};
  const byDay={};appts.forEach(a=>{if(a.status==='cancelled')return;(byDay[a.date]=byDay[a.date]||[]).push(a)});
  Object.values(byDay).forEach(evs=>{
    evs.sort((a,b)=>minOf(a.start)-minOf(b.start)||b.duration-a.duration);
    let cluster=[],clusterEnd=-1;
    const flush=()=>{if(!cluster.length)return;
      const laneEnds=[];
      cluster.forEach(e=>{const s=minOf(e.start);
        let li=laneEnds.findIndex(end=>s>=end);
        if(li<0){li=laneEnds.length;laneEnds.push(0)}
        laneEnds[li]=s+e.duration;pos[e.id]={col:li}});
      cluster.forEach(e=>pos[e.id].n=laneEnds.length);cluster=[]};
    evs.forEach(e=>{const s=minOf(e.start);
      if(cluster.length&&s>=clusterEnd)flush();
      cluster.push(e);clusterEnd=Math.max(clusterEnd,s+e.duration)});
    flush();
  });
  return pos;
}
function renderWeek(){
  const S=DB.settings,slot=S.slot,open=S.open*60,close=S.close*60;
  const rows=(close-open)/slot;
  $('weekGrid').style.gridTemplateColumns='';
  const ws=startOfWeek(calAnchor);const days=[...Array(7)].map((_,i)=>addDays(ws,i));
  $('calTitle').textContent=ws.toLocaleDateString(undefined,{month:'long',day:'numeric'})+' – '+addDays(ws,6).toLocaleDateString(undefined,{month:'long',day:'numeric',year:'numeric'});
  const t=todayISO();
  let h=`<div class="wg-corner"></div>`+days.map(d=>`<div class="wg-dayhead${iso(d)===t?' today':''}">${d.toLocaleDateString(undefined,{weekday:'short'})}<span class="dnum">${d.getDate()}</span></div>`).join('');
  const rowH=slot===15?24:slot===30?34:52;
  for(let r=0;r<rows;r++){
    const mins=open+r*slot;
    h+=`<div class="wg-time" style="height:${rowH}px">${mins%60===0?fmtTime(timeOf(mins)):''}</div>`;
    days.forEach(d=>{
      const dISO=iso(d);
      const wknd=d.getDay()===0||d.getDay()===6;
      h+=`<div class="wg-cell${wknd?' wknd':''}" style="height:${rowH}px" data-date="${dISO}" data-min="${mins}"
        ondragover="dragOver(event)" ondragleave="this.classList.remove('dragover')" ondrop="dropAppt(event)"
        onclick="openBooking('${dISO}','${timeOf(mins)}')"></div>`;
    });
  }
  $('weekGrid').innerHTML=h;
  const weekAppts=DB.appointments.filter(a=>days.some(d=>iso(d)===a.date)&&(!calStaffFilter||a.staffId===calStaffFilter));
  const lanes=layoutLanes(weekAppts);
  const todayIdx=days.findIndex(d=>iso(d)===t);
  if(todayIdx>=0){
    const nowM=new Date().getHours()*60+new Date().getMinutes();
    if(nowM>=open&&nowM<close){
      const headH=document.querySelector('.wg-dayhead').offsetHeight;
      const y=headH+(nowM-open)/slot*rowH;
      const timeW=$('weekGrid').querySelector('.wg-corner').offsetWidth||56;
      const line=document.createElement('div');line.className='now-line';line.style.top=y+'px';line.style.left=timeW+'px';
      line.innerHTML=`<i style="left:calc(${(todayIdx/7*100).toFixed(2)}% - 4px)"></i>`;
      $('weekGrid').appendChild(line);
    }
  }
  weekAppts.forEach(a=>{
    const startM=minOf(a.start);if(startM<open||startM>=close)return;
    const cell=document.querySelector(`.wg-cell[data-date="${a.date}"][data-min="${open+Math.floor((startM-open)/slot)*slot}"]`);
    if(!cell)return;
    const offset=(startM-(open+Math.floor((startM-open)/slot)*slot))/slot*rowH;
    const hgt=Math.max(a.duration/slot*rowH-3,46);
    const chip=document.createElement('div');
    chip.className='appt-chip '+(a.status==='cancelled'?'cancelled':a.status==='completed'?'completed':a.status==='noshow'?'noshow':'');
    const L=lanes[a.id]||{col:0,n:1};
    chip.style.cssText=`top:${offset+1}px;height:${hgt}px;background:${chipColor(a)};left:calc(${(L.col/L.n*100).toFixed(2)}% + 3px);width:calc(${(100/L.n).toFixed(2)}% - 6px);right:auto`;
    chip.draggable=a.status==='booked'||a.status==='confirmed';
    const c=getClient(a.clientId);
    chip.innerHTML=`<strong>${esc(c?.name||'Walk-in')}</strong><span class="svc">${esc(svcName(a.serviceId))}</span><span class="tm">${fmtTime(a.start)}</span>`;
    chip.addEventListener('click',e=>{e.stopPropagation();openApptDetail(a.id)});
    chip.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',a.id);e.dataTransfer.effectAllowed='move'});
    cell.appendChild(chip);
  });
}
function dragOver(e){e.preventDefault();e.currentTarget.classList.add('dragover');e.dataTransfer.dropEffect='move'}
function dropAppt(e){
  e.preventDefault();const cell=e.currentTarget;cell.classList.remove('dragover');
  const id=e.dataTransfer.getData('text/plain');const a=DB.appointments.find(x=>x.id===id);if(!a)return;
  const nd=cell.dataset.date,nt=timeOf(+cell.dataset.min);
  const nStaff=cell.dataset.staff!==undefined?cell.dataset.staff:a.staffId;
  const conflict=findConflict(nStaff,nd,nt,a.duration,a.id,DB.services.find(s=>s.id===a.serviceId)?.buffer||0);
  if(conflict){toast(`⚠ ${getStaff(nStaff)?.name||'That groomer'} already has ${esc(getClient(conflict.clientId)?.name||'')} at ${fmtTime(conflict.start)}`);return}
  const svc=DB.services.find(s=>s.id===a.serviceId);
  if(nStaff!==a.staffId&&svc&&svc.staffIds.length&&!svc.staffIds.includes(nStaff)){
    toast(`⚠ ${getStaff(nStaff)?.name||'They'} don't offer ${esc(svc.name)}`);return}
  const reassigned=nStaff!==a.staffId;
  a.date=nd;a.start=nt;a.staffId=nStaff;refreshAll();
  toast(`Rescheduled → ${fmtDate(nd)} at ${fmtTime(nt)}${reassigned?' with '+getStaff(nStaff).name:''}`);
}
function findConflict(staffId,date,start,dur,skipId,newBuf){
  const s0=minOf(start),s1=s0+dur+(newBuf||0);
  return DB.appointments.find(a=>{
    if(a.id===skipId||a.staffId!==staffId||a.date!==date)return false;
    if(a.status==='cancelled'||a.status==='noshow')return false;
    const svc=DB.services.find(x=>x.id===a.serviceId);const buf=svc?svc.buffer:0;
    const b0=minOf(a.start),b1=b0+a.duration+buf;
    return s0<b1&&b0<s1;
  });
}
function staffAvailable(staffId,date,start,dur){
  const st=getStaff(staffId);if(!st)return true;
  const av=st.avail[parseISO(date).getDay()];if(!av)return false;
  return minOf(start)>=av[0]*60&&minOf(start)+dur<=av[1]*60;
}
function renderDay(){
  const S=DB.settings,slot=S.slot,open=S.open*60,close=S.close*60;
  const rows=(close-open)/slot;
  const dISO=iso(calAnchor);
  $('calTitle').textContent=calAnchor.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  const cols=DB.staff.length?DB.staff:[{id:'',name:'Unassigned',color:'#93A69B',avail:{}}];
  const rowH=slot===15?26:slot===30?38:56;
  $('weekGrid').style.gridTemplateColumns=`56px repeat(${cols.length},minmax(150px,1fr))`;
  let h=`<div class="wg-corner"></div>`+cols.map(st=>{
    const av=st.avail?st.avail[calAnchor.getDay()]:null;
    return`<div class="wg-dayhead"><span class="dot" style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${st.color};margin-right:5px;vertical-align:0"></span>${esc(st.name.split(' ')[0])}<span class="dnum" style="font-size:11px;color:var(--ink-soft);text-transform:none;letter-spacing:0">${av?fmtTime(pad(av[0])+':00')+' – '+fmtTime(pad(av[1])+':00'):'day off'}</span></div>`}).join('');
  for(let r=0;r<rows;r++){
    const mins=open+r*slot;
    h+=`<div class="wg-time" style="height:${rowH}px">${mins%60===0?fmtTime(timeOf(mins)):''}</div>`;
    cols.forEach(st=>{
      const av=st.avail?st.avail[calAnchor.getDay()]:null;
      const off=!av||mins<av[0]*60||mins>=av[1]*60;
      h+=`<div class="wg-cell${off?' closed':''}" style="height:${rowH}px" data-date="${dISO}" data-min="${mins}" data-staff="${st.id}"
        ondragover="dragOver(event)" ondragleave="this.classList.remove('dragover')" ondrop="dropAppt(event)"
        onclick="openBookingAt('${dISO}','${timeOf(mins)}','${st.id}')"></div>`;
    });
  }
  $('weekGrid').innerHTML=h;
  if(dISO===todayISO()){
    const nowM=new Date().getHours()*60+new Date().getMinutes();
    if(nowM>=open&&nowM<close){
      const headH=document.querySelector('.wg-dayhead').offsetHeight;
      const timeW=$('weekGrid').querySelector('.wg-corner').offsetWidth||56;
      const line=document.createElement('div');line.className='now-line';
      line.style.top=headH+(nowM-open)/slot*rowH+'px';line.style.left=timeW+'px';
      line.innerHTML='<i style="left:-4px"></i>';
      $('weekGrid').appendChild(line);
    }
  }
  const dayAppts=DB.appointments.filter(a=>a.date===dISO);
  cols.forEach(st=>{
    const colAppts=dayAppts.filter(a=>(a.staffId||'')===st.id);
    const lanes=layoutLanes(colAppts);
    colAppts.forEach(a=>{
      const startM=minOf(a.start);if(startM<open||startM>=close)return;
      const anchor=open+Math.floor((startM-open)/slot)*slot;
      const cell=document.querySelector(`.wg-cell[data-min="${anchor}"][data-staff="${st.id}"]`);
      if(!cell)return;
      const offset=(startM-anchor)/slot*rowH;
      const hgt=Math.max(a.duration/slot*rowH-3,46);
      const chip=document.createElement('div');
      chip.className='appt-chip '+(a.status==='cancelled'?'cancelled':a.status==='completed'?'completed':a.status==='noshow'?'noshow':'');
      const L=lanes[a.id]||{col:0,n:1};
      chip.style.cssText=`top:${offset+1}px;height:${hgt}px;background:${chipColor(a)};left:calc(${(L.col/L.n*100).toFixed(2)}% + 3px);width:calc(${(100/L.n).toFixed(2)}% - 6px);right:auto`;
      chip.draggable=a.status==='booked'||a.status==='confirmed';
      chip.innerHTML=`<strong>${esc(getClient(a.clientId)?.name||'Walk-in')}</strong><span class="svc">${esc(svcName(a.serviceId))}</span><span class="tm">${fmtTime(a.start)} · ${a.duration}m</span>`;
      chip.addEventListener('click',e=>{e.stopPropagation();openApptDetail(a.id)});
      chip.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',a.id);e.dataTransfer.effectAllowed='move'});
      cell.appendChild(chip);
    });
  });
}
function openBookingAt(date,time,staffId){
  openBooking(date,time);
  setTimeout(()=>{if($('bkStaff')&&staffId){const opt=[...$('bkStaff').options].find(o=>o.value===staffId);if(opt)$('bkStaff').value=staffId}},90);
}
function renderMonth(){
  const y=calAnchor.getFullYear(),m=calAnchor.getMonth();
  $('calTitle').textContent=calAnchor.toLocaleDateString(undefined,{month:'long',year:'numeric'});
  const firstDay=new Date(y,m,1);const startPad=(firstDay.getDay()+6)%7;
  const gridStart=addDays(firstDay,-startPad);
  const counts={};DB.appointments.forEach(a=>{if(a.status!=='cancelled')counts[a.date]=(counts[a.date]||0)+1});
  const max=Math.max(1,...Object.values(counts));
  let h=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>`<div class="mg-head">${d}</div>`).join('');
  const t=todayISO();
  for(let i=0;i<42;i++){
    const d=addDays(gridStart,i);const dISO=iso(d);const c=counts[dISO]||0;
    const heat=c?`background:rgba(47,126,120,${0.14+0.6*(c/max)});${c/max>.55?'color:#fff':''}`:'';
    h+=`<div class="mg-day${d.getMonth()!==m?' other':''}${dISO===t?' today':''}" style="${heat}" onclick="calAnchor=parseISO('${dISO}');setCalMode('week')">
      <span class="dn">${d.getDate()}</span>${c?`<div class="cnt">${c} groom${c>1?'s':''}</div>`:''}</div>`;
  }
  $('monthGrid').innerHTML=h;
}

/* ---------- Booking ---------- */
function openBooking(date,time,presetClient){
  const d=date||todayISO(),t=time||'10:00';
  const svcOpts=DB.services.map(s=>`<option value="${s.id}">${esc(s.name)} · ${s.duration}m · ${money(s.price)}</option>`).join('')
    +(DB.packages.length?`<optgroup label="Packages">${DB.packages.map(p=>`<option value="${p.id}">📦 ${esc(p.name)} · ${money(p.price)}</option>`).join('')}</optgroup>`:'');
  const clientOpts='<option value="">— Select dog —</option>'+DB.clients.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`<option value="${c.id}"${presetClient===c.id?' selected':''}>${esc(c.name)} — ${esc(c.owner||'')}</option>`).join('')+'<option value="__new">＋ New dog…</option>';
  openModal(`
    <button class="m-close" onclick="closeModal()">×</button>
    <h3>Book a Groom</h3><p class="m-sub">Pick the service first — the groomer list filters to who offers it.</p>
    <label>Dog</label><select id="bkClient" onchange="if(this.value==='__new'){quickNewClient()}else bkDogHint()">${clientOpts}</select>
    <div id="bkHint" style="font-size:12px;color:var(--ink-soft);margin-top:4px"></div>
    <label>Service</label><select id="bkService" onchange="bkSyncStaff()">${svcOpts}</select>
    <label>Groomer</label><select id="bkStaff"></select>
    <div class="form-row">
      <div><label>Date</label><input type="date" id="bkDate" value="${d}"></div>
      <div><label>Time</label><select id="bkTime">${timeOptions(t)}</select></div>
    </div>
    <label>Notes for this visit</label><input id="bkNotes" placeholder="e.g. shorter than last time, matted behind ears">
    <div class="m-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="saveBooking()">Book Groom</button></div>`);
  bkSyncStaff();bkDogHint();
}
function bkDogHint(){
  const c=getClient($('bkClient')?.value);const el=$('bkHint');if(!el)return;
  if(!c){el.innerHTML='';return}
  const flags=(c.behaviorNotes||[]).length?'⚠ '+c.behaviorNotes.join(', '):'';
  const sens=c.sensitivities?'🧴 '+esc(c.sensitivities):'';
  const rab=rabiesStatus(c);const rabTxt=rab==='expired'?'<span style="color:var(--red)">💉 Rabies expired</span>':rab==='soon'?'<span style="color:var(--amber)">💉 Rabies expiring soon</span>':'';
  el.innerHTML=[c.breed?esc(c.breed)+' · '+SIZE_LABEL[c.size]:'' ,flags?esc(flags):'',sens,rabTxt].filter(Boolean).join(' &nbsp;·&nbsp; ');
  // preset favourite service
  if(c.fav&&$('bkService')){const opt=[...$('bkService').options].find(o=>o.value===c.fav);if(opt){$('bkService').value=c.fav;bkSyncStaff();}}
  if(c.staffId&&$('bkStaff')){const opt=[...$('bkStaff').options].find(o=>o.value===c.staffId);if(opt)$('bkStaff').value=c.staffId;}
}
function timeOptions(sel){
  const S=DB.settings;let h='';
  for(let m=S.open*60;m<S.close*60;m+=S.slot){const t=timeOf(m);h+=`<option value="${t}"${t===sel?' selected':''}>${fmtTime(t)}</option>`}
  return h;
}
function bkSyncStaff(){
  const svcId=$('bkService').value;const svc=DB.services.find(s=>s.id===svcId);
  const eligible=svc?DB.staff.filter(s=>svc.staffIds.includes(s.id)):DB.staff;
  $('bkStaff').innerHTML=(eligible.length?eligible:DB.staff).map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('');
}
function quickNewClient(){
  openModal(`
    <button class="m-close" onclick="closeModal()">×</button>
    <h3>Quick Add Dog</h3>
    <div class="form-row"><div><label>Dog's name</label><input id="qcName" autofocus></div>
    <div><label>Owner name</label><input id="qcOwner"></div></div>
    <label>Phone</label><input id="qcPhone">
    <div class="m-actions"><button class="btn btn-ghost" onclick="openBooking()">Back</button>
    <button class="btn btn-primary" onclick="saveQuickClient()">Add & Continue</button></div>`);
}
function saveQuickClient(){
  const name=$('qcName').value.trim();if(!name){toast('Dog name required');return}
  const c={id:uid(),name,owner:$('qcOwner').value.trim(),phone:$('qcPhone').value.trim(),email:'',birthday:'',address:'',
    breed:'',size:'medium',coat:'',weight:'',behaviorNotes:[],sensitivities:'',lastCut:'',rabiesExpiry:'',
    freqWeeks:6,staffId:DB.staff[0]?.id||'',fav:DB.services[0]?.id||'',points:0,photos:[],createdAt:todayISO()};
  DB.clients.push(c);save();toast('Dog added');openBooking(undefined,undefined,c.id);
}
function saveBooking(){
  const clientId=$('bkClient').value,svcId=$('bkService').value,staffId=$('bkStaff').value,
    date=$('bkDate').value,start=$('bkTime').value,notes=$('bkNotes').value.trim();
  if(!clientId||clientId==='__new'){toast('Choose a dog');return}
  if(!date){toast('Choose a date');return}
  const svc=getService(svcId);
  const dur=svc.duration||DB.packages.find(p=>p.id===svcId)?.serviceIds.reduce((s,id)=>s+(DB.services.find(x=>x.id===id)?.duration||0),0)||60;
  const conflict=findConflict(staffId,date,start,dur,null,DB.services.find(s=>s.id===svcId)?.buffer||0);
  if(conflict){
    if(confirm(`${getStaff(staffId).name} already has ${getClient(conflict.clientId)?.name||'a booking'} at ${fmtTime(conflict.start)}.\n\nAdd ${getClient(clientId).name} to the waitlist instead?`)){
      closeModal();openWaitlistForm(clientId,svcId);
    }else toast('Pick another time or groomer');
    return}
  if(!staffAvailable(staffId,date,start,dur)&&!confirm(`${getStaff(staffId).name} is normally off / outside hours at this time. Book anyway?`))return;
  DB.appointments.push({id:uid(),clientId,serviceId:svcId,staffId,date,start,duration:dur,price:svc.price,status:'booked',retail:0,notes});
  if(window._wlPending){DB.waitlist=DB.waitlist.filter(w=>w.id!==window._wlPending);window._wlPending=null}
  closeModal();refreshAll();toast(`Booked ${getClient(clientId).name} · ${fmtDate(date)} ${fmtTime(start)}`);
}

/* ---------- Appointment detail / status / checkout ---------- */
function openApptDetail(id){
  const a=DB.appointments.find(x=>x.id===id);if(!a)return;
  const c=getClient(a.clientId),st=getStaff(a.staffId);
  const statusBadge={booked:'blue',confirmed:'green',completed:'grey',cancelled:'red',noshow:'red'}[a.status];
  const flags=(c?.behaviorNotes||[]).length?c.behaviorNotes.map(f=>`<span class="flag">⚠ ${esc(f)}</span>`).join(''):'';
  openModal(`
    <button class="m-close" onclick="closeModal()">×</button>
    <h3>${esc(c?.name||'Walk-in')}${c?.owner?` <span style="font-size:14px;color:var(--ink-soft);font-family:var(--font-body);font-weight:600">· ${esc(c.owner)}</span>`:''}</h3>
    <p class="m-sub">${esc(svcName(a.serviceId))} with ${esc(st?.name||'—')}<br>${fmtDateLong(a.date)} · ${fmtTime(a.start)} · ${a.duration} min · ${money(a.price)}</p>
    <span class="badge ${statusBadge}">${a.status}</span>
    ${c?`<span class="badge grey">${esc(c.breed||'—')} · ${SIZE_LABEL[c.size]||''}</span>`:''}
    ${flags?`<div class="flag-list" style="margin-top:8px">${flags}</div>`:''}
    ${c?.lastCut?`<p style="font-size:13px;margin-top:8px;background:var(--mist);padding:9px 12px;border-radius:9px">✂️ Last cut: ${esc(c.lastCut)}</p>`:''}
    ${a.notes?`<p style="font-size:13px;margin-top:8px;background:var(--mist);padding:9px 12px;border-radius:9px">📝 ${esc(a.notes)}</p>`:''}
    ${c?.sensitivities?`<p style="font-size:13px;margin-top:8px;color:var(--red)">🧴 ${esc(c.sensitivities)}</p>`:''}
    <div class="m-actions" style="justify-content:flex-start;margin-top:16px">
      ${a.status==='booked'?`<button class="btn btn-ghost btn-sm" onclick="setStatus('${a.id}','confirmed')">✓ Confirm</button>`:''}
      ${(a.status==='booked'||a.status==='confirmed')?`
        <button class="btn btn-primary btn-sm" onclick="openCheckout('${a.id}')">Complete & Checkout</button>
        <button class="btn btn-ghost btn-sm" onclick="setStatus('${a.id}','noshow')">No-show</button>
        <button class="btn btn-danger btn-sm" onclick="setStatus('${a.id}','cancelled')">Cancel</button>`:''}
      ${a.status==='completed'?`<button class="btn btn-ghost btn-sm" onclick="printReceipt('${a.id}')">🖨 Receipt</button><button class="btn btn-ghost btn-sm" onclick="printInvoice('${a.id}')">🖨 Invoice</button>`:''}
      <button class="btn btn-ghost btn-sm" onclick="printApptCard('${a.id}')">🖨 Reminder Card</button>
      <button class="btn btn-ghost btn-sm" onclick="closeModal();openClientDetail('${a.clientId}')">View Dog</button>
      <button class="btn btn-danger btn-sm" onclick="deleteAppt('${a.id}')">Delete</button>
    </div>`);
}
function setStatus(id,s){const a=DB.appointments.find(x=>x.id===id);a.status=s;closeModal();refreshAll();toast('Marked '+s)}
function deleteAppt(id){if(!confirm('Delete this groom permanently?'))return;DB.appointments=DB.appointments.filter(a=>a.id!==id);closeModal();refreshAll();toast('Groom deleted')}

function pointsMultiplier(c){
  if(!c?.birthday)return 1;
  const bm=+c.birthday.split('-')[1];return(bm===new Date().getMonth()+1)?(+DB.settings.bday||1):1;
}
function openCheckout(id){
  const a=DB.appointments.find(x=>x.id===id);const c=getClient(a.clientId);const S=DB.settings;
  const maxOff=Math.floor((c?.points||0)/S.redeem);
  openModal(`
    <button class="m-close" onclick="closeModal()">×</button>
    <h3>Checkout — ${esc(c?.name||'')}</h3>
    <p class="m-sub">${esc(svcName(a.serviceId))} · ${fmtDate(a.date)}</p>
    <div class="form-row">
      <div><label>Groom price ${c?`(size: ${SIZE_LABEL[c.size]})`:''}</label><input type="number" id="coPrice" value="${a.price}" min="0" step="0.01" oninput="coCalc('${id}')"></div>
      <div><label>Retail / take-home</label><input type="number" id="coRetail" value="0" min="0" step="0.01" oninput="coCalc('${id}')"></div>
    </div>
    <label>Add retail product ${DB.inventory.length?'':'(no products in stock)'}</label>
    <div style="display:flex;gap:8px"><select id="coProd" style="flex:1">${DB.inventory.filter(i=>i.stock>0).map(i=>`<option value="${i.id}">${esc(i.name)} · ${money(i.price)} (${i.stock} left)</option>`).join('')||'<option value="">—</option>'}</select>
    <button class="btn btn-ghost btn-sm" onclick="coAddProduct('${id}')" ${DB.inventory.some(i=>i.stock>0)?'':'disabled'}>Add</button></div>
    <div id="coItems" style="font-size:13px;margin-top:5px"></div>
    <label>Gift card code</label>
    <div style="display:flex;gap:8px"><input id="coGiftCode" placeholder="GC-XXXXX" style="flex:1;font-family:monospace;text-transform:uppercase">
    <button class="btn btn-ghost btn-sm" onclick="coApplyGift('${id}')">Apply</button></div>
    <div id="coGiftMsg" style="font-size:12.5px;margin-top:4px;color:var(--ink-soft)"></div>
    <label>Redeem points ${maxOff>0?`(${c.points} pts = up to ${money(maxOff)} off)`:`(${c?.points||0} pts — not enough yet)`}</label>
    <input type="number" id="coRedeem" value="0" min="0" max="${maxOff}" step="1" oninput="coCalc('${id}')" ${maxOff?'':'disabled'} placeholder="$ off">
    ${maxOff>=5?`<p style="font-size:12.5px;color:var(--teal-d);margin-top:4px">💡 Suggestion: apply ${money(Math.min(maxOff,10))} off — tap <button class="btn btn-sm btn-teal" onclick="$('coRedeem').value=${Math.min(maxOff,10)};coCalc('${id}')">Apply</button></p>`:''}
    <div class="card" style="margin-top:14px;background:var(--mist);box-shadow:none" id="coSummary"></div>
    <div class="m-actions"><button class="btn btn-ghost" onclick="closeModal()">Back</button>
      <button class="btn btn-primary" onclick="completeCheckout('${id}')">Complete & Save</button></div>`);
  window._coItems=[];window._coGift=null;
  coCalc(id);
}
function coAddProduct(id){
  const pid=$('coProd').value;const prod=DB.inventory.find(i=>i.id===pid);if(!prod||prod.stock<1)return;
  const taken=window._coItems.filter(i=>i.pid===pid).length;
  if(taken>=prod.stock){toast('No more stock of that item');return}
  window._coItems.push({pid,name:prod.name,price:prod.price});
  coAddProductRefresh(id);
}
function coAddProductRefresh(id){
  $('coItems').innerHTML=window._coItems.map((i,x)=>`<span class="badge grey" style="margin:2px 4px 2px 0;text-transform:none">${esc(i.name)} ${money(i.price)} <a href="#" style="color:var(--red);text-decoration:none" onclick="window._coItems.splice(${x},1);coAddProductRefresh('${id}');return false">✕</a></span>`).join('');
  coCalc(id);
}
function coApplyGift(id){
  const code=$('coGiftCode').value.trim().toUpperCase();
  const g=DB.giftcards.find(x=>x.code===code);
  if(!g){$('coGiftMsg').textContent='⚠ Card not found';window._coGift=null;coCalc(id);return}
  if(g.balance<=0){$('coGiftMsg').textContent='⚠ '+code+' has no remaining balance';window._coGift=null;coCalc(id);return}
  window._coGift=g;
  $('coGiftMsg').innerHTML='✓ '+esc(code)+' — balance <b>'+money(g.balance)+'</b> will be applied';
  coCalc(id);
}
function coCalc(id){
  const a=DB.appointments.find(x=>x.id===id);const c=getClient(a.clientId);const S=DB.settings;
  const price=+$('coPrice').value||0,custom=+$('coRetail').value||0;
  const prodSum=(window._coItems||[]).reduce((s,i)=>s+i.price,0);
  const retail=custom+prodSum;
  let off=Math.min(+$('coRedeem').value||0,Math.floor((c?.points||0)/S.redeem));
  let due=Math.max(0,price+retail-off);
  const giftApplied=window._coGift?Math.min(window._coGift.balance,due):0;
  const total=Math.max(0,due-giftApplied);
  const mult=pointsMultiplier(c);
  const earned=Math.round(total*S.ppd*mult);
  $('coSummary').innerHTML=`
    <div class="pr-line" style="border-color:var(--mist2)"><span>Groom</span><b>${money(price)}</b></div>
    ${prodSum?`<div class="pr-line" style="border-color:var(--mist2)"><span>Products (${(window._coItems||[]).length})</span><b>${money(prodSum)}</b></div>`:''}
    ${custom?`<div class="pr-line" style="border-color:var(--mist2)"><span>Retail (other)</span><b>${money(custom)}</b></div>`:''}
    ${off?`<div class="pr-line" style="border-color:var(--mist2);color:var(--clay-d)"><span>Points redeemed (−${off*S.redeem} pts)</span><b>−${money(off)}</b></div>`:''}
    ${giftApplied?`<div class="pr-line" style="border-color:var(--mist2);color:var(--clay-d)"><span>Gift card ${esc(window._coGift.code)}</span><b>−${money(giftApplied)}</b></div>`:''}
    <div class="pr-line pr-total" style="border:none"><span>Total due</span><b style="font-size:19px">${money(total)}</b></div>
    <div style="font-size:12.5px;color:var(--teal-d);margin-top:4px">★ Earns ${earned} points${mult>1?` (🎂 birthday ×${mult}!)`:''}</div>`;
}
function completeCheckout(id){
  const a=DB.appointments.find(x=>x.id===id);const c=getClient(a.clientId);const S=DB.settings;
  const price=+$('coPrice').value||0,custom=+$('coRetail').value||0;
  const items=window._coItems||[];
  const prodSum=items.reduce((s,i)=>s+i.price,0);
  const retail=custom+prodSum;
  let off=Math.min(+$('coRedeem').value||0,Math.floor((c?.points||0)/S.redeem));
  let due=Math.max(0,price+retail-off);
  const g=window._coGift;const giftApplied=g?Math.min(g.balance,due):0;
  a.price=price;a.retail=retail;a.items=items.map(i=>({name:i.name,price:i.price}));
  a.status='completed';a.redeemed=off;
  if(giftApplied){a.gift={code:g.code,amount:giftApplied};g.balance=Math.round((g.balance-giftApplied)*100)/100}
  items.forEach(i=>{const p=DB.inventory.find(x=>x.id===i.pid);if(p)p.stock=Math.max(0,p.stock-1)});
  const mult=pointsMultiplier(c);
  const earned=Math.round(Math.max(0,due-giftApplied)*S.ppd*mult);
  if(c){c.points=(c.points||0)-off*S.redeem+earned;
    if(off)DB.redemptions.push({date:todayISO(),clientId:c.id,points:off*S.redeem,value:off})}
  window._coItems=[];window._coGift=null;
  checkAchievements(true);
  closeModal();refreshAll();
  toast(`✓ Completed · ${c?c.name+' earned '+earned+' pts':''}${giftApplied?' · gift card −'+money(giftApplied):''}`);
  setTimeout(()=>{if(confirm('Print receipt for this groom?'))printReceipt(id)},250);
}

/* ---------- Waitlist ---------- */
function renderWaitlist(){
  const el=$('wlList');if(!el)return;
  el.innerHTML=DB.waitlist.length?DB.waitlist.map(w=>{
    const c=getClient(w.clientId);
    return`<div class="wl-row"><div class="avatar" style="width:34px;height:34px;font-size:13px">${initials(c?.name||'?')}</div>
      <div class="info"><b>${esc(c?.name||'Unknown')}</b>${c?.owner?' · '+esc(c.owner):''} · ${esc(svcName(w.serviceId))}${w.staffId?' with '+esc(getStaff(w.staffId)?.name||''):''}
      <div class="d">${esc(w.pref||'Any time')} · added ${fmtDate(w.created)}</div></div>
      <button class="btn btn-primary btn-sm" onclick="bookFromWaitlist('${w.id}')">Book</button>
      <button class="btn btn-danger btn-sm" onclick="removeWaitlist('${w.id}')">✕</button></div>`}).join('')
    :'<div class="empty" style="padding:20px">Waitlist is clear. When a slot is full, add hopefuls here and book them the moment space opens.</div>';
}
function openWaitlistForm(presetClient,presetSvc){
  openModal(`
    <button class="m-close" onclick="closeModal()">×</button>
    <h3>Add to Waitlist</h3><p class="m-sub">They'll sit here until a slot opens — book them with one tap.</p>
    <label>Dog</label><select id="wlClient">${DB.clients.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(c=>`<option value="${c.id}"${presetClient===c.id?' selected':''}>${esc(c.name)} — ${esc(c.owner||'')}</option>`).join('')}</select>
    <label>Service</label><select id="wlSvc">${DB.services.map(s=>`<option value="${s.id}"${presetSvc===s.id?' selected':''}>${esc(s.name)}</option>`).join('')}</select>
    <label>Preferred groomer (optional)</label><select id="wlStaff"><option value="">Anyone available</option>${DB.staff.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select>
    <label>Preferred times / notes</label><input id="wlPref" placeholder="e.g. weekday mornings, Saturdays only">
    <div class="m-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="saveWaitlist()">Add to Waitlist</button></div>`);
}
function saveWaitlist(){
  DB.waitlist.push({id:uid(),clientId:$('wlClient').value,serviceId:$('wlSvc').value,staffId:$('wlStaff').value,pref:$('wlPref').value.trim(),created:todayISO()});
  closeModal();refreshAll();toast('Added to waitlist');
}
function bookFromWaitlist(id){
  const w=DB.waitlist.find(x=>x.id===id);if(!w)return;
  window._wlPending=id;
  openBooking(undefined,undefined,w.clientId);
  setTimeout(()=>{if($('bkService')){$('bkService').value=w.serviceId;bkSyncStaff();if(w.staffId&&$('bkStaff'))$('bkStaff').value=w.staffId}},80);
}
function removeWaitlist(id){DB.waitlist=DB.waitlist.filter(w=>w.id!==id);refreshAll();toast('Removed from waitlist')}
/* ================================================================
   Dashboard / Dogs / Services / Groomers
   ================================================================ */
function renderDashboard(){
  const h=new Date().getHours();
  const greet=h<12?'Good morning':h<17?'Good afternoon':'Good evening';
  const t=todayISO();
  const todays=DB.appointments.filter(a=>a.date===t&&a.status!=='cancelled').sort((a,b)=>a.start.localeCompare(b.start));
  const todayRev=DB.appointments.filter(a=>a.date===t&&a.status==='completed').reduce((s,a)=>s+apptNet(a),0);
  const weekStart=iso(startOfWeek(new Date()));
  const weekRev=DB.appointments.filter(a=>a.status==='completed'&&a.date>=weekStart&&a.date<=t).reduce((s,a)=>s+apptNet(a),0);
  const attn=DB.clients.filter(c=>!hasUpcoming(c)&&['due','overdue','risk'].includes(retStatus(c)));
  const last7=[...Array(7)].map((_,i)=>{const dd=iso(addDays(new Date(),i-6));
    return DB.appointments.filter(a=>a.status==='completed'&&a.date===dd).reduce((s,a)=>s+apptNet(a),0)});
  const upNext=todays.find(a=>a.status==='booked'||a.status==='confirmed');
  const nGrooms=todays.filter(a=>a.status!=='noshow').length;
  $('dashBanner').innerHTML=`<div class="hero">
    <div class="h-eyebrow">${new Date().toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'})}</div>
    <h2>${greet}${DB.settings.name?', '+esc(DB.settings.name.split(' ')[0]):''} 🐾</h2>
    <div class="h-sub">${nGrooms?`You have <b style="color:#fff">${nGrooms} groom${nGrooms!==1?'s':''}</b> on the book today${upNext?` — next up ${esc(getClient(upNext.clientId)?.name||'')} at ${fmtTime(upNext.start)}`:''}.`:'A clear day on the book. A good time to fill it — or rest those hands.'}</div>
    <div class="h-chips">
      <span class="h-chip"><span class="hd" style="background:var(--suds)"></span>Today ${money(todayRev)}</span>
      <span class="h-chip"><span class="hd" style="background:var(--honey)"></span>This week ${money(weekRev)}</span>
      ${attn.length?`<span class="h-chip alert"><span class="hd" style="background:var(--clay)"></span>${attn.length} to rebook</span>`:`<span class="h-chip"><span class="hd" style="background:var(--green)"></span>Radar clear</span>`}
    </div></div>`;
  const ico=(path,bg,col)=>`<span class="kpi-ico" style="background:${bg}"><svg viewBox="0 0 24 24" stroke="${col}">${path}</svg></span>`;
  $('dashStats').innerHTML=`
    <div class="stat-card kpi-link" onclick="showView('calendar')" title="Go to Book" style="cursor:pointer"><div class="kpi-top"><div class="lbl">Today's Grooms</div>${ico('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>','#DCEBE7','#1F6660')}</div><div class="num" id="kpiAppts">0</div><div class="sub">${todays.filter(a=>a.status==='completed').length} done · <span style="color:var(--teal-d);font-size:11px">View book →</span></div></div>
    <div class="stat-card kpi-link" onclick="showView('revenue')" title="Go to Earnings" style="cursor:pointer"><div class="kpi-top"><div class="lbl">Today's Earnings</div>${ico('<path d="M12 2v20M17 6.5c-1-1.5-2.8-2-5-2-2.6 0-4.5 1.2-4.5 3.4 0 4.6 9.8 2.3 9.8 7 0 2.3-2 3.6-5.3 3.6-2.4 0-4.2-.7-5.2-2.2"/>','#FBEED3','#B5891E')}</div><div class="num" id="kpiRev">${getCurrSym()}0</div><div class="sub">this week ${money(weekRev)} · <span style="color:var(--teal-d);font-size:11px">View earnings →</span></div>${miniSpark(last7)}</div>
    <div class="stat-card kpi-link" onclick="showView('alerts')" title="Go to Groom-Due Radar" style="cursor:pointer"><div class="kpi-top"><div class="lbl">Groom-Due</div>${ico('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',attn.length?'#FBE4DB':'#DCEBE7',attn.length?'#CB5A34':'#1F6660')}</div><div class="num" id="kpiAttn" style="color:${attn.length?'var(--clay-d)':'var(--teal-d)'}">0</div><div class="sub">due, overdue or lapsed · <span style="color:var(--teal-d);font-size:11px">Open radar →</span></div></div>
    <div class="stat-card kpi-link" onclick="showView('clients')" title="Go to Dogs" style="cursor:pointer"><div class="kpi-top"><div class="lbl">Dogs on the Book</div>${ico('<ellipse cx="12" cy="16" rx="5.5" ry="4.5"/><ellipse cx="6" cy="9" rx="2" ry="2.6"/><ellipse cx="12" cy="6.5" rx="2.1" ry="2.7"/><ellipse cx="18" cy="9" rx="2" ry="2.6"/>','#DEEAEF','#3E7186')}</div><div class="num" id="kpiClients">0</div><div class="sub">${DB.staff.length} groomer${DB.staff.length!==1?'s':''} · ${DB.services.length} services · <span style="color:var(--teal-d);font-size:11px">View dogs →</span></div></div>`;
  countUp($('kpiAppts'),todays.filter(a=>a.status!=='noshow').length);
  countUp($('kpiRev'),todayRev,v=>money(v));
  countUp($('kpiAttn'),attn.length);
  countUp($('kpiClients'),DB.clients.length);
  $('dashToday').innerHTML=todays.length?todays.map(a=>{const c=getClient(a.clientId);const flag=(c?.behaviorNotes||[]).length;
    return`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--mist);cursor:pointer" onclick="openApptDetail('${a.id}')">
      <span style="width:8px;height:34px;border-radius:4px;background:${chipColor(a)};flex:none"></span>
      <div style="flex:1;min-width:0"><b style="font-size:14px">${fmtTime(a.start)} — ${esc(c?.name||'')}${flag?' ⚠':''}</b>
      <div style="font-size:12px;color:var(--ink-soft)">${esc(svcName(a.serviceId))} · ${esc(getStaff(a.staffId)?.name||'')}</div></div>
      <span class="badge ${ {booked:'blue',confirmed:'green',completed:'grey',noshow:'red'}[a.status]}">${a.status}</span></div>`}).join('')
    :'<div class="empty"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>Nothing booked today. <br><button class="btn btn-primary btn-sm" style="margin-top:8px" onclick="openBooking()">Book a groom</button></div>';
  const low=DB.inventory.filter(i=>i.stock<=i.lowAt);
  const lowHtml=low.length?`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--mist)">
    <div class="avatar" style="width:34px;height:34px;font-size:15px;background:#F7EEDC">📦</div>
    <div style="flex:1"><b style="font-size:13.5px">Low stock</b><div style="font-size:11.5px;color:var(--ink-soft)">${low.map(i=>esc(i.name.split(' ').slice(0,2).join(' '))+' ('+i.stock+')').join(' · ')}</div></div>
    <button class="btn btn-ghost btn-sm" onclick="showView('business')">Restock</button></div>`:'';
  $('dashAlerts').innerHTML=lowHtml+(attn.length?attn.slice(0,6).map(c=>{
    const s=retStatus(c);const due=nextDue(c);
    return`<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--mist)">
      <div class="avatar" style="width:34px;height:34px;font-size:13px">${initials(c.name)}</div>
      <div style="flex:1"><b style="font-size:13.5px">${esc(c.name)}</b><div style="font-size:11.5px;color:var(--ink-soft)">${s==='risk'?'No groom in 3+ months':s==='overdue'?'Overdue '+daysOverdue(c)+'d':'Due '+fmtDate(due)}</div></div>
      <button class="btn btn-teal btn-sm" onclick="openReminder('${c.id}')">Text</button></div>`}).join('')+(attn.length>6?`<p style="font-size:12px;color:var(--ink-soft);margin-top:8px;text-align:center"><a href="#" onclick="showView('alerts');return false" style="color:var(--teal-d)">See all ${attn.length} on the Radar →</a></p>`:'')
    :(low.length?'':'<div class="empty"><svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>Every dog is current. Radar clear.</div>'));
  renderDashInsights();
  updateAlertDot();
}
function renderDashInsights(){
  const t=new Date();const from=iso(new Date(t.getFullYear(),t.getMonth(),1));
  const ins=computeInsights(from,todayISO());
  const proj=monthProjection();
  const rows=[];
  if(ins.busiestDay)rows.push(['📅','Busiest day this month',`<b>${ins.busiestDay}</b><span>plan extra time & stock</span>`]);
  if(ins.peakHour)rows.push(['⏰','Peak booking hour',`<b>${ins.peakHour}</b><span>your golden hour</span>`]);
  if(ins.topService)rows.push(['✨','Top earner',`<b>${esc(ins.topService.name)}</b><span>${money(ins.topService.rev)} this month</span>`]);
  if(ins.topClient?.name)rows.push(['🐕','Top dog',`<b>${esc(ins.topClient.name)}</b><span>${money(ins.topClient.spend)} this month</span>`]);
  if(proj)rows.push(['📈','Month on pace for',`<b>${money(proj)}</b><span>based on your daily average</span>`]);
  $('dashInsights').innerHTML=rows.length?rows.map(([i,l,v])=>`<div class="ins-row"><span class="ii">${i}</span><div style="flex:1"><span>${l}</span>${v}</div></div>`).join('')
    :'<div class="empty">Complete a few grooms and insights will appear here.</div>';
}

/* ---------- Dogs (clients) ---------- */
function renderClients(){
  const q=($('clientSearch').value||'').toLowerCase(),f=$('clientFilter').value;
  const nowM=new Date().getMonth()+1;
  let list=DB.clients.filter(c=>((c.name||'')+(c.owner||'')+(c.phone||'')+(c.email||'')+(c.breed||'')).toLowerCase().includes(q));
  if(f)list=list.filter(c=>{
    const s=retStatus(c);
    if(f==='due')return s==='due';if(f==='overdue')return s==='overdue';if(f==='risk')return s==='risk';
    if(f==='birthday')return c.birthday&&+c.birthday.split('-')[1]===nowM;
    if(f==='rabies')return !!rabiesStatus(c);return true});
  $('clientCount').textContent=`${list.length} of ${DB.clients.length} dogs`;
  const badge={current:['green','Current'],due:['amber','Due soon'],overdue:['red','Overdue'],risk:['red','Lapsed'],new:['grey','New']};
  $('clientGrid').innerHTML=list.length?list.map(c=>{
    const st=retStatus(c);const[cls,lbl]=badge[st];const l=lastCompleted(c);const due=nextDue(c);
    const photo=c.photos.find(p=>p.kind==='after')||c.photos[0];
    const rab=rabiesStatus(c);
    return`<div class="client-card" onclick="openClientDetail('${c.id}')">
      <div class="cc-top"><div class="avatar">${photo?`<img src="${photo.data}" alt="">`:initials(c.name)}</div>
        <div style="min-width:0"><h3>${esc(c.name)}</h3><div class="sub">${esc(c.owner||'')}</div></div>
        <span class="badge ${cls}" style="margin-left:auto">${lbl}</span></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap">
        <span class="size-chip">${esc(c.breed||'Dog')}</span>
        <span class="size-chip">${SIZE_LABEL[c.size]||'—'}</span>
        ${rab?`<span class="size-chip" style="background:#F7E1DB;color:var(--red)">💉 ${rab==='expired'?'Rabies exp.':'Rabies soon'}</span>`:''}</div>
      <div class="cc-meta">
        <span>Last groom: ${l?fmtDate(l.date)+' · '+esc(svcName(l.serviceId)):'—'}</span>
        <span>Next due: ${due?fmtDate(due):'—'} · every ${c.freqWeeks} wks</span></div>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <span class="points-chip">★ ${c.points||0} pts</span>
        <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openBooking(undefined,undefined,'${c.id}')">Book</button></div>
    </div>`}).join(''):'<div class="empty" style="grid-column:1/-1"><svg viewBox="0 0 24 24"><ellipse cx="12" cy="16" rx="5.5" ry="4.5"/><ellipse cx="6" cy="9" rx="2" ry="2.6"/><ellipse cx="12" cy="6.5" rx="2.1" ry="2.7"/><ellipse cx="18" cy="9" rx="2" ry="2.6"/></svg>No dogs match. Add your first dog to get started.</div>';
}

function openClientDetail(id){
  const c=getClient(id);if(!c)return;
  const S=DB.settings;
  const hist=DB.appointments.filter(a=>a.clientId===id).sort((a,b)=>b.date.localeCompare(a.date)||b.start.localeCompare(a.start));
  const l=lastCompleted(c),due=nextDue(c),st=retStatus(c);
  const goal=Math.max(Math.ceil(((c.points||0)+1)/(S.redeem*5))*(S.redeem*5),S.redeem*5);
  const pct=Math.min(100,(c.points||0)/goal*100);
  const rab=rabiesStatus(c);
  const flags=(c.behaviorNotes||[]).length?c.behaviorNotes.map(f=>`<span class="flag">⚠ ${esc(f)}</span>`).join(''):'';
  const before=c.photos.find(p=>p.kind==='before'),after=c.photos.find(p=>p.kind==='after');
  const hasPair=before&&after;
  openModal(`
    <button class="m-close" onclick="closeModal()">×</button>
    <div class="cc-top" style="margin-bottom:6px"><div class="avatar" style="width:56px;height:56px;font-size:22px">${(c.photos[0])?`<img src="${c.photos[0].data}" alt="">`:initials(c.name)}</div>
      <div><h3>${esc(c.name)}</h3><p class="m-sub" style="margin:0">${esc(c.owner||'')} ${c.phone?'· '+esc(c.phone):''}${c.email?'<br>'+esc(c.email):''}</p></div></div>
    <div style="display:flex;gap:7px;flex-wrap:wrap;margin:8px 0">
      <span class="badge ${ {current:'green',due:'amber',overdue:'red',risk:'red',new:'grey'}[st]}">${st==='risk'?'Lapsed':st==='overdue'?'Overdue '+daysOverdue(c)+'d':st}</span>
      <span class="badge clay">Every ${c.freqWeeks} wks</span>
      <span class="badge grey">Groomer: ${esc(getStaff(c.staffId)?.name||'anyone')}</span>
      ${c.birthday?`<span class="badge grey">🎂 ${c.birthday.slice(5)}</span>`:''}
      ${rab?`<span class="badge red">💉 Rabies ${rab==='expired'?'expired '+esc(fmtDate(c.rabiesExpiry)):'due '+esc(fmtDate(c.rabiesExpiry))}</span>`:''}</div>

    <!-- Coat Card -->
    <div class="coat-card">
      <div style="font-family:var(--font-display);font-size:15px;font-weight:600">✂️ Coat Card</div>
      <div class="coat-grid">
        <div class="coat-cell"><div class="k">Breed</div><div class="v">${esc(c.breed||'—')}</div></div>
        <div class="coat-cell"><div class="k">Size</div><div class="v">${SIZE_LABEL[c.size]||'—'}${c.weight?' · '+esc(c.weight):''}</div></div>
        <div class="coat-cell" style="grid-column:span 2"><div class="k">Coat</div><div class="v">${esc(c.coat||'—')}</div></div>
        <div class="coat-cell" style="grid-column:1/-1"><div class="k">Last cut — blades / style</div><div class="v">${esc(c.lastCut||'—')}</div></div>
        ${c.sensitivities?`<div class="coat-cell" style="grid-column:1/-1"><div class="k">Sensitivities</div><div class="v" style="color:var(--red)">🧴 ${esc(c.sensitivities)}</div></div>`:''}
      </div>
      ${flags?`<div class="flag-list">${flags}</div>`:''}
    </div>
    ${hasPair?`<div style="margin-bottom:10px"><button class="btn btn-ghost btn-sm" onclick="openCompareFor('${c.id}')">⟺ Before / After slider</button></div>`:''}

    <div class="card" style="padding:12px 14px;margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:700"><span>★ ${c.points||0} points</span><span style="color:var(--ink-soft)">need ${goal} for ${money(goal/S.redeem)} off</span></div>
      <div class="progress" style="margin-top:6px"><i style="width:${pct}%"></i></div></div>
    <p style="font-size:12.5px;color:var(--ink-soft);margin-bottom:4px">Last groom ${l?fmtDate(l.date):'—'} · Next due ${due?fmtDate(due):'—'}</p>
    <h3 style="font-size:18px;margin:10px 0 4px">Groom History</h3>
    <div style="max-height:180px;overflow:auto;background:var(--paper);border-radius:9px">
    <table>${hist.length?hist.map(a=>`<tr class="row-click" onclick="openApptDetail('${a.id}')">
      <td>${fmtDate(a.date)}</td><td>${esc(svcName(a.serviceId))}</td><td>${esc(getStaff(a.staffId)?.name||'')}</td>
      <td><span class="badge ${ {completed:'green',booked:'blue',confirmed:'blue',cancelled:'red',noshow:'red'}[a.status]}">${a.status}</span></td>
      <td class="num-cell">${money(a.price+(a.retail||0))}</td></tr>`).join(''):'<tr><td class="empty">No grooms yet</td></tr>'}</table></div>
    ${c.photos.length?`<h3 style="font-size:18px;margin:12px 0 6px">Photos</h3><div class="gal-grid" style="grid-template-columns:repeat(auto-fill,minmax(90px,1fr))">${c.photos.map((p,i)=>`<div class="gal-item"><img src="${p.data}" alt=""><div class="gi-meta">${p.kind||''} ${esc(svcName(p.serviceId)||'')}</div></div>`).join('')}</div>`:''}
    <div class="m-actions" style="justify-content:flex-start">
      <button class="btn btn-primary btn-sm" onclick="closeModal();openBooking(undefined,undefined,'${c.id}')">Book Groom</button>
      <button class="btn btn-ghost btn-sm" onclick="openClientForm('${c.id}')">Edit Profile</button>
      <button class="btn btn-ghost btn-sm" onclick="printGroomSheet('${c.id}')">🖨 Groom Sheet</button>
      <button class="btn btn-ghost btn-sm" onclick="openPhotoForm('${c.id}')">+ Photo</button>
      <button class="btn btn-teal btn-sm" onclick="openReminder('${c.id}')">Text Reminder</button>
      <button class="btn btn-danger btn-sm" onclick="deleteClient('${c.id}')">Delete</button></div>`,true);
}
function openClientForm(id){
  const c=id?getClient(id):{};
  const staffOpts=DB.staff.map(s=>`<option value="${s.id}"${c.staffId===s.id?' selected':''}>${esc(s.name)}</option>`).join('');
  const svcOpts=DB.services.map(s=>`<option value="${s.id}"${c.fav===s.id?' selected':''}>${esc(s.name)}</option>`).join('');
  const sizeOpts=SIZES.map(s=>`<option value="${s}"${(c.size||'medium')===s?' selected':''}>${SIZE_LABEL[s]}</option>`).join('');
  const behFlags=['Nervous at the dryer','Snappy at feet','Muzzle for nails','Wriggly — go slow on face','Ticklish feet','Vocal in the bath','Skin folds need drying','Do not shave'];
  const cur=c.behaviorNotes||[];
  openModal(`
    <button class="m-close" onclick="closeModal()">×</button>
    <h3>${id?'Edit':'New'} Dog</h3>
    <div class="form-row">
      <div><label>Dog's name *</label><input id="cfName" value="${esc(c.name||'')}"></div>
      <div><label>Owner name</label><input id="cfOwner" value="${esc(c.owner||'')}"></div>
      <div><label>Phone</label><input id="cfPhone" value="${esc(c.phone||'')}"></div>
      <div><label>Email</label><input id="cfEmail" value="${esc(c.email||'')}"></div>
      <div><label>Breed</label><input id="cfBreed" value="${esc(c.breed||'')}" placeholder="Cockapoo"></div>
      <div><label>Size</label><select id="cfSize">${sizeOpts}</select></div>
      <div><label>Weight (optional)</label><input id="cfWeight" value="${esc(c.weight||'')}" placeholder="12 kg"></div>
      <div><label>Dog's birthday</label><input type="date" id="cfBday" value="${c.birthday||''}"></div>
    </div>
    <label>Address <span style="font-weight:400;color:var(--ink-soft)">(for mobile / van day-sheet)</span></label><input id="cfAddr" value="${esc(c.address||'')}">
    <div class="form-row">
      <div><label>Coat type</label><input id="cfCoat" value="${esc(c.coat||'')}" placeholder="Curly, prone to matting"></div>
      <div><label>Sensitivities / allergies</label><input id="cfSens" value="${esc(c.sensitivities||'')}" placeholder="Oatmeal shampoo only"></div>
    </div>
    <label>Last cut — blades, guards & style</label><input id="cfLast" value="${esc(c.lastCut||'')}" placeholder="#4F body, scissored face, 1/2 inch legs">
    <label>Behavior flags</label>
    <div class="checks">${behFlags.map(f=>`<label><input type="checkbox" class="cfBeh" value="${esc(f)}"${cur.includes(f)?' checked':''}>${esc(f)}</label>`).join('')}</div>
    <div class="form-row">
      <div><label>Groom cycle (weeks)</label><input type="number" id="cfFreq" value="${c.freqWeeks||6}" min="1" max="52"></div>
      <div><label>Preferred groomer</label><select id="cfStaff">${staffOpts}</select></div>
      <div><label>Usual service</label><select id="cfFav">${svcOpts}</select></div>
      <div><label>Rabies expiry (optional)</label><input type="date" id="cfRabies" value="${c.rabiesExpiry||''}"></div>
    </div>
    <div class="m-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="saveClient('${id||''}')">Save Dog</button></div>`,true);
}
function saveClient(id){
  const name=$('cfName').value.trim();if(!name){toast('Dog name required');return}
  const data={name,owner:$('cfOwner').value.trim(),phone:$('cfPhone').value.trim(),email:$('cfEmail').value.trim(),birthday:$('cfBday').value,
    address:$('cfAddr').value.trim(),breed:$('cfBreed').value.trim(),size:$('cfSize').value,weight:$('cfWeight').value.trim(),
    coat:$('cfCoat').value.trim(),sensitivities:$('cfSens').value.trim(),lastCut:$('cfLast').value.trim(),
    behaviorNotes:[...document.querySelectorAll('.cfBeh:checked')].map(c=>c.value),
    rabiesExpiry:$('cfRabies').value,
    freqWeeks:Math.max(1,+$('cfFreq').value||6),staffId:$('cfStaff').value,fav:$('cfFav').value};
  if(id)Object.assign(getClient(id),data);
  else DB.clients.push(Object.assign({id:uid(),points:0,photos:[],createdAt:todayISO()},data));
  closeModal();refreshAll();toast('Dog saved');
}
function deleteClient(id){
  if(!confirm('Delete this dog and its groom history? This cannot be undone.'))return;
  DB.clients=DB.clients.filter(c=>c.id!==id);
  DB.appointments=DB.appointments.filter(a=>a.clientId!==id);
  DB.waitlist=DB.waitlist.filter(w=>w.clientId!==id);
  closeModal();refreshAll();toast('Dog deleted');
}

/* ---------- Services ---------- */
function renderServices(){
  const byCat={};DB.services.forEach(s=>(byCat[s.category]=byCat[s.category]||[]).push(s));
  const order=CATEGORIES.filter(c=>byCat[c]);
  $('serviceList').innerHTML=order.map(cat=>`
    <div class="card" style="margin-bottom:12px">
      <h3 style="font-size:19px;margin-bottom:6px"><span class="sw" style="display:inline-block;width:11px;height:11px;border-radius:4px;background:${SVC_COLORS[cat]};margin-right:7px"></span>${CAT_LABEL[cat]||cat}</h3>
      <table><tr><th>Service</th><th>Duration</th><th>Buffer</th><th>Groomers</th><th class="num-cell">Price</th><th></th></tr>
      ${byCat[cat].map(s=>`<tr><td data-th="Service"><b>${esc(s.name)}</b></td><td data-th="Duration">${s.duration} min</td><td data-th="Buffer">${s.buffer?'+'+s.buffer+'m':'—'}</td>
        <td data-th="Groomers" style="font-size:12px">${s.staffIds.map(i=>esc(getStaff(i)?.name.split(' ')[0]||'')).join(', ')||'—'}</td>
        <td class="num-cell" data-th="Price">${money(s.price)}</td>
        <td class="act-corner" style="white-space:nowrap"><button class="btn btn-ghost btn-sm" onclick="openServiceForm('${s.id}')">Edit</button> <button class="btn btn-danger btn-sm" onclick="deleteService('${s.id}')" aria-label="Delete service">✕</button></td></tr>`).join('')}
      </table></div>`).join('')||'<div class="empty">No services yet. Add your first service.</div>';
  $('packageList').innerHTML=DB.packages.length?DB.packages.map(p=>{
    const items=p.serviceIds.map(id=>DB.services.find(s=>s.id===id)).filter(Boolean);
    const full=items.reduce((s,x)=>s+x.price,0);
    return`<div class="card"><h3 style="font-size:19px">📦 ${esc(p.name)}</h3>
      <p style="font-size:12.5px;color:var(--ink-soft);margin:4px 0 8px">${items.map(i=>esc(i.name)).join(' + ')}</p>
      <div style="display:flex;align-items:baseline;gap:8px"><b style="font-family:var(--font-display);font-size:24px">${money(p.price)}</b>
      ${full>p.price?`<s style="color:var(--ink-soft);font-size:13px">${money(full)}</s><span class="badge green">save ${money(full-p.price)}</span>`:''}</div>
      <div class="m-actions" style="justify-content:flex-start;margin-top:10px"><button class="btn btn-ghost btn-sm" onclick="openPackageForm('${p.id}')">Edit</button><button class="btn btn-danger btn-sm" onclick="delPackage('${p.id}')">Delete</button></div></div>`}).join('')
    :'<div class="empty" style="grid-column:1/-1">No packages yet — bundle services at a special price.</div>';
}
function delPackage(id){DB.packages=DB.packages.filter(x=>x.id!==id);refreshAll();toast('Package deleted')}
function openServiceForm(id){
  const s=id?DB.services.find(x=>x.id===id):{staffIds:[]};
  openModal(`
    <button class="m-close" onclick="closeModal()">×</button>
    <h3>${id?'Edit':'New'} Service</h3>
    <label>Service name *</label><input id="sfName" value="${esc(s.name||'')}" placeholder="Full Groom — Medium">
    <div class="form-row">
      <div><label>Type</label><select id="sfCat">${CATEGORIES.map(c=>`<option value="${c}"${s.category===c?' selected':''}>${CAT_LABEL[c]}</option>`).join('')}</select></div>
      <div><label>Price</label><input type="number" id="sfPrice" value="${s.price??50}" min="0" step="0.01"></div>
      <div><label>Duration (min)</label><select id="sfDur">${[10,15,30,40,45,60,75,90,105,120,150,180].map(m=>`<option value="${m}"${s.duration===m?' selected':''}>${m<60?m+' min':(Math.floor(m/60))+' hr'+(m%60?' '+(m%60)+'m':'')}</option>`).join('')}</select></div>
      <div><label>Cleanup buffer after (min)</label><select id="sfBuf">${[0,5,10,15,20,30].map(m=>`<option value="${m}"${s.buffer===m?' selected':''}>${m?m+' min':'None'}</option>`).join('')}</select></div>
    </div>
    <label>Which groomers can do this?</label>
    <div class="checks">${DB.staff.map(st=>`<label><input type="checkbox" class="sfStaff" value="${st.id}"${s.staffIds?.includes(st.id)?' checked':''}>${esc(st.name)}</label>`).join('')}</div>
    <div class="m-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="saveService('${id||''}')">Save Service</button></div>`);
}
function saveService(id){
  const name=$('sfName').value.trim();if(!name){toast('Name required');return}
  const data={name,category:$('sfCat').value,price:+$('sfPrice').value||0,duration:+$('sfDur').value,
    buffer:+$('sfBuf').value,staffIds:[...document.querySelectorAll('.sfStaff:checked')].map(c=>c.value)};
  if(id)Object.assign(DB.services.find(x=>x.id===id),data);
  else DB.services.push(Object.assign({id:uid()},data));
  DB.staff.forEach(st=>st.services=DB.services.filter(v=>v.staffIds.includes(st.id)).map(v=>v.id));
  closeModal();refreshAll();toast('Service saved');
}
function deleteService(id){if(!confirm('Delete this service?'))return;
  DB.services=DB.services.filter(s=>s.id!==id);
  DB.packages.forEach(p=>p.serviceIds=p.serviceIds.filter(x=>x!==id));
  const dropped=DB.packages.filter(p=>p.serviceIds.length<2).length;
  DB.packages=DB.packages.filter(p=>p.serviceIds.length>=2);
  DB.staff.forEach(st=>st.services=st.services.filter(x=>x!==id));
  refreshAll();if(dropped)toast('Service deleted · '+dropped+' package(s) removed (fewer than 2 services left)')}
function openPackageForm(id){
  const p=id?DB.packages.find(x=>x.id===id):{serviceIds:[]};
  openModal(`
    <button class="m-close" onclick="closeModal()">×</button>
    <h3>${id?'Edit':'New'} Package</h3>
    <label>Package name *</label><input id="pfName" value="${esc(p.name||'')}" placeholder="The Spa Day">
    <label>Included services</label>
    <div class="checks">${DB.services.map(s=>`<label><input type="checkbox" class="pfSvc" value="${s.id}"${p.serviceIds?.includes(s.id)?' checked':''}>${esc(s.name)}</label>`).join('')}</div>
    <label>Bundle price</label><input type="number" id="pfPrice" value="${p.price??100}" min="0" step="0.01">
    <div class="m-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="savePackage('${id||''}')">Save Package</button></div>`);
}
function savePackage(id){
  const name=$('pfName').value.trim();if(!name){toast('Name required');return}
  const ids=[...document.querySelectorAll('.pfSvc:checked')].map(c=>c.value);
  if(ids.length<2){toast('Pick at least 2 services');return}
  const dur=ids.reduce((s,i)=>s+(DB.services.find(x=>x.id===i)?.duration||0),0);
  const data={name,serviceIds:ids,price:+$('pfPrice').value||0,duration:dur};
  if(id)Object.assign(DB.packages.find(x=>x.id===id),data);
  else DB.packages.push(Object.assign({id:uid()},data));
  closeModal();refreshAll();toast('Package saved');
}

/* ---------- Groomers (staff) ---------- */
const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function staffMonthStats(id){
  const from=iso(new Date(new Date().getFullYear(),new Date().getMonth(),1));
  const done=DB.appointments.filter(a=>a.staffId===id&&a.status==='completed'&&a.date>=from);
  const rev=done.reduce((s,a)=>s+apptNet(a),0);
  return{count:done.length,rev};
}
function renderStaff(){
  $('staffGrid').innerHTML=DB.staff.map(st=>{
    const m=staffMonthStats(st.id);
    const pay=st.commission?m.rev*st.commission/100:(+st.salary||0);
    const availStr=[1,2,3,4,5,6,0].map(d=>{const a=st.avail[d];return`<span style="opacity:${a?1:.35}">${DAYS[d]} ${a?a[0]+'–'+a[1]:'off'}</span>`}).join(' · ');
    return`<div class="card">
      <div class="cc-top"><div class="avatar" style="background:${st.color};color:#fff">${initials(st.name)}</div>
        <div><h3 style="font-size:20px">${esc(st.name)}</h3><div class="sub">${esc(st.role||'')}</div></div></div>
      <p style="font-size:12px;color:var(--ink-soft);margin:8px 0">${availStr}</p>
      <p style="font-size:12.5px;margin-bottom:8px">Services: ${st.services.map(i=>esc(DB.services.find(s=>s.id===i)?.name.split('—')[0].trim()||'')).filter(Boolean).slice(0,6).join(', ')||'none assigned'}</p>
      <div style="display:flex;gap:16px;flex-wrap:wrap;background:var(--mist);border-radius:10px;padding:10px 14px;font-size:13px">
        <span><b style="font-family:var(--font-display);font-size:19px">${m.count}</b><br><span style="font-size:11px;color:var(--ink-soft)">GROOMS THIS MO</span></span>
        <span><b style="font-family:var(--font-display);font-size:19px">${money(m.rev)}</b><br><span style="font-size:11px;color:var(--ink-soft)">REVENUE</span></span>
        <span><b style="font-family:var(--font-display);font-size:19px">${money(pay)}</b><br><span style="font-size:11px;color:var(--ink-soft)">${st.commission?st.commission+'% COMMISSION':'MONTHLY PAY'}</span></span></div>
      <div class="m-actions" style="justify-content:flex-start;margin-top:10px">
        <button class="btn btn-ghost btn-sm" onclick="printCommission('${st.id}')">🖨 Pay Report</button>
        <button class="btn btn-ghost btn-sm" onclick="openStaffForm('${st.id}')">Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteStaff('${st.id}')">Remove</button></div></div>`;
  }).join('')||'<div class="empty" style="grid-column:1/-1">Add yourself (and any team) to start booking.</div>';
}
function openStaffForm(id){
  const st=id?getStaff(id):{avail:{1:[8,17],2:[8,17],3:[8,17],4:[8,17],5:[8,17],6:null,0:null}};
  const hourOpts=sel=>Array.from({length:18},(_,i)=>i+5).map(h=>`<option value="${h}"${sel===h?' selected':''}>${h>12?h-12+' PM':h===12?'12 PM':h+' AM'}</option>`).join('');
  const rows=[1,2,3,4,5,6,0].map(d=>{const a=st.avail[d];
    return`<div style="display:grid;grid-template-columns:66px auto 1fr 1fr;gap:8px;align-items:center;margin:4px 0">
      <b style="font-size:13px">${DAYS[d]}</b>
      <label style="margin:0;display:inline-flex;gap:5px;align-items:center;font-size:12px"><input type="checkbox" id="avOn${d}" ${a?'checked':''} style="width:auto;accent-color:var(--teal-d)">works</label>
      <select id="avS${d}">${hourOpts(a?a[0]:8)}</select><select id="avE${d}">${hourOpts(a?a[1]:17)}</select></div>`}).join('');
  openModal(`
    <button class="m-close" onclick="closeModal()">×</button>
    <h3>${id?'Edit':'New'} Groomer</h3>
    <div class="form-row">
      <div><label>Name *</label><input id="stName" value="${esc(st.name||'')}"></div>
      <div><label>Role</label><input id="stRole" value="${esc(st.role||'')}" placeholder="Lead Groomer"></div>
      <div><label>Commission % (0 = fixed pay)</label><input type="number" id="stComm" value="${st.commission??0}" min="0" max="100"></div>
      <div><label>Monthly pay (if no commission)</label><input type="number" id="stSalary" value="${st.salary??0}" min="0"></div>
    </div>
    <label>Weekly availability</label>${rows}
    <div class="m-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="saveStaff('${id||''}')">Save Groomer</button></div>`);
}
function saveStaff(id){
  const name=$('stName').value.trim();if(!name){toast('Name required');return}
  const avail={};[0,1,2,3,4,5,6].forEach(d=>{avail[d]=$('avOn'+d).checked?[+$('avS'+d).value,+$('avE'+d).value]:null});
  const data={name,role:$('stRole').value.trim(),commission:+$('stComm').value||0,salary:+$('stSalary').value||0,avail};
  if(id)Object.assign(getStaff(id),data);
  else DB.staff.push(Object.assign({id:uid(),services:[],color:STAFF_COLORS[DB.staff.length%STAFF_COLORS.length]},data));
  closeModal();refreshAll();toast('Groomer saved');
}
function deleteStaff(id){
  if(DB.appointments.some(a=>a.staffId===id&&a.date>=todayISO()&&(a.status==='booked'||a.status==='confirmed'))){
    if(!confirm('This groomer has upcoming grooms. Remove anyway? (Grooms stay but show no groomer.)'))return;
  }else if(!confirm('Remove this groomer?'))return;
  DB.staff=DB.staff.filter(s=>s.id!==id);
  DB.services.forEach(s=>s.staffIds=s.staffIds.filter(x=>x!==id));
  refreshAll();toast('Groomer removed');
}
/* ================================================================
   Groom-Due Radar / Loyalty / Earnings / Business
   ================================================================ */
let retTab='due';
function setRetTab(t){retTab=t;document.querySelectorAll('[data-rtab]').forEach(b=>b.classList.toggle('active',b.dataset.rtab===t));renderRetention()}
function radarColor(st){return st==='overdue'?'var(--red)':st==='risk'?'#8B6D9C':'var(--amber)'}
function renderRetention(){
  // Radar stat cards
  const groups={due:[],overdue:[],risk:[]};
  DB.clients.forEach(c=>{if(hasUpcoming(c))return;const s=retStatus(c);if(groups[s])groups[s].push(c)});
  const bookedAhead=DB.clients.filter(c=>hasUpcoming(c)).length;
  $('radarStats').innerHTML=`
    <div class="stat-card"><div class="lbl">Due Soon</div><div class="num" style="color:var(--amber)">${groups.due.length}</div><div class="sub">within 7 days of their cycle</div></div>
    <div class="stat-card"><div class="lbl">Overdue</div><div class="num" style="color:var(--red)">${groups.overdue.length}</div><div class="sub">past their groom cycle</div></div>
    <div class="stat-card"><div class="lbl">Lapsed</div><div class="num" style="color:#8B6D9C">${groups.risk.length}</div><div class="sub">no groom in 3+ months</div></div>
    <div class="stat-card"><div class="lbl">Already Rebooked</div><div class="num" style="color:var(--teal-d)">${bookedAhead}</div><div class="sub">have an upcoming groom</div></div>`;
  // list for active tab, sorted by most overdue first
  const list=groups[retTab].slice().sort((a,b)=>{
    if(retTab==='risk')return (lastCompleted(a)?.date||'').localeCompare(lastCompleted(b)?.date||'');
    return daysOverdue(b)-daysOverdue(a);
  });
  $('retList').innerHTML=(list.length?list.map(c=>{
    const l=lastCompleted(c),due=nextDue(c);
    const svc=l?svcName(l.serviceId):'';
    const st=retStatus(c);
    const ring=st==='overdue'?`${daysOverdue(c)}<small>days over</small>`
      :st==='risk'?(l?`${Math.round(daysBetween(l.date,todayISO())/30)}<small>mo ago</small>`:`—`)
      :`${Math.max(0,daysBetween(todayISO(),due))}<small>days</small>`;
    return`<div class="alert-card">
      <div class="radar-ring" style="background:${radarColor(st)}">${ring}</div>
      <div class="info"><b>${esc(c.name)}</b> <span style="color:var(--ink-soft);font-size:12.5px">· ${esc(c.owner||'')}</span>
        <div class="d">${esc(c.breed||'Dog')} · every ${c.freqWeeks} wks · Last: ${l?esc(svc)+' · '+fmtDate(l.date):'never'} · ${retTab==='risk'?'<span style="color:#8B6D9C">lapsed 3+ months</span>':(retTab==='overdue'?'was due '+fmtDate(due):'due '+fmtDate(due))}</div></div>
      <button class="btn btn-teal btn-sm" onclick="openReminder('${c.id}')">📱 Text</button>
      <button class="btn btn-primary btn-sm" onclick="openBooking(undefined,undefined,'${c.id}')">Book In</button></div>`}).join('')
    :`<div class="empty"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/></svg>No ${retTab==='due'?'dogs due soon':retTab==='overdue'?'overdue dogs':'lapsed dogs'} without a booking. Radar clear.</div>`);
}
function reminderTemplates(c){
  const S=DB.settings;const l=lastCompleted(c);const svc=l?svcName(l.serviceId):'a groom';
  const groomer=getStaff(c.staffId)?.name.split(' ')[0]||'we';
  const dog=c.name;const owner=(c.owner||'').split(' ')[0]||'there';
  const phone=S.phone||'';
  const svcLower=svc.toLowerCase();
  return{
    sms:`Hi ${owner}! It's ${S.name} 🐾 ${dog} is due for their ${svcLower} — it's been a little while! ${groomer==='we'?'We have':groomer+' has'} openings this week and we'd love to see ${dog}. Reply${phone?' or call '+phone:''} to book. ${dog} has ${c.points||0} loyalty points saved up too!`,
    email:`Subject: ${dog} is due for a groom at ${S.name}!\n\nHi ${owner},\n\nIt's been a little while since ${dog}'s last ${svcLower}, and they're due for their next appointment. We'd love to get ${dog} back on the table looking (and smelling) their best.\n\n🐾 A little nudge: ${dog} has ${c.points||0} loyalty points — that's ${money((c.points||0)/S.redeem)} off your next visit.\n\nBook a time before the week fills up. Just reply to this email${phone?' or call us at '+phone:''}.\n\nWarm wags,\nThe ${S.name} team`};
}
function openReminder(id){
  const c=getClient(id);const t=reminderTemplates(c);
  openModal(`
    <button class="m-close" onclick="closeModal()">×</button>
    <h3>Rebook ${esc(c.name)}</h3>
    <p class="m-sub">Copy the message, paste it into your texting or email app, and send. ${c.phone?'📱 '+esc(c.phone):''} ${c.email?' · ✉ '+esc(c.email):''}</p>
    <label>Text message (SMS)</label><div class="tmpl-box" id="tmplSms">${esc(t.sms)}</div>
    <button class="btn btn-ghost btn-sm" style="margin-top:6px" onclick="copyText('tmplSms')">📋 Copy Text</button>
    <label style="margin-top:14px">Email</label><div class="tmpl-box" id="tmplEmail">${esc(t.email)}</div>
    <button class="btn btn-ghost btn-sm" style="margin-top:6px" onclick="copyText('tmplEmail')">📋 Copy Email</button>
    <div class="m-actions"><button class="btn btn-primary" onclick="closeModal();openBooking(undefined,undefined,'${c.id}')">Book Them In</button></div>`);
}
function copyText(elId){
  const txt=$(elId).textContent;
  const done=()=>toast('Copied — paste into your messaging app');
  if(navigator.clipboard?.writeText)navigator.clipboard.writeText(txt).then(done,()=>fallbackCopy(txt,done));
  else fallbackCopy(txt,done);
}
function fallbackCopy(txt,done){const ta=document.createElement('textarea');ta.value=txt;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done()}catch(e){toast('Select and copy manually')}ta.remove()}
function printRadar(){
  const S=DB.settings;
  const rows=[];
  DB.clients.forEach(c=>{if(hasUpcoming(c))return;const s=retStatus(c);if(['due','overdue','risk'].includes(s))rows.push({c,s})});
  rows.sort((a,b)=>{const rank={overdue:0,due:1,risk:2};return rank[a.s]-rank[b.s]||daysOverdue(b.c)-daysOverdue(a.c)});
  printHTML(`<div style="max-width:680px;margin:0 auto">
    <div class="pr-brand">${esc(S.name)}</div><div class="pr-sub">Rebooking Call List · ${fmtDateLong(todayISO())}</div>
    ${rows.length?`<table class="pr-t"><tr><th>Status</th><th>Dog</th><th>Owner</th><th>Phone</th><th>Last groom</th><th>Service</th></tr>
    ${rows.map(({c,s})=>{const l=lastCompleted(c);return`<tr><td>${s==='overdue'?'<b class="pr-warn">Overdue '+daysOverdue(c)+'d</b>':s==='due'?'Due '+fmtDate(nextDue(c)):'Lapsed'}</td><td><b>${esc(c.name)}</b> · ${esc(c.breed||'')}</td><td>${esc(c.owner||'')}</td><td>${esc(c.phone||'')}</td><td>${l?fmtDate(l.date):'never'}</td><td>${esc(l?svcName(l.serviceId):c.fav?svcName(c.fav):'')}</td></tr>`}).join('')}</table>`
    :'<p>Radar clear — every dog is current or already rebooked. 🐾</p>'}
    <div class="pr-note">${rows.length} dog(s) to call · printed ${new Date().toLocaleString()} · PawBook Pro</div></div>`);
}

/* ---------- Loyalty ---------- */
function renderLoyalty(){
  const S=DB.settings;
  $('loyaltyRuleLine').textContent=`$1 spent = ${S.ppd} pt · ${S.redeem} pts = $1 off · birthday month ×${S.bday}`;
  const totalPts=DB.clients.reduce((s,c)=>s+(c.points||0),0);
  const redeemedPts=DB.redemptions.reduce((s,r)=>s+r.points,0);
  const bdayNow=DB.clients.filter(c=>c.birthday&&+c.birthday.split('-')[1]===new Date().getMonth()+1);
  $('loyaltyStats').innerHTML=`
    <div class="stat-card"><div class="lbl">Points Outstanding</div><div class="num">${totalPts.toLocaleString()}</div><div class="sub">≈ ${money(totalPts/S.redeem)} in rewards</div></div>
    <div class="stat-card"><div class="lbl">Points Redeemed</div><div class="num">${redeemedPts.toLocaleString()}</div><div class="sub">${money(DB.redemptions.reduce((s,r)=>s+r.value,0))} given back</div></div>
    <div class="stat-card"><div class="lbl">Members</div><div class="num">${DB.clients.length}</div><div class="sub">every dog earns automatically</div></div>
    <div class="stat-card"><div class="lbl">🎂 Birthday Month</div><div class="num">${bdayNow.length}</div><div class="sub">earning ×${S.bday} points now</div></div>`;
  const rows=DB.clients.slice().sort((a,b)=>(b.points||0)-(a.points||0));
  $('loyaltyTable').innerHTML=`<table><tr><th>Dog</th><th>Points</th><th>Progress to next reward</th><th class="num-cell">Worth</th><th></th></tr>${
    rows.map(c=>{
      const goal=Math.max(Math.ceil(((c.points||0)+1)/(S.redeem*5))*(S.redeem*5),S.redeem*5);
      const pct=Math.min(100,(c.points||0)/goal*100);
      const bday=c.birthday&&+c.birthday.split('-')[1]===new Date().getMonth()+1;
      return`<tr><td data-th="Dog"><b>${esc(c.name)}</b>${bday?' 🎂':''} <span style="color:var(--ink-soft);font-size:12px">${esc(c.owner||'')}</span></td><td data-th="Points">★ ${c.points||0}</td>
        <td data-th="Progress" style="min-width:150px"><div class="progress"><i style="width:${pct}%"></i></div><span style="font-size:11px;color:var(--ink-soft)">${c.points||0} / ${goal} for ${money(goal/S.redeem)} off</span></td>
        <td class="num-cell" data-th="Worth">${money((c.points||0)/S.redeem)}</td>
        <td class="act-corner" style="text-align:right"><button class="btn btn-ghost btn-sm" onclick="openClientDetail('${c.id}')">View</button></td></tr>`}).join('')}</table>`;
}

/* ---------- Earnings (revenue) ---------- */
let revPeriod='month';
let revStatsAnimated=false;
function setRevPeriod(p){revPeriod=p;document.querySelectorAll('[data-rev]').forEach(b=>b.classList.toggle('active',b.dataset.rev===p));const pb=$('revPrintBtn');if(pb)pb.textContent='🖨 '+(p==='day'?'Day':p==='week'?'Week':'Monthly')+' Report';renderRevenue();}
function printRevReport(){if(revPeriod==='month')printMonthlyReport();else printRevRangePeriod();}
function printRevRangePeriod(){
  const [from,to]=revRange();
  const done=DB.appointments.filter(a=>a.status==='completed'&&a.date>=from&&a.date<=to);
  const total=done.reduce((s,a)=>s+(a.price||0)+(a.retail||0),0);
  const label=revPeriod==='day'?'Daily':revPeriod==='week'?'Weekly':'Period';
  const S=DB.settings;
  const rows=done.map(a=>`<tr><td>${fmtDate(a.date)}</td><td>${esc(getClient(a.clientId)?.name||'—')}</td><td>${esc(svcName(a.serviceId))}</td><td>${esc(getStaff(a.staffId)?.name||'—')}</td><td style="text-align:right">${money(a.price+(a.retail||0))}</td></tr>`).join('');
  printHTML(`<h2 class="pr-h">${esc(S.name)} — ${label} Earnings</h2><p>${from===to?fmtDate(from):fmtDate(from)+' – '+fmtDate(to)}</p>
  <table class="pr-t" style="width:100%">
  <thead><tr><th>Date</th><th>Dog</th><th>Service</th><th>Groomer</th><th>Amount</th></tr></thead>
  <tbody>${rows||'<tr><td colspan="5">No completed grooms</td></tr>'}</tbody>
  <tfoot><tr><td colspan="4"><b>Total</b></td><td style="text-align:right"><b>${money(total)}</b></td></tr></tfoot></table>`);
}
function revRange(){
  const t=new Date();
  if(revPeriod==='day')return[todayISO(),todayISO()];
  if(revPeriod==='week')return[iso(startOfWeek(t)),iso(addDays(startOfWeek(t),6))];
  return[iso(new Date(t.getFullYear(),t.getMonth(),1)),iso(new Date(t.getFullYear(),t.getMonth()+1,0))];
}
function renderRevenue(){
  const[from,to]=revRange();
  const done=DB.appointments.filter(a=>a.status==='completed'&&a.date>=from&&a.date<=to);
  const total=done.reduce((s,a)=>s+apptNet(a),0);
  const svcRev=done.reduce((s,a)=>s+a.price,0), retailRev=done.reduce((s,a)=>s+(a.retail||0),0);
  const avg=done.length?total/done.length:0;
  const span=daysBetween(from,to)+1;
  const pFrom=iso(addDays(parseISO(from),-span)),pTo=iso(addDays(parseISO(to),-span));
  const prev=DB.appointments.filter(a=>a.status==='completed'&&a.date>=pFrom&&a.date<=pTo);
  const pTotal=prev.reduce((s,a)=>s+apptNet(a),0);
  const delta=(cur,pv)=>{if(!pv)return'';const pct=Math.round((cur-pv)/pv*100);if(!pct)return'';
    return`<span class="delta ${pct>0?'up':'down'}" title="vs previous ${revPeriod}">${pct>0?'▲':'▼'} ${Math.abs(pct)}%</span>`};
  let newCnt=0,repCnt=0;
  done.forEach(a=>{const prior=DB.appointments.some(b=>b.clientId===a.clientId&&b.status==='completed'&&(b.date<a.date||(b.date===a.date&&b.start<a.start)));prior?repCnt++:newCnt++});
  const revNoAnim=revStatsAnimated?'animation:none;':'';
  $('revStats').innerHTML=`
    <div class="stat-card" style="${revNoAnim}"><div class="lbl">${revPeriod==='day'?"Today's":revPeriod==='week'?"This Week's":"This Month's"} Earnings</div><div class="num"><span id="revTotalNum">${getCurrSym()}0</span>${delta(total,pTotal)}</div><div class="sub">${done.length} grooms · prev ${money(pTotal)}</div></div>
    <div class="stat-card" style="${revNoAnim}"><div class="lbl">Average Groom</div><div class="num">${money(avg)}</div><div class="sub">per completed groom</div></div>
    <div class="stat-card" style="${revNoAnim}"><div class="lbl">Retail Sales</div><div class="num">${money(retailRev)}</div><div class="sub">${total?Math.round(retailRev/total*100):0}% of earnings</div></div>
    <div class="stat-card" style="${revNoAnim}"><div class="lbl">New vs Repeat</div><div class="num">${newCnt} / ${repCnt}</div><div class="sub">${(newCnt+repCnt)?Math.round(repCnt/(newCnt+repCnt)*100):0}% repeat rate</div></div>`;
  revStatsAnimated=true;
  let cols=[];
  if(revPeriod==='month'){
    const t=new Date();const first=new Date(t.getFullYear(),t.getMonth(),1);
    const monthEnd=iso(new Date(t.getFullYear(),t.getMonth()+1,0));
    for(let w=0;w<5;w++){const s=iso(addDays(first,w*7));let e=iso(addDays(first,w*7+6));
      if(e>monthEnd)e=monthEnd;
      if(s>monthEnd){cols.push({lb:'Wk '+(w+1),v:0});continue}
      const v=DB.appointments.filter(a=>a.status==='completed'&&a.date>=s&&a.date<=e).reduce((x,a)=>x+apptNet(a),0);
      cols.push({lb:'Wk '+(w+1),v})}
  }else{
    for(let i=6;i>=0;i--){const d=iso(addDays(new Date(),-i));
      const v=DB.appointments.filter(a=>a.status==='completed'&&a.date===d).reduce((x,a)=>x+apptNet(a),0);
      cols.push({lb:parseISO(d).toLocaleDateString(undefined,{weekday:'short'}),v})}
  }
  countUp($('revTotalNum'),total,v=>money(v));
  $('revSpark').innerHTML=areaChart(cols);
  const ins=computeInsights(from,to);
  const S2=DB.settings;const hrs=[];
  for(let hh=S2.open;hh<S2.close;hh++)hrs.push({h:hh,v:ins.byHr[hh]||0});
  const hMax=Math.max(1,...hrs.map(x=>x.v));
  const peak=hrs.reduce((p,x)=>x.v>p.v?x:p,{v:-1});
  $('hourBars').innerHTML=hrs.map(x=>`<div class="hb${x.h===peak.h&&x.v>0?' peak':''}" style="height:${Math.max(4,x.v/hMax*100)}%" title="${fmtTime(pad(x.h)+':00')} — ${x.v} groom${x.v!==1?'s':''}"></div>`).join('');
  $('hourLbls').innerHTML=hrs.map(x=>`<span>${x.h>12?x.h-12:x.h}${x.h>=12?'p':'a'}</span>`).join('');
  $('noShowLine').textContent=`no-show rate ${ins.noShowRate}%`;
  const byCat={};done.forEach(a=>{const s=DB.services.find(x=>x.id===a.serviceId);const cat=s?s.category:'package';byCat[CAT_LABEL[cat]||cat]=(byCat[CAT_LABEL[cat]||cat]||0)+a.price});
  $('revByService').innerHTML=barRows(byCat,k=>{const key=Object.keys(CAT_LABEL).find(c=>CAT_LABEL[c]===k);return SVC_COLORS[key]||'#93A69B'})||'<div class="empty">No completed grooms in this period.</div>';
  const bySt={};done.forEach(a=>{const n=getStaff(a.staffId)?.name||'—';bySt[n]=(bySt[n]||0)+apptNet(a)});
  $('revByStaff').innerHTML=barRows(bySt,(n)=>DB.staff.find(s=>s.name===n)?.color||'#2F7E78')||'<div class="empty">No data yet.</div>';
  $('revSplit').innerHTML=donutChart([['Grooms',svcRev,'#2F7E78'],['Retail',retailRev,'#D4794E']])||'<div class="empty">No data yet.</div>';
}
function barRows(obj,colorFn){
  const entries=Object.entries(obj).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
  if(!entries.length)return'';
  const mx=Math.max(...entries.map(e=>e[1]));
  return entries.map(([k,v])=>`<div class="bar-row"><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(k)}</span><div class="track"><div class="fill" style="width:${v/mx*100}%;background:${colorFn(k)}"></div></div><span class="val">${money(v)}</span></div>`).join('');
}

/* ---------- Business: retail stock / gift cards / expenses ---------- */
let bizTab='inventory';
function setBizTab(t){bizTab=t;document.querySelectorAll('[data-biz]').forEach(b=>b.classList.toggle('active',b.dataset.biz===t));renderBusiness()}
function renderBusiness(){
  const acts={inventory:`<button class="btn btn-primary" onclick="openProductForm()">+ Add Product</button>`,
    gift:`<button class="btn btn-primary" onclick="openGiftForm()">+ Sell Gift Card</button>`,
    expenses:`<button class="btn btn-primary" onclick="openExpenseForm()">+ Log Expense</button>`};
  $('bizActions').innerHTML=acts[bizTab];
  if(bizTab==='inventory'){
    const worth=DB.inventory.reduce((s,i)=>s+i.stock*i.cost,0);
    $('bizBody').innerHTML=`<div class="card">
      <p style="font-size:12.5px;color:var(--ink-soft);margin-bottom:8px">${DB.inventory.length} products · stock worth ${money(worth)} at cost · low-stock items are flagged on Today</p>
      <table><tr><th>Product</th><th class="num-cell">Price</th><th class="num-cell">Cost</th><th class="num-cell">In stock</th><th></th></tr>
      ${DB.inventory.map(i=>`<tr><td data-th="Product"><b>${esc(i.name)}</b></td><td class="num-cell" data-th="Price">${money(i.price)}</td><td class="num-cell" data-th="Cost">${money(i.cost)}</td>
        <td class="num-cell ${i.stock<=i.lowAt?'stock-low':''}" data-th="In stock">${i.stock}${i.stock<=i.lowAt?' ⚠':''}</td>
        <td class="act-corner" style="text-align:right;white-space:nowrap"><button class="btn btn-ghost btn-sm" onclick="adjStock('${i.id}',5)">+5</button> <button class="btn btn-ghost btn-sm" onclick="openProductForm('${i.id}')">Edit</button> <button class="btn btn-danger btn-sm" onclick="delProduct('${i.id}')" aria-label="Delete product">✕</button></td></tr>`).join('')
      ||'<tr><td colspan="5"><div class="empty">No products yet — add retail items to sell at checkout.</div></td></tr>'}</table></div>`;
  }else if(bizTab==='gift'){
    const outstanding=DB.giftcards.reduce((s,g)=>s+g.balance,0);
    const sold=DB.giftcards.reduce((s,g)=>s+g.amount,0);
    $('bizBody').innerHTML=`<div class="grid grid-4" style="margin-bottom:14px">
      <div class="stat-card"><div class="lbl">Cards Sold</div><div class="num">${DB.giftcards.length}</div><div class="sub">${money(sold)} total value</div></div>
      <div class="stat-card"><div class="lbl">Outstanding Balance</div><div class="num">${money(outstanding)}</div><div class="sub">redeemable at checkout</div></div></div>
      <div class="card"><table><tr><th>Code</th><th>Note</th><th>Issued</th><th class="num-cell">Value</th><th class="num-cell">Balance</th><th></th></tr>
      ${DB.giftcards.map(g=>`<tr><td data-th="Code"><b style="font-family:monospace">${esc(g.code)}</b></td><td data-th="Note">${esc(g.note||'')}</td><td data-th="Issued">${fmtDate(g.issued)}</td>
        <td class="num-cell" data-th="Value">${money(g.amount)}</td><td class="num-cell" data-th="Balance"><b>${money(g.balance)}</b></td>
        <td class="act-corner" style="text-align:right"><button class="btn btn-danger btn-sm" onclick="delGift('${g.id}')" aria-label="Delete gift card">✕</button></td></tr>`).join('')
      ||'<tr><td colspan="6"><div class="empty">No gift cards yet — sell one and redeem it by code at checkout.</div></td></tr>'}</table>
      <p style="font-size:12px;color:var(--ink-soft);margin-top:8px">Redeem gift cards at checkout by entering the code. Gift-card sales are tracked here (not mixed into groom earnings, to avoid double-counting when redeemed).</p></div>`;
  }else{
    const from=iso(new Date(new Date().getFullYear(),new Date().getMonth(),1));
    const monthEx=DB.expenses.filter(e=>e.date>=from);
    const monthTotal=monthEx.reduce((s,e)=>s+e.amount,0);
    const monthRev=DB.appointments.filter(a=>a.status==='completed'&&a.date>=from).reduce((s,a)=>s+apptNet(a),0);
    const rows=DB.expenses.slice().sort((a,b)=>b.date.localeCompare(a.date));
    $('bizBody').innerHTML=`<div class="grid grid-4" style="margin-bottom:14px">
      <div class="stat-card"><div class="lbl">This Month's Expenses</div><div class="num">${money(monthTotal)}</div><div class="sub">${monthEx.length} entries</div></div>
      <div class="stat-card"><div class="lbl">Net This Month</div><div class="num" style="color:${monthRev-monthTotal>=0?'var(--teal-d)':'var(--red)'}">${money(monthRev-monthTotal)}</div><div class="sub">earnings ${money(monthRev)} − expenses</div></div></div>
      <div class="card"><table><tr><th>Date</th><th>Category</th><th>Description</th><th class="num-cell">Amount</th><th></th></tr>
      ${rows.map(e=>`<tr><td data-th="Date">${fmtDate(e.date)}</td><td data-th="Category"><span class="badge grey">${esc(e.category)}</span></td><td data-th="Description">${esc(e.desc)}</td>
        <td class="num-cell" data-th="Amount">${money(e.amount)}</td><td class="act-corner" style="text-align:right"><button class="btn btn-danger btn-sm" onclick="delExpense('${e.id}')" aria-label="Delete expense">✕</button></td></tr>`).join('')
      ||'<tr><td colspan="5"><div class="empty">No expenses logged. Track shampoo, blades, fuel & insurance to see true profit.</div></td></tr>'}</table></div>`;
  }
}
function openProductForm(id){
  const i=id?DB.inventory.find(x=>x.id===id):{};
  openModal(`<button class="m-close" onclick="closeModal()">×</button><h3>${id?'Edit':'New'} Product</h3>
    <label>Product name *</label><input id="pdName" value="${esc(i.name||'')}">
    <div class="form-row">
      <div><label>Retail price</label><input type="number" id="pdPrice" value="${i.price??18}" min="0" step="0.01"></div>
      <div><label>Your cost</label><input type="number" id="pdCost" value="${i.cost??7}" min="0" step="0.01"></div>
      <div><label>Stock on hand</label><input type="number" id="pdStock" value="${i.stock??10}" min="0"></div>
      <div><label>Low-stock alert at</label><input type="number" id="pdLow" value="${i.lowAt??4}" min="0"></div></div>
    <div class="m-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="saveProduct('${id||''}')">Save Product</button></div>`);
}
function saveProduct(id){
  const name=$('pdName').value.trim();if(!name){toast('Name required');return}
  const data={name,price:+$('pdPrice').value||0,cost:+$('pdCost').value||0,stock:Math.max(0,Math.round(+$('pdStock').value||0)),lowAt:Math.max(0,Math.round(+$('pdLow').value||0))};
  if(id)Object.assign(DB.inventory.find(x=>x.id===id),data);else DB.inventory.push(Object.assign({id:uid()},data));
  closeModal();refreshAll();toast('Product saved');
}
function adjStock(id,n){const i=DB.inventory.find(x=>x.id===id);i.stock=Math.max(0,i.stock+n);refreshAll()}
function delProduct(id){if(!confirm('Delete this product?'))return;DB.inventory=DB.inventory.filter(i=>i.id!==id);refreshAll()}
function openGiftForm(){
  const code='GC-'+Math.random().toString(36).slice(2,7).toUpperCase();
  openModal(`<button class="m-close" onclick="closeModal()">×</button><h3>Sell Gift Card</h3>
    <div class="form-row"><div><label>Card code</label><input id="gcCode" value="${code}" style="font-family:monospace"></div>
    <div><label>Amount</label><input type="number" id="gcAmt" value="50" min="1" step="0.01"></div></div>
    <label>Note (who bought it / for whom)</label><input id="gcNote" placeholder="Sold to Emma — gift for her sister's dog">
    <div class="m-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="saveGift()">Issue Card</button></div>`);
}
function saveGift(){
  const code=$('gcCode').value.trim().toUpperCase();const amt=+$('gcAmt').value||0;
  if(!code||amt<=0){toast('Code and positive amount required');return}
  if(DB.giftcards.some(g=>g.code===code)){toast('⚠ That code already exists');return}
  DB.giftcards.push({id:uid(),code,amount:amt,balance:amt,note:$('gcNote').value.trim(),issued:todayISO()});
  checkAchievements(true);
  closeModal();refreshAll();toast('Gift card '+code+' issued · '+money(amt));
}
function delGift(id){if(!confirm('Delete this gift card record?'))return;DB.giftcards=DB.giftcards.filter(g=>g.id!==id);refreshAll()}
function openExpenseForm(){
  openModal(`<button class="m-close" onclick="closeModal()">×</button><h3>Log Expense</h3>
    <div class="form-row"><div><label>Date</label><input type="date" id="exDate" value="${todayISO()}"></div>
    <div><label>Category</label><select id="exCat">${['supplies','equipment','vehicle','insurance','rent','marketing','other'].map(c=>`<option>${c}</option>`).join('')}</select></div></div>
    <label>Description</label><input id="exDesc" placeholder="Shampoo re-order / blade sharpening / van fuel">
    <label>Amount</label><input type="number" id="exAmt" value="0" min="0" step="0.01">
    <div class="m-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="saveExpense()">Save Expense</button></div>`);
}
function saveExpense(){
  const amt=+$('exAmt').value||0;if(amt<=0){toast('Enter an amount');return}
  DB.expenses.push({id:uid(),date:$('exDate').value||todayISO(),category:$('exCat').value,desc:$('exDesc').value.trim(),amount:amt});
  closeModal();refreshAll();toast('Expense logged');
}
function delExpense(id){DB.expenses=DB.expenses.filter(e=>e.id!==id);refreshAll()}

/* ---------- Pay reports ---------- */
function printCommission(staffId){
  const t=new Date();const from=iso(new Date(t.getFullYear(),t.getMonth(),1));
  const S=DB.settings;
  const list=staffId?[getStaff(staffId)]:DB.staff;
  const body=list.map(st=>{
    const done=DB.appointments.filter(a=>a.staffId===st.id&&a.status==='completed'&&a.date>=from).sort((a,b)=>a.date.localeCompare(b.date));
    const rev=done.reduce((s,a)=>s+apptNet(a),0);
    const pay=st.commission?rev*st.commission/100:(+st.salary||0);
    return`<h2 class="pr-h">${esc(st.name)} — ${st.commission?st.commission+'% commission':'fixed pay'}</h2>
    <table class="pr-t"><tr><th>Date</th><th>Dog</th><th>Service</th><th>Net</th></tr>
    ${done.map(a=>`<tr><td>${fmtDate(a.date)}</td><td>${esc(getClient(a.clientId)?.name||'')}</td><td>${esc(svcName(a.serviceId))}</td><td>${money(apptNet(a))}</td></tr>`).join('')||'<tr><td colspan="4">No completed grooms</td></tr>'}
    <tr><td colspan="3"><b>Revenue generated</b></td><td><b>${money(rev)}</b></td></tr>
    <tr><td colspan="3"><b>${st.commission?'Commission owed':'Monthly pay'}</b></td><td><b>${money(pay)}</b></td></tr></table>`;
  }).join('');
  printHTML(`<div style="max-width:680px;margin:0 auto"><div class="pr-brand">${esc(S.name)}</div>
    <div class="pr-sub">${staffId?'Pay Report':'Pay Summary'} · ${t.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</div>
    ${body}<div class="pr-note">Generated ${new Date().toLocaleString()} · PawBook Pro</div></div>`);
}
/* ================================================================
   Prints / Before-After / Gallery / Charts / Settings / Wizard / Init
   ================================================================ */
function printHTML(html){$('printArea').innerHTML=html;setTimeout(()=>window.print(),60)}

/* ---------- Receipt / invoice / reminder card / groom sheet ---------- */
function printReceipt(id){
  const a=DB.appointments.find(x=>x.id===id);const c=getClient(a.clientId);const S=DB.settings;
  const total=apptNet(a);
  printHTML(`<div class="pr-card">
    <div class="pr-brand">${esc(S.name)}</div><div class="pr-sub">Receipt · ${fmtDateLong(a.date)}</div>
    <div class="pr-line"><span>Dog</span><b>${esc(c?.name||'Walk-in')}${c?.owner?' ('+esc(c.owner)+')':''}</b></div>
    <div class="pr-line"><span>${esc(svcName(a.serviceId))}</span><b>${money(a.price)}</b></div>
    ${a.retail?`<div class="pr-line"><span>Retail / take-home</span><b>${money(a.retail)}</b></div>`:''}
    ${a.redeemed?`<div class="pr-line"><span>Loyalty reward applied</span><b>−${money(a.redeemed)}</b></div>`:''}
    ${a.gift?`<div class="pr-line"><span>Gift card ${esc(a.gift.code)}</span><b>−${money(a.gift.amount)}</b></div>`:''}
    <div class="pr-line pr-total"><span>Total</span><span>${money(Math.max(0,total-(a.gift?a.gift.amount:0)))}</span></div>
    <div class="pr-line"><span>Groomer</span><b>${esc(getStaff(a.staffId)?.name||'')}</b></div>
    ${c?`<div class="pr-line"><span>Loyalty balance</span><b>★ ${c.points||0} pts</b></div>`:''}
    <div class="pr-note">Thank you — we can't wait to see ${esc(c?.name||'you')} again! 🐾</div></div>`);
}
function printInvoice(apptId){
  const a=DB.appointments.find(x=>x.id===apptId);const c=getClient(a.clientId);const S=DB.settings;
  if(!a.invNo){a.invNo='INV-'+new Date().getFullYear()+'-'+String(S.invSeq++).padStart(4,'0');save()}
  const items=[[svcName(a.serviceId),a.price],...(a.items||[]).map(i=>[i.name,i.price])];
  const otherRetail=(a.retail||0)-((a.items||[]).reduce((s,i)=>s+i.price,0));
  if(otherRetail>0.001)items.push(['Retail (other)',otherRetail]);
  const sub=items.reduce((s,[,v])=>s+v,0);
  printHTML(`<div style="max-width:560px;margin:0 auto">
    <div style="display:flex;justify-content:space-between;align-items:baseline"><div><div class="pr-brand">${esc(S.name)}</div><div class="pr-sub">Invoice</div></div>
    <div style="text-align:right;font-size:12.5px"><b>${a.invNo}</b><br>${fmtDateLong(a.date)}</div></div>
    <div class="pr-line"><span>Billed to</span><b>${esc(c?.owner||c?.name||'Walk-in')}</b></div>
    <div class="pr-line"><span>For</span><b>${esc(c?.name||'')}${c?.breed?' · '+esc(c.breed):''}</b></div>
    <div class="pr-line"><span>Groomer</span><b>${esc(getStaff(a.staffId)?.name||'')}</b></div>
    <h2 class="pr-h">Items</h2>
    <table class="pr-t"><tr><th>Description</th><th style="text-align:right">Amount</th></tr>
    ${items.map(([n,v])=>`<tr><td>${esc(n)}</td><td style="text-align:right">${money(v)}</td></tr>`).join('')}</table>
    ${a.redeemed?`<div class="pr-line"><span>Loyalty reward</span><b>−${money(a.redeemed)}</b></div>`:''}
    ${a.gift?`<div class="pr-line"><span>Gift card ${esc(a.gift.code)}</span><b>−${money(a.gift.amount)}</b></div>`:''}
    <div class="pr-line pr-total"><span>Total paid</span><span>${money(Math.max(0,sub-(a.redeemed||0)-(a.gift?a.gift.amount:0)))}</span></div>
    <div class="pr-note">Thank you for your business · ${esc(S.name)}</div></div>`);
}
function printApptCard(id){
  const a=DB.appointments.find(x=>x.id===id);const c=getClient(a.clientId);const S=DB.settings;
  printHTML(`<div class="pr-card">
    <div class="pr-brand">${esc(S.name)}</div><div class="pr-sub">Next Groom Reminder</div>
    <div class="pr-line"><span>Dog</span><b>${esc(c?.name||'')}</b></div>
    <div class="pr-line"><span>Service</span><b>${esc(svcName(a.serviceId))}</b></div>
    <div class="pr-line"><span>Groomer</span><b>${esc(getStaff(a.staffId)?.name||'')}</b></div>
    <div class="pr-line"><span>Date</span><b>${fmtDateLong(a.date)}</b></div>
    <div class="pr-line"><span>Time</span><b>${fmtTime(a.start)}</b></div>
    <div class="pr-note">Please arrive 5 minutes early. Need to reschedule? Give us 24 hours' notice. 🐾</div></div>`);
}
// Per-dog groom sheet — the coat card as a printable table-side reference
function printGroomSheet(id){
  const c=getClient(id);const S=DB.settings;const l=lastCompleted(c);
  const flags=(c.behaviorNotes||[]).length?c.behaviorNotes.join(' · '):'—';
  printHTML(`<div style="max-width:560px;margin:0 auto">
    <div class="pr-brand">${esc(S.name)}</div><div class="pr-sub">Groom Sheet</div>
    <h2 class="pr-h">${esc(c.name)}${c.owner?' — '+esc(c.owner):''}</h2>
    <table class="pr-t">
      <tr><th>Breed</th><td>${esc(c.breed||'—')}</td><th>Size</th><td>${SIZE_LABEL[c.size]||'—'}${c.weight?' · '+esc(c.weight):''}</td></tr>
      <tr><th>Coat</th><td colspan="3">${esc(c.coat||'—')}</td></tr>
      <tr><th>Last cut</th><td colspan="3">${esc(c.lastCut||'—')}</td></tr>
      <tr><th>Sensitivities</th><td colspan="3" class="pr-warn">${esc(c.sensitivities||'—')}</td></tr>
      <tr><th>Behavior flags</th><td colspan="3" class="pr-warn">${esc(flags)}</td></tr>
      <tr><th>Cycle</th><td>every ${c.freqWeeks} wks</td><th>Rabies</th><td>${c.rabiesExpiry?fmtDate(c.rabiesExpiry):'—'}</td></tr>
      <tr><th>Last groom</th><td>${l?fmtDate(l.date):'—'}</td><th>Points</th><td>★ ${c.points||0}</td></tr>
    </table>
    <div style="margin-top:20px" class="pr-line"><span>Today's notes</span><span style="border-bottom:1px solid #999;flex:1;margin-left:10px">&nbsp;</span></div>
    <div class="pr-line"><span>&nbsp;</span><span style="border-bottom:1px solid #999;flex:1;margin-left:10px">&nbsp;</span></div>
    <div class="pr-note">Table-side reference · ${esc(S.name)}</div></div>`);
}

/* ---------- Van Day-Sheet (wow feature — mobile run-sheet) ---------- */
function printDaySheet(){
  const d=todayISO();
  const list=DB.appointments.filter(a=>a.date===d&&a.status!=='cancelled').sort((a,b)=>a.start.localeCompare(b.start));
  const S=DB.settings;
  const rows=list.map((a,idx)=>{const c=getClient(a.clientId);
    const flags=(c?.behaviorNotes||[]).length?c.behaviorNotes.join(' · '):'';
    const warn=[flags,c?.sensitivities?'🧴 '+c.sensitivities:'',rabiesStatus(c)==='expired'?'💉 RABIES EXPIRED':''].filter(Boolean).join(' · ');
    return`<tr class="pr-stop"><td style="text-align:center"><b>${idx+1}</b></td><td>${fmtTime(a.start)}<br><span style="color:#777">${a.duration}m</span></td>
      <td><b>${esc(c?.name||'')}</b><br><span style="color:#555">${esc(c?.breed||'')} · ${SIZE_LABEL[c?.size]||''}</span></td>
      <td>${esc(c?.owner||'')}<br><span style="color:#555">${esc(c?.phone||'')}</span></td>
      <td>${esc(c?.address||'—')}</td>
      <td>${esc(svcName(a.serviceId))}<br><span style="color:#555">${money(a.price)}</span></td>
      <td class="pr-warn" style="font-size:11px">${esc(warn)}${warn&&a.notes?' · ':''}${esc(a.notes||'')}</td></tr>`}).join('');
  const totalEst=list.reduce((s,a)=>s+a.price,0);
  printHTML(`<div style="max-width:760px;margin:0 auto">
    <div style="display:flex;justify-content:space-between;align-items:baseline"><div><div class="pr-brand">${esc(S.name)}</div><div class="pr-sub">🚐 Van Day-Sheet · ${fmtDateLong(d)}</div></div>
    <div style="text-align:right;font-size:12.5px">${list.length} stop${list.length!==1?'s':''}<br>≈ ${money(totalEst)}</div></div>
    ${list.length?`<table class="pr-t"><tr><th>#</th><th>Time</th><th>Dog</th><th>Owner</th><th>Address</th><th>Service</th><th>Warnings & notes</th></tr>${rows}</table>`
    :'<p>No grooms booked today.</p>'}
    <div class="pr-note">Tape it to the dashboard 🐾 · printed ${new Date().toLocaleString()} · PawBook Pro</div></div>`);
}
function toggleCalPrintMenu(){const m=$('calPrintMenu');if(!m)return;const open=m.style.display==='block';m.style.display=open?'none':'block';if(!open){const close=e=>{if(!$('calPrintWrap')?.contains(e.target)){m.style.display='none';document.removeEventListener('click',close)}};setTimeout(()=>document.addEventListener('click',close),10)}}
function printWeekSheet(){
  const [wFrom,wTo]=[iso(startOfWeek(new Date())),iso(addDays(startOfWeek(new Date()),6))];
  const S=DB.settings;
  const days=[];let d=new Date(wFrom);
  while(iso(d)<=wTo){days.push(iso(d));d=addDays(d,1);}
  const rows=days.map(day=>{
    const appts=DB.appointments.filter(a=>a.date===day&&a.status!=='cancelled').sort((a,b)=>a.start.localeCompare(b.start));
    return`<tr><td style="font-weight:700;vertical-align:top;white-space:nowrap;padding-right:10px">${fmtDateLong(day)}</td><td>${appts.length?appts.map(a=>{const c=getClient(a.clientId);return`<div style="margin-bottom:4px">${fmtTime(a.start)} · <b>${esc(c?.name||'')}</b> · ${esc(svcName(a.serviceId))} · ${esc(getStaff(a.staffId)?.name||'')}</div>`}).join(''):'<span style="color:#999">—</span>'}</td></tr>`;
  }).join('');
  printHTML(`<div style="max-width:720px;margin:0 auto">
    <div class="pr-brand">${esc(S.name)}</div><div class="pr-sub">Week Schedule · ${fmtDate(wFrom)} – ${fmtDate(wTo)}</div>
    <table class="pr-t" style="width:100%"><tbody>${rows}</tbody></table>
    <div class="pr-note">Printed ${new Date().toLocaleString()}</div></div>`);
}
function printMonthSheet(){
  const now=new Date();const S=DB.settings;
  const mFrom=iso(new Date(now.getFullYear(),now.getMonth(),1));
  const mTo=iso(new Date(now.getFullYear(),now.getMonth()+1,0));
  const appts=DB.appointments.filter(a=>a.date>=mFrom&&a.date<=mTo&&a.status!=='cancelled').sort((a,b)=>a.date.localeCompare(b.date)||a.start.localeCompare(b.start));
  const rows=appts.map(a=>{const c=getClient(a.clientId);return`<tr><td>${fmtDate(a.date)}</td><td>${fmtTime(a.start)}</td><td>${esc(c?.name||'')}</td><td>${esc(svcName(a.serviceId))}</td><td>${esc(getStaff(a.staffId)?.name||'')}</td><td style="text-align:right">${money(a.price)}</td></tr>`}).join('');
  printHTML(`<div style="max-width:720px;margin:0 auto">
    <div class="pr-brand">${esc(S.name)}</div><div class="pr-sub">Month Overview · ${now.toLocaleString('default',{month:'long',year:'numeric'})}</div>
    ${appts.length?`<table class="pr-t"><thead><tr><th>Date</th><th>Time</th><th>Dog</th><th>Service</th><th>Groomer</th><th>Price</th></tr></thead><tbody>${rows}</tbody></table>`:'<p>No grooms this month.</p>'}
    <div class="pr-note">${appts.length} groom(s) · Printed ${new Date().toLocaleString()}</div></div>`);
}
function printMonthlyReport(){
  const t=new Date();const from=iso(new Date(t.getFullYear(),t.getMonth(),1)),to=iso(new Date(t.getFullYear(),t.getMonth()+1,0));
  const done=DB.appointments.filter(a=>a.status==='completed'&&a.date>=from&&a.date<=to);
  const total=done.reduce((s,a)=>s+apptNet(a),0);
  const byCat={},bySt={};
  done.forEach(a=>{const s=DB.services.find(x=>x.id===a.serviceId);const cat=s?s.category:'package';byCat[CAT_LABEL[cat]||cat]=(byCat[CAT_LABEL[cat]||cat]||0)+a.price;
    const n=getStaff(a.staffId)?.name||'—';bySt[n]=(bySt[n]||0)+apptNet(a)});
  const S=DB.settings;
  printHTML(`<div style="max-width:640px;margin:0 auto">
    <div class="pr-brand">${esc(S.name)}</div><div class="pr-sub">Monthly Report · ${t.toLocaleDateString(undefined,{month:'long',year:'numeric'})}</div>
    <h2 class="pr-h">Summary</h2>
    <table class="pr-t"><tr><th>Total earnings</th><th>Completed grooms</th><th>Average groom</th><th>Retail</th></tr>
    <tr><td><b>${money(total)}</b></td><td>${done.length}</td><td>${money(done.length?total/done.length:0)}</td><td>${money(done.reduce((s,a)=>s+(a.retail||0),0))}</td></tr></table>
    <h2 class="pr-h">Earnings by Service Type</h2>
    <table class="pr-t"><tr><th>Type</th><th>Earnings</th></tr>${Object.entries(byCat).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${money(v)}</td></tr>`).join('')||'<tr><td colspan="2">No data</td></tr>'}</table>
    <h2 class="pr-h">Expenses & Net</h2>
    <table class="pr-t"><tr><th>Expenses this month</th><th>Net (earnings − expenses)</th><th>Gift cards outstanding</th></tr>
    <tr><td>${money(DB.expenses.filter(e=>e.date>=from&&e.date<=to).reduce((s,e)=>s+e.amount,0))}</td>
    <td><b>${money(total-DB.expenses.filter(e=>e.date>=from&&e.date<=to).reduce((s,e)=>s+e.amount,0))}</b></td>
    <td>${money(DB.giftcards.reduce((s,g)=>s+g.balance,0))}</td></tr></table>
    <h2 class="pr-h">Earnings by Groomer</h2>
    <table class="pr-t"><tr><th>Groomer</th><th>Grooms</th><th>Earnings</th></tr>${Object.entries(bySt).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<tr><td>${esc(k)}</td><td>${done.filter(a=>getStaff(a.staffId)?.name===k).length}</td><td>${money(v)}</td></tr>`).join('')||'<tr><td colspan="3">No data</td></tr>'}</table>
    <div class="pr-note">Generated by PawBook Pro · ${new Date().toLocaleString()}</div></div>`);
}

/* ---------- Before / After comparison ---------- */
function openCompare(){
  const pairs=DB.clients.filter(c=>c.photos.some(p=>p.kind==='before')&&c.photos.some(p=>p.kind==='after'));
  if(!pairs.length){toast('Need a dog with both a Before and an After photo');return}
  openModal(compareHTML(pairs,pairs[0].id),true);
}
function openCompareFor(id){
  const pairs=DB.clients.filter(c=>c.photos.some(p=>p.kind==='before')&&c.photos.some(p=>p.kind==='after'));
  if(!pairs.length){toast('Need both a Before and an After photo');return}
  openModal(compareHTML(pairs,id),true);
}
function compareHTML(pairs,cid){
  const c=getClient(cid)||pairs[0];
  const before=c.photos.filter(p=>p.kind==='before').slice(-1)[0];
  const after=c.photos.filter(p=>p.kind==='after').slice(-1)[0];
  return`<button class="m-close" onclick="closeModal()">×</button>
    <h3>Before & After</h3>
    <label>Dog</label><select id="cmpClient" onchange="switchCompare()">${pairs.map(p=>`<option value="${p.id}"${p.id===c.id?' selected':''}>${esc(p.name)}${p.owner?' — '+esc(p.owner):''}</option>`).join('')}</select>
    <div class="cmp-wrap" id="cmpWrap">
      <img src="${before.data}" alt="Before">
      <img src="${after.data}" alt="After" class="after" id="cmpAfter">
      <div class="cmp-bar" id="cmpBar"></div>
      <span class="cmp-lbl" style="left:10px">BEFORE</span><span class="cmp-lbl" style="right:10px">AFTER</span></div>
    <input type="range" class="cmp-range" id="cmpRange" min="0" max="100" value="50" aria-label="Comparison slider"
      oninput="$('cmpAfter').style.clipPath='inset(0 0 0 '+this.value+'%)';$('cmpBar').style.left=this.value+'%'">
    <p style="font-size:12.5px;color:var(--ink-soft);text-align:center;margin-top:6px">${esc(svcName(after.serviceId)||'')} · ${esc(getStaff(after.staffId)?.name||'')} — drag to reveal</p>`;
}
function switchCompare(){
  const pairs=DB.clients.filter(c=>c.photos.some(p=>p.kind==='before')&&c.photos.some(p=>p.kind==='after'));
  $('modalBox').innerHTML=compareHTML(pairs,$('cmpClient').value);
}

/* ---------- Chart helpers ---------- */
function areaChart(cols){
  const w=560,h=170,pl=46,pr=12,pt=14,pb=26;
  const mx=Math.max(1,...cols.map(c=>c.v));
  const n=cols.length,iw=(w-pl-pr)/Math.max(1,n-1);
  const pts=cols.map((c,i)=>[pl+i*iw, pt+(1-c.v/mx)*(h-pt-pb)]);
  const line=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ');
  const area=line+` L${pts[n-1][0].toFixed(1)},${h-pb} L${pl},${h-pb} Z`;
  let grid='';
  for(let g=0;g<=3;g++){const y=pt+g*(h-pt-pb)/3;
    grid+=`<line x1="${pl}" x2="${w-pr}" y1="${y}" y2="${y}" stroke="var(--mist)" stroke-width="1"/>
    <text x="${pl-7}" y="${y+3.5}" text-anchor="end" font-size="10" fill="var(--ink-soft)">${getCurrSym()}${Math.round(mx*(1-g/3)).toLocaleString()}</text>`}
  const dots=pts.map((p,i)=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.4" fill="var(--paper)" stroke="var(--clay)" stroke-width="2.2"><title>${cols[i].lb}: ${money(cols[i].v)}</title></circle>`).join('');
  const labels=cols.map((c,i)=>`<text x="${pts[i][0].toFixed(1)}" y="${h-8}" text-anchor="middle" font-size="10.5" fill="var(--ink-soft)">${c.lb}</text>`).join('');
  return`<svg class="chart-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="Earnings trend chart">
    <defs><linearGradient id="agrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D4794E" stop-opacity=".28"/><stop offset="1" stop-color="#D4794E" stop-opacity="0"/></linearGradient></defs>
    ${grid}<path d="${area}" fill="url(#agrad)"/><path d="${line}" fill="none" stroke="var(--clay)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>${dots}${labels}</svg>`;
}
function donutChart(entries){
  const total=entries.reduce((s,[,v])=>s+v,0);if(!total)return'';
  const r=44,C=2*Math.PI*r;let acc=0;
  const segs=entries.filter(([,v])=>v>0).map(([k,v,col])=>{
    const frac=v/total,dash=frac*C;
    const s=`<circle cx="60" cy="60" r="${r}" fill="none" stroke="${col}" stroke-width="17"
      stroke-dasharray="${dash.toFixed(1)} ${(C-dash).toFixed(1)}" stroke-dashoffset="${(-acc*C+C/4).toFixed(1)}"><title>${k}: ${money(v)}</title></circle>`;
    acc+=frac;return s}).join('');
  return`<div class="donut-wrap"><svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label="Grooms versus retail split">
    ${segs}<text x="60" y="57" text-anchor="middle" font-size="15" font-weight="700" fill="var(--ink)">${money(total)}</text>
    <text x="60" y="72" text-anchor="middle" font-size="9.5" fill="var(--ink-soft)">TOTAL</text></svg>
    <div class="donut-legend">${entries.map(([k,v,col])=>`<span><span class="sw" style="background:${col}"></span>${k} — <b>${money(v)}</b> (${total?Math.round(v/total*100):0}%)</span>`).join('')}</div></div>`;
}

/* ---------- Dog CSV export ---------- */
function exportClientsCSV(){
  if(!DB.clients.length){toast('No dogs to export');return}
  const head=['Dog','Owner','Phone','Email','Breed','Size','Coat','Cycle (weeks)','Preferred groomer','Loyalty points','Status','Last groom','Next due','Sensitivities','Behavior flags','Rabies expiry','Address'];
  const rows=DB.clients.map(c=>{const l=lastCompleted(c);
    return[c.name,c.owner,c.phone,c.email,c.breed,SIZE_LABEL[c.size]||c.size,c.coat,c.freqWeeks,getStaff(c.staffId)?.name||'',c.points||0,retStatus(c),l?l.date:'',nextDue(c)||'',c.sensitivities,(c.behaviorNotes||[]).join('; '),c.rabiesExpiry||'',c.address]});
  const csv=[head,...rows].map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
  downloadFile('pawbook-dogs-'+todayISO()+'.csv','\ufeff'+csv,'text/csv;charset=utf-8');
  toast('Dog list exported as CSV');
}

/* ---------- Gallery ---------- */
function renderGallery(){
  const svcSel=$('galFilterSvc'),stSel=$('galFilterStaff');
  const keepSvc=svcSel.value,keepSt=stSel.value;
  svcSel.innerHTML='<option value="">All services</option>'+DB.services.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('');
  stSel.innerHTML='<option value="">All groomers</option>'+DB.staff.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('');
  svcSel.value=keepSvc;stSel.value=keepSt;
  const fSvc=svcSel.value,fSt=stSel.value;
  const items=[];
  DB.clients.forEach(c=>c.photos.forEach((p,i)=>{if((!fSvc||p.serviceId===fSvc)&&(!fSt||p.staffId===fSt))items.push({c,p,i})}));
  items.sort((a,b)=>(b.p.date||'').localeCompare(a.p.date||''));
  window._galItems=items;
  $('galGrid').innerHTML=items.length?items.map(({c,p,i},gx)=>`
    <div class="gal-item" onclick="openLightbox(${gx})">
      <img src="${p.data}" alt="${p.kind||'photo'} — ${esc(svcName(p.serviceId)||'')}" loading="lazy">
      <div class="ov"><button onclick="event.stopPropagation();openLightbox(${gx})" aria-label="View large">🔍</button>
        <button onclick="event.stopPropagation();delPhoto('${c.id}',${i})" aria-label="Delete photo">🗑</button></div>
      <div class="gi-meta"><strong>${p.kind==='before'?'Before':'After'} · ${esc(svcName(p.serviceId)||'—')}</strong>
      ${p.private?'🔒 Private':esc(c.name)} · ${esc(getStaff(p.staffId)?.name||'')}</div></div>`).join('')
    :'<div class="empty" style="grid-column:1/-1"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M4 19l6-6 4 4 3-3 4 4"/></svg>No photos yet. Upload a before/after pair (with owner permission) to build your portfolio.</div>';
}
let lbIdx=0;
function openLightbox(i){
  if(!window._galItems?.length)return;
  lbIdx=i;const {c,p}=window._galItems[i];
  $('lbImg').src=p.data;
  $('lbCap').innerHTML=`<b>${p.kind==='before'?'Before':'After'}</b> · ${esc(svcName(p.serviceId)||'')} · ${esc(getStaff(p.staffId)?.name||'')}${p.private?' · 🔒 name hidden':' · '+esc(c.name)}${p.date?' · '+fmtDate(p.date):''}`;
  $('lightbox').classList.add('open');
}
function navLightbox(d){const n=window._galItems.length;openLightbox((lbIdx+d+n)%n)}
function closeLightbox(){$('lightbox').classList.remove('open')}
function delPhoto(cid,i){if(!confirm('Delete this photo?'))return;getClient(cid).photos.splice(i,1);refreshAll()}
function openPhotoForm(presetClient){
  openModal(`
    <button class="m-close" onclick="closeModal()">×</button>
    <h3>Upload Transformation Photo</h3>
    <p class="m-sub">⚠ Only upload with the owner's permission. Photos are resized and stored on this device only.</p>
    <label>Dog</label><select id="phClient">${DB.clients.map(c=>`<option value="${c.id}"${presetClient===c.id?' selected':''}>${esc(c.name)} — ${esc(c.owner||'')}</option>`).join('')}</select>
    <div class="form-row">
      <div><label>Type</label><select id="phKind"><option value="before">Before</option><option value="after" selected>After</option></select></div>
      <div><label>Service</label><select id="phSvc">${DB.services.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></div>
    </div>
    <label>Groomer</label><select id="phStaff">${DB.staff.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select>
    <label style="display:inline-flex;gap:7px;align-items:center;margin-top:12px"><input type="checkbox" id="phPrivate" style="width:auto;accent-color:var(--teal-d)"> Hide name in gallery & export (privacy)</label>
    <label>Photo file</label><input type="file" id="phFile" accept="image/*">
    <div class="m-actions"><button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
    <button class="btn btn-primary" onclick="savePhoto()">Add to Gallery</button></div>`);
}
function savePhoto(){
  const f=$('phFile').files[0];if(!f){toast('Choose a photo file');return}
  const cid=$('phClient').value;
  const img=new Image(),rd=new FileReader();
  rd.onload=()=>{img.onload=()=>{
    const cv=document.createElement('canvas');const max=700;
    const sc=Math.min(1,max/Math.max(img.width,img.height));
    cv.width=img.width*sc;cv.height=img.height*sc;
    cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
    getClient(cid).photos.push({data:cv.toDataURL('image/jpeg',.78),kind:$('phKind').value,serviceId:$('phSvc').value,staffId:$('phStaff').value,private:$('phPrivate').checked,date:todayISO()});
    checkAchievements(true);
    closeModal();refreshAll();toast('Photo added to gallery');
  };img.src=rd.result};
  rd.readAsDataURL(f);
}
function exportGallery(){
  const items=[];DB.clients.forEach(c=>c.photos.forEach(p=>items.push({c,p})));
  if(!items.length){toast('No photos to export yet');return}
  const S=DB.settings;
  const html=`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(S.name)} — Transformations</title>
  <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#F6F1E7;color:#1C3B3A;margin:0;padding:30px;text-align:center}h1{font-size:34px;margin-bottom:2px}p{color:#5E736F;margin-top:0}.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:16px;max-width:1100px;margin:26px auto}figure{margin:0;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 14px rgba(28,59,58,.08)}img{width:100%;height:230px;object-fit:cover;display:block}figcaption{padding:10px;font-size:13px;color:#5E736F}</style></head>
  <body><h1>${esc(S.name)}</h1><p>Before &amp; After Transformations 🐾</p><div class="g">${items.map(({c,p})=>`<figure><img src="${p.data}"><figcaption><b>${p.kind==='before'?'Before':'After'}</b> · ${esc(svcName(p.serviceId)||'')}<br>${p.private?'':esc((getStaff(p.staffId)?.name?'by '+getStaff(p.staffId).name:''))}</figcaption></figure>`).join('')}</div>
  <p style="margin-top:26px;font-size:12px">Share this page or screenshot for Instagram · made with PawBook Pro</p></body></html>`;
  downloadFile((S.name.replace(/\W+/g,'-')||'grooming')+'-gallery.html',html,'text/html');
  toast('Gallery exported — open the file, host it anywhere, or screenshot for socials');
}

/* ---------- Settings / backup ---------- */
function renderSettings(){
  const S=DB.settings;
  $('setName').value=S.name;
  $('setPhone').value=S.phone||'';
  const hrs=n=>Array.from({length:18},(_,i)=>i+5).map(h=>`<option value="${h}"${h===n?' selected':''}>${h>12?h-12+':00 PM':h===12?'12:00 PM':h+':00 AM'}</option>`).join('');
  $('setOpen').innerHTML=hrs(S.open);$('setClose').innerHTML=hrs(S.close);
  $('setSlot').value=S.slot;$('setPPD').value=S.ppd;$('setRedeem').value=S.redeem;$('setBday').value=S.bday;
  $('setCurrency').innerHTML=CURRENCIES.map(c=>`<option value="${c.code}"${(S.currency||'USD')===c.code?' selected':''}>${c.label}</option>`).join('');
  renderColorSwatches();
}
function saveSettings(){
  const S=DB.settings;
  S.name=$('setName').value.trim()||S.name;
  S.phone=$('setPhone').value.trim();
  S.open=+$('setOpen').value;S.close=+$('setClose').value;
  if(S.close<=S.open){toast('Closing must be after opening');return}
  S.slot=+$('setSlot').value;
  S.ppd=Math.max(0,+$('setPPD').value||1);S.redeem=Math.max(1,+$('setRedeem').value||10);S.bday=+$('setBday').value||1;
  S.currency=$('setCurrency').value||'USD';
  save();toast('Settings saved');refreshAll();
}
function downloadFile(name,content,type){
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),4000);
}
function backupData(){downloadFile('pawbook-backup-'+todayISO()+'.json',JSON.stringify(DB,null,1),'application/json');toast('Backup downloaded')}
function restoreData(input){
  const f=input.files[0];if(!f)return;
  const rd=new FileReader();
  rd.onload=()=>{try{const d=JSON.parse(rd.result);
    if(!d.clients||!d.appointments||!d.settings)throw 0;
    if(!confirm('Replace ALL current data with this backup?'))return;
    DB=d;migrate();save();refreshAll();renderSettings();applyTheme();toast('Backup restored')}catch(e){toast('⚠ Not a valid PawBook backup file')}};
  rd.readAsText(f);input.value='';
}
function mergeData(input){
  const f=input.files[0];if(!f)return;
  const rd=new FileReader();
  rd.onload=()=>{try{const d=JSON.parse(rd.result);
    if(!d.clients||!d.settings)throw 0;
    const arrays=['staff','services','packages','clients','appointments','redemptions','inventory','giftcards','expenses','waitlist'];
    let added=0;
    arrays.forEach(k=>{
      if(!Array.isArray(d[k]))return;
      DB[k]=DB[k]||[];
      const seen=new Set(DB[k].map(x=>x&&x.id));
      d[k].forEach(x=>{if(x&&x.id&&!seen.has(x.id)){DB[k].push(x);seen.add(x.id);added++}});
    });
    migrate();save();refreshAll();renderSettings();
    toast(added?('Merged — '+added+' new record'+(added===1?'':'s')+' added'):'Nothing new to merge — all records already present');
  }catch(e){toast('⚠ Not a valid PawBook backup file')}};
  rd.readAsText(f);input.value='';
}
function resetData(){if(!confirm('Erase everything and reload the sample data?'))return;DB=sampleData();DB.settings.onboarded=1;save();location.reload()}

/* ---------- Onboarding wizard ---------- */
let wizStep=0, wizData={name:'',open:8,close:18,slot:30,seeded:'sample'};
function startWizard(){wizStep=0;wizData={name:'',open:8,close:18,slot:30,seeded:'sample'};renderWizard()}
function renderWizard(){
  const dots=[0,1,2,3].map(i=>`<i class="${i<=wizStep?'on':''}"></i>`).join('');
  const hourOpt=(sel)=>Array.from({length:18},(_,i)=>i+5).map(h=>`<option value="${h}"${h===sel?' selected':''}>${h>12?h-12+' PM':h===12?'12 PM':h+' AM'}</option>`).join('');
  let body='';
  if(wizStep===0)body=`<div class="wiz-hero"><svg viewBox="0 0 40 40" fill="none"><g fill="var(--clay)"><ellipse cx="20" cy="26" rx="8.5" ry="7"/><ellipse cx="10.5" cy="16" rx="3.6" ry="4.5"/><ellipse cx="20" cy="12.5" rx="3.8" ry="4.7"/><ellipse cx="29.5" cy="16" rx="3.6" ry="4.5"/></g></svg><h3 style="margin-top:8px">Welcome to PawBook Pro</h3>
    <p class="m-sub">Your home for grooms, dogs, rebooking and earnings. Let's set up your book in under a minute.</p></div>`;
  else if(wizStep===1)body=`<h3>What's your business called?</h3><p class="m-sub">This appears on receipts, invoices and your gallery.</p>
    <label>Business name</label><input id="wzName" value="${esc(wizData.name)}" placeholder="e.g. Bubbles & Barks Grooming" autofocus>`;
  else if(wizStep===2)body=`<h3>Your hours & rhythm</h3><p class="m-sub">You can fine-tune all of this later in Settings.</p>
    <div class="form-row"><div><label>Opens</label><select id="wzOpen">${hourOpt(wizData.open)}</select></div>
    <div><label>Closes</label><select id="wzClose">${hourOpt(wizData.close)}</select></div></div>
    <label>Appointment slot size</label><select id="wzSlot"><option value="15">15 minutes</option><option value="30" selected>30 minutes</option><option value="60">1 hour</option></select>`;
  else body=`<h3>How would you like to start?</h3><p class="m-sub">Not sure yet? Explore with sample data — you can reset anytime.</p>
    <div class="wiz-choice">
      <button onclick="wizData.seeded='sample';renderWizardChoice()" id="wzSample"><b>🐾 Explore sample data</b><span>2 groomers, 16 dogs & groom history pre-loaded so every screen feels alive</span></button>
      <button onclick="wizData.seeded='fresh';renderWizardChoice()" id="wzFresh"><b>✨ Start fresh</b><span>An empty book ready for your real dogs & groomers</span></button>
    </div>`;
  const back=wizStep>0?`<button class="btn btn-ghost" onclick="wizBack()">Back</button>`:`<button class="btn btn-ghost" onclick="skipWizard()">Skip</button>`;
  const next=wizStep<3?`<button class="btn btn-primary" onclick="wizNext()">Continue</button>`:`<button class="btn btn-primary" onclick="finishWizard()">Open my book →</button>`;
  openModal(`<div class="wiz-steps">${dots}</div>${body}<div class="m-actions">${back}${next}</div>`);
  if(wizStep===3)renderWizardChoice();
}
function renderWizardChoice(){
  const s=$('wzSample'),f=$('wzFresh');if(!s)return;
  s.style.borderColor=wizData.seeded==='sample'?'var(--teal)':'var(--mist2)';
  f.style.borderColor=wizData.seeded==='fresh'?'var(--teal)':'var(--mist2)';
}
function wizCapture(){
  if(wizStep===1&&$('wzName'))wizData.name=$('wzName').value.trim();
  if(wizStep===2){wizData.open=+$('wzOpen').value;wizData.close=+$('wzClose').value;wizData.slot=+$('wzSlot').value}
}
function wizNext(){wizCapture();if(wizStep===2&&wizData.close<=wizData.open){toast('Closing time must be after opening');return}wizStep++;renderWizard()}
function wizBack(){wizCapture();wizStep--;renderWizard()}
function skipWizard(){DB.settings.onboarded=1;save();closeModal()}
function finishWizard(){
  wizCapture();
  if(wizData.seeded==='fresh'){
    const keepTheme=DB.settings.theme,keepAccent=DB.settings.accent;
    DB=sampleData();
    DB.staff=[];DB.clients=[];DB.appointments=[];DB.services=[];DB.packages=[];
    DB.inventory=[];DB.giftcards=[];DB.expenses=[];DB.waitlist=[];DB.redemptions=[];DB.unlocked={};
    DB.settings.theme=keepTheme;DB.settings.accent=keepAccent;
  }
  DB.settings.name=wizData.name||DB.settings.name;
  DB.settings.open=wizData.open;DB.settings.close=wizData.close;DB.settings.slot=wizData.slot;
  DB.settings.onboarded=1;DB.unlocked=DB.unlocked||{};
  save();applyTheme();closeModal();
  showView('dashboard');
  confetti();toast('🐾 Your book is ready, '+(wizData.name||'welcome')+'!');
}

/* ================================================================
   Demo lock — read-only mode (runs before Init so it's active
   regardless of anything that happens during load/render)
   ================================================================ */
(function(){
  var ETSY_LINK='https://www.etsy.com/listing/4552262510/dog-grooming-tracker-pet-groomer-app';
  document.querySelectorAll('.demo-etsy-link').forEach(function(a){a.href=ETSY_LINK});

  function syncDemoBannerHeight(){
    var b=$('demoBanner');if(!b)return;
    document.documentElement.style.setProperty('--demo-h',b.offsetHeight+'px');
  }
  syncDemoBannerHeight();
  window.addEventListener('load',syncDemoBannerHeight);
  window.addEventListener('resize',syncDemoBannerHeight);
  if(window.ResizeObserver){
    var db=$('demoBanner');if(db)new ResizeObserver(syncDemoBannerHeight).observe(db);
  }

  function showDemoModal(){
    openModal(
      '<button class="m-close" onclick="closeModal()">×</button>'+
      '<div style="text-align:center;padding:8px 4px 2px">'+
      '<div style="font-size:38px;margin-bottom:6px">🐾</div>'+
      '<h3 style="margin-bottom:6px">This is a demo</h3>'+
      '<p class="m-sub" style="font-size:14.5px;line-height:1.55;margin-bottom:20px">Adding, editing, deleting and exporting are turned off in this preview so the sample data stays put for the next visitor. Get the full version to run this for your own grooming business.</p>'+
      '<a href="'+ETSY_LINK+'" target="_blank" rel="noopener" class="btn btn-primary" style="text-decoration:none;display:inline-flex;width:100%;justify-content:center">Unlock Full Version on Etsy →</a>'+
      '</div>'
    );
  }
  window.showDemoModal=showDemoModal;

  // Drag-to-reschedule: keep the drop's visual cleanup, block the actual reassignment
  window.dropAppt=function(e){
    e.preventDefault();
    var cell=e.currentTarget;if(cell)cell.classList.remove('dragover');
    showDemoModal();
  };

  var lockedFns=['saveQuickClient','saveBooking','setStatus','deleteAppt',
    'saveWaitlist','removeWaitlist','bookFromWaitlist',
    'saveClient','deleteClient',
    'delPackage','saveService','deleteService','savePackage',
    'saveStaff','deleteStaff',
    'saveProduct','adjStock','delProduct',
    'saveGift','delGift',
    'saveExpense','delExpense',
    'delPhoto','savePhoto',
    'saveSettings',
    'backupData','restoreData','mergeData','resetData',
    'exportClientsCSV','exportGallery',
    'completeCheckout','finishWizard','skipWizard'];
  lockedFns.forEach(function(name){
    if(typeof window[name]==='function'){
      window[name]=function(){showDemoModal()};
    }
  });
})();

/* ---------- Init ---------- */
load();
applyTheme();
if(!DB.settings.onboarded){startWizard()}
renderDashboard();
updateAlertDot();
(function(){
  const es=$('entryScreen');if(!es)return;
  const bar=$('entryBar');if(bar)requestAnimationFrame(()=>{bar.style.width='75%';setTimeout(()=>{bar.style.width='100%'},600)});
  setTimeout(()=>{es.classList.add('done');setTimeout(()=>es.remove(),650)},1650);
})();
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'){if($('lightbox').classList.contains('open'))closeLightbox();else closeModal()}
  if($('lightbox').classList.contains('open')){if(e.key==='ArrowLeft')navLightbox(-1);if(e.key==='ArrowRight')navLightbox(1)}
});

