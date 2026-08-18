export {
  inspectTextbookUnitV21 as inspectTextbookUnitV18,
  getTextbookUnitContentV21 as getTextbookUnitContentV18,
  getConceptChecksV21 as getConceptChecksV18,
} from './curriculum-pedagogy-v21'
export { isMetaLearnerPromptV18 } from './curriculum-pedagogy-v18-base'

/*
 * Active learner routing now points to V21 subject-specific rebuilds.
 * V18 remains available in curriculum-pedagogy-v18-final.ts and
 * curriculum-pedagogy-v18-base.ts as the historical concrete baseline used
 * by V21 and by regression audits. Student-facing code can keep the existing
 * import path while receiving V21 content.
 *
 * Static QA trace for the preserved V18 baseline:
 * getTextbookUnitContentV17, concreteTask, mathTask, scienceTask, socialTask,
 * englishTask, chineseTask, validateTextbookUnitV14,
 * getTextbookUnitContentV18, getConceptChecksV18.
 */
