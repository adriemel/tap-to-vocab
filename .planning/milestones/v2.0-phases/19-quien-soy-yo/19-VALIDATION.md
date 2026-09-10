---
phase: 19
slug: quien-soy-yo
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-08
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual browser verification (no automated test framework in project) |
| **Config file** | none |
| **Quick run command** | `python3 -m http.server 8000` then open `http://localhost:8000/quien-soy.html` |
| **Full suite command** | Same — full 14-question run + end screen + all 3 end-screen buttons |
| **Estimated runtime** | ~5 minutes manual |

---

## Sampling Rate

- **After every task commit:** Open `http://localhost:8000/quien-soy.html`, click through 3 questions minimum
- **After every plan wave:** Full 14-question run + end screen + all 3 end-screen buttons
- **Before `/gsd-verify-work`:** Full flow verified including TTS
- **Max feedback latency:** 5 minutes

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Secure Behavior | Test Type | Verification | Status |
|---------|------|------|-------------|-----------------|-----------|--------------|--------|
| 19-01-01 | 01 | 1 | DATA-01 | static file, same origin | manual | quien-soy-sentences.txt re-encoded UTF-8, file in /data/, all 14 rows parse without garbled characters | ⬜ pending |
| 19-01-02 | 01 | 1 | CHAT-01 | N/A | manual | "Quién soy yo" button visible on index.html below "Qué número es?" row | ⬜ pending |
| 19-01-03 | 01 | 1 | CHAT-02, CHAT-03 | N/A | manual | First question appears as left grey bubble on load; two choice buttons visible in answer strip | ⬜ pending |
| 19-01-04 | 01 | 1 | CHAT-04, CHAT-05, CHAT-06 | N/A | manual | Tapping choice appends right blue bubble; next question appears after ~1.2s; chat scrolls to latest | ⬜ pending |
| 19-01-05 | 01 | 1 | AUDIO-01, AUDIO-02 | N/A | manual | TTS speaks question on appear; TTS speaks chosen answer ~400ms after tap | ⬜ pending |
| 19-01-06 | 01 | 1 | END-01, END-02, END-03 | N/A | manual | End screen appears after Q14; full paragraph displayed; TTS auto-reads on load | ⬜ pending |
| 19-01-07 | 01 | 1 | END-04, END-05, END-06 | N/A | manual | Replay re-reads paragraph; Start Again resets to Q1; Home navigates to index.html | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

None — no test framework to install. All validation is manual browser testing. Existing infrastructure (python3 http.server) covers all phase requirements.

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Button on home screen | CHAT-01 | Visual UI check | Serve site, open index.html, confirm "Quién soy yo" button below "Qué número es?" row |
| Left grey bubble on load | CHAT-02 | Visual UI check | Open quien-soy.html, confirm first question appears as left-aligned grey bubble |
| Two answer buttons | CHAT-03 | Visual UI check | Confirm two `.qs-choice` buttons visible in fixed bottom strip |
| Right blue bubble on tap | CHAT-04 | User interaction | Tap a choice, confirm answer appears as right-aligned blue bubble |
| Next question delay | CHAT-05 | Timing behavior | Confirm next question appears ~1.2s after tapping |
| Chat scroll follows | CHAT-06 | Scroll behavior | Answer several questions, confirm latest bubble stays visible |
| TTS speaks question | AUDIO-01 | Audio — browser API | Listen after page load; Spanish voice must speak question text |
| TTS speaks answer | AUDIO-02 | Audio — browser API | Listen ~400ms after tap; Spanish voice speaks chosen answer |
| End screen after Q14 | END-01 | Flow completion | Answer all 14 questions, confirm hard swap to end screen |
| Full paragraph correct | END-02 | Content accuracy | Verify all 14 chosen answers joined + "¡Muchas gracias por escuchar!" |
| TTS auto-reads end | END-03 | Audio — browser API | Listen on end screen load, confirm TTS starts within 300ms |
| Replay re-reads | END-04 | Audio — button | Tap "↺ Replay", confirm TTS restarts from beginning |
| Start Again resets | END-05 | Navigation/state | Tap "Empezar de nuevo", confirm chat clears and Q1 bubble loads |
| Home navigates | END-06 | Navigation | Tap "Inicio", confirm redirect to index.html |
| Data from file | DATA-01 | Content accuracy | Compare question text in UI against quien-soy-sentences.txt rows |

---

## Validation Sign-Off

- [ ] All tasks have manual verify steps
- [ ] Sampling continuity: browser check after each task commit
- [ ] No automated Wave 0 needed (no test framework in project)
- [ ] TTS tested on real browser (not just visual)
- [ ] Full 14-question flow verified end-to-end
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
