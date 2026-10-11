#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { analyzeFlightRecorder, formatConsoleReport } from './log_analyzer/flight_recorder_analyzer.mjs';

function printUsage() {
  console.log(`
Cách sử dụng:
  node scripts/analyze_gameplay_log.mjs <đường_dẫn_tệp_log.json> [tùy_chọn]

Tùy chọn:
  --timeline   In chi tiết từng dòng sự kiện theo thứ tự tick thời gian
  --verbose    Hiển thị thông tin chẩn đoán kỹ thuật mở rộng
  --help, -h   Hiển thị trợ giúp này

Ví dụ:
  node scripts/analyze_gameplay_log.mjs match_VT9KOW.json
  node scripts/analyze_gameplay_log.mjs match_dump.json --timeline
`);
}

function main() {
  const args = process.argv.slice(2);
  const flags = new Set(args.filter((a) => a.startsWith('-')));
  const fileArgs = args.filter((a) => !a.startsWith('-'));

  if (flags.has('--help') || flags.has('-h') || fileArgs.length === 0) {
    printUsage();
    process.exit(fileArgs.length === 0 && !flags.has('--help') && !flags.has('-h') ? 1 : 0);
  }

  const targetPath = path.resolve(process.cwd(), fileArgs[0]);
  if (!fs.existsSync(targetPath)) {
    console.error(`❌ Không tìm thấy tệp log: ${targetPath}`);
    process.exit(1);
  }

  let dumpData;
  try {
    const rawContent = fs.readFileSync(targetPath, 'utf8');
    dumpData = JSON.parse(rawContent);
  } catch (err) {
    console.error(`❌ Lỗi khi đọc hoặc phân tích JSON từ tệp: ${err.message}`);
    process.exit(1);
  }

  try {
    const analysis = analyzeFlightRecorder(dumpData, {
      verbose: flags.has('--verbose'),
      timeline: flags.has('--timeline'),
    });
    const reportText = formatConsoleReport(analysis, {
      verbose: flags.has('--verbose'),
      timeline: flags.has('--timeline'),
    });
    console.log(reportText);
  } catch (err) {
    console.error(`❌ Lỗi trong quá trình phân tích dữ liệu log: ${err.message}`);
    process.exit(1);
  }
}

main();
