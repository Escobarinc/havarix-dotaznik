(() => {
  'use strict';
  const STORAGE_KEY = 'havarix-rental-questionnaire-v4';
  const groups = window.HAVARIX_GROUPS, questions = window.HAVARIX_QUESTIONS;
  const DB = window.HAVARIX_DB || '';
  const EXCLUSIVE = ['Ne','Vůbec ne','Žádná','Nijak','Vůbec neřešit na webu','Zatím nevím'];

  const $ = (s) => document.querySelector(s);
  const els = {
    stepNav: $('#stepNav'), sidePercent: $('#sidePercent'), sideProgress: $('#sideProgress'),
    counter: $('#questionCounter'), qProgress: $('#questionProgress'), content: $('#questionContent'), why: $('#whyText'), note: $('#customNote'),
    prev: $('#prevBtn'), next: $('#nextBtn'), skip: $('#skipBtn'), saveState: $('#saveState'), saveDot: $('#saveDot'),
    finish: $('#finishPanel'), summary: $('#summaryText'), clientName: $('#clientName'), clientEmail: $('#clientEmail'), clientPhone: $('#clientPhone')
  };

  let current = 0;
  let state = questions.map(() => ({selected:[], fields:{}, text:'', note:'', skipped:false}));
  let client = {name:'', email:'', phone:''};

  function load(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return;
      const data = JSON.parse(raw);
      if(Array.isArray(data.state) && data.state.length === questions.length) state = data.state;
      if(Number.isInteger(data.current)) current = Math.max(0, Math.min(questions.length-1, data.current));
      if(data.client) client = {...client, ...data.client};
    }catch(e){ console.warn('Saved questionnaire could not be loaded.', e); }
  }

  let saveTimer;
  function save(){
    els.saveState.textContent = 'Ukládám…';
    els.saveDot.style.background = '#ffbf3c';
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try{
        localStorage.setItem(STORAGE_KEY, JSON.stringify({state,current,client,updatedAt:new Date().toISOString()}));
        els.saveState.textContent = 'Uloženo v tomto zařízení';
        els.saveDot.style.background = '#11c882';
        queueSync();
      }catch(e){
        els.saveState.textContent = 'Uložení se nezdařilo';
        els.saveDot.style.background = '#ff2d2d';
      }
    }, 180);
  }

  // Průběžné odesílání odpovědí do online úložiště (viz config.js). Kontakt klienta se neodesílá.
  const SENT_KEY = STORAGE_KEY + '-sent';
  let sent = {};
  try{ sent = JSON.parse(localStorage.getItem(SENT_KEY)) || {}; }catch(e){}
  let syncTimer, syncing = false;
  function queueSync(delay){ if(!DB) return; clearTimeout(syncTimer); syncTimer = setTimeout(sync, delay || 1200); }
  async function sync(){
    if(syncing){ queueSync(); return; }
    syncing = true;
    let ok = true;
    try{
      for(let i=0;i<questions.length;i++){
        const a = answerText(i).slice(0,6000);
        if(sent[i] === a || (sent[i] === undefined && a === 'NEZODPOVĚZENO')) continue;
        const r = await fetch(`${DB}/${i+1}`, {method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({fields:{answer:{stringValue:a}, changedAt:{stringValue:new Date().toISOString()}}})});
        if(!r.ok){ ok = false; break; }
        sent[i] = a;
      }
      localStorage.setItem(SENT_KEY, JSON.stringify(sent));
    }catch(e){ ok = false; }
    syncing = false;
    els.saveState.textContent = ok ? 'Uloženo a odesláno' : 'Uloženo v tomto zařízení — odešle se po připojení';
    els.saveDot.style.background = ok ? '#11c882' : '#ffbf3c';
    if(!ok) queueSync(15000);
  }

  function groupFor(index){ return groups.findIndex(g => index >= g.start && index <= g.end); }
  function answered(i){
    const q = questions[i], s = state[i];
    if(s.skipped) return false;
    if(q.type === 'single' || q.type === 'multi') return s.selected.length > 0 || !!s.note.trim();
    if(q.type === 'fields' || q.type === 'size') return Object.values(s.fields||{}).some(Boolean) || !!s.note.trim();
    if(q.type === 'text') return !!(s.text||'').trim() || !!s.note.trim();
    return false;
  }
  function answeredCount(){ return state.filter((_,i)=>answered(i)).length; }

  function renderSteps(){
    const active = groupFor(current);
    els.stepNav.innerHTML = '';
    groups.forEach((g, idx) => {
      const done = Array.from({length:g.end-g.start+1},(_,k)=>g.start+k).every(i => answered(i));
      const btn = document.createElement('button');
      btn.type='button';
      btn.className='step-btn' + (idx===active?' active':'') + (done?' done':'');
      btn.innerHTML = `<span class="step-num">${idx+1}</span><span>${g.label}</span>`;
      btn.addEventListener('click', ()=>{ current=g.start; save(); render(); scrollQuestion(); });
      els.stepNav.appendChild(btn);
    });
  }

  function updateProgress(){
    const total = questions.length;
    const completed = answeredCount();
    const pct = Math.round((completed/total)*100);
    els.sidePercent.textContent = `${pct} %`;
    els.sideProgress.style.width = `${pct}%`;
    els.counter.textContent = `Otázka ${current+1} z ${total}`;
    els.qProgress.style.width = `${((current+1)/total)*100}%`;
  }

  function setSelected(btn, isSelected){ btn.classList.toggle('selected', isSelected); }

  function renderSingle(q,s){
    const grid=document.createElement('div'); grid.className='answer-grid';
    q.options.forEach(opt=>{
      const b=document.createElement('button'); b.type='button'; b.className='answer-card';
      b.innerHTML=`<span class="radio-dot"></span><span><strong>${opt}</strong><small>Vyberte tuto možnost</small></span>`;
      setSelected(b,s.selected[0]===opt);
      b.addEventListener('click',()=>{s.selected=[opt];s.skipped=false;save();render();});
      grid.appendChild(b);
    });
    return grid;
  }

  function renderMulti(q,s){
    const grid=document.createElement('div'); grid.className='answer-grid';
    q.options.forEach(opt=>{
      const b=document.createElement('button'); b.type='button'; b.className='answer-card';
      b.innerHTML=`<span class="check-box"></span><span><strong>${opt}</strong><small>Můžete vybrat více možností</small></span>`;
      setSelected(b,s.selected.includes(opt));
      b.addEventListener('click',()=>{
        if(s.selected.includes(opt)) s.selected=s.selected.filter(v=>v!==opt);
        else if(EXCLUSIVE.includes(opt)) s.selected=[opt];
        else s.selected=[...s.selected.filter(v=>!EXCLUSIVE.includes(v)),opt];
        s.skipped=false; save(); render();
      });
      grid.appendChild(b);
    });
    return grid;
  }

  function renderFields(q,s){
    const grid=document.createElement('div'); grid.className='field-grid';
    q.fields.forEach(f=>{
      const wrap=document.createElement('div'); wrap.className='field';
      const label=document.createElement('label'); label.textContent=f.label;
      const select=document.createElement('select');
      select.innerHTML='<option value="">Vyberte</option>'+f.options.map(o=>`<option value="${o}">${o}</option>`).join('');
      select.value=s.fields[f.key]||'';
      select.addEventListener('change',()=>{s.fields[f.key]=select.value;s.skipped=false;save();updateProgress();renderSteps();});
      wrap.append(label,select); grid.appendChild(wrap);
    });
    return grid;
  }

  function renderSize(q,s){
    const root=document.createElement('div');
    const presets=[
      {name:'Menší půjčovna',desc:'do 10 typů / do 10 kusů',icon:'building',fill:{types:'1–10',units:'Do 10',branches:'1'}},
      {name:'Střední půjčovna',desc:'cca 11–30 typů / kusů',icon:'shop',fill:{types:'11–30',units:'11–30',branches:'1'}},
      {name:'Větší půjčovna',desc:'cca 31–60 typů / kusů',icon:'blocks',fill:{types:'31–60',units:'31–60',branches:'2–3'}},
      {name:'Velká síť',desc:'61+ kusů / více poboček',icon:'network',fill:{types:'61–100',units:'61–100',branches:'4+'}}
    ];
    const icons={
      building:'<svg viewBox="0 0 24 24"><path d="M6 22V5h12v17M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2M4 22h16"/></svg>',
      shop:'<svg viewBox="0 0 24 24"><path d="M4 10h16l-2-6H6zM5 10v10h14V10M9 20v-6h6v6"/></svg>',
      blocks:'<svg viewBox="0 0 24 24"><path d="M3 22V8h7v14M10 22V3h11v19M6 11h1M6 15h1M13 7h2M17 7h1M13 11h2M17 11h1M13 15h2M17 15h1M2 22h20"/></svg>',
      network:'<svg viewBox="0 0 24 24"><circle cx="12" cy="4" r="2"/><circle cx="4" cy="12" r="2"/><circle cx="20" cy="12" r="2"/><circle cx="12" cy="20" r="2"/><path d="m10.5 5.5-5 5m8-5 5 5m-8 8-5-5m8 5 5-5"/></svg>'
    };
    const ps=document.createElement('div'); ps.className='size-presets';
    presets.forEach(p=>{
      const b=document.createElement('button'); b.type='button'; b.className='size-card';
      const selected=Object.keys(p.fill).every(k=>s.fields[k]===p.fill[k]);
      if(selected)b.classList.add('selected');
      b.innerHTML=`<span class="size-icon">${icons[p.icon]}</span><strong>${p.name}</strong><span>${p.desc}</span>`;
      b.addEventListener('click',()=>{Object.assign(s.fields,p.fill);s.skipped=false;save();render();});
      ps.appendChild(b);
    });
    root.appendChild(ps); root.appendChild(renderFields(q,s)); return root;
  }

  function renderText(q,s){
    const t=document.createElement('textarea'); t.className='text-answer'; t.rows=7; t.placeholder=q.placeholder||'Napište odpověď…'; t.value=s.text||'';
    t.addEventListener('input',()=>{s.text=t.value;s.skipped=false;save();updateProgress();renderSteps();});
    return t;
  }

  function render(){
    const q=questions[current], s=state[current];
    els.content.innerHTML='';
    const kicker=document.createElement('div'); kicker.className='question-kicker'; kicker.textContent=groups[groupFor(current)].label;
    const h=document.createElement('h2'); h.textContent=q.title;
    const sub=document.createElement('p'); sub.className='question-sub'; sub.textContent=q.sub||'';
    els.content.append(kicker,h,sub);
    if(q.type==='single') els.content.appendChild(renderSingle(q,s));
    if(q.type==='multi') els.content.appendChild(renderMulti(q,s));
    if(q.type==='fields') els.content.appendChild(renderFields(q,s));
    if(q.type==='size') els.content.appendChild(renderSize(q,s));
    if(q.type==='text') els.content.appendChild(renderText(q,s));
    els.why.textContent=q.why;
    els.note.value=s.note||'';
    els.prev.disabled=current===0;
    els.skip.textContent=s.skipped?'Přeskočeno ✓':'Přeskočit';
    els.next.innerHTML=current===questions.length-1?'Dokončit dotazník <span>→</span>':'Další otázka <span>→</span>';
    renderSteps(); updateProgress();
  }

  function scrollQuestion(){ document.querySelector('#questionnaire').scrollIntoView({behavior:'smooth',block:'start'}); }
  function go(delta){ current=Math.max(0,Math.min(questions.length-1,current+delta)); save(); render(); scrollQuestion(); }

  els.prev.addEventListener('click',()=>go(-1));
  els.next.addEventListener('click',()=>{
    if(current===questions.length-1){ showFinish(); return; }
    go(1);
  });
  els.skip.addEventListener('click',()=>{
    state[current].skipped=!state[current].skipped;
    save(); render();
    if(state[current].skipped && current<questions.length-1) setTimeout(()=>go(1),120);
  });
  els.note.addEventListener('input',()=>{state[current].note=els.note.value; if(els.note.value.trim()) state[current].skipped=false; save(); updateProgress(); renderSteps();});

  function answerText(i){
    const q=questions[i], s=state[i], rows=[];
    if(s.skipped) return 'PŘESKOČENO';
    if(q.type==='single'||q.type==='multi') rows.push(...s.selected);
    if(q.type==='fields'||q.type==='size') q.fields.forEach(f=>{ if(s.fields[f.key]) rows.push(`${f.label}: ${s.fields[f.key]}`); });
    if(q.type==='text' && s.text.trim()) rows.push(s.text.trim());
    if(s.note.trim()) rows.push(`Vlastní doplnění: ${s.note.trim()}`);
    return rows.length?rows.join('\n'):'NEZODPOVĚZENO';
  }

  function buildSummary(){
    client={name:els.clientName.value.trim(),email:els.clientEmail.value.trim(),phone:els.clientPhone.value.trim()};
    const lines=['HAVARIX — DOTAZNÍK PRO NÁVRH PŮJČOVNY',''];
    if(client.name||client.email||client.phone){
      lines.push('KLIENT');
      if(client.name) lines.push(`Firma / jméno: ${client.name}`);
      if(client.email) lines.push(`E-mail: ${client.email}`);
      if(client.phone) lines.push(`Telefon: ${client.phone}`);
      lines.push('');
    }
    questions.forEach((q,i)=>{ lines.push(`${i+1}. ${q.title}`); lines.push(answerText(i)); lines.push(''); });
    lines.push('---');
    lines.push(`Zodpovězeno: ${answeredCount()} / ${questions.length}`);
    lines.push(`Přeskočeno: ${state.filter(s=>s.skipped).length}`);
    return lines.join('\n');
  }

  function showFinish(){
    els.finish.classList.remove('hidden');
    els.clientName.value=client.name||''; els.clientEmail.value=client.email||''; els.clientPhone.value=client.phone||'';
    els.summary.value=buildSummary();
    els.finish.scrollIntoView({behavior:'smooth',block:'start'});
  }

  [els.clientName,els.clientEmail,els.clientPhone].forEach(input=>input.addEventListener('input',()=>{client={name:els.clientName.value,email:els.clientEmail.value,phone:els.clientPhone.value}; els.summary.value=buildSummary(); save();}));

  function download(filename,content,type){
    const blob=new Blob([content],{type}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  $('#downloadTxt').addEventListener('click',()=>{const s=buildSummary();els.summary.value=s;download('HAVARIX-dotaznik-odpovedi.txt',s,'text/plain;charset=utf-8');});
  $('#downloadJson').addEventListener('click',()=>{client={name:els.clientName.value.trim(),email:els.clientEmail.value.trim(),phone:els.clientPhone.value.trim()};const data={client,answers:questions.map((q,i)=>({number:i+1,question:q.title,answer:answerText(i)})),createdAt:new Date().toISOString()};download('HAVARIX-dotaznik-odpovedi.json',JSON.stringify(data,null,2),'application/json;charset=utf-8');});
  $('#printBtn').addEventListener('click',()=>{els.summary.value=buildSummary();window.print();});
  $('#backBtn').addEventListener('click',()=>{els.finish.classList.add('hidden');scrollQuestion();});

  load(); render(); queueSync(300);
})();
