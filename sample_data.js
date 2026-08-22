
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