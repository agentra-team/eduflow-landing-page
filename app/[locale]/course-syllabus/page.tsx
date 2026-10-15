import { TopicPage, topicMetadata } from '@/components/topic/TopicPage'

export const generateMetadata = () => topicMetadata('course-syllabus')

export default function Page() {
  return <TopicPage id="course-syllabus" />
}
