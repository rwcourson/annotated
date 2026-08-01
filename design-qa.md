# Design QA — homepage product showcase

- Spacing reference: `/var/folders/f4/7r6qlts50lj6_rncg4jffq140000gn/T/TemporaryItems/NSIRD_screencaptureui_a8RnPi/Screenshot 2026-08-01 at 5.47.00 PM.png`
- Frame/crop reference: `/var/folders/f4/7r6qlts50lj6_rncg4jffq140000gn/T/TemporaryItems/NSIRD_screencaptureui_uHjlTL/Screenshot 2026-08-01 at 6.08.36 PM.png`
- Implementation capture: `/Users/robert/Code/annotated/.design-qa/sidebar-frame-fixed.png`
- Focused implementation crop: `/Users/robert/Code/annotated/.design-qa/sidebar-frame-fixed-focus.png`
- Focused side-by-side comparison: `/Users/robert/Code/annotated/.design-qa/sidebar-frame-comparison.png`
- Source pixels: 1360 × 348 for the focused frame reference
- Implementation pixels: 1280 × 720 full capture and 610 × 300 focused crop
- QA viewport: 1280 × 720 CSS pixels, desktop state, device scale factor 1
- State: homepage settled after the entrance animation

## Full-view comparison evidence

The full showcase was checked for headline breathing room, preview placement, background treatment, frame scale, and the page/sidebar relationship. The preview remains right-weighted without crossing the showcase boundary.

## Focused comparison evidence

The focused comparison checks the browser frame’s top corners and the visible width of the sidebar. The corrected implementation shows the complete 30% sidebar column and an uninterrupted rounded mask on both top corners.

## Findings

- Resolved P1: the fixed minimum height forced the 1.54:1 preview grid to become 724px wide inside a 572px frame, clipping 152px from the right side and hiding most of the sidebar.
- Resolved P2: the clipped inner canvas made the right edge and corner treatment appear malformed.
- The preview canvas now measures exactly 572px wide inside its 572px frame.
- The sidebar occupies 171.6px, or 30% of the visible canvas, and is fully visible.
- The frame uses a consistent 30px desktop radius, isolated overflow masking, and a subtle inset ring.
- No browser console errors were observed.
- Production build completed successfully.

## Comparison history

1. The first pass identified horizontal overflow caused by combining `min-height: 470px` with a 1.54:1 aspect ratio inside a narrower frame.
2. Removed breakpoint minimum heights, made the canvas width authoritative, changed the tracks to a stable 70/30 split, and removed the horizontal translation.
3. Recaptured the section and focused frame. The frame and canvas now share the same width, the full sidebar is visible, and both corners mask cleanly.

## Required fidelity surfaces

- Fonts and typography: unchanged and visually consistent with the established homepage system.
- Spacing and layout rhythm: preview remains right-aligned with clear separation from the copy and no boundary overflow.
- Colors and visual tokens: existing pastel image palette and neutral browser chrome are preserved.
- Image quality and asset fidelity: original high-resolution feed and sidebar screenshots remain in use without stretching or horizontal crop.
- Copy and content: unchanged.

final result: passed
