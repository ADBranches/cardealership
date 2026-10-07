import type { CreateListingInput, ListingResult, ListingService } from "../types";
export type ListingApiOptions = { mockMode?: boolean; isProduction?: boolean };
export function isListingMockMode(value = import.meta.env.VITE_ADMIN_LISTING_MOCK_MODE, isProduction = import.meta.env.PROD) { return !isProduction && value === "true"; }
class MockListingService implements ListingService {
  constructor(private options: ListingApiOptions) {}
  async createListing(token: string, input: CreateListingInput): Promise<ListingResult> {
    if (!token.trim()) return { success: false, code: "UNAUTHORIZED", message: "Authentication is required." };
    if (!(this.options.mockMode ?? isListingMockMode(undefined, this.options.isProduction ?? import.meta.env.PROD))) return { success: false, code: "CONTRACT_UNAVAILABLE", message: "Live listing integration is not confirmed." };
    if (!input.draft.make.trim() || !input.draft.model.trim()) return { success: false, code: "VALIDATION_FAILED", message: "Make and model are required." };
    return { success: true, listingId: "synthetic-listing-001", message: "Synthetic listing prepared.", mock: true };
  }
}
export function createListingService(options: ListingApiOptions = {}): ListingService {
  if ((options.isProduction ?? import.meta.env.PROD) && options.mockMode) throw new Error("Mock listing service is disabled in production.");
  return new MockListingService(options);
}
