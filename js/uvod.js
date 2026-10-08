/* ============================================================
   ÚVOD — návod pre kolegov: čo trenažér je, čo je v ktorom
   module a čo sa v ňom dá nastaviť. Počty sa berú priamo z dát,
   takže po doplnení databázy sedia samy.
   ============================================================ */
function renderHome(card) {
  document.getElementById('qnum').textContent = '•';
  document.getElementById('qtotal').textContent = 'návod';
  const sim = CALLSIGNS.filter(c => c.sim).length;
  const mods = [
    { m: 'aircraft', n: 'MOD 01', t: 'Typy lietadiel', what: `Na fotke je lietadlo a ty určíš jeho ICAO označenie typu (B738, A320, AT76…). Po odpovedi vidíš kategóriu turbulencie v úplave, motory, rýchlosti, dostup a kto s ním lieta.`,
      has: `${AIRCRAFT.length} typov — dopravné, regionálne, bizjety, malé lietadlá, vrtuľníky aj vojenské.`,
      set: ['OBTIAŽNOSŤ: výber zo 4 možností alebo písanie', 'TURBULENCIA V ÚPLAVE: len LIGHT / MEDIUM / HEAVY / SUPER'],
      good: 'Aby si z typu na štítku hneď vedel, čo za lietadlo to je a ako sa správa.',
      how: ["V riadku OBTIAŽNOSŤ nechaj ĽAHKÁ — pod fotkou sú štyri typy, klikni na správny.", "Chceš len veľké dopravné lietadlá? V riadku TURBULENCIA V ÚPLAVE zvoľ HEAVY. Malé lietadlá a bizjety sú pod LIGHT.", "Keď ti to ide, prepni na HARDCORE a píš označenie z hlavy (B738). Uzná sa aj bežný názov, napr. „737-800“.", "Po odpovedi si prečítaj tabuľku pod fotkou — kategória turbulencie v úplave a dostup sa oplatí vedieť."] },
    { m: 'airport', n: 'MOD 02', t: 'Letiská a ICAO kódy', what: `Kód → mesto a mesto → kód. Dá sa to robiť ako kvíz, s mapou, kde letisko svieti, alebo klikaním do mapy. Zvlášť sa dajú trénovať prefixy štátov (LO = Rakúsko) a v ŠTÚDIU vidíš, ktorá časť Európy má ktoré prvé písmeno.`,
      has: `${AIRPORTS.length} letísk — ${AIRPORTS.filter(a => a.cat === 'sk').length} slovenských, ${AIRPORTS.filter(a => a.cat === 'neigh').length} v susedných štátoch a ${AIRPORTS.filter(a => a.cat === 'other').length} ďalších. Prefixy ${pxAll().length} štátov.`,
      set: ['REŽIM: KVÍZ / MAPA / NÁJDI NA MAPE / PREFIXY ŠTÁTOV / ŠTÚDIUM', 'OBTIAŽNOSŤ: výber alebo písanie; pri klikaní 100 km alebo 50 km', 'REGION: Slovensko / susedné štáty / ostatné'],
      good: 'Letový plán aj koordinácia pracujú s ICAO kódmi — treba ich vedieť čítať bez rozmýšľania.',
      how: ["Začni režimom ŠTÚDIUM: pozri si, ktorá časť Európy má písmeno E, L, U… a klikaj na kódy štátov.", "Potom PREFIXY ŠTÁTOV — naučíš sa prvé dve písmená (LO, LK, EP…). Keď vieš prefix, z kódu letiska ti ostávajú už len dve písmená.", "Prepni na KVÍZ a v riadku REGION zvoľ SK LETISKÁ. Až keď ich vieš, pridaj SUSEDNÉ ŠTÁTY a nakoniec OSTATNÉ.", "MAPA ukáže, kde letisko leží, a KLIKNI NA MAPU ťa nechá ukázať to samého — vhodné na koniec.", "V každom režime si v riadku OBTIAŽNOSŤ vyber ĽAHKÁ (výber) alebo HARDCORE (písanie)."] },
    { m: 'callsign', n: 'MOD 03', t: 'Volacie znaky', what: `Trojpísmenový kód prevádzkovateľa ↔ volací znak (BAW ↔ SPEEDBIRD). Najprv idú tie, ktoré sa na simulátore objavujú najčastejšie. Pri väčšine vidíš aj meno prevádzkovateľa, krajinu a obrázok.`,
      has: `${CALLSIGNS.length} volačiek, z toho ${sim} najpoužívanejších na simulátore.`,
      set: ['REŽIM: KVÍZ / KARTIČKY (sám sa ohodnotíš) / ZOZNAM (čítanie a zakrývanie)', 'VÝBER: všetky / najpoužívanejšie na simulátore / cez Slovensko', 'BALÍČEK PO 20 — uč sa po malých dávkach', 'TYP: „bez súvisu" (BAW → SPEEDBIRD) alebo „kód vo volačke" (RYR → RYANAIR)', 'SMER a PÍSMENO'],
      good: 'Na štítku je kód, na frekvencii počuješ volačku. Začni výberom NAJPOUŽÍVANEJŠIE a balíčkom 1.',
      how: ["V riadku VÝBER klikni na NAJPOUŽÍVANEJŠIE NA SIMULÁTORE — to sú tie, ktoré naozaj stretneš.", "V riadku BALÍČEK PO 20 zvoľ balíček 1. Je v ňom 20 najčastejších (AUA, WZZ, RYR…).", "Prepni REŽIM na ZOZNAM a balíček si prečítaj. Tlačidlom ZAKRYŤ VOLAČKY sa hneď vyskúšaj.", "Potom KARTIČKY: povedz si volačku nahlas, medzerníkom ju odkry a ohodnoť sa klávesom 1 alebo 2.", "Nakoniec KVÍZ — najprv ĽAHKÁ, potom HARDCORE. Keď balíček vieš, tlačidlom ĎALŠÍ BALÍČEK choď na ďalších 20.", "Riadok TYP: BEZ SÚVISU ti nechá len volačky, ktoré sa z kódu nedajú uhádnuť — tie sú najťažšie."] },
    { m: 'waypoint', n: 'MOD 04', t: 'Body FRA na mape', what: `Význačné body FIR Bratislava. Buď dostaneš názov a klikáš na mapu, alebo bod svieti a píšeš názov. SLEPÁ MAPA dá všetky body naraz očíslované a ty dopĺňaš názvy.`,
      has: `${WAYPOINTS.length} bodov vrátane navigačných zariadení.`,
      set: ['REŽIM: NÁJDI BOD / POMENUJ BOD / SLEPÁ MAPA / ŠTÚDIUM', 'OBTIAŽNOSŤ: menej bodov a nápovede, alebo všetko bez mien', 'BODY: všetky alebo len hraničné', 'SEKTOR: WEST / CENTRAL / EAST / navigačné zariadenia'],
      good: 'Aby si pri „direct MEBAN" vedel, kam lietadlo poletí, bez hľadania na mape.',
      how: ["Začni režimom ŠTÚDIUM a v riadku SEKTOR si zvoľ jeden sektor (napr. WEST), aby bolo na mape menej bodov.", "Prepni na NÁJDI BOD s obtiažnosťou ĽAHKÁ — vyberáš z piatich krúžkov.", "POMENUJ BOD je opačne: bod svieti a ty píšeš názov. V ľahkej verzii sú susedné body pomenované.", "V riadku BODY zvoľ IBA HRANIČNÉ, ak sa učíš body na hranici FIR — tie sa používajú pri koordinácii.", "SLEPÁ MAPA je skúška na koniec: všetky body naraz, vyplníš názvy a dáš VYHODNOTIŤ."] },
    { m: 'heading', n: 'MOD 05', t: 'Hra na kurzy', what: `STATICKÝ režim: lietadlo stojí, na mape je bod a ty napíšeš kurz, ktorý naň vedie. POHYBLIVÝ režim: lietadlo letí a ty ho kurzami navádzaš cez bránky alebo nad miesta. Kurzy sú vždy po 5°.`,
      has: 'Náhodné úlohy — nikdy sa neminú.',
      set: ['REŽIM: STATICKÝ / POHYBLIVÝ', 'OBTIAŽNOSŤ: uzná aj o 5° vedľa, alebo len presný kurz; pomalé alebo rýchle lietadlo', 'CIEĽ (pohyblivý): bránky / miesta / body FRA', 'RUŽICA: pomôcka s kurzami okolo lietadla'],
      good: 'Odhad kurzu z obrazovky — základ vektorovania.',
      how: ["Začni v režime STATICKÝ s obtiažnosťou ĽAHKÁ: napíš kurz po 5° (napr. 245) a stlač Enter. Uzná sa aj kurz o 5° vedľa.", "Ak si neistý, v riadku RUŽICA zapni pomôcku — okolo lietadla sa ukáže kruh s kurzami.", "HARDCORE v statickom režime uzná len presný kurz.", "POHYBLIVÝ režim: lietadlo letí, ty píšeš kurzy a navádzaš ho cez oranžovú bránku. V riadku CIEĽ si namiesto bránok zvoľ MIESTA alebo BODY FRA.", "Tlačidlo ? SMER NA CIEĽ ti prezradí približný kurz, keď sa zasekneš."] },
    { m: 'coord', n: 'MOD 06', t: 'Koordinácia a frekvencie', what: `Koordinačné body so susedmi, hladiny, v akých sa na nich lietadlá odovzdávajú, frekvencie a vertikálne hranice stanovíšť. Dá sa to skúšať po jednom alebo dopĺňať celé tabuľky.`,
      has: `${Object.keys(CO_COP).length} koordinačných bodov, ${CO_TABLES.length} tabuliek (${CO_TABLES.reduce((s, t) => s + t.rows.length, 0)} riadkov) a ${CO_UNITS.length} stanovíšť s frekvenciami.`,
      set: ['REŽIM: BODY NA MAPE / FREKVENCIE / VERTIKÁLNE HRANICE / HLADINY NA BODOCH / DOPLŇOVAČKA / ŠTÚDIUM', 'OBTIAŽNOSŤ: výber zo 6 možností alebo písanie', 'SUSED: Warsaw / Ľviv / Budapest / Wien / Praha', 'TABUĽKA (doplňovačka): ktorúkoľvek z dohody'],
      good: 'Kto letí cez ktorý bod, v akej hladine a na akú frekvenciu ho odovzdáš.',
      how: ["Začni režimom ŠTÚDIUM — mapa bodov podľa suseda a všetky tabuľky pohromade.", "BODY NA MAPE: nauč sa, ktorý bod patrí ktorému susedovi. V riadku SUSED si vyber jedného (napr. Budapest) a choď po jednom.", "FREKVENCIE a VERTIKÁLNE HRANICE sú krátke — 19 frekvencií a 24 stanovíšť. Dajú sa zvládnuť za jeden večer.", "HLADINY NA BODOCH je hlavná časť: dostaneš smer, trať a typ letu a určíš bod, hladinu a podmienku.", "DOPLŇOVAČKA: v riadku TABUĽKA zvoľ jednu tabuľku a doplň ju celú. Ľahká verzia má rozbaľovacie ponuky, hardcore píšeš."] },
  ];
  card.innerHTML = `
    <div class="home-hero">
      <div class="home-kicker">ATCO TRAINER</div>
      <h1>Všetko, čo treba vedieť naspamäť, na jednom mieste.</h1>
      <p>Trenažér pre kolegov z výcviku: typy lietadiel, letiská, volačky, body, kurzy a koordinácia. Skúša ťa počítač a to, čo nevieš, ti vracia, kým to nesedí. Spravil <strong>Denzy</strong>. <a href="#" data-hp="home">Ako na to ❓</a> · <a href="#" data-about="1">O stránke ▸</a></p>
    </div>
    ${homeHelloHTML()}
    <div id="home-wkt">${wkTasksHTML()}</div>
    ${homeDashHTML()}

    <div class="home-contact">
      <strong>Našiel si chybu alebo ti niečo chýba?</strong>
      Dole na každej stránke je päta s tlačidlami <b>Napísať návrh</b>, <b>Nahlásiť chybu</b> a <b>Kontaktovať tvorcu</b>. Otvoria e-mail na <b>davidsvec24.76@gmail.com</b>; pri chybe je v ňom už vyplnené, v ktorom module a pri ktorej otázke si.
    </div>`;
  card.querySelectorAll('[data-go]').forEach(b => { b.onclick = () => { startMode(b.dataset.go); window.scrollTo(0, 0); }; });
  card.querySelectorAll('[data-about]').forEach(b => { b.onclick = e => { e.preventDefault(); startMode('about'); window.scrollTo(0, 0); }; });
  homeHelloBind();
  if (RK.acct && !RK.rows && !RK.loading) rkLoad();
  const sq = document.getElementById('home-q');
  sq.oninput = () => { document.getElementById('home-res').innerHTML = searchAll(sq.value); };
}
