import { TopicPage, topicMetadata } from '@/components/topic/TopicPage'

export const generateMetadata = () => topicMetadata('lesson-slides')

export default function Page() {
  return <TopicPage id="lesson-slides" />
}
