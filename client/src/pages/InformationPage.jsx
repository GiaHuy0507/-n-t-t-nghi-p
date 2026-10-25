import { Link } from "react-router-dom";
import "../scss/InformationPage.scss";

const pageContent = {
  about: {
    eyebrow: "Về JobPortal",
    title: "Kết nối đúng người, đúng cơ hội.",
    intro:
      "JobPortal hỗ trợ ứng viên chuẩn bị hồ sơ và tìm kiếm công việc, đồng thời giúp nhà tuyển dụng quản lý tin tuyển dụng và hồ sơ ứng tuyển trên cùng một nền tảng.",
    sections: [
      {
        title: "Dành cho ứng viên",
        paragraphs: [
          "Bạn có thể tìm kiếm tin tuyển dụng, tạo hoặc tải CV lên hồ sơ và theo dõi trạng thái các đơn ứng tuyển của mình.",
          "Công cụ AI có thể hỗ trợ phân tích thông tin hồ sơ và gợi ý mức độ phù hợp. Kết quả chỉ mang tính tham khảo; bạn nên tự kiểm tra nội dung và lựa chọn công việc phù hợp.",
        ],
      },
      {
        title: "Dành cho nhà tuyển dụng",
        paragraphs: [
          "Nhà tuyển dụng có thể đăng tin, tiếp nhận hồ sơ, cập nhật trạng thái ứng tuyển và xem thông tin CV phục vụ quá trình tuyển chọn.",
          "Các đề xuất do AI tạo ra không thay thế quyết định chuyên môn của nhà tuyển dụng. Việc đánh giá và liên hệ ứng viên cần được thực hiện minh bạch, phù hợp với quy định hiện hành.",
        ],
      },
      {
        title: "Cách chúng tôi hướng đến",
        paragraphs: [
          "Chúng tôi hướng đến trải nghiệm tìm việc rõ ràng, thuận tiện và tôn trọng quyền riêng tư của cả ứng viên lẫn nhà tuyển dụng.",
        ],
      },
    ],
  },
  regulations: {
    eyebrow: "Quy chế hoạt động",
    title: "Nguyên tắc sử dụng nền tảng",
    intro:
      "Quy chế này mô tả các bước sử dụng chính và trách nhiệm cơ bản của người dùng trên JobPortal.",
    sections: [
      {
        title: "1. Tạo và quản lý tài khoản",
        paragraphs: [
          "Người dùng cung cấp thông tin chính xác, tự bảo vệ thông tin đăng nhập và cập nhật hồ sơ khi có thay đổi. Mỗi tài khoản chỉ được sử dụng cho mục đích phù hợp với vai trò đã đăng ký.",
        ],
      },
      {
        title: "2. Đăng tin tuyển dụng",
        paragraphs: [
          "Nhà tuyển dụng chịu trách nhiệm về tính chính xác, hợp pháp và đầy đủ của nội dung tin tuyển dụng; nêu rõ yêu cầu công việc và không đăng nội dung gây hiểu nhầm hoặc phân biệt đối xử.",
        ],
      },
      {
        title: "3. Ứng tuyển và xử lý hồ sơ",
        paragraphs: [
          "Ứng viên chỉ gửi thông tin và tài liệu thuộc quyền cung cấp của mình. Nhà tuyển dụng sử dụng hồ sơ nhận được cho mục đích tuyển dụng, bảo mật thông tin và cập nhật trạng thái ứng tuyển phù hợp.",
        ],
      },
      {
        title: "4. Công cụ hỗ trợ AI",
        paragraphs: [
          "Phân tích và gợi ý từ AI có thể chưa đầy đủ hoặc chưa chính xác. Người dùng cần tự đánh giá thông tin; quyết định tuyển dụng cuối cùng thuộc về nhà tuyển dụng và không nên chỉ dựa trên kết quả tự động.",
        ],
      },
      {
        title: "5. Nội dung và xử lý vi phạm",
        paragraphs: [
          "Không sử dụng nền tảng để đăng tải nội dung trái pháp luật, giả mạo, quấy rối hoặc xâm phạm quyền của người khác. Nền tảng có thể xem xét hạn chế nội dung hay tài khoản vi phạm và liên hệ người dùng khi cần làm rõ.",
        ],
      },
    ],
  },
  policies: {
    eyebrow: "Chính sách",
    title: "Thông tin và quyền riêng tư",
    intro:
      "Trang này giải thích cách thông tin được sử dụng trong các chức năng hiện có của JobPortal. Vui lòng chỉ cung cấp dữ liệu cần thiết cho quá trình tìm việc hoặc tuyển dụng.",
    sections: [
      {
        title: "Thông tin được cung cấp",
        paragraphs: [
          "Thông tin tài khoản, hồ sơ cá nhân, CV, tin tuyển dụng và nội dung ứng tuyển được dùng để vận hành các chức năng tương ứng, chẳng hạn như hiển thị hồ sơ cho nhà tuyển dụng khi bạn ứng tuyển.",
        ],
      },
      {
        title: "Sử dụng dữ liệu",
        paragraphs: [
          "Thông tin hồ sơ có thể được xử lý bởi tính năng phân tích AI để tạo nhận xét hoặc gợi ý phù hợp. Kết quả phân tích là nội dung hỗ trợ, không phải cam kết về việc làm hay kết quả tuyển dụng.",
        ],
      },
      {
        title: "Bảo vệ tài khoản và hồ sơ",
        paragraphs: [
          "Bạn có trách nhiệm giữ an toàn thông tin đăng nhập và cân nhắc nội dung đưa vào CV. Không gửi dữ liệu nhạy cảm nếu dữ liệu đó không cần thiết cho mục đích ứng tuyển.",
          "Nhà tuyển dụng nhận được hồ sơ ứng tuyển có trách nhiệm chỉ truy cập và sử dụng hồ sơ cho mục đích tuyển dụng phù hợp.",
        ],
      },
      {
        title: "Lưu trữ và yêu cầu hỗ trợ",
        paragraphs: [
          "Thông tin được lưu trữ để cung cấp các chức năng của tài khoản. Nếu cần hỗ trợ về tài khoản hoặc dữ liệu cá nhân, vui lòng liên hệ qua thông tin hỗ trợ ở cuối trang.",
        ],
      },
      {
        title: "Cập nhật chính sách",
        paragraphs: [
          "Nội dung có thể được cập nhật khi chức năng hoặc cách vận hành thay đổi. Những thay đổi sẽ được đăng trên trang này; bạn nên xem lại định kỳ.",
        ],
      },
    ],
  },
};

const InformationPage = ({ page }) => {
  const content = pageContent[page] || pageContent.about;

  return (
    <main className="information-page">
      <header className="information-hero">
        <p className="information-eyebrow">{content.eyebrow}</p>
        <h1>{content.title}</h1>
        <p className="information-intro">{content.intro}</p>
      </header>

      <div className="information-layout">
        <nav className="information-nav" aria-label="Các trang thông tin">
          <Link
            to="/about"
            aria-current={page === "about" ? "page" : undefined}
          >
            Giới thiệu
          </Link>
          <Link
            to="/operating-regulations"
            aria-current={page === "regulations" ? "page" : undefined}
          >
            Quy chế hoạt động
          </Link>
          <Link
            to="/policies"
            aria-current={page === "policies" ? "page" : undefined}
          >
            Chính sách
          </Link>
        </nav>

        <article className="information-article">
          {content.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}
        </article>
      </div>
    </main>
  );
};

export default InformationPage;
