import { ListingWizard } from "../../../features/admin-listing/components";

const PROVISIONAL_MAXIMUM_LISTING_IMAGES = 10;

export function AddNewCarForm() {
  return (
    <ListingWizard
      maximumImages={PROVISIONAL_MAXIMUM_LISTING_IMAGES}
    />
  );
}
