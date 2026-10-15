import { TopicPage, topicMetadata } from '@/components/topic/TopicPage'

export const generateMetadata = () => topicMetadata('test-versions')

export default function Page() {
  return <TopicPage id="test-versions" />
}
