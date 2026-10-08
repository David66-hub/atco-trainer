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
      <p>Trenažér pre kolegov z výcviku: typy lietadiel, letiská, volačky, body, kurzy a koordinácia. Skúša ťa počítač a to, čo nevieš, ti vracia, kým to nesedí. Spravil <strong>Denzy</strong>. <a href="#" data-hp="home">Ako na to ❓</a></p>
    </div>
    ${homeDashHTML()}
    <div class="home-steps">
      <div><b>1</b><span><strong>Vyber modul</strong> hore v lište (MOD 01 až MOD 06).</span></div>
      <div><b>2</b><span><strong>Nastav si ho</strong> v tabuľke pod otázkou — režim, obtiažnosť a čo sa má skúšať.</span></div>
      <div><b>3</b><span><strong>Odpovedaj.</strong> Čo pokazíš, vráti sa ti neskôr v tom istom cvičení.</span></div>
    </div>
    <details class="home-more"><summary>PODROBNÝ NÁVOD — obrazovka, nastavenia, ako sa učiť</summary>
    <div class="home-h">KDE ČO NA OBRAZOVKE JE</div>
    <div class="home-tips">
      <div><strong>Lišta hore</strong>MODULY otvorí okno so všetkými cvičeniami, vedľa sú DENNÁ VÝZVA, DOBYVATEĽ a REBRÍČEK. Na úvod sa vrátiš kliknutím na ATCO TRAINER.</div>
      <div><strong>Hlavička panelu</strong>Vľavo názov modulu a číslo otázky (napr. 12 / 200). Vpravo CORRECT, WRONG a STREAK — koľko máš správne, zle a koľko správnych za sebou.</div>
      <div><strong>Otázka (stred)</strong>Fotka, kód alebo mapa a pod tým políčko na odpoveď alebo tlačidlá s možnosťami. Po odpovedi sa hneď ukáže, či to bolo správne, a všetko podstatné k danej veci.</div>
      <div><strong>ČO TU ROBÍŠ</strong>Zelený rámček pod otázkou. Jednou-dvoma vetami povie, čo sa v práve zvolenom režime robí. Zmení sa vždy, keď prepneš režim.</div>
      <div><strong>Tabuľka nastavení</strong>Hneď pod tým. Vľavo názov riadku (REŽIM, OBTIAŽNOSŤ, REGION…), vpravo voľby. Zelená voľba je zapnutá. Kliknutím na inú sa cvičenie spustí odznova s novým nastavením.</div>
      <div><strong>SKIP a RESET</strong>Vpravo dole pod tabuľkou. SKIP preskočí otázku (ráta sa ako chyba), RESET spustí cvičenie od začiatku a vynuluje počítadlá.</div>
      <div><strong>WEAK SPOTS (slabé miesta)</strong>Úplne dole. Zbierajú sa tu veci, ktoré si pokazil trikrát a viac — presne tie si treba zopakovať.</div>
      <div><strong>ZVLÁDNUTÉ</strong>V riadku OPAKOVANIE. Počíta otázky, ktoré si zodpovedal správne dvakrát po sebe, z celkového počtu v danom výbere.</div>
    </div>
    <div class="home-h">AKO SI ČO NASTAVIŤ</div>
    <div class="home-tips">
      <div><strong>1. Najprv REŽIM</strong>Prvý riadok tabuľky. Určuje, čo budeš robiť: kvíz, mapu, kartičky, doplňovačku alebo len študijné prezeranie. Ostatné riadky sa podľa neho menia.</div>
      <div><strong>2. Potom OBTIAŽNOSŤ</strong>ĽAHKÁ = vyberáš z možností alebo máš nápovede. HARDCORE = píšeš z hlavy a nič ti nepomáha. Odporúčanie: ľahká, kým nemáš aspoň 80 % správne.</div>
      <div><strong>3. Zmenši si výber</strong>Riadky ako REGION, SEKTOR, SUSED, PÍSMENO alebo BALÍČEK obmedzia, z čoho sa skúša. Malý výber sa naučíš rýchlo; veľký ťa len zahltí.</div>
      <div><strong>4. Sleduj OPAKOVANIE</strong>Keď máš pár chýb, zapni LEN SLABÉ MIESTA. Pôjdu len otázky, ktoré si pokazil, a po správnej odpovedi zo zoznamu vypadnú.</div>
      <div><strong>Nevieš, čo tlačidlo robí?</strong>Podrž nad ním myš. Ukáže sa krátke vysvetlenie — funguje to na každom tlačidle na stránke.</div>
      <div><strong>Chceš začať úplne odznova?</strong>V riadku OPAKOVANIE je VYMAZAŤ POKROK. Zmaže slabé miesta a počítadlo ZVLÁDNUTÉ pre daný modul.</div>
    </div>
    <div class="home-h">AKO SA S TÝM UČIŤ</div>
    <div class="home-tips">
      <div><strong>Radšej 10 minút denne</strong>než dve hodiny raz za týždeň. Krátke opakovanie každý deň drží v hlave oveľa dlhšie.</div>
      <div><strong>Po malých kúskoch</strong>Jeden sektor, jeden sused, jeden balíček 20 volačiek. Až keď ho vieš, pridaj ďalší.</div>
      <div><strong>Najprv pozeraj, potom sa skúšaj</strong>Skoro každý modul má ŠTÚDIUM alebo ZOZNAM. Prejdi si ho pred kvízom, nech nehádaš naslepo.</div>
      <div><strong>Hovor si to nahlas</strong>Hlavne volačky a kurzy. Na frekvencii ich budeš hovoriť, nie písať.</div>
    </div>
    </details>
    <div class="home-h">MODULY</div>
    <div class="home-mods">${mods.map(x => `
      <div class="home-mod">
        <div class="home-mod-top"><span>${x.n}</span><strong>${x.t}</strong></div>
        ${homeProgHTML(x.m)}
        <p>${x.what}</p>
        <div class="home-row"><em>OBSAHUJE</em>${x.has}</div>
        <div class="home-row"><em>DÁ SA NASTAVIŤ</em><ul>${x.set.map(s => `<li>${s}</li>`).join('')}</ul></div>
        <div class="home-row"><em>NA ČO JE TO DOBRÉ</em>${x.good}</div>
        <div class="home-row home-how"><em>AKO ZAČAŤ — KROK ZA KROKOM</em><ol>${x.how.map(s => `<li>${s}</li>`).join('')}</ol></div>
        <button class="btn" data-go="${x.m}">OTVORIŤ ${x.n} ▶</button>
      </div>`).join('')}</div>
    <details class="home-more"><summary>ČO PLATÍ VŠADE — obtiažnosť, opakovanie, klávesnica</summary>
    <div class="home-h">ČO PLATÍ VŠADE</div>
    <div class="home-tips">
      <div><strong>ĽAHKÁ a HARDCORE</strong>Každý modul má dve obtiažnosti. Začni ľahkou (výber z možností), potom prejdi na hardcore (písanie z hlavy).</div>
      <div><strong>Opakovanie chýb</strong>Pokazená otázka sa vráti neskôr. Prepínač LEN SLABÉ MIESTA pustí iba to, čo ti nejde.</div>
      <div><strong>Pokrok sa ukladá</strong>V prehliadači na tomto zariadení. Na inom počítači alebo telefóne začínaš od nuly.</div>
      <div><strong>Nápovede</strong>Tlačidlo HINT napovedá po krokoch. Keď podržíš myš nad ktorýmkoľvek tlačidlom, ukáže sa, čo robí.</div>
      <div><strong>Celá obrazovka</strong>Zelené tlačidlo vpravo hore v paneli. Hodí sa pri mapách; späť klávesom Esc.</div>
      <div><strong>Klávesnica</strong>Enter odošle odpoveď a ďalším Enterom (alebo medzerníkom) ideš ďalej. Pri výbere z možností stačí stlačiť číslo 1 až 6. SKIP otázku preskočí, RESET začne cvičenie odznova.</div>
      <div><strong>Opakovanie cez dni</strong>Čo zodpovieš správne, príde znova o 1, 3, 7, 14 a 30 dní. Čo pokazíš, príde hneď zajtra. Stará sa o to DNEŠNÝ TRÉNING.</div>
      <div><strong>Telefón aj notebook</strong>Funguje na oboch. Fotky lietadiel a prevádzkovateľov sa sťahujú z Wikipédie, takže potrebujú internet.</div>
      <div><strong>Je to pomôcka, nie predpis</strong>Údaje sú prepísané z výcvikových podkladov a máp. Ak sa niečo líši od platnej dokumentácie, platí dokumentácia.</div>
    </div>
    </details>
    <div class="home-contact">
      <strong>Našiel si chybu alebo ti niečo chýba?</strong>
      Dole na každej stránke je päta s tlačidlami <b>Napísať návrh</b>, <b>Nahlásiť chybu</b> a <b>Kontaktovať tvorcu</b>. Otvoria e-mail na <b>davidsvec24.76@gmail.com</b>; pri chybe je v ňom už vyplnené, v ktorom module a pri ktorej otázke si.
    </div>`;
  card.querySelectorAll('[data-go]').forEach(b => { b.onclick = () => { startMode(b.dataset.go); window.scrollTo(0, 0); }; });
  const sq = document.getElementById('home-q');
  sq.oninput = () => { document.getElementById('home-res').innerHTML = searchAll(sq.value); };
}
