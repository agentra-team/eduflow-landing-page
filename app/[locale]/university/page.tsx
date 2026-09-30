import { LevelPage, levelMetadata } from '@/components/level/LevelPage'

export const generateMetadata = () => levelMetadata('university')

export default function UniversityPage() {
  return <LevelPage level="university" />
}
