import { notFound } from 'next/navigation'

// Mọi đường dẫn lạ trong một locale → 404 theo ngôn ngữ (spec §6.8).
export default function CatchAllPage() {
  notFound()
}
