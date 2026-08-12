import {
  buildUnitLessons,
  type CurriculumCourseBundle,
  type CurriculumUnitBundle,
} from './curriculum-course-engine'
import {
  getCurriculumTrack,
  type CurriculumPathwayId,
  type CurriculumSubjectId,
} from './curriculum-plan-v5'

export type CurriculumCourseBundleV13 = CurriculumCourseBundle & {
  pathway?: CurriculumPathwayId
}

export function getCurriculumCourseBundleV13(
  grade: number,
  subject: CurriculumSubjectId,
  pathway?: CurriculumPathwayId,
): CurriculumCourseBundleV13 | null {
  const track = getCurriculumTrack(grade, subject, pathway)
  if (!track) return null
  return {
    grade: track.grade,
    subject: track.subject,
    pathway,
    sourceBasis: track.sourceBasis,
    note: track.note,
    semesters: track.semesters.map((semester) => ({
      semester: semester.semester,
      units: semester.units.map((unit): CurriculumUnitBundle => ({
        ...unit,
        lessons: buildUnitLessons(grade, subject, unit),
      })),
    })),
  }
}
