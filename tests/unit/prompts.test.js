import { describe, it, expect } from 'vitest'
import { buildInitialPrompt, buildRevisionPrompt, trimHistory, SYSTEM_PROMPT_V1 } from '../../server/prompts.js'

describe('trimHistory', () => {
  it('keeps only the last `max` turns (default 3)', () => {
    const history = [1, 2, 3, 4, 5].map((n) => ({ role: 'user', content: `turn ${n}` }))
    expect(trimHistory(history)).toEqual(history.slice(-3))
  })

  it('respects a custom max', () => {
    const history = [1, 2, 3, 4].map((n) => ({ role: 'user', content: `turn ${n}` }))
    expect(trimHistory(history, 1)).toEqual([history[3]])
  })

  it('returns the array unchanged when shorter than max', () => {
    const history = [{ role: 'user', content: 'hi' }]
    expect(trimHistory(history, 3)).toEqual(history)
  })
})

describe('buildInitialPrompt', () => {
  it('embeds the user input and asks for JSON only', () => {
    const prompt = buildInitialPrompt('Warung Bakso Pak Slamet di Malang')
    expect(prompt).toContain(SYSTEM_PROMPT_V1)
    expect(prompt).toContain('Warung Bakso Pak Slamet di Malang')
    expect(prompt).toContain('Balas JSON saja')
  })

  it('truncates input to 1000 chars (NFR-05 token efficiency guard)', () => {
    const longInput = 'x'.repeat(2000)
    const prompt = buildInitialPrompt(longInput)
    expect(prompt).toContain('x'.repeat(1000))
    expect(prompt).not.toContain('x'.repeat(1001))
  })
})

describe('buildRevisionPrompt', () => {
  const current = { meta: { businessName: 'Warung Kopi' } }

  it('embeds the current state and the revision message', () => {
    const prompt = buildRevisionPrompt(current, 'Ubah warna jadi merah')
    expect(prompt).toContain('Warung Kopi')
    expect(prompt).toContain('Ubah warna jadi merah')
    expect(prompt).toContain('Ubah HANYA field yang diminta')
  })

  it('notes explicitly when there is no conversation history', () => {
    const prompt = buildRevisionPrompt(current, 'msg', [])
    expect(prompt).toContain('Tidak ada riwayat percakapan sebelumnya')
  })

  it('renders history turns with role labels when present', () => {
    const history = [
      { role: 'user', content: 'Ganti jadi F&B' },
      { role: 'assistant', content: 'Sudah diganti' },
    ]
    const prompt = buildRevisionPrompt(current, 'msg', history)
    expect(prompt).toContain('USER: Ganti jadi F&B')
    expect(prompt).toContain('ASSISTANT: Sudah diganti')
  })

  it('truncates the current-state JSON to 3500 chars', () => {
    const bigCurrent = { meta: { businessName: 'x'.repeat(5000) } }
    const prompt = buildRevisionPrompt(bigCurrent, 'msg')
    const stateSection = prompt.split('State website saat ini:\n')[1].split('\n\nRevisi diminta')[0]
    expect(stateSection.length).toBeLessThanOrEqual(3500)
  })
})
