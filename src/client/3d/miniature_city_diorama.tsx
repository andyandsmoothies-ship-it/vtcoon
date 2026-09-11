// [UI-S02/MSS] MiniatureCityDiorama — Unified Sculpted Tabletop Diorama Root Coordinator
// Assembles terrain, iconic bridges, modern stadium, marina, skyline & micro-life
import React from 'react';
import { DioramaTerrain } from './diorama/diorama_terrain';
import { DioramaBridges } from './diorama/diorama_bridges';
import { DioramaStadium } from './diorama/diorama_stadium';
import { DioramaFerrisWheel } from './diorama/diorama_ferris_wheel';
import { DioramaContainerPort } from './diorama/diorama_container_port';
import { DioramaMarina } from './diorama/diorama_marina';
import { DioramaSkyline } from './diorama/diorama_skyline';
import { DioramaHeritageDistrict } from './diorama/diorama_heritage_district';
import { DioramaMicroLife } from './diorama/diorama_microlife';
import { DioramaTraffic } from './diorama/diorama_traffic';

export function MiniatureCityDiorama(): React.ReactElement {
  return (
    <group position={[0, 0, 0]} data-testid="miniature-city-diorama">
      {/* 1. Bán đảo đôi liền khối & Bậc thềm kết nối quảng trường trung tâm */}
      <DioramaTerrain />

      {/* 2. Cầu Ba Son (Bắc) và Cầu Long Biên (Nam) nối liền hai bờ sông */}
      <DioramaBridges />

      {/* 3. Đấu trường thể thao oval hiện đại (Đông Bắc) */}
      <DioramaStadium />

      {/* 3.1. Vòng đu quay khổng lồ sắc màu (Đông Bắc - Khu vui chơi giải trí) */}
      <DioramaFerrisWheel />

      {/* 4. Cảng Container Cát Lái & Cần cẩu giàn gantry bốc dỡ hàng hải (Đông Nam) */}
      <DioramaContainerPort />

      {/* 4.1. Bến du thuyền siêu sang, cầu cảng gỗ & ngọn hải đăng di sản (Đông Nam) */}
      <DioramaMarina />

      {/* 5. Cụm cao ốc tài chính Landmark Skyline & Phố cổ Hội An (Tây Bắc & Tây) */}
      <DioramaSkyline />

      {/* 5.1. Khu di sản văn hóa: Chợ Bến Thành & Nhà Thờ Đức Bà mái ngói đỏ (Tây Nam) */}
      <DioramaHeritageDistrict />

      {/* 6. Nhịp sống đô thị vi mô: Xe buýt tí hon, xe hơi ven đường & ca-nô lướt sóng */}
      <DioramaMicroLife />

      {/* 7. Hệ thống giao thông tự hành vi mô: Xe buýt & ô tô di chuyển tuần hoàn hai làn */}
      <DioramaTraffic />
    </group>
  );
}

