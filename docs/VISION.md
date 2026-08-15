# Astro Sumi — Epic Mythos Vision

A world-class writing and reading webapp for a high-fantasy space epic.

This is the north-star document: product thesis, exhaustive wishlist, content model, architecture, and a phased plan. Phase 1 begins immediately after this file lands. Later phases should be checked against this document, not invented ad hoc.

---

## 0. Why this exists

Astro Sumi is currently a **beautiful novel reader**: novels, volumes, chapters, typography, drafts, RSS, comments. That is a book website.

A Tolkien-scale epic is not only a book. It is a **mythos you can walk**:

* a reading path through the ages
* people you can meet without spoiling their fate
* places you can stand on, then zoom out to the stars
* tongues, calendars, banners, relics, songs
* maps that change as history moves
* a private vault where the author keeps canon, secrets, and continuity

The destination is a site that feels like opening the Red Book of Westmarch *and* a star atlas at the same time.

Working title for the public surface: **the Codex**. Working title for the private surface: **the Studio**.

---

## 1. Product thesis

### 1.1 One sentence

A git-native mythos: write the epic in markdown, publish a sacred reading chamber, and let readers inhabit the world through cards, gazetteers, maps, and appendices.

### 1.2 Who it is for

**Primary:** you, writing a high-fantasy space epic (bronze villages to starlight empires, reincarnated souls, a Darkness that outlives civilizations).

**Secondary:** a small circle of readers, later a public audience.

**Not primary (yet):** a multi-tenant Wattpad clone, a paid writing SaaS, or a collaborative wiki for strangers.

### 1.3 What "world class" means here

Not feature-count. Atmosphere plus navigable depth.

* The prose is the altar. Chrome never shouts over the sentence.
* Every proper noun can become a door.
* Spoilers are a first-class design constraint, not a disclaimer.
* Art, maps, and appendices feel *canonical*, not blog-sidebar.
* The same files that publish the site are the author's source of truth.
* The UI can shift with the Age the reader is in (bronze firelight → void-ink starlight).

### 1.4 Dual product, one vault

| Surface | Audience | Job |
| --- | --- | --- |
| **Codex / Reader** | anyone | Read, wander, look up, not get spoiled |
| **Studio** | author | Outline, canon, secrets, continuity, art pipeline |

Both read the same markdown collections. Studio simply sees `visibility: secret` and draft fields the public build strips out.

### 1.5 Genre-specific truth

This is not only Middle-earth. Space-fantasy needs **nested scale**:

`void → galaxy → sector → system → world → region → city → hall / ship deck`

A map feature that only does continents will fail the story. The atlas is an orrery *and* a valley.

The sample cycle *Echoes of Eternity* already spans twelve ages from bronze to starlight. Treat that as the design fiction until the real epic replaces it.

---

## 2. Current baseline (honest audit)

### 2.1 What already works

* Astro 5 static site, Bun, Tailwind 4, shadcn/ui, TypeScript, Vitest
* Content collections: `novels`, `chapters`, `authors`
* Hierarchy: novel → volume → chapter, with `volumeTitle`, `pageBreaks`, word counts, drafts
* Reading chamber: `.reading-content` typography, prev/next, progress ring, page-jump overlay
* Font toggle (Geist, Noto Sans, handwritten) and light/dark theme
* Novel hub: cover slot, stats, genres, tags, chapter grid by volume
* Giscus comments, RSS, sitemap, SEO head, service worker
* GitHub Pages `base` path handling via `withBase()`
* Academic leftover: KaTeX, theorem/lemma callouts (from astro-erudite)

### 2.2 What is empty

* No characters, locations, factions, species, artifacts, languages, maps, or timeline as data
* Almost no story art (placeholder author SVG)
* Homepage is still "Novel Writing Template"
* No wiki links in prose
* No spoiler model
* No reader progress beyond a per-page scroll ring
* No search
* Callouts are for textbooks, not prophecies
* Ten sample novels compete; a mythos site wants **one cosmos**

### 2.3 Architectural bets we keep

* Markdown + git remain the vault. No CMS until the world model is stable.
* Static generation remains the default. Islands hydrate only where needed (maps, hover cards, reading settings).
* New lore is new **content collections**, not a database.
* Cross-links use wiki syntax in the prose, resolved at build time.

---

## 3. Design principles

1. **Prose first.** Any feature that cannot sit quietly beside a paragraph is optional.
2. **Canon is data.** If it matters, it is a file with a schema, not a paragraph trapped in a chapter.
3. **Spoilers are structural.** Public cards show what a first-time reader of the current chapter may know.
4. **Names are doors.** `[[Kael]]` is the fundamental interaction.
5. **Scale is nested.** Every place may have a parent place.
6. **Ages are skins.** Volume metadata can restyle type, color, ornaments, map overlays.
7. **Art is canon.** Portraits, plates, sigils, and map tiles live in the repo with the people they depict.
8. **One cosmos.** Multiple novels are allowed (side tales, silmarillion, ship logs) but they share the Codex.
9. **Git is the backup brain.** Diffs of canon should be readable in pull requests.
10. **Accessible myth.** Keyboard, screen readers, reduced motion, readable contrast even in "void" themes.
11. **Fast like a book.** First chapter paints in a blink. Maps lazy-load. No 20 MB homepage.
12. **Secret ≠ deleted.** Author-only notes exist in the vault and never emit to `dist/`.

---

## 4. Reader journeys

### 4.1 First-time reader

Lands on a cinematic home. One prophecy line. **Begin Volume I.** Reads Chapter 1 in a quiet column. Taps *Kael*, sees a hunter with a bronze spear and no future lives. Opens a valley map. The north is already wrong. Continues.

### 4.2 Returning reader

"Continue reading" restores chapter + scroll. Optionally restores last atlas pin. Can switch to **Codex** and filter "only what I have unlocked."

### 4.3 Scholar / rereader

Turns spoilers **on**. Reads genealogies, reincarnation chains, the Age of Starlight overlay of the same valley as a crater-port. Follows the Mage through every incarnation as a custom reading path.

### 4.4 Wanderer (does not read in order)

Enters via Atlas or People. Every entity page offers "first appearance" and "start reading here" with a spoiler warning.

---

## 5. Author journeys

### 5.1 Daily writing

Open `src/content/chapters/...md`. Write. Use `[[character:kael]]` when a name should be a door. Preview locally. Commit.

### 5.2 Worldbuilding day

Add or edit a Codex file. Fill short bio (card) and long body (dossier). Link relationships. Drop a map pin coordinate. Mark `visibility: spoiler` until the reveal chapter.

### 5.3 Continuity pass

Studio linter reports: name spelled three ways; dead character speaking; location parent missing; wiki link to unknown slug; word count drift vs frontmatter.

### 5.4 Release

Set `draft: false`, `publishDate`. Static build. RSS item. Optional newsletter.

---

## 6. Information architecture

### 6.1 Public routes (target)

```text
/                          mythos home (not a template landing)
/novels                    works in this cosmos
/novels/:novel             volume & chapter index + "enter the world"
/novels/:novel/:vol/:ch    reading chamber

/codex                     Codex hub (search + featured)
/codex/people              character index
/codex/people/:id          character folio
/codex/places              gazetteer index (tree + cards)
/codex/places/:id          location dossier
/codex/factions            houses, orders, villages, fleets
/codex/factions/:id
/codex/kindreds            species / peoples
/codex/kindreds/:id
/codex/relics              artifacts, ships, weapons
/codex/relics/:id
/codex/atlas               nested maps
/codex/atlas/:mapId
/codex/annals              timeline
/codex/tongues             languages
/codex/tongues/:id
/codex/arts                magic / physics / aether
/codex/glossary
/codex/library             in-world documents, songs, prophecies, logs
/codex/library/:id
/art                       artbook / plates / wallpapers

/authors, /about, /tags    remain
/studio/*                  author-only, never public-hosted without auth
```

Nav target: **Read · Codex · Atlas · Annals · Art · About**

Early phases ship a subset. Dead-end "coming soon" pages are allowed only on the Codex hub as clearly labeled locked doors, not as empty routes.

### 6.2 Content vault layout

```text
src/content/
  novels/
  chapters/
  authors/
  characters/
  locations/
  factions/
  species/
  relics/
  maps/
  events/          timeline
  languages/
  terms/           glossary
  documents/       songs, prophecies, logs, inscriptions
  studio/          private notes (gitignored or build-excluded)
```

### 6.3 URL and slug rules

* File slug is the canonical id: `kael.md` → `kael`
* Wiki link: `[[kael]]`, `[[character:kael]]`, `[[character:kael|the hunter]]`
* Prefer explicit kind when two entities share a name
* Unqualified `[[kael]]` resolves in order: character → location → faction → species → relic → term → document

---

## 7. Content model

Shared fields on almost every entity:

| Field | Purpose |
| --- | --- |
| `name` | Display name |
| `aliases` | Other names, epithets, ancient names |
| `novel` | Primary work (optional for cosmos-wide entities) |
| `shortBio` | Card text, spoiler-safe by default |
| `visibility` | `public` / `spoiler` / `secret` |
| `revealedIn` | Chapter id after which public pages may show spoiler fields |
| `draft` | Exclude from production |
| `tags` | Facets |
| `era` | Age name (Age of Bronze, Age of Starlight, …) |
| `image` | Portrait, plate, or banner |

Long lore always lives in the markdown **body**, not in a giant YAML novel.

### 7.1 Character (`characters`)

* `titles[]`, `pronouns`
* `role`: protagonist, deuteragonist, supporting, antagonist, mentioned, mythic
* `status`: alive, dead, unknown, mythic, reincarnating
* `species` → species id
* `home` → location id
* `allegiance[]` → faction ids
* `relationships[]`: `{ person, kind }` where kind is bonded, blood, mentor, rival, incarnation, oath, crew, …
* `incarnationOf` → character id (the eternal soul)
* `portrait`, `sigil`
* Voice notes, first appearance (computed if omitted)

**Folio UI:** monogram or portrait, titles, spoiler-safe blurb, full dossier, relationship graph, appearances list, incarnation timeline.

### 7.2 Location (`locations`)

* `kind`: galaxy, sector, system, world, region, city, site, ship, station, other
* `parent` → location id (nesting)
* `climate`, `government`, `population` (optional strings; this is myth, not a census)
* `coords` `{ x, y, map }` for atlas pins
* `alsoKnownAs` across ages (same crater, new name)

**Dossier UI:** landscape plate, map inset, parent/child places, who lives here, scenes set here.

### 7.3 Faction (`factions`)

* `kind`: village, house, order, empire, cult, crew, fleet, guild, other
* `motto`, `banner`, `headquarters`
* Members derived from characters' `allegiance`

### 7.4 Species (`species`)

* Lifespan, homeworld, magic/tech affinity, culture notes
* Used by character cards as a chip that links to a kindred page

### 7.5 Relic (`relics`)

* `kind`: weapon, ship, jewel, book, engine, relic, other
* `bearers[]`, `origin`, `curse` (often spoiler)
* The One-Ring energy: provenance is the story

### 7.6 Map (`maps`)

* `kind`: star-chart, system, world, region, city, cutaway
* `parentMap`, `image` or tile source, `bounds`, GeoJSON/SVG overlay path
* Pins are locations with `coords.map === this id`

### 7.7 Event (`events`)

* `date` (in-world calendar string + optional sortable key)
* `era`, `location`, `participants[]`
* Timeline entries: wars, awakenings, launches, fall of cities

### 7.8 Language (`languages`)

* Phonology notes, script image, naming rules, lexicon entries (or nested `terms`)

### 7.9 Term (`terms`)

* Glossary: Aether, the Bond, the Darkness, jump-wake, bronze-true, …
* Hover definition in prose via `[[term:the-bond]]`

### 7.10 Document (`documents`)

* `kind`: song, prophecy, log, letter, inscription, law, translation
* Quoted in chapters; full text in the Library
* Translator notes as callout variant

### 7.11 Chapter additions (later)

* `pov` → character id
* `setting[]` → location ids
* `era`
* `summary` already exists (use as spoiler-safe recap)
* `atmosphere`: bronze | iron | steam | void | starlight (drives theme)

### 7.12 Novel additions (later)

* `cosmos` id if multiple worlds ever appear
* `seriesOrder`
* `codexEnabled`
* Cover, banner, sigil, theme overrides

---

## 8. Exhaustive feature catalog

Status key used in the plan: **Now** (Phase 1), **Next**, **Later**, **Dream**.

### 8.1 Reading chamber

* [x] Long-form typography, page breaks, prev/next, progress ring, font + theme toggle
* **Now:** wiki links in prose; chapter "present in this scene" rail
* **Next:** reading settings drawer (size, measure, line-height, themes: parchment, void-ink, bronze, starlight)
* **Next:** continue-reading (localStorage: novel, chapter, scroll)
* **Next:** immersive mode (hide chrome)
* **Next:** epic callouts replacing academic ones: Prophecy, Codex, Translation, Captain's Log, Forbidden, Song
* **Next:** footnotes as a scholar's side panel
* **Next:** keyboard `j`/`k` chapters, `m` atlas, `?` help
* **Later:** age-aware atmosphere (type + ornaments follow volume era)
* **Later:** drop caps / illuminated initials
* **Later:** verse/song blocks with optional audio
* **Later:** print stylesheet, EPUB/PDF per volume
* **Later:** offline PWA cache of volumes (service worker already exists)
* **Dream:** optional ambient audio beds (wind, hull, choir) with reduced-motion/off default
* **Dream:** two-page spread mode on wide screens

### 8.2 Wiki linking (the nervous system)

* **Now:** `[[slug]]`, `[[kind:slug]]`, `[[kind:slug|label]]`
* **Now:** unresolved links fail visibly in dev (and tests)
* **Now:** hover card with portrait/monogram, name, titles, shortBio
* **Next:** `#anchor` inside entity pages (`[[location:thornhaven#the-well]]`)
* **Next:** piped labels and pluralization helpers
* **Later:** backlinks panel on every entity ("mentioned in")
* **Later:** build-time link graph visualization for Studio

### 8.3 Character cards and folios

* **Now:** collection, index, folio page, card component, hover card
* **Now:** role, status, home, allegiance, relationships, incarnationOf
* **Now:** appearances inferred from wiki mentions in chapters
* **Next:** spoiler-stripped vs scholar mode
* **Next:** incarnation timeline (the five souls across ages)
* **Later:** relationship graph (oaths, blood, rivalry)
* **Later:** voice samples / quoted lines
* **Later:** "read this person's POV chapters" path
* **Dream:** illustrated dossier PDF export

### 8.4 Location profiles (gazetteer)

* **Now:** nested `kind` + `parent`, index, dossier, cards
* **Now:** child places list, scenes-set-here from mentions
* **Next:** ancient vs current names
* **Next:** coords hooked to atlas pins
* **Later:** weather/aether/gravity flavor fields rendered as a small plate
* **Later:** city and ship cutaways
* **Dream:** time-slider on the same place across ages

### 8.5 Atlas / maps

* **Next (Phase 3):** one static world/region map with SVG or image + pins
* **Next:** spoiler-aware pins; "reveal all" toggle
* **Next:** click pin → dossier
* **Later:** star chart (constellations, jump routes, forbidden zones)
* **Later:** system orrery (orbits, holy moons, stations)
* **Later:** route overlay ("Kael's path in Volume 1")
* **Later:** GeoJSON in git, MapLibre for large worlds
* **Dream:** 3D globe / WebGL orrery
* **Dream:** reader-drawn annotations on maps
* **Dream:** map plates as printable inserts

### 8.6 Annals (timeline)

* **Later:** vertical timeline of eras, wars, awakenings, launches
* **Later:** dual dating (imperial years vs star-cycles)
* **Later:** filter by character, faction, world
* **Dream:** synchronized map + timeline ("watch the empire spread")

### 8.7 Tongues, magic, physics

* **Later:** language pages, scripts, naming generators for Studio
* **Later:** lexicon hover in prose
* **Later:** magic/aether/tech appendix with spoiler layers (what readers know vs how it actually works)
* **Dream:** playable naming or glyph toy
* **Dream:** audio pronunciation

### 8.8 Relics, ships, bestiary

* **Later:** relic folios with bearer history
* **Later:** ship schematics
* **Later:** bestiary (shadow-wolves *and* void-things)
* **Dream:** interactive schematic hotspots

### 8.9 Library (in-world documents)

* **Later:** songs, prophecies, captain's logs, laws, translations
* **Later:** quote a document in a chapter with a link to the full text
* **Dream:** "found manuscript" layout (stains, damaged lines, redacted glyphs)

### 8.10 Visuals and artbook

* **Next:** consistent monogram system so cards look designed before portraits exist
* **Next:** sigils as inline SVG
* **Later:** portrait pipeline, volume plates, chapter headpieces
* **Later:** `/art` gallery with downloadable wallpapers, credits
* **Later:** art direction bible (palette, costume, architecture per age)
* **Dream:** commissioned + generated drafts in private folders; only human-canon in public

### 8.11 Search and wayfinding

* **Next:** client-side search over Codex + chapter titles (Pagefind or tiny Fuse index)
* **Later:** full-text chapter search
* **Later:** "who is this?" palette (`/` command)
* **Later:** breadcrumbs that include Codex kind

### 8.12 Spoilers and reading progress

* **Now:** `visibility` + `shortBio` always safe; body may contain more
* **Next:** reader preference: first-time / caught-up / scholar
* **Next:** hide spoiler entities from indexes until `revealedIn` is reached (progress in localStorage)
* **Later:** account sync
* **Dream:** per-paragraph spoiler blinds in Codex articles

### 8.13 Home, identity, atmosphere

* **Next:** replace template homepage with mythos hero (prophecy + Begin)
* **Next:** title treatment, sigil, age-aware CSS tokens
* **Later:** motion: one comet, one page-turn, then silence
* **Later:** sound off by default

### 8.14 Community

* [x] Giscus on chapters
* **Later:** spoiler tags in comments
* **Later:** private annotations / highlights
* **Later:** quote bookmarks
* **Dream:** margin notes shared with a trusted circle

### 8.15 Export and publishing

* [x] RSS, sitemap
* **Later:** EPUB per volume with map plates
* **Later:** PDF "codex booklet"
* **Later:** newsletter hook on new chapter
* **Dream:** typeset print edition from the same markdown

### 8.16 Studio (author)

* **Later:** local `/studio` index of drafts, secrets, broken links
* **Later:** continuity linter
* **Later:** mention index
* **Later:** word counts by POV, location, era
* **Later:** outline / series bible pages
* **Dream:** in-browser MDX editor
* **Dream:** kanban of volumes
* **Dream:** AI as a *private* naming/continuity assistant that cannot publish

### 8.17 Accessibility, i18n, performance, SEO

* **Now:** semantic lists, headings, keyboard-focusable wiki links
* **Next:** hover cards also available on focus (not hover-only)
* **Later:** reduced-motion atlas
* **Later:** constructed-language pages still have English glosses
* **Later:** OG images per character/location (generated)
* **Later:** JSON-LD for Book and Person
* Always: no layout shift from webfonts; maps not on the critical path

### 8.18 Things we are not building soon

* User accounts, payments, DRM
* Multi-author realtime collab
* A general-purpose World Anvil clone for other writers
* Algorithmic recommendations
* Comments on every Codex page (too much spoiler surface)
* Heavy 3D before one excellent 2D map exists

---

## 9. Technical architecture

### 9.1 Stack (keep)

Astro 5 content collections + MDX, Tailwind 4, React islands only where state lives, Vitest for parsers and content queries.

### 9.2 Wiki pipeline

1. Remark plugin walks text nodes, splits `[[...]]` into mdast link nodes
2. Links get `class="wiki-link"` plus `data-wiki-kind` and `data-wiki-slug`
3. `href` includes `BASE_URL`
4. Unqualified slugs resolve via a filesystem slug index (no circular `getCollection` during remark)
5. Chapter pages extract mentions from raw markdown for the presence rail
6. Layout (or Codex layout) injects a small JSON index for hover cards

### 9.3 Spoiler compiler (future)

Public `getCollection` helpers drop `visibility: secret` always, and drop `visibility: spoiler` unless the build is Studio or the reader preference says scholar. Secret files may live under `src/content/studio/` and be omitted from the production glob.

### 9.4 Maps (future)

Start with a single image or SVG + absolutely positioned pins from `locations.coords`. Promote to MapLibre when a world outgrows one plate. Star charts are a separate canvas, not a Mercator abuse.

### 9.5 Search (future)

Phase 2: filter the Codex JSON in the browser. Phase 4: Pagefind over HTML.

### 9.6 Testing

* Unit tests for wiki parse/resolve (no Astro runtime required)
* Integration tests for new collections alongside existing novel/chapter tests
* A fixture chapter that contains every wiki kind

---

## 10. Phased plan

### Phase 0 — Plan (this document)

Done when `docs/VISION.md` is in git and the team agrees Phase 1 scope.

### Phase 1 — Codex of people and places (start now)

**Goal:** names become doors. The world has a gazetteer even before a map.

Ship:

1. Collections: `characters`, `locations`, `factions`, `species`
2. Schemas with relationships, nesting, visibility, shortBio
3. Remark wiki-link plugin + slug resolver + unit tests
4. Codex hub + indexes + dossier/folio pages
5. Card components with monogram fallbacks
6. Hover cards on wiki links (mouse + keyboard focus)
7. Chapter presence rail: people and places in this chapter
8. Nav link: Codex
9. Seed *Echoes of Eternity* Age of Bronze: the Five, Thornhaven, the northern forest/pass, the Darkness, kindreds
10. Wiki-link Chapter 1–2 of Echoes
11. Novel page doorway into the Codex filtered by that work

**Done when:** a reader can finish Chapter 1, hover Kael, open Thornhaven, see child places and the Five, and never see Age of Starlight spoilers in card text.

### Phase 2 — Reading chamber + identity

* Mythos homepage (prophecy hero, not template copy)
* Epic callouts; scholar footnotes panel
* Reading settings + continue-reading
* Focus-visible hover cards polish, mobile sheet instead of hover
* Search/filter on Codex hub
* Sigil + CSS tokens for bronze vs void (even if only two themes)

### Phase 3 — Atlas v1

* `maps` collection
* `coords` on locations
* One region map (Thornhaven valley + northern forest) with spoiler pins
* Atlas index page
* Pin → dossier; optional path polyline later

### Phase 4 — Annals, glossary, library, relics

* Events timeline
* Terms + hover definitions
* Documents (prophecy of the Five, songs)
* Relics/ships collection
* Backlinks on every entity

### Phase 5 — Star chart and ages

* System/star map
* Era overlay / time slider on the Thornhaven plate
* Atmosphere themes per volume
* Incarnation timeline UI for the Five

### Phase 6 — Art, export, PWA

* Portrait and plate pipeline
* Artbook route
* EPUB/PDF
* Offline volumes

### Phase 7 — Studio

* Private notes, continuity linter, mention index, broken wiki report
* Word-count dashboard by POV/place/era
* Optional auth gate if ever hosted

### Phase 8 — Dream layer

* Orrery, audio beds, found-manuscript layouts, generated OG art, collaborative margin notes

Each phase is a mergeable slice. Do not start Phase 3 until Phase 1 is actually live in the reading path.

---

## 11. Phase 1 acceptance criteria

* `/codex` exists and lists people, places, factions, kindreds
* `/codex/people/kael` (or `/codex/characters/kael`) renders a folio
* `/codex/places/thornhaven` renders a dossier with parent/child if modeled
* `[[Kael]]` / `[[character:kael|Kael]]` in a chapter becomes a styled link
* Hover/focus shows a spoiler-safe card
* Chapter 1 of Echoes shows a presence rail
* `visibility: public` seed data only; no reincarnation endings in shortBios
* Wiki parser tests pass
* `bun run build` succeeds
* Keyboard can reach wiki links and the hover card does not trap focus

### Phase 1 non-goals

Maps, search, homepage redesign, Studio, accounts, 3D, audio, EPUB.

---

## 12. Seed canon (Phase 1 fiction)

Use *Echoes of Eternity* as the design cosmos until the real epic replaces it.

**The Five**

* Kael — the Warrior, hunter of Thornhaven
* Lyssa — the Healer
* Mira — the Mage
* Ryn — the Shadow
* Aria — the Seer

**Thornhaven circle:** Kael the Elder (bronze-smith), Elder Thom, and only mention-level others if needed.

**Places:** Thornhaven valley, Thornhaven village, northern forest, northern pass.

**Factions:** People of Thornhaven, the Five, the Darkness.

**Kindreds:** humans of the bronze age; shadow-creatures (public: "corrupted beasts in the north," no cosmology dump).

**Wiki style in prose:** link first or important mentions, not every repetition in a paragraph.

---

## 13. Open questions (do not block Phase 1)

1. Real epic title, sigil, and whether sample novels besides Echoes remain in the repo
2. Whether Codex URLs are `/codex/people` (poetic) or `/codex/characters` (literal). Phase 1 may use literal collection names and alias later
3. Hosted Studio vs local-only
4. How strict spoiler locking is before reader progress exists (Phase 1: honor `visibility` + safe shortBios only)
5. Art pipeline: human only vs private generated drafts
6. Single cosmos vs keeping the template's multi-novel bookstore forever

---

## 14. Success metrics (qualitative)

* You prefer writing *in* this repo to writing in a doc and pasting later
* A first-time reader never learns a fate from a card
* A rereader can get lost in the Codex for an hour without opening a chapter
* A map screenshot looks like it belongs to the book
* Adding a new person is: one markdown file, a wiki link, a commit

When those are true, the site has become a world.
