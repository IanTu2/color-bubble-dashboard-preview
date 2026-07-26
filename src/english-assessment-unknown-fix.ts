let installed = false

export function installEnglishAssessmentUnknownFix() {
  if (installed || typeof document === 'undefined') return
  installed = true

  document.addEventListener('click', (event) => {
    const target = event.target
    if (!(target instanceof Element)) return

    const unknownButton = target.closest<HTMLButtonElement>(
      '.english-assessment .assessment-actions > button:first-child',
    )

    if (!unknownButton || unknownButton.disabled) return

    const form = unknownButton.closest('form')
    if (!form) return

    window.setTimeout(() => {
      if (!form.isConnected) return

      const submitButton = form.querySelector<HTMLButtonElement>('button[type="submit"]')
      if (submitButton && !submitButton.disabled) submitButton.click()
    }, 0)
  })
}
