# Trình chỉnh sửa ảnh nâng cao (Advanced Photo Editor)

Một ứng dụng web chỉnh sửa ảnh đa năng, responsive được xây dựng với React + TypeScript và Tailwind CSS. Giao diện người dùng hỗ trợ song ngữ (Tiếng Việt là chính, Tiếng Anh là phụ) và tập trung vào các quy trình chỉnh sửa ảnh kiểu desktop phổ biến (tải lên, cắt, điều chỉnh, biến đổi, xuất ảnh) trong khi vẫn giữ được sự nhẹ nhàng và khả năng mở rộng.

## Liên kết nhanh
- Mã nguồn: kho lưu trữ này
- Thiết kế gốc: https://www.figma.com/design/7wfE0HWTE1SsJZ1nwaMu9t/photo_editor

## Chạy cục bộ (Run locally)
1. Cài đặt các gói phụ thuộc:

   npm i

2. Khởi động máy chủ phát triển:

   npm run dev

Ứng dụng sẽ khởi động máy chủ phát triển Vite và mở giao diện chỉnh sửa. Điểm bắt đầu là `src/main.tsx` → `src/App.tsx`, nơi gắn kết khung chỉnh sửa.

## Tổng quan dự án (Cấp cao)
- Công nghệ cốt lõi: React 18, TypeScript, Tailwind CSS, Vite
- Quản lý trạng thái: `zustand` store tại `src/store/editorStore.ts` (lưu trữ hình ảnh, các lớp, điều chỉnh, lịch sử, cài đặt)
- Canvas: `src/components/CanvasEnhanced.tsx` — bề mặt vẽ chính và xem trước
- Bố cục giao diện: `src/components/TopBar.tsx`, `LeftToolbar.tsx`, `RightControlPanel.tsx` (bảng điều khiển được ghép từ `components/panels/*`)
- Tiện ích: các trình hỗ trợ xuất ảnh trong `src/utils/exportImage.ts` và các trình hỗ trợ nhỏ khác trong `src/utils`

## Các tính năng chính đã triển khai (Tóm tắt)
Dự án bao gồm một số tính năng hoàn chỉnh, sẵn sàng cho sản xuất và một số mục được triển khai một phần. Các điểm nổi bật được lấy từ tài liệu trong kho lưu trữ:

- Tải lên & xem trước hình ảnh (kéo & thả hoặc chọn tệp) — `UploadZone`.
- Điều khiển Canvas: thu phóng (10–500%), xoay (Space + kéo), bật tắt lưới và thước kẻ, bản đồ thu nhỏ/xem trước.
- Điều chỉnh không phá hủy (độ sáng, độ tương phản, độ bão hòa, màu sắc, độ mờ, thang độ xám, sepia) được áp dụng trực tiếp.
- Thay đổi kích thước hình ảnh với các cài đặt trước và khóa tỷ lệ (Bảng điều khiển bên phải → Thuộc tính).
- Bộ lọc làm sắc nét được triển khai thông qua hạt nhân tích chập 3×3 (Công cụ → Điều chỉnh).
- Công cụ biến đổi: xoay (90°, 180°), lật, xoay tự do với dịch chuyển canvas thích hợp.
- Giao diện Cân bằng màu (Vùng tối/Trung tính/Vùng sáng) với tùy chọn bảo toàn độ sáng.
- Modal cài đặt (ngôn ngữ, tự động lưu, định dạng xuất mặc định, chất lượng xuất, nền canvas, kích thước lưới, độ sâu lịch sử) và tích hợp trên toàn ứng dụng.
- Quy trình xuất ảnh: `utils/exportImage.ts` với các tùy chọn định dạng/chất lượng/tỷ lệ/trong suốt và kết nối TopBar/ExportSection.
- Hệ thống lịch sử & bản chụp nhanh: lưu trữ các bản chụp nhanh của hình ảnh/lớp/điều chỉnh và tích hợp với hoàn tác/làm lại và tự động lưu.

Các tính năng một phần / đã lên kế hoạch (Giao diện hiện có, xử lý pixel còn thiếu hoặc CẦN LÀM):
- Trình chỉnh sửa Curves & Levels: Giao diện hiện có nhưng ứng dụng pixel (xử lý ImageData) vẫn chưa được triển khai.
- Các công cụ nâng cao như Clone/Heal, Liquify, Giảm nhiễu — Các trình giữ chỗ giao diện người dùng tồn tại; triển khai thuật toán đang chờ xử lý.
- Một số cải tiến UX xuất nhanh (hành vi xuất nhanh TopBar) được ghi chú trong tài liệu là các tinh chỉnh có thể.

## Bản đồ thư mục (Các tệp quan trọng)
- src/
  - App.tsx — khung chỉnh sửa và phím tắt toàn cầu
  - main.tsx — khởi động ứng dụng
  - styles/globals.css — kiểu Tailwind toàn cầu
  - components/
    - CanvasEnhanced.tsx — canvas chính + logic vẽ
    - TopBar.tsx — điều khiển trên cùng (thu phóng, hoàn tác/làm lại, xuất, cài đặt)
    - LeftToolbar.tsx — bộ chọn công cụ
    - RightControlPanel.tsx — các bảng điều khiển bên phải có thể thu gọn (Thuộc tính, Công cụ, Lớp, Lịch sử, Cài đặt sẵn, Xuất)
    - UploadZone.tsx — giao diện tải lên tệp
    - panels/ — các bảng được nhóm (PropertiesSection, ToolsSection, ExportSection, HistorySection, LayersSection, v.v.)
    - ui/ — các nguyên mẫu giao diện người dùng nhỏ và các thành phần được chia sẻ
  - store/
    - editorStore.ts — nguồn sự thật duy nhất (zustand) cho hình ảnh, các lớp, điều chỉnh, bản chụp nhanh và cài đặt
  - utils/
    - exportImage.ts — trình hỗ trợ xuất hình ảnh được sử dụng bởi TopBar và ExportSection

## Ghi chú cho lập trình viên & quy ước
- Nhãn song ngữ: Các chuỗi giao diện người dùng thường có sẵn bằng tiếng Việt và tiếng Anh. Cài đặt cho phép bạn chuyển đổi hoặc hiển thị cả hai.
- Trạng thái & bản chụp nhanh: sử dụng `useEditorStore` cho tất cả các thay đổi trạng thái; bản chụp nhanh bao gồm siêu dữ liệu được sử dụng bởi bảng Lịch sử.
- Hoạt động Canvas: nhiều biến đổi dựa vào API HTMLCanvasElement (drawImage, translate, rotate, scale) và sau đó chuyển đổi thành URL dữ liệu để lưu trữ.

## Cách đóng góp / mở rộng
1. Chạy ứng dụng cục bộ (xem Chạy cục bộ ở trên).
2. Tinh chỉnh các thành phần giao diện người dùng trong `src/components`. Sử dụng các bảng hiện có làm ví dụ để kết nối trạng thái và hành động của cửa hàng.
3. Thêm logic xử lý pixel trong `CanvasEnhanced.tsx` hoặc một tiện ích mới (đối với Curves/Levels, triển khai biến đổi ImageData và sau đó gọi `saveSnapshot()` để duy trì thay đổi).
4. Thêm các bài kiểm tra đơn vị / tích hợp nếu thích hợp. Dự án không có trình chạy thử nghiệm được định cấu hình theo mặc định — hãy cân nhắc thêm Vitest hoặc Jest cho CI.

## Hạn chế đã biết & bước tiếp theo
- Curves/Levels: cần các thuật toán cấp ImageData (áp dụng đường cong/mức độ cho pixel) — ưu tiên cao cho chỉnh sửa không phá hủy thực sự.
- Các công cụ chỉnh sửa nâng cao (Clone/Heal, Liquify) yêu cầu các thuật toán lấy mẫu hình ảnh & biến dạng lưới — công việc đáng kể nhưng đã được lên kế hoạch.
- Hiệu suất: hiện tại ổn đối với hình ảnh thông thường; hình ảnh nhiều megapixel lớn có thể cần xử lý ngoài luồng chính (Web Worker) cho các bộ lọc nặng.

## Tín dụng
- Giao diện/Thiết kế: thiết kế Figma gốc được liên kết ở trên.
- Thư viện: React, Vite, Tailwind CSS, Zustand, Radix UI primitives, Sonner (toasts), lucide-react icons.
