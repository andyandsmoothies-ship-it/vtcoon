const MAX_RESOLVED_ENTRIES = 100;
const resolvedTradeOfferIds = new Set<string>();

export function markTradeOfferResolved(offerId: string): boolean {
  if (!offerId || resolvedTradeOfferIds.has(offerId)) {
    return false;
  }
  if (resolvedTradeOfferIds.size >= MAX_RESOLVED_ENTRIES) {
    const oldest = resolvedTradeOfferIds.values().next().value;
    if (oldest) resolvedTradeOfferIds.delete(oldest);
  }
  resolvedTradeOfferIds.add(offerId);
  return true;
}

export function resetTradeOfferResolutions(): void {
  resolvedTradeOfferIds.clear();
}
