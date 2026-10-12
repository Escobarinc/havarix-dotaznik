(() => {
  'use strict';
  const STORAGE_KEY = 'havarix-rental-questionnaire-v4';
  const groups = [
    {label:'Základní informace', start:0, end:6},
    {label:'Sortiment a technika', start:7, end:14},
    {label:'Rezervace a provoz', start:15, end:21},
    {label:'Zákazníci a dokumenty', start:22, end:28},
    {label:'Platby a administrace', start:29, end:33},
    {label:'Váš provoz a priority', start:34, end:38}
  ];

  const questions = [
    {title:'Jak velká půjčovna má být?', sub:'Upřesněte přibližný rozsah sortimentu, počet fyzických kusů a počet provozoven.', why:'Velikost půjčovny ovlivňuje celé nastavení systému — od správy produktů přes rezervace až po reporting. Díky tomu navrhneme řešení, které nebude zbytečně složité ani příliš jednoduché.', type:'size', fields:[
      {key:'types', label:'Kolik druhů techniky / produktů?', options:['1–10','11–30','31–60','61–100','100+','Zatím nevím']},
      {key:'units', label:'Kolik fyzických kusů techniky celkem?', options:['Do 10','11–30','31–60','61–100','100+','Zatím nevím']},
      {key:'growth', label:'Má být nabídka časem výrazně větší?', options:['Ano','Ne','Možná']},
      {key:'branches', label:'Kolik bude poboček / provozoven?', options:['1','2–3','4+','Zatím nevím']}
    ]},
    {title:'Funguje půjčovna už dnes?', sub:'Půjčujete techniku už teď, nebo půjčovnu teprve rozjíždíte?', why:'U fungující půjčovny vycházíme z toho, co se osvědčilo. U nové je lepší začít jednoduše a systém rozšiřovat až podle skutečného provozu.', type:'single', options:['Ano — běžně půjčujeme','Ano — jen občas, hlavně známým zákazníkům','Ne — teprve ji rozjíždíme']},
    {title:'Kolik půjčení očekáváte?', sub:'Stačí hrubý odhad. Jde o počet výpůjček, ne o počet kusů techniky.', why:'Pár výpůjček měsíčně zvládne jednoduchý kalendář. Desítky výpůjček měsíčně už potřebují hlídání dostupnosti, vratek a termínů.', type:'fields', fields:[
      {key:'monthly', label:'Kolik půjčení za měsíc?', options:['Do 5','6–20','21–50','51–100','100+','Zatím nevím']},
      {key:'length', label:'Jak dlouho trvá typické půjčení?', options:['1–3 dny','Zhruba týden','2–4 týdny','Déle než měsíc','Pokaždé jinak','Zatím nevím']}
    ]},
    {title:'Kdo si bude techniku půjčovat?', sub:'Vyberte skupiny zákazníků, které čekáte nejčastěji.', why:'Soukromá osoba potřebuje rychlou a jednoduchou objednávku. Firmy a pojišťovny potřebují faktury, smlouvy a často i opakované objednávky.', type:'multi', options:['Soukromé osoby','Řemeslníci a živnostníci','Stavební firmy','Správci budov / SVJ','Pojišťovny a likvidátoři','Jiní zákazníci']},
    {title:'Používáte půjčovanou techniku i na vlastních zakázkách?', sub:'Jezdí stejné stroje také na vaše havárie a vysoušení?', why:'Pokud ano, musí systém vědět i o technice nasazené na vašich zakázkách. Jinak by zákazníkovi nabídl stroj, který zrovna stojí u vašeho klienta.', type:'single', options:['Ne — technika je jen pro půjčovnu','Ano — stejné stroje jezdí i na naše zakázky','Ano, ale jen výjimečně','Zatím nevím']},
    {title:'Co má být hlavním účelem webu?', sub:'Vyberte variantu, která nejlépe odpovídá vašemu záměru.', why:'Ne každý web půjčovny potřebuje plný rezervační systém. Nejdřív je potřeba určit, zda má web pouze prezentovat nabídku, sbírat poptávky, nebo skutečně řídit rezervace.', type:'single', options:['Pouze prezentace firmy','Katalog půjčované techniky','Poptávkový formulář','Online rezervace','Kompletní systém půjčovny']},
    {title:'Jak má zákazník techniku objednávat?', sub:'Jaký má být hlavní způsob vytvoření poptávky nebo rezervace?', why:'Způsob objednání zásadně určuje složitost webu. Nezávazná poptávka je jednoduchá, automatická rezervace už vyžaduje práci s dostupností a termíny.', type:'single', options:['Zavolá / napíše','Odešle nezávaznou poptávku','Vytvoří rezervaci ke schválení zaměstnancem','Rezervace se potvrdí automaticky podle dostupnosti']},
    {title:'Má zákazník vidět dostupnost?', sub:'Určete, kolik informací o dostupnosti má být veřejně vidět.', why:'Zobrazení přesné dostupnosti je užitečné, ale vyžaduje spolehlivou evidenci rezervací. U menší půjčovny může stačit jednoduché „skladem / není skladem“.', type:'single', options:['Ne','Pouze „skladem / není skladem“','Přesný počet dostupných kusů','Dostupnost podle konkrétního termínu']},
    {title:'Jak se budou evidovat jednotlivé stroje?', sub:'Stačí evidovat počet kusů produktu, nebo má mít každý stroj vlastní kartu?', why:'Samostatná evidence kusů dává smysl hlavně u většího počtu techniky, dražších strojů nebo tam, kde potřebujete sledovat historii, servis a konkrétní zařízení.', type:'single', options:['Pouze produkt + počet kusů','Každý fyzický kus samostatně','Každý kus + interní číslo','Každý kus + sériové číslo + historie']},
    {title:'Chcete QR / čárové kódy?', sub:'Vyberte, kde by kódy měly pomáhat při práci s technikou.', why:'QR nebo čárový kód může výrazně zrychlit výdej, vrácení a servis. Pokud ale máte jen několik kusů techniky, nemusí tato vrstva dávat smysl.', type:'multi', options:['Vůbec ne','QR kód na jednotlivém zařízení','QR + čárový kód','Skenování při výdeji','Skenování při vrácení','Skenování při servisu']},
    {title:'Jaké stavy zařízení potřebujete?', sub:'Vyberte stavy, které odpovídají vašemu reálnému provozu.', why:'Stavy zařízení mají smysl jen tehdy, když je bude obsluha skutečně používat. Příliš mnoho stavů zbytečně komplikuje každodenní práci.', type:'multi', options:['Dostupné','Rezervované','Připravené','Vypůjčené','Kontrola po vrácení','Servis','Poškozené','Vyřazené']},
    {title:'Jak mají fungovat ceny?', sub:'Vyberte cenová pravidla, která skutečně používáte nebo plánujete používat.', why:'Jednoduchá cena za den je snadná na správu. Slevy podle délky, B2B ceny a akce jsou možné, ale každé další pravidlo přidává logiku do kalkulace.', type:'multi', options:['Jedna cena za den','Cena podle počtu dní','Víkendová cena','Týdenní cena','Dlouhodobá cena','Individuální B2B cena','Akční ceny','Chci si ceny měnit sám v administraci']},
    {title:'Budete sledovat spotřebu elektřiny?', sub:'Týká se hlavně vysoušečů a další techniky, která běží nepřetržitě.', why:'Vysoušeče běží dny až týdny a spotřeba bývá vysoká. Pokud ji zákazníkovi nebo pojišťovně dokládáte, musí s tím systém počítat už při výdeji a vrácení.', type:'multi', options:['Ne','Stav elektroměru při výdeji a vrácení','Motohodiny stroje','Vyúčtování spotřeby zákazníkovi','Podklad pro pojišťovnu']},
    {title:'Má být možné měnit nabídku bez programátora?', sub:'Co všechno chcete sami spravovat v administraci?', why:'Smyslem administrace je, aby běžné změny nevyžadovaly programátora. Potřebujeme ale určit, zda stačí správa produktů, nebo chcete ovládat prakticky celý web.', type:'multi', options:['Přidávat nové stroje','Mazat nebo skrývat stroje','Měnit ceny','Přidávat fotografie','Měnit popisy','Měnit technické parametry','Přidávat kategorie','Upravovat celý obsah webu']},
    {title:'Chcete upravovat web přímo na stránkách?', sub:'Můžeme použít klasickou administraci, nebo editor přímo v zobrazené stránce.', why:'Inline editor je pohodlný pro klienta, ale je složitější než klasická administrace. Má smysl hlavně pokud budete obsah měnit často a chcete maximálně jednoduché ovládání.', type:'single', options:['Ne','Stačí klasická administrace','Úprava textů a obrázků přímo na stránce','Kompletní inline editor webu']},
    {title:'Jak bude fungovat termín půjčení?', sub:'Vyberte způsob práce s termínem a časem pronájmu.', why:'Rezervace na celé dny je výrazně jednodušší než hodinové pronájmy s časovými bloky. Potřebujeme znát přesná pravidla před návrhem kalendáře.', type:'multi', options:['Pouze celé dny','Datum + konkrétní čas','Pronájem na několik hodin','Minimální délka pronájmu','Maximální délka pronájmu','Časová rezerva na kontrolu mezi pronájmy']},
    {title:'Má systém zabránit dvojité rezervaci?', sub:'Pokud jsou všechny kusy v požadovaném termínu obsazené, má systém další rezervaci sám odmítnout?', why:'U automatických rezervací je blokace dvojité rezervace prakticky nutná. U čistě poptávkového webu může dostupnost ručně potvrdit zaměstnanec.', type:'single', options:['Ano','Ne','Zatím nevím']},
    {title:'Má zaměstnanec vytvářet rezervace ručně?', sub:'Například když zákazník zavolá nebo přijde osobně.', why:'Pokud existují online i telefonické rezervace, musí ideálně používat jeden společný kalendář. Jinak roste riziko dvojitého zamluvení techniky.', type:'single', options:['Ano — do stejného systému','Ne','Pouze administrátor','Zatím nevím']},
    {title:'Co všechno může být součástí jedné objednávky?', sub:'Vyberte typy položek, které může zákazník kombinovat.', why:'Jedna rezervace může obsahovat jen hlavní stroje, nebo i doplňky a spotřební materiál. To ovlivňuje košík, sklad i cenovou logiku.', type:'multi', options:['Více stejných strojů','Různé druhy zařízení','Příslušenství (hadice, kabely…)','Měřicí technika','Spotřební materiál']},
    {title:'Jak bude probíhat doprava?', sub:'Vyberte možné způsoby převzetí a případný způsob nacenění dopravy.', why:'Doprava může být jen informační volba, nebo samostatná cenová část objednávky. Potřebujeme vědět, zda se bude cena počítat automaticky.', type:'multi', options:['Pouze osobní odběr','Pouze doprava','Osobní odběr i doprava','Pevná cena dopravy','Cena podle kilometrů','Cena podle zóny / PSČ','Individuální nacenění']},
    {title:'Budete techniku jen půjčovat, nebo i instalovat?', sub:'Vyberte, co všechno k půjčení nabízíte.', why:'Samotné půjčení je jednoduchá výpůjčka. Dovoz, zapojení a průběžná měření už jsou práce vašich lidí, kterou je potřeba plánovat a účtovat.', type:'multi', options:['Jen půjčení — zákazník vše obslouží sám','Dovoz a zapojení na místě','Průběžné kontroly / měření vlhkosti','Odvoz po skončení','Zaškolení zákazníka při předání']},
    {title:'Má zákazník možnost prodloužit pronájem?', sub:'Jak má probíhat žádost o delší termín?', why:'Automatické prodloužení vyžaduje přesnou dostupnost. Jednodušší variantou je jen odeslat žádost zaměstnanci ke schválení.', type:'single', options:['Ne','Ano — pouze požadavek ke schválení','Ano — automaticky podle dostupnosti']},
    {title:'Potřebujete zákaznické účty?', sub:'Má zákazník rezervovat bez registrace, nebo se má přihlašovat?', why:'Registrace přidává další krok a není vždy nutná. Účet dává smysl, pokud zákazník potřebuje historii, opakované objednávky nebo firemní nastavení.', type:'single', options:['Vůbec ne','Rezervace bez registrace','Zákaznický účet','Firemní účet','Účet + historie předchozích pronájmů']},
    {title:'Má systém evidovat zákazníky?', sub:'Vyberte informace, které chcete mít u zákazníka uložené.', why:'Tady už se půjčovní systém přibližuje jednoduchému CRM. Pokud tyto údaje v provozu nepotřebujete, není důvod systém zbytečně nafukovat.', type:'multi', options:['Ne','Kontaktní údaje','Firma / IČO','Historie půjčení','Aktivní pronájmy','Poznámky','Neuhrazené částky']},
    {title:'Jak si ověřujete zákazníka?', sub:'Co musí zákazník splnit, než mu techniku vydáte?', why:'Podle toho poznáme, zda má systém evidovat doklady a kauce, nebo stačí jednoduchý záznam o zákazníkovi.', type:'multi', options:['Nijak','Občanský průkaz','Kauce předem','Firmám jen na IČO','Půjčujeme jen známým zákazníkům','Techniku máme pojištěnou']},
    {title:'Potřebujete smlouvy a protokoly?', sub:'Vyberte dokumenty, které by měl systém řešit.', why:'Automatické dokumenty dokážou ušetřit administrativu, ale je potřeba přesně vědět, které dokumenty dnes používáte a co v nich musí být.', type:'multi', options:['Ne','Nájemní smlouva','Předávací protokol','Vratný protokol','Automaticky generované PDF','Fotografie při předání','Fotografie při vrácení']},
    {title:'Má systém evidovat poškození?', sub:'Co má zaměstnanec zaznamenat při vrácení techniky?', why:'Evidence poškození je užitečná hlavně u dražší techniky nebo tam, kde často vznikají spory o stav zařízení.', type:'multi', options:['Ne','Bez závady','Poškozené','Znečištěné','Chybí příslušenství','Fotografie','Poznámka zaměstnance']},
    {title:'Potřebujete servisní evidenci?', sub:'Jak podrobně chcete sledovat opravy a stav techniky?', why:'U malé půjčovny může stačit stav „Servis“. U desítek kusů už může být užitečná servisní historie konkrétního zařízení.', type:'single', options:['Ne','Pouze stav Servis / mimo provoz','Historie servisů','Kompletní servisní evidence včetně závad a poznámek']},
    {title:'Jaká automatická komunikace má fungovat?', sub:'Vyberte zprávy, které mají chodit zákazníkovi automaticky.', why:'Automatická komunikace dokáže snížit počet telefonátů a zapomenutých vratek. Je ale vhodné automatizovat jen zprávy, které mají reálný přínos.', type:'multi', options:['Žádná','Potvrzení rezervace','Připomenutí převzetí','Připomenutí vrácení','Upozornění po termínu','Potvrzení vrácení','Potvrzení prodloužení','E-mail','SMS']},
    {title:'Jak chcete řešit platby?', sub:'Online platby nejsou povinné a mohou se případně doplnit později.', why:'Platební brána přidává externí službu a další nastavení. Pokud ji teď nepotřebujete, lze začít jednodušší variantou a online platby přidat až po ověření provozu.', type:'multi', options:['Vůbec neřešit na webu','Platba při převzetí','Bankovní převod','Online platba','Kauce','Evidence zaplaceno / nezaplaceno']},
    {title:'Jak řešíte fakturaci?', sub:'Název účetního nebo fakturačního programu napište prosím do vlastního doplnění.', why:'Pokud už faktury vystavujete jinde, nemusí je půjčovní systém řešit vůbec. Vlastní fakturace nebo napojení na účetnictví je samostatná část práce.', type:'multi', options:['Faktury vystavujeme ručně','Používáme účetní / fakturační program','Systém má faktury vystavovat sám','Stačí podklad pro účetní','Zatím nevím']},
    {title:'Co chce vidět administrátor?', sub:'Vyberte informace, které jsou důležité pro každodenní provoz.', why:'Dashboard by neměl být přeplněný. Má ukazovat hlavně věci, podle kterých člověk opravdu rozhoduje během pracovního dne.', type:'multi', options:['Dnešní výdeje','Dnešní vrácení','Aktivní pronájmy','Rezervace po termínu','Volná technika','Technika v servisu','Kalendář rezervací']},
    {title:'Kolik lidí bude systém používat?', sub:'Podle počtu uživatelů zjistíme, zda jsou potřeba role a oprávnění.', why:'Pokud systém používá jeden člověk, složitá oprávnění nemají význam. U více zaměstnanců už může být důležité oddělit obsluhu, technika nebo administrátora.', type:'fields', fields:[
      {key:'count', label:'Počet uživatelů systému', options:['1 člověk','2–3 lidé','4–10 lidí','10+ lidí','Zatím nevím']},
      {key:'roles', label:'Potřebujete různé role a oprávnění?', options:['Ne','Ano','Zatím nevím']}
    ]},
    {title:'Potřebujete statistiky?', sub:'Vyberte statistiky, které by měly pro vaše rozhodování reálný přínos.', why:'Statistiky jsou užitečné, ale nemusejí být součástí první verze. Největší smysl mají tehdy, pokud podle nich budete rozhodovat o nákupu a využití techniky.', type:'multi', options:['Ne','Počet pronájmů','Tržby','Nejvíce půjčované stroje','Vytíženost techniky','Nejméně využívaná technika']},
    {title:'Co má web umět u havarijního servisu a vysoušení?', sub:'Půjčovna je jen jedna ze tří služeb. Vyberte, co potřebujete u zbylých dvou.', why:'U havárie zákazník nehledá, ale volá. Potřebujeme vědět, zda stačí popis služeb s telefonem, nebo má web havárie a poptávky i přijímat.', type:'multi', options:['Jen popis služeb a kontakt','Výrazné tlačítko „Volejte hned“','Formulář pro nahlášení havárie','Nahrání fotek škody','Pohotovost 24/7','Poptávka vysoušení','Reference a realizace']},
    {title:'Jak funguje půjčovna dnes?', sub:'Popište celý proces od prvního kontaktu zákazníka až po vrácení zařízení. Pokud půjčovnu teprve rozjíždíte, popište, jak si ho představujete.', why:'Tohle je jedna z nejdůležitějších odpovědí. Z reálného procesu poznáme, co má smysl automatizovat a kde vzniká nejvíc ruční práce.', type:'text', placeholder:'Např. zákazník zavolá → ověříme techniku v Excelu → domluvíme cenu → připravíme stroj → podepíše papír → po vrácení zkontrolujeme stav…'},
    {title:'Co vám na současném fungování nejvíc vadí?', sub:'Vyberte problémy, které chcete novým webem nebo systémem odstranit.', why:'Nejdůležitější je řešit skutečný provozní problém, ne přidávat funkce jen proto, že jsou technicky možné.', type:'multi', options:['Nevíme, co je volné','Hledáme rezervace v papírech / Excelu','Zapomínají se termíny','Špatně se hlídají vratky','Nevíme, kde je konkrétní stroj','Ručně přepisujeme ceny','Zákazníci příliš často telefonují','Jiný problém']},
    {title:'Co naopak určitě nechcete?', sub:'Napište funkce nebo způsob fungování, který by vám nevyhovoval.', why:'Stejně důležité jako seznam požadavků je znát i věci, které by provoz komplikovaly nebo které klient vůbec nechce používat.', type:'text', placeholder:'Např. nechceme zákaznické účty, online platby, SMS, složitou administraci…'},
    {title:'Bez čeho půjčovnu nespustíte?', sub:'Napište nejvýše 5 věcí, které musí fungovat od prvního dne. Vše ostatní lze doplnit později.', why:'Tohle je nejdůležitější odpověď celého dotazníku. Podle ní určíme, co bude v první verzi a co počká, aby se spuštění zbytečně neprotahovalo.', type:'text', placeholder:'Např. 1) katalog techniky s cenami, 2) poptávka z webu, 3) přehled, co je kde půjčené…'}
  ];

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
      }catch(e){
        els.saveState.textContent = 'Uložení se nezdařilo';
        els.saveDot.style.background = '#ff2d2d';
      }
    }, 180);
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

  load(); render();
})();
