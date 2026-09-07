import { useState } from 'react'
import { englishStorageKey } from '../english-learning'
import type { Language } from '../types'
import { EnglishContinuousContextPractice } from './EnglishContinuousContextPractice'
import { EnglishLearningStudio } from './EnglishLearningStudioV4'
import { EnglishPathMaterials } from './EnglishPathMaterials'
import '../learning-materials.css'

export function EnglishMaterialsHub({ language, userId }: { language: Language; userId: string }) {
  const [mode, setMode] = useState<'home' | 'epop' | 'path' | 'assessment'>('home')
  const zh = language === 'zh'
  return <div className={`materials-hub materials-${mode}`}>
    <header className="materials-header"><div><small>{zh ? '輔助教材區 / 英文' : 'Learning materials / English'}</small><h1>{mode === 'epop' ? (zh ? '情境練習' : 'Context practice') : mode === 'path' ? (zh ? '闖關學習' : 'Learning path') : (zh ? '英文教材' : 'English materials')}</h1></div>{mode !== 'home' && <button onClick={() => setMode('home')}>{zh ? '← 切換學習模式' : '← Choose a mode'}</button>}</header>
    {mode === 'home' && <main className="materials-home"><p>{zh ? '今天想怎麼學？' : 'How would you like to learn today?'}</p><div className="materials-modes">
      <button className="materials-mode epop" onClick={() => setMode('epop')}><small>{zh ? 'EPOP 式' : 'EPOP-style'}</small><h2>{zh ? '情境練習' : 'Context practice'}</h2><p>{zh ? '看情境、填單字，從完整句子理解用法。' : 'Fill in words and learn their meaning in complete sentences.'}</p><div className="materials-example">I’d like a <span>_____</span> of tea.<small>{zh ? '我想要一杯茶。' : 'Hint: a drinking container'}</small></div><span>{zh ? '開始練習 →' : 'Start practicing →'}</span></button>
      <button className="materials-mode path" onClick={() => setMode('path')}><small>{zh ? '多鄰國式' : 'Duolingo-style'}</small><h2>{zh ? '闖關學習' : 'Learning path'}</h2><p>{zh ? '沿著路線學習，透過選詞、組句與聽力完成短課程。' : 'Follow short lessons with word choice, sentence building and listening.'}</p><div className="materials-example">01 → 02 → 03<small>{zh ? '打招呼・點餐・問路' : 'Greetings · Ordering · Directions'}</small></div><span>{zh ? '查看學習路線 →' : 'Explore the path →'}</span></button>
    </div><p className="materials-note">{zh ? '兩種模式採用 Bubble Space 自編教材；非 EPOP 或多鄰國官方課程。學習進度儲存在目前瀏覽器。' : 'Original Bubble Space materials, independent of EPOP and Duolingo. Progress is saved in this browser.'}</p></main>}
    {mode === 'epop' && <EnglishContinuousContextPractice language={language} userId={userId} onBack={() => setMode('home')} onRetest={() => { window.localStorage.removeItem(englishStorageKey(userId, 'assessment-result')); setMode('assessment') }} />}
    {mode === 'path' && <EnglishPathMaterials language={language} userId={userId} />}
    {mode === 'assessment' && <EnglishLearningStudio language={language} userId={userId} />}
  </div>
}
