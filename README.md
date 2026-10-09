# OyunaGəl — launch video

A 62-second animated promo for [OyunaGəl](https://github.com/MeetToast5578/BDA_Oyuna_Gel), built in code with
[Remotion](https://www.remotion.dev) (React → video). The soundtrack and sound effects are synthesized in Python,
so there is no licensed music in here.

**Finished renders** are in [`renders/`](renders):

| File | What it is |
| --- | --- |
| `OyunaGel_launch_AZ_master.mp4` | Final video, 1080p30, full quality (~58 MB) |
| `OyunaGel_launch_AZ_1080p.mp4` | Same video compressed for sharing (~28 MB) |
| `OyunaGel_screen_recording_v1.mp4` | The earlier plain screen-recording version |

## How it is put together

| Path | Holds |
| --- | --- |
| `src/cues.ts` | **The timeline.** Scene start/length (120 BPM: 1 beat = 15 frames, 1 bar = 60) and every sound-effect cue. Both the video and the audio read it, so they stay in sync. |
| `src/scenes1.tsx` | Cold open, logo reveal, 3D homepage with flying tickets |
| `src/scenes2.tsx` | Sport panels, card wall, "join in one click" detail |
| `src/scenes3.tsx` | Create-a-game form, phones, stats, outro with QR code |
| `src/lib.tsx` | Brand colours/fonts, kinetic text, and the app's UI (game card, ticket, browser, phone, cursor, confetti) rebuilt as components |
| `audio/make.py` | Synthesizes the music (drums, bass, pads, arp, lead, risers) and places SFX on the cues |
| `public/` | Venue photos, app screenshots, and the generated `audio/mix.wav` |
| `scripts/capture-assets.mjs` | Re-takes the app screenshots from a locally running copy of the app |
| `legacy-screen-recording/` | Scripts behind the first, screen-recorded version (kept for reference; paths are from the sandbox they ran in) |

All on-screen text is Azerbaijani. The QR code on the last scene points to `https://oyunagel.vercel.app/`
(change it in `src/scenes3.tsx`).

## Editing and rendering

```bash
npm install
npm run studio      # live preview in the browser; scrub the timeline, edit, see changes instantly
npm run audio       # rebuild public/audio/mix.wav after changing cues or audio/make.py (needs python3 + numpy + scipy)
npm run render      # render renders/OyunaGel_launch_AZ_master.mp4
```

- **Change text:** edit the `words={[...]}` arrays in the scene files. `{ t: 'word', c: C.accent }` makes a word orange.
- **Change timing:** edit `src/cues.ts`, then run `npm run audio` so the sound effects move with it.
- **Use your own music:** replace `public/audio/mix.wav` (62 s; a 120 BPM track lines up with the cuts).
- **Smaller file for sharing:**
  `ffmpeg -i renders/OyunaGel_launch_AZ_master.mp4 -c:v libx264 -preset slow -b:v 3400k -c:a aac -b:a 192k renders/OyunaGel_launch_AZ_1080p.mp4`
- Rendering takes a while on a small machine (about 50 minutes on 2 CPU cores). Remotion downloads its own
  headless Chrome; set `REMOTION_CHROME=/path/to/chrome` to use an existing one instead.

Game names, players and profile numbers come from the app's seed data, not real users.
