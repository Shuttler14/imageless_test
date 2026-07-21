(function(){
'use strict';
var API='https://drishti-api.fly.dev';
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
var BND=[
{id:'h&m',label:'H&M'},{id:'zara',label:'Zara'},{id:'uniqlo',label:'Uniqlo'},
{id:'nike',label:'Nike'},{id:'adidas',label:'Adidas'},{id:'shein',label:'SHEIN'},
{id:'myntra',label:'Myntra'},{id:'ajio',label:'Ajio'}
];
var PR=[
{id:'budget',label:'Budget',icon:'\u{1F3F7}\uFE0F',range:'Under \u20B91,500'},
{id:'mid',label:'Mid-Range',icon:'\u{1F4B0}',range:'\u20B91,500\u2013\u20B95,000'},
{id:'premium',label:'Premium',icon:'\u{1F48E}',range:'\u20B95,000\u2013\u20B915,000'},
{id:'luxury',label:'Luxury',icon:'\u{1F451}',range:'\u20B915,000+'}
];
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
weather:null,weatherLoading:false,city:null,brands:[],vtonImages:{},price:null,bodyData:{},analyzing:false,
confidence:0,fullBody:null,face:null,outfits:[],activeIdx:null,loading:false};

var progressEl,scrollEl,dotsEl;
var W=window.MN4=window.MN4||{};
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
case'weather-check':fetchWeather();break;
case'weather-skip':case'weather-clear':st.weather=null;render();break;
case'brand-toggle':togBrand(v);render();break;
case'price-select':st.price=v;render();break;
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

function togBrand(id){var i=st.brands.indexOf(id);if(i>=0)st.brands.splice(i,1);else st.brands.push(id);}

function fetchWeather(){
var inp=document.getElementById('mn4-city-input');
var city=inp?inp.value.trim():'';if(!city)return;
st.city=city;st.weatherLoading=true;render();
fetch(API+'/api/weather/current',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({city:city})})
.then(function(r){return r.json();})
.then(function(d){st.weather={temp:Math.round(d.temp_c||28),desc:d.description||'Clear Sky',icon:d.icon||'\u2600\uFE0F',city:d.city||city,humidity:d.humidity,wind:d.wind_speed};st.weatherLoading=false;render();})
.catch(function(){st.weather={temp:28,desc:'Clear Sky',icon:'\u2600\uFE0F',city:city};st.weatherLoading=false;render();});
}

function doSubmit(){
st.loading=true;render();saveProfile();
var p={gender:st.gender,occasion:st.occasion,style:st.style==='ai_auto'?'minimalist':st.style,
weather:st.weather||{temp:28,desc:'Clear',icon:'\u2600\uFE0F'},city:st.city||'Mumbai',
brands:st.brands,price_segment:st.price||'mid',body_data:st.bodyData||{}};
if(st.fullBody){uploadPerson(st.fullBody,function(u){p.person_image_url=u;fetchRecs(p);});}
else fetchRecs(p);
}

function uploadPerson(dUrl,cb){
var pts=dUrl.split(','),mime=pts[0].match(/:(.*?);/)[1],b64=pts[1];
var bin=atob(b64),arr=new Uint8Array(bin.length);
for(var i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);
var blob=new Blob([arr],{type:mime}),fd=new FormData();
fd.append('file',blob,'person.jpg');fd.append('session_id','mn4_'+Date.now());
fetch(API+'/api/vton/upload-person',{method:'POST',body:fd})
.then(function(r){return r.json();})
.then(function(d){cb(d.person_image_url||null);})
.catch(function(){cb(null);});
}

function fetchRecs(p){
st._personUrl=p.person_image_url||null;
fetch(API+'/api/reco/outfits',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)})
.then(function(r){return r.json();})
.then(function(d){
var recs=d.recommendations||d.outfits||mockRecs(p);
st.outfits=recs.map(function(r){return{id:r.product_id||r.id,title:r.title||'Recommended',
score:Math.round((r.score||0.85)*100),pieces:[{name:r.title,type:'top',color:'#39A596',product_id:r.product_id,image_url:r.image_url}],
prices:[{platform:'Shopify',amount:r.price||0,best:true,link:r.url||'#'}],_product_id:r.product_id};});
fetchPrices(st.outfits);
if(st._personUrl)generateVTON(st.outfits,st._personUrl);
st.loading=false;st.step++;render();})
.catch(function(){st.outfits=mockRecs(p);st.loading=false;st.step++;render();});
}

function fetchPrices(outfits){
outfits.forEach(function(o){
if(!o._product_id)return;
fetch(API+'/api/pricing/compare/shopify/'+o._product_id+'?product_name='+encodeURIComponent(o.title))
.then(function(r){return r.json();})
.then(function(d){if(d.results&&d.results.length){
o.prices=d.results.map(function(p){return{platform:p.platform,amount:p.price,best:p.is_best||false,link:p.url||'#',original_price:p.original_price||null};});
render();}}).catch(function(){});
});
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

function generateVTON(outfits,personUrl){
outfits.forEach(function(o){
var garmentUrl=o.pieces&&o.pieces[0]&&o.pieces[0].image_url;
if(!garmentUrl)return;
var fd=new FormData();
fd.append('person_image_url',personUrl);
fd.append('garment_image_url',garmentUrl);
fd.append('session_id','mn4_vton_'+Date.now());
fetch(API+'/api/vton/try-on',{method:'POST',body:fd})
.then(function(r){return r.json();})
.then(function(d){
if(d.result_image_url||d.vton_image_url||d.image_url){
st.vtonImages[o.id]=d.result_image_url||d.vton_image_url||d.image_url;
render();
}}).catch(function(){});
});
}

function render(){
if(!scrollEl)return;

if(progressEl){var pct=Math.round((st.step/(mx()-1))*100);
progressEl.innerHTML='<div class="mn4-progress"><div class="mn4-progress-fill" style="width:'+pct+'%"></div></div>';}
var h='';
if(st.isReturn){if(st.step===0)h=rWelc();else if(st.step===1)h=rOcc();else if(st.step===2)h=rBnd();else h=rRes();}
else{if(st.step===0)h=rGen();else if(st.step===1)h=rOcc();else if(st.step===2)h=rBody();else if(st.step===3)h=rBnd();else h=rRes();}
scrollEl.innerHTML=h;scrollEl.scrollTop=0;
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
var fb=st.fullBody,fc=st.face;
return'<div><p class="mn4-section-label mn4-text-center">Upload your photos</p>'
+'<div class="mn4-upload-grid">'
+'<div class="mn4-upload-zone" data-action="upload-trigger" data-value="fullBody" data-has-image="'+!!fb+'">'
+'<input type="file" id="mn4-input-fullBody" accept="image/jpeg,image/png,image/webp" hidden>'
+(fb?'<img class="mn4-upload-preview" src="'+fb+'" alt="Full body"><button class="mn4-upload-remove" data-action="upload-remove" data-value="fullBody">\u2715</button>'
:'<span class="mn4-upload-icon">\u{1F4F8}</span><span class="mn4-upload-label">Full Body Photo</span><span class="mn4-upload-hint">Standing pose, head to toe</span>')
+'</div>'
+'<div class="mn4-upload-zone" data-action="upload-trigger" data-value="face" data-has-image="'+!!fc+'">'
+'<input type="file" id="mn4-input-face" accept="image/jpeg,image/png,image/webp" hidden>'
+(fc?'<img class="mn4-upload-preview" src="'+fc+'" alt="Face"><button class="mn4-upload-remove" data-action="upload-remove" data-value="face">\u2715</button>'
:'<span class="mn4-upload-icon">\u{1F933}</span><span class="mn4-upload-label">Face Photo</span><span class="mn4-upload-hint">For face shape analysis</span>')
+'</div></div></div>';
}

function rOcc(){
var oc=st.occasion,sty=st.style,w=st.weather;
var oH='';OCC.forEach(function(o){oH+='<button class="mn4-occ-btn" data-action="occasion" data-value="'+o.id+'" aria-pressed="'+(oc===o.id)+'"><span class="mn4-occ-emoji">'+o.emoji+'</span>'+esc(o.label)+'</button>';});
var sH='';STY.forEach(function(s){sH+='<button class="mn4-style-btn'+(s.ai?' mn4-style-btn--ai':'')+'" data-action="style" data-value="'+s.id+'" aria-pressed="'+(sty===s.id)+'">'+(s.ai?'\u2728 ':'')+esc(s.label)+'</button>';});
var wH='';
if(st.weatherLoading){wH='<div class="mn4-mt-sm"><p class="mn4-section-label">Weather (optional)</p><div class="mn4-weather-input-wrap"><input type="text" id="mn4-city-input" class="mn4-weather-input" value="'+esc(st.city||'')+'" placeholder="Enter your city..."><button class="mn4-btn mn4-btn--primary mn4-btn--sm" disabled><span class="mn4-spinner" style="width:14px;height:14px;border-width:2px;margin:0"></span></button></div></div>';}
else if(w){wH='<div class="mn4-weather-card"><span class="mn4-weather-icon">'+w.icon+'</span><div class="mn4-weather-info"><div class="mn4-weather-temp">'+w.temp+'\u00B0C</div><div class="mn4-weather-desc">'+esc(w.desc)+' \u00B7 '+esc(st.city||'Your City')+'</div></div><button class="mn4-btn mn4-btn--ghost mn4-btn--sm" data-action="weather-clear">\u2715</button></div>';}
else{wH='<div class="mn4-mt-sm"><p class="mn4-section-label">Weather (optional)</p><div class="mn4-weather-input-wrap"><input type="text" id="mn4-city-input" class="mn4-weather-input" value="'+esc(st.city||'')+'" placeholder="Enter your city for weather-aware recs..."><button class="mn4-btn mn4-btn--primary mn4-btn--sm" data-action="weather-check">Check</button></div><button class="mn4-skip-link" data-action="weather-skip">Skip \u2014 use default weather</button></div>';}
var sn=(st.isReturn?1:2)+' of '+mx();
return'<div class="mn4-step"><div class="mn4-hdr"><div class="mn4-hdr-label">'+esc(sn)+'</div><h2 class="mn4-hdr-title">What\'s the occasion?</h2><p class="mn4-hdr-sub">We\'ll curate outfits for your vibe</p></div>'
+'<p class="mn4-section-label">Choose occasion</p><div class="mn4-occ-grid">'+oH+'</div>'
+'<div class="mn4-mt-sm"><p class="mn4-section-label">Your style</p><div class="mn4-style-grid">'+sH+'</div></div>'
+wH
+'<div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="back" data-value="0">Back</button><button class="mn4-btn mn4-btn--primary" data-action="nxt">Continue \u2192</button></div></div>';
}

function rBody(){
if(st.analyzing){return'<div class="mn4-step"><div class="mn4-loading"><div class="mn4-spinner"></div><div class="mn4-loading-text">AI is reading your body data...</div><div class="mn4-loading-sub">Analyzing skin tone, body shape, face shape & more</div></div></div>';}
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
var bH='';BND.forEach(function(b){bH+='<button class="mn4-brand-btn" data-action="brand-toggle" data-value="'+b.id+'" aria-pressed="'+(br.indexOf(b.id)>=0)+'">'+esc(b.label)+'</button>';});
var pH='';PR.forEach(function(p){pH+='<button class="mn4-price-btn" data-action="price-select" data-value="'+p.id+'" aria-pressed="'+(pr===p.id)+'"><span class="mn4-price-icon">'+p.icon+'</span><span class="mn4-price-label">'+esc(p.label)+'</span><span class="mn4-price-range">'+esc(p.range)+'</span></button>';});
var bk=st.isReturn?1:2;
return'<div class="mn4-step"><div class="mn4-hdr"><div class="mn4-hdr-label">'+esc(sL())+'</div><h2 class="mn4-hdr-title">Your Preferences</h2><p class="mn4-hdr-sub">Pick your favorite brands & budget</p></div>'
+'<p class="mn4-section-label mn4-text-center">Favorite brands</p><div class="mn4-brand-grid">'+bH+'</div>'
+'<p class="mn4-section-label mn4-text-center mn4-mt-md">Budget</p><div class="mn4-price-grid">'+pH+'</div>'
+'<div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="back" data-value="'+bk+'">Back</button>'
+'<button class="mn4-btn mn4-btn--primary" data-action="submit"'+(st.loading?' disabled':'')+'>'
+(st.loading?'<span class="mn4-spinner" style="width:18px;height:18px;border-width:2px;margin:0"></span> ':'')
+'Get My Outfits \u2728</button></div></div>';
}

function rRes(){
if(st.loading||!st.outfits.length){return'<div class="mn4-step"><div class="mn4-loading"><div class="mn4-spinner"></div><div class="mn4-loading-text">Finding your perfect outfits...</div><div class="mn4-loading-sub">Analyzing style, fit & price preferences</div></div></div>';}
if(st.activeIdx!==null&&st.outfits[st.activeIdx])return rDetail(st.outfits[st.activeIdx]);
var h='<div class="mn4-step"><div class="mn4-hdr"><div class="mn4-hdr-label">Your Outfits</div><h2 class="mn4-hdr-title">We found your style \u2728</h2><p class="mn4-hdr-sub">Tap any outfit for full VTON view + prices</p></div>';
st.outfits.forEach(function(o,i){
var bp=o.prices&&o.prices.find(function(x){return x.best;});
h+='<div class="mn4-outfit" data-action="view-outfit" data-value="'+i+'">'
+'<div class="mn4-outfit-head"><h3 class="mn4-outfit-title">'+esc(o.title)+'</h3><span class="mn4-outfit-score">'+o.score+'% match</span></div>'
+'<div class="mn4-vton" style="background:linear-gradient(135deg,'+(o.pieces[0]?o.pieces[0].color:'#222')+'22,#0a0a0a)">'+(st.vtonImages[o.id]?'<img src="'+st.vtonImages[o.id]+'" style="width:100%;height:100%;object-fit:cover" alt="VTON">':'<div class="mn4-vton-placeholder">\u{1F457}</div>')+'<span class="mn4-vton-badge">AI VTON</span></div>'
+'<div class="mn4-pieces">';
o.pieces.forEach(function(p){h+='<div class="mn4-piece"><div class="mn4-piece-dot" style="background:'+esc(p.color)+'"></div><div class="mn4-piece-info"><div class="mn4-piece-name">'+esc(p.name)+'</div><div class="mn4-piece-type">'+esc(p.type)+'</div></div></div>';});
h+='</div>';
if(o.prices&&o.prices.length){var best=bp||o.prices[0];
h+='<div class="mn4-prices"><div class="mn4-price-row'+(bp?' mn4-price-row--best':'')+'"><span class="mn4-price-platform">'+esc(o.prices[0].platform)+'</span><span class="mn4-price-amount">\u20B9'+best.amount+'</span>'+(bp?'<span class="mn4-price-best-tag">BEST</span>':'')+'<a class="mn4-price-link" href="'+esc(best.link||'#')+'" target="_blank" onclick="event.stopPropagation()">Shop</a></div></div>';}
h+='</div>';});
h+='<div class="mn4-footer mn4-text-center" style="justify-content:center"><button class="mn4-btn mn4-btn--ghost" data-action="retake">\u2190 Start Over</button></div></div>';
return h;
}

function rDetail(o){
var h='<div class="mn4-step"><div class="mn4-outfit-head" style="padding:0 0 12px"><button class="mn4-btn mn4-btn--ghost" data-action="back-to-list">\u2190 Back</button><span class="mn4-outfit-score">'+o.score+'% match</span></div>'
+'<h2 class="mn4-hdr-title" style="text-align:left">'+esc(o.title)+'</h2>'
+'<div class="mn4-vton" style="border-radius:16px;margin-top:8px;background:linear-gradient(135deg,'+(o.pieces[0]?o.pieces[0].color:'#222')+'22,#0a0a0a)">'+(st.vtonImages[o.id]?'<img src="'+st.vtonImages[o.id]+'" style="width:100%;height:100%;object-fit:cover" alt="VTON Result">':'<div class="mn4-vton-placeholder" style="font-size:80px">\u{1F457}</div>')+'<span class="mn4-vton-badge">AI VTON Result</span></div>'
+'<div class="mn4-pieces">';
o.pieces.forEach(function(p){h+='<div class="mn4-piece"><div class="mn4-piece-dot" style="background:'+esc(p.color)+'"></div><div class="mn4-piece-info"><div class="mn4-piece-name">'+esc(p.name)+'</div><div class="mn4-piece-type">'+esc(p.type)+'</div></div></div>';});
h+='</div>';
if(o.prices&&o.prices.length){h+='<div class="mn4-mt-sm"><p class="mn4-section-label">Price Comparison</p>';
o.prices.forEach(function(p){h+='<div class="mn4-price-row'+(p.best?' mn4-price-row--best':'')+'"><span class="mn4-price-platform">'+esc(p.platform)+'</span><span class="mn4-price-amount">\u20B9'+p.amount+'</span>'+(p.best?'<span class="mn4-price-best-tag">BEST</span>':'')+'<a class="mn4-price-link" href="'+esc(p.link||'#')+'" target="_blank">Shop \u2192</a></div>';});
h+='</div>';}
h+='<div class="mn4-bank-offer"><span>\u{1F4B3}</span><span class="mn4-bank-offer-text">10% off with HDFC Credit Card \u2014 ends in 2h</span></div>';
h+='<div class="mn4-outfit-actions"><button class="mn4-btn mn4-btn--primary" data-action="shop-now" data-value="'+esc(o.prices&&o.prices[0]?o.prices[0].link:'#')+'">Shop All Pieces</button><button class="mn4-btn mn4-btn--ghost" data-action="retake">New Outfit</button></div></div>';
return h;
}

})();
