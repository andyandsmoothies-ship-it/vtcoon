// [UI-S01/MSS] Coastal Dynamics & Living Ocean Test Suite (Package A)
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { CoastalPatrolBoat } from '../../src/client/3d/coastal_patrol_boat';
import { CoastalSeagulls } from '../../src/client/3d/coastal_seagulls';
import { CoastalIslandEnvironment } from '../../src/client/3d/coastal_island_environment';
import { DioramaContainerPort } from '../../src/client/3d/diorama/diorama_container_port';

describe('[UI-S01/MSS] Living Ocean & Coastal Maritime Activities', () => {
  let originalConsoleError: typeof console.error;
  let boatMarkup = '';
  let seagullsMarkup = '';
  let envMarkup = '';
  let portMarkup = '';

  beforeAll(() => {
    originalConsoleError = console.error;
    console.error = (...args: unknown[]) => {
      const msg = typeof args[0] === 'string' ? args[0] : '';
      if (
        msg.includes('is using incorrect casing') ||
        msg.includes('does not recognize the') ||
        msg.includes('non-boolean attribute')
      ) {
        return;
      }
      originalConsoleError(...args);
    };

    boatMarkup = renderToStaticMarkup(React.createElement(CoastalPatrolBoat));
    seagullsMarkup = renderToStaticMarkup(React.createElement(CoastalSeagulls));
    envMarkup = renderToStaticMarkup(React.createElement(CoastalIslandEnvironment));
    portMarkup = renderToStaticMarkup(React.createElement(DioramaContainerPort));
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  it('CoastalPatrolBoat kết xuất vỏ ca-nô trắng vát nhọn, vạch sọc cảnh sát biển và bọt rẽ sóng', () => {
    expect(boatMarkup).toContain('data-testid="coastal-patrol-boat"');
    expect(boatMarkup).toContain('#F8FAFC'); // Thân vỏ trắng
    expect(boatMarkup).toContain('#EA580C'); // Vạch cam cảnh sát biển
    expect(boatMarkup).toContain('#0284C7'); // Vạch xanh dương biển sâu
    expect(boatMarkup).toContain('#3B82F6'); // Đèn chớp xanh
    expect(boatMarkup).toContain('#EF4444'); // Đèn chớp đỏ
    expect(boatMarkup).toContain('#FFFFFF'); // Bọt nước rẽ sóng
  });

  it('CoastalSeagulls kết xuất đàn hải âu 5 con với sải cánh và mỏ vàng', () => {
    expect(seagullsMarkup).toContain('data-testid="coastal-seagulls"');
    expect(seagullsMarkup).toContain('#F8FAFC'); // Thân và lông cánh trắng
    expect(seagullsMarkup).toContain('#F59E0B'); // Mỏ vàng rực
    expect(seagullsMarkup).toContain('#334155'); // Đầu cánh sẫm màu
  });

  it('CoastalIslandEnvironment tích hợp phân tầng quang học đại dương và hoạt cảnh biển', () => {
    // 1. Phân tầng quang học: Đáy vực thẳm -> Sóng động nhiệt đới -> Nước nông ngọc bích sát bờ
    expect(envMarkup).toContain('#0C4A6E'); // Vực đại dương thẳm
    expect(envMarkup).toContain('#0284C7'); // Lưới sóng động nhiệt đới
    expect(envMarkup).toContain('#06B6D4'); // Nước nông ngọc bích
    expect(envMarkup).toContain('#FFFFFF'); // Bọt sóng ven bờ

    // 2. Tích hợp hoạt cảnh ca-nô và chim hải âu
    expect(envMarkup).toContain('data-testid="coastal-patrol-boat"');
    expect(envMarkup).toContain('data-testid="coastal-seagulls"');
  });

  it('DioramaContainerPort tích hợp cấu trúc cần cẩu giàn với cáp cẩu và cụm dầm xoay', () => {
    expect(portMarkup).toContain('data-testid="diorama-container-port"');
    expect(portMarkup).toContain('#EA580C'); // Cần cẩu giàn 1
    expect(portMarkup).toContain('#F59E0B'); // Cần cẩu giàn 2
    expect(portMarkup).toContain('#FACC15'); // Khung chụp spreader vàng
    expect(portMarkup).toContain('#334155'); // Cáp cẩu thép
  });

  it('Mã nguồn CoastalIslandEnvironment và DioramaContainerPort khai báo chu kỳ hoạt họa useSafeFrame', () => {
    const envSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/client/3d/coastal_island_environment.tsx'), 'utf-8');
    expect(envSrc).toContain('Math.PI * 2 / 3.5'); // Chu kỳ thủy triều 3.5s
    expect(envSrc).toContain('oceanGeomRef'); // Lưới sóng vertex biến thiên
    expect(envSrc).toContain('computeVertexNormals'); // Cập nhật pháp tuyến bề mặt phản chiếu ánh sáng

    const portSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/client/3d/diorama/diorama_container_port.tsx'), 'utf-8');
    expect(portSrc).toContain('0.436'); // 25 độ = 0.436 rad yaw rotation
    // Cáp cẩu container treo dưới dầm cẩu (tọa độ Y âm tương đối)
    expect(portSrc).toContain('-0.27 + Math.sin');
    expect(portSrc).toContain('-0.32 + Math.cos');
  });

  it('Kiểm tra quỹ đạo ca-nô tuần duyên trong vịnh biển phía Nam và hải âu bay thẳng hướng', () => {
    const boatSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/client/3d/coastal_patrol_boat.tsx'), 'utf-8');
    // Ca-nô di chuyển ở vùng nước vịnh biển phía Nam Z >= 29 (ngoài đảo cát Z <= 28)
    expect(boatSrc).toContain('35 + Math.cos(angle) * 6');

    const gullSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/client/3d/coastal_seagulls.tsx'), 'utf-8');
    // Hải âu hướng mỏ thẳng theo vector vận tốc tiếp tuyến (không bay ngang cua)
    expect(gullSrc).toContain('bird.rotation.y = -theta;');
  });
});
