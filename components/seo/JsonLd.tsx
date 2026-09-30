/** Chèn JSON-LD; thoát '<' để không thể đóng thẻ script từ dữ liệu. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}
