import { ListingWizard } from "../../../features/admin-listing/components";
const PROVISIONAL_MAXIMUM_LISTING_IMAGES = 10;
type AddNewCarFormProps = { onPublishSuccess?: () => void };
export function AddNewCarForm({ onPublishSuccess }: AddNewCarFormProps) {
  return <ListingWizard maximumImages={PROVISIONAL_MAXIMUM_LISTING_IMAGES} onPublishSuccess={onPublishSuccess} />;
}
