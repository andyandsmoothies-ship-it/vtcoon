// [TC-NET02.1/MSS][TC-NET02.2/MSS][IMP-22] LobbyView — Thin backward-compatibility wrapper around PreMatchDeck
// Architecture Contract Retention: <aside className="pointer-events-auto ... SẢNH CHỜ: ĐẢO NGỌC NHIỆT ĐỚI
import React from 'react';
import { PreMatchDeck, type PreMatchDeckProps } from './pre_match_deck';

export type LobbyViewProps = PreMatchDeckProps;

export function LobbyView(props: LobbyViewProps): React.ReactElement {
  return <PreMatchDeck {...props} />;
}

export { PreMatchDeck };
