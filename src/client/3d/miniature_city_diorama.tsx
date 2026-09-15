// [UI-S02/MSS] MiniatureCityDiorama — Unified Sculpted Tabletop Diorama Root Coordinator
// Assembles terrain, iconic bridges, modern stadium, marina, skyline & micro-life
import React from 'react';
import { DioramaTerrain } from './diorama/diorama_terrain';
import { DioramaBridges } from './diorama/diorama_bridges';
import { DioramaCivicCenter } from './diorama/diorama_civic_center';
import { DioramaWaterfrontPark } from './diorama/diorama_waterfront_park';
import { DioramaContainerPort } from './diorama/diorama_container_port';
import { DioramaMarina } from './diorama/diorama_marina';
import { DioramaSkyline } from './diorama/diorama_skyline';
import { DioramaHeritageDistrict } from './diorama/diorama_heritage_district';
import { DioramaMicroLife } from './diorama/diorama_microlife';
import { DioramaTraffic } from './diorama/diorama_traffic';
import { DioramaShophouseBlocks } from './diorama/diorama_shophouse_blocks';
import { DioramaHighriseBlocks } from './diorama/diorama_highrise_blocks';

export function MiniatureCityDiorama(): React.ReactElement {
  return (
    <group position={[0, 0, 0]} data-testid="miniature-city-diorama">
      {/* 1. Bán đảo đôi liền khối & Bậc thềm kết nối quảng trường trung tâm */}
      <DioramaTerrain />
      {/* 2. Cầu Ba Son (Bắc) và Cầu Long Biên (Nam) nối liền hai bờ sông */}
      <DioramaBridges />
      {/* 3. Trung tâm Văn hóa Triển lãm & Công viên Cảnh quan Bờ sông */}
      <DioramaCivicCenter />
      <DioramaWaterfrontPark />
      {/* 4. Cảng Container Cát Lái & Bến du thuyền (Đông Nam) */}
      <DioramaContainerPort />
      <DioramaMarina />
      {/* 5. Cụm cao ốc tài chính Landmark Skyline & Tháp cao ốc nén */}
      <DioramaSkyline />
      <DioramaHighriseBlocks />
      {/* 5.1. Khu di sản văn hóa Chợ Lớn & Shophouse phố cổ */}
      <DioramaHeritageDistrict />
      <DioramaShophouseBlocks />
      {/* 6. Nhịp sống đô thị vi mô & Giao thông tự hành */}
      <DioramaMicroLife />
      <DioramaTraffic />
    </group>
  );
}

