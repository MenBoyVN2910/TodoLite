# 📓 TodoLite — Sổ Tay Quản Lý Việc Cần Làm Siêu Nhẹ Cho Windows

<div align="center">

![Platform](https://img.shields.io/badge/Platform-Windows%2010%20%7C%2011-0078D6?logo=windows&logoColor=white)
![Framework](https://img.shields.io/badge/Tauri-v2-FFC131?logo=tauri&logoColor=black)
![Language](https://img.shields.io/badge/Rust-Backend-dea584?logo=rust&logoColor=white)
![Storage](https://img.shields.io/badge/SQLite-Bundled-003B57?logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)
![RAM Usage](https://img.shields.io/badge/RAM-~25MB-brightgreen)
![Size](https://img.shields.io/badge/Size-~10MB%20(Portable)-blue)

**TodoLite** là ứng dụng ghi chú công việc (Todo List) nhỏ gọn như cuốn sổ tay bỏ túi trên màn hình máy tính của bạn. Được xây dựng với **Tauri v2 + Rust + SQLite**, TodoLite khắc phục nhược điểm ngốn hàng trăm MB RAM của các app Electron truyền thống, mang lại trải nghiệm mượt mà tức thì, giao diện giấy sổ tay ấm áp và khả năng **Ghim trên cùng (Always on Top)** cực kỳ tiện lợi khi làm việc đa nhiệm.

</div>

---

## 💡 Tại Sao Nên Dùng TodoLite?

* 🪶 **Siêu nhẹ & Tiết kiệm tài nguyên:** File chạy độc lập chỉ ~10MB, tiêu tốn chỉ khoảng **20MB - 30MB RAM** khi hoạt động.
* 🚀 **Portable 100%:** Không cần cài đặt rườm rà, tải về nhấp đúp là chạy ngay.
* 📌 **Luôn nổi trên màn hình:** Ghim sổ tay trên mọi cửa sổ làm việc (Word, Excel, Code, Game, Trình duyệt...) để không bao giờ bỏ sót việc.
* 🔒 **An toàn & Riêng tư:** 100% Offline, dữ liệu lưu trữ trực tiếp trên máy của bạn bằng SQLite (`%APPDATA%/TodoLite/todolite.db`).

---

## ✨ Tính Năng Nổi Bật

| Tính năng | Chi tiết |
| :--- | :--- |
| 📌 **Always on Top** | Nút ghim nổi bật với hiệu ứng phát sáng đỏ khi kích hoạt. Ghim cửa sổ luôn nằm trên mọi ứng dụng khác. |
| 🗂️ **Hệ Thống Tab Đa Năng** | Tạo nhiều tab phân loại công việc (*"Hôm nay"*, *"Dự án"*, *"Cá nhân"*...). Nhấp đúp vào tiêu đề để đổi tên tab trực tiếp. Badge đếm số task chưa làm theo thời gian thực. |
| 📝 **Giao Diện Sổ Tay Độc Đáo** | Họa tiết giấy kẻ ngang (ruled paper), gáy bọc da ấm áp. Hỗ trợ chuyển đổi nhanh giữa **Chế độ Sáng (Warm Paper)** và **Chế độ Tối (Obsidian Dark)**. |
| ✅ **Quản Lý Task Chi Tiết** | Checkbox hoạt họa mượt mà, gán mức độ ưu tiên theo màu sắc (🔴 Cao, 🟡 Trung bình, 🔵 Thấp), đặt hạn chót (Due Date) với cảnh báo trực quan ("Hôm nay", "Quá hạn!"). |
| 🔀 **Kéo Thả Sắp Xếp** | Dễ dàng sắp xếp lại thứ tự ưu tiên các đầu việc bằng chuột thông qua biểu tượng tay nắm kéo thả (⠿). |
| 🔍 **Tìm Kiếm Xuyên Tab** | Bấm `Ctrl + F` hoặc icon kính lúp để tìm kiếm tức thời trên toàn bộ các tab, tô màu từ khóa tìm thấy và 1-click chuyển đến task. |
| 🔔 **Khay Hệ Thống (System Tray)** | Thu gọn xuống khay hệ thống khi đóng cửa sổ. Nhấp vào icon khay để ẩn/hiện nhanh. Menu chuột phải hỗ trợ Ghim/Bỏ ghim và Thoát hoàn toàn. |
| 🛡️ **Đơn Phiên Bản (Single Instance)** | Ngăn chặn mở trùng lặp nhiều cửa sổ ứng dụng cùng lúc. Tự động focus cửa sổ hiện tại nếu bấm chạy lại. |

---

## ⚡ Hướng Dẫn Tải & Sử Dụng Ngay (End-User)

### Cách 1: Sử dụng trực tiếp file Portable (.exe)
1. Tải file **`TodoLite.exe`** mới nhất tại mục [Releases](https://github.com/) (hoặc lấy trực tiếp ở thư mục gốc của repository).
2. Nhấp đúp vào file `TodoLite.exe` để mở ứng dụng.
3. **Không cần cài đặt gì thêm**, ứng dụng đã tích hợp sẵn mọi thứ!

### ⌨️ Phím tắt & Thao tác nhanh
* **`Ctrl + F`**: Mở / Đóng thanh tìm kiếm xuyên tab.
* **Nhấp đúp chuột vào tên Tab**: Đổi tên danh mục tab theo ý bạn.
* **Nhấp đúp chuột vào nội dung Task**: Chỉnh sửa trực tiếp nội dung công việc.
* **Kéo thả nút `⠿`**: Sắp xếp lại thứ tự công việc.
* **Nút Đinh ghim (📌)**: Bật/Tắt chế độ luôn hiển thị trên cùng.
* **Click icon ở Khay hệ thống (góc phải taskbar)**: Ẩn hoặc Hiện nhanh sổ tay.

---

## 🛠️ Dành Cho Lập Trình Viên (Build From Source)

Nếu bạn muốn đóng góp hoặc tự build ứng dụng từ mã nguồn:

### 1. Yêu cầu môi trường
* [Node.js](https://nodejs.org/) (phiên bản 18+ khuyến nghị)
* [Rust](https://www.rust-lang.org/) và `cargo`
* C++ Build Tools (hoặc Visual Studio với workload "Desktop development with C++")
* Microsoft Edge WebView2 (mặc định đã có sẵn trên Windows 10 & 11)

### 2. Các bước cài đặt & Khởi chạy

```powershell
# 1. Clone repository về máy
git clone https://github.com/your-username/TodoLite.git
cd TodoLite

# 2. Cài đặt các thư viện Node cần thiết
npm install

# 3. Chạy ở chế độ phát triển (Hot-reload Frontend + Rust Backend)
npm run dev
```

### 3. Đóng gói file `.exe` (Production Build)

Chỉ cần chạy lệnh:
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

> **Mẹo:** Nếu bạn đã build trước đó và muốn cập nhật lại file `.exe` ra thư mục gốc mà không cần build lại từ đầu, hãy chạy:
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
├── src/                          # Frontend (HTML5 / CSS3 / Vanilla JS thuần, tối ưu tốc độ)
│   ├── index.html                # Giao diện chính của sổ tay
│   ├── css/
│   │   ├── variables.css         # Hệ màu sắc, font chữ, Design Tokens Dark/Light
│   │   ├── base.css              # Khung cửa sổ, nút Ghim, thanh tiêu đề
│   │   ├── notebook.css          # Nền giấy kẻ ngang, Tab bar kiểu Chrome
│   │   ├── todo.css              # Danh sách task, checkbox animation, priority badge
│   │   ├── search.css            # Giao diện tìm kiếm xuyên tab
│   │   └── animations.css        # Hiệu ứng mượt mà (transitions, glows)
│   └── js/
│       ├── app.js                # Khởi tạo và liên kết các module
│       ├── state.js              # State Management phản ứng (Pub/Sub pattern)
│       ├── tabs.js               # Quản lý Tab, đổi tên, đếm task dở dang
│       ├── todo.js               # Thêm, sửa, xóa, đánh dấu hoàn thành, hạn chót
│       ├── dragdrop.js           # Kéo thả sắp xếp thứ tự task (HTML5 Drag & Drop)
│       ├── search.js             # Tìm kiếm thời gian thực xuyên suốt các tab
│       ├── theme.js              # Chuyển đổi Dark / Light mode
│       └── bridge.js             # Cầu nối gọi Rust Commands qua Tauri IPC
├── src-tauri/                    # Rust Native Backend (Tauri v2)
│   ├── src/
│   │   ├── main.rs               # Điều khiển cửa sổ, xử lý phím tắt, IPC handlers
│   │   ├── db.rs                 # Quản lý SQLite Database & tự động khởi tạo bảng
│   │   └── tray.rs               # Điều khiển Khay hệ thống Windows (Tray Icon & Menu)
│   ├── capabilities/             # Phân quyền bảo mật Tauri v2
│   ├── icons/                    # Bộ icon ứng dụng (32x32, 128x128, .ico)
│   ├── tauri.conf.json           # Cấu hình cửa sổ trong suốt, bóng đổ, kích thước
│   └── Cargo.toml                # Khai báo crate Rust (tauri, rusqlite, serde, chrono...)
└── package.json                  # Scripts quản lý dự án (dev, build, copy:exe)
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
1. Fork dự án
2. Tạo branch tính năng (`git checkout -b feature/AmazingFeature`)
3. Commit các thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Mở một Pull Request

---

## 📄 Giấy Phép (License)

Dự án được phân phối dưới giấy phép **MIT License**. Xem file `LICENSE` để biết thêm chi tiết.

CreBy: BMN2910