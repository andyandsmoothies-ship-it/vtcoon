// [UC-GAME-009/MSS] Board Config — Static 40-cell schema

export enum CellType {
  Go             = 'Go',
  Property       = 'Property',
  Tax            = 'Tax',
  Chance         = 'Chance',
  CommunityChest = 'CommunityChest',
  Railroad       = 'Railroad',
  Utility        = 'Utility',
  Jail           = 'Jail',
  FreeParking    = 'FreeParking',
  GoToJail       = 'GoToJail',
}

export enum ColorGroup {
  Nau = 'Nau', XanhDaTroi = 'XanhDaTroi', Hong = 'Hong', Cam = 'Cam',
  Do = 'Do', Vang = 'Vang', XanhLa = 'XanhLa', Tim = 'Tim',
}

export interface BoardCell {
  readonly index: number;
  readonly name:  string;
  readonly type:  CellType;
  readonly colorGroup?: ColorGroup;
}

export const BOARD_CONFIG: readonly BoardCell[] = [
  { index:  0, name: 'Go',                    type: CellType.Go },
  { index:  1, name: 'Mediterranean Avenue',  type: CellType.Property, colorGroup: ColorGroup.Nau },
  { index:  2, name: 'Community Chest',       type: CellType.CommunityChest },
  { index:  3, name: 'Baltic Avenue',         type: CellType.Property, colorGroup: ColorGroup.Nau },
  { index:  4, name: 'Income Tax',            type: CellType.Tax },
  { index:  5, name: 'Reading Railroad',      type: CellType.Railroad },
  { index:  6, name: 'Oriental Avenue',       type: CellType.Property, colorGroup: ColorGroup.XanhDaTroi },
  { index:  7, name: 'Chance',                type: CellType.Chance },
  { index:  8, name: 'Vermont Avenue',        type: CellType.Property, colorGroup: ColorGroup.XanhDaTroi },
  { index:  9, name: 'Connecticut Avenue',    type: CellType.Property, colorGroup: ColorGroup.XanhDaTroi },
  { index: 10, name: 'Jail',                  type: CellType.Jail },
  { index: 11, name: 'St. Charles Place',     type: CellType.Property, colorGroup: ColorGroup.Hong },
  { index: 12, name: 'Electric Company',      type: CellType.Utility },
  { index: 13, name: 'States Avenue',         type: CellType.Property, colorGroup: ColorGroup.Hong },
  { index: 14, name: 'Virginia Avenue',       type: CellType.Property, colorGroup: ColorGroup.Hong },
  { index: 15, name: 'Pennsylvania Railroad', type: CellType.Railroad },
  { index: 16, name: 'St. James Place',       type: CellType.Property, colorGroup: ColorGroup.Cam },
  { index: 17, name: 'Community Chest',       type: CellType.CommunityChest },
  { index: 18, name: 'Tennessee Avenue',      type: CellType.Property, colorGroup: ColorGroup.Cam },
  { index: 19, name: 'New York Avenue',       type: CellType.Property, colorGroup: ColorGroup.Cam },
  { index: 20, name: 'Free Parking',          type: CellType.FreeParking },
  { index: 21, name: 'Kentucky Avenue',       type: CellType.Property, colorGroup: ColorGroup.Do },
  { index: 22, name: 'Chance',                type: CellType.Chance },
  { index: 23, name: 'Indiana Avenue',        type: CellType.Property, colorGroup: ColorGroup.Do },
  { index: 24, name: 'Illinois Avenue',       type: CellType.Property, colorGroup: ColorGroup.Do },
  { index: 25, name: 'B&O Railroad',          type: CellType.Railroad },
  { index: 26, name: 'Atlantic Avenue',       type: CellType.Property, colorGroup: ColorGroup.Vang },
  { index: 27, name: 'Ventnor Avenue',        type: CellType.Property, colorGroup: ColorGroup.Vang },
  { index: 28, name: 'Water Works',           type: CellType.Utility },
  { index: 29, name: 'Marvin Gardens',        type: CellType.Property, colorGroup: ColorGroup.Vang },
  { index: 30, name: 'Go To Jail',            type: CellType.GoToJail },
  { index: 31, name: 'Pacific Avenue',        type: CellType.Property, colorGroup: ColorGroup.XanhLa },
  { index: 32, name: 'North Carolina Avenue', type: CellType.Property, colorGroup: ColorGroup.XanhLa },
  { index: 33, name: 'Community Chest',       type: CellType.CommunityChest },
  { index: 34, name: 'Pennsylvania Avenue',   type: CellType.Property, colorGroup: ColorGroup.XanhLa },
  { index: 35, name: 'Short Line Railroad',   type: CellType.Railroad },
  { index: 36, name: 'Chance',                type: CellType.Chance },
  { index: 37, name: 'Park Place',            type: CellType.Property, colorGroup: ColorGroup.Tim },
  { index: 38, name: 'Luxury Tax',            type: CellType.Tax },
  { index: 39, name: 'Boardwalk',             type: CellType.Property, colorGroup: ColorGroup.Tim },
];
