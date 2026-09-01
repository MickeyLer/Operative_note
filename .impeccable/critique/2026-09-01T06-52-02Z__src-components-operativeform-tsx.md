---
target: src/components/OperativeForm.tsx
total_score: 33
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
timestamp: 2026-09-01T06-52-02Z
slug: src-components-operativeform-tsx
---
Method: dual-agent (A: b11ad82c-089d-4880-9b75-03a143407467 · B: cc8eb832-103f-4541-815d-34d6da02f6d7)

### Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 4 | Excellent use of loading spinners, toast notifications, and AI scanning progress |
| 2 | Match System / Real World | 4 | Terminology, anatomical segments, and surgical presets align with surgeon mental models |
| 3 | User Control and Freedom | 3 | Undo functionality exists, but strict tab-blocking restricts navigational freedom |
| 4 | Consistency and Standards | 3 | Consistent Lucide icons, but custom swipe/drag might deviate from native OS behaviors |
| 5 | Error Prevention | 3 | eforeunload guards data loss; strict placeholders prevent missing details |
| 6 | Recognition Rather Than Recall | 4 | Templates and presets eliminate the need to recall procedural steps |
| 7 | Flexibility and Efficiency | 4 | Shortcuts, template cloning, and AI scanning maximize efficiency |
| 8 | Aesthetic and Minimalist Design | 3 | Clean UI, but sheer volume of fields on certain tabs feels dense |
| 9 | Error Recovery | 3 | Clear inline warnings and pulsing red alerts for unresolved items |
| 10 | Help and Documentation | 2 | Lacks formal help, relying entirely on inline hints and placeholder text |
| **Total** | | **33/40** | **Good** |

### Design Specificity Verdict
**LLM assessment**: Exceptional domain specificity tailored for hepatobiliary and general surgery. Anticipates surgical workflows perfectly with specialized data fields and checklists. Strong technical specificity for mobile/tablet usage in clinical settings.
**Deterministic scan**: The CLI scan found 0 potential static issues.
**Visual overlays**: Skipped live server, browser presentation, and injection. No reliable user-visible overlay is available due to the lack of a browser automation tool in this environment.

### Overall Impression
A highly specialized, well-tailored tool that deeply understands its users' workflows, but suffers from severe architectural bloat. The single biggest opportunity is breaking down the 3,700-line monolithic component to improve performance and maintainability.

### What's Working
1. **Intelligent Domain-Driven Templates**: Built-in procedural templates with regex-based placeholders brilliantly standardize notes while maintaining flexibility.
2. **Clinical Workflow Enhancements**: The AI sticker scanner directly addresses a major pain point in hospital workflows.
3. **Mobile-First Interactions**: Touch-friendly features (swipe-to-delete, drag-and-drop) acknowledge the reality of tablet usage in clinical settings.

### Priority Issues
1. **[P0] Monolithic Architecture & Performance**
   - **Why it matters**: A 3,700-line component with a massive unified state means every keystroke triggers a full re-render, causing catastrophic input lag on lower-end hospital devices.
   - **Fix**: Split into sub-components and migrate to a library like eact-hook-form to isolate re-renders.
   - **Suggested command**: $impeccable optimize

2. **[P1] Restrictive Tab Navigation**
   - **Why it matters**: Hard-blocking users from navigating to "Summary" or "Preview" because of an unresolved checklist item frustrates surgeons who just want to save a draft or preview the current state.
   - **Fix**: Replace hard navigational blockers with soft warnings (e.g., alert icons on the tabs) allowing users to proceed with drafts.
   - **Suggested command**: $impeccable shape

3. **[P2] PDF Generation Strategy**
   - **Why it matters**: Relying on html-to-image to scrape a hidden DOM element is brittle. Screen sizes or mobile browser rendering quirks can easily break the print output.
   - **Fix**: Implement a structured PDF generation library (like @react-pdf/renderer) for reliable layouts.
   - **Suggested command**: $impeccable harden

4. **[P2] Reinventing the Wheel**
   - **Why it matters**: Custom implementation of touch-drag math and swipe-to-delete adds unnecessary bloat and potential bugs.
   - **Fix**: Replace custom implementations with standard libraries like dnd-kit and eact-textarea-autosize.
   - **Suggested command**: $impeccable distill

### Persona Red Flags
**Alex (Power User)**: Will be deeply infuriated when paged for an emergency and blocked from hitting "Preview" or jumping to "Summary" to save a quick draft because of a forgotten suture size selection. The strict validation blocks fast-paced workflows.

**Sam (Maintainer)**: Will experience severe distress debugging state issues or adding features to a 3,700-line file where UI, database queries, and regex parsing are intertwined.

### Minor Observations
- Great touch adding the eforeunload event listener to protect unsaved work (isDirty flag).
- The "Undo" functionality for checklist deletion is an elegant touch.
- Custom liver segment selection buttons are nicely implemented but might become crowded on very small screens.

### Questions to Consider
- If a surgeon wants to document a completely unique, non-standard procedure, does the highly structured, template-driven approach force them into a rigid workflow?
- Why rely on capturing the DOM visually for PDF rendering when a tiny mobile screen might easily break the layout?
