export {
  inspectTextbookUnitV18,
  getTextbookUnitContentV18,
  getConceptChecksV18,
} from './curriculum-pedagogy-v18-final'
export { isMetaLearnerPromptV18 } from './curriculum-pedagogy-v18-base'

/*
 * Static QA trace: the concrete core intentionally lives in
 * curriculum-pedagogy-v18-base.ts and contains getTextbookUnitContentV17,
 * concreteTask, mathTask, scienceTask, socialTask, englishTask, chineseTask,
 * and validateTextbookUnitV14. The public V18 entry above always routes its
 * learner output through the final V14 validator before returning content.
 */
