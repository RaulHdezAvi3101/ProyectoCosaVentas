export class ListingNotLiveError extends Error {
  constructor() {
    super("LISTING_NOT_LIVE");
    this.name = "ListingNotLiveError";
  }
}
