"""Synthesizes the OyunaGəl promo soundtrack (120 BPM) and places SFX on the video's cue frames.

Usage: python3 make.py cues.json out.wav
"""
import json, sys
import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
BPM = 120
BEAT = 60 / BPM
BAR = BEAT * 4
FPS = 30
LEN = 62.0
N = int(LEN * SR)
rng = np.random.default_rng(7)


def t_(d):
    return np.arange(int(d * SR)) / SR


def mtof(m):
    return 440 * 2 ** ((m - 69) / 12)


def sos(kind, f, order=2):
    return signal.butter(order, f, btype=kind, fs=SR, output='sos')


def filt(x, kind, f, order=2):
    return signal.sosfilt(sos(kind, f, order), x)


def sweep_lp(x, f0, f1, block=0.02, curve=2.0):
    """Lowpass whose cutoff glides from f0 to f1 across x (block-wise, state carried)."""
    out = np.zeros_like(x)
    n = int(block * SR)
    blocks = max(1, len(x) // n)
    zi = None
    for b in range(blocks + 1):
        seg = x[b * n:(b + 1) * n]
        if not len(seg):
            break
        p = (b / blocks) ** curve
        fc = f0 * (f1 / f0) ** p
        s = sos('lowpass', min(fc, SR * 0.45))
        if zi is None:
            zi = signal.sosfilt_zi(s) * 0
        y, zi = signal.sosfilt(s, seg, zi=zi)
        out[b * n:b * n + len(seg)] = y
    return out


def env(n, a=0.005, d=0.1, s=0.0, r=0.05, hold=None):
    """ADSR as an array of length n (seconds for a/d/r)."""
    e = np.zeros(n)
    A, D, R = int(a * SR), int(d * SR), int(r * SR)
    H = n - R if hold is None else int(hold * SR)
    i = 0
    for k in range(min(A, n)):
        e[k] = k / max(1, A)
    i = A
    for k in range(i, min(i + D, n)):
        e[k] = 1 - (1 - s) * (k - i) / max(1, D)
    i += D
    e[i:H] = s
    for k in range(max(H, 0), n):
        e[k] = (s if H > A + D else e[max(H - 1, 0)]) * max(0, 1 - (k - H) / max(1, R))
    return e


def saw(f, d, detune=0.0):
    t = t_(d)
    ph = rng.random()
    return 2 * ((t * f * (1 + detune) + ph) % 1) - 1


def add(buf, x, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= len(buf) or i + len(x) <= 0:
        return
    x = x[: len(buf) - i]
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + len(x), 0] += x * gain * l * 1.414
    buf[i:i + len(x), 1] += x * gain * r * 1.414


def reverb_ir(d=2.2, decay=3.0):
    t = t_(d)
    irs = []
    for _ in range(2):
        n = rng.standard_normal(len(t)) * np.exp(-t * decay)
        n = filt(n, 'lowpass', 6000)
        irs.append(n / np.sqrt(np.sum(n ** 2)))
    return irs


IR = reverb_ir()


def verb(st, wet=0.25):
    out = st.copy()
    for c in range(2):
        out[:, c] += signal.fftconvolve(st[:, c], IR[c])[: len(st)] * wet
    return out


def delay(st, time=BEAT * 0.75, fb=0.35, wet=0.3):
    """Ping-pong echo of the mono sum."""
    out = st.copy()
    mono = st.mean(axis=1)
    d = int(time * SR)
    for k in range(1, 6):
        if d * k >= len(mono):
            break
        out[d * k:, k % 2] += mono[:-d * k] * wet * fb ** (k - 1)
    return out


# ------------------------------------------------------------------ instruments
def kick():
    t = t_(0.5)
    f = 46 + 120 * np.exp(-t * 32)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6.5)
    x[: int(0.004 * SR)] += rng.standard_normal(int(0.004 * SR)) * 0.5
    return np.tanh(x * 1.8) * 0.9


def clap():
    t = t_(0.35)
    n = rng.standard_normal(len(t))
    e = np.exp(-t * 18)
    for o in (0.0, 0.011, 0.022):
        e += (t >= o) * np.exp(-np.maximum(t - o, 0) * 120) * 0.8
    return filt(n * e, 'bandpass', [900, 3200]) * 0.9


def hat(open_=False):
    t = t_(0.25 if open_ else 0.06)
    return filt(rng.standard_normal(len(t)), 'highpass', 7500) * np.exp(-t * (14 if open_ else 70))


def snare():
    t = t_(0.18)
    tone = np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)
    return (filt(rng.standard_normal(len(t)), 'bandpass', [1200, 6000]) * np.exp(-t * 22) + tone * 0.5) * 0.7


def crash(d=2.0):
    t = t_(d)
    return filt(rng.standard_normal(len(t)), 'highpass', 3500) * np.exp(-t * 2.2) * 0.5


def boom():
    t = t_(2.0)
    f = 32 + 60 * np.exp(-t * 8)
    sub = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 1.6)
    nz = filt(rng.standard_normal(len(t)), 'lowpass', 900) * np.exp(-t * 5) * 0.6
    return np.tanh((sub + nz) * 1.6) * 0.9


def riser(d):
    t = t_(d)
    p = t / d
    nz = rng.standard_normal(len(t))
    out = np.zeros(len(t))
    n = int(0.02 * SR)
    for b in range(len(t) // n + 1):
        seg = nz[b * n:(b + 1) * n]
        if not len(seg):
            break
        fc = 300 * (9000 / 300) ** (b * n / len(t))
        out[b * n:b * n + len(seg)] = filt(seg, 'bandpass', [fc * 0.7, min(fc * 1.4, 20000)])
    tone = np.sin(2 * np.pi * np.cumsum(220 * 2 ** (p * 2)) / SR) * 0.15
    return (out * 0.8 + tone) * p ** 2


def pad_note(m, d, bright=1.0):
    x = sum(saw(mtof(m), d, dt) for dt in (-0.006, -0.002, 0.002, 0.006, 0.0)) / 5
    x = filt(x, 'lowpass', 1800 * bright)
    return x * env(len(x), a=0.25, d=0.3, s=0.8, r=0.4)


def pluck(m, d=0.22):
    t = t_(d)
    x = saw(mtof(m), d) * 0.6 + np.sign(np.sin(2 * np.pi * mtof(m) * t)) * 0.3
    x = sweep_lp(x, 5000, 600, block=0.01, curve=0.5)
    return x * np.exp(-t * 14)


def bass_note(m, d):
    t = t_(d)
    f = mtof(m)
    x = np.sin(2 * np.pi * f * t) + 0.35 * filt(saw(f, d), 'lowpass', 400)
    return np.tanh(x * 1.4) * env(len(t), a=0.004, d=0.08, s=0.7, r=0.04)


def lead_note(m, d):
    t = t_(d)
    f = mtof(m) * (1 + 0.004 * np.sin(2 * np.pi * 5.5 * t) * (t > 0.12))
    ph = np.cumsum(f) / SR
    x = 0.5 * (2 * (ph % 1) - 1) + 0.4 * np.sign(np.sin(2 * np.pi * ph * 1.003))
    x = filt(x, 'lowpass', 3200)
    return x * env(len(t), a=0.01, d=0.15, s=0.6, r=0.08)


# ------------------------------------------------------------------ arrangement
CHORDS = [  # Am F C G
    dict(pad=[57, 60, 64], bass=33, arp=[69, 72, 76, 81]),
    dict(pad=[53, 57, 60], bass=29, arp=[65, 69, 72, 77]),
    dict(pad=[55, 60, 64], bass=36, arp=[67, 72, 76, 79]),
    dict(pad=[55, 59, 62], bass=31, arp=[67, 71, 74, 79]),
]
HOOK = [  # 8th-note slots per chord: (slot, midi, length in 8ths)
    [(0, 76, 2), (2, 76, 1), (3, 74, 1), (4, 72, 2), (6, 69, 2)],
    [(0, 72, 2), (2, 72, 1), (3, 74, 1), (4, 76, 3)],
    [(0, 79, 2), (2, 76, 2), (4, 74, 1), (5, 72, 3)],
    [(0, 74, 2), (2, 71, 2), (4, 74, 1), (5, 76, 1), (6, 74, 2)],
]

drums = np.zeros((N, 2)); music = np.zeros((N, 2)); pads = np.zeros((N, 2)); leads = np.zeros((N, 2)); fx = np.zeros((N, 2))
K, CL, HC, HO, SN = kick(), clap(), hat(), hat(True), snare()
kick_times = []

GROOVE = set(range(4, 16)) | set(range(17, 26))
LEAD = set(range(8, 16)) | set(range(17, 26))
for bar in range(31):
    t0 = bar * BAR
    ch = CHORDS[bar % 4]
    full = bar in GROOVE
    # pads: everywhere except the last beat of the bar before a drop
    pd = BAR if bar not in (3, 16, 27) else BAR - BEAT
    bright = 0.35 + 0.65 * (bar / 3) if bar < 4 else (0.5 if bar == 16 else 1.0)
    if bar < 28:
        for m in ch['pad']:
            x = pad_note(m, pd + 0.3, bright)
            add(pads, x, t0, 0.16, pan=-0.4); add(pads, pad_note(m + 12, pd + 0.3, bright) * 0.5, t0, 0.12, pan=0.4)
    if full:
        for b in range(4):
            tb = t0 + b * BEAT
            add(drums, K, tb, 0.95); kick_times.append(tb)
            if b in (1, 3):
                add(drums, CL, tb, 0.55, pan=0.05)
            add(drums, HO, tb + BEAT / 2, 0.18, pan=0.3)
            for s in range(4):
                add(drums, HC, tb + s * BEAT / 4, 0.07 + 0.04 * (s % 2), pan=-0.25)
            # offbeat bass
            add(music, bass_note(ch['bass'], BEAT / 2 - 0.02), tb + BEAT / 2, 0.42)
            add(music, bass_note(ch['bass'] + 12, BEAT / 4), tb + BEAT * 0.75, 0.15)
        for s in range(16):
            add(music, pluck(ch['arp'][[0, 1, 2, 3, 2, 1, 2, 3][s % 8]]), t0 + s * BEAT / 4, 0.1, pan=(-0.5 if s % 2 else 0.5))
    elif bar < 4:
        # intro: ticking hats, a heartbeat kick, filtered arp
        if bar >= 1:
            for s in range(8):
                add(drums, HC, t0 + s * BEAT / 2, 0.06, pan=0.2)
        if bar >= 2:
            for b in (0, 2):
                add(drums, K, t0 + b * BEAT, 0.5)
        for s in range(16 if bar >= 2 else 8):
            dv = 4 if bar < 2 else 4
            add(music, filt(pluck(ch['arp'][s % 4]), 'lowpass', 900 + bar * 700), t0 + s * BEAT / dv, 0.07, pan=(-0.4 if s % 2 else 0.4))
    elif bar == 16:
        # breakdown: filtered arp + riser into the re-drop
        for s in range(16):
            add(music, filt(pluck(ch['arp'][s % 4]), 'lowpass', 1200), t0 + s * BEAT / 4, 0.08, pan=(-0.4 if s % 2 else 0.4))
    elif bar in (26, 27):
        # build: snare roll accelerating, arp continues
        for s in range(16):
            add(music, pluck(ch['arp'][s % 4]), t0 + s * BEAT / 4, 0.08 + 0.03 * (bar - 26), pan=(-0.4 if s % 2 else 0.4))
        div = 4 if bar == 26 else 8
        for s in range(4 * div if bar == 26 else 4 * div - 8):
            add(drums, SN, t0 + s * BEAT / div, 0.18 + 0.4 * (s / (4 * div)), pan=0)
        add(music, bass_note(ch['bass'], BAR - 0.05), t0, 0.25)
    if bar in LEAD:
        for slot, m, ln in HOOK[bar % 4]:
            add(leads, lead_note(m, ln * BEAT / 2 - 0.02), t0 + slot * BEAT / 2, 0.12)

# Risers and impacts on structure points
add(fx, riser(BAR * 1.5), 3 * BAR - BAR * 0.5 - 0.0, 0.5)
add(fx, crash(), 4 * BAR, 0.5); add(fx, boom(), 4 * BAR, 0.8)
add(fx, riser(BAR), 16 * BAR, 0.45)
add(fx, crash(), 17 * BAR, 0.45)
add(fx, riser(BAR * 2), 26 * BAR, 0.55)
add(fx, crash(3.0), 28 * BAR, 0.6); add(fx, boom(), 28 * BAR, 0.9)
# Final chord ring-out on the outro hit
for m in [57, 60, 64, 69, 72]:
    add(pads, pad_note(m, 5.5, 1.0) * np.exp(-t_(5.5) * 0.45), 28 * BAR, 0.14, pan=(m % 3 - 1) * 0.4)
add(music, bass_note(33, 3.0) * np.exp(-t_(3.0) * 1.2), 28 * BAR, 0.5)
for s, m in enumerate([81, 76, 72, 69, 76, 72, 69, 64]):
    add(music, pluck(m, 0.4), 28 * BAR + 0.5 + s * BEAT / 2, 0.08 * (1 - s / 10), pan=(-0.4 if s % 2 else 0.4))
# Outro tail (bars 29-30): soft pads, arp and hats under the QR card, no kick
for bar in (29, 30):
    ch = CHORDS[(bar - 1) % 4]
    for m in ch['pad']:
        add(pads, pad_note(m, BAR + 0.4, 0.8), bar * BAR, 0.11, pan=-0.3); add(pads, pad_note(m + 12, BAR + 0.4, 0.8), bar * BAR, 0.06, pan=0.3)
    for s in range(16):
        add(music, filt(pluck(ch['arp'][[0, 1, 2, 3, 2, 1, 2, 3][s % 8]]), 'lowpass', 2500), bar * BAR + s * BEAT / 4, 0.07, pan=(-0.5 if s % 2 else 0.5))
    for b in range(4):
        add(drums, HO, bar * BAR + b * BEAT + BEAT / 2, 0.1, pan=0.3)
    add(music, bass_note(ch['bass'], BAR - 0.1) * np.exp(-t_(BAR - 0.1) * 0.8), bar * BAR, 0.3)

# Sidechain pumping on the kick
duck = np.ones(N)
for kt in kick_times:
    i = int(kt * SR)
    t = t_(BEAT)
    seg = 1 - 0.65 * np.exp(-t / 0.09)
    duck[i:i + len(seg)] = np.minimum(duck[i:i + len(seg)], seg[: max(0, N - i)])
pads *= duck[:, None]; music *= (0.35 + 0.65 * duck)[:, None]

pads = verb(pads, 0.35); leads = verb(delay(leads, fb=0.4, wet=0.35), 0.25); music = verb(music, 0.15); fx = verb(fx, 0.2)
song = drums + music + pads + leads + fx

# ------------------------------------------------------------------ SFX on video cues
def whoosh(d=0.45, lo=300, hi=6000):
    t = t_(d)
    nz = rng.standard_normal(len(t))
    out = np.zeros(len(t)); n = int(0.01 * SR)
    for b in range(len(t) // n + 1):
        seg = nz[b * n:(b + 1) * n]
        if not len(seg):
            break
        p = b * n / len(t)
        fc = lo * (hi / lo) ** np.sin(p * np.pi / 2)
        out[b * n:b * n + len(seg)] = filt(seg, 'bandpass', [fc * 0.6, min(fc * 1.6, 20000)])
    return out * np.sin(np.pi * t / d) ** 2


def hit():
    t = t_(0.35)
    f = 70 + 140 * np.exp(-t * 25)
    return np.tanh((np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9) + filt(rng.standard_normal(len(t)), 'bandpass', [800, 4000]) * np.exp(-t * 40) * 0.5) * 1.5)


def tick():
    t = t_(0.05)
    return (np.sin(2 * np.pi * 1800 * t) * 0.6 + filt(rng.standard_normal(len(t)), 'highpass', 3000) * 0.4) * np.exp(-t * 90)


def pop():
    t = t_(0.12)
    f = 380 + 700 * (1 - np.exp(-t * 40))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 30)


def blip():
    t = t_(0.2)
    f = np.where(t < 0.07, 880, 1320)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 12) * 0.8


def click():
    t = t_(0.03)
    x = filt(rng.standard_normal(len(t)), 'bandpass', [2000, 7000]) * np.exp(-t * 300)
    x2 = np.zeros(len(t)); k = int(0.009 * SR); x2[k:] = x[:-k] * 0.6
    return (x + x2) * 1.2


def key():
    t = t_(0.05)
    return (filt(rng.standard_normal(len(t)), 'bandpass', [1200, 5000]) * np.exp(-t * 120) + np.sin(2 * np.pi * 140 * t) * np.exp(-t * 80) * 0.4)


def success():
    out = np.zeros(int(0.9 * SR))
    for k, m in enumerate([84, 88, 91, 96]):
        t = t_(0.7)
        f = mtof(m)
        x = (np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 8)) * np.exp(-t * 5)
        i = int(k * 0.055 * SR); out[i:i + len(x)] += x[: len(out) - i] * 0.5
    return out


SFX = {'whoosh': (lambda: whoosh(0.45), 0.35), 'swish': (lambda: whoosh(0.22, 800, 9000), 0.22), 'hit': (hit, 0.5), 'tick': (tick, 0.25),
       'pop': (pop, 0.22), 'blip': (blip, 0.25), 'click': (click, 0.4), 'key': (key, 0.3), 'success': (success, 0.3), 'boom': (boom, 0.55)}

cues = json.load(open(sys.argv[1]))
sfx = np.zeros((N, 2))
for scene, frame, kind in cues['SFX']:
    at = (cues['SCENES'][scene]['start'] + frame) / FPS
    gen, g = SFX[kind]
    pan = float(rng.uniform(-0.3, 0.3))
    lead = 0.12 if kind in ('whoosh',) else 0.0  # whooshes peak on the cut, so start them early
    add(sfx, gen(), at - lead, g, pan)
sfx = verb(sfx, 0.12)

mix = song * 0.8 + sfx
# Master: gentle high-pass, soft clip, normalize, fade out
mix = np.stack([filt(mix[:, c], 'highpass', 28) for c in range(2)], axis=1)
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix /= np.max(np.abs(mix)) / 0.89
fade = np.ones(N); fl = int(1.2 * SR); fade[-fl:] = np.linspace(1, 0, fl) ** 2
mix *= fade[:, None]
wavfile.write(sys.argv[2], SR, (mix * 32767).astype(np.int16))
print('wrote', sys.argv[2], round(N / SR, 2), 's')
