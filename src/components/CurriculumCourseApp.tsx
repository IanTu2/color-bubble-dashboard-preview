import {
  CurriculumCourseApp as CurriculumCourseAppV17,
  type CurriculumCourseSelection,
} from './CurriculumCourseAppV17'
import type { Language } from '../types'

export type { CurriculumCourseSelection }

type Props = CurriculumCourseSelection & {
  language: Language
  userId: string
}

export function CurriculumCourseApp(props: Props) {
  const routeKey = `${props.grade}-${props.subject}-${props.pathway ?? 'base'}-pedagogy-v17`
  return <CurriculumCourseAppV17 key={routeKey} {...props} />
}
