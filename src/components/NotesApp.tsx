import { useEffect, useState } from 'react'
import type { Language } from '../types'

type Note = {
  id: string
  title: string
  body: string
  updatedAt: string
}

type NotesAppProps = {
  language: Language
  userId: string
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const stored = window.localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

export function NotesApp({ language, userId }: NotesAppProps) {
  const notesKey = `bubble-space-v2-workspace-${userId}-notes`
  const selectedKey = `${notesKey}-selected`
  const [notes, setNotes] = useState<Note[]>(() => readJson(notesKey, []))
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(() => readJson(selectedKey, null))

  const copy = language === 'zh'
    ? {
        newNote: '新增筆記',
        untitled: '未命名筆記',
        noteTitle: '筆記標題',
        noteBody: '開始輸入內容…',
        deleteNote: '刪除筆記',
        empty: '建立第一份筆記開始使用',
      }
    : {
        newNote: 'New note',
        untitled: 'Untitled note',
        noteTitle: 'Note title',
        noteBody: 'Start writing…',
        deleteNote: 'Delete note',
        empty: 'Create your first note to get started',
      }

  useEffect(() => {
    window.localStorage.setItem(notesKey, JSON.stringify(notes))
    window.localStorage.setItem(selectedKey, JSON.stringify(selectedNoteId))
  }, [notes, notesKey, selectedKey, selectedNoteId])

  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? notes[0] ?? null

  useEffect(() => {
    if (!selectedNoteId && notes[0]) setSelectedNoteId(notes[0].id)
  }, [notes, selectedNoteId])

  const addNote = () => {
    const note: Note = {
      id: createId(),
      title: copy.untitled,
      body: '',
      updatedAt: new Date().toISOString(),
    }
    setNotes((current) => [note, ...current])
    setSelectedNoteId(note.id)
  }

  const updateNote = (changes: Partial<Pick<Note, 'title' | 'body'>>) => {
    if (!selectedNote) return
    setNotes((current) => current.map((note) => (
      note.id === selectedNote.id
        ? { ...note, ...changes, updatedAt: new Date().toISOString() }
        : note
    )))
  }

  const removeSelectedNote = () => {
    if (!selectedNote) return
    const remaining = notes.filter((note) => note.id !== selectedNote.id)
    setNotes(remaining)
    setSelectedNoteId(remaining[0]?.id ?? null)
  }

  return (
    <section className="desktop-notes-app">
      <aside className="desktop-note-sidebar">
        <button className="primary-button desktop-note-add" type="button" onClick={addNote}>＋ {copy.newNote}</button>
        <div className="desktop-note-list">
          {notes.length === 0 ? <p className="desktop-app-empty">{copy.empty}</p> : null}
          {notes.map((note) => (
            <button
              className={note.id === selectedNote?.id ? 'active' : ''}
              type="button"
              key={note.id}
              onClick={() => setSelectedNoteId(note.id)}
            >
              <strong>{note.title || copy.untitled}</strong>
              <span>{new Intl.DateTimeFormat(language === 'zh' ? 'zh-TW' : 'en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }).format(new Date(note.updatedAt))}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className="desktop-note-editor">
        {selectedNote ? (
          <>
            <div className="desktop-note-editor-head">
              <input
                value={selectedNote.title}
                aria-label={copy.noteTitle}
                onChange={(event) => updateNote({ title: event.target.value })}
              />
              <button type="button" onClick={removeSelectedNote}>{copy.deleteNote}</button>
            </div>
            <textarea
              value={selectedNote.body}
              placeholder={copy.noteBody}
              onChange={(event) => updateNote({ body: event.target.value })}
            />
          </>
        ) : (
          <div className="desktop-app-empty centered">{copy.empty}</div>
        )}
      </div>
    </section>
  )
}
