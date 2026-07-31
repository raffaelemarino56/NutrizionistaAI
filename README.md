# NutrizionistaAI — Coach Nutrizionale Sportivo

Una **PWA** (Progressive Web App) che fa da coach nutrizionale AI per la **ricomposizione corporea**: registri i pasti in linguaggio naturale, l'AI stima i macro, tiene traccia dei target giornalieri e ti propone i pasti successivi per restare in linea. Tutto gira nel browser, senza backend.

![PWA](https://img.shields.io/badge/PWA-installabile-2E8B90)
![No build](https://img.shields.io/badge/build-nessuno-3E9E4F)
![Vanilla JS](https://img.shields.io/badge/stack-HTML%20%2B%20CSS%20%2B%20JS-D6A32E)
![Offline](https://img.shields.io/badge/offline-supportato-3E5C74)

> ⚠️ **Disclaimer**: è uno strumento personale di supporto, **non** un dispositivo medico né una consulenza nutrizionale professionale. Le stime dei macro generate dall'AI sono approssimative. Per scelte alimentari legate alla salute, rivolgiti a un professionista.

<!-- Suggerimento: aggiungi qui uno screenshot dell'app, es. ![Screenshot](docs/screenshot.png) -->

## Funzionalità

- 📝 **Diario alimentare in linguaggio naturale** — scrivi "150g di pollo, 80g di riso e verdure" e l'AI stima kcal/proteine/carboidrati/grassi del pasto.
- 🎯 **Target giornalieri** — inseriscili a mano o falli proporre all'AI in base al tuo profilo (deficit moderato, alte proteine per preservare la massa magra).
- 📊 **Cruscotto in tempo reale** — indicatori per kcal e macro, con evidenza verde quando raggiungi il target e ⚠️ quando lo sfori.
- 🍽️ **Suggerimenti pasto** — 3 idee concrete calcolate sui macro che ti restano nella giornata.
- 📅 **Calendario e storico** — ogni giornata viene salvata e riconsultabile.
- ⚖️ **Check settimanale** — peso e note, con promemoria periodico e valutazione dell'andamento da parte dell'AI.
- ✏️ **Pasti modificabili** e inseribili **manualmente** (senza AI).
- 📴 **Uso offline** — vedi la sezione dedicata.
- 💾 **Esporta / importa profilo** in JSON (la chiave API non viene mai esportata).
- 📲 **Installabile** su smartphone e desktop come app.
- 🌗 **Dark mode** automatica in base al tema di sistema.

## Come funziona

L'app è **interamente lato client**:

- L'interfaccia e la logica stanno in un unico `index.html` (HTML + CSS + JavaScript vanilla, nessun framework, nessuno step di build).
- I dati (profilo, diario, target, check) sono salvati nel **`localStorage`** del browser.
- I suggerimenti sono generati dall'**API di Google Gemini**, chiamata direttamente dal browser con la **tua** chiave.
- Un **service worker** (`sw.js`) gestisce cache e funzionamento offline.

## Privacy

- La **chiave API** e tutti i **tuoi dati** restano sul tuo dispositivo (`localStorage`), non vengono inviati ad alcun server dell'app (l'app non ha server).
- La chiave viaggia nell'header `x-goog-api-key`, non in query string.
- ⚠️ **Nota importante**: quando usi le funzioni AI, il **testo delle tue richieste** (pasti, dati del profilo usati come contesto) viene inviato a **Google Gemini** per l'elaborazione. Le chiamate a Gemini sono le uniche uscite di rete che contengono i tuoi contenuti. I font sono caricati da Google Fonts.

## Requisiti: la chiave Gemini

Serve una chiave API di Google Gemini (piano gratuito sufficiente per l'uso personale):

1. Vai su **[Google AI Studio](https://aistudio.google.com/apikey)** con il tuo account Google.
2. Clicca **"Create API key"**.
3. Copia la chiave (inizia con `AIza...`).
4. Incollala nell'app al primo avvio (schermata di onboarding). Resta solo sul tuo dispositivo.

Il modello predefinito è `gemini-3.5-flash` ed è modificabile nel pannello "Connessione Gemini" (con suggerimenti dei modelli disponibili).

## Uso in locale

Il service worker richiede `http(s)://` (non funziona aprendo il file con `file://`), quindi servi la cartella con un server statico. Con Python:

```bash
python3 -m http.server 8000
```

Poi apri `http://localhost:8000` nel browser.

## Deploy su GitHub Pages

Essendo un sito statico, GitHub Pages è ideale (fornisce anche l'HTTPS necessario alla PWA):

1. Fai push del repository su GitHub.
2. **Settings → Pages**.
3. In *Build and deployment* seleziona **Deploy from a branch**, scegli il branch (es. `main`) e la cartella `/ (root)`.
4. Salva: dopo qualche minuto l'app sarà online su `https://<utente>.github.io/<repo>/`.

I percorsi nel progetto sono **relativi** (`./`), quindi funziona anche in una sottocartella come quella di GitHub Pages.

## Uso offline

L'app è pensata per restare utilizzabile senza rete:

- L'**app shell** (HTML, icone, manifest) e i **font** vengono messi in cache: l'app si apre anche offline.
- Tutte le funzioni **locali** (profilo, diario, calendario, storico, check, modifica pasti) funzionano senza rete.
- I pasti registrati **offline** non vengono persi: sono salvati come **"da stimare"** e messi in coda. Al ritorno online un banner permette di **stimare i macro con l'AI** in un colpo solo (in alternativa puoi inserirli a mano).
- Un **indicatore di stato rete** nell'header segnala se sei online o offline.
- Solo le funzioni AI (stima macro, suggerimenti, target) richiedono la connessione.

## Struttura del progetto

```
.
├── index.html      # UI + logica (HTML, CSS e JS inline)
├── manifest.json   # metadati PWA (nome, icone, colori, display)
├── sw.js           # service worker (cache + offline)
└── icons/
    ├── icon-192.png            # icona "any"
    ├── icon-512.png            # icona "any"
    ├── icon-512-maskable.png   # icona maskable (Android)
    ├── icon-512-monochrome.png # themed icon (Android 13+)
    └── icon-apple-180.png      # apple-touch-icon (iOS)
```

## Stack tecnico

- **HTML + CSS + JavaScript vanilla**, singolo file, zero dipendenze e zero build.
- **PWA**: manifest + service worker, installabile e offline-ready.
- **Google Gemini API** per le stime e i suggerimenti.
- **localStorage** per la persistenza (con richiesta di storage persistente via `navigator.storage.persist()`).

## Accessibilità e temi

- Label associate ai campi, `aria-label` sui pulsanti-icona, ruoli `dialog` e gestione del focus (trap del `Tab`, chiusura con `Esc`) sui modali.
- **Dark mode** automatica via `prefers-color-scheme`, con `theme-color` adattivo.
- Rispetto di `prefers-reduced-motion` per chi preferisce meno animazioni.

## Licenza

Nessuna licenza specificata. Se vuoi renderlo open source, aggiungi un file `LICENSE` (ad esempio [MIT](https://choosealicense.com/licenses/mit/)).
