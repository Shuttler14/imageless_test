/**
 * MN4 — AI Stylist Wizard v4.0 Core Engine
 * 5 clicks (first-time) / 3 clicks (returning)
 */
(function(){
'use strict';
var W=window.MN4=window.MN4||{};
var C={
  DRISHTI:'https://drishti-api.fly.dev',
  VERCEL:'https://mynarrative-vton.vercel.app',
  OCCASIONS:[
    {id:'casual',label:'Casual',emoji:'👟'},
    {id:'work',label:'Work',emoji:'💼'},
    {id:'date',label:'Date',emoji:'🍷'},
    {id:'party',label:'Party',emoji:'🎉'},
    {id:'wedding',label:'Wedding',emoji:'💍'},
    {id:'travel',label:'Travel',emoji:'✈️'},
    {id:'festive',label:'Festive',emoji:'🪔'},
    {id:'gym',label:'Gym',emoji:'🏋️'}
  ],
  STYLES:[
    {id:'minimalist',label:'Minimalist'},
    {id:'streetwear',label:'Streetwear'},
    {id:'classic',label:'Classic'},
    {id:'boho',label:'Boho'},
    {id:'athleisure',label:'Athleisure'},
    {id:'glam',label:'Glam'},
    {id:'y2k',label:'Y2K'},
    {id:'cottagecore',label:'Cottagecore'},
    {id:'corporate',label:'Corporate'},
    {id:'ai_auto',label:'AI Auto',isAI:true}
  ],
  BRANDS:[
    {id:'h&m',label:'H&M'},
    {id:'zara',label:'Zara'},
    {id:'uniqlo',label:'Uniqlo'},
    {id:'nike',label:'Nike'},
    {id:'adidas',label:'Adidas'},
    {id:'shein',label:'SHEIN'},
    {id:'myntra',label:'Myntra'},
    {id:'ajio',label:'Ajio'}
  ],
  PRICES:[
    {id:'budget',label:'Budget',icon:'🏷️',range:'Under ₹1,500'},
    {id:'mid',label:'Mid-Range',icon:'💰',range:'₹1,500–₹5,000'},
    {id:'premium',label:'Premium',icon:'💎',range:'₹5,000–₹15,000'},
    {id:'luxury',label:'Luxury',icon:'👑',range:'₹15,000+'}
  ],
  BODY_FIELDS:[
    {key:'skin_tone',label:'Skin Tone',icon:'🎨'},
    {key:'body_shape',label:'Body Shape',icon:'🪞'},
    {key:'face_shape',label:'Face Shape',icon:'😊'},
    {key:'hair_color',label:'Hair Color',icon:'💇'},
    {key:'hair_style',label:'Hair Style',icon:'✂️'},
    {key:'fitness',label:'Fitness Level',icon:'💪'},
    {key:'complexion',label:'Complexion',icon:'✨'},
    {key:'undertone',label:'Undertone',icon:'🌡️'}
  ]
};
W.C=C;

var S={step:0,isReturn:false,profile:null,
  gender:null,occasion:null,style:null,
  weather:null,city:null,
  brands:[],price:null,
  bodyData:null,analyzing:false,analysisConfidence:0,
  fullBody:null,face:null,
  outfits:[],loading:false
};
W.S=S;
var el=null;

/* ═══ INIT ═══ */
W.init=function(target){
  el=target||document.getElementById('mn4-wizard');
  if(!el)return;
  load(); detect(); render();
};

function load(){
  try{var s=localStorage.getItem('mn4_profile');
    if(s){S.profile=JSON.parse(s);S.gender=S.profile.gender;S.bodyData=S.profile.bodyData||{};}
  }catch(e){}
}
function save(){
  S.profile={gender:S.gender,bodyData:S.bodyData,ts:Date.now()};
  try{localStorage.setItem('mn4_profile',JSON.stringify(S.profile));}catch(e){}
}
function detect(){
  S.isReturn=!!(S.profile&&S.profile.gender&&S.bodyData&&Object.keys(S.bodyData).length>2);
}

/* ═══ RENDER ═══ */
function render(){
  if(!el)return;
  var step=S.step;
  if(S.isReturn){
    if(step===0) el.innerHTML=htmlWelcome();
    else if(step===1) el.innerHTML=htmlOccasionStyle();
    else if(step===2) el.innerHTML=htmlBrandsReturn();
    else if(step>=3) el.innerHTML=htmlResults();
  }else{
    if(step===0) el.innerHTML=htmlGenderUpload();
    else if(step===1) el.innerHTML=htmlOccasionStyle();
    else if(step===2) el.innerHTML=htmlBodyData();
    else if(step===3) el.innerHTML=htmlBrandsFirst();
    else if(step>=4) el.innerHTML=htmlResults();
  }
  bindDrag();
}
W.render=render;

function maxStep(){return S.isReturn?3:5;}
function stepLabel(){return 'Step '+(S.isReturn?S.step+1:S.step+1)+' of '+maxStep();}

/* ═══ NAVIGATION ═══ */
W.goStep=function(n){S.step=n;render();};
W.next=function(){
  if(S.step<maxStep()-1){S.step++;render();}
};

/* ═══ GENDER SELECT ═══ */
W.selectGender=function(g){
  S.gender=g;render();
};

/* ═══ FILE HANDLING ═══ */
W.handleFile=function(input,type){
  var f=input.files&&input.files[0];
  if(!f)return;
  if(f.size>10*1024*1024){alert('Max 10MB');return;}
  if(!f.type.match(/^image\/(jpeg|png|webp)$/)){alert('Use JPG/PNG/WebP');return;}
  var r=new FileReader();
  r.onload=function(e){
    S[type]=e.target.result;
    if(S.gender&&S.fullBody){
      var btn=document.getElementById('mn4-next-0');
      if(btn)btn.disabled=false;
    }
    render();
    // Auto-analyze body data when full body photo uploaded
    if(type==='fullBody'&&S.fullBody){
      analyzeBodyFromUpload(S.fullBody);
    }
  };
  r.readAsDataURL(f);
};

/* ═══ AI BODY ANALYSIS ═══ */
function analyzeBodyFromUpload(dataUrl){
  S.analyzing=true;
  render();
  // Convert dataURL to blob
  var parts=dataUrl.split(',');
  var mime=parts[0].match(/:(.*?);/)[1];
  var b64=parts[1];
  var bin=atob(b64);var arr=new Uint8Array(bin.length);
  for(var i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);
  var blob=new Blob([arr],{type:mime});
  var fd=new FormData();
  fd.append('file',blob,'body.jpg');
  fd.append('gender',S.gender||'');
  fetch(C.DRISHTI+'/api/analysis/body/upload',{
    method:'POST',body:fd
  }).then(function(r){return r.json();})
    .then(function(data){
      S.bodyData=data.body_data||{};
      S.analyzing=false;
      S.analysisConfidence=data.confidence||0;
      save();
      render();
    }).catch(function(e){
      console.error('[MN4] Body analysis failed:',e);
      S.analyzing=false;
      render();
    });
}
W.analyzeBodyFromUpload=analyzeBodyFromUpload;
W.removeUpload=function(type){S[type]=null;render();};
W.handleDrop=function(ev,type){
  ev.preventDefault();
  var f=ev.dataTransfer.files&&ev.dataTransfer.files[0];
  if(!f)return;
  var dt=new DataTransfer();dt.items.add(f);
  var inp=document.getElementById(type==='fullBody'?'mn4-input-full':'mn4-input-face');
  if(inp){inp.files=dt.files;W.handleFile(inp,type);}
};
function bindDrag(){
  ['full','face'].forEach(function(id){
    var zone=document.getElementById('mn4-upload-'+id);
    if(!zone)return;
    zone.addEventListener('dragover',function(e){e.preventDefault();zone.style.borderColor='#39A596';});
    zone.addEventListener('dragleave',function(){zone.style.borderColor='';});
  });
}

/* ═══ OCCASION / STYLE ═══ */
W.selectOccasion=function(id){S.occasion=id;render();};
W.selectStyle=function(id){S.style=id;render();};

/* ═══ WEATHER ═══ */
W.fetchWeather=function(){
  var inp=document.getElementById('mn4-city-input');
  var city=inp?inp.value.trim():'';
  if(!city)return;
  S.city=city;
  // Use backend weather endpoint (keeps API key server-side)
  fetch(C.DRISHTI+'/api/weather/current',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({city:city})
  }).then(function(r){return r.json();})
    .then(function(d){
      S.weather={temp:Math.round(d.temp_c||28),desc:d.description||'Clear Sky',icon:d.icon||'☀️',city:d.city||city,humidity:d.humidity,wind:d.wind_speed};
      render();
    }).catch(function(){
      // Fallback to client-side if backend fails
      if(window.MNWeather&&MNWeather.fetch){
        MNWeather.fetch(city,function(data){S.weather=data;render();});
      }else{
        S.weather={temp:28,desc:'Clear Sky',icon:'☀️',city:city};
        render();
      }
    });
};
W.skipWeather=function(){S.weather=null;render();};
W.clearWeather=function(){S.weather=null;render();};

/* ═══ BRANDS ═══ */
W.toggleBrand=function(id){
  var i=S.brands.indexOf(id);
  if(i>=0)S.brands.splice(i,1);else S.brands.push(id);
  render();
};
W.selectPrice=function(id){S.price=id;render();};
W.clearBrands=function(){S.brands=[];render();};

/* ═══ BODY EDIT ═══ */
W.editBodyField=function(key,div){
  var cur=S.bodyData&&S.bodyData[key]||'';
  var inp=document.createElement('input');
  inp.type='text';inp.className='mn4-body-edit-input';
  inp.value=cur;inp.placeholder='Enter '+key.replace(/_/g,' ');
  div.innerHTML='';div.appendChild(inp);inp.focus();
  inp.onblur=function(){S.bodyData=S.bodyData||{};S.bodyData[key]=inp.value;render();};
  inp.onkeydown=function(e){if(e.key==='Enter')inp.blur();};
};

/* ═══ SUBMIT — Call APIs ═══ */
W.submit=function(){
  S.loading=true;render();
  save();
  // Build payload
  var payload={
    gender:S.gender,
    occasion:S.occasion,
    style:S.style==='ai_auto'?'minimalist':S.style,
    weather:S.weather||{temp:28,desc:'Clear',icon:'☀️'},
    city:S.city||'Mumbai',
    brands:S.brands,
    price_segment:S.price||'mid',
    body_data:S.bodyData||{}
  };
  // Upload person image then get recs
  if(S.fullBody){
    uploadPerson(S.fullBody,function(personUrl){
      payload.person_image_url=personUrl;
      fetchRecs(payload);
    });
  }else{
    fetchRecs(payload);
  }
};

function uploadPerson(dataUrl,cb){
  // Convert dataURL to blob
  var parts=dataUrl.split(',');
  var mime=parts[0].match(/:(.*?);/)[1];
  var b64=parts[1];
  var bin=atob(b64);var arr=new Uint8Array(bin.length);
  for(var i=0;i<bin.length;i++)arr[i]=bin.charCodeAt(i);
  var blob=new Blob([arr],{type:mime});
  var fd=new FormData();
  fd.append('file',blob,'person.jpg');
  fd.append('session_id','mn4_'+Date.now());
  fetch(C.DRISHTI+'/api/vton/upload-person',{
    method:'POST',body:fd
  }).then(function(r){return r.json();})
    .then(function(d){cb(d.person_image_url||null);})
    .catch(function(){cb(null);});
}

function fetchRecs(payload){
  fetch(C.DRISHTI+'/api/reco/outfits',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify(payload)
  }).then(function(r){return r.json();})
    .then(function(data){
      S.outfits=data.outfits||data.recommendations||generateMockOutfits(payload);
      S.loading=false;S.step++;render();
    }).catch(function(){
      S.outfits=generateMockOutfits(payload);
      S.loading=false;S.step++;render();
    });
}

function generateMockOutfits(p){
  var occ=p.occasion||'casual';
  var sty=p.style||'minimalist';
  return [
    {id:1,title:sty.charAt(0).toUpperCase()+sty.slice(1)+' '+occ.charAt(0).toUpperCase()+occ.slice(1),score:95,
     pieces:[{name:'Linen Blend Shirt',type:'top',color:'#39A596'},{name:'Tailored Chinos',type:'bottom',color:'#2d2d2d'},{name:'White Sneakers',type:'shoes',color:'#fff'}],
     prices:[{platform:'Myntra',amount:2499,best:true,link:'#'},{platform:'Ajio',amount:2799,link:'#'},{platform:'Amazon',amount:2999,link:'#'}]},
    {id:2,title:occ.charAt(0).toUpperCase()+occ.slice(1)+' Essential',score:88,
     pieces:[{name:'Oversized Tee',type:'top',color:'#1a1a1a'},{name:'Relaxed Jeans',type:'bottom',color:'#4a6fa5'},{name:'Canvas Loafers',type:'shoes',color:'#c4a882'}],
     prices:[{platform:'H&M',amount:1299,best:true,link:'#'},{platform:'Zara',amount:1599,link:'#'},{platform:'SHEIN',amount:899,link:'#'}]},
    {id:3,title:'Smart Casual Edit',score:82,
     pieces:[{name:'Polo T-Shirt',type:'top',color:'#7c3aed'},{name:'Chino Shorts',type:'bottom',color:'#d4c5a9'},{name:'Loafers',type:'shoes',color:'#5c4033'}],
     prices:[{platform:'Uniqlo',amount:1899,best:true,link:'#'},{platform:'Myntra',amount:2199,link:'#'}]}
  ];
}

/* ═══ CLICK OUTFIT ═══ */
W.viewOutfit=function(idx){
  S.activeIdx=idx;render();
};
W.backToList=function(){
  S.activeIdx=null;render();
};
W.shopNow=function(url){
  window.open(url,'_blank');
};
W.retake=function(){
  S.step=S.isReturn?1:0;S.outfits=[];S.activeIdx=null;render();
};

/* ═══════════════════════════════════════════════════
   HTML GENERATORS
   ═══════════════════════════════════════════════════ */

function dots(){
  var h='<div class="mn4-step-dots">';
  for(var i=0;i<maxStep();i++){
    var cls='mn4-dot';
    if(i===S.step)cls+=' mn4-dot-active';
    else if(i<S.step)cls+=' mn4-dot-done';
    h+='<div class="'+cls+'"></div>';
  }
  return h+'</div>';
}
function progress(){
  var pct=Math.round(((S.step)/(maxStep()-1))*100);
  return '<div class="mn4-progress"><div class="mn4-progress-fill" style="width:'+pct+'%"></div></div>';
}

/* ── STEP 0: Welcome Back ── */
function htmlWelcome(){
  var g=S.gender==='male'?'King':'Queen';
  return '<div class="mn4-step"><div class="mn4-welcome-back">'
    +'<div class="mn4-orb mn4-orb-1"></div><div class="mn4-orb mn4-orb-2"></div>'
    +'<div class="mn4-badge">Welcome Back</div>'
    +'<h2 class="mn4-step-title" style="font-size:22px">Ready for a new look, '+g+'?</h2>'
    +'<p class="mn4-step-sub">Skip the setup — jump straight to outfit recommendations</p>'
    +'<button class="mn4-cta" onclick="MN4.goStep(1)">Let\'s Go ✨</button>'
    +'</div>'+dots()+'</div>';
}

/* ── STEP 0: Gender + Upload ── */
function htmlGenderUpload(){
  var g=S.gender;
  var hasFB=!!S.fullBody;
  return '<div class="mn4-step">'+progress()
    +'<div class="mn4-step-hdr">'
    +'<div class="mn4-step-num">'+stepLabel()+'</div>'
    +'<h2 class="mn4-step-title">Let\'s get to know you</h2>'
    +'<p class="mn4-step-sub">This helps us recommend outfits that actually fit you</p></div>'
    +'<div class="mn4-gender-cards">'
    +'<button class="mn4-gender-card'+(g==='female'?' mn4-selected':'')+'" onclick="MN4.selectGender(\'female\')">'
    +'<span class="mn4-gender-emoji">👗</span><span class="mn4-gender-label">Female</span>'
    +'<span class="mn4-gender-tagline">Feminine fits & drapes</span></button>'
    +'<button class="mn4-gender-card'+(g==='male'?' mn4-selected':'')+'" onclick="MN4.selectGender(\'male\')">'
    +'<span class="mn4-gender-emoji">👔</span><span class="mn4-gender-label">Male</span>'
    +'<span class="mn4-gender-tagline">Sharp cuts & layers</span></button></div>'
    +(g?htmlUpload():'<p class="mn4-step-sub" style="text-align:center;margin-top:8px">↑ Select your gender first</p>')
    +'<div class="mn4-step-footer"><span></span>'
    +'<button class="mn4-cta" id="mn4-next-0" onclick="MN4.goStep(1)"'+(!g||!hasFB?' disabled':'')+'>Continue →</button></div>'
    +dots()+'</div>';
}

/* ── Upload Zone ── */
function htmlUpload(){
  var fb=S.fullBody,fc=S.face;
  return '<div class="mn4-upload-section">'
    +'<p class="mn4-section-label" style="text-align:center">Upload your photos</p>'
    +'<div class="mn4-upload-grid">'
    +'<div class="mn4-upload-zone'+(fb?' mn4-has-image':'')+'" id="mn4-upload-full"'
    +' onclick="document.getElementById(\'mn4-input-full\').click()">'
    +'<input type="file" id="mn4-input-full" accept="image/*" hidden onchange="MN4.handleFile(this,\'fullBody\')">'
    +(fb?'<img class="mn4-upload-preview" src="'+fb+'" alt="Full body">'
      +'<button class="mn4-upload-remove" onclick="event.stopPropagation();MN4.removeUpload(\'fullBody\')">✕</button>'
      :'<span class="mn4-upload-icon">📸</span><span class="mn4-upload-label">Full Body Photo</span>'
      +'<span class="mn4-upload-hint">Standing pose, head to toe</span>')
    +'</div>'
    +'<div class="mn4-upload-zone'+(fc?' mn4-has-image':'')+'" id="mn4-upload-face"'
    +' onclick="document.getElementById(\'mn4-input-face\').click()">'
    +'<input type="file" id="mn4-input-face" accept="image/*" hidden onchange="MN4.handleFile(this,\'face\')">'
    +(fc?'<img class="mn4-upload-preview" src="'+fc+'" alt="Face">'
      +'<button class="mn4-upload-remove" onclick="event.stopPropagation();MN4.removeUpload(\'face\')">✕</button>'
      :'<span class="mn4-upload-icon">🤳</span><span class="mn4-upload-label">Face Photo</span>'
      +'<span class="mn4-upload-hint">For face shape analysis</span>')
    +'</div></div></div>';
}

/* ── STEP 1: Occasion + Style + Weather ── */
function htmlOccasionStyle(){
  var occ=S.occasion,sty=S.style,w=S.weather;
  var occH='';
  C.OCCASIONS.forEach(function(o){
    occH+='<button class="mn4-occ-chip'+(occ===o.id?' mn4-active':'')+'"'
      +' onclick="MN4.selectOccasion(\''+o.id+'\')">'
      +'<span class="mn4-occ-emoji">'+o.emoji+'</span>'+o.label+'</button>';
  });
  var styH='';
  C.STYLES.forEach(function(s){
    styH+='<button class="mn4-style-chip'+(s.isAI?' mn4-ai-auto':'')+(sty===s.id?' mn4-active':'')+'"'
      +' onclick="MN4.selectStyle(\''+s.id+'\')">'
      +(s.isAI?'✨ ':'')+s.label+'</button>';
  });
  var weatherH='';
  if(w){
    weatherH='<div class="mn4-weather-card">'
      +'<span class="mn4-weather-icon">'+w.icon+'</span>'
      +'<div class="mn4-weather-info"><div class="mn4-weather-temp">'+w.temp+'°C</div>'
      +'<div class="mn4-weather-desc">'+w.desc+' · '+(S.city||'Your City')+'</div></div>'
      +'<button class="mn4-btn-ghost" onclick="MN4.clearWeather()" style="font-size:11px">✕</button></div>';
  }else{
    weatherH='<div style="margin-top:10px"><p class="mn4-section-label">Weather (optional)</p>'
      +'<div style="display:flex;gap:8px;align-items:center;padding:4px;border-radius:10px;border:1px solid rgba(255,255,255,0.1);background:rgba(255,255,255,0.04)">'
      +'<input type="text" id="mn4-city-input" style="border:none;background:none;flex:1;color:#fff;font-size:13px;padding:8px 10px;outline:none;font-family:inherit"'
      +' placeholder="Enter your city for weather-aware recs..." onkeydown="if(event.key===\'Enter\')MN4.fetchWeather()">'
      +'<button class="mn4-cta" style="padding:8px 14px;font-size:11px;margin-right:4px" onclick="MN4.fetchWeather()">Check</button></div>'
      +'<button class="mn4-skip-btn" onclick="MN4.skipWeather()" style="margin-top:6px">Skip — use default weather</button></div>';
  }
  var stepN=S.isReturn?1:2;
  return '<div class="mn4-step">'+progress()
    +'<div class="mn4-step-hdr"><div class="mn4-step-num">'+stepN+' of '+maxStep()+'</div>'
    +'<h2 class="mn4-step-title">What\'s the occasion?</h2>'
    +'<p class="mn4-step-sub">We\'ll curate outfits for your vibe</p></div>'
    +'<p class="mn4-section-label">Choose occasion</p><div class="mn4-occasion-grid">'+occH+'</div>'
    +'<div style="margin-top:8px"><p class="mn4-section-label">Your style</p><div class="mn4-style-grid">'+styH+'</div></div>'
    +weatherH
    +'<div class="mn4-step-footer"><button class="mn4-btn-ghost" onclick="MN4.goStep(0)">Back</button>'
    +'<button class="mn4-cta" onclick="MN4.next()">Continue →</button></div>'
    +dots()+'</div>';
}

/* ── STEP 2: Body Data (first-time) ── */
function htmlBodyData(){
  // Show loading if AI is analyzing
  if(S.analyzing){
    return '<div class="mn4-step">'+progress()
      +'<div class="mn4-results-loading">'
      +'<div class="mn4-loading-spinner"></div>'
      +'<div class="mn4-loading-text">AI is reading your body data...</div>'
      +'<div class="mn4-loading-sub">Analyzing skin tone, body shape, face shape & more</div>'
      +'</div></div>';
  }
  var bd=S.bodyData||{};
  var hasData=Object.keys(bd).length>0;
  var conf=S.analysisConfidence||0;
  var h='';
  // Confidence badge
  if(hasData&&conf>0.5){
    var confPct=Math.round(conf*100);
    h+='<div style="text-align:center;margin-bottom:8px"><span class="mn4-badge" style="font-size:9px">AI Detected · '+confPct+'% confidence</span></div>';
  }else if(!hasData){
    h+='<div style="text-align:center;margin-bottom:8px"><span class="mn4-badge" style="font-size:9px;border-color:rgba(255,255,255,0.15);color:rgba(244,244,244,0.4)">No photo uploaded — tap fields to set manually</span></div>';
  }
  h+='<div class="mn4-body-grid">';
  C.BODY_FIELDS.forEach(function(f){
    var val=bd[f.key]||'';
    var display=val?val.charAt(0).toUpperCase()+val.slice(1).replace(/_/g,' '):'Tap to set';
    h+='<div class="mn4-body-item"><div class="mn4-body-label">'+f.icon+' '+f.label+'</div>'
      +'<div class="mn4-body-value mn4-editable" onclick="MN4.editBodyField(\''+f.key+'\',this)">'
      +display+'</div></div>';
  });
  h+='</div>';
  // Show uploaded photo as reference if available
  var photoRef='';
  if(S.fullBody){
    photoRef='<div style="text-align:center;margin-bottom:12px">'
      +'<img src="'+S.fullBody+'" style="width:80px;height:80px;border-radius:50%;object-fit:cover;border:2px solid #39A596" alt="Your photo">'
      +'</div>';
  }
  return '<div class="mn4-step">'+progress()
    +'<div class="mn4-step-hdr"><div class="mn4-step-num">'+stepLabel()+'</div>'
    +'<h2 class="mn4-step-title">Your Body Profile</h2>'
    +'<p class="mn4-step-sub">'+(hasData?'Auto-detected from your photo — tap to edit':'Upload a full body photo for auto-detection')+'</p></div>'
    +photoRef+h
    +'<div class="mn4-step-footer"><button class="mn4-btn-ghost" onclick="MN4.goStep(1)">Back</button>'
    +'<button class="mn4-cta" onclick="MN4.next()">Continue →</button></div>'
    +dots()+'</div>';
}

/* ── STEP 3/2: Brands + Price ── */
function htmlBrandsFirst(){return htmlBrandsStep();}
function htmlBrandsReturn(){return htmlBrandsStep();}

function htmlBrandsStep(){
  var br=S.brands,pr=S.price;
  var brH='';
  C.BRANDS.forEach(function(b){
    brH+='<button class="mn4-brand-chip'+(br.indexOf(b.id)>=0?' mn4-active':'')+'"'
      +' onclick="MN4.toggleBrand(\''+b.id+'\')">'+b.label+'</button>';
  });
  var prH='';
  C.PRICES.forEach(function(p){
    prH+='<button class="mn4-price-card'+(pr===p.id?' mn4-selected':'')+'"'
      +' onclick="MN4.selectPrice(\''+p.id+'\')">'
      +'<span class="mn4-price-icon">'+p.icon+'</span>'
      +'<span class="mn4-price-label">'+p.label+'</span>'
      +'<span class="mn4-price-range">'+p.range+'</span></button>';
  });
  var backStep=S.isReturn?1:2;
  return '<div class="mn4-step">'+progress()
    +'<div class="mn4-step-hdr"><div class="mn4-step-num">'+stepLabel()+'</div>'
    +'<h2 class="mn4-step-title">Your Preferences</h2>'
    +'<p class="mn4-step-sub">Pick your favorite brands & budget</p></div>'
    +'<p class="mn4-section-label" style="text-align:center">Favorite brands</p>'
    +'<div class="mn4-brand-grid">'+brH+'</div>'
    +'<p class="mn4-section-label" style="text-align:center;margin-top:12px">Budget</p>'
    +'<div class="mn4-price-grid">'+prH+'</div>'
    +'<div class="mn4-step-footer"><button class="mn4-btn-ghost" onclick="MN4.goStep('+backStep+')">Back</button>'
    +'<button class="mn4-cta" onclick="MN4.submit()'+(S.loading?' disabled':'')+'>'
    +(S.loading?'<span class="mn4-loading-spinner" style="width:18px;height:18px;border-width:2px;margin:0"></span> Get My Outfits ✨':'Get My Outfits ✨')+'</button></div>'
    +dots()+'</div>';
}

/* ── RESULTS ── */
function htmlResults(){
  if(S.loading||!S.outfits.length){
    return '<div class="mn4-step"><div class="mn4-results-loading">'
      +'<div class="mn4-loading-spinner"></div>'
      +'<div class="mn4-loading-text">Finding your perfect outfits...</div>'
      +'<div class="mn4-loading-sub">Analyzing style, fit & price preferences</div>'
      +'</div></div>';
  }
  // If active outfit selected, show detail
  if(S.activeIdx!==null&&S.outfits[S.activeIdx]){
    return htmlOutfitDetail(S.outfits[S.activeIdx]);
  }
  // Outfit list
  var h='<div class="mn4-step">'+progress()
    +'<div class="mn4-step-hdr"><div class="mn4-step-num">Your Outfits</div>'
    +'<h2 class="mn4-step-title">We found your style ✨</h2>'
    +'<p class="mn4-step-sub">Tap any outfit for full VTON view + prices</p></div>';
  S.outfits.forEach(function(o,i){
    h+='<div class="mn4-outfit-card" onclick="MN4.viewOutfit('+i+')">'
      +'<div class="mn4-outfit-header"><h3 class="mn4-outfit-title">'+o.title+'</h3>'
      +'<span class="mn4-outfit-score">'+o.score+'% match</span></div>'
      +'<div class="mn4-vton-result" style="background:linear-gradient(135deg,'+(o.pieces[0]?o.pieces[0].color:'#222')+'22,#0a0a0a)">'
      +'<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:48px">👗</div>'
      +'<span class="mn4-vton-badge">AI VTON</span></div>'
      +'<div class="mn4-pieces-list">';
    o.pieces.forEach(function(p){
      h+='<div class="mn4-piece-row"><div class="mn4-piece-color" style="background:'+p.color+'"></div>'
        +'<div class="mn4-piece-info"><div class="mn4-piece-name">'+p.name+'</div>'
        +'<div class="mn4-piece-type">'+p.type+'</div></div></div>';
    });
    h+='</div>';
    if(o.prices&&o.prices.length){
      var best=o.prices.find(function(x){return x.best;});
      h+='<div class="mn4-price-section"><div class="mn4-price-row'+(best?' mn4-price-best':'')+'">'
        +'<span class="mn4-price-platform">'+o.prices[0].platform+'</span>'
        +'<span class="mn4-price-amount">₹'+(best||o.prices[0]).amount+'</span>'
        +(best?'<span class="mn4-price-best-tag">BEST</span>':'')
        +'<a class="mn4-price-shop-btn" href="'+((best||o.prices[0]).link||'#')+'" target="_blank" onclick="event.stopPropagation()">Shop</a></div></div>';
    }
    h+='</div>';
  });
  h+='<div class="mn4-step-footer" style="justify-content:center">'
    +'<button class="mn4-btn-ghost" onclick="MN4.retake()">← Start Over</button></div>'
    +dots()+'</div>';
  return h;
}

function htmlOutfitDetail(o){
  var h='<div class="mn4-step">'
    +'<div class="mn4-outfit-header" style="padding:0 0 12px">'
    +'<button class="mn4-btn-ghost" onclick="MN4.backToList()">← Back</button>'
    +'<span class="mn4-outfit-score">'+o.score+'% match</span></div>'
    +'<h2 class="mn4-step-title" style="text-align:left">'+o.title+'</h2>'
    +'<div class="mn4-vton-result" style="border-radius:16px;margin-top:8px;background:linear-gradient(135deg,'+(o.pieces[0]?o.pieces[0].color:'#222')+'22,#0a0a0a)">'
    +'<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:80px">👗</div>'
    +'<span class="mn4-vton-badge">AI VTON Result</span>'
    +'<div class="mn4-vton-actions">'
    +'<button class="mn4-vton-action-btn" title="Download">⬇</button>'
    +'<button class="mn4-vton-action-btn" title="Share">↗</button>'
    +'<button class="mn4-vton-action-btn" title="Save">♡</button></div></div>'
    +'<div class="mn4-pieces-list" style="margin-top:12px">';
  o.pieces.forEach(function(p){
    h+='<div class="mn4-piece-row"><div class="mn4-piece-color" style="background:'+p.color+'"></div>'
      +'<div class="mn4-piece-info"><div class="mn4-piece-name">'+p.name+'</div>'
      +'<div class="mn4-piece-type">'+p.type+'</div></div></div>';
  });
  h+='</div>';
  // Prices
  if(o.prices&&o.prices.length){
    h+='<div style="margin-top:12px"><p class="mn4-section-label">Price Comparison</p>';
    o.prices.forEach(function(p){
      h+='<div class="mn4-price-row'+(p.best?' mn4-price-best':'')+'">'
        +'<span class="mn4-price-platform">'+p.platform+'</span>'
        +'<span class="mn4-price-amount">₹'+p.amount+'</span>'
        +(p.best?'<span class="mn4-price-best-tag">BEST</span>':'')
        +'<a class="mn4-price-shop-btn" href="'+(p.link||'#')+'" target="_blank">Shop →</a></div>';
    });
    h+='</div>';
  }
  // Bank offer
  h+='<div class="mn4-bank-offer"><span>💳</span><span class="mn4-bank-offer-text">10% off with HDFC Credit Card — ends in 2h</span></div>';
  // Actions
  h+='<div class="mn4-outfit-actions" style="margin-top:12px">'
    +'<button class="mn4-outfit-cta" onclick="MN4.shopNow(\''+(o.prices&&o.prices[0]?o.prices[0].link:'#')+'\')">Shop All Pieces</button>'
    +'<button class="mn4-outfit-secondary" onclick="MN4.retake()">New Outfit</button></div>'
    +'</div>';
  return h;
}

})();
