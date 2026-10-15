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
  'test-versions': {
    name: 'Trộn đề trắc nghiệm',
    metaTitle: 'Trộn đề trắc nghiệm, tạo nhiều mã đề',
    description: 'Trộn đề trắc nghiệm thành nhiều mã đề: xáo thứ tự câu và phương án theo khoá cố định, tối đa 24 mã mỗi đề, mỗi mã kèm đáp án, xuất Word và PDF.',
    keywords: ['trộn đề trắc nghiệm', 'tạo nhiều mã đề', 'phần mềm trộn đề'],
    eyebrow: 'Tạo nhiều mã đề',
    h1: 'Trộn đề trắc nghiệm thành nhiều mã đề, đáp án đúng theo từng mã',
    lead: `EduFlow trộn đề trắc nghiệm soạn ngay trong app: xáo thứ tự câu và thứ tự phương án thành tối đa ${appFacts.maxTestVersions} mã đề, mỗi mã có đáp án riêng. Xin lưu ý trước khi tìm tiếp: EduFlow chưa trộn được một đề có sẵn trong tệp Word hay PDF, vì đề phải được soạn trong app; đọc đề cũ vào app thuộc lộ trình.`,
    card: 'Xáo thứ tự câu và phương án thành nhiều mã đề, mỗi mã có đáp án đúng riêng, xuất Word hoặc PDF.',
    inShort: `Trộn đề trắc nghiệm trong EduFlow là dựng nhiều mã đề từ một đề đã soạn trong app: app xáo thứ tự câu và thứ tự phương án theo một khoá cố định, tối đa ${appFacts.maxTestVersions} mã mỗi đề, kiểm đáp án của từng mã rồi xuất PDF hoặc DOCX. Đề có sẵn trong tệp Word hay PDF thì chưa trộn được.`,
    definition: {
      h2: 'Trộn đề trắc nghiệm và mã đề là gì?',
      term: 'Trộn đề trắc nghiệm',
      rest: 'là đổi thứ tự câu hỏi và thứ tự các phương án A, B, C, D của một đề để tạo ra nhiều bản khác nhau, trong khi nội dung từng câu và đáp án đúng vẫn giữ nguyên. Mỗi bản như vậy là một mã đề, đánh số để phân biệt trên tờ đề và trong đáp án.',
      paras: [
        'Mã đề dùng khi nhiều học sinh làm bài cùng lúc trong một phòng: bạn ngồi cạnh nhau không có cùng thứ tự câu và cùng thứ tự phương án, nên khó nhìn bài nhau hơn. Mỗi mã cần một đáp án riêng, vì cùng một câu có thể có đáp án đúng là B ở mã 101 nhưng là D ở mã 102.',
        `EduFlow đánh số mã đề từ 101: mã 101, 102, 103 và cứ thế, tối đa ${appFacts.maxTestVersions} mã, tức là mã 101 tới 124. Các mã dựng từ cùng một đề đã soạn, nên đề đã qua cổng chất lượng và đã được thầy cô duyệt thì mọi mã đều mang đúng nội dung đã duyệt.`,
      ],
    },
    table: {
      h2: 'Trộn tay hay bằng Word, phần mềm trộn đề chung và EduFlow',
      caption: 'So sánh ba cách tạo nhiều mã đề từ một đề trắc nghiệm: trộn tay hay bằng Word, dùng phần mềm trộn đề chung, và dùng EduFlow',
      checkedAt: '2026-10-15',
      head: ['Tiêu chí', 'Trộn tay hay bằng Word', 'Phần mềm trộn đề chung', 'EduFlow'],
      rows: [
        [
          'Đề đầu vào',
          'Thầy cô sao chép đề thành nhiều bản trong trình soạn văn bản rồi đảo thứ tự bằng tay.',
          'Khác nhau tuỳ phần mềm; thầy cô xem phần mềm nhận đề ở định dạng nào.',
          'Trộn đề soạn ngay trong app. Đề có sẵn trong tệp Word hay PDF chưa trộn được.',
        ],
        [
          'Số mã đề',
          'Tuỳ sức thầy cô; thêm một mã là thêm công đảo câu và lập đáp án.',
          'Khác nhau tuỳ phần mềm; thầy cô xem giới hạn số mã của từng phần mềm.',
          `Chọn từ 1 tới ${appFacts.maxTestVersions} mã, đánh số từ 101.`,
        ],
        [
          'Đáp án của từng mã',
          'Thầy cô tự lập đáp án sau mỗi lần đảo và soát lại.',
          'Khác nhau tuỳ phần mềm; thầy cô xem có xuất đáp án theo từng mã không.',
          'Đáp án theo từng mã ở một tệp riêng; trước khi lưu, app kiểm chữ cái đáp án đúng của mỗi mã sau khi xáo.',
        ],
        [
          'In lại đúng mã đã in',
          'Phải giữ bản đã đảo; đảo lại từ đầu sẽ ra thứ tự khác.',
          'Khác nhau tuỳ phần mềm; thầy cô thử xuất hai lần để so.',
          'Xáo tất định: cùng đề và cùng tuỳ chọn thì mã 101 luôn ra đúng một thứ tự, trên macOS cũng như Windows.',
        ],
        [
          'Câu tự luận trong đề',
          'Thầy cô tự giữ nguyên thứ tự khi đảo.',
          'Khác nhau tuỳ phần mềm; thầy cô xem phần mềm xử lý câu tự luận ra sao.',
          'Câu tự luận giữ nguyên thứ tự và không câu nào đổi sang phần khác; chỉ câu nhiều lựa chọn được xáo.',
        ],
        [
          'Tệp đưa vào phòng thi',
          'Thầy cô dàn trang và in từng mã.',
          'Khác nhau tuỳ phần mềm; thầy cô xem định dạng tệp xuất.',
          'Xuất PDF hoặc DOCX; đề thi, đáp án và hướng dẫn chấm, ma trận và bản đặc tả là ba tài liệu riêng. Việc dựng mã và xuất tệp chạy trên máy, không tốn tiền.',
        ],
      ],
    },
    blocks: [
      {
        h2: 'Hai công tắc xáo trộn và xáo trộn tất định',
        paras: [
          'Thẻ Bộ đề ở bước Xuất có hai ô tick, mặc định bật cả hai. Các tuỳ chọn này là cách in các mã, không phải nội dung đề: đổi chúng, kể cả đổi số mã đề, không tạo phiên bản mới, không phải duyệt lại và không làm đổi kết quả cổng nào.',
        ],
        items: [
          { title: 'Xáo trộn câu hỏi', text: 'Đổi thứ tự câu trong từng phần của mỗi mã. Câu tự luận giữ nguyên thứ tự và không câu nào đổi sang phần khác.' },
          { title: 'Xáo trộn đáp án', text: 'Đổi thứ tự bốn phương án A, B, C, D của câu nhiều lựa chọn.' },
          {
            title: 'Tất định',
            text: 'Thứ tự của một mã đề không chọn ngẫu nhiên mỗi lần xuất. App tính nó chỉ từ số mã đề, số câu trắc nghiệm của đề và hai tuỳ chọn xáo trộn, không phụ thuộc nội dung chữ. Vì vậy in lại hôm sau, hay xuất lại sau khi sửa một lỗi chính tả, vẫn ra đúng mã cũ; thứ tự chỉ đổi khi thêm hoặc bớt câu trắc nghiệm, hoặc đổi tuỳ chọn.',
          },
          { title: 'Tắt một công tắc', text: 'Không làm đổi phần còn lại: thứ tự của loại còn bật vẫn như khi bật cả hai. Tắt cả hai và chọn một mã thì cho đúng một đề theo thứ tự gốc.' },
        ],
      },
      {
        h2: 'Sáu phép kiểm trước khi lưu tệp',
        paras: [
          'Trước khi lưu, app chạy sáu phép kiểm trên chính các tài liệu đã dựng và ghi kết quả ở danh sách Kiểm tra bản xuất, mỗi dòng kèm số đơn vị đã kiểm. Phép kiểm nào ở mức Lỗi thì app không lưu tệp và nêu tên phép kiểm; các mức còn lại là thông tin để thầy cô xem trước khi in.',
        ],
        items: [
          { title: 'Đủ câu', text: 'Mỗi mã đề có đủ số câu và đủ các phần.' },
          { title: 'Đáp án khớp', text: 'Chữ cái đáp án đúng của mỗi mã khớp với thứ tự phương án sau khi xáo.' },
          { title: 'Đề không lộ đáp án', text: 'Tờ đề không chứa đáp án; đáp án nằm ở tệp riêng.' },
          { title: 'Tổng điểm', text: 'Tổng điểm in trên đề bằng thang điểm của đề.' },
          { title: 'Không có mã trùng', text: 'Nếu có hai mã giống hệt, app nêu tên các mã và gợi ý bật xáo trộn, thêm câu hoặc giảm số mã đề. Việc này thường gặp khi tắt xáo trộn hoặc đề có rất ít câu.' },
          { title: 'Đầu đề đủ thông tin', text: 'Trường, Năm học và, với đề giữa hoặc cuối học kỳ, Học kỳ. Ô nào còn thiếu thì bản in để dòng chấm cho thầy cô điền tay.' },
        ],
      },
    ],
    howTo: {
      h2: 'Trộn đề trắc nghiệm thành nhiều mã đề bằng EduFlow',
      lead: 'Các bước dưới đây theo đúng bước Xuất của màn Soạn đề kiểm tra; bài hướng dẫn kèm theo có đủ từng nút.',
      steps: [
        {
          title: 'Soạn đề và duyệt trước',
          text: 'Mã đề dựng từ một đề đã soạn trong app, nên đề cần có câu hỏi, nên đã qua cổng chất lượng và đã được thầy cô duyệt. Xuất đề chưa duyệt vẫn được, nhưng bản xuất mang dấu chìm DÙNG THỬ.',
          doc: 'create-a-test',
        },
        {
          title: 'Mở bước Xuất',
          text: 'Mở đề trong màn Soạn đề kiểm tra rồi chọn bước Xuất. Cột trái là phần Xem trước, chọn từng mã (Mã 101, Mã 102...) để xem; cột phải có thẻ Bộ đề và danh sách Kiểm tra bản xuất.',
          doc: 'export-test-versions',
        },
        {
          title: 'Chọn số mã đề',
          text: `Gõ số vào ô Số mã đề, từ 1 tới ${appFacts.maxTestVersions}. Gõ số ngoài khoảng thì app báo lỗi và các nút xuất chờ tới khi số hợp lệ.`,
          doc: 'export-test-versions',
        },
        {
          title: 'Bật hay tắt hai công tắc xáo trộn',
          text: 'Giữ bật Xáo trộn câu hỏi và Xáo trộn đáp án để có các mã khác nhau, hoặc tắt một trong hai. Đề và đáp án phải xuất cùng một bộ tuỳ chọn; nếu đổi sau lần xuất trước, app nhắc xuất lại cả hai tệp.',
          doc: 'export-test-versions',
        },
        {
          title: 'Đọc Kiểm tra bản xuất',
          text: 'Xem kết quả sáu phép kiểm: đủ câu, đáp án khớp từng mã, đề không lộ đáp án, tổng điểm, mã trùng và đầu đề. Sửa theo gợi ý nếu có dòng ở mức Lỗi.',
          doc: 'export-test-versions',
        },
        {
          title: 'Xuất PDF hoặc DOCX',
          text: 'Chọn tài liệu (Đề thi, Đáp án và hướng dẫn chấm, hoặc Ma trận và bản đặc tả) rồi bấm Xuất PDF hoặc Xuất DOCX. Xuất xong, app báo số trang từng mã; hãy mở tệp xem lại trước khi in.',
          doc: 'export-test-versions',
        },
      ],
    },
    limits: {
      h2: 'EduFlow chưa làm gì',
      items: [
        'Trộn một đề có sẵn trong tệp Word hay PDF: chưa có. EduFlow chỉ trộn đề soạn trong app; tải đề cũ lên để app đọc rồi trộn thuộc lộ trình.',
        'Chỉ câu nhiều lựa chọn được xáo thứ tự phương án. Câu đúng sai, câu trả lời ngắn và câu tự luận có ý nhỏ (nhiều ý, mỗi ý có điểm) chưa có, thuộc lộ trình; câu tự luận hiện có thì giữ nguyên thứ tự.',
        `Một đề có tối đa ${appFacts.maxTestVersions} mã. Khi tắt xáo trộn hoặc đề có rất ít câu, các mã có thể giống hệt nhau: app báo tên các mã trùng và không tự sửa.`,
        'Mã đề chỉ đổi cách in, không đổi nội dung: muốn sửa một câu, thầy cô sửa trong đề rồi xuất lại. Đề chưa duyệt vẫn xuất được nhưng mang dấu chìm DÙNG THỬ.',
      ],
    },
    faq: [
      {
        q: 'EduFlow có trộn được đề Word hay PDF tôi đang có không?',
        a: 'Chưa. EduFlow trộn đề soạn trong app, nơi mỗi câu có bốn phương án, một đáp án và yêu cầu cần đạt để app kiểm lại. Đọc một đề cũ từ tệp Word hay PDF vào app thuộc lộ trình, chưa có ngày.',
      },
      {
        q: 'Một đề trộn được bao nhiêu mã đề?',
        a: `Tối đa ${appFacts.maxTestVersions} mã, đánh số 101 tới 124. Số mã nhập từ 1 tới ${appFacts.maxTestVersions}; nhập ngoài khoảng thì app báo lỗi chứ không tự sửa.`,
      },
      {
        q: 'Trộn đề có ngẫu nhiên mỗi lần xuất không?',
        a: 'Không. Thứ tự của mỗi mã được tính chỉ từ số mã đề, số câu trắc nghiệm và hai tuỳ chọn xáo trộn, nên cùng đề và cùng tuỳ chọn thì mã 101 luôn ra đúng một thứ tự, trên macOS cũng như Windows. In lại hôm sau vẫn đúng tờ đề đã in.',
      },
      {
        q: 'Đáp án của từng mã có đúng không?',
        a: 'Trước khi lưu tệp, app kiểm chữ cái đáp án đúng của mỗi mã có khớp thứ tự phương án sau khi xáo không, và kiểm tờ đề không lộ đáp án. Đáp án nằm ở tệp riêng, xuất cùng một bộ tuỳ chọn với đề. Thầy cô vẫn nên mở tệp xem lại trước khi in.',
      },
      {
        q: 'Câu tự luận có bị đảo không?',
        a: 'Không. Với đề kết hợp trắc nghiệm và tự luận, câu tự luận giữ nguyên thứ tự và không câu nào đổi sang phần khác; chỉ thứ tự câu và phương án của phần trắc nghiệm được xáo.',
      },
    ],
    imageAlt: 'Bước Xuất của một đề trong EduFlow: bản xem trước mã đề 101, bảng cổng chất lượng và hai câu cần xác nhận đáp án',
    share: { title: 'Trộn đề trắc nghiệm', subtitle: 'Nhiều mã đề, đáp án đúng cho từng mã' },
  },
  'lesson-plans': {
    name: 'AI soạn giáo án',
    metaTitle: 'AI soạn giáo án 5512 cho giáo viên phổ thông',
    description: 'AI soạn giáo án theo Công văn 5512 từ khung GDPT 2018: bốn hoạt động có mục tiêu, sản phẩm, cách tổ chức; máy kiểm khung, thầy cô duyệt rồi xuất Word.',
    keywords: ['AI soạn giáo án', 'giáo án 5512', 'kế hoạch bài dạy 5512'],
    eyebrow: 'Giáo án theo Công văn 5512',
    h1: 'AI soạn giáo án theo Công văn 5512, đủ bốn hoạt động, thầy cô duyệt trước khi dùng',
    lead: 'EduFlow cho AI soạn giáo án một tiết 45 phút theo cấu trúc của Công văn 5512, với bốn hoạt động nối tiếp. Máy kiểm bản nháp có đủ mục và đủ số phút không, thầy cô đọc, sửa và duyệt, rồi xuất DOCX hoặc PDF.',
    card: 'AI soạn giáo án theo Công văn 5512 với bốn hoạt động, máy kiểm khung, thầy cô duyệt rồi xuất Word hoặc PDF.',
    inShort: 'AI soạn giáo án trong EduFlow đi từ khung chương trình GDPT 2018 có sẵn trong app: thầy cô chọn môn, lớp, chương và chủ đề, AI viết bản nháp giáo án một tiết 45 phút theo Công văn 5512 với bốn hoạt động, máy kiểm cấu trúc, thầy cô sửa và duyệt rồi xuất DOCX hoặc PDF.',
    definition: {
      h2: 'Giáo án theo Công văn 5512 là gì?',
      term: 'Giáo án theo Công văn 5512',
      rest: 'là kế hoạch bài dạy viết theo cấu trúc của Công văn 5512: phần mục tiêu, phần thiết bị dạy học và học liệu, rồi tiến trình dạy học gồm bốn hoạt động nối tiếp là Mở đầu, Hình thành kiến thức mới, Luyện tập và Vận dụng.',
      paras: [
        'Mỗi hoạt động trong EduFlow có số phút riêng, các yêu cầu cần đạt (YCCĐ) liên kết và bốn mục: mục tiêu, nội dung, sản phẩm và tổ chức thực hiện. Phần tổ chức thực hiện đi qua bốn bước: chuyển giao nhiệm vụ, thực hiện nhiệm vụ, báo cáo và thảo luận, kết luận và nhận định.',
        'Môn, lớp, chương, chủ đề và các YCCĐ lấy từ khung chương trình GDPT 2018 đi kèm app và đọc ngay trên máy, không cần mạng. Mỗi giáo án là một tiết 45 phút, cố định; tổng số phút của các hoạt động phải đúng 45.',
      ],
    },
    table: {
      h2: 'Soạn tay, dùng ChatGPT và dùng EduFlow',
      caption: 'So sánh ba cách soạn giáo án theo Công văn 5512: soạn tay, dùng ChatGPT hay công cụ chat chung, và dùng EduFlow',
      checkedAt: '2026-10-15',
      head: ['Tiêu chí', 'Soạn tay', 'ChatGPT hay công cụ chung', 'EduFlow'],
      rows: [
        [
          'Cấu trúc theo Công văn 5512',
          'Thầy cô tự dựng khung từ mẫu đang dùng.',
          'Thầy cô dán cấu trúc vào lời nhắc và kiểm xem kết quả có đủ mục không.',
          'Cấu trúc cố định: Mục tiêu, Thiết bị và học liệu, Tiến trình với bốn hoạt động theo thứ tự. Cổng P6 kiểm đủ mục bắt buộc.',
        ],
        [
          'Dữ liệu chương trình',
          'Thầy cô tra khung chương trình và chép yêu cầu cần đạt.',
          'Thầy cô dán chương, chủ đề và yêu cầu cần đạt vào lời nhắc.',
          'Môn, lớp, chương, chủ đề và YCCĐ lấy từ khung GDPT 2018 có sẵn trong app, đọc tại máy. Mỗi hoạt động liên kết tối đa sáu YCCĐ.',
        ],
        [
          'Tổng thời gian của tiết',
          'Thầy cô tự cộng số phút các hoạt động.',
          'Thầy cô nhờ chia phút và tự cộng lại.',
          'Tiết 45 phút cố định; cổng P7 kiểm tổng phút các hoạt động đúng 45, và dòng Tổng thời gian cập nhật khi sửa.',
        ],
        [
          'Thông tin người soạn',
          'Chỉ nằm trong tệp của thầy cô.',
          'Thầy cô tự quyết định ghi gì vào cuộc trò chuyện.',
          'Trường, Tổ và Họ và tên giáo viên chỉ in ở phần đầu giáo án, không gửi cho AI. Tên bài dạy và ghi chú của giáo viên thì được gửi.',
        ],
        [
          'Ai duyệt giáo án',
          'Thầy cô soát lại và duyệt theo quy trình của trường.',
          'Thầy cô soát lại nội dung và tự ghi nhận việc duyệt.',
          'Giáo án ở trạng thái Đề xuất tới khi thầy cô bấm Duyệt; ở cấp Phổ thông đó là bước cuối. Mỗi cảnh báo cần Xác nhận riêng.',
        ],
        [
          'Tệp đưa vào hồ sơ',
          'Thầy cô soạn thẳng trong trình soạn văn bản.',
          'Cho ra văn bản để thầy cô dán vào tệp và dàn trang.',
          'Xuất DOCX hoặc PDF. Chưa duyệt vẫn xuất được nhưng bản xuất mang dấu chìm DÙNG THỬ.',
        ],
      ],
    },
    blocks: [
      {
        h2: 'Bốn hoạt động của giáo án',
        paras: [
          'Giáo án trong EduFlow là một tiết 45 phút với bốn hoạt động theo đúng thứ tự dưới đây. Ở màn Giáo án, mỗi hoạt động là một khối sửa được với số phút, YCCĐ liên kết và bốn mục a, b, c, d.',
        ],
        items: [
          { title: 'Mở đầu', text: 'Tạo tình huống để học sinh vào bài, nối với kiến thức đã có.' },
          { title: 'Hình thành kiến thức mới', text: 'Học sinh làm việc với nội dung chính của chủ đề, có sản phẩm cụ thể.' },
          { title: 'Luyện tập', text: 'Học sinh củng cố bằng các nhiệm vụ có sản phẩm và cách thực hiện rõ.' },
          { title: 'Vận dụng', text: 'Học sinh dùng điều đã học vào một tình huống mới.' },
        ],
      },
      {
        h2: 'Cổng kiểm giáo án và thẩm định',
        paras: [
          'Ở bước Xuất, Bảng cổng ghi mã cổng, số đơn vị đã kiểm, số vi phạm và kết quả. Cổng nào kiểm 0 đơn vị không được coi là đạt: app ghi Lỗi cổng. Thiếu mục bắt buộc hay tổng phút sai là vi phạm chặn, phải sửa ở bước Giáo án rồi Lưu.',
        ],
        items: [
          { title: 'P6', text: 'Giáo án đủ cấu trúc của Công văn 5512.' },
          { title: 'P7', text: 'Tổng số phút bằng số tiết nhân 45.' },
          { title: 'P11', text: 'Mỗi hoạt động neo yêu cầu cần đạt; chưa neo là cảnh báo, sửa hoặc Xác nhận từng dòng.' },
          { title: 'P10', text: 'Giáo viên đã duyệt; ghi Chờ duyệt cho tới khi thầy cô bấm Duyệt.' },
          { title: 'Thẩm định ngữ nghĩa', text: 'Thẻ riêng chấm tám tiêu chí, mỗi tiêu chí Đạt hoặc Chưa đạt kèm ghi chú. Đó chỉ là đề xuất cho người duyệt và không khoá gì.' },
          {
            title: 'Chi phí',
            text: 'Trước khi AI chạy, app hiện hộp Ước tính chi phí; bấm Huỷ thì không có tác vụ nào được tạo và không tốn gì. Cách tính xem ở trang',
            link: { page: '/pricing', label: 'Chi phí EduFlow' },
          },
        ],
      },
    ],
    howTo: {
      h2: 'Soạn giáo án theo Công văn 5512 bằng EduFlow',
      lead: 'Các bước dưới đây theo đúng màn Soạn giáo án của app; bài hướng dẫn kèm theo có đủ từng nút.',
      steps: [
        {
          title: 'Bấm Soạn bài dạy và chọn loại Giáo án',
          text: 'Bấm Soạn bài dạy ở Trang chủ, ở thanh bên hoặc Soạn bài dạy mới trong một dự án Phổ thông, rồi chọn loại Giáo án.',
          doc: 'lesson-plans',
        },
        {
          title: 'Chọn môn, lớp, chương, chủ đề và tên bài',
          text: 'Chọn trong khung GDPT 2018 có sẵn. Tên bài dạy tối đa 120 ký tự và được gửi cho AI làm trọng tâm của tiết, nên đừng ghi tên học sinh hay thông tin cá nhân.',
          doc: 'lesson-plans',
        },
        {
          title: 'Thiết lập phần đầu giáo án',
          text: 'Điền Trường, Tổ, Họ và tên giáo viên (không gửi cho AI) và, nếu muốn, Ghi chú của giáo viên (gửi nguyên văn cho AI). Mọi thay đổi tự lưu sau chừng một giây.',
          doc: 'lesson-plans',
        },
        {
          title: 'Để AI viết bốn hoạt động',
          text: 'Bấm Sinh giáo án, xem khoảng tiền ước tính trong hộp thoại rồi bấm Chạy. Việc này cần mạng; chạy xong, màn tự mở bước Giáo án.',
          doc: 'lesson-plans',
        },
        {
          title: 'Đọc cảnh báo của cổng và sửa',
          text: 'Sửa từng hoạt động, kiểm Tổng thời gian đúng 45 phút, bấm Lưu để app chạy lại các cổng. Mỗi cảnh báo có nút Xác nhận riêng, không có nút xác nhận tất cả.',
          doc: 'lesson-plans',
        },
        {
          title: 'Duyệt và xuất DOCX hoặc PDF',
          text: 'Khi hết vi phạm chặn và đã xác nhận các cảnh báo, bấm Duyệt rồi Xuất DOCX hoặc Xuất PDF. Chưa duyệt vẫn xuất được nhưng bản xuất mang dấu chìm DÙNG THỬ.',
          doc: 'lesson-plans',
        },
      ],
    },
    limits: {
      h2: 'EduFlow chưa làm gì',
      items: [
        'Một số môn: hộp Soạn bài dạy chỉ có các môn của khung GDPT 2018 đi kèm app. Ngữ văn, Tiếng Việt, Âm nhạc, Mỹ thuật và Hoạt động trải nghiệm chưa có, chỉ có ở gói đầy đủ thuộc phần việc sau bản đầu và chưa có ngày.',
        'Mẫu giáo án riêng của trường: chưa có. EduFlow dựng theo một cấu trúc cố định của Công văn 5512 và chưa nạp được giáo án mẫu của trường để dựng theo mẫu đó.',
        'Thư viện giáo án mẫu theo môn và lớp, và logo trường ở phần đầu giáo án: chưa có. Phần đầu giáo án hiện chỉ có Trường, Tổ và Họ và tên giáo viên.',
        'AI chỉ viết bản đề xuất: thầy cô kiểm tra, sửa và duyệt trước khi dùng trên lớp. Mỗi giáo án là một tiết 45 phút; việc sinh giáo án cần kết nối mạng.',
      ],
    },
    faq: [
      {
        q: 'AI soạn giáo án của EduFlow có đúng cấu trúc Công văn 5512 không?',
        a: 'Giáo án có phần mục tiêu, phần thiết bị và học liệu, và tiến trình với bốn hoạt động theo thứ tự. Cổng P6 kiểm đủ các mục bắt buộc, cổng P7 kiểm tổng số phút đúng 45. Kết quả vẫn là bản đề xuất để thầy cô đọc, sửa và duyệt.',
      },
      {
        q: 'Giáo án EduFlow soạn gồm những hoạt động nào?',
        a: 'Bốn hoạt động theo đúng thứ tự: Mở đầu, Hình thành kiến thức mới, Luyện tập và Vận dụng. Mỗi hoạt động có số phút, yêu cầu cần đạt liên kết, mục tiêu, nội dung, sản phẩm và tổ chức thực hiện bốn bước.',
      },
      {
        q: 'Thông tin của tôi và học sinh có được gửi cho AI không?',
        a: 'Trường, Tổ và Họ và tên giáo viên ở phần đầu giáo án chỉ để in, không gửi cho AI. Tên bài dạy và ghi chú của giáo viên thì được gửi nguyên văn, nên thầy cô đừng ghi tên học sinh hay thông tin cá nhân vào đó.',
      },
      {
        q: 'EduFlow soạn được giáo án cho môn nào?',
        a: 'Các môn của khung GDPT 2018 đi kèm app. Ngữ văn, Tiếng Việt, Âm nhạc, Mỹ thuật và Hoạt động trải nghiệm chưa có ở bản này; các môn đó chỉ có ở gói đầy đủ thuộc phần việc sau bản đầu.',
      },
      {
        q: 'Giáo án xuất ra định dạng nào, có cần duyệt trước không?',
        a: 'Xuất DOCX hoặc PDF. Xuất luôn làm được, nhưng giáo án chưa duyệt, còn vi phạm chặn hoặc chạy bằng key dùng thử thì bản xuất mang dấu chìm DÙNG THỬ. Giáo án đã duyệt, hết vi phạm chặn và chạy bằng key trả phí thì bản xuất không có dấu chìm.',
      },
    ],
    imageAlt: 'Màn Soạn giáo án của EduFlow ở bước Giáo án: phần mục tiêu, thiết bị và bốn hoạt động có số phút và yêu cầu cần đạt liên kết',
    share: { title: 'AI soạn giáo án', subtitle: 'Công văn 5512, bốn hoạt động, thầy cô duyệt' },
  },
  'lesson-slides': {
    name: 'Tạo slide bài giảng bằng AI',
    metaTitle: 'Tạo slide bài giảng bằng AI, có quiz trong slide',
    description: 'Tạo slide bài giảng bằng AI theo chủ đề GDPT 2018: chọn mẫu giao diện, AI viết nội dung và quiz ngay trong slide, xem trước, kiểm cổng rồi xuất PDF hoặc PPTX.',
    keywords: ['tạo slide bài giảng bằng AI', 'AI tạo slide bài giảng'],
    eyebrow: 'AI tạo slide bài giảng',
    h1: 'Tạo slide bài giảng bằng AI theo chủ đề của bài, có quiz ngay trong slide',
    lead: 'EduFlow cho AI viết bộ slide 16:9 cho một chủ đề của khung GDPT 2018, từ phạm vi, yêu cầu cần đạt và tên bài dạy, kèm quiz rải trong bài. Slide không lấy nội dung từ giáo án; muốn có cả hai, chọn Cả bộ để tạo giáo án và slide cùng một lần. Thầy cô xem trước, sửa, duyệt rồi xuất PDF hoặc PPTX.',
    card: 'AI viết bộ slide 16:9 có quiz trong bài; thầy cô xem trước, kiểm cổng, duyệt rồi xuất PDF hoặc PPTX.',
    inShort: 'Tạo slide bài giảng bằng AI trong EduFlow là chọn một chủ đề của khung GDPT 2018 và một mẫu giao diện, đặt số câu quiz, để AI viết bộ slide 16:9 khoảng 20 tới 28 slide nội dung, rồi xem trước, sửa, kiểm cổng, duyệt và xuất PDF hoặc PPTX. Slide không đọc giáo án; Cả bộ tạo cả hai hiện vật cùng lúc.',
    definition: {
      h2: 'Slide bài giảng bằng AI trong EduFlow là gì?',
      term: 'Slide bài giảng bằng AI',
      rest: 'là bộ slide tỉ lệ 16:9 do AI viết bản đề xuất cho một bài dạy, gồm các loại slide cố định như Bìa, Mục tiêu, Sơ đồ nội dung, Khởi động, Kiến thức, Ví dụ, Luyện tập nhanh (các câu quiz), Đáp án, Luyện tập ở lớp, Bài tập về nhà, Bảng tóm tắt, Tổng kết và Cảm ơn.',
      paras: [
        'Slide bìa, sơ đồ nội dung, đáp án và cảm ơn do app dựng; AI viết phần còn lại. Bộ slide soạn riêng cho một chủ đề, từ phạm vi, yêu cầu cần đạt (YCCĐ) và tên bài dạy của chính nó. Slide không đọc nội dung của giáo án: hai hiện vật độc lập, chỉ chung phạm vi bài dạy.',
        'Muốn có cả giáo án và slide cho cùng một bài, thầy cô chọn Cả bộ khi Soạn bài dạy: app hiện một hộp Ước tính chi phí có từng phần và tổng, một lần Chạy tạo cả hai hiện vật. Mỗi hiện vật mang nhãn Cùng bộ trỏ sang hiện vật kia.',
      ],
    },
    table: {
      h2: 'Làm tay trên PowerPoint, công cụ tạo slide AI chung và EduFlow',
      caption: 'So sánh ba cách làm slide bài giảng: làm tay trên PowerPoint, dùng công cụ tạo slide AI chung, và dùng EduFlow',
      checkedAt: '2026-10-15',
      head: ['Tiêu chí', 'Làm tay trên PowerPoint', 'Công cụ tạo slide AI chung', 'EduFlow'],
      rows: [
        [
          'Chuẩn bị nội dung',
          'Thầy cô tự viết từng slide.',
          'Thầy cô nêu bài học trong lời nhắc và kiểm lại nội dung.',
          'AI viết từ phạm vi, YCCĐ của chủ đề trong khung GDPT 2018 và tên bài dạy; một bộ khoảng 20 tới 28 slide nội dung.',
        ],
        [
          'Quiz trong slide',
          'Thầy cô tự soạn câu hỏi và dàn trang.',
          'Có thể nhờ viết câu hỏi; thầy cô tự dàn trang.',
          'Đặt số câu theo bốn mức, tổng từ 3 tới 10 câu. Quiz rải thành các cụm trong bài, mỗi cụm có slide Đáp án do app dựng.',
        ],
        [
          'Giao diện',
          'Thầy cô chọn mẫu của PowerPoint hay tự chỉnh.',
          'Khác nhau tuỳ công cụ; thầy cô xem công cụ cho chọn mẫu và màu ra sao.',
          'Tám mẫu có sẵn, mẫu Của tôi và Của trường, màu chủ đạo (phải đủ tương phản từ 3:1 để đọc trên máy chiếu) và trình tự thiết kế.',
        ],
        [
          'Kiểm trước khi dùng',
          'Thầy cô xem từng slide, soát chữ có tràn khung không.',
          'Thầy cô xem lại toàn bộ kết quả.',
          'Cổng P8 kiểm đủ bố cục và cụm quiz, cổng P9 kiểm slide không tràn khung; mỗi cảnh báo cần Xác nhận riêng rồi mới Duyệt.',
        ],
        [
          'Sửa sau khi xuất',
          'Sửa trực tiếp chữ và hình trong PowerPoint.',
          'Khác nhau tuỳ công cụ; thầy cô xem tệp xuất có sửa được không.',
          'Xuất PDF hoặc PPTX. PPTX là mỗi trang một ảnh slide kèm ghi chú trình bày, chữ không sửa được; muốn sửa, thầy cô sửa trong app rồi xuất lại.',
        ],
        [
          'Đi kèm giáo án',
          'Thầy cô tự soạn giáo án riêng.',
          'Thầy cô nhờ viết giáo án riêng nếu cần.',
          'Slide không đọc giáo án; chọn Cả bộ để tạo cả hai hiện vật cùng phạm vi bài dạy trong một lần chạy.',
        ],
      ],
    },
    blocks: [
      {
        h2: 'Quiz trong slide',
        paras: [
          'Quiz được đặt trước khi sinh, ở thẻ Phân bổ câu quiz theo mức của bước Thiết lập: bốn ô số cho Nhận biết, Thông hiểu, Vận dụng và Vận dụng cao, hoặc ba nút Đặt nhanh.',
        ],
        items: [
          { title: 'Số câu', text: 'Mặc định 8 câu, chia 3, 3, 2, 0 theo bốn mức. Tổng phải từ 3 tới 10 câu; ngoài khoảng đó nút Sinh slide bị khoá kèm lý do và app không tự rút bớt.' },
          { title: 'Cụm quiz', text: 'Quiz rải thành các cụm trong bài: 3 cụm khi dưới 8 câu, 4 cụm từ 8 câu. Mỗi cụm có slide Đáp án ngay sau, do app dựng từ các câu của cụm.' },
          { title: 'Mỗi câu', text: 'Mỗi slide câu hỏi tối đa hai câu, mỗi câu có bốn phương án và một đáp án đúng. Thầy cô sửa từng câu, đáp án đúng và lời giải thích ở bước Slide.' },
        ],
      },
      {
        h2: 'Cổng của slide, xem trước và dấu chìm',
        paras: [
          'Bước Slide có lưới xem trước các slide 16:9; slide còn tràn khung có nhãn riêng. Bước Xuất có Bảng cổng của slide, mỗi hàng ghi mã cổng, số đơn vị đã kiểm, số vi phạm và kết quả. Cổng nào kiểm 0 đơn vị không được coi là đạt.',
        ],
        items: [
          { title: 'P8', text: 'Slide đủ bố cục và cụm quiz; báo thiếu phần bắt buộc, số slide ngoài khoảng hay cụm quiz đặt sai chỗ.' },
          { title: 'P9', text: 'Slide không tràn khung; báo slide còn tràn sau ba vòng cân lại, và app đo lại ngay lúc duyệt.' },
          { title: 'P10', text: 'Giáo viên đã duyệt; ghi Chờ duyệt cho tới khi thầy cô bấm Duyệt.' },
          { title: 'Dấu chìm', text: 'Xuất luôn làm được, nhưng slide chưa duyệt, còn vi phạm chặn hoặc chạy bằng key dùng thử thì bản xuất mang dấu chìm DÙNG THỬ.' },
          {
            title: 'Chi phí',
            text: 'Trước khi AI chạy, app hiện hộp Ước tính chi phí; bấm Huỷ thì không tốn gì. Cách tính xem ở trang',
            link: { page: '/pricing', label: 'Chi phí EduFlow' },
          },
        ],
      },
    ],
    howTo: {
      h2: 'Tạo slide bài giảng bằng EduFlow',
      lead: 'Các bước dưới đây theo đúng màn Soạn slide của app; bài hướng dẫn kèm theo có đủ từng nút.',
      steps: [
        {
          title: 'Chọn Slide hay Cả bộ',
          text: 'Bấm Soạn bài dạy rồi chọn loại Slide (chỉ slide) hoặc Cả bộ (giáo án và slide), sau đó chọn môn, lớp, chương, chủ đề và tên bài dạy trong khung GDPT 2018.',
          doc: 'lesson-slides',
        },
        {
          title: 'Chọn mẫu giao diện',
          text: 'Chọn một trong tám mẫu có sẵn, mẫu của bạn hoặc của trường, rồi chỉnh màu chủ đạo ở bước Thiết lập. Đổi giao diện không gọi AI.',
          doc: 'lesson-slides',
        },
        {
          title: 'Đặt số câu quiz theo mức',
          text: 'Nhập số câu cho từng mức hoặc dùng Đặt nhanh 6, 8 hay 10 câu. Điền phần đầu Header (không gửi cho AI) và, nếu muốn, ghi chú của giáo viên.',
          doc: 'lesson-slides',
        },
        {
          title: 'Để AI viết nội dung slide',
          text: 'Bấm Sinh slide, xem khoảng tiền ước tính rồi bấm Chạy. AI chạy hai lượt song song, phần kiến thức và phần luyện tập, rồi app dựng và đo slide. Việc này cần mạng.',
          doc: 'lesson-slides',
        },
        {
          title: 'Xem trước và sửa từng slide',
          text: 'Ở bước Slide, bấm một slide để sửa bố cục, tiêu đề, nội dung và việc của giáo viên, học sinh; slide Luyện tập nhanh cho sửa từng câu quiz. Slide tràn khung có nhãn riêng.',
          doc: 'lesson-slides',
        },
        {
          title: 'Đọc cổng, duyệt và xuất',
          text: 'Ở bước Xuất, đọc Bảng cổng, xác nhận từng cảnh báo rồi bấm Duyệt, sau đó Xuất PDF hoặc Xuất PPTX. Ở cấp Phổ thông, Duyệt là bước cuối, không có thêm bước ký riêng.',
          doc: 'lesson-slides',
        },
      ],
    },
    limits: {
      h2: 'EduFlow chưa làm gì',
      items: [
        'PPTX sửa được: chưa có, thuộc lộ trình. PPTX hiện là mỗi trang một ảnh slide 16:9 kèm ghi chú trình bày, chữ trong đó không sửa được bằng PowerPoint.',
        'Slide đọc nội dung giáo án cùng bộ để đối chiếu: chưa có. Hai hiện vật độc lập, chỉ chung phạm vi bài dạy. Hình vẽ trong slide cũng chưa có: AI không vẽ hình.',
        'Phát giao diện của đơn vị cho mọi máy qua máy chủ: chưa có. Mẫu Của trường lưu trên từng máy và chia sẻ giữa các máy bằng tệp xuất và nhập. Thư viện slide và giáo án mẫu theo môn và lớp cũng chưa có.',
        'Một số môn: Ngữ văn, Tiếng Việt, Âm nhạc, Mỹ thuật và Hoạt động trải nghiệm chưa có, chỉ có ở gói đầy đủ thuộc phần việc sau bản đầu. AI chỉ viết bản đề xuất: thầy cô kiểm tra nội dung và đáp án quiz trước khi dùng trên lớp.',
      ],
    },
    faq: [
      {
        q: 'Có tạo slide bài giảng bằng AI từ giáo án được không?',
        a: 'Slide của EduFlow không đọc nội dung giáo án. AI viết slide từ phạm vi bài, yêu cầu cần đạt của chủ đề trong khung GDPT 2018 và tên bài dạy. Nếu muốn có cả hai, chọn Cả bộ để tạo giáo án và slide cùng một lần; hai hiện vật độc lập, chỉ chung phạm vi bài dạy.',
      },
      {
        q: 'Quiz trong slide được đặt như thế nào?',
        a: 'Thầy cô đặt số câu theo bốn mức nhận thức trước khi sinh, tổng từ 3 tới 10 câu. Quiz rải thành các cụm trong bài, mỗi cụm có slide Đáp án do app dựng, mỗi câu có bốn phương án và một đáp án đúng. Thầy cô sửa từng câu và kiểm đáp án trước khi dùng.',
      },
      {
        q: 'Một bộ slide có bao nhiêu slide và dùng mẫu nào?',
        a: 'Khoảng 20 tới 28 slide nội dung; ngoài khoảng đó cổng slide cảnh báo. Có tám mẫu giao diện sẵn, thêm mẫu Của tôi và Của trường, và màu chủ đạo chọn được nếu đủ tương phản để đọc trên máy chiếu.',
      },
      {
        q: 'Xuất PowerPoint thì chữ có sửa được không?',
        a: 'Chưa. PPTX hiện là mỗi trang một ảnh slide 16:9 kèm ghi chú trình bày, nên chữ không sửa được bằng PowerPoint. PPTX sửa được thuộc lộ trình. Muốn sửa, thầy cô sửa trong app rồi xuất lại; app cũng xuất PDF để trình chiếu.',
      },
      {
        q: 'Slide AI tạo ra có cần kiểm lại không?',
        a: 'Có. AI chỉ viết bản đề xuất. Cổng slide kiểm bố cục, cụm quiz và tràn khung, nhưng nội dung và đáp án quiz do thầy cô đọc và sửa. Mỗi cảnh báo cần Xác nhận riêng, không có nút xác nhận tất cả, và slide chưa duyệt khi xuất mang dấu chìm DÙNG THỬ.',
      },
    ],
    imageAlt: 'Màn Soạn slide của EduFlow: lưới xem trước các slide 16:9, cấu hình bộ slide, bảng cổng slide và nút xuất PDF, PPTX',
    share: { title: 'Tạo slide bài giảng bằng AI', subtitle: 'Slide 16:9 có quiz, thầy cô duyệt trước khi dùng' },
  },
}
