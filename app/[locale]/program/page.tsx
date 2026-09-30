import { LevelPage, levelMetadata } from '@/components/level/LevelPage'

export const generateMetadata = () => levelMetadata('program')

export default function ProgramPage() {
  return <LevelPage level="program" />
}
