import { describe, expect, it, vi } from 'vitest'
import { createBrowserAudio } from './browserAudio'

function browserDouble(overrides = {}) {
  const speechSynthesis = { cancel: vi.fn(), speak: vi.fn(), getVoices: () => [], addEventListener: vi.fn(), removeEventListener: vi.fn() }
  return {
    speechSynthesis,
    SpeechSynthesisUtterance: class { constructor(text) { this.text = text } },
    setTimeout: (callback) => { callback(); return 1 },
    clearTimeout: vi.fn(),
    ...overrides,
  }
}

describe('browser audio adapter', () => {
  it('cancels speech immediately when disabled', () => {
    const browser = browserDouble()
    const audio = createBrowserAudio(browser)
    audio.arm()
    audio.announce({ type: 'start', message: 'Bonjour' })
    audio.stop()
    expect(browser.speechSynthesis.cancel).toHaveBeenCalled()
  })

  it('keeps speech working when AudioContext is unavailable', () => {
    const browser = browserDouble()
    const audio = createBrowserAudio(browser)
    audio.activate()
    audio.announce({ type: 'start', message: 'Bonjour' })
    expect(browser.speechSynthesis.speak).toHaveBeenCalledOnce()
  })

  it('does not fail when speech synthesis is unavailable', () => {
    const browser = browserDouble({ speechSynthesis: undefined, SpeechSynthesisUtterance: undefined })
    const audio = createBrowserAudio(browser)
    expect(() => { audio.activate(); audio.announce({ type: 'pause', message: 'Pause' }); audio.stop() }).not.toThrow()
  })
})
