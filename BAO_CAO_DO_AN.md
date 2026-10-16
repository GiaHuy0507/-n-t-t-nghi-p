# BÁO CÁO ĐỒ ÁN TỐT NGHIỆP

## Nền tảng hỗ trợ tuyển dụng và phân tích hồ sơ ứng viên bằng AI

> **Bản thảo theo mã nguồn dự án DATN.** Thay các nội dung trong `[ngoặc vuông]` bằng thông tin chính thức; cập nhật ảnh chụp giao diện và kết quả kiểm thử thực tế trước khi nộp. Các mô tả kỹ thuật dưới đây được đối chiếu với mã nguồn hiện có.

---

## TRANG BÌA CHÍNH

**[TÊN TRƯỜNG ĐẠI HỌC]**  
**[TÊN KHOA / VIỆN]**

<br><br>

# ĐỒ ÁN TỐT NGHIỆP

## NỀN TẢNG HỖ TRỢ TUYỂN DỤNG VÀ PHÂN TÍCH HỒ SƠ ỨNG VIÊN BẰNG AI

**Giảng viên hướng dẫn:** [Họ và tên giảng viên]  
**Sinh viên thực hiện:** [Họ và tên sinh viên / các thành viên]  
**Mã sinh viên:** [Mã sinh viên]  
**Lớp:** [Lớp / khóa]

**[Địa phương], [năm]**

---

## TRANG BÌA PHỤ

**[TÊN TRƯỜNG ĐẠI HỌC] – [TÊN KHOA / VIỆN]**

### ĐỒ ÁN TỐT NGHIỆP

### NỀN TẢNG HỖ TRỢ TUYỂN DỤNG VÀ PHÂN TÍCH HỒ SƠ ỨNG VIÊN BẰNG AI

**Chuyên ngành:** [Tên chuyên ngành]  
**Giảng viên hướng dẫn:** [Họ tên, học hàm/học vị nếu có]  
**Sinh viên thực hiện:** [Họ tên – mã sinh viên]

**[Địa phương], [năm]**

---

## LỜI CAM ĐOAN

Chúng em xin cam đoan đồ án **“Nền tảng hỗ trợ tuyển dụng và phân tích hồ sơ ứng viên bằng AI”** là kết quả nghiên cứu và thực hiện của [cá nhân/nhóm]. Các nội dung tham khảo, thư viện, dịch vụ và tài liệu của tác giả khác được ghi nhận trong phần tài liệu tham khảo. Chúng em chịu trách nhiệm về tính trung thực của nội dung và kết quả trình bày trong báo cáo, đồng thời cam kết tuân thủ quy định về liêm chính học thuật của [tên trường].

**[Địa phương], ngày [..] tháng [..] năm [....]**  
**Đại diện sinh viên thực hiện**  
[Ký và ghi rõ họ tên]

## LỜI CẢM ƠN

Chúng em xin chân thành cảm ơn [họ tên giảng viên hướng dẫn] đã hướng dẫn, góp ý và hỗ trợ nhóm trong quá trình lựa chọn đề tài, phân tích yêu cầu và hoàn thiện sản phẩm. Những nhận xét của thầy/cô giúp nhóm điều chỉnh cách tiếp cận và củng cố kiến thức chuyên môn.

Chúng em cũng xin cảm ơn [tên khoa/trường], các thầy cô và những người đã hỗ trợ, chia sẻ ý kiến trong quá trình khảo sát và thực hiện đồ án. Do thời gian và kinh nghiệm còn hạn chế, báo cáo và sản phẩm có thể còn thiếu sót. Nhóm mong nhận được ý kiến đóng góp để tiếp tục hoàn thiện.

## TÓM TẮT

Đồ án xây dựng một nền tảng tuyển dụng trực tuyến kết nối ứng viên và nhà tuyển dụng, đồng thời hỗ trợ ứng viên hiểu rõ hơn nội dung hồ sơ của mình thông qua phân tích CV bằng mô hình ngôn ngữ Gemini. Ứng viên có thể tạo tài khoản, tìm kiếm tin tuyển dụng, tải CV PDF, xem nội dung được trích xuất, nhận nhận xét về điểm mạnh và đề xuất cải thiện, cũng như tham khảo các việc làm có kỹ năng gần với hồ sơ. Nhà tuyển dụng có thể quản lý tin tuyển dụng, xem hồ sơ ứng tuyển, ghi chú, cập nhật trạng thái và tham khảo danh sách ứng viên được xếp hạng theo mức độ phù hợp. Quản trị viên có thể theo dõi người dùng, tin tuyển dụng và điều chỉnh một số trạng thái hệ thống.

Hệ thống sử dụng React và SCSS ở phía giao diện; Node.js, Express và Mongoose ở phía máy chủ; MongoDB để lưu dữ liệu; Multer và hệ thống tệp để nhận, lưu CV; `pdf-parse` để trích xuất chữ từ PDF; Gemini API để phân tích nội dung CV theo cấu trúc JSON. Tệp được tính mã SHA-256 nhằm nhận diện CV trùng của cùng ứng viên. Kết quả thực tế cần được đánh giá bằng bộ kiểm thử và thử nghiệm người dùng trước khi đưa ra kết luận định lượng; báo cáo không giả định trước số liệu hiệu năng hay độ chính xác của AI.

**Từ khóa:** tuyển dụng trực tuyến, CV, phân tích hồ sơ, Gemini, MongoDB, Applicant Tracking System.

## ABSTRACT

This project develops an online recruitment platform that connects candidates and employers and uses the Gemini API to analyze résumé content. Candidates can register, browse job postings, upload PDF résumés, review extracted profile information, receive evidence-based strengths and improvement suggestions, and explore jobs whose requirements overlap with their skills. Employers can manage job postings, review applications, add notes, update application statuses, and consult a ranked shortlist based on candidate profile evidence. Administrators can inspect users and job postings and manage selected system states.

The frontend is built with React and SCSS. The backend uses Node.js, Express, and Mongoose, with MongoDB for structured data and the local filesystem for uploaded PDF files. Multer handles uploads, `pdf-parse` extracts text, and Gemini produces structured résumé analysis. SHA-256 hashes are used to detect duplicate files for the same candidate. Quantitative claims about usability, performance, or AI accuracy should be added only after running and documenting the corresponding evaluations.

**Keywords:** online recruitment, résumé analysis, Gemini, MongoDB, applicant tracking.

## MỤC LỤC

> Trong Word: áp dụng Heading 1/2/3 cho tiêu đề, sau đó chọn **References → Table of Contents** để tạo mục lục tự động. Cập nhật trường mục lục sau khi dàn trang.

- Lời cam đoan
- Lời cảm ơn
- Tóm tắt / Abstract
- Danh mục hình, bảng và chữ viết tắt
- Chương 1. Giới thiệu chung và tổng quan đề tài
- Chương 2. Cơ sở lý thuyết và công nghệ sử dụng
- Chương 3. Phân tích và thiết kế hệ thống
- Chương 4. Hiện thực hệ thống
- Chương 5. Kiểm thử và đánh giá hệ thống
- Chương 6. Kết luận và hướng phát triển
- Tài liệu tham khảo
- Phụ lục

## DANH MỤC HÌNH ẢNH

| Mã hình  | Tên hình                        | Gợi ý bổ sung                                          |
| -------- | ------------------------------- | ------------------------------------------------------ |
| Hình 3.1 | Sơ đồ ca sử dụng tổng quát      | Các tác nhân ứng viên, HR, quản trị viên và Gemini API |
| Hình 3.2 | Mô hình quan hệ các collection  | Vẽ theo các tham chiếu trong MongoDB                   |
| Hình 3.3 | Sequence tải CV và phân tích AI | Thể hiện nhận diện tệp trùng và lỗi AI                 |
| Hình 3.4 | Sequence ứng tuyển việc làm     | Thể hiện kiểm tra đơn trùng, trạng thái tin và CV      |
| Hình 3.5 | Sequence HR xử lý hồ sơ         | Thể hiện tải danh sách và cập nhật trạng thái          |
| Hình 4.1 | Trang chủ                       | Chèn ảnh chụp ứng dụng chạy thực tế                    |
| Hình 4.2 | Danh sách và chi tiết việc làm  | Chèn ảnh chụp ứng dụng chạy thực tế                    |
| Hình 4.3 | Trang tải CV và kết quả AI      | Che thông tin cá nhân trong ảnh                        |
| Hình 4.4 | Khu vực quản lý tuyển dụng      | Chèn ảnh HR Dashboard/Applications                     |
| Hình 4.5 | Khu vực quản trị                | Chèn ảnh Admin Dashboard                               |

## DANH MỤC BẢNG BIỂU

| Mã bảng  | Tên bảng                        |
| -------- | ------------------------------- |
| Bảng 2.1 | Công nghệ sử dụng trong dự án   |
| Bảng 3.1 | Tác nhân và quyền chính         |
| Bảng 3.2 | Đặc tả chức năng hệ thống       |
| Bảng 3.3 | Mô tả collection User           |
| Bảng 3.4 | Mô tả collection Job            |
| Bảng 3.5 | Mô tả collection CV             |
| Bảng 3.6 | Mô tả collection Application    |
| Bảng 3.7 | Đặc tả một số API               |
| Bảng 5.1 | Các trường hợp kiểm thử đề xuất |

## DANH MỤC CHỮ VIẾT TẮT

| Chữ viết tắt | Diễn giải                                   |
| ------------ | ------------------------------------------- |
| AI           | Artificial Intelligence – Trí tuệ nhân tạo  |
| API          | Application Programming Interface           |
| ATS          | Applicant Tracking System                   |
| CV           | Curriculum Vitae – Hồ sơ ứng viên           |
| HR           | Human Resources – Nhân sự / nhà tuyển dụng  |
| HTTP         | Hypertext Transfer Protocol                 |
| JSON         | JavaScript Object Notation                  |
| LLM          | Large Language Model – Mô hình ngôn ngữ lớn |
| REST         | Representational State Transfer             |
| UI/UX        | User Interface / User Experience            |

# CHƯƠNG 1. GIỚI THIỆU CHUNG VÀ TỔNG QUAN ĐỀ TÀI

## 1.1. Đặt vấn đề và tính cấp thiết

Quá trình tuyển dụng thường bắt đầu bằng việc doanh nghiệp đăng tin, tiếp nhận nhiều hồ sơ, đọc CV, đối chiếu yêu cầu công việc và liên hệ ứng viên phù hợp. Khi số lượng hồ sơ tăng, việc theo dõi trạng thái và sàng lọc thủ công có thể tốn thời gian, khó duy trì tiêu chí nhất quán và làm cho ứng viên thiếu thông tin về tiến trình ứng tuyển. Ở chiều ngược lại, ứng viên có thể gặp khó khăn khi xác định CV đã trình bày rõ kỹ năng, kinh nghiệm và thành tựu phù hợp với vị trí hay chưa.

Đề tài được lựa chọn nhằm xây dựng một điểm truy cập thống nhất cho tin tuyển dụng và hồ sơ ứng viên, đồng thời thử nghiệm việc dùng AI để tổ chức nội dung CV thành các trường dữ liệu có cấu trúc. AI được sử dụng như công cụ hỗ trợ đọc và góp ý; quyết định tuyển dụng cuối cùng vẫn thuộc về nhà tuyển dụng. Việc trình bày rõ bằng chứng trong CV và giới hạn của phân tích tự động là cần thiết để tránh xem điểm phù hợp như một kết luận chắc chắn về năng lực.

## 1.2. Mục tiêu đề tài

Mục tiêu tổng quát là phân tích, thiết kế và hiện thực một ứng dụng web tuyển dụng có các vai trò ứng viên, HR và quản trị viên.

Các mục tiêu cụ thể:

1. Cho phép người dùng đăng ký, đăng nhập và truy cập chức năng theo vai trò.
2. Cho phép xem tin việc làm; HR tạo, cập nhật và quản lý tin tuyển dụng.
3. Cho phép ứng viên tải CV định dạng PDF và xem kết quả phân tích có cấu trúc.
4. Giảm việc lưu nhiều bản sao cùng một CV của một ứng viên bằng mã băm SHA-256.
5. Hỗ trợ ứng viên tham khảo việc làm dựa trên kỹ năng trích xuất và hỗ trợ HR sắp xếp ứng viên theo mức độ khớp với tin tuyển dụng.
6. Hỗ trợ quy trình ứng tuyển, theo dõi trạng thái, ghi chú đánh giá và quản trị dữ liệu cơ bản.

## 1.3. Đối tượng và phạm vi nghiên cứu

**Đối tượng sử dụng:** ứng viên (`CANDIDATE`), nhà tuyển dụng (`HR`) và quản trị viên (`ADMIN`).

**Phạm vi chức năng hiện có:** xác thực bằng JWT; phân quyền theo vai trò; xem danh sách/chi tiết việc làm; HR quản lý việc làm; ứng viên tải CV PDF, xem phân tích AI và việc làm gợi ý; ứng tuyển bằng CV; HR xem hồ sơ, shortlist, ghi chú và cập nhật trạng thái; quản trị viên xem tổng quan, danh sách người dùng/việc làm và cập nhật vai trò/trạng thái.

**Giới hạn:** ứng dụng nhận CV PDF tối đa 10 MB; tệp được lưu trên hệ thống tệp cục bộ của máy chủ, còn metadata và nội dung phân tích được lưu trong MongoDB. Việc phân tích cần kết nối Gemini API và cấu hình khóa API. Dự án hiện dùng JavaScript và SCSS; không thấy TypeScript, Tailwind CSS hay một dịch vụ Python/FastAPI trong mã nguồn. Bản triển khai cần tự cấu hình tên miền, lưu trữ tệp bền vững, sao lưu, giám sát và chính sách bảo vệ dữ liệu phù hợp.

## 1.4. Phương pháp nghiên cứu và phát triển

Nhóm khảo sát quy trình tuyển dụng cơ bản, xác định vai trò và các thao tác chính, sau đó đối chiếu yêu cầu với cấu trúc giao diện, API và mô hình dữ liệu. Quy trình phát triển được tổ chức theo các bước lặp: xác định yêu cầu, thiết kế, cài đặt, kiểm tra và điều chỉnh. Đây là mô tả quy trình phù hợp với cách triển khai phần mềm theo vòng lặp; nếu nhóm thực sự áp dụng Scrum, cần bổ sung thời gian sprint, backlog, vai trò và biên bản tương ứng.

Phương pháp kỹ thuật gồm phân tích yêu cầu chức năng; thiết kế mô hình dữ liệu hướng tài liệu; xây dựng API REST; xác thực và phân quyền ở máy chủ; xử lý PDF; tích hợp dịch vụ AI; kiểm thử chức năng bằng các ca kiểm thử. Báo cáo cần ghi nhận môi trường và kết quả chạy thực tế ở mục 5.2.

# CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ SỬ DỤNG

## 2.1. Các khái niệm nền tảng

### 2.1.1. Cổng tuyển dụng trực tuyến

Job Portal là hệ thống trực tuyến cho phép nhà tuyển dụng công bố cơ hội việc làm và ứng viên tìm kiếm, xem chi tiết, nộp hồ sơ. Trong đồ án, tin tuyển dụng chứa chức danh, mô tả, công ty, địa điểm, khoảng lương, kỹ năng, hình thức làm việc và trạng thái mở/đóng.

### 2.1.2. Hệ thống theo dõi ứng viên

Applicant Tracking System (ATS) hỗ trợ quản lý hồ sơ trong các bước của quy trình tuyển dụng. Ứng dụng này có các chức năng mang tính ATS như lưu đơn ứng tuyển, liên kết đơn với CV và việc làm, lọc theo trạng thái, ghi chú của HR và shortlist hỗ trợ. Đây là một hệ thống quy mô đồ án, chưa nhằm thay thế các ATS doanh nghiệp đầy đủ.

### 2.1.3. AI trong phân tích CV

Mô hình ngôn ngữ nhận nội dung CV và trả về các trường như thông tin cá nhân, tóm tắt, kỹ năng, học vấn, kinh nghiệm, điểm mạnh, đề xuất cải thiện và thông tin còn thiếu. Kết quả được yêu cầu theo JSON schema để máy chủ có thể lưu và giao diện hiển thị thống nhất. Mô hình có thể sai hoặc bỏ sót nội dung; do đó kết quả là gợi ý cần được người dùng kiểm tra. Hệ thống có chỉ dẫn yêu cầu AI không làm theo chỉ thị nhúng trong CV và chỉ kết luận dựa trên bằng chứng, nhưng điều đó không bảo đảm loại bỏ hoàn toàn sai lệch.

## 2.2. Công nghệ và công cụ phát triển

| Thành phần                 | Công nghệ trong mã nguồn                    | Vai trò                                                                |
| -------------------------- | ------------------------------------------- | ---------------------------------------------------------------------- |
| Frontend                   | React, React Router, JavaScript, SCSS, Vite | Xây dựng trang, điều hướng, giao diện và biểu mẫu                      |
| Gọi API                    | Axios và Fetch API                          | Gửi yêu cầu đến backend; gắn JWT ở các yêu cầu Axios                   |
| Backend                    | Node.js, Express 5                          | Xây dựng REST API và xử lý nghiệp vụ                                   |
| Cơ sở dữ liệu              | MongoDB, Mongoose                           | Lưu người dùng, việc làm, CV và đơn ứng tuyển                          |
| Tải tệp                    | Multer                                      | Nhận tệp PDF, giới hạn 10 MB, lưu tạm trước khi xử lý                  |
| PDF                        | `pdf-parse`                                 | Trích xuất văn bản từ PDF có lớp chữ                                   |
| AI                         | Google GenAI SDK, Gemini API                | Phân tích CV thành JSON; tạo mô tả công việc theo logic hiện tại       |
| Bảo mật hỗ trợ             | `jsonwebtoken`, `bcryptjs`, `helmet`, CORS  | Token xác thực, băm mật khẩu, header bảo mật và cấu hình chia sẻ nguồn |
| Lưu trạng thái trình duyệt | `localStorage`, `sessionStorage`            | Lưu token/người dùng; giữ kết quả tải CV trong phiên trình duyệt       |

Dự án không sử dụng TypeScript, Tailwind CSS hoặc FastAPI theo cấu hình và mã nguồn được khảo sát. Backend hiện là một ứng dụng Node.js duy nhất; Python/FastAPI không tham gia luồng xử lý. Phân tích CV được gọi qua Gemini API bằng SDK `@google/genai`.

### 2.2.1. Công nghệ phía giao diện

React tổ chức giao diện thành các trang và component. React Router khai báo các tuyến như trang chủ, danh sách việc làm, chi tiết việc làm, tải CV, hồ sơ cá nhân, khu vực HR và khu vực quản trị. SCSS được dùng để định dạng giao diện. `ProtectedRoute` kiểm tra token và vai trò đã lưu ở trình duyệt để điều hướng người dùng; backend vẫn phải xác thực và phân quyền độc lập cho API.

### 2.2.2. Công nghệ phía máy chủ

Express khai báo các tuyến API và middleware. Mongoose định nghĩa schema, kiểm tra một số giá trị enum và quan hệ tham chiếu giữa collection. Middleware JWT xác thực người dùng, middleware vai trò giới hạn thao tác. Mật khẩu được xử lý qua `bcryptjs`; JWT cung cấp token truy cập. Các biến cấu hình nhạy cảm như URI MongoDB và khóa Gemini cần đặt trong môi trường máy chủ, không ghi vào mã nguồn.

### 2.2.3. Cơ sở dữ liệu và tệp

MongoDB lưu dữ liệu nghiệp vụ. Tệp PDF lưu trong thư mục `uploads/cv` sau khi được nhận ở thư mục tạm. `fileHash` sử dụng SHA-256 để tìm bản trùng thuộc cùng ứng viên. Tệp không được lưu trực tiếp trong document MongoDB. Trong môi trường triển khai nhiều máy chủ hoặc không có ổ đĩa bền vững, cần thay bằng dịch vụ lưu trữ đối tượng và cơ chế dọn dẹp/sao lưu tương ứng.

### 2.2.4. Tích hợp AI

Máy chủ gửi văn bản PDF đã trích xuất hoặc gửi PDF trực tiếp nếu không trích được đủ văn bản. Gemini được yêu cầu trả JSON theo schema, bao gồm `personalInfo`, `summary`, `strengths`, `improvementSuggestions`, `skills`, `education`, `experienceYears`, `workExperience`, `languages`, `certifications` và `missingInformation`. Kết quả và trạng thái được lưu ở CV. Logic so khớp công việc hiện chuẩn hóa chữ thường và dấu, đối chiếu kỹ năng, từ khóa chức danh, và số năm kinh nghiệm nếu mô tả công việc có thể nhận diện số năm.

# CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

## 3.1. Khảo sát yêu cầu và tác nhân

| Tác nhân            | Nhu cầu và quyền chính                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Ứng viên            | Đăng ký/đăng nhập; tìm việc; tải và phân tích CV; xem việc làm gợi ý; ứng tuyển; theo dõi đơn; tạo CV từ giao diện hỗ trợ |
| Nhà tuyển dụng (HR) | Quản lý tin do mình tạo; xem hồ sơ ứng tuyển; xem CV; tham khảo shortlist; ghi chú và cập nhật trạng thái ứng viên        |
| Quản trị viên       | Xem tổng quan, người dùng và việc làm; thay đổi vai trò người dùng; đổi trạng thái hoặc xóa tin tuyển dụng                |

### 3.1.1. Đặc tả chức năng hệ thống

Bảng 3.2 mô tả đầu vào, đầu ra, xử lý chính và nơi lưu dữ liệu của các chức năng. “Dữ liệu cần lưu” phân biệt dữ liệu bền vững phía máy chủ với dữ liệu tạm/lưu cục bộ trên trình duyệt.

| Chức năng                  | Đầu vào                                                                                                       | Đầu ra                                                                               | Xử lý                                                                                                                                  | Dữ liệu cần lưu                                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Đăng ký và đăng nhập       | Đăng ký: họ tên, email, mật khẩu, vai trò tùy chọn. Đăng nhập: email, mật khẩu.                               | Đăng ký trả thông tin tài khoản; đăng nhập trả thông tin người dùng và JWT.          | Kiểm tra dữ liệu và email trùng; băm mật khẩu bằng bcrypt; đối chiếu mật khẩu khi đăng nhập; phát JWT có thời hạn 7 ngày.              | MongoDB `User`: họ tên, email, mật khẩu đã băm, vai trò. Trình duyệt lưu JWT và thông tin người dùng trong `localStorage`.                       |
| Tìm kiếm và xem việc làm   | Yêu cầu lấy danh sách hoặc mã tin tuyển dụng.                                                                 | Danh sách tin hoặc nội dung chi tiết một tin.                                        | Backend truy vấn collection `Job`; giao diện hiển thị thông tin tin tuyển dụng.                                                        | Không tạo dữ liệu mới; đọc dữ liệu `Job` đã có trong MongoDB.                                                                                    |
| HR quản lý tin tuyển dụng  | Tiêu đề, mô tả, công ty, địa điểm, khoảng lương, kỹ năng, hình thức làm việc, trạng thái; mã tin khi sửa/xóa. | Tin được tạo/cập nhật, danh sách tin của HR hoặc thông báo kết quả thao tác.         | Xác thực vai trò HR và quyền sở hữu tin; tạo, sửa trường cho phép hoặc xóa tin. Khi xóa tin, các đơn ứng tuyển liên quan cũng bị xóa.  | MongoDB `Job`: nội dung tin, `createdBy`, trạng thái và thời gian. Các `Application` liên quan bị xóa khi xóa tin.                               |
| Tải và phân tích CV        | Tệp PDF tối đa 10 MB và JWT của ứng viên.                                                                     | CV đã lưu, văn bản trích xuất, kết quả phân tích hoặc trạng thái phân tích thất bại. | Kiểm tra tệp; tính SHA-256 để tìm bản trùng của cùng ứng viên; trích xuất văn bản; gọi Gemini; lưu kết quả hoặc `FAILED`.              | Tệp PDF trong `uploads/cv`; MongoDB `CV`: ứng viên, tên/đường dẫn tệp, hash, văn bản, trạng thái và kết quả AI.                                  |
| Gợi ý việc làm phù hợp     | Kỹ năng từ kết quả phân tích CV và danh sách tin tuyển dụng.                                                  | Tối đa 5 tin được xếp hạng theo mức độ trùng kỹ năng.                                | Giao diện so khớp kỹ năng với tiêu đề, mô tả, yêu cầu và kỹ năng của tin; sắp xếp điểm giảm dần.                                       | Không lưu điểm gợi ý vào MongoDB; kết quả phân tích và danh sách gợi ý được giữ trong `sessionStorage` của trình duyệt.                          |
| Ứng tuyển và theo dõi đơn  | Mã tin, CV PDF, thư giới thiệu (nếu có) và JWT ứng viên.                                                      | Đơn ứng tuyển được tạo; ứng viên nhận danh sách và trạng thái các đơn của mình.      | Kiểm tra đơn trùng và tin còn mở; lưu hoặc tái sử dụng CV; tạo đơn; thử phân tích CV nếu chưa có kết quả. Lỗi AI không hủy đơn đã tạo. | MongoDB `Application`: ứng viên, tin, CV tham chiếu, thư giới thiệu, trạng thái. Thông tin tệp và phân tích được lưu trong `CV` và hệ thống tệp. |
| HR xem và xử lý hồ sơ      | Yêu cầu lấy đơn; mã tin/mã đơn; trạng thái mới hoặc ghi chú đánh giá.                                         | Danh sách đơn, CV, shortlist có điểm so khớp; kết quả cập nhật trạng thái/ghi chú.   | Chỉ truy cập đơn thuộc tin do HR tạo; kiểm tra trạng thái hợp lệ; ghi chú tối đa 2.000 ký tự. Điểm shortlist được tính khi yêu cầu.    | MongoDB `Application`: `status` và `hrNote`. Điểm shortlist được tính tại thời điểm truy vấn, không lưu thành trường riêng.                      |
| Quản trị người dùng và tin | Yêu cầu tổng quan/danh sách; mã người dùng và vai trò; mã tin và trạng thái hoặc yêu cầu xóa.                 | Số liệu tổng quan, danh sách người dùng/tin và kết quả cập nhật.                     | Chỉ ADMIN được gọi; kiểm tra vai trò/trạng thái thuộc danh sách hợp lệ; khi xóa tin, xóa các đơn liên quan.                            | MongoDB `User.role`, `Job.status`; tin và đơn liên quan bị xóa theo thao tác quản trị. Số liệu tổng quan được truy vấn từ dữ liệu hiện có.       |
| Tạo CV và xuất PDF         | Thông tin cá nhân, tóm tắt, kỹ năng, kinh nghiệm, học vấn, mẫu CV và gợi ý AI nếu có.                         | Bản nháp có thể chỉnh sửa và tệp PDF tải về.                                         | Giao diện tạo bản xem trước; lưu/đọc/xóa bản nháp cục bộ; kết xuất PDF trên trình duyệt.                                               | Bản nháp lưu trong `localStorage` với khóa `cvDrafts`; PDF được tải về thiết bị. Chức năng này không ghi bản nháp vào MongoDB.                   |

**Lưu ý về đăng ký:** API hiện nhận trường `role` từ yêu cầu đăng ký nếu giá trị thuộc enum hợp lệ; nếu bỏ trống thì mặc định là `CANDIDATE`. Khi triển khai thực tế, nên giới hạn tài khoản tự đăng ký ở vai trò ứng viên và cấp quyền HR/ADMIN qua quy trình quản trị.

### 3.1.2. Yêu cầu phi chức năng

Yêu cầu phi chức năng gồm giao diện dễ hiểu, kiểm tra dữ liệu đầu vào, phân quyền phía máy chủ, thông báo lỗi phù hợp và lưu trữ dữ liệu nhất quán. Các yêu cầu về tải đồng thời, thời gian phản hồi, khả năng truy cập và tiêu chuẩn bảo mật cần được đo/đặc tả thêm nếu dùng trong môi trường thực tế.

## 3.2. Sơ đồ ca sử dụng

### 3.2.1. Sơ đồ ca sử dụng tổng quát

Sơ đồ thể hiện các chức năng chính theo vai trò. Gemini API là hệ thống ngoài được gọi khi phân tích CV; kết quả phân tích chỉ mang tính hỗ trợ.

```mermaid
flowchart LR
  C[Ứng viên]
  H[Nhà tuyển dụng / HR]
  A[Quản trị viên]
  G[Gemini API]

  subgraph SYS["Nền tảng tuyển dụng"]
    direction TB
    UC1([Đăng ký / đăng nhập])
    UC2([Tìm kiếm và xem việc làm])
    UC3([Tải CV và xem phân tích AI])
    UC4([Xem việc làm phù hợp])
    UC5([Ứng tuyển và theo dõi đơn])
    UC10([Tạo CV từ gợi ý phân tích])
    UC6([Tạo và quản lý tin tuyển dụng])
    UC7([Xem hồ sơ và shortlist ứng viên])
    UC8([Ghi chú và cập nhật trạng thái])
    UC9([Quản lý người dùng và tin tuyển dụng])
  end

  C --- UC1
  H --- UC1
  A --- UC1
  C --- UC2
  C --- UC3
  C --- UC4
  C --- UC5
  C --- UC10
  H --- UC6
  H --- UC7
  H --- UC8
  A --- UC9
  G --- UC3
```

### 3.2.2. Sequence tải CV và phân tích AI

Ứng viên tải PDF qua API có xác thực. Máy chủ nhận diện CV trùng theo ứng viên và SHA-256; CV đã phân tích thành công được trả lại mà không gọi AI lần nữa. Nếu Gemini lỗi, CV vẫn được lưu với trạng thái `FAILED` để có thể xử lý lại.

```mermaid
sequenceDiagram
  actor C as Ứng viên
  participant UI as Giao diện React
  participant API as Express API
  participant Auth as Middleware xác thực / vai trò
  participant CV as CV Controller
  participant Store as Dịch vụ lưu CV
  participant FS as Hệ thống tệp
  participant DB as MongoDB
  participant PDF as PDF Service
  participant AI as Gemini API

  C->>UI: Chọn PDF và tải lên
  UI->>UI: Kiểm tra dung lượng tối đa 10 MB
  UI->>API: POST /api/cv/upload (PDF, JWT)
  API->>Auth: Xác thực token và vai trò CANDIDATE
  Auth-->>API: Cho phép yêu cầu
  API->>CV: Chuyển tệp đã nhận
  CV->>Store: Lưu CV cho ứng viên
  Store->>FS: Đọc tệp tạm, tính SHA-256
  Store->>DB: Tìm CV trùng theo ứng viên và hash

  alt CV trùng đã phân tích thành công
    DB-->>Store: Trả CV hiện có
    Store->>FS: Xóa tệp tạm
    Store-->>CV: CV hiện có, duplicate = true
    CV-->>UI: 200, kết quả phân tích hiện có
  else CV mới hoặc CV trùng chưa phân tích xong
    opt CV mới
      Store->>PDF: Trích xuất văn bản từ PDF
      PDF-->>Store: Văn bản trích xuất (có thể rỗng)
      Store->>FS: Chuyển tệp vào thư mục lưu CV
      Store->>DB: Tạo CV, aiStatus = PENDING
    end
    Store-->>CV: CV cần phân tích
    CV->>AI: Phân tích văn bản hoặc PDF
    alt Gemini phân tích thành công
      AI-->>CV: Kết quả JSON
      CV->>DB: Lưu kết quả, aiStatus = COMPLETED
    else Gemini lỗi
      AI-->>CV: Lỗi phân tích
      CV->>DB: Lưu aiStatus = FAILED
    end
    CV-->>UI: 201, CV và trạng thái phân tích
  end
  UI-->>C: Hiển thị kết quả hoặc thông báo trạng thái
```

### 3.2.3. Sequence ứng tuyển việc làm

Ứng viên gửi mã việc làm, CV PDF và thư giới thiệu. Máy chủ từ chối đơn trùng hoặc tin đã đóng; nếu hợp lệ, hệ thống tạo đơn trước khi phân tích CV. Phân tích AI thất bại không hủy đơn ứng tuyển.

```mermaid
sequenceDiagram
  actor C as Ứng viên
  participant UI as Giao diện React
  participant API as Express API
  participant Auth as Middleware xác thực / vai trò
  participant Controller as Application Controller
  participant Service as Application Service
  participant DB as MongoDB
  participant CVStore as Dịch vụ lưu CV
  participant AI as Gemini API

  C->>UI: Gửi hồ sơ ứng tuyển
  UI->>API: POST /api/applications (jobId, CV, thư giới thiệu, JWT)
  API->>Auth: Xác thực token và vai trò CANDIDATE
  Auth-->>API: Cho phép yêu cầu
  API->>Controller: Chuyển dữ liệu và tệp đã nhận
  Controller->>Service: Tạo đơn ứng tuyển
  Service->>DB: Kiểm tra đơn trùng của ứng viên với việc làm
  alt Đã ứng tuyển trước đó
    DB-->>Service: Tìm thấy đơn hiện có
    Service-->>Controller: Lỗi đơn trùng
    Controller-->>UI: 400, thông báo đã ứng tuyển
  else Chưa có đơn
    Service->>DB: Kiểm tra việc làm tồn tại và đang OPEN
    alt Tin không tồn tại hoặc đã đóng
      DB-->>Service: Không hợp lệ
      Service-->>Controller: Lỗi việc làm
      Controller-->>UI: 400, thông báo lỗi
    else Tin đang mở
      Service->>CVStore: Lưu hoặc nhận diện CV trùng
      CVStore-->>Service: CV đã lưu
      Service->>DB: Tạo đơn ứng tuyển
      opt CV chưa có kết quả phân tích thành công
        Service->>AI: Phân tích nội dung CV
        alt Phân tích thành công
          AI-->>Service: Kết quả JSON
          Service->>DB: Lưu kết quả và aiStatus = COMPLETED
        else Phân tích thất bại
          AI-->>Service: Lỗi
          Service->>DB: Lưu aiStatus = FAILED
        end
      end
      Service-->>Controller: Đơn ứng tuyển đã tạo
      Controller-->>UI: 201, ứng tuyển thành công
    end
  end
  UI-->>C: Hiển thị kết quả thao tác
```

### 3.2.4. Sequence HR xem và cập nhật hồ sơ

HR chỉ xem các đơn thuộc tin do chính mình tạo. Khi cập nhật trạng thái, máy chủ kiểm tra quyền sở hữu tin và giá trị trạng thái trước khi lưu.

```mermaid
sequenceDiagram
  actor H as Nhà tuyển dụng / HR
  participant UI as Giao diện HR
  participant API as Express API
  participant Auth as Middleware xác thực / vai trò
  participant Controller as Application Controller
  participant Service as Application Service
  participant DB as MongoDB

  H->>UI: Mở danh sách hồ sơ
  UI->>API: GET /api/applications/hr (JWT)
  API->>Auth: Xác thực token và vai trò HR
  Auth-->>API: Cho phép yêu cầu
  API->>Controller: Lấy danh sách hồ sơ
  Controller->>Service: getApplicationsForHR(hrId)
  Service->>DB: Tìm tin do HR tạo
  DB-->>Service: Danh sách mã tin
  Service->>DB: Tìm đơn ứng tuyển thuộc các tin đó
  DB-->>Service: Đơn, ứng viên, tin và thông tin CV
  Service-->>Controller: Danh sách hồ sơ
  Controller-->>UI: 200, danh sách hồ sơ
  UI-->>H: Hiển thị ứng viên

  H->>UI: Chọn trạng thái mới
  UI->>API: PATCH /api/applications/:id/status (status, JWT)
  API->>Auth: Xác thực token và vai trò HR
  Auth-->>API: Cho phép yêu cầu
  API->>Controller: Cập nhật trạng thái
  Controller->>Service: updateApplicationStatus(id, hrId, status)
  Service->>DB: Tìm đơn và kiểm tra HR sở hữu tin
  alt HR có quyền và trạng thái hợp lệ
    Service->>DB: Lưu trạng thái mới
    DB-->>Service: Đơn đã cập nhật
    Service-->>Controller: Đơn đã cập nhật
    Controller-->>UI: 200, cập nhật thành công
  else Không có quyền hoặc trạng thái không hợp lệ
    Service-->>Controller: Lỗi kiểm tra
    Controller-->>UI: 400, thông báo lỗi
  end
  UI-->>H: Cập nhật giao diện
```

## 3.3. Thiết kế cơ sở dữ liệu

Hệ thống sử dụng MongoDB với bốn collection nghiệp vụ. Các bảng dưới đây mô tả schema Mongoose; kiểu dữ liệu là kiểu tương ứng trong MongoDB, không phải kiểu cột SQL. Mỗi collection có `_id` kiểu `ObjectId`; tùy chọn `timestamps: true` tự tạo `createdAt` và `updatedAt`. Tham chiếu `ref` được Mongoose dùng để liên kết document, không phải khóa ngoại SQL.

### 3.3.1. Collection `User`

**Bảng 3.3. Mô tả collection User (người dùng)**

| STT | Thuộc tính  | Kiểu dữ liệu | Ràng buộc                                                             | Ý nghĩa                                                 |
| --: | ----------- | ------------ | --------------------------------------------------------------------- | ------------------------------------------------------- |
|   1 | `_id`       | ObjectId     | Khóa định danh MongoDB, tự tạo                                        | Mã định danh duy nhất của người dùng.                   |
|   2 | `name`      | String       | Bắt buộc, loại bỏ khoảng trắng đầu/cuối                               | Tên hiển thị của người dùng.                            |
|   3 | `email`     | String       | Bắt buộc, duy nhất, chuyển chữ thường, loại bỏ khoảng trắng           | Email dùng để đăng nhập và liên hệ.                     |
|   4 | `password`  | String       | Bắt buộc, tối thiểu 6 ký tự; được băm bằng bcrypt trong luồng đăng ký | Mật khẩu đã băm, không lưu mật khẩu rõ qua API đăng ký. |
|   5 | `role`      | String       | Enum `ADMIN`, `HR`, `CANDIDATE`; mặc định `CANDIDATE`                 | Vai trò và quyền truy cập của người dùng.               |
|   6 | `createdAt` | Date         | Tự tạo bởi Mongoose timestamps                                        | Thời điểm tạo tài khoản.                                |
|   7 | `updatedAt` | Date         | Tự cập nhật bởi Mongoose timestamps                                   | Thời điểm cập nhật tài khoản gần nhất.                  |

### 3.3.2. Collection `Job`

**Bảng 3.4. Mô tả collection Job (tin tuyển dụng)**

| STT | Thuộc tính       | Kiểu dữ liệu    | Ràng buộc                                                         | Ý nghĩa                                    |
| --: | ---------------- | --------------- | ----------------------------------------------------------------- | ------------------------------------------ |
|   1 | `_id`            | ObjectId        | Khóa định danh MongoDB, tự tạo                                    | Mã định danh của tin tuyển dụng.           |
|   2 | `title`          | String          | Bắt buộc, loại bỏ khoảng trắng đầu/cuối                           | Chức danh tuyển dụng.                      |
|   3 | `description`    | String          | Bắt buộc                                                          | Nội dung mô tả công việc và yêu cầu.       |
|   4 | `company`        | String          | Bắt buộc, loại bỏ khoảng trắng đầu/cuối                           | Tên công ty tuyển dụng.                    |
|   5 | `location`       | String          | Bắt buộc, loại bỏ khoảng trắng đầu/cuối                           | Địa điểm làm việc.                         |
|   6 | `salaryMin`      | Number          | Bắt buộc                                                          | Mức lương thấp nhất trong khoảng lương.    |
|   7 | `salaryMax`      | Number          | Bắt buộc                                                          | Mức lương cao nhất trong khoảng lương.     |
|   8 | `skills`         | Array of String | Mặc định mảng rỗng                                                | Danh sách kỹ năng liên quan đến công việc. |
|   9 | `employmentType` | String          | Enum `FULL_TIME`, `PART_TIME`, `INTERNSHIP`; mặc định `FULL_TIME` | Hình thức làm việc.                        |
|  10 | `status`         | String          | Enum `OPEN`, `CLOSED`; mặc định `OPEN`                            | Trạng thái nhận hồ sơ của tin.             |
|  11 | `createdBy`      | ObjectId        | Bắt buộc, tham chiếu `User`                                       | HR tạo và sở hữu tin tuyển dụng.           |
|  12 | `createdAt`      | Date            | Tự tạo bởi Mongoose timestamps                                    | Thời điểm đăng tin.                        |
|  13 | `updatedAt`      | Date            | Tự cập nhật bởi Mongoose timestamps                               | Thời điểm chỉnh sửa tin gần nhất.          |

### 3.3.3. Collection `CV`

**Bảng 3.5. Mô tả collection CV (hồ sơ ứng viên)**

| STT | Thuộc tính                          | Kiểu dữ liệu               | Ràng buộc                                                                            | Ý nghĩa                                                    |
| --: | ----------------------------------- | -------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
|   1 | `_id`                               | ObjectId                   | Khóa định danh MongoDB, tự tạo                                                       | Mã định danh hồ sơ CV.                                     |
|   2 | `candidate`                         | ObjectId                   | Bắt buộc, tham chiếu `User`                                                          | Ứng viên sở hữu CV.                                        |
|   3 | `originalName`                      | String                     | Bắt buộc                                                                             | Tên tệp gốc do ứng viên tải lên.                           |
|   4 | `fileName`                          | String                     | Bắt buộc                                                                             | Tên tệp được lưu trên máy chủ.                             |
|   5 | `filePath`                          | String                     | Bắt buộc                                                                             | Đường dẫn tệp PDF trong hệ thống tệp máy chủ.              |
|   6 | `fileHash`                          | String                     | Không bắt buộc; tham gia index ghép với `candidate`                                  | Giá trị SHA-256 dùng nhận diện CV trùng của cùng ứng viên. |
|   7 | `extractedText`                     | String                     | Mặc định chuỗi rỗng                                                                  | Văn bản trích xuất từ PDF hoặc nội dung văn bản CV.        |
|   8 | `aiStatus`                          | String                     | Enum `PENDING`, `COMPLETED`, `FAILED`; mặc định `PENDING`                            | Trạng thái phân tích CV bằng AI.                           |
|   9 | `aiAnalysis`                        | Embedded document          | Không bắt buộc; các trường con có giá trị mặc định                                   | Kết quả phân tích có cấu trúc từ Gemini.                   |
|  10 | `aiAnalysis.personalInfo`           | Embedded document          | Gồm `fullName`, `email`, `phone`, `location`; mặc định chuỗi rỗng                    | Thông tin liên hệ trích xuất từ CV.                        |
|  11 | `aiAnalysis.summary`                | String                     | Mặc định chuỗi rỗng                                                                  | Tóm tắt hồ sơ ứng viên.                                    |
|  12 | `aiAnalysis.strengths`              | Array of String            | Mặc định mảng rỗng                                                                   | Các điểm mạnh có căn cứ trong CV.                          |
|  13 | `aiAnalysis.improvementSuggestions` | Array of Embedded document | Mặc định mảng rỗng; mỗi phần tử gồm `issue`, `evidence`, `recommendation`, `example` | Các đề xuất cải thiện CV và bằng chứng liên quan.          |
|  14 | `aiAnalysis.skills`                 | Array of String            | Mặc định mảng rỗng                                                                   | Kỹ năng được trích xuất.                                   |
|  15 | `aiAnalysis.education`              | Array of Embedded document | Mặc định mảng rỗng; mỗi phần tử gồm `school`, `degree`, `major`                      | Thông tin học vấn.                                         |
|  16 | `aiAnalysis.experienceYears`        | Number                     | Mặc định `0`                                                                         | Số năm kinh nghiệm ước tính từ CV.                         |
|  17 | `aiAnalysis.workExperience`         | Array of Embedded document | Mặc định mảng rỗng; gồm `company`, `position`, `duration`, `highlights`              | Kinh nghiệm làm việc và thành tựu liên quan.               |
|  18 | `aiAnalysis.languages`              | Array of String            | Mặc định mảng rỗng                                                                   | Ngoại ngữ được nhận diện.                                  |
|  19 | `aiAnalysis.certifications`         | Array of String            | Mặc định mảng rỗng                                                                   | Chứng chỉ được nhận diện.                                  |
|  20 | `aiAnalysis.missingInformation`     | Array of String            | Mặc định mảng rỗng                                                                   | Các thông tin quan trọng còn thiếu trong CV.               |
|  21 | `uploadedAt`                        | Date                       | Mặc định thời điểm hiện tại                                                          | Thời điểm tải CV lên hệ thống.                             |
|  22 | `createdAt`, `updatedAt`            | Date                       | Tự tạo/cập nhật bởi Mongoose timestamps                                              | Thời điểm tạo và cập nhật document CV.                     |

Các tệp PDF được lưu trong hệ thống tệp, không lưu nhị phân trong document MongoDB. Schema định nghĩa index ghép `{ candidate: 1, fileHash: 1 }`; index này không khai báo `unique`. Các schema con của `aiAnalysis` không tạo `_id` riêng.

### 3.3.4. Collection `Application`

**Bảng 3.6. Mô tả collection Application (đơn ứng tuyển)**

| STT | Thuộc tính    | Kiểu dữ liệu | Ràng buộc                                                                              | Ý nghĩa                          |
| --: | ------------- | ------------ | -------------------------------------------------------------------------------------- | -------------------------------- |
|   1 | `_id`         | ObjectId     | Khóa định danh MongoDB, tự tạo                                                         | Mã định danh đơn ứng tuyển.      |
|   2 | `candidate`   | ObjectId     | Bắt buộc, tham chiếu `User`                                                            | Ứng viên nộp đơn.                |
|   3 | `job`         | ObjectId     | Bắt buộc, tham chiếu `Job`                                                             | Tin tuyển dụng được ứng tuyển.   |
|   4 | `cv`          | ObjectId     | Bắt buộc, tham chiếu `CV`                                                              | CV đính kèm đơn ứng tuyển.       |
|   5 | `coverLetter` | String       | Mặc định chuỗi rỗng, loại bỏ khoảng trắng đầu/cuối                                     | Thư giới thiệu của ứng viên.     |
|   6 | `status`      | String       | Enum `PENDING`, `SHORTLISTED`, `INTERVIEW`, `REJECTED`, `ACCEPTED`; mặc định `PENDING` | Trạng thái xử lý đơn ứng tuyển.  |
|   7 | `hrNote`      | String       | Mặc định chuỗi rỗng, tối đa 2.000 ký tự, loại bỏ khoảng trắng đầu/cuối                 | Ghi chú đánh giá nội bộ của HR.  |
|   8 | `createdAt`   | Date         | Tự tạo bởi Mongoose timestamps                                                         | Thời điểm nộp đơn.               |
|   9 | `updatedAt`   | Date         | Tự cập nhật bởi Mongoose timestamps                                                    | Thời điểm cập nhật đơn gần nhất. |

HR chỉ được đọc và cập nhật đơn ứng tuyển thuộc các tin do chính HR tạo; quyền sở hữu được kiểm tra ở tầng service.

```mermaid
erDiagram
  USER ||--o{ JOB : creates
  USER ||--o{ CV : owns
  USER ||--o{ APPLICATION : submits
  JOB ||--o{ APPLICATION : receives
  CV ||--o{ APPLICATION : attached_to
```

## 3.4. Thiết kế giao diện và luồng người dùng

**Luồng ứng viên:** Trang chủ → danh sách việc làm → chi tiết → đăng nhập/đăng ký → tải CV hoặc ứng tuyển → xem trạng thái đơn. Tại trang CV, ứng viên chọn PDF, nhận kết quả phân tích, xem kỹ năng và đề xuất, sau đó tham khảo các việc làm được xếp hạng.

**Luồng HR:** đăng nhập → dashboard/quản lý tin → tạo hoặc chỉnh sửa tin → xem đơn ứng tuyển → đọc CV/shortlist → thêm ghi chú và cập nhật trạng thái.

**Luồng quản trị:** đăng nhập → dashboard quản trị → xem người dùng/việc làm → điều chỉnh vai trò hoặc trạng thái tin.

Giao diện chính được tổ chức trong các trang `Home`, `JobList`, `JobDetail`, `CVUpload`, `MyApplications`, `HRDashboard`, `HRJobs`, `HRApplications` và `AdminDashboard`. Chèn ảnh chụp thực tế vào các vị trí Hình 4.1–4.5. Cần ẩn tên, email, số điện thoại và dữ liệu cá nhân của người thử nghiệm trước khi đưa ảnh vào báo cáo.

# CHƯƠNG 4. HIỆN THỰC HỆ THỐNG

## 4.1. Xây dựng phía Backend

### 4.1.1. Khởi tạo và kết nối

Máy chủ nạp cấu hình môi trường, kết nối MongoDB bằng Mongoose, sau đó khởi chạy Express trên cổng cấu hình hoặc cổng 3000 mặc định. Ứng dụng đăng ký CORS, Helmet, Morgan và JSON parser. Các nhóm tuyến được đặt dưới `/api/auth`, `/api/jobs`, `/api/applications`, `/api/cv` và `/api/admin`.

### 4.1.2. Xác thực và phân quyền

Người dùng đăng nhập nhận JWT; các API cần bảo vệ dùng middleware `protect`, sau đó `authorize` kiểm tra vai trò. Ví dụ, tải CV yêu cầu vai trò `CANDIDATE`; tạo và quản lý tin yêu cầu `HR`; các tuyến quản trị yêu cầu `ADMIN`. Giao diện ẩn/hiện tuyến theo vai trò giúp điều hướng, còn quyền truy cập dữ liệu được kiểm tra lại tại backend.

### 4.1.3. Luồng tải và phân tích CV

1. Multer nhận trường `cv`, chỉ chấp nhận MIME PDF, giới hạn 10 MB và đặt tệp ở vùng tạm.
2. Dịch vụ tính SHA-256 và tìm CV cùng hash của cùng ứng viên. Nếu trùng, tệp tạm được xóa và bản ghi hiện có được dùng lại.
3. Nếu là tệp mới, hệ thống thử trích xuất chữ bằng `pdf-parse`, chuyển tệp sang `uploads/cv`, tạo bản ghi CV ở trạng thái `PENDING`.
4. Backend gọi Gemini với văn bản đã trích xuất; nếu không có văn bản đủ dùng, gửi nội dung PDF để mô hình đọc trực tiếp.
5. Khi thành công, lưu `aiAnalysis` và đặt `aiStatus` thành `COMPLETED`; nếu lỗi, đặt `FAILED` và giữ bản CV đã lưu để có thể thử phân tích lại trong một số luồng.

Trong request upload hiện tại, xử lý phân tích diễn ra đồng bộ trong luồng yêu cầu. `PENDING` là trạng thái khởi tạo/lưu trước khi gọi AI, không phải bằng chứng có hàng đợi nền. Báo cáo cần phân biệt điểm này khi mô tả trải nghiệm và hiệu năng.

### 4.1.4. API tiêu biểu

| Phương thức | Đường dẫn                               | Mục đích / quyền                |
| ----------- | --------------------------------------- | ------------------------------- |
| `GET`       | `/api/jobs`                             | Danh sách tin công khai         |
| `GET`       | `/api/jobs/:id`                         | Chi tiết tin                    |
| `POST`      | `/api/jobs`                             | HR tạo tin                      |
| `POST`      | `/api/cv/upload`                        | Ứng viên tải và phân tích CV    |
| `POST`      | `/api/applications`                     | Ứng viên nộp hồ sơ, kèm CV PDF  |
| `GET`       | `/api/applications/my`                  | Ứng viên xem đơn của mình       |
| `GET`       | `/api/applications/hr`                  | HR xem các đơn thuộc tin của HR |
| `GET`       | `/api/applications/hr/shortlist/:jobId` | HR xem shortlist theo tin       |
| `PATCH`     | `/api/applications/:id/status`          | HR đổi trạng thái đơn           |
| `GET`       | `/api/admin/overview`                   | Admin xem tổng quan             |

## 4.2. Xây dựng phía Frontend

Ứng dụng React định nghĩa route theo vai trò. Axios có interceptor gắn JWT trong header `Authorization: Bearer ...`; khi API trả 401 (ngoại trừ đăng nhập/đăng ký), client xóa token và thông tin người dùng trong `localStorage`, sau đó đưa người dùng về trang đăng nhập.

Component `CVUpload` kiểm tra kích thước tệp ở giao diện, gửi PDF đến `/api/cv/upload`, hiển thị trạng thái tải và kết quả. Kết quả cùng các việc làm gợi ý được lưu bằng `sessionStorage` dưới khóa `cv-upload-result`; dữ liệu tồn tại trong phiên tab và được khôi phục khi tải lại trang. `localStorage` được dùng cho token và đối tượng người dùng. Hai cơ chế này giữ dữ liệu phía trình duyệt; chúng không thay thế lưu trữ bền vững tại máy chủ.

Giao diện cho phép xem điểm mạnh và các đề xuất có căn cứ, chỉnh sửa nội dung dự thảo trước khi chuyển sang trang tạo CV. Việc lưu bản CV đã chỉnh sửa hoặc xuất bản mới cần được kiểm tra theo luồng cụ thể khi nghiệm thu.

## 4.3. Minh họa màn hình

> Thay các dòng dưới đây bằng ảnh chụp của ứng dụng chạy thực tế. Dùng caption và số thứ tự đồng nhất với danh mục hình.

**Hình 4.1. Trang chủ**  
`[Chèn ảnh chụp client/src/pages/Home.jsx]`

**Hình 4.2. Danh sách việc làm và chi tiết công việc**  
`[Chèn ảnh chụp client/src/pages/JobList.jsx và JobDetail.jsx]`

**Hình 4.3. Tải CV và kết quả phân tích AI**  
`[Chèn ảnh chụp client/src/components/CVUpload.jsx; che dữ liệu cá nhân]`

**Hình 4.4. Quản lý đơn ứng tuyển phía HR**  
`[Chèn ảnh chụp client/src/pages/HRApplications.jsx]`

**Hình 4.5. Bảng điều khiển quản trị**  
`[Chèn ảnh chụp client/src/pages/AdminDashboard.jsx]`

# CHƯƠNG 5. KIỂM THỬ VÀ ĐÁNH GIÁ HỆ THỐNG

## 5.1. Phương pháp kiểm thử

Kiểm thử chức năng theo luồng người dùng và API: xác thực, quyền theo vai trò, quản lý tin, tải tệp, phát hiện CV trùng, xử lý phản hồi AI, ứng tuyển và cập nhật trạng thái. Kiểm thử giao diện cần thực hiện trên các kích thước màn hình và kiểm tra thông báo lỗi, trạng thái tải, dữ liệu rỗng. Các bài kiểm thử tự động có trong `server/tests`; cần chạy chúng trong môi trường được cấu hình phù hợp và ghi lại lệnh, ngày, phiên bản và kết quả thực tế. Báo cáo này không khẳng định các bài kiểm thử đã chạy.

## 5.2. Các trường hợp kiểm thử

| ID    | Tình huống                                    | Kết quả mong đợi                                                       | Kết quả thực tế       |
| ----- | --------------------------------------------- | ---------------------------------------------------------------------- | --------------------- |
| TC-01 | Ứng viên tải PDF hợp lệ không quá 10 MB       | Máy chủ lưu CV và trả kết quả phân tích hoặc trạng thái lỗi AI rõ ràng | `[Điền sau khi chạy]` |
| TC-02 | Tải tệp không phải PDF                        | API từ chối với mã 400 và thông báo định dạng                          | `[Điền sau khi chạy]` |
| TC-03 | Tải PDF vượt 10 MB                            | API từ chối tệp vượt giới hạn                                          | `[Điền sau khi chạy]` |
| TC-04 | Cùng ứng viên tải lại đúng cùng tệp           | Tái sử dụng bản ghi CV và không giữ thêm bản tệp trùng                 | `[Điền sau khi chạy]` |
| TC-05 | Hai ứng viên tải cùng nội dung CV             | Mỗi ứng viên có bản ghi riêng vì khóa trùng gồm cả candidate           | `[Điền sau khi chạy]` |
| TC-06 | Gemini trả kết quả hợp lệ                     | `aiStatus=COMPLETED`, `aiAnalysis` có cấu trúc theo schema             | `[Điền sau khi chạy]` |
| TC-07 | Gemini lỗi hoặc không khả dụng                | `aiStatus=FAILED`; lỗi không làm mất CV đã lưu                         | `[Điền sau khi chạy]` |
| TC-08 | Người không có quyền gọi API HR/Admin         | Backend từ chối truy cập                                               | `[Điền sau khi chạy]` |
| TC-09 | Ứng viên ứng tuyển hai lần cùng một tin       | Lần tiếp theo bị từ chối theo quy tắc nghiệp vụ                        | `[Điền sau khi chạy]` |
| TC-10 | HR đổi trạng thái đơn hợp lệ                  | Trạng thái được lưu và trả về dữ liệu cập nhật                         | `[Điền sau khi chạy]` |
| TC-11 | Làm mới trang kết quả CV trong cùng phiên tab | Khôi phục kết quả từ `sessionStorage`                                  | `[Điền sau khi chạy]` |
| TC-12 | Tìm kiếm/lọc việc làm trên giao diện          | Danh sách hiển thị phù hợp với thao tác đã nhập                        | `[Điền sau khi chạy]` |

Trong mã nguồn có các bài kiểm thử phía server liên quan đến xóa tin, khử trùng lặp CV, middleware xác thực, suy giảm khi AI lỗi, shortlist và matching. Cần chạy `npm test` trong thư mục `server` để xác nhận trạng thái hiện tại; nếu kiểm thử cần MongoDB hoặc dịch vụ ngoài, ghi lại cấu hình và giới hạn tương ứng.

## 5.3. Đánh giá ưu điểm và hạn chế

**Ưu điểm:** hệ thống gom các thao tác tìm việc, nộp hồ sơ và theo dõi tuyển dụng; phân quyền theo vai trò; phân tích CV trả về dữ liệu có cấu trúc; đề xuất cải thiện có trường bằng chứng; nhận diện CV trùng trong phạm vi một ứng viên; HR có công cụ shortlist, ghi chú và cập nhật trạng thái.

**Hạn chế:** chất lượng phân tích phụ thuộc chất lượng PDF, ngôn ngữ và dịch vụ Gemini; kết quả AI có thể thiếu hoặc sai và chưa có đánh giá định lượng độ chính xác. Việc gọi AI đồng bộ có thể kéo dài thời gian phản hồi. Hash chỉ nhận diện tệp nhị phân giống hệt, không nhận diện các CV cùng nội dung nhưng khác cách lưu/định dạng. File system cục bộ gây hạn chế khi mở rộng nhiều máy chủ. Matching hiện là luật dựa trên kỹ năng, từ khóa vai trò và kinh nghiệm, không phải mô hình xếp hạng đã được huấn luyện. `sessionStorage` mất dữ liệu khi phiên tab kết thúc. Cần bổ sung kiểm thử bảo mật, kiểm soát quyền riêng tư, giám sát, sao lưu và đánh giá khả năng sử dụng trước triển khai rộng.

# CHƯƠNG 6. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

## 6.1. Tổng kết kết quả

Đồ án đã thiết kế và hiện thực nền tảng tuyển dụng web với ba vai trò chính. Hệ thống hỗ trợ quản lý tin việc làm, nộp và theo dõi hồ sơ, tải CV PDF, nhận phân tích có cấu trúc từ Gemini, nhận diện CV trùng theo mã SHA-256, gợi ý việc làm dựa trên kỹ năng và hỗ trợ HR sắp xếp ứng viên. Các mục tiêu chức năng chính được phản ánh trong mã nguồn client và server. Mức độ hoàn thành chất lượng, hiệu năng và độ chính xác cần được kết luận dựa trên kết quả kiểm thử thực tế được bổ sung vào báo cáo.

## 6.2. Hướng phát triển

1. Xây dựng pipeline xử lý CV nền có hàng đợi, retry có kiểm soát và thông báo tiến độ.
2. Cải thiện matching bằng biểu diễn ngữ nghĩa, trọng số có thể giải thích và đánh giá trên tập dữ liệu có gán nhãn; tránh dùng điểm số như quyết định tuyển dụng tự động.
3. Bổ sung tính năng phỏng vấn thử AI với nội dung phù hợp từng vị trí và quy tắc bảo vệ dữ liệu.
4. Chuyển file sang object storage, ký URL truy cập có thời hạn, thiết lập thời gian lưu và quy trình xóa dữ liệu.
5. Tăng cường bảo mật: quản lý secret, giới hạn tốc độ, kiểm tra MIME/nội dung thực của PDF, chống tải tệp độc hại, audit log và kiểm thử phân quyền.
6. Bổ sung thông báo email, lịch phỏng vấn, tìm kiếm nâng cao, thống kê và giao diện tương thích di động.
7. Đo hiệu năng, khả năng sử dụng và chất lượng phân tích AI trên bộ dữ liệu phù hợp, có đồng thuận và ẩn danh.

# TÀI LIỆU THAM KHẢO

> Chuẩn hóa theo mẫu APA/IEEE mà khoa yêu cầu. Ngày truy cập và phiên bản cần cập nhật theo thời điểm nhóm hoàn thiện báo cáo.

[1] React, “React Documentation.” https://react.dev/ (truy cập ngày [..]).  
[2] Express, “Express – Node.js web application framework.” https://expressjs.com/ (truy cập ngày [..]).  
[3] MongoDB, “MongoDB Manual.” https://www.mongodb.com/docs/manual/ (truy cập ngày [..]).  
[4] Mongoose, “Mongoose Guide.” https://mongoosejs.com/docs/guide.html (truy cập ngày [..]).  
[5] Google, “Gemini API Documentation.” https://ai.google.dev/gemini-api/docs (truy cập ngày [..]).  
[6] Google for Developers, “Google Gen AI SDK.” https://googleapis.github.io/js-genai/ (truy cập ngày [..]).  
[7] MDN Web Docs, “Window: sessionStorage property.” https://developer.mozilla.org/docs/Web/API/Window/sessionStorage (truy cập ngày [..]).  
[8] Dự án DATN, mã nguồn và bộ kiểm thử nội bộ, [đường dẫn repository hoặc thông tin lưu trữ], phiên bản [commit/tag], [năm].

# PHỤ LỤC A. CẤU TRÚC MÃ NGUỒN

- `client/src/pages`, `client/src/components`: trang và component React.
- `client/src/scss`: kiểu dáng giao diện.
- `client/src/services/api.js`: cấu hình Axios và JWT interceptor.
- `server/src/routes`: định nghĩa tuyến API.
- `server/src/controllers`: xử lý request/response.
- `server/src/services`: nghiệp vụ ứng dụng, AI, PDF và tệp CV.
- `server/src/models`: schema Mongoose cho User, Job, CV và Application.
- `server/src/middlewares`: xác thực, phân quyền và upload.
- `server/tests`: các bài kiểm thử tự động phía server.

# PHỤ LỤC B. MẪU DỮ LIỆU PHÂN TÍCH CV

```json
{
  "personalInfo": {
    "fullName": "[trích xuất từ CV]",
    "email": "",
    "phone": "",
    "location": ""
  },
  "summary": "[tóm tắt có căn cứ]",
  "strengths": [],
  "improvementSuggestions": [
    {
      "issue": "[vấn đề]",
      "evidence": "[căn cứ trong CV]",
      "recommendation": "[hướng cải thiện]",
      "example": "[ví dụ, không thêm dữ kiện chưa có]"
    }
  ],
  "skills": [],
  "education": [],
  "experienceYears": 0,
  "workExperience": [],
  "languages": [],
  "certifications": [],
  "missingInformation": []
}
```

# PHỤ LỤC C. THÔNG TIN CẦN HOÀN THIỆN TRƯỚC KHI NỘP

1. Điền tên trường, khoa, chuyên ngành, giảng viên, sinh viên, mã sinh viên, lớp, địa phương và năm.
2. Xác nhận chính xác quy trình nghiên cứu/phát triển mà nhóm đã thực hiện; không ghi Scrum nếu không có sprint/backlog thực tế.
3. Chạy bộ kiểm thử, điền kết quả thực tế và mô tả môi trường kiểm thử.
4. Chụp ảnh các màn hình, che dữ liệu cá nhân và cập nhật danh mục hình.
5. Xuất các sơ đồ Mermaid tại mục 3.2 và sơ đồ ERD thành hình nếu mẫu báo cáo của trường yêu cầu.
6. Kiểm tra chính sách trích dẫn, định dạng trang, cỡ chữ và cách đánh số của khoa; tạo mục lục tự động sau cùng.
