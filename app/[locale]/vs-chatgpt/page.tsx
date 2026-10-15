import { TopicPage, topicMetadata } from '@/components/topic/TopicPage'

export const generateMetadata = () => topicMetadata('vs-chatgpt')

export default function Page() {
  return <TopicPage id="vs-chatgpt" />
}
