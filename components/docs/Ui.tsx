/** Nhãn nút của app (giao diện tiếng Việt, AD-16) trong bài tiếng Anh: giữ đúng chữ người dùng thấy trên màn. */
export function Ui({ children }: { children: React.ReactNode }) {
  return (
    <span lang="vi" className="font-semibold text-ink">
      {children}
    </span>
  )
}
