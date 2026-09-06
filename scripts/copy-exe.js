const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const src = path.join(rootDir, 'src-tauri', 'target', 'release', 'TodoLite.exe');
const dest = path.join(rootDir, 'TodoLite.exe');

try {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log('\n[TodoLite] ✅ Đã copy TodoLite.exe ra thư mục gốc thành công!\n');
  } else {
    console.warn('\n[TodoLite] ⚠️ Chưa tìm thấy file build release ở: ' + src);
    console.warn('[TodoLite] Hãy chạy "npm run build" trước nhé.\n');
  }
} catch (err) {
  if (err.code === 'EBUSY' || err.code === 'EPERM') {
    console.error('\n[TodoLite] ❌ Không thể ghi đè TodoLite.exe vì file đang được mở!');
    console.error('[TodoLite] Vui lòng tắt ứng dụng TodoLite trước khi copy/build lại.\n');
  } else {
    console.error('\n[TodoLite] ❌ Lỗi khi copy file:', err.message, '\n');
  }
}
