import {
  CurriculumCourseApp as CurriculumCourseAppV13,
  type CurriculumCourseSelection,
} from './CurriculumCourseAppV13'
import type { Language } from '../types'

export type { CurriculumCourseSelection }

type Props = CurriculumCourseSelection & {
  language: Language
  userId: string
}

export function CurriculumCourseApp(props: Props) {
  const routeKey = `${props.grade}-${props.subject}-${props.pathway ?? 'base'}`
  return <CurriculumCourseAppV13 key={routeKey} {...props} />
}
