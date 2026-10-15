import { appFacts } from '@/lib/seo/app-facts'
import type { TopicCopy, TopicId } from './index'

/*
 * Nội dung trang chủ đề tiếng Việt. Mọi câu phải đúng với app (đối chiếu repo eduflow-application, nhánh main, ngày viết);
 * mọi con số đi qua lib/seo/app-facts.ts. Sản phẩm đổi thì sửa ở đây trước, vì trợ lý AI trả lời theo đúng những gì trang này viết.
 * Nguồn của trang "AI tạo đề kiểm tra theo ma trận" (đối chiếu ngày 15/10/2026): bài soan-de-kiem-tra và xuat-nhieu-ma-de của site
 * (đã kiểm với app), packages/render/src/layout2.ts:143-171 (bản đặc tả), packages/core/src/verify.ts:9-11 (kiểm chứng đáp án),
 * v2-scope V2-05 và V2-09 (phần chưa làm).
 */
export const TOPICS_VI: Record<TopicId, TopicCopy> = {
  'test-generator': {
    name: 'AI tạo đề kiểm tra theo ma trận',
    metaTitle: 'AI tạo đề kiểm tra theo ma trận và bản đặc tả',
    description: 'AI tạo đề kiểm tra theo ma trận và bản đặc tả: lập ma trận bốn mức, để AI viết câu hỏi, máy kiểm cổng chất lượng, thầy cô duyệt đề rồi xuất đề và đáp án.',
    keywords: ['AI tạo đề kiểm tra', 'ma trận đề kiểm tra', 'bản đặc tả đề kiểm tra', 'AI tạo đề theo ma trận'],
    eyebrow: 'Ma trận và bản đặc tả đề kiểm tra',
    h1: 'AI tạo đề kiểm tra theo ma trận và bản đặc tả, thầy cô duyệt trước khi dùng',
    lead: 'EduFlow cho AI viết câu hỏi theo số câu của từng ô trong ma trận bốn mức. Máy kiểm đề qua các cổng chất lượng, thầy cô sửa và duyệt, rồi xuất đề, đáp án và bản đặc tả để in.',
    card: 'Lập ma trận bốn mức, để AI viết câu hỏi, kiểm cổng chất lượng, duyệt rồi xuất đề và đáp án.',
    inShort:
      'AI tạo đề kiểm tra trong EduFlow đi từ ma trận: thầy cô lập ma trận chủ đề theo bốn mức nhận thức, AI viết câu hỏi cho từng ô, máy kiểm cổng chất lượng, thầy cô sửa và duyệt rồi xuất đề, đáp án và bản đặc tả.',
    definition: {
      h2: 'Ma trận và bản đặc tả đề kiểm tra là gì?',
      term: 'Ma trận đề kiểm tra',
      rest: 'là bảng các chủ đề đặt theo bốn mức nhận thức (nhận biết, thông hiểu, vận dụng, vận dụng cao), mỗi ô ghi số câu hỏi của chủ đề ở mức đó. Tổng các ô là số câu của đề, nên nhìn ma trận là biết đề nghiêng về mức nào trước khi viết bất kỳ câu nào.',
      paras: [
        'Bản đặc tả đề kiểm tra mô tả từng câu của đề: câu thuộc phần nào, chủ đề nào, mức nào và kiểm tra yêu cầu cần đạt (YCCĐ) nào của chương trình. Trong EduFlow, bản đặc tả là một bảng có các cột Phần, Câu, Mức độ, Chủ đề và Yêu cầu cần đạt, in cùng ma trận ở tài liệu "Ma trận và bản đặc tả".',
        'Số câu từng ô là chuẩn để đối chiếu cả quy trình: AI viết câu theo ô, cổng chất lượng P3 kiểm số câu từng ô có đúng ma trận không, và bản đặc tả liệt kê câu theo mức và chủ đề. Vì vậy thầy cô chốt ma trận trước, rồi mới để AI viết.',
      ],
    },
    table: {
      h2: 'Soạn đề tay, dùng ChatGPT và dùng EduFlow',
      caption: 'So sánh ba cách tạo một đề kiểm tra theo ma trận: soạn tay, dùng ChatGPT hay công cụ chat chung, và dùng EduFlow',
      checkedAt: '2026-10-15',
      head: ['Tiêu chí', 'Soạn tay', 'ChatGPT hay công cụ chung', 'EduFlow'],
      rows: [
        [
          'Bám số câu từng ô của ma trận',
          'Thầy cô tự đếm số câu từng ô khi viết.',
          'Thầy cô nêu số câu từng ô trong lời nhắc và tự đếm lại kết quả.',
          'AI viết câu theo số câu từng ô. Cổng P3 kiểm số câu từng ô; nếu lệch, app tự sinh lại tối đa 2 lần.',
        ],
        [
          'Bản đặc tả đi kèm',
          'Thầy cô tự lập bảng riêng.',
          'Có thể nhờ lập bảng theo yêu cầu; thầy cô tự chỉnh khuôn trình bày.',
          'Có tài liệu Ma trận và bản đặc tả, liệt kê từng câu theo mức, chủ đề và yêu cầu cần đạt.',
        ],
        [
          'Kiểm lại đáp án',
          'Thầy cô tự giải lại từng câu.',
          'Có thể nhờ giải lại trong cuộc trò chuyện; thầy cô đối chiếu kết quả.',
          'Khi ma trận có câu Vận dụng hoặc Vận dụng cao, một lượt AI độc lập giải lại. Cảnh báo đáp án cần thầy cô xác nhận từng câu.',
        ],
        [
          'Nhiều mã đề',
          'Thầy cô tự đảo câu và phương án rồi lập đáp án từng mã.',
          'Có thể nhờ đảo thứ tự; thầy cô tự kiểm đáp án của từng mã.',
          `Tối đa ${appFacts.maxTestVersions} mã (101 tới 124), xáo câu và đáp án tất định, có kiểm đáp án khớp từng mã trước khi lưu.`,
        ],
        [
          'Tệp in được cho phòng thi',
          'Thầy cô dàn trang trong trình soạn văn bản.',
          'Cho ra văn bản để thầy cô dán và dàn trang.',
          'Xuất PDF hoặc DOCX; đề thi, đáp án và hướng dẫn chấm, ma trận và bản đặc tả ở ba tài liệu riêng.',
        ],
        [
          'Ai duyệt đề',
          'Thầy cô soát lại và duyệt theo quy trình của trường.',
          'Thầy cô soát lại nội dung và tự ghi nhận việc duyệt.',
          'Đề ở trạng thái Đề xuất tới khi thầy cô bấm Duyệt; bằng chứng duyệt lưu vào phiên bản. Chưa duyệt vẫn xuất được nhưng bản xuất mang dấu chìm DÙNG THỬ.',
        ],
      ],
    },
    blocks: [
      {
        h2: 'Bốn mức nhận thức trong EduFlow',
        paras: [
          'Cột của ma trận là bốn mức: Nhận biết (NB), Thông hiểu (TH), Vận dụng (VD) và Vận dụng cao (VDC). Thầy cô nhập số câu vào từng ô, hoặc dùng ba nút Rải nhanh chia tổng số câu cho các chủ đề theo tỷ lệ mẫu.',
        ],
        items: [
          { title: '15 phút', text: '10 câu, tỷ lệ NB, TH, VD, VDC là 50, 30, 20, 0.' },
          { title: '45 phút giữa kỳ', text: '20 câu, tỷ lệ 40, 30, 20, 10.' },
          { title: 'Cuối kỳ', text: '28 câu, tỷ lệ 30, 40, 20, 10.' },
          {
            title: 'Cỡ ma trận',
            text: `Một ma trận có tối đa ${appFacts.matrixMaxRows} dòng chủ đề, một đề tối đa ${appFacts.testMaxItems} câu và mỗi chủ đề tối đa ${appFacts.topicMaxItems} câu. Ma trận cũng nhập và xuất được bằng tệp CSV để sửa ở bảng tính.`,
          },
        ],
      },
      {
        h2: 'Cổng chất lượng của đề',
        paras: [
          `Sau khi AI viết xong, bước Xuất hiện Bảng cổng gồm ${appFacts.testGates} cổng. Mỗi hàng ghi mã cổng, số đơn vị đã kiểm (câu, ô của ma trận, phiên bản), số vi phạm và kết quả. Cổng nào kiểm 0 đơn vị không được coi là đạt: app ghi Lỗi cổng, vì khi đó dữ liệu đầu vào có vấn đề.`,
        ],
        items: [
          { title: 'P3', text: 'Số câu từng ô đúng ma trận.' },
          { title: 'P5', text: 'Mỗi câu có đúng 4 phương án và 1 đáp án; đáp án còn cảnh báo thì cần xác nhận.' },
          { title: 'P11', text: 'Mỗi câu có neo yêu cầu cần đạt (YCCĐ).' },
          { title: 'P10', text: 'Đề đã được giáo viên duyệt; ghi Chờ duyệt cho tới khi thầy cô duyệt.' },
          { title: 'P1, P2, P4', text: 'Ở bản này ghi Không áp dụng hoặc Tắt, vì app chưa biên dịch bằng LaTeX và chưa có hình trong câu.' },
          {
            title: 'Chi phí',
            text: 'Trước khi AI chạy, app hiện hộp Ước tính chi phí; bấm Huỷ thì không có tác vụ nào được tạo và không tốn gì. Cách tính xem ở trang',
            link: { page: '/pricing', label: 'Chi phí EduFlow' },
          },
        ],
      },
    ],
    howTo: {
      h2: 'Tạo đề theo ma trận bằng EduFlow',
      lead: 'Các bước dưới đây theo đúng màn Soạn đề kiểm tra của app; mỗi bước có bài hướng dẫn chi tiết.',
      steps: [
        {
          title: 'Mở màn Soạn đề kiểm tra',
          text: 'Bấm Tạo đề ở Trang chủ, Soạn đề ở thanh bên hoặc Soạn đề mới trong một dự án Phổ thông, rồi chọn Môn và Lớp. Đề được tạo ngay trên máy.',
          doc: 'create-a-test',
        },
        {
          title: 'Thiết lập đề',
          text: 'Chọn chương trong khung GDPT 2018 có sẵn trên máy, loại đề, thời gian, hình thức (Trắc nghiệm, hoặc Kết hợp trắc nghiệm và tự luận) và thang điểm. Khung đầu đề chỉ in lên đề, không gửi cho AI.',
          doc: 'create-a-test',
        },
        {
          title: 'Lập ma trận chủ đề theo bốn mức',
          text: 'Nhập số câu vào từng ô NB, TH, VD, VDC của các chủ đề, hoặc dùng Rải nhanh. Ma trận chưa có câu nào thì nút Sinh câu hỏi bị khoá kèm lý do.',
          doc: 'create-a-test',
        },
        {
          title: 'Để AI viết câu hỏi',
          text: 'Bấm Sinh câu hỏi, xem khoảng tiền ước tính trong hộp thoại rồi bấm Chạy. Chạy xong, câu được xếp theo chủ đề và mức ở bước Câu hỏi, mỗi câu có nút Sửa.',
          doc: 'create-a-test',
        },
        {
          title: 'Đọc cổng chất lượng và duyệt',
          text: 'Ở bước Xuất, đọc Bảng cổng, xác nhận từng cảnh báo đáp án rồi bấm Duyệt. Ở cấp Phổ thông, Duyệt là bước cuối, không có thêm bước ký riêng.',
          doc: 'create-a-test',
        },
        {
          title: 'Xuất nhiều mã đề',
          text: `Chọn số mã đề từ 1 tới ${appFacts.maxTestVersions}, bật hay tắt xáo trộn câu hỏi và đáp án, đọc Kiểm tra bản xuất rồi xuất PDF hoặc DOCX cho đề thi, đáp án và ma trận.`,
          doc: 'export-test-versions',
        },
      ],
    },
    limits: {
      h2: 'EduFlow chưa làm gì',
      items: [
        'Câu đúng sai, câu trả lời ngắn và câu tự luận có ý nhỏ (nhiều ý, mỗi ý có điểm): chưa có, thuộc lộ trình. Đề hiện có hai hình thức là Trắc nghiệm, và Kết hợp trắc nghiệm và tự luận với bài tự luận có điểm và hướng dẫn chấm.',
        'Ba mức Biết, Hiểu, Vận dụng của Công văn 7991: chưa có; ma trận hiện dùng bốn mức.',
        'Hình vẽ trong câu hỏi và biên dịch LaTeX ra PDF: chưa có. AI không vẽ hình; công thức viết trong câu hỏi vẫn hiện ở màn xem trước.',
        'Tải một đề mẫu lên để AI phân tích rồi soạn lại: chưa có, thuộc lộ trình. Ma trận thì nhập được từ tệp CSV.',
        'AI chỉ viết bản đề xuất: thầy cô kiểm tra, sửa và duyệt trước khi dùng trên lớp. Việc sinh câu hỏi cần kết nối mạng.',
      ],
    },
    faq: [
      {
        q: 'AI tạo đề kiểm tra của EduFlow có bám đúng ma trận không?',
        a: 'AI viết câu hỏi cho từng ô theo số câu thầy cô đã nhập. Sau khi sinh, cổng P3 kiểm số câu từng ô có đúng ma trận không; nếu ngân hàng câu lệch, app tự sinh lại tối đa 2 lần, mỗi lần tính thêm tiền. Kết quả vẫn là bản đề xuất để thầy cô đọc, sửa và duyệt.',
      },
      {
        q: 'EduFlow dùng mấy mức nhận thức?',
        a: 'Bốn mức: Nhận biết, Thông hiểu, Vận dụng và Vận dụng cao. Ba mức Biết, Hiểu, Vận dụng của Công văn 7991 chưa có, thuộc lộ trình.',
      },
      {
        q: 'Có tạo được câu đúng sai, trả lời ngắn, tự luận không?',
        a: 'Tự luận có, ở hình thức Kết hợp trắc nghiệm và tự luận: bài tự luận có điểm và hướng dẫn chấm. Câu trắc nghiệm có bốn phương án và một đáp án đúng. Câu đúng sai, câu trả lời ngắn và tự luận có ý nhỏ (nhiều ý, mỗi ý có điểm) chưa có, thuộc lộ trình.',
      },
      {
        q: 'Đáp án do AI viết có cần kiểm lại không?',
        a: 'Có. Khi ma trận có câu Vận dụng hoặc Vận dụng cao, app chạy thêm một lượt AI độc lập giải lại để kiểm chứng đáp án. Cảnh báo đáp án phải được thầy cô xác nhận từng câu, không có nút xác nhận tất cả, và đề ở trạng thái Đề xuất cho tới khi thầy cô bấm Duyệt.',
      },
      {
        q: 'Một đề xuất được bao nhiêu mã?',
        a: `Tối đa ${appFacts.maxTestVersions} mã đề, đánh số 101 tới 124. Các mã dựng từ cùng một đề đã soạn: câu hỏi và đáp án đúng giữ nguyên, chỉ thứ tự câu và phương án đổi. Việc dựng mã và xuất tệp chạy trên máy, không tốn tiền.`,
      },
    ],
    imageAlt: 'Màn Soạn đề kiểm tra của EduFlow: ma trận chủ đề theo bốn mức, phần tóm tắt và ước tính chi phí',
    share: { title: 'AI tạo đề kiểm tra theo ma trận', subtitle: 'Ma trận bốn mức, bản đặc tả, cổng chất lượng và người duyệt' },
  },
}
