import { TopicPage, topicMetadata } from '@/components/topic/TopicPage'

export const generateMetadata = () => topicMetadata('test-generator')

export default function Page() {
  return <TopicPage id="test-generator" />
}
