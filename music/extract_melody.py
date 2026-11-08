"""Extract the sung melody from the vocal stem -> game/music/melody_raw.json
notes: [{s,e,m,line}] (seconds, MIDI pitch). Run with analysis/.venv/bin/python -I."""
import json, numpy as np, librosa
from pathlib import Path
R = Path(__file__).resolve().parents[2]
y, sr = librosa.load(R/"analysis/out/htdemucs/song/vocals.wav", sr=22050, mono=True)
HOP = 256
f0, vf, vp = librosa.pyin(y, fmin=librosa.note_to_hz("C3"), fmax=librosa.note_to_hz("C6"), sr=sr, frame_length=2048, hop_length=HOP)
t = librosa.times_like(f0, sr=sr, hop_length=HOP)
midi = np.where(vf & ~np.isnan(f0), librosa.hz_to_midi(np.nan_to_num(f0, nan=100)), np.nan)
lines = json.load(open(R/"video/public/lyrics.json"))["lines"]
notes = []
for li, L in enumerate(lines):
    a, b = L["start"] - 0.1, L["end"] + 0.25
    idx = np.where((t >= a) & (t <= b))[0]
    cur = None
    for i in idx:
        m = midi[i]
        if np.isnan(m):
            if cur and t[i] - cur["last"] > 0.09:
                notes.append(cur); cur = None
            continue
        if cur and abs(m - np.median(cur["v"][-6:])) < 0.8 and t[i] - cur["last"] < 0.12:
            cur["v"].append(m); cur["last"] = t[i]
        else:
            if cur: notes.append(cur)
            cur = {"s": t[i], "v": [m], "last": t[i], "line": li}
    if cur: notes.append(cur)
out = []
for n in notes:
    d = n["last"] - n["s"] + 0.012
    if d < 0.07: continue
    out.append({"s": round(float(n["s"]), 3), "e": round(float(n["s"] + d), 3), "m": round(float(np.median(n["v"])), 2), "line": n["line"]})
json.dump(out, open(R/"game/music/melody_raw.json", "w"))
print(len(out), "notes")
for li in (12, 13, 14, 15, 16, 17, 18, 19):
    print(li, lines[li]["text"], [(round(n["s"], 2), round(n["e"]-n["s"], 2), librosa.midi_to_note(round(n["m"]))) for n in out if n["line"] == li])
