/* MN4 AI Stylist Wizard v5.0 — Magic-first flow
   New visitor: Try → Photo → Occasion → First Look → Personalize (optional)
   Returning:   Occasion → Style mode → Budget → Brands → Create → Look
   Backend contract unchanged (drishti-api.fly.dev). */
(function(){
'use strict';

var API='https://drishti-api.fly.dev';

/* ── Occasions (6 hero cards + other) ── */
var OCC=[
{id:'casual',label:'Everyday',emoji:'\u{1F45F}',hint:'Daily ease'},
{id:'work',label:'Work',emoji:'\u{1F4BC}',hint:'Office & meetings'},
{id:'date',label:'Date',emoji:'\u{1F377}',hint:'Dinner & evenings'},
{id:'party',label:'Party',emoji:'\u{1F389}',hint:'Nights out'},
{id:'travel',label:'Travel',emoji:'\u2708\uFE0F',hint:'Trips & escapes'},
{id:'wedding',label:'Wedding',emoji:'\u{1F48D}',hint:'Celebrations'}
];

/* ── Style DNA options ── */
var DNA_STYLES=[
{id:'minimalist',label:'Minimal'},{id:'streetwear',label:'Streetwear'},
{id:'classic',label:'Classic'},{id:'old money',label:'Old Money'},
{id:'casual',label:'Casual'},{id:'athleisure',label:'Athleisure'},
{id:'glam',label:'Trendy'},{id:'y2k',label:'Experimental'},
{id:'ethnic',label:'Indian'},{id:'indo-western',label:'Fusion'},
{id:'corporate',label:'Corporate'},{id:'boho',label:'Boho'}
];

var DNA_OCCASIONS=[
{id:'college',label:'College'},{id:'work',label:'Office'},{id:'date',label:'Dates'},
{id:'party',label:'Parties'},{id:'travel',label:'Travel'},{id:'gym',label:'Gym'},
{id:'festive',label:'Events'},{id:'wedding',label:'Weddings'},{id:'casual',label:'Everyday'}
];

var DNA_PLACES=['Myntra','AJIO','Amazon Fashion','Tata CLiQ','Nykaa Fashion','Flipkart','Meesho','Brand stores'];

var CLOSET_CATS=['Top','Bottom','Shoes','Outerwear','Accessory'];

/* ── Look narrative pools (algorithmic naming) ── */
var LOOK_META={
casual:{names:['Everyday Ease','Weekend Drifter','Easy Sunday','City Comfort'],
descs:['Clean. Comfortable. Effortless.','Easy pieces for wherever the day goes.','Relaxed fits, soft tones, zero fuss.','Laid-back layers that just work.'],
tags:[['Everyday','Comfort','Easy'],['City','Casual','Day Out'],['Relaxed','Soft','Weekend'],['Simple','Clean','Daily']]},
work:{names:['Modern Professional','Corner Office','Boardroom Edit','Nine to Five'],
descs:['Sharp. Polished. Ready for anything.','Tailored pieces that mean business.','Structured fits for long days.','Quiet confidence, clean lines.'],
tags:[['Office','Meetings','Smart'],['Formal','Tailored','Sharp'],['Work','Focused','Clean'],['Office','Classic','Daily']]},
date:{names:['Evening Edit','Candlelight','City Night','Soft Focus'],
descs:['Warm tones. Easy charm.','Dressed up just enough.','A little bold, a little soft.','Made for golden hour.'],
tags:[['Date','Dinner','Evening'],['Romantic','Warm','Night'],['City','Drinks','Chic'],['Evening','Soft','Charm']]},
party:{names:['Night Shift','After Hours','Spotlight','Velvet Hour'],
descs:['Turn the volume up.','Made to be noticed.','Bold pieces, late nights.','Glamour with an edge.'],
tags:[['Party','Night','Bold'],['Club','Statement','Fun'],['Party','Glam','Late'],['Night','Chic','Mood']]},
travel:{names:['Tropical Explorer','City Nomad','Coastal Drifter','Weekend Wanderer'],
descs:['Breezy. Comfortable. Built for adventures.','Light layers for long days out.','Pack-friendly pieces that breathe.','Made for movement and warm air.'],
tags:[['Beach','Sightseeing','Day Out'],['City','Caf\u00E9s','Evening'],['Travel','Breezy','Sunny'],['Trip','Light','Easy']]},
wedding:{names:['Celebration Story','Festive Grace','Golden Hour','Ceremony Edit'],
descs:['Rich fabrics. Joyful colours.','Dressed for the big moment.','Elegant from ceremony to dinner.','Traditional roots, modern ease.'],
tags:[['Wedding','Elegant','Festive'],['Celebration','Gold','Grace'],['Ceremony','Ethnic','Charm'],['Shaadi','Rich','Classic']]},
festive:{names:['Festive Glow','Celebration Edit','Diwali Nights','Utsav Story'],
descs:['Colours that celebrate.','Festive fabrics, easy drapes.','Shine a little brighter.','Tradition, styled new.'],
tags:[['Festive','Ethnic','Glow'],['Puja','Colour','Joy'],['Diwali','Rich','Night'],['Utsav','Classic','Warm']]},
gym:{names:['Motion Set','Active Energy','Studio Flow','Kinetic'],
descs:['Breathable. Stretch. Repeat.','Built to move with you.','Sweat-ready, style-first.','Light, fast, focused.'],
tags:[['Gym','Active','Dry Fit'],['Run','Sport','Cool'],['Studio','Flow','Stretch'],['Train','Fast','Light']]},
college:{names:['Campus Classic','Study Break','Quad Style','Lecture Hall'],
descs:['Easy fits for long days.','Comfort that works everywhere.','Casual, clean, confident.','Made for between classes.'],
tags:[['College','Casual','Easy'],['Campus','Comfort','Daily'],['Study','Relaxed','Cool'],['Class','Simple','Fresh']]},
beach:{names:['Coastal Drifter','Tide Line','Sun Seeker','Shore Break'],
descs:['Breezy. Comfortable. Sun-ready.','Light fabrics, salt air.','Made for the shoreline.','Easy layers, golden light.'],
tags:[['Beach','Breezy','Sun'],['Coast','Light','Day'],['Sun','Easy','Sea'],['Shore','Casual','Bright']]},
brunch:{names:['Sunday Brunch','Terrace Table','Late Latte','Golden Morning'],
descs:['Soft colours, easy mood.','Dressed for good company.','Casual but considered.','Weekend energy, styled.'],
tags:[['Brunch','Casual','Soft'],['Caf\u00E9','Easy','Chic'],['Morning','Light','Warm'],['Weekend','Relaxed','Clean']]}
};

/* ── State ── */
var st={
flow:'new',steps:['landing'],step:0,
loading:false,error:null,
photo:null,photoUrl:null,bodyData:{},
occasion:null,otherOccasion:'',style:null,gender:null,
outfits:[],hero:null,vtonImage:null,vtonRunning:false,
looks:[],activeLook:0,savedLooks:{},weather:null,
dnaStyles:[],dnaOccasions:[],dnaBrands:[],dnaPlaces:[],
dnaBudget:4000,dnaBrandMode:'ai',dnaBrandQuery:'',
rMode:null,rCategories:[],rBrandMode:'ai',rBrands:[],rBrandQuery:'',
dynamicBrands:null,budgetIntel:null,quickPicks:null,
authEmail:'',authOtp:'',authStage:'idle',authBusy:false,
token:null,user:null,
closet:[],closetBusy:false,
whyList:[],
sliderVal:4000
};

var progressEl,scrollEl,dotsEl,prevStep=-1;
var W=window.MN4=window.MN4||{};

/* ══════════ Helpers ══════════ */
function esc(s){var d=document.createElement('div');d.textContent=s==null?'':String(s);return d.innerHTML;}
function fmtPrice(n){var c=window.MN_currency;if(c&&c.format)return c.format(n);return'\u20B9'+Number(n||0).toLocaleString('en-IN');}
function fmtShort(n){n=Number(n)||0;if(n>=100000)return'\u20B9'+(n/100000).toFixed(n%100000?1:0)+'L';if(n>=1000)return'\u20B9'+(n/1000).toFixed(n%1000?1:0)+'K';return'\u20B9'+Math.round(n);}
function postJSON(path,body,token){
var headers={'Content-Type':'application/json'};
if(token)headers['Authorization']='Bearer '+token;
return fetch(API+path,{method:'POST',headers:headers,body:JSON.stringify(body)}).then(function(r){return r.json().then(function(d){if(!r.ok)throw new Error(d.detail||('HTTP '+r.status));return d;});});
}
function slotLabel(slot){
return{top:'Top',bottom:'Bottom',shoes:'Shoes',accessory:'Accessory',full:'Outfit'}[slot]||'Piece';
}

/* ══════════ Storage ══════════ */
var LS_KEY='mn4_style_dna_v1';
function loadLocal(){
try{
var raw=localStorage.getItem(LS_KEY);if(!raw)return null;
return JSON.parse(raw);
}catch(e){return null;}
}
function saveLocal(){
try{
localStorage.setItem(LS_KEY,JSON.stringify({
styles:st.dnaStyles,occasions:st.dnaOccasions,brands:st.dnaBrands,
places:st.dnaPlaces,budget:st.dnaBudget,closet:st.closet,gender:st.gender,ts:Date.now()
}));
}catch(e){}
}
function hasProfile(){
var p=loadLocal();
return !!(p&&((p.styles&&p.styles.length)||(p.occasions&&p.occasions.length)||(p.closet&&p.closet.length)));
}
function restoreLocal(){
var p=loadLocal();if(!p)return;
st.dnaStyles=p.styles||[];st.dnaOccasions=p.occasions||[];
st.dnaBrands=p.brands||[];st.dnaPlaces=p.places||[];
st.dnaBudget=p.budget||4000;st.closet=p.closet||[];st.gender=p.gender||null;
}
function saveServerProfile(){
if(!st.token)return Promise.resolve();
return fetch(API+'/api/user/me',{method:'PATCH',
headers:{'Content-Type':'application/json','Authorization':'Bearer '+st.token},
body:JSON.stringify({
style_profile:{styles:st.dnaStyles,occasions:st.dnaOccasions,brands:st.dnaBrands,places:st.dnaPlaces,budget:st.dnaBudget},
preferences:{closet_count:st.closet.length}
})}).then(function(r){return r.json();}).catch(function(){});
}

/* ══════════ Steps ══════════ */
function buildSteps(){
if(st.flow==='new'){
st.steps=['landing','photo','occasion','creating','result','signup',
'dna_style','dna_occasion','dna_budget','dna_brands','dna_closet','done'];
}else{
st.steps=['r_occasion','r_mode'];
if(st.rMode==='mixed')st.steps.push('r_category');
st.steps.push('r_budget','r_brands','r_creating','r_result');
}
}
function curStep(){return st.steps[st.step]||'landing';}
function goStep(id){
var i=st.steps.indexOf(id);
if(i>=0){st.step=i;render();}
}
function nextStep(){if(st.step<st.steps.length-1){st.step++;render();}}
function prevStep(){if(st.step>0){st.step--;render();}}
function startNewFlow(){st.flow='new';buildSteps();st.step=0;render();}
function startReturnFlow(){st.flow='return';st.rMode=null;st.rCategories=[];buildSteps();st.step=0;render();}

/* ══════════ Auth (email OTP) ══════════ */
function sendOtp(){
if(!st.authEmail||st.authEmail.indexOf('@')<0){st.error='Enter a valid email';render();return;}
st.authBusy=true;st.error=null;render();
postJSON('/api/user/send-otp',{email:st.authEmail})
.then(function(){st.authStage='otp';st.authBusy=false;render();})
.catch(function(e){st.authBusy=false;st.error=e.message||'Could not send code';render();});
}
function verifyOtp(){
if(!st.authOtp){st.error='Enter the code';render();return;}
st.authBusy=true;st.error=null;render();
postJSON('/api/user/verify-otp',{contact:st.authEmail,otp:st.authOtp,purpose:'login'})
.then(function(d){
st.token=d.token;st.user=d.user;st.authBusy=false;
try{localStorage.setItem('mn4_token',d.token);}catch(e){}
saveServerProfile();
nextStep();
})
.catch(function(e){st.authBusy=false;st.error=e.message||'Invalid code';render();});
}
function loadToken(){
try{var t=localStorage.getItem('mn4_token');if(t)st.token=t;}catch(e){}
}

/* ══════════ Closet ══════════ */
function shrinkImage(dataUrl,cb){
var img=new Image();
img.onload=function(){
var MAX=560;
var w=img.width,h=img.height;
if(w>h&&w>MAX){h=Math.round(h*MAX/w);w=MAX;}
else if(h>MAX){w=Math.round(w*MAX/h);h=MAX;}
var canvas=document.createElement('canvas');
canvas.width=w;canvas.height=h;
var ctx=canvas.getContext('2d');
ctx.drawImage(img,0,0,w,h);
try{cb(canvas.toDataURL('image/jpeg',0.78));}catch(e){cb(dataUrl);}
};
img.onerror=function(){cb(dataUrl);};
img.src=dataUrl;
}
function addClosetFiles(files){
if(!files||!files.length)return;
st.closetBusy=true;render();
var pending=Array.prototype.slice.call(files).slice(0,6);
var done=0;
function step(){
done++;
if(done>=pending.length){st.closetBusy=false;saveLocal();render();}
}
pending.forEach(function(f){
if(f.size>10*1024*1024){step();return;}
var reader=new FileReader();
reader.onload=function(ev){
shrinkImage(ev.target.result,function(shrunk){
st.closet.push({url:shrunk,category:guessCategory(f.name||''),name:(f.name||'Closet item').replace(/\.[a-z]+$/i,'')});
step();
});
};
reader.readAsDataURL(f);
});
}
function guessCategory(name){
var n=(name||'').toLowerCase();
if(/jean|trouser|pant|short|skirt|bottom/.test(n))return'Bottom';
if(/shoe|sneaker|heel|sandal|boot|loafer/.test(n))return'Shoes';
if(/jacket|blazer|coat|outer|hoodie/.test(n))return'Outerwear';
if(/bag|watch|belt|cap|sunglass|accessor/.test(n))return'Accessory';
return'Top';
}
function cycleCategory(url){
var item=null;for(var i=0;i<st.closet.length;i++)if(st.closet[i].url===url)item=st.closet[i];
if(!item)return;
var idx=CLOSET_CATS.indexOf(item.category);
item.category=CLOSET_CATS[(idx+1)%CLOSET_CATS.length];
saveLocal();render();
}

/* ══════════ Photo ══════════ */
function handlePhotoFile(e){
var f=e.target.files&&e.target.files[0];if(!f)return;
if(f.size>10*1024*1024){st.error='Max 10MB';render();return;}
if(!f.type.match(/^image\/(jpeg|png|webp)$/)){st.error='Use JPG/PNG/WebP';render();return;}
st.error=null;
var reader=new FileReader();
reader.onload=function(ev){st.photo=ev.target.result;render();analyzePhoto(ev.target.result);};
reader.readAsDataURL(f);
}
function analyzePhoto(dataUrl){
var pts=dataUrl.split(','),mime=(pts[0].match(/:(.*?);/)||[])[1]||'image/jpeg';
var bin=atob(pts[1]),arr=new Uint8Array(bin.length);
for(var i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);
var blob=new Blob([arr],{type:mime}),fd=new FormData();
fd.append('file',blob,'body.jpg');
fd.append('gender',st.gender||'');
fetch(API+'/api/analysis/body/upload',{method:'POST',body:fd})
.then(function(r){return r.json();})
.then(function(d){if(d&&d.body_data)st.bodyData=d.body_data;})
.catch(function(){});
}
function uploadPerson(dUrl,cb){
var pts=dUrl.split(','),mime=(pts[0].match(/:(.*?);/)||[])[1]||'image/jpeg';
var bin=atob(pts[1]),arr=new Uint8Array(bin.length);
for(var i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);
var blob=new Blob([arr],{type:mime}),fd=new FormData();
fd.append('file',blob,'person.jpg');fd.append('session_id','mn4_'+Date.now());
fetch(API+'/api/vton/upload-person',{method:'POST',body:fd})
.then(function(r){return r.json();})
.then(function(d){var url=d.url||d.person_image_url||d.image_url||d.image||null;cb(url);})
.catch(function(){cb(null);});
}

/* ══════════ Recommendation payloads ══════════ */
function totalBudgetToBand(total){
var perItem=total/2.8;
return{min:Math.round(perItem*0.65),max:Math.round(perItem*1.45)};
}
function basePayload(){
var p={
occasion:st.occasion||'casual',
style:st.style||'',
gender:st.gender||'',
brands:(st.flow==='new'?st.dnaBrands:st.rBrands)||[],
body_data:st.bodyData||{},
count:6
};
var total=st.flow==='new'?0:st.dnaBudget;
if(total){
var band=totalBudgetToBand(total);
p.budget_min=band.min;p.budget_max=band.max;
}
if(st.weather){
p.weather={temp:st.weather.temp,desc:st.weather.desc,condition:st.weather.condition};
p.city=st.weather.city||'';
}
return p;
}

/* ══════════ First look (new user) ══════════ */
function runFirstLook(){
st.loading=true;st.error=null;st.vtonImage=null;render();
requestWeather(function(w){
if(w)st.weather=w;
var p=basePayload();
fetchRecs(p).then(function(result){
st.outfits=result.recs||[];
if(!st.outfits.length){st.loading=false;st.error='No looks found. Try another occasion.';render();return;}
st.hero=st.outfits[0];
buildLooks();
st.loading=false;
goStep('result');
startLooksVton();
}).catch(function(e){
st.loading=false;st.error=e.message||'Could not create your look';render();
});
});
}
function fetchRecs(p){
var fetchMain=fetch(API+'/api/reco/outfits',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)})
.then(function(r){return r.json();})
.then(function(d){
var recs=(d.recommendations||d.outfits||[]).map(function(r){
return{
id:r.product_id||r.id,
title:r.title||'Recommended',
price:r.price||0,
mrp:r.mrp||0,
discount_pct:r.discount_pct||0,
url:r.url||r.product_url||'',
image_url:r.image_url||r.image||'',
slot:r.slot||'top',
vton_friendly:r.vton_friendly!==false,
source:r.source||'',
brand:r.brand||'',
reason:r.reason||'',
score:r.score||0
};
});
st.dynamicBrands=d.brands||st.dynamicBrands;
st.budgetIntel=d.budget_intelligence||null;
if(d.budget_intelligence&&d.budget_intelligence.quick_picks)st.quickPicks=d.budget_intelligence.quick_picks;
return{recs:recs};
});
if(st.photo&&!st.photoUrl){
return new Promise(function(resolve){
uploadPerson(st.photo,function(u){if(u)st.photoUrl=u;resolve(fetchMain);});
}).then(function(p2){return p2;});
}
return fetchMain;
}
function buildLooks(){
var items=st.outfits||[];
if(!items.length){st.looks=[];return;}
var meta=LOOK_META[st.occasion]||LOOK_META.casual;
var heroes=items.filter(function(o){return o.vton_friendly&&(o.slot==='top'||o.slot==='full');});
if(!heroes.length)heroes=items.slice(0,1);
var pools={bottom:[],shoes:[],accessory:[],full:[],top:[]};
items.forEach(function(o){if(pools[o.slot])pools[o.slot].push(o);});
st.looks=heroes.slice(0,4).map(function(hero,i){
var companions=[];
if(hero.slot!=='full'){
if(pools.bottom[i%Math.max(pools.bottom.length,1)])companions.push(pools.bottom[i%pools.bottom.length]);
if(pools.shoes[i%Math.max(pools.shoes.length,1)])companions.push(pools.shoes[i%pools.shoes.length]);
if(pools.accessory[i%Math.max(pools.accessory.length,1)])companions.push(pools.accessory[i%pools.accessory.length]);
}else{
if(pools.shoes[i%Math.max(pools.shoes.length,1)])companions.push(pools.shoes[i%pools.shoes.length]);
if(pools.accessory[i%Math.max(pools.accessory.length,1)])companions.push(pools.accessory[i%pools.accessory.length]);
}
var lookItems=[hero].concat(companions);
var total=0;lookItems.forEach(function(x){total+=x.price||0;});
return{
id:hero.id||('look_'+i),
name:meta.names[i%meta.names.length],
desc:meta.descs[i%meta.descs.length],
tags:meta.tags[i%meta.tags.length],
hero:hero,items:lookItems,total:total,
vton:null,vtonFailed:false
};
});
st.activeLook=0;
}
function saveLook(i){
if(!st.looks[i])return;
var id=st.looks[i].id;
if(st.savedLooks[id])delete st.savedLooks[id];else st.savedLooks[id]=1;
try{localStorage.setItem('mn4_saved_looks',JSON.stringify(st.savedLooks));}catch(e){}
render();
}
function loadSavedLooks(){
try{var raw=localStorage.getItem('mn4_saved_looks');if(raw)st.savedLooks=JSON.parse(raw);}catch(e){}
}
/* ══════════ Geolocation → Weather (silent recommendation signal) ══════════ */
function requestWeather(cb){
if(st.weather){cb(st.weather);return;}
if(!navigator.geolocation){cb(null);return;}
var settled=false;
function done(w){if(settled)return;settled=true;cb(w||null);}
var timer=setTimeout(function(){done(null);},7000);
navigator.geolocation.getCurrentPosition(
function(pos){
postJSON('/api/weather/current',{lat:pos.coords.latitude,lon:pos.coords.longitude})
.then(function(d){
var w={
temp:Math.round(d.temp_c!=null?d.temp_c:28),
condition:(d.condition||'').toLowerCase(),
desc:d.description||'Clear',
icon:d.icon||'\u2600\uFE0F',
city:d.city||''
};
try{localStorage.setItem('mn4_weather',JSON.stringify({w:w,ts:Date.now()}));}catch(e){}
clearTimeout(timer);done(w);
})
.catch(function(){clearTimeout(timer);done(null);});
},
function(){clearTimeout(timer);done(null);},
{timeout:6000,maximumAge:1800000}
);
}
function loadCachedWeather(){
try{
var raw=localStorage.getItem('mn4_weather');
if(!raw)return;
var d=JSON.parse(raw);
if(d&&d.w&&Date.now()-d.ts<3600000)st.weather=d.w;
}catch(e){}
}
function startLooksVton(){
if(!st.looks.length)return;
var personUrl=st.photoUrl||st.photo;
if(!personUrl)return;
var queue=st.looks.map(function(_,i){return i;});
function next(){
if(!queue.length)return;
var i=queue.shift();
var look=st.looks[i];
if(!look||!look.hero||!look.hero.image_url){next();return;}
function doVton(finalGarment){
if(!finalGarment){look.vtonFailed=true;render();next();return;}
fetch(API+'/api/vton/try-on',{method:'POST',headers:{'Content-Type':'application/json'},
body:JSON.stringify({person_image_url:personUrl,garment_image_url:finalGarment,extract_garment:false,seed:randomSeed()})})
.then(function(r){return r.json();})
.then(function(d){
var url=d.result_image||d.result_image_url||d.vton_image_url||d.image_url||d.output_image||d.image||d.url;
if(url)look.vton=url;else look.vtonFailed=true;
render();next();
}).catch(function(){look.vtonFailed=true;render();next();});
}
var gUrl=look.hero.image_url;
if(gUrl&&gUrl.indexOf('data:')===0){
uploadGarmentToGetUrl(gUrl,function(u){doVton(u||null);});
}else{doVton(gUrl);}
}
next();
}
function randomSeed(){
return Math.floor(Math.random()*2147483647);
}
function regenLook(i){
var look=st.looks[i];
if(!look||!look.hero)return;
var personUrl=st.photoUrl||st.photo;
if(!personUrl)return;
look.vton=null;look.vtonFailed=false;look.regenerating=true;
render();
var gUrl=look.hero.image_url;
function doVton(finalGarment){
if(!finalGarment){look.vtonFailed=true;look.regenerating=false;render();return;}
fetch(API+'/api/vton/try-on',{method:'POST',headers:{'Content-Type':'application/json'},
body:JSON.stringify({person_image_url:personUrl,garment_image_url:finalGarment,extract_garment:false,seed:randomSeed()})})
.then(function(r){return r.json();})
.then(function(d){
var url=d.result_image||d.result_image_url||d.vton_image_url||d.image_url||d.output_image||d.image||d.url;
if(url)look.vton=url;else look.vtonFailed=true;
look.regenerating=false;render();
}).catch(function(){look.vtonFailed=true;look.regenerating=false;render();});
}
if(gUrl&&gUrl.indexOf('data:')===0){
uploadGarmentToGetUrl(gUrl,function(u){doVton(u||null);});
}else{doVton(gUrl);}
}
function uploadGarmentToGetUrl(dataUrl,cb){
var pts=dataUrl.split(','),mime=(pts[0].match(/:(.*?);/)||[])[1]||'image/png';
var bin=atob(pts[1]),arr=new Uint8Array(bin.length);
for(var i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);
var blob=new Blob([arr],{type:mime}),fd=new FormData();
fd.append('file',blob,'garment.png');fd.append('session_id','mn4_garment_'+Date.now());
fetch(API+'/api/vton/upload-person',{method:'POST',body:fd})
.then(function(r){return r.json();})
.then(function(d){var url=d.url||d.person_image_url||d.image_url||null;cb(url);})
.catch(function(){cb(null);});
}

/* ══════════ Returning-user look ══════════ */
function runReturnLook(){
st.loading=true;st.error=null;st.vtonImage=null;render();
requestWeather(function(w){
if(w)st.weather=w;
var p=basePayload();
if(st.rMode==='mixed'&&st.rCategories.length){
p.look_categories=st.rCategories;
}
fetchRecs(p).then(function(result){
st.outfits=result.recs||[];
if(st.rMode==='wardrobe'&&st.closet.length){
st.outfits=st.closet.map(function(c,i){
return{id:'wardrobe_'+i,title:c.name||'Your item',price:0,url:'',image_url:c.url,slot:'top',vton_friendly:true,source:'wardrobe',brand:'Your wardrobe'};
});
}
if(!st.outfits.length){st.loading=false;st.error='No looks found. Try different settings.';render();return;}
st.hero=st.outfits[0];
buildLooks();
buildWhyList();
st.loading=false;
goStep('r_result');
startLooksVton();
}).catch(function(e){
st.loading=false;st.error=e.message||'Could not create your look';render();
});
});
}
function buildWhyList(){
var list=[];
if(st.dnaStyles.length)list.push('Fits your '+st.dnaStyles.slice(0,2).join(' & ')+' preference');
if(st.occasion){
var occLabel=st.occasion;
for(var i=0;i<OCC.length;i++)if(OCC[i].id===st.occasion)occLabel=OCC[i].label;
list.push('Works for '+occLabel.toLowerCase());
}
if(st.weather&&st.weather.temp){
var w=st.weather;
var note=w.temp>=28?'Breathable fabrics for '+w.temp+'\u00B0C':w.temp<=15?'Warm layers for '+w.temp+'\u00B0C':'Comfortable fabrics for today';
list.push(note);
}
if(st.rMode==='wardrobe')list.push('Built from your own wardrobe');
else if(st.rMode==='mixed')list.push('Uses your wardrobe with new pieces');
if(st.dnaBudget)list.push('Within your '+fmtShort(st.dnaBudget)+' look budget');
if(st.rBrands.length)list.push('Shops '+st.rBrands.slice(0,2).join(', '));
st.whyList=list;
}

/* ══════════ Dynamic brands ══════════ */
var _brandTimer=null;
function fetchDynamicBrands(){
if(!st.occasion)return;
clearTimeout(_brandTimer);
_brandTimer=setTimeout(function(){
var body={occasion:st.occasion,style:st.style||'',gender:st.gender||''};
var total=st.dnaBudget;
if(total){var b=totalBudgetToBand(total);body.budget_min=b.min;body.budget_max=b.max;}
postJSON('/api/reco/brands',body)
.then(function(d){
st.dynamicBrands=d.brands||[];
if(d.budget_intelligence&&d.budget_intelligence.quick_picks)st.quickPicks=d.budget_intelligence.quick_picks;
render();
}).catch(function(){});
},450);
}

/* ══════════ Actions ══════════ */
function handleClick(e){
var b=e.target.closest('[data-action]');
if(!b)return;
var a=b.getAttribute('data-action'),v=b.getAttribute('data-value');
switch(a){
case'try-now':goStep('photo');break;
case'back':prevStep();break;
case'nxt':nextStep();break;
case'go':goStep(v);break;
case'restart':resetAll();break;
case'photo-trigger':{var inp=document.getElementById('mn4-photo-input');if(inp)inp.click();break;}
case'photo-remove':st.photo=null;st.photoUrl=null;st.bodyData={};render();break;
case'occ':st.occasion=v;st.otherOccasion='';st.style=null;render();fetchDynamicBrands();break;
case'occ-other-toggle':st.otherOccasion=st.otherOccasion?'':' ';render();
setTimeout(function(){var el=document.getElementById('mn4-other-input');if(el)el.focus();},50);break;
case'occ-other-submit':{var el2=document.getElementById('mn4-other-input');
if(el2&&el2.value.trim()){st.occasion=el2.value.trim().toLowerCase();st.otherOccasion='';render();}break;}
case'create-look':{if(st.flow==='new'){goStep('creating');}else{goStep('r_creating');}break;}
case'try-another':{st.vtonImage=null;goStep(st.flow==='new'?'creating':'r_creating');break;}
case'personalize':goStep('signup');break;
case'personalize-later':goStep('done');break;
case'auth-send':sendOtp();break;
case'auth-verify':verifyOtp();break;
case'auth-skip':saveLocal();goStep('dna_style');break;
case'dna-style-toggle':toggleIn(st.dnaStyles,v);render();break;
case'dna-occ-toggle':toggleIn(st.dnaOccasions,v);render();break;
case'dna-place-toggle':toggleIn(st.dnaPlaces,v);render();break;
case'dna-brand-toggle':toggleIn(st.dnaBrands,v);render();break;
case'dna-brand-ai':st.dnaBrands=[];st.dnaBrandMode='ai';render();break;
case'dna-brand-manual':st.dnaBrandMode='manual';render();break;
case'dna-next':saveLocal();saveServerProfile();nextStep();break;
case'closet-trigger':{var ci=document.getElementById('mn4-closet-input');if(ci)ci.click();break;}
case'closet-remove':st.closet=st.closet.filter(function(c){return c.url!==v;});saveLocal();render();break;
case'closet-cat':cycleCategory(v);break;
case'closet-instagram':st.error='Instagram import is invite-only for now. Skip for now \u2014 your closet works without it.';render();break;
case'closet-done':saveLocal();saveServerProfile();nextStep();break;
case'r-mode':st.rMode=v;buildSteps();nextStep();break;
case'r-cat-toggle':toggleIn(st.rCategories,v);render();break;
case'r-cat-done':nextStep();break;
case'r-brand-ai':st.rBrands=[];st.rBrandMode='ai';render();break;
case'r-brand-manual':st.rBrandMode='manual';render();break;
case'r-brand-toggle':toggleIn(st.rBrands,v);render();break;
case'car-prev':carouselGo(-1);break;
case'car-next':carouselGo(1);break;
case'car-goto':carouselGoto(parseInt(v,10)||0);break;
case'save-look':saveLook(parseInt(v,10)||0);break;
case'regen-look':regenLook(parseInt(v,10)||0);break;
case'shop-now':if(v&&v!=='#')window.open(v,'_blank');break;
case'shop-look':{var look=st.looks[st.activeLook];
if(look){for(var i=0;i<look.items.length;i++){if(look.items[i].url){window.open(look.items[i].url,'_blank');break;}}}break;}
case'start-over':resetAll();break;
}
}
function toggleIn(arr,v){
var i=arr.indexOf(v);
if(i>=0)arr.splice(i,1);else arr.push(v);
}
function carouselGo(dir){
var next=st.activeLook+dir;
if(next<0||next>=st.looks.length)return;
carouselGoto(next);
}
function carouselGoto(i){
if(i<0||i>=st.looks.length)return;
st.activeLook=i;
var el=document.getElementById('mn4-carousel');
if(el){
var slide=el.querySelector('[data-slide="'+i+'"]');
if(slide){
var target=slide.offsetLeft-el.offsetLeft;
if(typeof el.scrollTo==='function'){el.scrollTo({left:target,behavior:'smooth'});}
else{el.scrollLeft=target;}
}
updateCarouselDots();
updateLookSections();
}else{render();}
}
function updateCarouselDots(){
var dots=document.querySelectorAll('.mn4-car-dot');
for(var i=0;i<dots.length;i++){
dots[i].className='mn4-car-dot'+(i===st.activeLook?' mn4-car-dot--active':'');
}
}
function updateLookSections(){
var itemsEl=document.getElementById('mn4-items-zone');
var compareEl=document.getElementById('mn4-compare-zone');
if(itemsEl)itemsEl.innerHTML=itemsStripHTML();
if(compareEl)compareEl.innerHTML=compareShopHTML();
var loader=document.getElementById('mn4-active-loader');
if(loader)startVtonLoaderAnim(loader);
}
function resetAll(){
st.photo=null;st.photoUrl=null;st.bodyData={};st.occasion=null;st.style=null;
st.outfits=[];st.hero=null;st.vtonImage=null;st.error=null;
st.looks=[];st.activeLook=0;st.locationEdit=false;
st.rMode=null;st.rCategories=[];st.rBrands=[];st.authStage='idle';st.authOtp='';
if(hasProfile()){startReturnFlow();}else{startNewFlow();}
}

/* ══════════ Sliders (inline handlers) ══════════ */
W._onBudgetInput=function(val){
st.sliderVal=parseInt(val,10)||4000;
var el=document.getElementById('mn4-budget-out');
if(el)el.textContent=fmtShort(st.sliderVal*0.8)+' \u2013 '+fmtShort(st.sliderVal*1.25);
};
W._onBudgetCommit=function(val){
st.dnaBudget=parseInt(val,10)||4000;st.sliderVal=st.dnaBudget;
render();fetchDynamicBrands();
};

/* ══════════ VTON Loader ══════════ */
var _vtonStages=[
{icon:'\u{1F3A8}',msg:'Creating your look...',sub:'Finding pieces that fit your occasion',dur:2600},
{icon:'\u{1F457}',msg:'Styling the fit...',sub:'Matching real products to your photo',dur:3200},
{icon:'\u2728',msg:'Almost there...',sub:'Building your complete look',dur:3000}
];
function vtonLoaderHTML(){
return'<div class="mn4-vton-loader">'
+'<div class="mn4-vton-loader-ring"><div class="mn4-vton-loader-icon">'+_vtonStages[0].icon+'</div><div class="mn4-vton-scan-line"></div></div>'
+'<div class="mn4-vton-loader-stage">'+_vtonStages[0].msg+'</div>'
+'<div class="mn4-vton-loader-sub">'+_vtonStages[0].sub+'</div>'
+'<div class="mn4-vton-loader-dots"><div class="mn4-vton-loader-dot mn4-vton-loader-dot--active"></div><div class="mn4-vton-loader-dot"></div><div class="mn4-vton-loader-dot"></div></div>'
+'</div>';
}
function startVtonLoaderAnim(container){
var stageIdx=0;
function advance(){
stageIdx++;
if(stageIdx>=_vtonStages.length)return;
var stage=_vtonStages[stageIdx];
var iconEl=container.querySelector('.mn4-vton-loader-icon');
var msgEl=container.querySelector('.mn4-vton-loader-stage');
var subEl=container.querySelector('.mn4-vton-loader-sub');
if(iconEl)iconEl.textContent=stage.icon;
if(msgEl)msgEl.textContent=stage.msg;
if(subEl)subEl.textContent=stage.sub;
var dots=container.querySelectorAll('.mn4-vton-loader-dot');
for(var i=0;i<dots.length;i++){
dots[i].className='mn4-vton-loader-dot';
if(i<stageIdx)dots[i].className+=' mn4-vton-loader-dot--done';
else if(i===stageIdx)dots[i].className+=' mn4-vton-loader-dot--active';
}
setTimeout(advance,stage.dur);
}
setTimeout(advance,_vtonStages[0].dur);
}

/* ══════════ Render ══════════ */
function render(){
if(!scrollEl)return;
var id=curStep();

if(progressEl){
var pct=Math.round((st.step/Math.max(st.steps.length-1,1))*100);
progressEl.innerHTML='<div class="mn4-progress"><div class="mn4-progress-fill" style="width:'+pct+'%"></div></div>';
}

var h='';
switch(id){
case'landing':h=rLanding();break;
case'photo':h=rPhoto();break;
case'occasion':h=rOccasion();break;
case'creating':h=rCreating();break;
case'result':h=rResult();break;
case'signup':h=rSignup();break;
case'dna_style':h=rDnaStyle();break;
case'dna_occasion':h=rDnaOccasion();break;
case'dna_budget':h=rDnaBudget();break;
case'dna_brands':h=rDnaBrands();break;
case'dna_closet':h=rDnaCloset();break;
case'done':h=rDone();break;
case'r_occasion':h=rROccasion();break;
case'r_mode':h=rRMode();break;
case'r_category':h=rRCategory();break;
case'r_budget':h=rRBudget();break;
case'r_brands':h=rRBrands();break;
case'r_creating':h=rRCreating();break;
case'r_result':h=rRResult();break;
default:h=rLanding();
}

scrollEl.innerHTML=h;
if(st.step!==prevStep){scrollEl.scrollTop=0;prevStep=st.step;}

if(dotsEl){
var dh='<div class="mn4-dots">';
for(var i=0;i<st.steps.length;i++){
var c='mn4-dot';
if(i===st.step)c+=' mn4-dot--active';else if(i<st.step)c+=' mn4-dot--done';
dh+='<div class="'+c+'"></div>';
}
dotsEl.innerHTML=dh+'</div>';
}

var loader=scrollEl.querySelector('.mn4-vton-loader');
if(loader)startVtonLoaderAnim(loader);

var car=document.getElementById('mn4-carousel');
if(car){
if(st.activeLook>0){
var slide=car.querySelector('[data-slide="'+st.activeLook+'"]');
if(slide)car.scrollLeft=slide.offsetLeft-car.offsetLeft;
}
var debounce=null;
car.addEventListener('scroll',function(){
if(debounce)clearTimeout(debounce);
debounce=setTimeout(function(){
var slides=car.querySelectorAll('.mn4-slide');
var best=0,bestDist=Infinity;
for(var i=0;i<slides.length;i++){
var d=Math.abs(slides[i].offsetLeft-car.offsetLeft-car.scrollLeft);
if(d<bestDist){bestDist=d;best=i;}
}
if(best!==st.activeLook){
st.activeLook=best;
updateCarouselDots();
updateLookSections();
}
},90);
},{passive:true});
}
}

/* ── Step: Landing ── */
function rLanding(){
return'<div class="mn4-step mn4-hero">'
+'<div class="mn4-hero-kicker">AI STYLIST</div>'
+'<h1 class="mn4-hero-title">Try yourself in a<br>new outfit.</h1>'
+'<p class="mn4-hero-sub">See how real products look on you \u2014 personalized by AI.</p>'
+'<button class="mn4-btn mn4-btn--primary mn4-hero-cta" data-action="try-now">Try it now \u2192</button>'
+'<p class="mn4-hero-note">No account required</p>'
+'</div>';
}

/* ── Step: Photo ── */
function rPhoto(){
var p=st.photo;
var zone=p
?'<div class="mn4-upload-zone" data-has-image="true" data-action="photo-trigger">'
+'<img class="mn4-upload-preview" src="'+p+'" alt="Your photo">'
+'<button class="mn4-upload-remove" data-action="photo-remove">\u2715</button></div>'
:'<div class="mn4-upload-zone" data-action="photo-trigger">'
+'<span class="mn4-upload-icon">\u{1F4F8}</span>'
+'<span class="mn4-upload-label">Upload photo</span>'
+'<span class="mn4-upload-hint">Front-facing photos work best</span></div>';
return'<div class="mn4-step">'
+'<div class="mn4-hdr"><h2 class="mn4-hdr-title">Let\u2019s see you in it.</h2>'
+'<p class="mn4-hdr-sub">Upload a clear photo of yourself</p></div>'
+'<div class="mn4-upload-grid" style="grid-template-columns:1fr;max-width:300px;margin:0 auto">'
+'<input type="file" id="mn4-photo-input" accept="image/jpeg,image/png,image/webp" hidden>'
+zone+'</div>'
+(st.error?'<p class="mn4-error">'+esc(st.error)+'</p>':'')
+'<div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="back">Back</button>'
+'<button class="mn4-btn mn4-btn--primary" data-action="nxt"'+(p?'':' disabled')+'>Continue \u2192</button></div>'
+'</div>';
}

/* ── Step: Occasion ── */
function rOccasion(){
var grid='';
OCC.forEach(function(o){
grid+='<button class="mn4-occ-btn mn4-occ-card" data-action="occ" data-value="'+o.id+'" aria-pressed="'+(st.occasion===o.id)+'">'
+'<span class="mn4-occ-emoji">'+o.emoji+'</span>'
+'<span class="mn4-occ-label">'+esc(o.label)+'</span>'
+'<span class="mn4-occ-hint">'+esc(o.hint)+'</span></button>';
});
var otherOpen=st.otherOccasion===' '||(st.otherOccasion&&st.otherOccasion.length>1);
var otherBlock=otherOpen
?'<div class="mn4-other-wrap"><input id="mn4-other-input" class="mn4-input" type="text" placeholder="e.g. brunch, concert, interview" value="'+esc(st.otherOccasion.trim())+'"><button class="mn4-btn mn4-btn--primary mn4-btn--sm" data-action="occ-other-submit">Set</button></div>'
:'<button class="mn4-other-link" data-action="occ-other-toggle">Other \u2026</button>';
return'<div class="mn4-step">'
+'<div class="mn4-hdr"><h2 class="mn4-hdr-title">What\u2019s the occasion?</h2>'
+'<p class="mn4-hdr-sub">We\u2019ll curate looks for your moment</p></div>'
+'<div class="mn4-occ-grid mn4-occ-grid--cards">'+grid+'</div>'
+otherBlock
+(st.error?'<p class="mn4-error">'+esc(st.error)+'</p>':'')
+'<div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="back">Back</button>'
+'<button class="mn4-btn mn4-btn--primary" data-action="create-look"'+(st.occasion?'':' disabled')+'>Create my look \u2192</button></div>'
+'</div>';
}

/* ── Step: Creating ── */
function rCreating(){
if(st.error){
return'<div class="mn4-step"><div class="mn4-hdr"><h2 class="mn4-hdr-title">Something went wrong</h2>'
+'<p class="mn4-hdr-sub">'+esc(st.error)+'</p></div>'
+'<div class="mn4-footer" style="justify-content:center"><button class="mn4-btn mn4-btn--primary" data-action="try-another">Try again</button>'
+'<button class="mn4-btn mn4-btn--ghost" data-action="back">Back</button></div></div>';
}
if(!st.loading){setTimeout(runFirstLook,30);st.loading=true;}
return'<div class="mn4-step">'
+'<div class="mn4-vton mn4-vton--hero"><div class="mn4-vton-loader">'
+'<div class="mn4-vton-loader-ring"><div class="mn4-vton-loader-icon">\u{1F3A8}</div><div class="mn4-vton-scan-line"></div></div>'
+'<div class="mn4-vton-loader-stage">Creating your look...</div>'
+'<div class="mn4-vton-loader-sub">Finding pieces that fit your occasion</div>'
+'<div class="mn4-vton-loader-dots"><div class="mn4-vton-loader-dot mn4-vton-loader-dot--active"></div><div class="mn4-vton-loader-dot"></div><div class="mn4-vton-loader-dot"></div></div>'
+'</div></div></div>';
}

/* ══════════ Carousel (shared) ══════════ */
function lookVtonInner(look){
if(look.vton)return'<img src="'+look.vton+'" class="mn4-slide-img" alt="'+esc(look.name)+'">';
if(look.vtonFailed&&look.hero&&look.hero.image_url)return'<img src="'+look.hero.image_url+'" class="mn4-slide-img" style="opacity:0.9" alt="Look preview">';
return'<div class="mn4-vton-loader"><div class="mn4-vton-loader-ring"><div class="mn4-vton-loader-icon">\u{1F3A8}</div><div class="mn4-vton-scan-line"></div></div>'
+'<div class="mn4-vton-loader-stage">Creating your look...</div>'
+'<div class="mn4-vton-loader-sub">Fitting the '+(look.tags[0]||'piece').toLowerCase()+' look on you</div>'
+'<div class="mn4-vton-loader-dots"><div class="mn4-vton-loader-dot mn4-vton-loader-dot--active"></div><div class="mn4-vton-loader-dot"></div><div class="mn4-vton-loader-dot"></div></div></div>';
}
function carouselHTML(){
if(!st.looks.length)return'';
var slides='';
st.looks.forEach(function(look,i){
var saved=!!st.savedLooks[look.id];
var tags='';
look.tags.forEach(function(t){tags+='<span class="mn4-slide-tag">'+esc(t)+'</span>';});
var regenBtn=(look.vton&&!look.regenerating)
?'<button class="mn4-regen-btn" data-action="regen-look" data-value="'+i+'" title="Regenerate this look">\u21BB <span>Regenerate</span></button>'
:(look.regenerating?'<span class="mn4-regen-btn mn4-regen-btn--busy">\u21BB Regenerating\u2026</span>':'');
slides+='<div class="mn4-slide" data-slide="'+i+'">'
+'<div class="mn4-slide-media">'+lookVtonInner(look)+'</div>'
+'<span class="mn4-slide-count">LOOK '+(i+1)+' / '+st.looks.length+'</span>'
+'<button class="mn4-save-btn'+(saved?' mn4-save-btn--on':'')+'" data-action="save-look" data-value="'+i+'">'
+'<span class="mn4-save-heart">'+(saved?'\u2665':'\u2661')+'</span>'+'<span class="mn4-save-label">'+(saved?'Saved':'Save Outfit')+'</span></button>'
+regenBtn
+'<div class="mn4-slide-overlay">'
+'<h3 class="mn4-slide-title">'+esc(look.name)+'</h3>'
+'<p class="mn4-slide-desc">'+esc(look.desc)+'</p>'
+'<div class="mn4-slide-tags">'+tags+'</div>'
+'</div>'
+(i>0?'<button class="mn4-car-arrow mn4-car-arrow--left" data-action="car-prev">\u2039</button>':'')
+(i<st.looks.length-1?'<button class="mn4-car-arrow mn4-car-arrow--right" data-action="car-next">\u203a</button>':'')
+'</div>';
});
var dots='';
st.looks.forEach(function(_,i){
dots+='<button class="mn4-car-dot'+(i===st.activeLook?' mn4-car-dot--active':'')+'" data-action="car-goto" data-value="'+i+'" aria-label="Look '+(i+1)+'"></button>';
});
return'<div class="mn4-carousel-wrap">'
+'<div class="mn4-carousel" id="mn4-carousel">'+slides+'</div>'
+'<div class="mn4-car-dots">'+dots+'</div>'
+'</div>';
}
function itemsStripHTML(){
var look=st.looks[st.activeLook];
if(!look)return'';
var cards='';
look.items.forEach(function(it){
cards+='<a class="mn4-item-card" '+(it.url?'href="'+esc(it.url)+'" target="_blank" rel="noopener"':'')+'>'
+'<div class="mn4-item-thumb"><img src="'+esc(it.image_url)+'" alt="'+esc(it.title)+'" loading="lazy" onerror="this.style.display=\'none\'"></div>'
+'<div class="mn4-item-name">'+esc(it.brand||slotLabel(it.slot))+'</div>'
+'<div class="mn4-item-title">'+esc(it.title.length>30?it.title.slice(0,30)+'\u2026':it.title)+'</div>'
+'<div class="mn4-item-price">'+fmtPrice(it.price)+' <span class="mn4-item-chev">\u203A</span></div>'
+'</a>';
});
return'<div class="mn4-items-block">'
+'<div class="mn4-items-head"><span class="mn4-section-label" style="margin:0">Items in this look</span>'
+'<span class="mn4-items-count">'+look.items.length+' item'+(look.items.length>1?'s':'')+'</span></div>'
+'<div class="mn4-items-scroll">'+cards+'</div>'
+'</div>';
}
function compareShopHTML(){
var look=st.looks[st.activeLook];
if(!look)return'';
var rows='';
var retailers={};
look.items.forEach(function(it){
var key=(it.source||'retailer').toLowerCase();
if(!retailers[key])retailers[key]={name:it.source||'Retailer',items:[],total:0,best:0};
retailers[key].items.push(it);
retailers[key].total+=it.price||0;
if(it.discount_pct>retailers[key].best)retailers[key].best=it.discount_pct;
});
var keys=Object.keys(retailers);
keys.sort(function(a,b){return retailers[a].total-retailers[b].total;});
keys.forEach(function(k,idx){
var r=retailers[k];
var label=r.name.charAt(0).toUpperCase()+r.name.slice(1);
var badge=idx===0?'<span class="mn4-best-tag">Best Price</span>':'';
var disc=r.best>=5?'<span class="mn4-disc-note">'+r.best+'% off</span>':'<span class="mn4-disc-note">Easy returns</span>';
var first=r.items[0];
rows+='<div class="mn4-retailer-row">'
+'<span class="mn4-retailer-logo">'+esc(label.charAt(0))+'</span>'
+'<span class="mn4-retailer-info"><b>'+esc(label)+'</b>'+disc+'</span>'
+'<span class="mn4-retailer-price">'+fmtPrice(r.total)+badge+'</span>'
+(first.url?'<a class="mn4-retailer-shop" href="'+esc(first.url)+'" target="_blank" rel="noopener">Shop \u2197</a>':'')
+'</div>';
});
return'<div class="mn4-compare-block">'
+'<div class="mn4-compare-head"><span class="mn4-section-label" style="margin:0">Compare Prices & Shop</span>'
+'<span class="mn4-compare-note">Best price shown</span></div>'
+'<div class="mn4-retailer-list">'+rows+'</div>'
+'<div class="mn4-look-total"><span>Total look</span><b>'+fmtPrice(look.total)+'</b></div>'
+'<p class="mn4-prices-note">Prices checked just now</p>'
+'</div>';
}
function cardsBannerHTML(){
return'<div class="mn4-cards-banner">'
+'<span class="mn4-cards-icon">\u{1F4B3}</span>'
+'<span class="mn4-cards-text"><b>Add Your Cards for Smarter Prices</b><i>Get the best deals, automatically applied.</i></span>'
+'<span class="mn4-cards-logos"><span>VISA</span><span>MC</span><span>RuPay</span></span>'
+'</div>';
}

/* ── Step: Result (new user) ── */
function rResult(){
return'<div class="mn4-step">'
+carouselHTML()
+'<div id="mn4-items-zone">'+itemsStripHTML()+'</div>'
+'<div id="mn4-compare-zone">'+compareShopHTML()+'</div>'
+cardsBannerHTML()
+'<div class="mn4-footer" style="justify-content:center;margin-top:8px">'
+'<button class="mn4-btn mn4-btn--ghost" data-action="try-another">Try another \u21BB</button>'
+'</div>'
+'<div class="mn4-personalize-card">'
+'<p class="mn4-personalize-title">Want us to make it even more personal?</p>'
+'<p class="mn4-personalize-sub">Save your style preferences, wardrobe and favourite brands to get better looks every time.</p>'
+'<button class="mn4-btn mn4-btn--primary" data-action="personalize">Personalize my experience \u2192</button>'
+'<button class="mn4-personalize-later" data-action="personalize-later">Maybe later</button>'
+'</div>'
+'</div>';
}

/* ── Step: Signup ── */
function rSignup(){
var inner='';
if(st.authStage==='idle'){
inner='<input class="mn4-input" type="email" id="mn4-auth-email" placeholder="you@email.com" value="'+esc(st.authEmail)+'">'
+'<button class="mn4-btn mn4-btn--primary" data-action="auth-send"'+(st.authBusy?' disabled':'')+'>'
+(st.authBusy?'Sending\u2026':'Continue with email')+'</button>';
}else{
inner='<p class="mn4-hdr-sub" style="margin-bottom:10px">Code sent to <b>'+esc(st.authEmail)+'</b></p>'
+'<input class="mn4-input" type="text" inputmode="numeric" id="mn4-auth-otp" placeholder="6-digit code" value="'+esc(st.authOtp)+'">'
+'<button class="mn4-btn mn4-btn--primary" data-action="auth-verify"'+(st.authBusy?' disabled':'')+'>'
+(st.authBusy?'Verifying\u2026':'Verify & continue')+'</button>';
}
return'<div class="mn4-step">'
+'<div class="mn4-hdr"><h2 class="mn4-hdr-title">Create your style profile</h2>'
+'<p class="mn4-hdr-sub">So your looks get better every time</p></div>'
+'<div class="mn4-auth-form">'+inner+'</div>'
+(st.error?'<p class="mn4-error">'+esc(st.error)+'</p>':'')
+'<button class="mn4-personalize-later" data-action="auth-skip">Skip \u2014 keep it on this device</button>'
+'<div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="back">Back</button></div>'
+'</div>';
}

/* ── Step: Style DNA — style ── */
function rDnaStyle(){
var chips='';
DNA_STYLES.forEach(function(s){
var on=st.dnaStyles.indexOf(s.id)>=0;
chips+='<button class="mn4-style-btn'+(on?' mn4-style-btn--on':'')+'" data-action="dna-style-toggle" data-value="'+s.id+'" aria-pressed="'+on+'">'+esc(s.label)+'</button>';
});
return'<div class="mn4-step">'
+'<div class="mn4-hdr"><div class="mn4-hdr-label">STYLE DNA</div>'
+'<h2 class="mn4-hdr-title">What\u2019s your style?</h2>'
+'<p class="mn4-hdr-sub">Pick as many as you like</p></div>'
+'<div class="mn4-style-grid">'+chips+'</div>'
+'<div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="back">Back</button>'
+'<button class="mn4-btn mn4-btn--primary" data-action="dna-next">Continue \u2192</button></div>'
+'</div>';
}

/* ── Step: Style DNA — occasions ── */
function rDnaOccasion(){
var chips='';
DNA_OCCASIONS.forEach(function(o){
var on=st.dnaOccasions.indexOf(o.id)>=0;
chips+='<button class="mn4-style-btn'+(on?' mn4-style-btn--on':'')+'" data-action="dna-occ-toggle" data-value="'+o.id+'" aria-pressed="'+on+'">'+esc(o.label)+'</button>';
});
return'<div class="mn4-step">'
+'<div class="mn4-hdr"><div class="mn4-hdr-label">STYLE DNA</div>'
+'<h2 class="mn4-hdr-title">Where do you usually dress for?</h2>'
+'<p class="mn4-hdr-sub">Your occasion profile</p></div>'
+'<div class="mn4-style-grid">'+chips+'</div>'
+'<div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="back">Back</button>'
+'<button class="mn4-btn mn4-btn--primary" data-action="dna-next">Continue \u2192</button></div>'
+'</div>';
}

/* ── Step: Style DNA — budget ── */
function rDnaBudget(){
st.sliderVal=st.dnaBudget;
return'<div class="mn4-step">'
+'<div class="mn4-hdr"><div class="mn4-hdr-label">STYLE DNA</div>'
+'<h2 class="mn4-hdr-title">Your typical outfit budget</h2>'
+'<p class="mn4-hdr-sub">For a complete look, not a single piece</p></div>'
+'<div class="mn4-slider-block">'
+'<div class="mn4-slider-head"><span class="mn4-section-label" style="margin:0">Per look</span>'
+'<span class="mn4-slider-range" id="mn4-budget-out">'+fmtShort(st.dnaBudget*0.8)+' \u2013 '+fmtShort(st.dnaBudget*1.25)+'</span></div>'
+'<input type="range" class="mn4-budget-slider" min="1000" max="25000" step="500" value="'+st.dnaBudget+'" '
+'oninput="MN4._onBudgetInput(this.value)" onchange="MN4._onBudgetCommit(this.value)">'
+'<div class="mn4-slider-scale"><span>\u20B91K</span><span>\u20B925K+</span></div>'
+'</div>'
+'<div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="back">Back</button>'
+'<button class="mn4-btn mn4-btn--primary" data-action="dna-next">Continue \u2192</button></div>'
+'</div>';
}

/* ── Step: Style DNA — brands + places ── */
function rDnaBrands(){
var brands=(st.dynamicBrands&&st.dynamicBrands.length)?st.dynamicBrands.slice(0,12):null;
var brandChips='';
if(brands){
brands.forEach(function(b){
var on=st.dnaBrands.indexOf(b.name)>=0;
brandChips+='<button class="mn4-style-btn'+(on?' mn4-style-btn--on':'')+'" data-action="dna-brand-toggle" data-value="'+esc(b.name)+'" aria-pressed="'+on+'">'+esc(b.name)+'</button>';
});
}else{
brandChips='<p class="mn4-text-muted mn4-text-center" style="font-size:11px">Brand picks will appear once we search for you</p>';
}
var places='';
DNA_PLACES.forEach(function(p){
var on=st.dnaPlaces.indexOf(p)>=0;
places+='<button class="mn4-style-btn'+(on?' mn4-style-btn--on':'')+'" data-action="dna-place-toggle" data-value="'+esc(p)+'" aria-pressed="'+on+'">'+esc(p)+'</button>';
});
return'<div class="mn4-step">'
+'<div class="mn4-hdr"><div class="mn4-hdr-label">STYLE DNA</div>'
+'<h2 class="mn4-hdr-title">Any brands you already love?</h2>'
+'<p class="mn4-hdr-sub">Optional \u2014 let AI choose if unsure</p></div>'
+'<div class="mn4-brand-mode-row">'
+'<button class="mn4-quick-pick'+(st.dnaBrandMode==='ai'?' mn4-quick-pick--active':'')+'" data-action="dna-brand-ai">\u2728 Let AI choose for me</button>'
+'<button class="mn4-quick-pick'+(st.dnaBrandMode==='manual'?' mn4-quick-pick--active':'')+'" data-action="dna-brand-manual">Choose brands</button>'
+'</div>'
+(st.dnaBrandMode==='manual'?'<div class="mn4-style-grid" style="margin-top:10px">'+brandChips+'</div>':'')
+'<p class="mn4-section-label" style="margin-top:18px">Where do you like to shop?</p>'
+'<div class="mn4-style-grid">'+places+'</div>'
+'<div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="back">Back</button>'
+'<button class="mn4-btn mn4-btn--primary" data-action="dna-next">Continue \u2192</button></div>'
+'</div>';
}

/* ── Step: Digital Closet ── */
function rDnaCloset(){
var grid='';
st.closet.forEach(function(c){
grid+='<div class="mn4-closet-item">'
+'<img src="'+c.url+'" alt="'+esc(c.name)+'">'
+'<button class="mn4-closet-cat" data-action="closet-cat" data-value="'+c.url+'">'+esc(c.category)+'</button>'
+'<button class="mn4-closet-remove" data-action="closet-remove" data-value="'+c.url+'">\u2715</button>'
+'</div>';
});
return'<div class="mn4-step">'
+'<div class="mn4-hdr"><div class="mn4-hdr-label">STYLE DNA</div>'
+'<h2 class="mn4-hdr-title">Build your digital closet</h2>'
+'<p class="mn4-hdr-sub">Optional \u2014 own more, buy less</p></div>'
+'<div class="mn4-closet-actions">'
+'<button class="mn4-closet-opt" data-action="closet-trigger"><span>\u{1F4F8}</span><b>Upload clothes</b><i>Photos of pieces you own</i></button>'
+'<button class="mn4-closet-opt" data-action="closet-instagram"><span>\u{1F4F1}</span><b>Import from Instagram</b><i>Public posts you authorize</i></button>'
+'</div>'
+'<input type="file" id="mn4-closet-input" accept="image/*" multiple hidden>'
+(st.closet.length?'<p class="mn4-section-label" style="margin-top:14px">'+st.closet.length+' item'+(st.closet.length>1?'s':'')+' added</p><div class="mn4-closet-grid">'+grid+'</div>':'')
+(st.closetBusy?'<p class="mn4-text-center mn4-text-muted" style="font-size:11px">Adding\u2026</p>':'')
+(st.error?'<p class="mn4-error">'+esc(st.error)+'</p>':'')
+'<div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="back">Back</button>'
+'<button class="mn4-btn mn4-btn--primary" data-action="closet-done">'+(st.closet.length?'Save & finish':'Add later \u2728')+'</button></div>'
+'</div>';
}

/* ── Step: Done ── */
function rDone(){
return'<div class="mn4-step mn4-hero">'
+'<div class="mn4-hero-kicker">\u2728</div>'
+'<h1 class="mn4-hero-title" style="font-size:24px">You\u2019re all set</h1>'
+'<p class="mn4-hero-sub">Your Style DNA is saved. Next time we\u2019ll skip the questions and go straight to your look.</p>'
+'<button class="mn4-btn mn4-btn--primary mn4-hero-cta" data-action="shop-look">Shop your look \u2192</button>'
+'<button class="mn4-personalize-later" data-action="start-over">Start a new look</button>'
+'</div>';
}

/* ── Returning: Occasion ── */
function rROccasion(){
var grid='';
OCC.forEach(function(o){
grid+='<button class="mn4-occ-btn mn4-occ-card" data-action="occ" data-value="'+o.id+'" aria-pressed="'+(st.occasion===o.id)+'">'
+'<span class="mn4-occ-emoji">'+o.emoji+'</span>'
+'<span class="mn4-occ-label">'+esc(o.label)+'</span>'
+'<span class="mn4-occ-hint">'+esc(o.hint)+'</span></button>';
});
return'<div class="mn4-step">'
+'<div class="mn4-hdr"><h2 class="mn4-hdr-title">What are you dressing for?</h2>'
+'<p class="mn4-hdr-sub">Welcome back \u2014 let\u2019s style you</p></div>'
+'<div class="mn4-occ-grid mn4-occ-grid--cards">'+grid+'</div>'
+(st.error?'<p class="mn4-error">'+esc(st.error)+'</p>':'')
+'<div class="mn4-footer"><span></span>'
+'<button class="mn4-btn mn4-btn--primary" data-action="nxt"'+(st.occasion?'':' disabled')+'>Continue \u2192</button></div>'
+'</div>';
}

/* ── Returning: Style mode ── */
function rRMode(){
var modes=[
{id:'wardrobe',icon:'\u{1F45A}',title:'My wardrobe',sub:'Only use what I already own'},
{id:'mixed',icon:'\u2728',title:'My wardrobe + new',sub:'Use my clothes and suggest pieces to complete the look'},
{id:'new',icon:'\u{1F6CD}\uFE0F',title:'New outfit',sub:'Build me something completely new'}
];
var cards='';
modes.forEach(function(m){
cards+='<button class="mn4-mode-card'+(st.rMode===m.id?' mn4-mode-card--on':'')+'" data-action="r-mode" data-value="'+m.id+'" aria-pressed="'+(st.rMode===m.id)+'">'
+'<span class="mn4-mode-icon">'+m.icon+'</span>'
+'<span class="mn4-mode-title">'+esc(m.title)+'</span>'
+'<span class="mn4-mode-sub">'+esc(m.sub)+'</span></button>';
});
return'<div class="mn4-step">'
+'<div class="mn4-hdr"><h2 class="mn4-hdr-title">How should we style you?</h2></div>'
+'<div class="mn4-mode-list">'+cards+'</div>'
+'<div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="back">Back</button><span></span></div>'
+'</div>';
}

/* ── Returning: Categories ── */
function rRCategory(){
var cats=[{id:'tops',label:'Tops'},{id:'bottoms',label:'Bottoms'},{id:'outerwear',label:'Outerwear'},{id:'shoes',label:'Shoes'},{id:'accessories',label:'Accessories'}];
var chips='';
cats.forEach(function(c){
var on=st.rCategories.indexOf(c.id)>=0;
chips+='<button class="mn4-style-btn'+(on?' mn4-style-btn--on':'')+'" data-action="r-cat-toggle" data-value="'+c.id+'" aria-pressed="'+on+'">'+esc(c.label)+'</button>';
});
return'<div class="mn4-step">'
+'<div class="mn4-hdr"><h2 class="mn4-hdr-title">What are you looking for?</h2>'
+'<p class="mn4-hdr-sub">We\u2019ll keep the rest from your wardrobe</p></div>'
+'<div class="mn4-style-grid">'+chips+'</div>'
+'<div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="back">Back</button>'
+'<button class="mn4-btn mn4-btn--primary" data-action="r-cat-done"'+(st.rCategories.length?'':' disabled')+'>Continue \u2192</button></div>'
+'</div>';
}

/* ── Returning: Budget ── */
function rRBudget(){
st.sliderVal=st.dnaBudget;
return'<div class="mn4-step">'
+'<div class="mn4-hdr"><h2 class="mn4-hdr-title">What\u2019s your budget for this look?</h2>'
+'<p class="mn4-hdr-sub">Total for the complete outfit</p></div>'
+'<div class="mn4-slider-block">'
+'<div class="mn4-slider-head"><span class="mn4-section-label" style="margin:0">Per look</span>'
+'<span class="mn4-slider-range" id="mn4-budget-out">'+fmtShort(st.dnaBudget*0.8)+' \u2013 '+fmtShort(st.dnaBudget*1.25)+'</span></div>'
+'<input type="range" class="mn4-budget-slider" min="1000" max="25000" step="500" value="'+st.dnaBudget+'" '
+'oninput="MN4._onBudgetInput(this.value)" onchange="MN4._onBudgetCommit(this.value)">'
+'<div class="mn4-slider-scale"><span>\u20B91K</span><span>\u20B925K+</span></div>'
+'</div>'
+'<div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="back">Back</button>'
+'<button class="mn4-btn mn4-btn--primary" data-action="nxt">Continue \u2192</button></div>'
+'</div>';
}

/* ── Returning: Brands ── */
function rRBrands(){
var brands=(st.dynamicBrands&&st.dynamicBrands.length)?st.dynamicBrands.slice(0,12):null;
var chips='';
if(brands){
brands.forEach(function(b){
var on=st.rBrands.indexOf(b.name)>=0;
chips+='<button class="mn4-style-btn'+(on?' mn4-style-btn--on':'')+'" data-action="r-brand-toggle" data-value="'+esc(b.name)+'" aria-pressed="'+on+'">'+esc(b.name)+'</button>';
});
}else{
chips='<p class="mn4-text-muted mn4-text-center" style="font-size:11px">Searching brands for you\u2026</p>';
}
return'<div class="mn4-step">'
+'<div class="mn4-hdr"><h2 class="mn4-hdr-title">Who should we shop from?</h2></div>'
+'<div class="mn4-brand-mode-row">'
+'<button class="mn4-quick-pick'+(st.rBrandMode==='ai'?' mn4-quick-pick--active':'')+'" data-action="r-brand-ai">\u2728 AI picks for me</button>'
+'<button class="mn4-quick-pick'+(st.rBrandMode==='manual'?' mn4-quick-pick--active':'')+'" data-action="r-brand-manual">Choose brands</button>'
+'</div>'
+(st.rBrandMode==='manual'?'<div class="mn4-style-grid" style="margin-top:10px">'+chips+'</div>':''
+'<p class="mn4-text-center mn4-text-muted" style="font-size:11px;margin-top:10px">We\u2019ll find the best brands for your style and budget.</p>')
+(st.error?'<p class="mn4-error">'+esc(st.error)+'</p>':'')
+'<div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="back">Back</button>'
+'<button class="mn4-btn mn4-btn--primary" data-action="create-look">Create my look \u2192</button></div>'
+'</div>';
}

/* ── Returning: Creating ── */
function rRCreating(){
if(st.error){
return'<div class="mn4-step"><div class="mn4-hdr"><h2 class="mn4-hdr-title">Something went wrong</h2>'
+'<p class="mn4-hdr-sub">'+esc(st.error)+'</p></div>'
+'<div class="mn4-footer" style="justify-content:center"><button class="mn4-btn mn4-btn--primary" data-action="try-another">Try again</button>'
+'<button class="mn4-btn mn4-btn--ghost" data-action="back">Back</button></div></div>';
}
if(!st.loading){setTimeout(runReturnLook,30);st.loading=true;}
return'<div class="mn4-step">'
+'<div class="mn4-vton mn4-vton--hero"><div class="mn4-vton-loader">'
+'<div class="mn4-vton-loader-ring"><div class="mn4-vton-loader-icon">\u{1F3A8}</div><div class="mn4-vton-scan-line"></div></div>'
+'<div class="mn4-vton-loader-stage">Creating your look...</div>'
+'<div class="mn4-vton-loader-sub">Finding pieces that fit your occasion</div>'
+'<div class="mn4-vton-loader-dots"><div class="mn4-vton-loader-dot mn4-vton-loader-dot--active"></div><div class="mn4-vton-loader-dot"></div><div class="mn4-vton-loader-dot"></div></div>'
+'</div></div></div>';
}

/* ── Returning: Result ── */
function rRResult(){
var why='';
st.whyList.forEach(function(w){why+='<li>'+esc(w)+'</li>';});

var wardrobe=st.closet.filter(function(c){return st.rMode!=='new';});
var complete='';
if(wardrobe.length){
complete+='<p class="mn4-section-label" style="margin-top:14px">Existing wardrobe</p>';
wardrobe.slice(0,4).forEach(function(c){
complete+='<div class="mn4-complete-row"><span class="mn4-complete-dot"></span><span class="mn4-complete-name">'+esc(c.name)+'</span><span class="mn4-complete-tag">Yours</span></div>';
});
}
var news=st.outfits.filter(function(o){return o.source!=='wardrobe';});
if(news.length){
complete+='<p class="mn4-section-label" style="margin-top:12px">New recommendation</p>';
news.slice(0,4).forEach(function(o){
complete+='<div class="mn4-complete-row"><span class="mn4-complete-dot mn4-complete-dot--new"></span>'
+'<span class="mn4-complete-name">'+esc(o.title.length>40?o.title.slice(0,40)+'\u2026':o.title)+'</span>'
+'<span class="mn4-complete-price">'+fmtPrice(o.price)+'</span>'
+(o.url?'<a class="mn4-shop-buy" href="'+esc(o.url)+'" target="_blank" rel="noopener">Buy \u2192</a>':'')
+'</div>';
});
}

return'<div class="mn4-step">'
+carouselHTML()
+'<div id="mn4-items-zone">'+itemsStripHTML()+'</div>'
+'<p class="mn4-section-label" style="margin-top:16px">Why this works</p>'
+'<ul class="mn4-why-list">'+why+'</ul>'
+'<div id="mn4-compare-zone">'+compareShopHTML()+'</div>'
+cardsBannerHTML()
+((wardrobe.length||news.length)?'<p class="mn4-section-label" style="margin-top:14px">Complete the look</p>'+complete:'')
+'<div class="mn4-footer" style="justify-content:center;margin-top:8px">'
+'<button class="mn4-btn mn4-btn--ghost" data-action="start-over">Start over</button>'
+'</div></div>';
}

/* ══════════ Init ══════════ */
W.init=function(target){
progressEl=document.getElementById('mn-progress-bar');
scrollEl=document.getElementById('mn-scroll-area');
dotsEl=document.getElementById('mn-dots-area');
var container=target||document.getElementById('mn-content-container')||document.getElementById('mn-stylist-app');
if(!scrollEl&&container){
var wrap=document.createElement('div');
wrap.style.cssText='display:flex;flex-direction:column;height:100%;';
var pBar=document.createElement('div');pBar.id='mn-progress-bar';
var sArea=document.createElement('div');sArea.id='mn-scroll-area';sArea.className='mn4-scroll';
var dArea=document.createElement('div');dArea.id='mn-dots-area';
wrap.appendChild(pBar);wrap.appendChild(sArea);wrap.appendChild(dArea);
container.innerHTML='';container.appendChild(wrap);
progressEl=pBar;scrollEl=sArea;dotsEl=dArea;
}
if(!scrollEl)return;
loadToken();restoreLocal();loadSavedLooks();loadCachedWeather();
if(hasProfile()){startReturnFlow();}else{startNewFlow();}
document.addEventListener('click',handleClick,true);
document.addEventListener('change',function(e){
if(e.target&&e.target.id==='mn4-photo-input')handlePhotoFile(e);
if(e.target&&e.target.id==='mn4-closet-input')addClosetFiles(e.target.files);
},true);
document.addEventListener('input',function(e){
if(!e.target)return;
if(e.target.id==='mn4-auth-email')st.authEmail=e.target.value;
if(e.target.id==='mn4-auth-otp')st.authOtp=e.target.value;
},true);
};

})();
