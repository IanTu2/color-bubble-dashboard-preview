import { resolveCurriculumUnit } from './curriculum-plan-v5'
import type { ReviewedQuestion } from './curriculum-reviewed-social10'
import { getTextbookUnitContentV18 } from './curriculum-pedagogy-v18'
import { validateTextbookUnitV14, type TextbookUnitContentV14 } from './curriculum-textbook-v14'
import { buildChineseV21 } from './curriculum-v21-chinese'
import { buildEnglishV21 } from './curriculum-v21-english'
import { buildMathV21 } from './curriculum-v21-math'
import { buildScienceV21 } from './curriculum-v21-science'
import { buildSocialV21 } from './curriculum-v21-social'
import { preserveSources, type V21SubjectBuild } from './curriculum-v21-common'

export type V21Inspection = {
  unit: TextbookUnitContentV14 | null
  validation: ReturnType<typeof validateTextbookUnitV14>
  familyId?: string
  familyLabel?: string
}

function buildForSubject(unitId: string, base: TextbookUnitContentV14): V21SubjectBuild | null {
  const context = resolveCurriculumUnit(unitId)
  if (!context) return null
  if (context.subject === 'chinese') return buildChineseV21(context, base)
  if (context.subject === 'english') return buildEnglishV21(context, base)
  if (context.subject === 'math') return buildMathV21(context, base)
  if (context.subject === 'science') return buildScienceV21(context, base)
  if (context.subject === 'social') return buildSocialV21(context, base)
  return null
}

export function inspectTextbookUnitV21(unitId: string): V21Inspection {
  const base = getTextbookUnitContentV18(unitId)
  if (!base) {
    const validation = validateTextbookUnitV14(null as unknown as TextbookUnitContentV14)
    return { unit: null, validation }
  }
  const build = buildForSubject(unitId, base)
  if (!build) return { unit: base, validation: validateTextbookUnitV14(base) }

  const unit: TextbookUnitContentV14 = {
    ...base,
    overview: build.overview,
    objectives: build.objectives,
    concepts: build.concepts,
    misconceptions: build.misconceptions,
    visuals: build.visuals,
    workedExamples: build.workedExamples,
    questions: build.questions,
    takeaway: build.takeaway,
    researchBasis: preserveSources(base, `Bubble Space V21：${build.familyLabel}單元專屬教材重建；例題、正式題目與迷思不得跨不相關單元共用。`),
  }
  return {
    unit,
    validation: validateTextbookUnitV14(unit),
    familyId: build.familyId,
    familyLabel: build.familyLabel,
  }
}

const cache = new Map<string, TextbookUnitContentV14 | null>()

export function getTextbookUnitContentV21(unitId: string): TextbookUnitContentV14 | null {
  if (cache.has(unitId)) return cache.get(unitId) ?? null
  const inspected = inspectTextbookUnitV21(unitId)
  const unit = inspected.unit && inspected.validation.ready ? inspected.unit : null
  cache.set(unitId, unit)
  return unit
}

export function getConceptChecksV21(unit: TextbookUnitContentV14): ReviewedQuestion[] {
  return unit.questions.filter((question) => question.id.includes('-ped-v21-check-'))
}
