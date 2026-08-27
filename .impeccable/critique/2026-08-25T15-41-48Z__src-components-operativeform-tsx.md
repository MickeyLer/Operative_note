---
target: OperativeForm.tsx
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-08-25T15-41-48Z
slug: src-components-operativeform-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 2/4 | No unsaved-changes indicator; validation errors don't deep-link to the offending step; async saves use spinners but no persistent confirmation |
| 2 | Match System / Real World | 3/4 | Precise surgical terminology (HN/AN, CHD, ICG, PJ anastomosis) mirrors real paper charts; minor friction from inconsistent EN/TH bilingual labels |
| 3 | User Control and Freedom | 1/4 | Back button silently discards all input; tab navigation is hard-blocked by native `alert()`; no undo for deleted checklist steps or ports |
| 4 | Consistency and Standards | 2/4 | Interaction model diverges sharply between desktop (hover + HTML5 DnD) and mobile (swipe-delete + touch-drag); scaled A4 CSS transforms fragile on mobile |
| 5 | Error Prevention | 2/4 | Print blocked on unresolved placeholders ✓; saving permitted with empty HN/AN/surgeon fields; no router-leave guard |
| 6 | Recognition Rather Than Recall | 3/4 | Inline bracket selectors are excellent recognition; collapsed steps bury choices inside long paragraphs requiring full read |
| 7 | Flexibility and Efficiency of Use | 2/4 | Custom template save is great; zero keyboard shortcuts (Ctrl+S, Esc, tab-flow), no bulk check/uncheck |
| 8 | Aesthetic and Minimalist Design | 2/4 | Findings tab is a dense wall of inputs with uniform visual weight; dual-header structure wastes vertical space; primary buttons compete visually |
| 9 | Error Recovery | 2/4 | Native `alert()` dialogs name the problem in Thai but don't scroll to the offending element; DB errors expose raw developer messages |
| 10 | Help and Documentation | 1/4 | No tooltips, no onboarding, no documentation; swipe-to-delete and bracket-selector interactions are completely undiscoverable |
| **Total** | | **20/40** | **Acceptable** — significant improvements needed |

## Design Specificity Verdict

**LLM assessment (Assessment A):** Grounded and highly specific in *function*, category-interchangeable in *style*. Clinical capabilities — ICG R-15/FLR inputs, laparoscopic port coordinate mapper, hepatobiliary lymph node staging codes, Thai HN/AN IDs — could not be lifted unchanged into another product. But the visual language is generic blue Tailwind corporate admin. No color, type, or layout decision communicates "surgical precision at a Thai regional hospital" vs "any SaaS form."

**Deterministic scan (Assessment B):** The detector ran across the full `src/` directory and returned **0 findings** (exit code 0, clean). This is consistent with the codebase using Tailwind utility classes rather than inline style anti-patterns the detector targets. The absence of detector flags does not indicate design quality — it indicates absence of the specific pattern set the tool checks. The LLM review is the dominant signal here.

**Browser visualization:** Not available this session (no browser automation tool exposed); no overlay generated.

## Overall Impression

The form is a serious, purpose-built clinical tool doing hard things well at the functional level. The bracket placeholder selector is genuinely innovative UX for surgical documentation. But the interface is one bad click away from catastrophe — there is no unsaved-changes guard, and a surgeon who accidentally hits the back button after ten minutes of detail entry loses everything. That single gap is the most urgent thing on this entire form. Beyond the P0, the Findings tab needs architectural surgery of its own: it is a wall of dense inputs that will cause input errors in a high-stress operating context.

## What's Working

1. **Interactive bracket selectors** (`<5-0 PDS/4-0 PDS/vicryl>`) — Outstanding UX pattern matching how surgeons think: select within pre-written clinical sentences rather than typing from scratch. High emotional peak in the journey.
2. **Conditional field gating** — Showing ICG/FLR only for hepatectomies, PD size only for Whipple. Prevents irrelevant clutter when switching procedure types. Correctly reduces cognitive load at the procedure level.
3. **True A4 print simulation** — The print preview matches the physical Khon Kaen Hospital paper chart format precisely. Surgeons can verify exactly what will be filed before committing.

## Priority Issues

### [P0] Silent data loss on navigation
- **What**: The "Back" button and browser refresh discard all form input with zero warning.
- **Why**: Surgeons enter operative notes post-procedure, often under time pressure. Losing 10+ minutes of detailed clinical entry is not recoverable and delays patient chart filing.
- **Fix**: Add a `isDirty` state tracked on any field change. Hook `beforeunload` to warn on page exit. Add a Next.js router guard (`useBeforeUnload` / `router.beforeEach`) that shows an in-app confirmation modal rather than a browser dialog.
- **Suggested command**: `$impeccable harden`

### [P1] Hard-blocking tab navigation via native `alert()`
- **What**: Switching wizard tabs while any checklist placeholder is unresolved fires a native browser `alert()` that blocks the entire page.
- **Why**: Surgeons frequently need to jump non-linearly (e.g. write fresh intraoperative findings before finishing the checklist). Blocking tab changes prevents natural workflow. Native alert dialogs feel archaic and break the app shell.
- **Fix**: Remove the `alert()` call. Allow free tab navigation. Place a red `⚠️` warning badge on the offending tab header. Block only the final Save/Submit button, showing a consolidated error list in a toast or inline panel.
- **Suggested command**: `$impeccable clarify`

### [P1] Mobile interaction failure — swipe-delete and touch-drag
- **What**: Custom swipe-to-delete and touch-drag reordering compete directly with native vertical scroll on mobile/tablet.
- **Why**: Surgeons entering data on tablets will accidentally delete steps while scrolling. The swipe gesture is completely undiscoverable and has no undo. This is a patient safety-adjacent risk: a deleted procedural step could be missed in a future reference.
- **Fix**: Replace swipe-to-delete with a visible explicit delete icon (with a confirmation step). Replace touch-drag with visible reorder handles plus Up/Down arrow buttons on mobile. Add an "Undo last delete" snackbar.
- **Suggested command**: `$impeccable adapt`

### [P2] Findings tab: cognitive overload and visual uniformity
- **What**: The Findings tab presents ICG R-15, FLR, tumor size, margin fields, 9-segment liver grid, tissue consistency, adhesion radios, vascular radios, metastasis checkboxes, free-text notes, photo uploader, and port mapper in a single continuous wall.
- **Why**: 6 of 8 cognitive load checklist items fail on this tab alone. Uniform visual weight gives no hierarchy cue for what's most clinically critical. Surgeons filling this under post-op time pressure will make input errors or skip fields.
- **Fix**: Group findings into distinct visual cards: **"Tumor Staging"**, **"Anatomical Variations"**, **"Port Placement"**. Add section dividers with meaningful subheadings. Apply progressive disclosure: collapse the most-rarely-used inputs (vascular variation detail, adhesion detail) behind a "Show details" toggle.
- **Suggested command**: `$impeccable layout`

### [P2] Port mapper: no keyboard/accessible path
- **What**: Placing laparoscopic ports requires mouse-click or screen-tap on a coordinate canvas. No keyboard support, no fallback data entry.
- **Why**: Surgeons using tablets with stylus pens will find tap accuracy poor. Sam (accessibility-dependent user) cannot use this field at all. Ports cannot be repositioned — they must be deleted and re-placed.
- **Fix**: Add a tabular fallback with region dropdowns (Umbilicus, RUQ, LUQ, etc.) and size selects. Add drag support for repositioning existing ports. Add keyboard focus and arrow-key nudge to the canvas.
- **Suggested command**: `$impeccable adapt`

## Persona Red Flags

### Alex (Expert Surgeon, Power User)
- No `Ctrl+S` hotkey; saving requires mouse click to a specific button. In a flow where both hands are on the keyboard documenting a long procedure, this breaks rhythm.
- Reordering steps requires dragging one-by-one — moving step 12 to position 5 requires 7 drag operations. No keyboard shortcut, no "move to position N" control.
- No bulk check/uncheck for the checklist (e.g. "check all standard steps" then uncheck the two that didn't apply).

### Jordan (First-Timer, Surgical Resident)
- The bracket placeholder system (`<CUSA/Thunderbeat/Harmonic>`) is completely invisible as an interactive affordance — it looks like document text. Jordan will attempt to edit the surrounding textarea directly, corrupting the placeholder string and triggering cryptic validation errors with no pointer to what went wrong.
- Swipe-to-delete is the only way to remove checklist items on mobile, and Jordan will trigger it accidentally while scrolling. There is no undo, no visual indicator that the gesture exists, and no error message — the step simply disappears.

### Dr. Prasit (Project-Specific: Busy Staff Surgeon at KKH)
- **Profile**: 15+ years of experience, performs 3–5 procedures per day, documents under time pressure between OR and clinic. Values speed and reliability above all.
- **Red Flags**:
  - A single misclick on the Back button after completing a complex Whipple note loses everything. No auto-draft, no warning. Will avoid the tool entirely after one such incident.
  - Validation error Thai-language alert (`มีตัวเลือกที่ยังไม่ได้ระบุ`) does not scroll or point to the problem — Dr. Prasit must manually scan the entire checklist to find the unresolved bracket.
  - Print preview layout breaks with 25+ steps, producing a physically unusable printed note.

## Minor Observations

- **Textarea autosize 50ms delay**: The custom autosize logic runs on `setTimeout(50ms)`, causing a visible layout jump on initial render on slower mobile browsers.
- **Print pagination**: No page-break handling. Notes with 25+ steps or long free-text overflow the simulated A4 boundary, producing a physically unusable print.
- **Bilingual inconsistency**: Section headings alternate between English-only (`Patient Demographics`) and bilingual (`ข้อมูลผู้ป่วย`). Pick one convention and apply it uniformly.
- **A4 transform fragility**: The CSS `scale()` transform used to fit A4 on smaller screens is fragile — it does not reflow content, just shrinks it. On narrow phones, the preview becomes unreadably small.

## Questions to Consider

1. *What if the form were a single continuous virtual document — surgeons edit directly in-place on a virtual A4 sheet — rather than a wizard with tab steps?*
2. *Should bracket placeholder interactions be made explicitly discoverable — e.g. highlighted in a distinct color (not just `<angle brackets>`) with a tooltip on first hover?*
3. *Is the laparoscopic port coordinate canvas actually the right tool, or would a quadrant-based selector ("10mm at Umbilicus, 5mm at RUQ") be faster, more accurate on mobile, and easier to store?*
