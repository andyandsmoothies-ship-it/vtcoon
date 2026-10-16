// [IMP-423] Room Manager Public Interface & RollResult Seam
import type { Room, Player } from '../domain/room.js';
import type { DiceResult } from '../domain/dice.js';
import type { PropertyRegistry, PropertyStateMap } from '../domain/property_manager.js';
import type { RoomContext } from './room_context_types.js';
import type { AuctionSession, AuctionResult } from './auction_types.js';
import type { PlayerIntent } from '../domain/protocol/index.js';

export interface RollResult {
  readonly dice: DiceResult;
  readonly player: Readonly<{ id: string; position: number; balance: number }>;
  readonly passedGo: boolean;
  readonly passedGoSalary?: number;
  readonly rentCharged: number;
}

export interface IRoomManager {
  readonly rooms: Map<string, Room>;
  readonly propertyRegistries?: Map<string, PropertyRegistry>;
  readonly registries?: Map<string, PropertyRegistry>;
  readonly propertyStateMaps?: Map<string, PropertyStateMap>;
  readonly propertyStates?: Map<string, PropertyStateMap>;
  readonly auctions: Map<string, AuctionSession>;
  readonly auctionsMap: Map<string, AuctionSession>;
  readonly rolledThisTurnMap: Map<string, boolean>;
  getRoom(roomCode: string): Room | undefined;
  getContext(roomCode: string): RoomContext | undefined;
  getRoomContext?(roomCode: string): RoomContext | undefined;
  getSession(roomCode: string): any;
  getRng(): () => number;
  getDeckRng(): () => number;
  getRegistry(roomCode: string): PropertyRegistry | undefined;
  getPropertyStates(roomCode: string): PropertyStateMap | undefined;
  handleDowngrade(roomCode: string, playerId: string, cellIndex: number, options?: any): any;
  handleMortgage(roomCode: string, playerId: string, cellIndex: number): any;
  handleHoseSkip(roomCode: string, playerId: string): any;
  handlePlayerIntent(roomCode: string, playerId: string, intent: PlayerIntent): { success: boolean; reason?: string; rollResult?: RollResult; idempotent?: boolean };
  handleIntent?(roomCode: string, playerId: string, intent: PlayerIntent): { success: boolean; rollResult?: RollResult; reason?: string };
  handleRoll?(roomCode: string, playerId: string): RollResult | undefined;
  handleRollDice(roomCode: string, playerId: string): RollResult | undefined;
  handleDecline(roomCode: string, playerId: string): { success: boolean; reason?: string };
  handleAuctionBid(roomCode: string, playerId: string, amount: number): { success: boolean; reason?: string };
  handleAuctionPass(roomCode: string, playerId: string): { success: boolean; reason?: string };
  handleAuctionClose(roomCode: string): any;
  getAuctionSession(roomCode: string): AuctionSession | undefined;
  getBotPersonality(roomCode: string, botId: string): any;
  hasPendingTrade(roomCode: string): boolean;
  hasPendingBuyout(roomCode: string): boolean;
  handleEndTurn(roomCode: string, playerId: string, continueDoubles?: boolean): Room | undefined | boolean;
  stepAuctionBot(roomCode: string): any;
  handleBailOut(roomCode: string, playerId: string): { success: boolean; reason?: string };
  handleIssueBond(roomCode: string, playerId: string, trancheId?: any): { success: boolean; reason?: string };
  handleRepayBond(roomCode: string, playerId: string): { success: boolean; reason?: string };
}
