import { useEffect, useMemo, useState } from 'react'
import type { Language } from '../types'
import { englishStorageKey, readEnglishStored, speakEnglish } from '../english-learning'
import { MATERIAL_UNITS, normalizePathAnswer } from '../english-materials-path'

type Session = { unit: number; queue: number[]; index: number; mistakes: number[]; correct: number; review: boolean }
function readCompleted(key: string): number[] {
  const data = readEnglishStored<unknown>(key, [])
  return Array.isArray(data) ? [...new Set(data.filter((v): v is number => Number.isInteger(v) && v >= 0 && v < MATERIAL_UNITS.length))] : []
}
export function EnglishPathMaterials({ language, userId }: { language: Language; userId: string }) {
  const zh = language === 'zh'
  const key = englishStorageKey(userId, 'materials-path-v1')
  const [completed, setCompleted] = useState(() => readCompleted(key))
  const [session, setSession] = useState<Session | null>(null)
  const [response, setResponse] = useState('')
  const [tokens, setTokens] = useState<number[]>([])
  const [feedback, setFeedback] = useState<boolean | null>(null)
  const [summary, setSummary] = useState(false)
  const [storageError, setStorageError] = useState(false)
  const audioAvailable = 'speechSynthesis' in window
  const questionIndex = session?.queue[session.index] ?? 0
  const sentence = MATERIAL_UNITS[session?.unit ?? 0].sentences[Math.floor(questionIndex / 3)]
  const kind = questionIndex % 3
  const words = useMemo(() => sentence.en.replace(/[.!?]/g, '').split(' ').map((word, id) => ({ word, id })).reverse(), [sentence])
  const options = useMemo(() => [sentence.word, ...sentence.distractors].sort((a,b) => a.localeCompare(b)), [sentence])
  const expected = kind === 0 ? sentence.word : sentence.en
  const actual = kind === 1 ? tokens.map(id => words.find(w => w.id === id)!.word).join(' ') : response
  const reset = () => { setResponse(''); setTokens([]); setFeedback(null) }
  useEffect(() => () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel() }, [])
  const start = (unit: number) => { reset(); setSummary(false); setSession({ unit, queue: Array.from({ length: 9 }, (_, i) => i), index: 0, mistakes: [], correct: 0, review: false }) }
  const check = () => {
    if (!session || feedback !== null || !actual.trim()) return
    const correct = normalizePathAnswer(actual) === normalizePathAnswer(expected)
    setFeedback(correct)
    setSession({ ...session, correct: session.correct + (correct ? 1 : 0), mistakes: correct ? session.mistakes : [...session.mistakes, questionIndex] })
  }
  const next = () => {
    if (!session || feedback === null) return
    reset()
    if (session.index + 1 < session.queue.length) { setSession({ ...session, index: session.index + 1 }); return }
    if (session.mistakes.length) { setSession({ ...session, queue: [...new Set(session.mistakes)], index: 0, mistakes: [], review: true }); return }
    const updated = [...new Set([...completed, session.unit])]
    setCompleted(updated)
    try { window.localStorage.setItem(key, JSON.stringify(updated)); setStorageError(false) } catch { setStorageError(true) }
    setSummary(true)
  }
  if (session && summary) return <main className="materials-lesson materials-summary"><span className="materials-success">✓</span><h2>{zh ? '這一關完成了！' : 'Lesson complete!'}</h2><p>{zh ? '本關的句型都練習完成，錯題也已重新答對。' : 'You practiced every sentence and corrected all mistakes.'}</p>{storageError && <p role="alert">{zh ? '目前瀏覽器無法儲存進度，關閉頁面後可能遺失。' : 'Progress could not be saved in this browser.'}</p>}<button className="materials-primary" onClick={() => { setSession(null); setSummary(false) }}>{zh ? '返回學習路線' : 'Back to the path'}</button></main>
  if (!session) return <main className="materials-path"><div className="materials-path-intro"><h2>{zh ? '生活英文 · 入門路線' : 'Everyday English · Starter path'}</h2><p>{zh ? '6 個單元，每關 9 題。答錯的題目會在關末再練一次。' : '6 units, 9 exercises each. Revisit mistakes before unlocking the next unit.'}</p><span>{completed.length} / {MATERIAL_UNITS.length} {zh ? '單元完成' : 'units complete'}</span></div><ol className="materials-path-nodes">{MATERIAL_UNITS.map((unit, index) => {
    const done = completed.includes(index)
    const locked = index > 0 && !completed.includes(index - 1)
    return <li key={unit.title} className={done ? 'done' : locked ? 'locked' : 'current'}><button disabled={locked} onClick={() => start(index)} aria-label={`${zh ? unit.title : unit.titleEn} — ${zh ? done ? '複習' : locked ? '尚未解鎖' : '開始' : done ? 'Review' : locked ? 'Locked' : 'Start'}`}><span>{done ? '✓' : index + 1}</span></button><div><strong>{zh ? unit.title : unit.titleEn}</strong><small>{zh ? done ? '已完成・可再次複習' : locked ? '完成上一關後解鎖' : '開始這一關' : done ? 'Completed · Review anytime' : locked ? 'Complete the previous unit' : 'Start this lesson'}</small></div></li>
  })}</ol></main>
  return <main className="materials-lesson"><div className="materials-lesson-top"><button onClick={() => { setSession(null); reset() }}>{zh ? '← 返回路線' : '← Back to path'}</button><span>{session.review ? (zh ? '錯題複習' : 'Review mistakes') : (zh ? '短課程' : 'Short lesson')} · {session.index + 1}/{session.queue.length}</span></div><progress aria-label={zh ? '本輪進度' : 'Round progress'} max={session.queue.length} value={session.index + (feedback !== null ? 1 : 0)}/>
    <h2>{zh ? kind === 0 ? '選出適合的單字' : kind === 1 ? '組成這個句子' : audioAvailable ? '聽一聽，輸入句子' : '依中文提示寫出句子' : kind === 0 ? 'Choose the missing word' : kind === 1 ? 'Build the sentence' : audioAvailable ? 'Listen and type' : 'Translate the sentence'}</h2>
    {(kind !== 2 || !audioAvailable) && <p className="materials-cue">{sentence.zh}</p>}
    {kind === 0 && <p className="materials-sentence">{sentence.en.replace(new RegExp(`\\b${sentence.word}\\b`), '_____')}</p>}
    {kind === 2 && audioAvailable && <button className="materials-audio" onClick={() => speakEnglish(sentence.en, 'en-US')}>{zh ? '▶ 播放句子' : '▶ Play sentence'}</button>}
    {kind === 2 && !audioAvailable && <p>{zh ? '此瀏覽器不支援朗讀，這題改為翻譯練習。' : 'Speech playback is unavailable; this is a translation exercise.'}</p>}
    <form onSubmit={e => { e.preventDefault(); feedback === null ? check() : next() }}>
      {kind === 0 && <div className="materials-options">{options.map(word => <button type="button" key={word} disabled={feedback !== null} aria-pressed={response === word} onClick={() => setResponse(word)}>{word}</button>)}</div>}
      {kind === 1 && <><div className="materials-answer-slots" aria-label={zh ? '已選單字，點擊移除' : 'Selected words; click to remove'}>{tokens.map(id => <button type="button" key={id} disabled={feedback !== null} onClick={() => setTokens(tokens.filter(v => v !== id))}>{words.find(w => w.id === id)!.word}</button>)}</div><div className="materials-options">{words.map(({word,id}) => <button type="button" key={id} disabled={tokens.includes(id) || feedback !== null} onClick={() => setTokens([...tokens,id])}>{word}</button>)}</div></>}
      {kind === 2 && <label className="materials-answer-label">{zh ? '你的英文句子' : 'Your sentence'}<input value={response} onChange={e => setResponse(e.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} disabled={feedback !== null}/></label>}
      {feedback !== null && <section role="status" className={`materials-feedback ${feedback ? 'correct' : 'incorrect'}`}><strong>{zh ? feedback ? '答對了！' : '再看一次，稍後會複習這題' : feedback ? 'Correct!' : 'Study the answer; you will try again'}</strong><p>{sentence.en}</p><p>{sentence.zh}</p><p>{zh ? sentence.note : `Target expression: ${sentence.word}. Read the full example above.`}</p>{audioAvailable && <button type="button" onClick={() => speakEnglish(sentence.en, 'en-US')}>{zh ? '▶ 聽完整句子' : '▶ Hear the sentence'}</button>}</section>}
      <button className="materials-primary" disabled={feedback === null && !actual.trim()} type="submit">{zh ? feedback === null ? '檢查答案' : '繼續' : feedback === null ? 'Check answer' : 'Continue'}</button>
    </form>
  </main>
}
