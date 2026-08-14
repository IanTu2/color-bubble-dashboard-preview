import {
  CurriculumCourseApp as CurriculumCourseAppV18,
  type CurriculumCourseSelection,
} from './CurriculumCourseAppV17'
import type { Language } from '../types'

export type { CurriculumCourseSelection }

type Props = CurriculumCourseSelection & {
  language: Language
  userId: string
}

export function CurriculumCourseApp(props: Props) {
  const routeKey = `${props.grade}-${props.subject}-${props.pathway ?? 'base'}-user-audit-v18`
  return <CurriculumCourseAppV18 key={routeKey} {...props} />
}
