"""Compose the game's MIDI soundtrack from the song's hook (melody read off the vocal
stem: E minor / G major, hook on B-C-B, 123 BPM). Writes midi/*.mid and ../src/midiData.ts."""
import base64, re, json
from pathlib import Path
import mido

HERE = Path(__file__).resolve().parent
OUT = HERE / "midi"; OUT.mkdir(exist_ok=True)
PPQ = 480
NOTE = {"C": 0, "D": 2, "E": 4, "F": 5, "G": 7, "A": 9, "B": 11}

def pitch(s):
    m = re.match(r"([A-G])(#|b)?(-?\d)$", s)
    return 12 * (int(m.group(3)) + 1) + NOTE[m.group(1)] + (1 if m.group(2) == "#" else -1 if m.group(2) == "b" else 0)

def seq(s):
    """'r2 B4 C5*2' -> [(start_eighth, midi|None, dur_eighths)]"""
    out, t = [], 0
    for tok in s.split():
        d = 1
        if "*" in tok: tok, d = tok.split("*"); d = int(d)
        if tok[0] == "r" and tok[1:].isdigit(): out.append((t, None, int(tok[1:]))); t += int(tok[1:]); continue
        out.append((t, pitch(tok), d)); t += d
    assert t == 8, (s, t)
    return out

# ---- the song's themes (one string = one 4/4 bar in eighths) ----
HOOK = ["r2 B4 B4 B4 C5 B4 B4", "B4 C5 B4 B4 B4 B4 B4 C5", "B4 A4 A4 A4 A4 B4 A4 G4", "G4 G4 G4*2 r2 D4 E4",
        "E4*3 r1 B4 B4 C5 r1", "B4*2 C5 B4*3 r1 B5", "B4*2 B4 B4 B4 A4 G4 A4", "A4*2 A4 B4 C5*2 B4 G4"]
VERSE = ["r1 E4 E4 G4 A4 G4 E4 r1", "G4 A4 B4*2 A4 G4 A4 G4", "E4 G4 C5*2 B4 A4 G4 A4", "A4 G4 F#4*2 E4 D4 E4*2",
         "E4 E4 G4 A4 G4 E4 G4 A4", "B4 A4 G4*2 A4 G4 E4*2", "E4 G4 C5 B4 A4 G4 E4 G4", "A4 F#4 D4*2 E4*2 r2"]
PRE = ["B4*2 B4 B4 A4 G4 A4 G4", "G4 G4 G4 C5*2 C5 B4 B4", "C5*2 C5 C5 B4 A4 B4 C5", "D5*2 B4*2 D5*2 B4*2"]
FANFARE = ["E4*2 B4*2 E5*2 G5*1 r1", "E5*3 r5"]  # Cracow: call that breaks off mid-note (a wink at the Hejnał Mariacki)

CH_EM = ["Em", "C", "G", "D"] * 2          # hook chords (E minor)
CH_VERSE = ["Em", "Em", "C", "D"] * 2
CH_PRE = ["C", "G", "Am", "B7"]
ROOT = {"Em": 40, "C": 36, "G": 43, "D": 38, "Am": 45, "F": 41, "E": 40, "B7": 47}
QUAL = {"Em": [0, 3, 7], "Am": [0, 3, 7], "C": [0, 4, 7], "G": [0, 4, 7], "D": [0, 4, 7], "F": [0, 4, 7], "E": [0, 4, 7], "B7": [0, 4, 7, 10]}

class Piece:
    def __init__(self, name, bpm, tracks):
        self.name, self.bpm = name, bpm
        self.ev = {k: [] for k in tracks}         # track -> [(beat, midi, dur_beats, vel)]
        self.prog = tracks                          # track -> (channel, program)
        self.bar = 0
        self.loop_bar = 0
    def add(self, tr, beat, m, dur, vel=90):
        self.ev[tr].append((beat, m, dur, vel))
    def melody(self, tr, bars, start=None, sub=None, octave=0, vel=96, gate=0.92):
        for i, s in enumerate(bars):
            for (t8, m, d8) in seq(s):
                if m is None: continue
                if sub: m = sub(m, i)
                self.add(tr, (start if start is not None else self.bar) * 4 + i * 4 + t8 / 2, m + octave, d8 / 2 * gate, vel)
    def comp(self, tr, chords, style, start=None, vel=60, octave=0):
        for i, c in enumerate(chords):
            b = (start if start is not None else self.bar) * 4 + i * 4
            r = ROOT[c] + 12 + octave; tones = [r + x for x in QUAL[c]]
            if style == "pad":
                for m in tones: self.add(tr, b, m, 3.9, vel)
            elif style == "arp":
                for k in range(8): self.add(tr, b + k / 2, tones[[0, 1, 2, 1, 0, 1, 2, 1][k] % len(tones)] + (12 if k in (3, 7) else 0), 0.45, vel + (8 if k % 2 == 0 else 0))
            elif style == "strum":   # flamenco rasgueado 3+3+2 feel
                for pos, v in ((0, 1.0), (0.75, 0.7), (1.5, 0.9), (2.25, 0.7), (3, 0.9), (3.5, 0.75)):
                    for j, m in enumerate(tones + [tones[0] + 12]): self.add(tr, b + pos + j * 0.025, m, 0.5, int(vel * v))
            elif style == "oompah":
                for k, pos in enumerate((1, 3)):
                    for m in tones: self.add(tr, b + pos, m, 0.8, vel)
            elif style == "bell":
                for k in range(4): self.add(tr, b + k, tones[k % len(tones)] + 12, 0.9, vel)
    def bass(self, tr, chords, style, start=None, vel=84):
        for i, c in enumerate(chords):
            b = (start if start is not None else self.bar) * 4 + i * 4
            r, f = ROOT[c], ROOT[c] + 7
            if style == "drive":
                for k in range(8): self.add(tr, b + k / 2, r + (12 if k in (3, 6) else 0), 0.45, vel + (6 if k % 2 == 0 else 0))
            elif style == "walk":
                for k, m in enumerate((r, f, r + 12, f)): self.add(tr, b + k, m, 0.9, vel)
            elif style == "oompah":
                for k, m in enumerate((r, f, r, f)): self.add(tr, b + k, m, 0.8, vel)
            elif style == "half":
                self.add(tr, b, r, 1.9, vel); self.add(tr, b + 2, f, 1.9, vel - 6)
    def drums(self, tr, bars, style, start=None, fill=False):
        s = start if start is not None else self.bar
        for i in range(bars):
            b = (s + i) * 4
            def hit(pos, m, v): self.add(tr, b + pos, m, 0.2, v)
            if style == "rock":
                for k in range(8): hit(k / 2, 42, 58 if k % 2 else 74)
                for p in (0, 2, 2.5): hit(p, 36, 100)
                for p in (1, 3): hit(p, 38, 96)
            elif style == "soft":
                for p in (0, 2): hit(p, 36, 70)
                for p in (1, 3): hit(p, 37, 62)
                for k in range(4): hit(k + 0.5, 42, 40)
            elif style == "cajon":  # Spain
                for p in (0, 1.5, 2): hit(p, 36, 95)
                for p in (1, 3, 3.5): hit(p, 38, 80)
                for p in (0.75, 1.75, 2.75, 3.25): hit(p, 85, 78)  # castanets
                for p in (1, 3): hit(p, 39, 70)                    # palmas
            elif style == "taiko":  # Korea
                for p in (0, 2): hit(p, 41, 100)
                hit(1, 76, 80); hit(3, 77, 80); hit(1.5, 38, 56); hit(3.5, 38, 56)
                for k in range(4): hit(k + 0.5, 42, 38)
            elif style == "march":  # Cracow
                for p in (0, 2): hit(p, 36, 96)
                for p in (0.5, 1, 1.5, 2.5, 3, 3.5): hit(p, 38, 60 if p % 1 else 82)
            elif style == "carousel":
                for p in (0, 1, 2, 3): hit(p, 36 if p % 2 == 0 else 38, 86)
                for k in range(8): hit(k / 2, 54, 52)  # tambourine
            if fill and i == bars - 1:
                for k in range(4): hit(3 + k / 4, 38, 70 + k * 8)
    def save(self):
        mid = mido.MidiFile(ticks_per_beat=PPQ)
        conductor = mido.MidiTrack(); mid.tracks.append(conductor)
        conductor.append(mido.MetaMessage("track_name", name=self.name, time=0))
        conductor.append(mido.MetaMessage("set_tempo", tempo=mido.bpm2tempo(self.bpm), time=0))
        conductor.append(mido.MetaMessage("time_signature", numerator=4, denominator=4, time=0))
        marks = [(0, "start"), (self.loop_bar * 4, "loop"), (self.bar * 4, "end")]
        evs = sorted(marks)
        last = 0
        for beat, txt in evs:
            tk = int(round(beat * PPQ)); conductor.append(mido.MetaMessage("marker", text=txt, time=tk - last)); last = tk
        for tr, (ch, prog) in self.prog.items():
            t = mido.MidiTrack(); mid.tracks.append(t)
            t.append(mido.MetaMessage("track_name", name=tr, time=0))
            if ch != 9: t.append(mido.Message("program_change", channel=ch, program=prog, time=0))
            raw = []
            for beat, m, dur, vel in self.ev[tr]:
                a = int(round(beat * PPQ)); raw.append((a, 1, m, max(1, min(127, vel)))); raw.append((a + max(30, int(dur * PPQ)), 0, m, 0))
            raw.sort(key=lambda x: (x[0], x[1]))
            last = 0
            for a, on, m, v in raw:
                t.append(mido.Message("note_on" if on else "note_off", channel=ch, note=m, velocity=v, time=a - last)); last = a
        mid.save(OUT / f"{self.name}.mid")

DRUM = (9, 0)
def phrygian(m, bar):  # Spain: E major chord bars -> G#
    return m + 1 if (bar % 4 == 3 and m % 12 == 7) else m

pieces = []

# 1. Title: the hook, bright square lead
p = Piece("title", 123, {"lead": (0, 80), "bass": (1, 38), "pad": (2, 81), "drums": DRUM})
p.melody("lead", HOOK); p.bass("bass", CH_EM, "drive"); p.comp("pad", CH_EM, "arp", vel=48); p.drums("drums", 8, "rock", fill=True); p.bar = 8; pieces.append(p)

# 2. Intro: music-box lullaby of the verse (getting up)
p = Piece("intro", 78, {"lead": (0, 10), "pad": (1, 48), "bass": (2, 32)})
p.melody("lead", VERSE, vel=84); p.comp("pad", CH_VERSE, "pad", vel=36); p.bass("bass", CH_VERSE, "half", vel=60)
p.bar = 8; pieces.append(p)

# 3. Cracow: trumpet fanfare, harpsichord, marching drums
p = Piece("cracow", 118, {"lead": (0, 56), "harp": (1, 6), "bass": (2, 33), "drums": DRUM})
p.melody("lead", FANFARE, gate=1.0, vel=110); p.comp("harp", ["Em", "Em"], "arp", vel=52); p.bar = 2; p.loop_bar = 2
p.melody("lead", VERSE, octave=0, vel=82); p.comp("harp", CH_VERSE, "arp", vel=56); p.bass("bass", CH_VERSE, "walk"); p.drums("drums", 8, "march"); p.bar += 8
p.melody("lead", PRE, vel=90); p.comp("harp", CH_PRE, "arp", vel=60); p.bass("bass", CH_PRE, "walk"); p.drums("drums", 4, "march", fill=True); p.bar += 4
p.melody("lead", HOOK, vel=104); p.comp("harp", CH_EM, "arp", vel=60); p.bass("bass", CH_EM, "drive"); p.drums("drums", 8, "rock", fill=True); p.bar += 8
pieces.append(p)

# 4. Korea: gayageum pluck on the pentatonic hook, taiko
p = Piece("korea", 112, {"lead": (0, 107), "harp": (1, 46), "strings": (2, 49), "bass": (3, 32), "drums": DRUM})
p.melody("lead", VERSE, vel=92, gate=0.8); p.comp("harp", CH_VERSE, "bell", vel=50, octave=12); p.comp("strings", CH_VERSE, "pad", vel=34); p.bass("bass", CH_VERSE, "half"); p.drums("drums", 8, "taiko"); p.bar += 8
p.melody("lead", PRE, vel=96, gate=0.8); p.comp("harp", CH_PRE, "bell", vel=54, octave=12); p.comp("strings", CH_PRE, "pad", vel=38); p.bass("bass", CH_PRE, "walk"); p.drums("drums", 4, "taiko", fill=True); p.bar += 4
p.melody("lead", HOOK, vel=108, gate=0.85); p.comp("harp", CH_EM, "bell", vel=58, octave=12); p.comp("strings", CH_EM, "pad", vel=42); p.bass("bass", CH_EM, "drive", vel=76); p.drums("drums", 8, "taiko", fill=True); p.bar += 8
pieces.append(p)

# 5. Spain: nylon guitar, Andalusian cadence Am-G-F-E, castanets
CH_SP = ["Am", "G", "F", "E"] * 2
p = Piece("spain", 126, {"lead": (0, 24), "strum": (1, 25), "bass": (2, 33), "drums": DRUM})
CH_SPV = ["Am", "G", "F", "E"] * 2
p.melody("lead", VERSE, vel=88, sub=lambda m, b: m + 1 if (b % 4 == 3 and m % 12 == 7) else m); p.comp("strum", CH_SPV, "strum", vel=64); p.bass("bass", CH_SPV, "walk"); p.drums("drums", 8, "cajon"); p.bar += 8
p.melody("lead", PRE, vel=94); p.comp("strum", ["F", "G", "Am", "E"], "strum", vel=68); p.bass("bass", ["F", "G", "Am", "E"], "walk"); p.drums("drums", 4, "cajon", fill=True); p.bar += 4
p.melody("lead", HOOK, vel=108, sub=phrygian); p.comp("strum", CH_SP, "strum", vel=72); p.bass("bass", CH_SP, "drive", vel=78); p.drums("drums", 8, "cajon", fill=True); p.bar += 8
pieces.append(p)

# 6. Rabkoland: carousel organ + glockenspiel, major key (hook on the 3rd of G)
CH_RB = ["G", "Em", "C", "D"] * 2
CH_RBV = ["G", "G", "C", "D"] * 2
p = Piece("rabkoland", 132, {"lead": (0, 9), "organ": (1, 17), "bass": (2, 58), "drums": DRUM})
p.melody("lead", VERSE, vel=92); p.comp("organ", CH_RBV, "oompah", vel=58); p.bass("bass", CH_RBV, "oompah"); p.drums("drums", 8, "carousel"); p.bar += 8
p.melody("lead", PRE, vel=96); p.comp("organ", ["C", "G", "Am", "D"], "oompah", vel=62); p.bass("bass", ["C", "G", "Am", "D"], "oompah"); p.drums("drums", 4, "carousel", fill=True); p.bar += 4
p.melody("lead", HOOK, vel=108, sub=lambda m, b: m); p.melody("organ", HOOK, vel=56, octave=-12); p.comp("organ", CH_RB, "oompah", vel=60); p.bass("bass", CH_RB, "oompah", vel=88); p.drums("drums", 8, "carousel", fill=True); p.bar += 8
pieces.append(p)

# 7. Outro: the hook as a lullaby, then a held chord
p = Piece("outro", 72, {"lead": (0, 10), "pad": (1, 48), "bass": (2, 32)})
p.melody("lead", HOOK, vel=80); p.comp("pad", CH_EM, "pad", vel=34); p.bass("bass", CH_EM, "half", vel=56)
p.bar = 8
for m in (52, 59, 64, 71): p.add("pad", 32, m, 7.5, 40)
p.add("lead", 32, 76, 7.5, 70); p.bar = 10; pieces.append(p)

# 8. Level-clear jingle
p = Piece("clear", 132, {"lead": (0, 80), "pad": (1, 81), "bass": (2, 38), "drums": DRUM})
p.melody("lead", ["B4 B4 B4 C5 B4 D5 E5*2", "G5*6 r2"], vel=110, gate=1.0); p.comp("pad", ["Em", "G"], "pad", vel=60); p.bass("bass", ["Em", "G"], "half", vel=90)
p.drums("drums", 1, "rock"); p.bar = 2; pieces.append(p)

ts = ["// generated by game/music/compose.py - the .mid files in game/music/midi are the source of truth", "export const MIDI: Record<string, string> = {"]
for p in pieces:
    p.save()
    ts.append(f'  {p.name}: "{base64.b64encode((OUT / (p.name + ".mid")).read_bytes()).decode()}",')
ts.append("};")
(HERE.parent / "src").mkdir(exist_ok=True)
(HERE.parent / "src" / "midiData.ts").write_text("\n".join(ts) + "\n")
for p in pieces: print(p.name, p.bpm, "bpm", p.bar, "bars", round(p.bar * 4 * 60 / p.bpm, 1), "s", sum(len(v) for v in p.ev.values()), "notes")
