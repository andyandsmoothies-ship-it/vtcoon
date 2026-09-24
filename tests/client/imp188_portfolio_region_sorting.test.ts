// [TC-IMP188/MSS] Contract Test Suite for IMP-188: Sắp xếp Danh mục Bất động sản theo khu vực & nhóm màu
import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PropertyPortfolioModal } from '../../src/client/ui/modals/property_portfolio_modal';
import { sortPropertiesByRegion, getPropertySortWeight } from '../../src/client/ui/modals/modal_helpers';

describe('[IMP-188] Property Portfolio Region & Color Group Sorting', () => {
  describe('1. Pure Helper Contracts (modal_helpers)', () => {
    it('[TC-IMP188.01/Unit] getPropertySortWeight gán trọng số tăng dần theo cụm màu và cellIndex', () => {
      // Nâu (#1, #3)
      expect(getPropertySortWeight(1)).toBeLessThan(getPropertySortWeight(3));
      // Nâu (#3) < Xanh Da Trời (#6)
      expect(getPropertySortWeight(3)).toBeLessThan(getPropertySortWeight(6));
      // Tím (#39) < Railroad (#5)
      expect(getPropertySortWeight(39)).toBeLessThan(getPropertySortWeight(5));
      // Railroad (#35) < Utility (#12)
      expect(getPropertySortWeight(35)).toBeLessThan(getPropertySortWeight(12));
    });

    it('[TC-IMP188.02/Unit] sortPropertiesByRegion sắp xếp danh sách ô lộn xộn về đúng thứ tự khu vực chuẩn', () => {
      // Thứ tự mua lộn xộn: Q1 (#39, Tím), Cần Thơ (#1, Nâu), Đà Nẵng (#19, Cam), Long Thành (#5, Ga), EVN (#12, Tiện ích), Quy Nhơn (#16, Cam)
      const shuffled = [39, 1, 19, 5, 12, 16];
      const sorted = sortPropertiesByRegion(shuffled);
      // Kỳ vọng: #1 (Nâu) -> #16 (Cam) -> #19 (Cam) -> #39 (Tím) -> #5 (Railroad) -> #12 (Utility)
      expect(sorted).toEqual([1, 16, 19, 39, 5, 12]);
    });

    it('[TC-IMP188.03/Boundary] Ô Tiện Ích (#12) không bị chèn giữa các ô Hồng (#11, #13, #14)', () => {
      const input = [13, 12, 11, 14];
      const sorted = sortPropertiesByRegion(input);
      // Cả 3 ô Hồng kề nhau, #12 nằm cuối
      expect(sorted).toEqual([11, 13, 14, 12]);
    });

    it('[TC-IMP188.04/Boundary] Các ga tàu (#5, #15, #25, #35) được gom chung cụm và xếp tăng dần', () => {
      const input = [35, 5, 25, 15];
      const sorted = sortPropertiesByRegion(input);
      expect(sorted).toEqual([5, 15, 25, 35]);
    });
  });

  describe('2. Modal Component DOM Rendering Order', () => {
    it('[TC-IMP188.05/MSS] Render các thẻ BĐS theo thứ tự cụm màu bất kể thứ tự mua vào ownedProperties', () => {
      // Người chơi mua: Q1 (#39, Tím) trước, rồi Cần Thơ (#1, Nâu), rồi Quy Nhơn (#16, Cam), rồi Long Thành (#5, Ga)
      const ownedProperties = [39, 1, 16, 5];
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties,
          propertyStates: {
            1: { ownerId: 'p1', level: 0, isMortgaged: false },
            5: { ownerId: 'p1', level: 0, isMortgaged: false },
            16: { ownerId: 'p1', level: 0, isMortgaged: false },
            39: { ownerId: 'p1', level: 0, isMortgaged: false },
          },
          currentBalance: 5000,
        })
      );

      // Trích xuất thứ tự data-testid của các item
      const itemMatches = [...html.matchAll(/data-testid="property-portfolio-item-(\d+)"/g)].map((m) =>
        Number(m[1])
      );

      // Thứ tự xuất hiện trên giao diện phải là: #1 (Nâu), #16 (Cam), #39 (Tím), #5 (Ga tàu)
      expect(itemMatches).toEqual([1, 16, 39, 5]);
    });

    it('[TC-IMP188.06/Reactivity] Thứ tự sắp xếp khu vực được duy trì trọn vẹn khi có nhiều ô cùng nhóm màu', () => {
      // Người chơi mua Hoàn Kiếm #34 trước, sau đó mới mua Cầu Giấy #32, Văn Giang #31
      const ownedProperties = [34, 32, 31];
      const html = renderToStaticMarkup(
        React.createElement(PropertyPortfolioModal, {
          ownedProperties,
          propertyStates: {
            31: { ownerId: 'p1', level: 0, isMortgaged: false },
            32: { ownerId: 'p1', level: 0, isMortgaged: false },
            34: { ownerId: 'p1', level: 0, isMortgaged: false },
          },
          currentBalance: 5000,
        })
      );

      const itemMatches = [...html.matchAll(/data-testid="property-portfolio-item-(\d+)"/g)].map((m) =>
        Number(m[1])
      );

      // Phải xếp đúng trật tự bàn cờ tăng dần trong nhóm Xanh Lá: 31 -> 32 -> 34
      expect(itemMatches).toEqual([31, 32, 34]);
    });
  });
});
