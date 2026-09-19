import { describe, expect, it, vi } from 'vitest'
import { AUDIO_STORAGE_KEY, persistAudioPreference, restoreAudioPreference } from './useAudioMessages'

describe('audio preference', () => {
  it('is disabled by default and restores the stored value', () => {
    expect(restoreAudioPreference({ getItem: () => null })).toBe(false)
    expect(restoreAudioPreference({ getItem: (key) => key === AUDIO_STORAGE_KEY ? 'true' : null })).toBe(true)
  })

  it('persists independently under its dedicated key', () => {
    const setItem = vi.fn()
    persistAudioPreference(true, { setItem })
    expect(setItem).toHaveBeenCalledWith(AUDIO_STORAGE_KEY, 'true')
  })

  it('survives unavailable storage', () => {
    const unavailable = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') } }
    expect(restoreAudioPreference(unavailable)).toBe(false)
    expect(() => persistAudioPreference(true, unavailable)).not.toThrow()
  })
})
