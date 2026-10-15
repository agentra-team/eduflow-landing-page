import { TopicPage, topicMetadata } from '@/components/topic/TopicPage'

export const generateMetadata = () => topicMetadata('lesson-plans')

export default function Page() {
  return <TopicPage id="lesson-plans" />
}
