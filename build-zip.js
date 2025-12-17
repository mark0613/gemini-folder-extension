/* eslint-disable no-console */
import archiver from 'archiver';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const DIST_DIR = 'dist';

// 0. 先執行 Build 指令
console.log('🔨 正在執行建置 (npm run build)...');
try {
    execSync('npm run build', { stdio: 'inherit' });
}
catch {
    console.error('❌ Build 失敗，已終止打包流程。');
    process.exit(1);
}

// 1. 讀取目前的 manifest
const manifestPath = path.resolve(DIST_DIR, 'manifest.json');
const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// 2. 移除 key 欄位 (為了給 Chrome Web Store)
if (manifestData.key) {
    console.log('🔒 正在移除 manifest key...');
    delete manifestData.key;
}

// 3. 寫入暫存的 manifest (不影響原始碼，只改 dist 裡面的)
fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));

// 4. 取得版本號並設定輸出檔名
const version = manifestData.version || '0.0.0';
if (version === '0.0.0') {
    console.error('❌ 找不到 manifest version，已終止打包流程。');
    process.exit(1);
}
const OUTPUT_ZIP = `zip/gemini-folder-${version}.zip`;

// 5. 開始壓縮 ZIP
const output = fs.createWriteStream(OUTPUT_ZIP);
const archive = archiver('zip', { zlib: { level: 9 } });

output.on('close', () => {
    console.log(`✅ 打包完成！檔案大小: ${archive.pointer()} bytes`);
    console.log(`🚀 請上傳: ${OUTPUT_ZIP}`);
});

archive.pipe(output);

// 把 dist 資料夾內的檔案加入 zip（排除 .vite）
archive.directory(DIST_DIR, false, (entry) => {
    if (entry.name.startsWith('.vite')) return false;
    return entry;
});

archive.finalize();
