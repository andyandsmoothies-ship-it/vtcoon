import fs from 'node:fs';
import path from 'node:path';

const files = [
  'src/client/store/room_config_helpers.ts',
  'src/client/events/game_event_bus_types.ts',
  'src/client/events/trade_offer_tracker.ts',
  'src/domain/event_card_types.ts',
  'src/client/store/lobby_store.ts',
  'src/client/offline_landing.ts',
  'src/client/events/game_event_bus.ts',
  'src/client/events/subscribers/audio_event_subscriber.ts',
  'src/client/events/subscribers/badge_event_subscriber.ts',
  'src/client/events/subscribers/activity_log_subscriber.ts',
  'src/client/events/subscribers/property_market_badge_handler.ts',
  'src/client/events/subscribers/badge_financial_helpers.ts',
  'src/client/events/subscribers/activity_log_financial_formatter.ts',
  'src/client/network/apply_delta.ts',
  'src/client/network/client_session_purger.ts',
  'src/client/network/activity_tracker.ts',
  'src/client/ui/modals/bot_trade_offer_strip.tsx',
  'tests/client/imp422_client_network_subscribers_zero_cycle.test.ts'
];

for (const f of files) {
  if (fs.existsSync(f)) {
    const raw = fs.readFileSync(f, 'utf8').split('\n');
    if (raw.length > 0 && raw[raw.length - 1] === '') raw.pop();
    console.log(`${f}: ${raw.length}`);
  } else {
    console.log(`${f}: 0 (new)`);
  }
}
