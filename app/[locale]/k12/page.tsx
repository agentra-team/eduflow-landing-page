import { LevelPage, levelMetadata } from '@/components/level/LevelPage'

export const generateMetadata = () => levelMetadata('k12')

export default function K12Page() {
  return <LevelPage level="k12" />
}
