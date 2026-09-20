# 📓 TodoLite — Sổ Tay Quản Lý Việc Cần Làm & Ghi Chú Siêu Nhẹ Cho Windows

<div align="center">

![Platform](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D6?logo=windows&logoColor=white)
![Version](https://img.shields.io/badge/Version-v2.0-orange)
![Framework](https://img.shields.io/badge/Tauri-v2-FFC131?logo=tauri&logoColor=black)
![Language](https://img.shields.io/badge/Rust-Backend-dea584?logo=rust&logoColor=white)
![Storage](https://img.shields.io/badge/SQLite-Bundled-003B57?logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
![RAM Usage](https://img.shields.io/badge/RAM-~25MB-brightgreen)
![Size](https://img.shields.io/badge/Size-~10MB%20(Portable)-blue)

**TodoLite** là ứng dụng sổ tay việc cần làm (Todo List) và ghi chú nhanh (TakeNote) nhỏ gọn như cuốn sổ bỏ túi trên màn hình máy tính của bạn. Được xây dựng với **Tauri v2 + Rust + SQLite**, TodoLite khắc phục hoàn toàn nhược điểm ngốn hàng trăm MB RAM của các app Electron truyền thống, mang lại trải nghiệm mượt mà tức thì, giao diện phong cách sổ tay ấm áp cùng khả năng **Ghim trên cùng (Always on Top)** cực kỳ tiện lợi khi làm việc đa nhiệm.

[Tải Bản Mới Nhất (v2.0)](https://github.com/MenBoyVN2910/TodoLite/releases) • [Báo Lỗi / Góp Ý](https://github.com/MenBoyVN2910/TodoLite/issues)

</div>

---

## 💡 Tại Sao Nên Dùng TodoLite?

* 🪶 **Siêu nhẹ & Tiết kiệm tài nguyên:** File chạy độc lập chỉ ~10MB, tiêu tốn chỉ khoảng **20MB - 30MB RAM** khi hoạt động.
* 🚀 **Portable 100%:** Không cần cài đặt rườm rà, tải về nhấp đúp là chạy ngay.
* 📌 **Luôn nổi trên màn hình:** Ghim sổ tay trên mọi cửa sổ làm việc (Word, Excel, Code, Game, Trình duyệt...) để không bao giờ bỏ sót việc.
* 📝 **2-in-1 Độc Lập:** Vừa là Checklist quản lý đầu việc, vừa là sổ tay soạn thảo văn bản TakeNote với hệ thống tab riêng biệt.
* 🔒 **An toàn & Riêng tư:** 100% Offline, dữ liệu lưu trữ trực tiếp trên máy của bạn bằng SQLite (`%APPDATA%/TodoLite/todolite.db`).

---

## ✨ Tính Năng Nổi Bật Trong Phiên Bản 2.0 (Ver2.0)

| Tính năng | Chi tiết |
| :--- | :--- |
| 📝 **TakeNote — Soạn Thảo Ghi Chú Phong Phú** | Chuyển đổi 1 chạm giữa Checklist và TakeNote. **Hệ thống Tab của TakeNote hoạt động hoàn toàn độc lập với Checklist** (tối đa 4 tab mỗi bên). Hỗ trợ tiếng Việt mượt mà (Telex/VNI), định dạng chữ (Đậm, Nghiêng, Gạch chân, Gạch ngang, Tiêu đề H1-H3, Cỡ chữ), Bảng màu chữ & Tô Highlight dạ quang pastel, Chèn Emoji biểu cảm, Danh sách chấm/số, Thước kẻ phân cách, và Tự động lưu (Auto-save) sau 0.5s kèm bộ đếm từ/ký tự. |
| 🔍 **Tìm Kiếm Kép Thông Minh (Dual Search)** | Bấm `Ctrl + F` hoặc icon kính lúp: Ở chế độ **Checklist**, tìm kiếm việc cần làm xuyên suốt các tab kèm nhóm chuyên mục rõ ràng; Ở chế độ **TakeNote**, kích hoạt thanh tìm kiếm trong văn bản (Find in Document) có đếm số kết quả và phím tắt chuyển kết quả Tiếp (`Enter`) / Trước (`Shift+Enter`). |
| 🪟 **Chế Độ Giao Diện Kép (Glass & Minimal)** | Tùy chọn chuyển đổi 1 chạm giữa **Kính Mờ xuyên thấu (Glassmorphism)** lung linh và **Tối Giản (Minimalist)** thanh lịch. |
| 📌 **Always on Top (Ghim Nổi Bật)** | Nút ghim với hiệu ứng phát sáng đỏ khi kích hoạt, giữ cửa sổ sổ tay luôn nổi trên mọi ứng dụng khác. |
| 🗂️ **Hệ Thống Tab Độc Lập Kép** | Mỗi chế độ (Checklist & TakeNote) sở hữu tối đa 4 tab riêng biệt. Nhấp đúp vào tiêu đề để đổi tên tab trực tiếp. Có hộp thoại xác nhận an toàn trước khi đóng tab để tránh mất dữ liệu ngoài ý muốn. Badge đếm số task chưa làm theo thời gian thực bên Checklist. |
| 🌓 **Giao Diện Sáng / Tối Linh Hoạt** | Họa tiết giấy kẻ ngang ấm áp. Hỗ trợ chuyển đổi nhanh giữa **Chế độ Sáng (Warm Paper)** và **Chế độ Tối (Obsidian Dark)** với màu sắc dịu mắt. |
| ✅ **Quản Lý Task Chi Tiết** | Checkbox hoạt họa mượt mà, gán mức độ ưu tiên theo màu sắc (🔴 Cao, 🟡 Trung bình, 🔵 Thấp), giới hạn tối đa 200 ký tự có bộ đếm realtime, đặt hạn chót (Due Date) với gợi ý nhanh và cảnh báo trực quan ("Hôm nay", "Quá hạn!"). |
| 🔀 **Kéo Thả Sắp Xếp Trực Quan** | Dễ dàng sắp xếp lại thứ tự ưu tiên các đầu việc bằng chuột thông qua biểu tượng tay nắm kéo thả (⠿) kèm vạch chỉ thị vị trí thả mượt mà. |
| 🔔 **Khay Hệ Thống (System Tray)** | Thu gọn xuống khay hệ thống khi đóng/thu nhỏ cửa sổ. Nhấp vào icon khay để ẩn/hiện nhanh. Menu chuột phải hỗ trợ Ghim/Bỏ ghim và Thoát hoàn toàn. |
| 🛡️ **Đơn Phiên Bản (Single Instance)** | Ngăn chặn mở trùng lặp nhiều cửa sổ ứng dụng cùng lúc. Tự động focus và đưa cửa sổ hiện tại lên trên nếu bấm chạy lại. |

---

## ⚡ Hướng Dẫn Tải & Sử Dụng Ngay (End-User)

### Cách 1: Sử dụng trực tiếp file Portable (.exe)
1. Tải file **`TodoLite.exe`** mới nhất tại mục [Releases](https://github.com/MenBoyVN2910/TodoLite/releases) (hoặc lấy trực tiếp ở thư mục gốc của repository).
2. Nhấp đúp vào file `TodoLite.exe` để mở ứng dụng.
3. **Không cần cài đặt gì thêm**, ứng dụng đã tích hợp sẵn mọi thứ!

### Cách 2: Xem và Dùng ngay trên Trình duyệt (Không cần cài môi trường Rust)
Nếu muốn dùng thử giao diện trên trình duyệt:
```powershell
npx serve src
# Hoặc mở http://localhost:5173 nếu đang chạy dev server
```

### ⌨️ Phím Tắt & Thao Tác Nhanh

| Thao tác / Phím tắt | Chức năng |
| :--- | :--- |
| **Nút `Note` / `List`** | Chuyển đổi giữa chế độ Việc cần làm (Checklist) và Ghi chú văn bản (TakeNote) |
| **Nút `Glass` / `Minimal`** | Chuyển đổi phong cách Kính mờ (Glassmorphism) và Tối giản (Minimalist) |
| **`Ctrl + F`** | Mở thanh tìm kiếm (xuyên tab ở Checklist, hoặc tìm kiếm trong văn bản ở TakeNote) |
| **`Ctrl + B` / `Ctrl + I` / `Ctrl + U`** | Định dạng nhanh In đậm / In nghiêng / Gạch chân trong TakeNote |
| **`Enter` / `Shift + Enter`** | Chuyển đến kết quả tìm kiếm tiếp theo / trước đó trong TakeNote |
| **Nhấp đúp chuột vào tên Tab** | Đổi tên danh mục tab theo ý bạn |
| **Nhấp đúp chuột vào nội dung Task** | Chỉnh sửa trực tiếp nội dung công việc inline |
| **Kéo thả nút `⠿`** | Sắp xếp lại thứ tự công việc |
| **Nút Đinh ghim (📌)** | Bật/Tắt chế độ luôn hiển thị trên cùng (Always on Top) |
| **Click icon ở Khay hệ thống** | Ẩn hoặc Hiện nhanh sổ tay TodoLite |
| **Chuột phải icon Khay hệ thống** | Menu nhanh: Hiện/Ẩn, Ghim trên cùng, Thoát |

---

## 🛠️ Dành Cho Lập Trình Viên (Build From Source)

Để tự biên dịch ra file **`TodoLite.exe`** mới nhất từ mã nguồn:

### 1. Yêu cầu môi trường
* [Node.js](https://nodejs.org/) (phiên bản 18+ khuyến nghị)
* **C++ Build Tools**: Đã cài Visual Studio với workload *"Desktop development with C++"*.
* **Rust & Cargo**: Bắt buộc để biên dịch ứng dụng Tauri ra file `.exe`.

> 💡 **Cách cài đặt Rust nhanh trên Windows:**
> Mở PowerShell và chạy lệnh tự động:
> ```powershell
> winget install --id Rustlang.Rustup -e --accept-package-agreements --accept-source-agreements
> ```
> Hoặc tải công cụ cài đặt chính thức tại: [https://rustup.rs/](https://rustup.rs/) (tải file `rustup-init.exe` và nhấn phím **1** rồi **Enter** để cài).
> Sau khi cài xong, **khởi động lại PowerShell / Terminal** để nhận lệnh `cargo`.

### 2. Các bước cài đặt & Khởi chạy

```powershell
# 1. Cài đặt các thư viện Node cần thiết (chỉ cần chạy lần đầu)
npm install

# 2. Chạy ở chế độ phát triển (Hot-reload Frontend + Rust Backend)
npm run dev
```

### 3. Đóng gói file `.exe` (Production Build)

Khi đã sẵn sàng, chạy lệnh sau để đóng gói:
```powershell
npm run build
```

Sau khi quá trình biên dịch hoàn tất, hệ thống sẽ **tự động copy file `TodoLite.exe` hoàn chỉnh ra ngay thư mục gốc** của dự án:
```
TodoLite/
├── TodoLite.exe           <-- File thực thi sẵn sàng sử dụng ở đây!
├── src/
├── src-tauri/
...
```

> **Mẹo:** Nếu bạn đã build trước đó và muốn copy lại file `.exe` ra thư mục gốc mà không cần biên dịch lại từ đầu, hãy chạy:
> ```powershell
> npm run copy:exe
> ```

---

## 📂 Cấu Trúc Dự Án

```
TodoLite/
├── TodoLite.exe                  # File thực thi Portable độc lập (ngay thư mục gốc)
├── scripts/
│   ├── copy-exe.js               # Script tự động copy bản build release ra thư mục gốc
│   └── generate_icons.py         # Script tạo bộ icon đa kích thước (PNG, ICO)
├── src/                          # Frontend (HTML5 / CSS3 / Vanilla JS thuần, siêu nhẹ và tức thì)
│   ├── index.html                # Giao diện chính sổ tay, TakeNote & Modal hướng dẫn
│   ├── css/
│   │   ├── variables.css         # Hệ màu sắc, font chữ, Design Tokens Dark/Light
│   │   ├── base.css              # Khung cửa sổ, nút Ghim, thanh tiêu đề, titlebar
│   │   ├── notebook.css          # Nền giấy kẻ ngang, Tab bar kiểu Chrome
│   │   ├── todo.css              # Danh sách task, checkbox animation, priority badge, deadline
│   │   ├── note.css              # Giao diện TakeNote: Toolbar, highlight palette, emoji picker, find bar
│   │   ├── search.css            # Giao diện tìm kiếm xuyên tab
│   │   ├── minimalist.css        # Phong cách giao diện tối giản (Minimalist)
│   │   └── animations.css        # Hiệu ứng mượt mà (transitions, glows, popovers)
│   └── js/
│       ├── app.js                # Khởi tạo và kết nối các module, modal hướng dẫn
│       ├── state.js              # Quản lý State tập trung (Tabs, Todos, Notes, ViewMode, Style)
│       ├── tabs.js               # Quản lý Tab công việc (giới hạn 4 tab, modal xác nhận đóng)
│       ├── todo.js               # Thêm, sửa, xóa, đánh dấu hoàn thành, hạn chót, bộ đếm ký tự
│       ├── note.js               # Bộ soạn thảo TakeNote, IME tiếng Việt, phím tắt, tìm kiếm inline, auto-save
│       ├── dragdrop.js           # Kéo thả sắp xếp thứ tự task (Pointer Events + indicator line)
│       ├── search.js             # Tìm kiếm thời gian thực xuyên suốt các tab
│       ├── theme.js              # Chuyển đổi Dark/Light mode, Glass/Minimal, TakeNote/Checklist
│       └── bridge.js             # Cầu nối IPC gọi Rust/SQLite hoặc Fallback LocalStorage
├── src-tauri/                    # Rust Native Backend (Tauri v2)
│   ├── src/
│   │   ├── main.rs               # Điều khiển cửa sổ, IPC handlers (Todos & Notes)
│   │   ├── db.rs                 # Quản lý SQLite Database, schema bảng todos & notes
│   │   └── tray.rs               # Điều khiển Khay hệ thống Windows (Tray Icon & Menu)
│   ├── capabilities/             # Phân quyền bảo mật Tauri v2
│   ├── icons/                    # Bộ icon ứng dụng (32x32, 128x128, .ico)
│   ├── tauri.conf.json           # Cấu hình cửa sổ trong suốt, bóng đổ, kích thước (v2.0.0)
│   └── Cargo.toml                # Khai báo crate Rust (v2.0.0: tauri, rusqlite, serde, chrono...)
└── package.json                  # Scripts quản lý dự án (dev, build, copy:exe) (v2.0.0)
```

---

## 💾 Lưu Trữ Dữ Liệu (Database Storage)

Dữ liệu ghi chú của bạn được lưu hoàn toàn cục bộ trên máy tại đường dẫn:
```
%APPDATA%\TodoLite\todolite.db
```
*(Bạn có thể nhấn `Win + R` và dán `%APPDATA%\TodoLite` để xem file cơ sở dữ liệu SQLite hoặc sao lưu khi chuyển máy).*

---

## 🤝 Đóng Góp (Contributing)

Mọi đóng góp nhằm cải thiện TodoLite đều được hoan nghênh!
1. Fork dự án: [https://github.com/MenBoyVN2910/TodoLite](https://github.com/MenBoyVN2910/TodoLite)
2. Tạo branch tính năng (`git checkout -b feature/AmazingFeature`)
3. Commit các thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở một Pull Request

---

## 📄 Giấy Phép (License)

Dự án được phân phối dưới giấy phép **MIT License**. Xem file `LICENSE` để biết thêm chi tiết.

**CreBy:** [BMN2910](https://github.com/MenBoyVN2910)