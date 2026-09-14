(function(){
'use strict';
var API='https://drishti-api-v2.fly.dev';
var VERCEL_API='https://mynarrative-ai.vercel.app';
var OCC=[
{id:'casual',label:'Casual',emoji:'\u{1F45F}'},{id:'work',label:'Work',emoji:'\u{1F4BC}'},
{id:'date',label:'Date',emoji:'\u{1F377}'},{id:'party',label:'Party',emoji:'\u{1F389}'},
{id:'wedding',label:'Wedding',emoji:'\u{1F48D}'},{id:'travel',label:'Travel',emoji:'\u2708\uFE0F'},
{id:'festive',label:'Festive',emoji:'\u{1F3AA}'},{id:'gym',label:'Gym',emoji:'\u{1F3CB}\uFE0F'}
];
var STY=[
{id:'minimalist',label:'Minimalist'},{id:'streetwear',label:'Streetwear'},
{id:'classic',label:'Classic'},{id:'boho',label:'Boho'},
{id:'athleisure',label:'Athleisure'},{id:'glam',label:'Glam'},
{id:'y2k',label:'Y2K'},{id:'cottagecore',label:'Cottagecore'},
{id:'corporate',label:'Corporate'},{id:'ai_auto',label:'AI Auto',ai:true}
];
var PR=[
{id:'value',label:'Value',icon:'\u{1F3F7}\uFE0F',lo:0,hi:1500,range:'Under \u20B91,500'},
{id:'premium',label:'Premium',icon:'\u{1F4B0}',lo:1500,hi:3500,range:'\u20B91,500 \u2013 \u20B93,500'},
{id:'luxury',label:'Luxury',icon:'\u{1F451}',lo:3500,hi:0,range:'Above \u20B93,500'}
];
var OCC_BRANDS={
casual:{style:'Casual & Streetwear',value:{indian:['Roadster','The Souled Store','Bewakoof','Snitch','Kook N Keech','Max Fashion'],global:['Levi\'s','Zara','H&M','Uniqlo','Jack & Jones','United Colors of Benetton']},premium:{indian:['Levi\'s','Zara','H&M','Uniqlo','Jack & Jones','United Colors of Benetton'],global:['Superdry','Diesel','G-Star RAW','Guess','AllSaints','Ralph Lauren']},luxury:{indian:['Superdry','Diesel','G-Star RAW','Guess','AllSaints','Ralph Lauren'],global:['Superdry','Diesel','G-Star RAW','Guess','AllSaints','Ralph Lauren']}},
work:{style:'Formal & Office Wear',value:{indian:['Peter England','Max Fashion','Netplay','Code','Zudio','Excalibur'],global:['Peter England','Max Fashion','Netplay','Code','Zudio','Excalibur']},premium:{indian:['Van Heusen','Allen Solly','Louis Philippe','Arrow','Marks & Spencer','FableStreet'],global:['Van Heusen','Allen Solly','Louis Philippe','Arrow','Marks & Spencer','FableStreet']},luxury:{indian:['Brooks Brothers','Hugo Boss','Massimo Dutti','Raymond','Tommy Hilfiger','Calvin Klein'],global:['Brooks Brothers','Hugo Boss','Massimo Dutti','Raymond','Tommy Hilfiger','Calvin Klein']}},
date:{style:'Party & Evening Wear',value:{indian:['Berrylush','SASSAFRAS','Athena','Tokyo Talkies','FabAlley','Zudio'],global:['Berrylush','SASSAFRAS','Athena','Tokyo Talkies','FabAlley','Zudio']},premium:{indian:['Kazo','Twenty Dresses','Rareism','Mango','Vero Moda','RSVP'],global:['Kazo','Twenty Dresses','Rareism','Mango','Vero Moda','RSVP']},luxury:{indian:['ASOS Design','Revolve','House of CB','Forever New','Bebe','Zara Studio'],global:['ASOS Design','Revolve','House of CB','Forever New','Bebe','Zara Studio']}},
party:{style:'Party & Evening Wear',value:{indian:['Berrylush','SASSAFRAS','Athena','Tokyo Talkies','FabAlley','Zudio'],global:['Berrylush','SASSAFRAS','Athena','Tokyo Talkies','FabAlley','Zudio']},premium:{indian:['Kazo','Twenty Dresses','Rareism','Mango','Vero Moda','RSVP'],global:['Kazo','Twenty Dresses','Rareism','Mango','Vero Moda','RSVP']},luxury:{indian:['ASOS Design','Revolve','House of CB','Forever New','Bebe','Zara Studio'],global:['ASOS Design','Revolve','House of CB','Forever New','Bebe','Zara Studio']}},
wedding:{style:'Ethnic & Festive Wear',value:{indian:['Anouk','Libas','Sangria','Vishudh','Aurelia','Soch'],global:['Anouk','Libas','Sangria','Vishudh','Aurelia','Soch']},premium:{indian:['BIBA','W for Woman','Global Desi','Fabindia','Indya','Koskii'],global:['BIBA','W for Woman','Global Desi','Fabindia','Indya','Koskii']},luxury:{indian:['Kalki Fashion','Manyavar','Ritu Kumar','Anita Dongre','House of Masaba','Nalli'],global:['Kalki Fashion','Manyavar','Ritu Kumar','Anita Dongre','House of Masaba','Nalli']}},
travel:{style:'Travel & Utility Wear',value:{indian:['Quechua','Forclaz','Wildcraft','Bombay Trooper','Trekman','Fuaark'],global:['Quechua','Forclaz','Wildcraft','Bombay Trooper','Trekman','Fuaark']},premium:{indian:['Gokyo','Columbia','WROGN','Woodland','Royal Enfield','Quiksilver'],global:['Gokyo','Columbia','WROGN','Woodland','Royal Enfield','Quiksilver']},luxury:{indian:['The North Face','Patagonia','Arc\'teryx','Vuori','Salomon','Columbia Tech'],global:['The North Face','Patagonia','Arc\'teryx','Vuori','Salomon','Columbia Tech']}},
festive:{style:'Ethnic & Festive Wear',value:{indian:['Anouk','Libas','Sangria','Vishudh','Aurelia','Soch'],global:['Anouk','Libas','Sangria','Vishudh','Aurelia','Soch']},premium:{indian:['BIBA','W for Woman','Global Desi','Fabindia','Indya','Koskii'],global:['BIBA','W for Woman','Global Desi','Fabindia','Indya','Koskii']},luxury:{indian:['Kalki Fashion','Manyavar','Ritu Kumar','Anita Dongre','House of Masaba','Nalli'],global:['Kalki Fashion','Manyavar','Ritu Kumar','Anita Dongre','House of Masaba','Nalli']}},
gym:{style:'Gym & Activewear',value:{indian:['HRX','Domyos','Symactive','Campus Sutra','Clovia Botaniq','Zudio Active'],global:['HRX','Domyos','Symactive','Campus Sutra','Clovia Botaniq','Zudio Active']},premium:{indian:['Puma','Reebok','Skechers','BlissClub','CultSport','Adidas'],global:['Puma','Reebok','Skechers','BlissClub','CultSport','Adidas']},luxury:{indian:['Nike','Under Armour','Lululemon','Asics','Gymshark','Alo Yoga'],global:['Nike','Under Armour','Lululemon','Asics','Gymshark','Alo Yoga']}}
};
var BF=[
{key:'skin_tone',label:'Skin Tone',icon:'\u{1F3A8}'},
{key:'body_shape',label:'Body Shape',icon:'\u{1FA9E}'},
{key:'face_shape',label:'Face Shape',icon:'\u{1F60A}'},
{key:'hair_color',label:'Hair Color',icon:'\u{1F487}'},
{key:'hair_style',label:'Hair Style',icon:'\u2702\uFE0F'},
{key:'fitness',label:'Fitness Level',icon:'\u{1F4AA}'},
{key:'complexion',label:'Complexion',icon:'\u2728'},
{key:'undertone',label:'Undertone',icon:'\u{1F321}\uFE0F'}
];

var st={step:0,isReturn:false,profile:null,gender:null,occasion:null,style:null,
brands:[],vtonImages:{},price:null,bodyData:{},analyzing:false,
confidence:0,fullBody:null,outfits:[],activeIdx:null,loading:false};

var progressEl,scrollEl,dotsEl,prevStep=-1;
var W=window.MN4=window.MN4||{};

function fmtPrice(n){var c=window.MN_currency;return c&&c.format?c.format(n):'\u20B9'+Number(n).toLocaleString('en-IN');}

W.init=function(target){
progressEl=document.getElementById('mn-progress-bar');
scrollEl=document.getElementById('mn-scroll-area');
dotsEl=document.getElementById('mn-dots-area');
/* If elements don't exist (widget context), create them inside target or #mn-content-container */
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
loadProfile();detectReturn();
document.addEventListener('click',handleClick,true);
document.addEventListener('change',handleFileChange,true);
render();
};

function loadProfile(){
try{var r=localStorage.getItem('mn4_profile');
if(r){var p=JSON.parse(r);st.profile=p;st.gender=p.gender;st.bodyData=p.bodyData||{};}
}catch(e){}
}
function saveProfile(){
st.profile={gender:st.gender,bodyData:st.bodyData,ts:Date.now()};
try{localStorage.setItem('mn4_profile',JSON.stringify(st.profile));}catch(e){}
}
function detectReturn(){
st.isReturn=!!(st.profile&&st.profile.gender&&st.bodyData&&Object.keys(st.bodyData).length>2);
}
function mx(){return st.isReturn?3:5;}
function go(n){st.step=n;render();}
function nxt(){if(st.step<mx()-1){st.step++;render();}}

function handleClick(e){
var b=e.target.closest('[data-action]');
if(!b)return;
var a=b.getAttribute('data-action'),v=b.getAttribute('data-value');
switch(a){
case'gender':st.gender=v;render();break;
case'nxt':nxt();break;
case'back':go(parseInt(v,10));break;
case'go':go(parseInt(v,10));break;
case'occasion':st.occasion=v;render();break;
case'style':st.style=v;render();break;

case'brand-toggle':togBrand(v);render();break;
case'price-select':st.price=v;st.brands=[];render();break;
case'submit':doSubmit();break;
case'view-outfit':st.activeIdx=parseInt(v,10);render();break;
case'back-to-list':st.activeIdx=null;render();break;
case'shop-now':if(v&&v!=='#')window.open(v,'_blank');break;
case'retake':st.step=st.isReturn?1:0;st.outfits=[];st.activeIdx=null;render();break;
case'upload-trigger':var inp=document.getElementById('mn4-input-'+v);if(inp)inp.click();break;
case'upload-remove':e.stopPropagation();st[v]=null;render();break;
case'edit-body':startEdit(b,v);break;
}
}

function handleFileChange(e){
var inp=e.target;
if(!inp.id||!inp.id.startsWith('mn4-input-'))return;
var type=inp.id.replace('mn4-input-','');
var f=inp.files&&inp.files[0];if(!f)return;
if(f.size>10*1024*1024){alert('Max 10MB');return;}
if(!f.type.match(/^image\/(jpeg|png|webp)$/)){alert('Use JPG/PNG/WebP');return;}
var r=new FileReader();
r.onload=function(ev){st[type]=ev.target.result;render();
if(type==='fullBody'&&st.fullBody)analyzeBody(st.fullBody);};
r.readAsDataURL(f);
}

function analyzeBody(dUrl){
st.analyzing=true;render();
var pts=dUrl.split(','),mime=pts[0].match(/:(.*?);/)[1],b64=pts[1];
var bin=atob(b64),arr=new Uint8Array(bin.length);
for(var i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);
var blob=new Blob([arr],{type:mime}),fd=new FormData();
fd.append('file',blob,'body.jpg');fd.append('gender',st.gender||'');
fetch(API+'/api/analysis/body/upload',{method:'POST',body:fd})
.then(function(r){return r.json();})
.then(function(d){st.bodyData=d.body_data||{};st.confidence=d.confidence||0;
st.analyzing=false;saveProfile();render();})
.catch(function(){st.analyzing=false;render();});
}

function startEdit(el,key){
var cur=(st.bodyData&&st.bodyData[key])||'';
var inp=document.createElement('input');inp.type='text';
inp.className='mn4-body-edit-input';inp.value=cur;
inp.placeholder='Enter '+key.replace(/_/g,' ');
el.textContent='';el.appendChild(inp);inp.focus();
inp.onblur=function(){st.bodyData=st.bodyData||{};st.bodyData[key]=inp.value;render();};
inp.onkeydown=function(e){if(e.key==='Enter')inp.blur();};
}

function togBrand(name){var i=st.brands.indexOf(name);if(i>=0)st.brands.splice(i,1);else st.brands.push(name);}

function fetchWeatherForCity(city){
if(!city||city==='Unknown')return Promise.resolve({temp:28,desc:'Clear',icon:'\u2600\uFE0F',city:city||'Unknown'});
return fetch(API+'/api/weather/current',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({city:city})})
.then(function(r){return r.json();})
.then(function(d){return{temp:Math.round(d.temp_c||28),desc:d.description||'Clear Sky',icon:d.icon||'\u2600\uFE0F',city:d.city||city,humidity:d.humidity,wind:d.wind_speed};})
.catch(function(){return{temp:28,desc:'Clear',icon:'\u2600\uFE0F',city:city};});
}

function doSubmit(){
st.loading=true;render();saveProfile();
var c=window.MN_currency;
var loc=c?c.get():{city:'Unknown',country:'IN'};
var city=loc.city||'Unknown';
var p={gender:st.gender,occasion:st.occasion,style:st.style==='ai_auto'?'minimalist':st.style,
weather:{temp:28,desc:'Clear',icon:'\u2600\uFE0F'},city:city,
user_location:{city:city,country:loc.country||'IN'},currency:c?c.currency:'INR',
brands:st.brands,price_segment:st.price||'premium',
price_range:st.price==='value'?'under_1500':st.price==='premium'?'1500_3500':st.price==='luxury'?'above_3500':'any',
body_data:st.bodyData||{}};
fetchWeatherForCity(city).then(function(w){p.weather=w;
if(st.fullBody){uploadPerson(st.fullBody,function(u){p.person_image_url=u;fetchRecs(p);});}
else fetchRecs(p);
});
}

function uploadPerson(dUrl,cb){
var pts=dUrl.split(','),mime=pts[0].match(/:(.*?);/)[1],b64=pts[1];
var bin=atob(b64),arr=new Uint8Array(bin.length);
for(var i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);
var blob=new Blob([arr],{type:mime}),fd=new FormData();
fd.append('file',blob,'person.jpg');fd.append('session_id','mn4_'+Date.now());
fetch(API+'/api/vton/upload-person',{method:'POST',body:fd})
.then(function(r){return r.json();})
.then(function(d){var url=d.url||d.person_image_url||d.image_url||d.image||null;
console.log('[MN4] Upload response:',d,'resolved url:',url);
cb(url);})
.catch(function(e){console.error('[MN4] Upload error:',e);cb(null);});
}

function fetchRecs(p){
st._personUrl=p.person_image_url||null;

// If brands selected, search brand catalog first
var brandProducts=[];
if(p.brands&&p.brands.length){
var brandSearchParams={
brand:p.brands[0],
category:'',
gender:p.gender||'',
min_price:p.price_range==='under_1500'?0:p.price_range==='1500_3500'?1500:3500,
max_price:p.price_range==='under_1500'?1500:p.price_range==='1500_3500'?3500:999999,
limit:6,
process_vton:true
};

fetch(VERCEL_API+'/api/brand/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(brandSearchParams)})
.then(function(r){return r.json();})
.then(function(d){
if(d.success&&d.products&&d.products.length){
brandProducts=d.products.map(function(p){return{id:p.id||'brand_'+Date.now(),title:p.title||'Brand Product',
score:85,pieces:[{name:p.title,type:'top',color:p.color||'#39A596',product_id:p.id,image_url:p.vton_ready_url||p.image_url||null,flat_lay_url:p.flat_lay_url||null}],
prices:[{platform:p.brand||'Brand',amount:p.price||0,best:true,link:'#'}],_product_id:p.id,_brand:p.brand,_vton_ready_url:p.vton_ready_url};});
}
// Merge with drishti-api recommendations
return fetch(API+'/api/reco/outfits',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});
})
.then(function(r){return r.json();})
.then(function(d){
var recs=d.recommendations||d.outfits||mockRecs(p);
var drishtiRecs=recs.map(function(r){return{id:r.product_id||r.id,title:r.title||'Recommended',
score:Math.round((r.score||0.85)*100),pieces:[{name:r.title,type:'top',color:'#39A596',product_id:r.product_id,image_url:r.image_url||r.image||null}],
prices:[{platform:'Shopify',amount:r.price||0,best:true,link:r.url||r.product_url||'#'}],_product_id:r.product_id};});
var allRecs=brandProducts.concat(drishtiRecs);
st.outfits=allRecs;
fetchPrices(st.outfits);
st.loading=false;st.step++;render();
if(st._personUrl)generateVTON(st.outfits,st._personUrl);
})
.catch(function(e){console.error('[MN4] fetchRecs error:',e);
// Fallback to drishti-api only
fetch(API+'/api/reco/outfits',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)})
.then(function(r){return r.json();})
.then(function(d){
var recs=d.recommendations||d.outfits||mockRecs(p);
st.outfits=brandProducts.concat(recs.map(function(r){return{id:r.product_id||r.id,title:r.title||'Recommended',
score:Math.round((r.score||0.85)*100),pieces:[{name:r.title,type:'top',color:'#39A596',product_id:r.product_id,image_url:r.image_url||r.image||null}],
prices:[{platform:'Shopify',amount:r.price||0,best:true,link:r.url||r.product_url||'#'}],_product_id:r.product_id};}));
fetchPrices(st.outfits);
st.loading=false;st.step++;render();
if(st._personUrl)generateVTON(st.outfits,st._personUrl);
}).catch(function(){st.outfits=mockRecs(p);st.loading=false;st.step++;render();});
});
}else{
// No brands selected, just use drishti-api
fetch(API+'/api/reco/outfits',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)})
.then(function(r){return r.json();})
.then(function(d){
var recs=d.recommendations||d.outfits||mockRecs(p);
st.outfits=recs.map(function(r){return{id:r.product_id||r.id,title:r.title||'Recommended',
score:Math.round((r.score||0.85)*100),pieces:[{name:r.title,type:'top',color:'#39A596',product_id:r.product_id,image_url:r.image_url||r.image||null}],
prices:[{platform:'Shopify',amount:r.price||0,best:true,link:r.url||r.product_url||'#'}],_product_id:r.product_id};});
fetchPrices(st.outfits);
st.loading=false;st.step++;render();
if(st._personUrl)generateVTON(st.outfits,st._personUrl);})
.catch(function(e){console.error('[MN4] fetchRecs error:',e);st.outfits=mockRecs(p);st.loading=false;st.step++;render();});
}
}

function fetchPrices(outfits){
outfits.forEach(function(o){
if(!o._product_id)return;
fetch(API+'/api/pricing/compare/shopify/'+o._product_id+'?product_name='+encodeURIComponent(o.title))
.then(function(r){return r.json();})
.then(function(d){if(d.results&&d.results.length){
o.prices=d.results.map(function(p){return{platform:p.platform,amount:p.price,best:p.is_best||false,link:p.url||'#',original_price:p.original_price||null};});
updatePriceSection(o);
}}).catch(function(){});
});
}

function updatePriceSection(o){
var el=document.querySelector('[data-price-id="'+o.id+'"]');
if(!el||!o.prices||!o.prices.length)return;
var bp=o.prices.find(function(x){return x.best;});
var best=bp||o.prices[0];
var detailMode=el.parentElement&&el.parentElement.querySelector('.mn4-section-label');
var h='';
if(detailMode){
o.prices.forEach(function(p){h+='<div class="mn4-price-row'+(p.best?' mn4-price-row--best':'')+'"><span class="mn4-price-platform">'+esc(p.platform)+'</span><span class="mn4-price-amount">'+fmtPrice(p.amount)+'</span>'+(p.best?'<span class="mn4-price-best-tag">BEST</span>':'')+'<a class="mn4-price-link" href="'+esc(p.link||'#')+'" target="_blank">Shop \u2192</a></div>';});
}else{
h+='<div class="mn4-price-row'+(bp?' mn4-price-row--best':'')+'"><span class="mn4-price-platform">'+esc(o.prices[0].platform)+'</span><span class="mn4-price-amount">'+fmtPrice(best.amount)+'</span>'+(bp?'<span class="mn4-price-best-tag">BEST</span>':'')+'<a class="mn4-price-link" href="'+esc(best.link||'#')+'" target="_blank" onclick="event.stopPropagation()">Shop</a></div>';
}
el.innerHTML=h;
}

function mockRecs(p){
var occ=p.occasion||'casual',sty=p.style||'minimalist';
return[{id:1,title:sty.charAt(0).toUpperCase()+sty.slice(1)+' '+occ.charAt(0).toUpperCase()+occ.slice(1),score:95,
pieces:[{name:'Linen Blend Shirt',type:'top',color:'#39A596'},{name:'Tailored Chinos',type:'bottom',color:'#2d2d2d'},{name:'White Sneakers',type:'shoes',color:'#fff'}],
prices:[{platform:'Myntra',amount:2499,best:true,link:'#'},{platform:'Ajio',amount:2799,link:'#'},{platform:'Amazon',amount:2999,link:'#'}]},
{id:2,title:occ.charAt(0).toUpperCase()+occ.slice(1)+' Essential',score:88,
pieces:[{name:'Oversized Tee',type:'top',color:'#1a1a1a'},{name:'Relaxed Jeans',type:'bottom',color:'#4a6fa5'},{name:'Canvas Loafers',type:'shoes',color:'#c4a882'}],
prices:[{platform:'H&M',amount:1299,best:true,link:'#'},{platform:'Zara',amount:1599,link:'#'},{platform:'SHEIN',amount:899,link:'#'}]}];
}

function dataUrlToBlob(dataUrl){
var pts=dataUrl.split(','),mime=pts[0].match(/:(.*?);/)[1],b64=pts[1];
var bin=atob(b64),arr=new Uint8Array(bin.length);
for(var i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);
return new Blob([arr],{type:mime});
}

function uploadGarmentToGetUrl(dataUrl,cb){
var blob=dataUrlToBlob(dataUrl);
var fd=new FormData();
fd.append('file',blob,'garment.png');fd.append('session_id','mn4_garment_'+Date.now());
fetch(API+'/api/vton/upload-person',{method:'POST',body:fd})
.then(function(r){return r.json();})
.then(function(d){var url=d.url||d.person_image_url||d.image_url||null;
console.log('[MN4] Garment upload:',url?'OK':'FAIL',url?url.substring(0,80):'');
cb(url);})
.catch(function(e){console.error('[MN4] Garment upload error:',e);cb(null);});
}

function generateVTON(outfits,personUrl){
if(!personUrl)return;
outfits.forEach(function(o){
var garmentUrl=o.pieces&&o.pieces[0]&&o.pieces[0].image_url;
// Prefer VTON-ready URL from brand catalog if available
if(!garmentUrl&&o._vton_ready_url)garmentUrl=o._vton_ready_url;
if(!garmentUrl){return;}
function doVTON(finalGarmentUrl){
if(!finalGarmentUrl){return;}
startVTONLoader(o.id);
var done=false;
function finish(result){
if(done)return;done=true;
if(result){st.vtonImages[o.id]=result;revealVTONImage(o.id,result);}
else stopVTONLoader(o.id);
}
setTimeout(function(){finish(null);},30000);
fetch(API+'/api/vton/try-on',{method:'POST',headers:{'Content-Type':'application/json'},
body:JSON.stringify({person_image_url:personUrl,garment_image_url:finalGarmentUrl,extract_garment:true})})
.then(function(r){return r.json();})
.then(function(d){
console.log('[MN4] VTON response:',JSON.stringify(d).substring(0,200));
var result=d.result_image||d.result_image_url||d.vton_image_url||d.image_url||d.output_image||d.image||d.url;
finish(result);
}).catch(function(e){console.error('[MN4] VTON error:',e);finish(null);});
}
if(garmentUrl.indexOf('data:')===0){
uploadGarmentToGetUrl(garmentUrl,function(uploadedUrl){doVTON(uploadedUrl);});
}else{
doVTON(garmentUrl);
}
});
}

/* ── VTON Loader: AI Processing Theater ── */

var _vtonLoaders={};
var _VTON_STAGES=[
{icon:'\u{1F3A8}',msg:'Analyzing your style...',sub:'Reading color palette & fit preferences',dur:3000},
{icon:'\u{1F457}',msg:'Fitting the garment...',sub:'AI is draping the outfit on your body',dur:5000},
{icon:'\u2728',msg:'Perfecting the look...',sub:'Adding finishing touches for realism',dur:7000}
];

function startVTONLoader(outfitId){
var el=document.querySelector('[data-vton-id="'+outfitId+'"]');
if(!el)return;
var existing=el.querySelector('.mn4-vton-loader');
if(existing)return;

var stageIdx=0;
var loaderHTML='<div class="mn4-vton-loader">'
+'<div class="mn4-vton-loader-ring">'
+'<div class="mn4-vton-loader-icon">'+_VTON_STAGES[0].icon+'</div>'
+'<div class="mn4-vton-scan-line"></div>'
+'</div>'
+'<div class="mn4-vton-loader-stage">'+_VTON_STAGES[0].msg+'</div>'
+'<div class="mn4-vton-loader-sub">'+_VTON_STAGES[0].sub+'</div>'
+'<div class="mn4-vton-loader-dots">'
+'<div class="mn4-vton-loader-dot mn4-vton-loader-dot--active"></div>'
+'<div class="mn4-vton-loader-dot"></div>'
+'<div class="mn4-vton-loader-dot"></div>'
+'</div></div>';

var container=el.querySelector('.mn4-vton');
if(container)container.insertAdjacentHTML('beforeend',loaderHTML);

function advance(){
if(_vtonLoaders[outfitId]==='stopped')return;
stageIdx++;
if(stageIdx>=_VTON_STAGES.length)return;
var stage=_VTON_STAGES[stageIdx];
var loader=document.querySelector('[data-vton-id="'+outfitId+'"] .mn4-vton-loader');
if(!loader)return;
var iconEl=loader.querySelector('.mn4-vton-loader-icon');
var msgEl=loader.querySelector('.mn4-vton-loader-stage');
var subEl=loader.querySelector('.mn4-vton-loader-sub');
if(iconEl)iconEl.textContent=stage.icon;
if(msgEl)msgEl.textContent=stage.msg;
if(subEl)subEl.textContent=stage.sub;
var dots=loader.querySelectorAll('.mn4-vton-loader-dot');
dots.forEach(function(d,i){
d.className='mn4-vton-loader-dot';
if(i<stageIdx)d.className+=' mn4-vton-loader-dot--done';
else if(i===stageIdx)d.className+=' mn4-vton-loader-dot--active';
});
setTimeout(advance,stage.dur);
}
setTimeout(advance,_VTON_STAGES[0].dur);
_vtonLoaders[outfitId]='running';
}

function stopVTONLoader(outfitId){
_vtonLoaders[outfitId]='stopped';
var el=document.querySelector('[data-vton-id="'+outfitId+'"]');
if(!el)return;
var loader=el.querySelector('.mn4-vton-loader');
if(loader)loader.remove();
}

function revealVTONImage(outfitId,imageUrl){
stopVTONLoader(outfitId);
var el=document.querySelector('[data-vton-id="'+outfitId+'"]');
if(!el)return;
var container=el.querySelector('.mn4-vton');
if(!container)return;
container.innerHTML='<img src="'+imageUrl+'" class="mn4-vton-reveal" style="width:100%;height:100%;object-fit:cover" alt="VTON Result">'
+'<span class="mn4-vton-badge mn4-vton-reveal-badge">AI VTON</span>';
}

function render(){
if(!scrollEl)return;

if(progressEl){var pct=Math.round((st.step/(mx()-1))*100);
progressEl.innerHTML='<div class="mn4-progress"><div class="mn4-progress-fill" style="width:'+pct+'%"></div></div>';}
var h='';
if(st.isReturn){if(st.step===0)h=rWelc();else if(st.step===1)h=rOcc();else if(st.step===2)h=rBnd();else h=rRes();}
else{if(st.step===0)h=rGen();else if(st.step===1)h=rOcc();else if(st.step===2)h=rBody();else if(st.step===3)h=rBnd();else h=rRes();}
scrollEl.innerHTML=h;
if(st.step!==prevStep){scrollEl.scrollTop=0;prevStep=st.step;}
if(dotsEl){var dh='<div class="mn4-dots">';for(var i=0;i<mx();i++){
var c='mn4-dot';if(i===st.step)c+=' mn4-dot--active';else if(i<st.step)c+=' mn4-dot--done';
dh+='<div class="'+c+'"></div>';}dotsEl.innerHTML=dh+'</div>';}
}

function sL(){return'Step '+(st.step+1)+' of '+mx();}
function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML;}

function rWelc(){
var t=st.gender==='male'?'King':'Queen';
return'<div class="mn4-step"><div class="mn4-welcome">'
+'<div class="mn4-badge">Welcome Back</div>'
+'<h2 class="mn4-hdr-title">Ready for a new look, '+esc(t)+'?</h2>'
+'<p class="mn4-hdr-sub">Skip the setup \u2014 jump straight to outfits</p>'
+'<button class="mn4-btn mn4-btn--primary" data-action="go" data-value="1">Let\'s Go \u2728</button>'
+'</div></div>';
}

function rGen(){
var g=st.gender,fb=!!st.fullBody;
var upl=g?rUpload():'<p class="mn4-hdr-sub mn4-text-center mn4-mt-sm">\u2191 Select your gender first</p>';
return'<div class="mn4-step">'
+'<div class="mn4-hdr"><div class="mn4-hdr-label">'+esc(sL())+'</div>'
+'<h2 class="mn4-hdr-title">Let\'s get to know you</h2>'
+'<p class="mn4-hdr-sub">This helps us recommend outfits that fit you</p></div>'
+'<div class="mn4-gender-grid">'
+'<button class="mn4-gender-btn" data-action="gender" data-value="female" aria-pressed="'+(g==='female')+'">'
+'<span class="mn4-gender-emoji">\u{1F457}</span><span class="mn4-gender-label">Female</span>'
+'<span class="mn4-gender-hint">Feminine fits & drapes</span></button>'
+'<button class="mn4-gender-btn" data-action="gender" data-value="male" aria-pressed="'+(g==='male')+'">'
+'<span class="mn4-gender-emoji">\u{1F454}</span><span class="mn4-gender-label">Male</span>'
+'<span class="mn4-gender-hint">Sharp cuts & layers</span></button></div>'
+upl
+'<div class="mn4-footer"><span></span>'
+'<button class="mn4-btn mn4-btn--primary" data-action="nxt"'+(!g||!fb?' disabled':'')+'>Continue \u2192</button></div>'
+'</div>';
}

function rUpload(){
var fb=st.fullBody;
return'<div><p class="mn4-section-label mn4-text-center">Upload your photo</p>'
+'<div class="mn4-upload-grid" style="grid-template-columns:1fr;max-width:280px;margin:0 auto">'
+'<div class="mn4-upload-zone" data-action="upload-trigger" data-value="fullBody" data-has-image="'+!!fb+'">'
+'<input type="file" id="mn4-input-fullBody" accept="image/jpeg,image/png,image/webp" hidden>'
+(fb?'<img class="mn4-upload-preview" src="'+fb+'" alt="Full body"><button class="mn4-upload-remove" data-action="upload-remove" data-value="fullBody">\u2715</button>'
:'<span class="mn4-upload-icon">\u{1F4F8}</span><span class="mn4-upload-label">Full Body Photo</span><span class="mn4-upload-hint">Standing pose, head to toe</span>')
+'</div></div></div>';
}

function rOcc(){
var oc=st.occasion,sty=st.style;
var oH='';OCC.forEach(function(o){oH+='<button class="mn4-occ-btn" data-action="occasion" data-value="'+o.id+'" aria-pressed="'+(oc===o.id)+'"><span class="mn4-occ-emoji">'+o.emoji+'</span>'+esc(o.label)+'</button>';});
var sH='';STY.forEach(function(s){sH+='<button class="mn4-style-btn'+(s.ai?' mn4-style-btn--ai':'')+'" data-action="style" data-value="'+s.id+'" aria-pressed="'+(sty===s.id)+'">'+(s.ai?'\u2728 ':'')+esc(s.label)+'</button>';});
var sn=(st.isReturn?1:2)+' of '+mx();
return'<div class="mn4-step"><div class="mn4-hdr"><div class="mn4-hdr-label">'+esc(sn)+'</div><h2 class="mn4-hdr-title">What\'s the occasion?</h2><p class="mn4-hdr-sub">We\'ll curate outfits for your vibe</p></div>'
+'<p class="mn4-section-label">Choose occasion</p><div class="mn4-occ-grid">'+oH+'</div>'
+'<div class="mn4-mt-sm"><p class="mn4-section-label">Your style</p><div class="mn4-style-grid">'+sH+'</div></div>'
+'<div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="back" data-value="0">Back</button><button class="mn4-btn mn4-btn--primary" data-action="nxt">Continue \u2192</button></div></div>';
}

function rBody(){
if(st.analyzing){return'<div class="mn4-step"><div class="mn4-loading"><div class="mn4-spinner"></div><div class="mn4-loading-text">Personalization in progress...</div><div class="mn4-loading-sub">Analyzing skin tone, body shape, face shape & more</div><div class="mn4-progress-wrap"><div class="mn4-progress-bar"><div class="mn4-progress-fill" style="width:65%"></div></div><div class="mn4-progress-pct">65%</div></div></div></div>';}
var bd=st.bodyData||{},has=Object.keys(bd).length>0,cf=st.confidence||0;
var badge='';
if(has&&cf>0.5)badge='<div class="mn4-text-center"><span class="mn4-badge" style="font-size:9px">AI Detected \u00B7 '+Math.round(cf*100)+'% confidence</span></div>';
else if(!has)badge='<div class="mn4-text-center"><span class="mn4-badge" style="font-size:9px;border-color:rgba(255,255,255,0.15);color:var(--mn4-text-muted)">No photo \u2014 tap fields to set manually</span></div>';
var g='<div class="mn4-body-grid">';
BF.forEach(function(f){var v=bd[f.key]||'';var d=v?v.charAt(0).toUpperCase()+v.slice(1).replace(/_/g,' '):'';
g+='<div class="mn4-body-cell"><div class="mn4-body-cell-label">'+f.icon+' '+esc(f.label)+'</div><div class="mn4-body-cell-value" data-action="edit-body" data-value="'+f.key+'">'+esc(d)+'</div></div>';});
g+='</div>';
var ph=st.fullBody?'<div class="mn4-text-center"><img src="'+st.fullBody+'" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid var(--mn4-teal)" alt="Your photo"></div>':'';
return'<div class="mn4-step"><div class="mn4-hdr"><div class="mn4-hdr-label">'+esc(sL())+'</div><h2 class="mn4-hdr-title">Your Body Profile</h2><p class="mn4-hdr-sub">'+(has?'Auto-detected \u2014 tap to edit':'Upload a full body photo for auto-detection')+'</p></div>'
+ph+badge+g
+'<div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="back" data-value="1">Back</button><button class="mn4-btn mn4-btn--primary" data-action="nxt">Continue \u2192</button></div></div>';
}

function rBnd(){
var br=st.brands,pr=st.price;
var occ=st.occasion||'casual';
var occData=OCC_BRANDS[occ]||OCC_BRANDS['casual'];
var occStyle=occData.style||'';
var activeTier=pr||null;
var tierData=activeTier?occData[activeTier]:null;

var pH='';PR.forEach(function(p){
var rng=p.range||('Under '+fmtPrice(p.hi));
pH+='<button class="mn4-price-btn" data-action="price-select" data-value="'+p.id+'" aria-pressed="'+(pr===p.id)+'"><span class="mn4-price-icon">'+p.icon+'</span><span class="mn4-price-label">'+esc(p.label)+'</span><span class="mn4-price-range">'+esc(rng)+'</span></button>';
});

var bH='';
if(tierData){
var allBrands=[].concat(tierData.indian||[],tierData.global||[]);
var uniqueBrands=[];var seen={};
allBrands.forEach(function(b){if(!seen[b]){seen[b]=1;uniqueBrands.push(b);}});
uniqueBrands.forEach(function(b){
var isInd=(tierData.indian||[]).indexOf(b)>=0;
bH+='<button class="mn4-brand-btn'+(br.indexOf(b)>=0?' mn4-brand-btn--active':'')+'" data-action="brand-toggle" data-value="'+esc(b)+'" aria-pressed="'+(br.indexOf(b)>=0)+'">'+esc(b)+(isInd?'':' <span class="mn4-brand-global">G</span>')+'</button>';
});
}

var brandSection='';
if(!activeTier){
brandSection='<p class="mn4-text-center mn4-text-muted" style="font-size:11px;margin-top:12px">Select a budget range to see matching brands</p>';
}else{
brandSection='<p class="mn4-section-label mn4-text-center" style="margin-top:16px">Brands in '+esc(occStyle)+' \u00B7 '+esc((PR.find(function(p){return p.id===activeTier})||{}).label||'')+'</p>'
+'<div class="mn4-brand-grid">'+bH+'</div>'
+'<p class="mn4-text-center mn4-text-muted" style="font-size:10px;margin-top:6px">Tap brands you like \u2014 or skip to let AI decide</p>';
}

var bk=st.isReturn?1:2;
return'<div class="mn4-step"><div class="mn4-hdr"><div class="mn4-hdr-label">'+esc(sL())+'</div><h2 class="mn4-hdr-title">Your Preferences</h2><p class="mn4-hdr-sub">'+esc(occStyle)+' \u2014 set your budget & brands</p></div>'
+'<p class="mn4-section-label mn4-text-center">Budget</p><div class="mn4-price-grid">'+pH+'</div>'
+brandSection
+'<div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="back" data-value="'+bk+'">Back</button>'
+'<button class="mn4-btn mn4-btn--primary" data-action="submit"'+(st.loading?' disabled':'')+'>'
+(st.loading?'<span class="mn4-spinner" style="width:18px;height:18px;border-width:2px;margin:0"></span> ':'')
+(br.length>0?'Get My Outfits \u2728 ('+br.length+' brand'+(br.length>1?'s':'')+')':'Get My Outfits \u2728')+'</button></div></div>';
}

function rRes(){
if(st.loading||!st.outfits.length){return'<div class="mn4-step"><div class="mn4-loading"><div class="mn4-spinner"></div><div class="mn4-loading-text">Finding your perfect outfits...</div><div class="mn4-loading-sub">Analyzing style, fit & price preferences</div><div class="mn4-progress-wrap"><div class="mn4-progress-bar"><div class="mn4-progress-fill mn4-progress-fill--animated"></div></div><div class="mn4-progress-pct">...</div></div></div></div>';}
if(st.activeIdx!==null&&st.outfits[st.activeIdx])return rDetail(st.outfits[st.activeIdx]);
var h='<div class="mn4-step"><div class="mn4-hdr"><div class="mn4-hdr-label">Your Outfits</div><h2 class="mn4-hdr-title">We found your style \u2728</h2><p class="mn4-hdr-sub">Tap any outfit for full VTON view + prices</p></div>';
st.outfits.forEach(function(o,i){
var bp=o.prices&&o.prices.find(function(x){return x.best;});
var hasVTON=!!st.vtonImages[o.id];
var vtonContent=hasVTON
?'<img src="'+st.vtonImages[o.id]+'" class="mn4-vton-reveal" style="width:100%;height:100%;object-fit:cover" alt="VTON">'
:'<div class="mn4-vton-loader">'
+'<div class="mn4-vton-loader-ring"><div class="mn4-vton-loader-icon">\u{1F3A8}</div><div class="mn4-vton-scan-line"></div></div>'
+'<div class="mn4-vton-loader-stage">Analyzing your style...</div>'
+'<div class="mn4-vton-loader-sub">Reading color palette & fit preferences</div>'
+'<div class="mn4-vton-loader-dots"><div class="mn4-vton-loader-dot mn4-vton-loader-dot--active"></div><div class="mn4-vton-loader-dot"></div><div class="mn4-vton-loader-dot"></div></div></div>';
h+='<div class="mn4-outfit" data-action="view-outfit" data-value="'+i+'">'
+'<div class="mn4-outfit-head"><h3 class="mn4-outfit-title">'+esc(o.title)+'</h3><span class="mn4-outfit-score">'+o.score+'% match</span></div>'
+'<div class="mn4-vton" data-vton-id="'+o.id+'" style="background:linear-gradient(135deg,'+(o.pieces[0]?o.pieces[0].color:'#222')+'22,#0a0a0a)">'+vtonContent+'<span class="mn4-vton-badge">AI VTON</span></div>'
+'<div class="mn4-pieces">';
o.pieces.forEach(function(p){h+='<div class="mn4-piece"><div class="mn4-piece-dot" style="background:'+esc(p.color)+'"></div><div class="mn4-piece-info"><div class="mn4-piece-name">'+esc(p.name)+'</div><div class="mn4-piece-type">'+esc(p.type)+'</div></div></div>';});
h+='</div>';
if(o.prices&&o.prices.length){var best=bp||o.prices[0];
h+='<div class="mn4-prices" data-price-id="'+o.id+'"><div class="mn4-price-row'+(bp?' mn4-price-row--best':'')+'"><span class="mn4-price-platform">'+esc(o.prices[0].platform)+'</span><span class="mn4-price-amount">'+fmtPrice(best.amount)+'</span>'+(bp?'<span class="mn4-price-best-tag">BEST</span>':'')+'<a class="mn4-price-link" href="'+esc(best.link||'#')+'" target="_blank" onclick="event.stopPropagation()">Shop</a></div></div>';}
h+='</div>';});
h+='<div class="mn4-footer mn4-text-center" style="justify-content:center"><button class="mn4-btn mn4-btn--ghost" data-action="retake">\u2190 Start Over</button></div></div>';
return h;
}

function rDetail(o){
var hasVTON=!!st.vtonImages[o.id];
var vtonContent=hasVTON
?'<img src="'+st.vtonImages[o.id]+'" class="mn4-vton-reveal" style="width:100%;height:100%;object-fit:cover" alt="VTON Result">'
:'<div class="mn4-vton-loader">'
+'<div class="mn4-vton-loader-ring"><div class="mn4-vton-loader-icon">\u{1F3A8}</div><div class="mn4-vton-scan-line"></div></div>'
+'<div class="mn4-vton-loader-stage">Analyzing your style...</div>'
+'<div class="mn4-vton-loader-sub">Reading color palette & fit preferences</div>'
+'<div class="mn4-vton-loader-dots"><div class="mn4-vton-loader-dot mn4-vton-loader-dot--active"></div><div class="mn4-vton-loader-dot"></div><div class="mn4-vton-loader-dot"></div></div></div>';
var h='<div class="mn4-step"><div class="mn4-outfit-head" style="padding:0 0 12px"><button class="mn4-btn mn4-btn--ghost" data-action="back-to-list">\u2190 Back</button><span class="mn4-outfit-score">'+o.score+'% match</span></div>'
+'<h2 class="mn4-hdr-title" style="text-align:left">'+esc(o.title)+'</h2>'
+'<div class="mn4-vton" data-vton-id="'+o.id+'" style="border-radius:16px;margin-top:8px;background:linear-gradient(135deg,'+(o.pieces[0]?o.pieces[0].color:'#222')+'22,#0a0a0a)">'+vtonContent+'<span class="mn4-vton-badge">AI VTON Result</span></div>'
+'<div class="mn4-pieces">';
o.pieces.forEach(function(p){h+='<div class="mn4-piece"><div class="mn4-piece-dot" style="background:'+esc(p.color)+'"></div><div class="mn4-piece-info"><div class="mn4-piece-name">'+esc(p.name)+'</div><div class="mn4-piece-type">'+esc(p.type)+'</div></div></div>';});
h+='</div>';
if(o.prices&&o.prices.length){h+='<div class="mn4-mt-sm"><p class="mn4-section-label">Price Comparison</p><div data-price-id="'+o.id+'">';
o.prices.forEach(function(p){h+='<div class="mn4-price-row'+(p.best?' mn4-price-row--best':'')+'"><span class="mn4-price-platform">'+esc(p.platform)+'</span><span class="mn4-price-amount">'+fmtPrice(p.amount)+'</span>'+(p.best?'<span class="mn4-price-best-tag">BEST</span>':'')+'<a class="mn4-price-link" href="'+esc(p.link||'#')+'" target="_blank">Shop \u2192</a></div>';});
h+='</div></div>';}
h+='<div class="mn4-bank-offer"><span>\u{1F4B3}</span><span class="mn4-bank-offer-text">10% off with HDFC Credit Card \u2014 ends in 2h</span></div>';
h+='<div class="mn4-outfit-actions"><button class="mn4-btn mn4-btn--primary" data-action="shop-now" data-value="'+esc(o.prices&&o.prices[0]?o.prices[0].link:'#')+'">Shop All Pieces</button><button class="mn4-btn mn4-btn--ghost" data-action="retake">New Outfit</button></div></div>';
return h;
}

})();
