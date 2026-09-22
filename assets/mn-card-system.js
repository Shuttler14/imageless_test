/* ============================================
   MY NARRATIVE — Smart Card System
   Bank → Credit/Debit → Card Variant → Offer Matching
   Change ID: ADD-USR-004-260922
   ============================================ */

(function(){
'use strict';

var SUPABASE_URL='https://fmganuxtqbquubtvvqdo.supabase.co';
var SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtZ2FudXh0cWJxdXVidHZ2cWRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTQ0Njk5OSwiZXhwIjoyMDg3MDIyOTk5fQ.CEdZM4fbkonyxsCmjccgHhwxpLcNvQT_GdiXOB5D6cU';

var W=window.MN4=window.MN4||{};

/* ── State ── */
var cardState={
  step:'bank',       // bank | type | variant | confirm
  banks:[],          // from mn_bank_cards
  filteredBanks:[],
  search:'',
  selectedBank:null,
  selectedType:null, // credit | debit
  variants:[],       // filtered variants
  selectedVariant:null,
  savedCards:[],     // user's saved cards
  busy:false,
  error:null
};

/* ── Fetch banks from Supabase ── */
function fetchBanks(){
  return fetch(SUPABASE_URL+'/rest/v1/mn_bank_cards?select=bank_name&order=bank_name.asc', {
    headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY}
  })
  .then(function(r){return r.json();})
  .then(function(data){
    var seen={};
    var banks=[];
    (data||[]).forEach(function(row){
      if(!seen[row.bank_name]){seen[row.bank_name]=1;banks.push(row.bank_name);}
    });
    cardState.banks=banks;
    cardState.filteredBanks=banks;
    return banks;
  });
}

/* ── Fetch card variants for bank+type ── */
function fetchVariants(bank,type){
  return fetch(SUPABASE_URL+'/rest/v1/mn_bank_cards?select=*&bank_name=eq.'+encodeURIComponent(bank)+'&card_type=eq.'+type+'&order=is_popular.desc,card_variant.asc', {
    headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY}
  })
  .then(function(r){return r.json();})
  .then(function(data){cardState.variants=data||[];return data||[];});
}

/* ── Search banks ── */
function searchBanks(q){
  cardState.search=q;
  if(!q){cardState.filteredBanks=cardState.banks;return;}
  var lq=q.toLowerCase();
  cardState.filteredBanks=cardState.banks.filter(function(b){return b.toLowerCase().indexOf(lq)>=0;});
}

/* ── HTML: Bank selector ── */
function htmlBankStep(){
  var h='<div class="mn4-step mn-card-step">'
    +'<div class="mn4-hdr"><h2 class="mn4-hdr-title">Add your bank card</h2>'
    +'<p class="mn4-hdr-sub">We\'ll match the best offers for you</p></div>'
    +'<div class="mn-card-search-wrap"><input class="mn4-input mn-card-search" type="text" placeholder="Search your bank..." id="mn-card-search" value="'+esc(cardState.search)+'"></div>'
    +'<div class="mn-card-list" id="mn-card-bank-list">';
  
  cardState.filteredBanks.forEach(function(bank){
    var flag=getBankFlag(bank);
    h+='<button class="mn-card-item" data-action="card-bank" data-value="'+esc(bank)+'">'
      +'<span class="mn-card-flag">'+flag+'</span>'
      +'<span class="mn-card-name">'+esc(bank)+'</span>'
      +'<span class="mn-card-arrow">→</span></button>';
  });
  
  if(!cardState.filteredBanks.length){
    h+='<p class="mn-card-empty">No banks found. Try a different search.</p>';
  }
  
  h+='</div><div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="card-back">Back</button></div></div>';
  return h;
}

/* ── HTML: Card type selector ── */
function htmlTypeStep(){
  var bank=cardState.selectedBank;
  return'<div class="mn4-step mn-card-step">'
    +'<div class="mn4-hdr"><h2 class="mn4-hdr-title">'+esc(bank)+'</h2>'
    +'<p class="mn4-hdr-sub">Select card type</p></div>'
    +'<div class="mn-card-types">'
    +'<button class="mn-card-type-btn" data-action="card-type" data-value="credit">'
    +'<span class="mn-card-type-icon">💳</span><span class="mn-card-type-label">Credit Card</span></button>'
    +'<button class="mn-card-type-btn" data-action="card-type" data-value="debit">'
    +'<span class="mn-card-type-icon">🏦</span><span class="mn-card-type-label">Debit Card</span></button>'
    +'</div>'
    +'<div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="card-back">Back</button></div></div>';
}

/* ── HTML: Card variant selector ── */
function htmlVariantStep(){
  var variants=cardState.variants;
  var h='<div class="mn4-step mn-card-step">'
    +'<div class="mn4-hdr"><h2 class="mn4-hdr-title">'+esc(cardState.selectedBank)+'</h2>'
    +'<p class="mn4-hdr-sub">'+(cardState.selectedType==='credit'?'Credit':'Debit')+' cards</p></div>'
    +'<div class="mn-card-list">';
  
  variants.forEach(function(v){
    var popular=v.is_popular?'<span class="mn-card-popular">Popular</span>':'';
    var fee=v.annual_fee?'<span class="mn-card-fee">'+esc(v.annual_fee)+'</span>':'';
    var reward=v.reward_type?'<span class="mn-card-reward">'+esc(v.reward_type)+'</span>':'';
    h+='<button class="mn-card-item mn-card-item--variant" data-action="card-variant" data-value="'+esc(v.id)+'">'
      +'<div class="mn-card-variant-info">'
      +'<span class="mn-card-variant-name">'+esc(v.card_variant)+'</span>'
      +'<span class="mn-card-variant-meta">'+esc(v.card_network||'')+' '+fee+' '+reward+' '+popular+'</span>'
      +'</div><span class="mn-card-arrow">→</span></button>';
  });
  
  if(!variants.length){
    h+='<p class="mn-card-empty">No cards found for this type.</p>';
  }
  
  h+='</div><div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="card-back">Back</button></div></div>';
  return h;
}

/* ── HTML: Confirm + save ── */
function htmlConfirmStep(){
  var v=cardState.variants.find(function(x){return x.id===cardState.selectedVariant;});
  if(!v)return htmlVariantStep();
  return'<div class="mn4-step mn-card-step">'
    +'<div class="mn4-hdr"><h2 class="mn4-hdr-title">Confirm your card</h2>'
    +'<p class="mn4-hdr-sub">We\'ll match the best offers automatically</p></div>'
    +'<div class="mn-card-confirm">'
    +'<div class="mn-card-confirm-icon">💳</div>'
    +'<div class="mn-card-confirm-name">'+esc(v.bank_name)+'</div>'
    +'<div class="mn-card-confirm-variant">'+esc(v.card_variant)+'</div>'
    +'<div class="mn-card-confirm-meta">'+esc(v.card_network||'')+' · '+(v.card_type==='credit'?'Credit':'Debit')+' · '+esc(v.annual_fee||'Free')+'</div>'
    +'</div>'
    +'<div class="mn-card-privacy">'
    +'<span class="mn-card-privacy-icon">🔒</span>'
    +'<span>We never store your card number. Only bank name, card type and variant for offer matching.</span>'
    +'</div>'
    +'<button class="mn4-btn mn4-btn--primary mn-card-save-btn" data-action="card-save">Save this card</button>'
    +'<div class="mn4-footer"><button class="mn4-btn mn4-btn--ghost" data-action="card-back">Back</button></div></div>';
}

/* ── HTML: Saved cards list ── */
function htmlSavedCards(){
  if(!cardState.savedCards.length)return'';
  var h='<div class="mn-card-saved-section"><p class="mn4-section-label">My saved cards</p>';
  cardState.savedCards.forEach(function(c){
    h+='<div class="mn-card-saved-item">'
      +'<span class="mn-card-saved-icon">💳</span>'
      +'<div class="mn-card-saved-info">'
      +'<span class="mn-card-saved-name">'+esc(c.bank_name)+' '+esc(c.card_variant)+'</span>'
      +'<span class="mn-card-saved-meta">'+esc(c.card_network||'')+' · '+(c.card_type==='credit'?'Credit':'Debit')
      +(c.active_offers?' · <span style="color:var(--mn4-teal)">'+c.active_offers+' offers</span>':'')+'</span>'
      +'</div>'
      +'<button class="mn-card-saved-remove" data-action="card-remove" data-value="'+esc(c.card_id)+'">✕</button>'
      +'</div>';
  });
  h+='</div>';
  return h;
}

/* ── Card system render ── */
function renderCardSystem(){
  var container=document.getElementById('mn-card-system');
  if(!container)return;
  var h='';
  if(cardState.step==='bank')h=htmlBankStep()+htmlSavedCards();
  else if(cardState.step==='type')h=htmlTypeStep();
  else if(cardState.step==='variant')h=htmlVariantStep();
  else if(cardState.step==='confirm')h=htmlConfirmStep();
  container.innerHTML=h;
}

/* ── Card click handler ── */
function handleCardClick(e){
  var b=e.target.closest('[data-action]');
  if(!b)return;
  var a=b.getAttribute('data-action'),v=b.getAttribute('data-value');
  
  switch(a){
  case'card-bank':
    cardState.selectedBank=v;
    cardState.step='type';
    renderCardSystem();
    break;
  case'card-type':
    cardState.selectedType=v;
    cardState.step='variant';
    fetchVariants(v,v===undefined?cardState.selectedType:v).then(function(){renderCardSystem();});
    break;
  case'card-variant':
    cardState.selectedVariant=v;
    cardState.step='confirm';
    renderCardSystem();
    break;
  case'card-save':
    saveCard();
    break;
  case'card-remove':
    removeCard(v);
    break;
  case'card-back':
    if(cardState.step==='type'){cardState.step='bank';cardState.selectedBank=null;}
    else if(cardState.step==='variant'){cardState.step='type';cardState.selectedType=null;cardState.variants=[];}
    else if(cardState.step==='confirm'){cardState.step='variant';cardState.selectedVariant=null;}
    renderCardSystem();
    break;
  }
}

/* ── Save card to Supabase ── */
function saveCard(){
  var userId=getUserId();
  if(!userId){window.location.href='/pages/login?redirect='+encodeURIComponent(window.location.href);return;}
  var v=cardState.variants.find(function(x){return x.id===cardState.selectedVariant;});
  if(!v)return;
  
  cardState.busy=true;renderCardSystem();
  
  fetch(SUPABASE_URL+'/rest/v1/mn_saved_cards',{
    method:'POST',
    headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Content-Type':'application/json','Prefer':'return=representation'},
    body:JSON.stringify({
      card_id:'card_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),
      user_id:userId,
      bank_name:v.bank_name,
      card_type:v.card_type,
      card_variant:v.card_variant,
      card_network:v.card_network,
      is_primary:cardState.savedCards.length===0
    })
  })
  .then(function(r){return r.json();})
  .then(function(d){
    cardState.busy=false;
    if(d.code){cardState.error='Failed to save card';renderCardSystem();return;}
    cardState.savedCards.push(d[0]||d);
    cardState.step='bank';cardState.selectedBank=null;cardState.selectedType=null;cardState.selectedVariant=null;cardState.variants=[];
    renderCardSystem();
  })
  .catch(function(){cardState.busy=false;cardState.error='Network error';renderCardSystem();});
}

/* ── Remove card ── */
function removeCard(cardId){
  var userId=getUserId();
  if(!userId)return;
  
  fetch(SUPABASE_URL+'/rest/v1/mn_saved_cards?card_id=eq.'+cardId+'&user_id=eq.'+userId,{
    method:'DELETE',
    headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY}
  })
  .then(function(){
    cardState.savedCards=cardState.savedCards.filter(function(c){return c.card_id!==cardId;});
    renderCardSystem();
  });
}

/* ── Load user's saved cards ── */
function loadSavedCards(){
  var userId=getUserId();
  if(!userId)return Promise.resolve([]);
  
  return fetch(SUPABASE_URL+'/rest/v1/rpc/get_user_cards_with_offers?p_user_id='+userId,{
    method:'POST',
    headers:{'apikey':SUPABASE_KEY,'Authorization':'Bearer '+SUPABASE_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({p_user_id:userId})
  })
  .then(function(r){return r.json();})
  .then(function(data){cardState.savedCards=data||[];return data||[];})
  .catch(function(){return [];});
}

/* ── Get user ID ── */
function getUserId(){
  try{
    var u=JSON.parse(localStorage.getItem('mn_user')||'null');
    return u&&(u.user_id||u.email)||null;
  }catch(e){return null;}
}

/* ── Helpers ── */
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function getBankFlag(bank){
  var flags={
    'HDFC Bank':'🟦','ICICI Bank':'🟧','SBI Card':'🔵','Axis Bank':'🟥',
    'Kotak Mahindra Bank':'🟥','IDFC FIRST Bank':'🟦','IndusInd Bank':'🟧',
    'RBL Bank':'🟧','American Express':'🟦','Yes Bank':'🟩',
    'Bank of Baroda':'🟧','Punjab National Bank':'🟧','Canara Bank':'🟦','Union Bank of India':'🟧'
  };
  return flags[bank]||'🏦';
}

/* ── Init ── */
W.initCardSystem=function(target){
  var container=target||document.getElementById('mn-card-system');
  if(!container)return;
  container.innerHTML='<div class="mn-card-step" style="text-align:center;padding:40px;color:rgba(255,255,255,0.4)">Loading...</div>';
  
  Promise.all([fetchBanks(),loadSavedCards()]).then(function(){renderCardSystem();});
  
  container.addEventListener('click',handleCardClick);
  
  var searchInput=document.getElementById('mn-card-search');
  if(searchInput){
    searchInput.addEventListener('input',function(){searchBanks(this.value);renderCardSystem();var el=document.getElementById('mn-card-search');if(el)el.focus();});
  }
};

})();
