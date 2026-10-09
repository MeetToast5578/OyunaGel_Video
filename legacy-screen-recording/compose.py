"""Frames each recorded clip, adds captions, and joins everything with crossfades into one MP4."""
import json, subprocess

V = '/var/tmp/vid'
L = json.load(open(f'{V}/gfx/layout.json'))
W, P = L['WIN'], L['PH']
XF = 0.6  # crossfade seconds

def run(args):
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', *args], check=True)

def dur(f):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))

def browser_scene(name, cap, speed=1.0):
    out = f'{V}/seg_{name}.mp4'
    run(['-i', f'{V}/clips/{name}.mp4', '-loop', '1', '-i', f'{V}/gfx/frame_browser.png', '-loop', '1', '-i', f'{V}/gfx/{cap}.png',
         '-filter_complex',
         f"[0:v]setpts=PTS/{speed},scale={W['w']}:{W['h']}:flags=lanczos,pad=1920:1080:{W['x']}:{W['y']}:color=black[c];"
         f"[c][1:v]overlay=shortest=1[f];"
         f"[2:v]format=rgba,fade=in:st=0.35:d=0.6:alpha=1[t];[f][t]overlay=shortest=1,fps=30,format=yuv420p",
         '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', out])
    return out

def phone_scene(name):
    out = f'{V}/seg_{name}.mp4'
    run(['-i', f'{V}/clips/{name}.mp4', '-loop', '1', '-i', f'{V}/gfx/frame_phone.png',
         '-filter_complex',
         f"[0:v]scale={P['w']}:{P['h']}:flags=lanczos,pad=1920:1080:{P['x']}:{P['y']}:color=black[c];"
         f"[c][1:v]overlay=shortest=1,fps=30,format=yuv420p",
         '-c:v', 'libx264', '-crf', '16', '-preset', 'medium', out])
    return out

segs = [
    f'{V}/gfx/intro.mp4',
    browser_scene('home', 'cap1', 1.12),
    browser_scene('games', 'cap2'),
    browser_scene('detail', 'cap3'),
    browser_scene('create', 'cap4', 1.35),
    browser_scene('profile', 'cap5', 1.05),
    phone_scene('mobile'),
    f'{V}/gfx/outro.mp4',
]

# Chain crossfades; each offset is the running length minus the overlap.
inputs, chain, t = [], [], 0.0
for s in segs:
    inputs += ['-i', s]
prev = '[0:v]'
t = dur(segs[0])
for i in range(1, len(segs)):
    t -= XF
    label = f'[x{i}]'
    chain.append(f"{prev}[{i}:v]xfade=transition=fade:duration={XF}:offset={t:.3f}{label}")
    prev = label
    t += dur(segs[i])
chain.append(f"{prev}fade=out:st={t - 0.7:.3f}:d=0.7,format=yuv420p[out]")
run([*inputs, '-filter_complex', ';'.join(chain), '-map', '[out]', '-c:v', 'libx264', '-crf', '17', '-preset', 'slow',
     '-movflags', '+faststart', f'{V}/OyunaGel_showcase.mp4'])
print('total', round(dur(f'{V}/OyunaGel_showcase.mp4'), 2), 's')
