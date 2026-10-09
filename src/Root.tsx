import React from 'react'
import { AbsoluteFill, Audio, Composition, Sequence, staticFile } from 'remotion'
import { SCENES, TOTAL } from './cues'
import { Cold, Hero, LogoReveal } from './scenes1'
import { Sports, Wall } from './scenes2'
import { Create, Outro, Phones, Stats } from './scenes3'

const PARTS: [keyof typeof SCENES, React.FC][] = [['cold', Cold], ['logo', LogoReveal], ['hero', Hero], ['sports', Sports], ['wall', Wall], ['create', Create], ['phones', Phones], ['stats', Stats], ['outro', Outro]]

const Promo: React.FC<{ audio: boolean }> = ({ audio }) => (
  <AbsoluteFill style={{ background: '#05030f' }}>
    {PARTS.map(([id, Comp]) => (
      <Sequence key={id} from={SCENES[id].start} durationInFrames={SCENES[id].dur} name={id}><Comp /></Sequence>
    ))}
    {audio && <Audio src={staticFile('audio/mix.wav')} />}
  </AbsoluteFill>
)

export const Root: React.FC = () => (
  <>
    <Composition id="Promo" component={Promo} durationInFrames={TOTAL} fps={30} width={1920} height={1080} defaultProps={{ audio: true }} />
    {PARTS.map(([id, Comp]) => (
      <Composition key={id} id={`S-${id}`} component={Comp} durationInFrames={SCENES[id].dur} fps={30} width={1920} height={1080} />
    ))}
  </>
)
