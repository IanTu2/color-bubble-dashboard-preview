import {
  CurriculumCourseApp as CurriculumCourseAppV14,
  type CurriculumCourseSelection,
} from './CurriculumCourseAppV14'
import type { Language } from '../types'

export type { CurriculumCourseSelection }

type Props = CurriculumCourseSelection & {
  language: Language
  userId: string
}

export function CurriculumCourseApp(props: Props) {
  const routeKey = `${props.grade}-${props.subject}-${props.pathway ?? 'base'}-textbook-v14`
  return <CurriculumCourseAppV14 key={routeKey} {...props} />
}
