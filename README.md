# Światłobuty skrzydłoloty – the game
- Play: open `../Swiatlobuty-gra-v0.1.html` (single file, works offline) or `npm run dev`.
- Build: `npm run build` (-> dist/index.html, one file).
- Music: `music/compose.py` writes `music/midi/*.mid` (+ `src/midiData.ts`); the game parses the .mid files itself and plays them with a WebAudio synth.
  Regenerate: `analysis/.venv/bin/python -I game/music/compose.py`. Theme read off the vocal stem with `music/extract_melody.py`.
- Debug: append `?fast=1#level3` (or `#intro`, `#outro`) to jump around; `?fast=1` scrolls 6x faster.
- Art is copied from `video/src/art`, plus a new `art/Krakow.tsx`.
