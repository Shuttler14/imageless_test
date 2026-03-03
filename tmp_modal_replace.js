const fs = require('fs');
const path = 'C:/Users/Admin/OneDrive/Desktop/imageless_test/sections/account.liquid';
let content = fs.readFileSync(path, 'utf8');

// Find exact replacement range using markers in the file
const startMarker = content.indexOf('const FIELD_OPTIONS = {');
const endMarker   = content.indexOf('function closeEditModal()');
if (startMarker < 0 || endMarker < 0) { console.log('MARKERS NOT FOUND. start:', startMarker, 'end:', endMarker); process.exit(1); }

console.log('Replacing from index', startMarker, 'to', endMarker);

// Build the replacement block
const newBlock = const TILE_DATA = {
      height: { title:'Your Height', sub:'Select your height range', multi:false, type:'tiles', options:[
        {val:'150-155 cm',label:'150-155 cm',sub:"4'11\\u2013 5'1",svg:'ruler'},
        {val:'155-160 cm',label:'155-160 cm',sub:"5'1\\u2013 5'3",svg:'ruler'},
        {val:'160-165 cm',label:'160-165 cm',sub:"5'3\\u2013 5'5",svg:'ruler'},
        {val:'165-170 cm',label:'165-170 cm',sub:"5'5\\u2013 5'7",svg:'ruler'},
        {val:'170-175 cm',label:'170-175 cm',sub:"5'7\\u2013 5'9",svg:'ruler'},
        {val:'175-180 cm',label:'175-180 cm',sub:"5'9\\u2013 5'11",svg:'ruler'},
        {val:'180-185 cm',label:'180-185 cm',sub:"5'11\\u2013 6'1",svg:'ruler'},
        {val:'185+ cm',label:'185+ cm',sub:'6ft 1 and above',svg:'ruler'}]},
      build: { title:'Body Type', sub:'How would you describe your build?', multi:false, type:'tiles', options:[
        {val:'Slim',label:'Slim',sub:'Lean, narrow frame',svg:'slim'},
        {val:'Athletic',label:'Athletic',sub:'Toned, active build',svg:'athletic'},
        {val:'Average',label:'Average',sub:'Balanced proportions',svg:'slim'},
        {val:'Muscular',label:'Muscular',sub:'Broad, defined muscles',svg:'athletic'},
        {val:'Broad',label:'Broad',sub:'Wide shoulders',svg:'athletic'},
        {val:'Plus Size',label:'Plus Size',sub:'Fuller, curvy frame',svg:'slim'},
        {val:'Petite',label:'Petite',sub:'Small & compact',svg:'slim'},
        {val:'Tall & Lean',label:'Tall & Lean',sub:'Height with slim build',svg:'slim'}]},
      skinTone: { title:'Skin Tone', sub:'Select your skin tone (Monk Scale)', multi:false, type:'mst', options:[
        {val:'Very Light',label:'Very Light',mst:1,hex:'#f6ede4'},
        {val:'Light',label:'Light',mst:2,hex:'#f3e7db'},
        {val:'Light Medium',label:'Light Medium',mst:3,hex:'#f7ead0'},
        {val:'Medium Light',label:'Medium Light',mst:4,hex:'#eadaba'},
        {val:'Medium',label:'Medium',mst:5,hex:'#d7bd96'},
        {val:'Medium Dark',label:'Medium Dark',mst:6,hex:'#a07850'},
        {val:'Dark',label:'Dark',mst:7,hex:'#825c43'},
        {val:'Very Dark',label:'Very Dark',mst:8,hex:'#604134'},
        {val:'Deep',label:'Deep',mst:9,hex:'#3a312a'},
        {val:'Deepest',label:'Deepest',mst:10,hex:'#292420'}]},
      climate: { title:'Your Climate', sub:'What climate do you mostly dress for?', multi:false, type:'tiles', options:[
        {val:'Hot & Humid',label:'Hot & Humid',sub:'Tropical summer',svg:'sun'},
        {val:'Tropical',label:'Tropical',sub:'Warm all year',svg:'sun'},
        {val:'Dry Heat',label:'Dry Heat',sub:'Desert warmth',svg:'sun'},
        {val:'Mild',label:'Mild',sub:'Pleasant & moderate',svg:'neutral'},
        {val:'Cool',label:'Cool',sub:'Light jacket weather',svg:'cold'},
        {val:'Cold',label:'Cold',sub:'Winters & layers',svg:'cold'},
        {val:'Monsoon',label:'Monsoon',sub:'Rainy season',svg:'rain'},
        {val:'Mixed Seasons',label:'Mixed Seasons',sub:'All 4 seasons',svg:'neutral'}]},
      budget: { title:'Budget Range', sub:'Your typical outfit spend', multi:false, type:'tiles', options:[
        {val:'Under Rs.1,000',label:'Under Rs.1K',sub:'Budget picks',svg:'wallet'},
        {val:'Rs.1,000-Rs.3,000',label:'Rs.1K - 3K',sub:'Everyday essentials',svg:'wallet'},
        {val:'Rs.3,000-Rs.7,000',label:'Rs.3K - 7K',sub:'Quality mid-range',svg:'wallet'},
        {val:'Rs.7,000-Rs.15,000',label:'Rs.7K - 15K',sub:'Premium selections',svg:'wallet'},
        {val:'Rs.15,000-Rs.30,000',label:'Rs.15K - 30K',sub:'Luxury tier',svg:'wallet'},
        {val:'Rs.30,000+',label:'Rs.30K+',sub:'No budget limit',svg:'wallet'}]},
      goals: { title:'Fashion Goals', sub:'What are you trying to achieve?', multi:false, type:'tiles', options:[
        {val:'Look more confident',label:'Look Confident',sub:'Own every room',svg:'star'},
        {val:'Dress for my body',label:'Dress My Body',sub:'Flatter my shape',svg:'slim'},
        {val:'Build a capsule wardrobe',label:'Capsule Wardrobe',sub:'Less but better',svg:'shirt'},
        {val:'Stand out in a crowd',label:'Stand Out',sub:'Bold & memorable',svg:'star'},
        {val:'Look professional',label:'Look Professional',sub:'Sharp office style',svg:'shirt'},
        {val:'Be more sustainable',label:'Go Sustainable',sub:'Mindful fashion',svg:'target'},
        {val:'Express my personality',label:'Express Myself',sub:'Wear my story',svg:'palette'},
        {val:'Dress more traditionally',label:'Traditional Style',sub:'Ethnic & heritage',svg:'shirt'}]},
      favoriteColors: { title:'Favourite Colors', sub:'Pick all that apply', multi:true, type:'colors', options:[
        {val:'Black',label:'Black',hex:'#111111'},{val:'White',label:'White',hex:'#F0F0F0'},
        {val:'Navy',label:'Navy',hex:'#1E3A5F'},{val:'Beige',label:'Beige',hex:'#D4B896'},
        {val:'Olive',label:'Olive',hex:'#6B7C32'},{val:'Grey',label:'Grey',hex:'#9CA3AF'},
        {val:'Brown',label:'Brown',hex:'#92400E'},{val:'Maroon',label:'Maroon',hex:'#7F1D1D'},
        {val:'Teal',label:'Teal',hex:'#0D9488'},{val:'Mustard',label:'Mustard',hex:'#D97706'},
        {val:'Rust',label:'Rust',hex:'#C2410C'},{val:'Coral',label:'Coral',hex:'#F87171'},
        {val:'Blush Pink',label:'Blush Pink',hex:'#FBCFE8'},{val:'Lavender',label:'Lavender',hex:'#C4B5FD'},
        {val:'Royal Blue',label:'Royal Blue',hex:'#1D4ED8'},{val:'Emerald',label:'Emerald Green',hex:'#059669'}]},
      coreExpression: { title:'Style Expression', sub:'How do you like to dress?', multi:false, type:'tiles', options:[
        {val:'Minimalist & Clean',label:'Minimalist',sub:'Neutral, clean lines',svg:'shirt'},
        {val:'Bold & Expressive',label:'Bold',sub:'Colour & statement',svg:'palette'},
        {val:'Traditional & Ethnic',label:'Ethnic',sub:'Kurtas, sarees, fusion',svg:'shirt'},
        {val:'Smart Casual',label:'Smart Casual',sub:'Elevated basics',svg:'shirt'},
        {val:'Streetwear',label:'Streetwear',sub:'Hoodies & sneakers',svg:'athletic'},
        {val:'Business Formal',label:'Formal',sub:'Suits & sharp cuts',svg:'shirt'},
        {val:'Boho & Free',label:'Boho',sub:'Flowy, earthy vibes',svg:'palette'},
        {val:'Dark & Edgy',label:'Dark & Edgy',sub:'All-black attitude',svg:'star'}]},
      occasion: { title:'Go-to Occasion', sub:'Where do you dress up most?', multi:false, type:'tiles', options:[
        {val:'Daily Casual',label:'Daily Casual',sub:'Everyday comfort',svg:'shirt'},
        {val:'College / Campus',label:'College',sub:'Campus-ready',svg:'target'},
        {val:'Office / Workwear',label:'Office',sub:'Professional',svg:'shirt'},
        {val:'Festive & Weddings',label:'Festive',sub:'Celebrations',svg:'star'},
        {val:'Date Night',label:'Date Night',sub:'Evening looks',svg:'star'},
        {val:'Party / Nightout',label:'Party',sub:'Nightlife',svg:'palette'},
        {val:'Outdoor / Travel',label:'Travel',sub:'Adventure wear',svg:'map'},
        {val:'Sports / Gym',label:'Gym',sub:'Activewear',svg:'athletic'}]},
      region: { title:'Region / City', sub:'Type your city or region', multi:false, type:'input', options:[] },
      undertone: { title:'Skin Undertone', sub:'Your undertone affects which colors suit you', multi:false, type:'tiles', options:[
        {val:'Warm (yellow/golden)',label:'Warm',sub:'Yellow / golden hues',svg:'warm'},
        {val:'Cool (pink/bluish)',label:'Cool',sub:'Pink / blue hues',svg:'cool'},
        {val:'Neutral (balanced)',label:'Neutral',sub:'Mix of warm & cool',svg:'neutral'},
        {val:'Olive (green-ish)',label:'Olive',sub:'Green-ish undertones',svg:'warm'},
        {val:'Not sure',label:'Not Sure',sub:'Let AI decide',svg:'target'}]}
    };

    // SVG vector definitions per icon key
    const MN_SVGS = {
      ruler: \<svg class="mn-edit-tile-svg" viewBox="0 0 48 48" fill="none"><rect x="6" y="18" width="36" height="12" rx="3" stroke="#39A596" stroke-width="2" fill="rgba(57,165,150,0.08)"/><line x1="14" y1="18" x2="14" y2="24" stroke="#39A596" stroke-width="1.5"/><line x1="20" y1="18" x2="20" y2="22" stroke="#39A596" stroke-width="1.5"/><line x1="26" y1="18" x2="26" y2="24" stroke="#39A596" stroke-width="1.5"/><line x1="32" y1="18" x2="32" y2="22" stroke="#39A596" stroke-width="1.5"/></svg>\,
      slim: \<svg class="mn-edit-tile-svg" viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="10" rx="5" ry="5" stroke="#39A596" stroke-width="2"/><path d="M19 16h10l3 20H16L19 16z" stroke="#39A596" stroke-width="2" fill="rgba(57,165,150,0.08)"/><path d="M16 36l-3 8M32 36l3 8" stroke="#39A596" stroke-width="2" stroke-linecap="round"/></svg>\,
      athletic: \<svg class="mn-edit-tile-svg" viewBox="0 0 48 48" fill="none"><ellipse cx="24" cy="9" rx="5" ry="5" stroke="#39A596" stroke-width="2"/><path d="M15 16h18l4 20H11L15 16z" stroke="#39A596" stroke-width="2" fill="rgba(57,165,150,0.08)"/><path d="M11 36l-3 8M37 36l3 8" stroke="#39A596" stroke-width="2" stroke-linecap="round"/><line x1="15" y1="24" x2="33" y2="24" stroke="#39A596" stroke-width="1.5" stroke-dasharray="2 2"/></svg>\,
      sun: \<svg class="mn-edit-tile-svg" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="8" stroke="#F59E0B" stroke-width="2" fill="rgba(245,158,11,0.1)"/><line x1="24" y1="6" x2="24" y2="12" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/><line x1="24" y1="36" x2="24" y2="42" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/><line x1="6" y1="24" x2="12" y2="24" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/><line x1="36" y1="24" x2="42" y2="24" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/><line x1="11" y1="11" x2="15" y2="15" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/><line x1="33" y1="33" x2="37" y2="37" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/><line x1="11" y1="37" x2="15" y2="33" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/><line x1="33" y1="15" x2="37" y2="11" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/></svg>\,
      cold: \<svg class="mn-edit-tile-svg" viewBox="0 0 48 48" fill="none"><path d="M24 6v36M6 24h36M11 11l26 26M37 11L11 37" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/><circle cx="24" cy="24" r="4" fill="#60A5FA"/></svg>\,
      rain: \<svg class="mn-edit-tile-svg" viewBox="0 0 48 48" fill="none"><path d="M10 26a12 12 0 1 1 22-4H34a7 7 0 0 1 0 14H12a8 8 0 0 1-2-10z" stroke="#39A596" stroke-width="2" fill="rgba(57,165,150,0.06)"/><line x1="16" y1="38" x2="14" y2="44" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/><line x1="24" y1="38" x2="22" y2="44" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/><line x1="32" y1="38" x2="30" y2="44" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/></svg>\,
      neutral: \<svg class="mn-edit-tile-svg" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="14" stroke="#9CA3AF" stroke-width="2" fill="rgba(156,163,175,0.08)"/><line x1="17" y1="30" x2="31" y2="30" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"/><circle cx="18" cy="21" r="2" fill="#9CA3AF"/><circle cx="30" cy="21" r="2" fill="#9CA3AF"/></svg>\,
      wallet: \<svg class="mn-edit-tile-svg" viewBox="0 0 48 48" fill="none"><rect x="6" y="14" width="36" height="24" rx="4" stroke="#39A596" stroke-width="2" fill="rgba(57,165,150,0.08)"/><path d="M6 22h36" stroke="#39A596" stroke-width="2"/><rect x="30" y="26" width="10" height="6" rx="2" stroke="#39A596" stroke-width="1.5" fill="rgba(57,165,150,0.15)"/><circle cx="35" cy="29" r="1.5" fill="#39A596"/></svg>\,
      target: \<svg class="mn-edit-tile-svg" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="16" stroke="#39A596" stroke-width="2"/><circle cx="24" cy="24" r="9" stroke="#39A596" stroke-width="2"/><circle cx="24" cy="24" r="3" fill="#39A596"/></svg>\,
      palette: \<svg class="mn-edit-tile-svg" viewBox="0 0 48 48" fill="none"><path d="M24 8a16 16 0 1 0 11 27" stroke="#EC4899" stroke-width="2"/><circle cx="16" cy="26" r="2.5" fill="#EF4444"/><circle cx="20" cy="18" r="2.5" fill="#F59E0B"/><circle cx="28" cy="16" r="2.5" fill="#10B981"/><circle cx="32" cy="24" r="2.5" fill="#3B82F6"/><circle cx="35" cy="34" r="5" stroke="#EC4899" stroke-width="2" fill="rgba(236,72,153,0.1)"/></svg>\,
      star: \<svg class="mn-edit-tile-svg" viewBox="0 0 48 48" fill="none"><path d="M24 6l4.5 9 10 1.5-7.25 7 1.75 10L24 29.3l-8.75 4.2 1.75-10L9.5 16.5l10-1.5z" stroke="#39A596" stroke-width="2" stroke-linejoin="round" fill="rgba(57,165,150,0.1)"/></svg>\,
      shirt: \<svg class="mn-edit-tile-svg" viewBox="0 0 48 48" fill="none"><path d="M16 8L6 16l6 2v22h24V18l6-2L32 8c0 0-2 6-8 6S16 8 16 8z" stroke="#39A596" stroke-width="2" stroke-linejoin="round" fill="rgba(57,165,150,0.08)"/></svg>\,
      map: \<svg class="mn-edit-tile-svg" viewBox="0 0 48 48" fill="none"><path d="M24 6C17 6 12 12 12 18c0 9 12 24 12 24S36 27 36 18c0-6-5-12-12-12z" stroke="#39A596" stroke-width="2" fill="rgba(57,165,150,0.08)"/><circle cx="24" cy="18" r="4" stroke="#39A596" stroke-width="2" fill="rgba(57,165,150,0.2)"/></svg>\,
      warm: \<svg class="mn-edit-tile-svg" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="14" stroke="#F59E0B" stroke-width="2" fill="rgba(245,158,11,0.08)"/><circle cx="19" cy="21" r="2" fill="#F59E0B"/><circle cx="29" cy="21" r="2" fill="#F59E0B"/><path d="M18 30c2 3 10 3 12 0" stroke="#F59E0B" stroke-width="2" stroke-linecap="round"/></svg>\,
      cool: \<svg class="mn-edit-tile-svg" viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="14" stroke="#60A5FA" stroke-width="2" fill="rgba(96,165,250,0.08)"/><circle cx="19" cy="21" r="2" fill="#60A5FA"/><circle cx="29" cy="21" r="2" fill="#60A5FA"/><path d="M18 32c2-3 10-3 12 0" stroke="#60A5FA" stroke-width="2" stroke-linecap="round"/></svg>\
    };

    let _currentField = null, _currentProfileKey = null, _isMulti = false, _selectedValues = [];

    function openEditModal(profileKey, displayElId) {
      const cfg = TILE_DATA[profileKey];
      if (!cfg) return;
      _currentField = displayElId; _currentProfileKey = profileKey;
      _isMulti = cfg.multi; _selectedValues = [];
      const p = getProfile();
      const current = _isMulti
        ? (Array.isArray(p[profileKey]) ? p[profileKey] : (p[profileKey] ? [p[profileKey]] : []))
        : (p[profileKey] || '');

      document.getElementById('mnEditModalTitle').textContent = cfg.title;
      document.getElementById('mnEditModalSub').textContent   = cfg.sub;
      document.getElementById('mnEditCustomInput').value = _isMulti ? '' : (current || '');
      document.getElementById('mnEditCustomInput').style.display = cfg.type === 'input' ? '' : (cfg.options.length > 0 ? '' : '');

      const grid = document.getElementById('mnEditChipGrid');
      grid.innerHTML = '';
      _selectedValues = _isMulti ? [...current] : [];

      if (cfg.type === 'mst') {
        // Skin tone: render swatch circles in a row
        grid.style.gridTemplateColumns = '1fr';
        const row = document.createElement('div');
        row.className = 'mn-edit-mst-row';
        cfg.options.forEach(opt => {
          const sw = document.createElement('div');
          sw.className = 'mn-edit-mst-swatch' + (current === opt.val ? ' selected' : '');
          sw.style.background = opt.hex;
          sw.title = 'MST ' + opt.mst + ' — ' + opt.label;
          sw.innerHTML = '<span style="position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);font-size:8px;color:rgba(255,255,255,0.5);white-space:nowrap">' + opt.mst + '</span>';
          sw.style.position = 'relative';
          sw.addEventListener('click', () => {
            row.querySelectorAll('.mn-edit-mst-swatch').forEach(s => s.classList.remove('selected'));
            sw.classList.add('selected');
            document.getElementById('mnEditCustomInput').value = opt.val;
          });
          row.appendChild(sw);
        });
        grid.appendChild(row);
        grid.style.gridTemplateColumns = '';

      } else if (cfg.type === 'colors') {
        // Colors: 2-column swatch+name tiles
        grid.style.gridTemplateColumns = '1fr 1fr';
        cfg.options.forEach(opt => {
          const tile = document.createElement('div');
          tile.className = 'mn-edit-color-tile' + ((_isMulti ? current.includes(opt.val) : current === opt.val) ? ' selected' : '');
          tile.innerHTML = '<div class="mn-edit-color-swatch" style="background:' + opt.hex + '"></div><span class="mn-edit-color-name">' + opt.label + '</span>';
          if (_isMulti && current.includes(opt.val)) _selectedValues.push(opt.val);
          tile.addEventListener('click', () => {
            if (_isMulti) {
              tile.classList.toggle('selected');
              if (tile.classList.contains('selected')) { if (!_selectedValues.includes(opt.val)) _selectedValues.push(opt.val); }
              else { _selectedValues = _selectedValues.filter(v => v !== opt.val); }
            } else {
              grid.querySelectorAll('.mn-edit-color-tile').forEach(t => t.classList.remove('selected'));
              tile.classList.add('selected');
              document.getElementById('mnEditCustomInput').value = opt.val;
            }
          });
          grid.appendChild(tile);
        });

      } else if (cfg.type === 'input') {
        grid.innerHTML = '';

      } else {
        // Default: SVG vector tiles 2-column
        grid.style.gridTemplateColumns = '1fr 1fr';
        cfg.options.forEach(opt => {
          const tile = document.createElement('div');
          const isSelected = _isMulti ? current.includes(opt.val) : (current === opt.val);
          tile.className = 'mn-edit-option-tile' + (isSelected ? ' selected' : '');
          const svgHtml = MN_SVGS[opt.svg] || '';
          tile.innerHTML = svgHtml +
            '<div class="mn-edit-tile-label">' + opt.label + '</div>' +
            (opt.sub ? '<div class="mn-edit-tile-sub">' + opt.sub + '</div>' : '');
          if (_isMulti && isSelected) _selectedValues.push(opt.val);
          tile.addEventListener('click', () => {
            if (_isMulti) {
              tile.classList.toggle('selected');
              if (tile.classList.contains('selected')) { if (!_selectedValues.includes(opt.val)) _selectedValues.push(opt.val); }
              else { _selectedValues = _selectedValues.filter(v => v !== opt.val); }
            } else {
              grid.querySelectorAll('.mn-edit-option-tile').forEach(t => t.classList.remove('selected'));
              tile.classList.add('selected');
              document.getElementById('mnEditCustomInput').value = opt.val;
            }
          });
          grid.appendChild(tile);
        });
      }
      document.getElementById('mnEditModalOverlay').classList.add('active');
    }

;

// Now do the replacement
const before = content.substring(0, startMarker);
const after  = content.substring(endMarker);
const fixed  = before + newBlock + after;
fs.writeFileSync(path, fixed, 'utf8');
console.log('Done. File size:', fixed.length, 'chars');
console.log('Verifying TILE_DATA:', fixed.includes('TILE_DATA') ? 'FOUND' : 'MISSING');
console.log('Verifying MN_SVGS:', fixed.includes('MN_SVGS') ? 'FOUND' : 'MISSING');
console.log('Verifying openEditModal:', fixed.includes('function openEditModal') ? 'FOUND' : 'MISSING');
console.log('Verifying svg tiles:', fixed.includes('mn-edit-option-tile') ? 'FOUND' : 'MISSING');
