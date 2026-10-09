import { existsSync } from 'node:fs'
import { Config } from '@remotion/cli/config'

// Use a local headless Chrome when one is given (e.g. a sandbox without internet); otherwise Remotion downloads its own.
const chrome = process.env.REMOTION_CHROME
if (chrome && existsSync(chrome)) Config.setBrowserExecutable(chrome)
Config.setChromiumOpenGlRenderer('swangle')
Config.setVideoImageFormat('jpeg')
Config.setJpegQuality(92)
