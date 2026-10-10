const SUPPORTED_STORAGE_PROVIDERS = [
  "pending",
  "cloudinary",
  "s3",
  "firebase",
  "supabase",
  "local",
];

function normalizeProvider(provider) {
  if (typeof provider !== "string") {
    return "pending";
  }

  const normalizedProvider = provider.trim().toLowerCase();

  if (SUPPORTED_STORAGE_PROVIDERS.includes(normalizedProvider)) {
    return normalizedProvider;
  }

  return "pending";
}

function isStorageDeletionEnabled(options = {}) {
  return (
    options.execute === true &&
    process.env.CLEANUP_STORAGE_DELETE_ENABLED === "true"
  );
}

function getSafeMediaUrl(mediaItem) {
  if (typeof mediaItem === "string") {
    return mediaItem;
  }

  if (mediaItem && typeof mediaItem.imageUrl === "string") {
    return mediaItem.imageUrl;
  }

  if (mediaItem && typeof mediaItem.image_url === "string") {
    return mediaItem.image_url;
  }

  return "";
}

function buildSkippedStorageResult({ mediaItem, provider, reason }) {
  return {
    provider,
    mediaUrl: getSafeMediaUrl(mediaItem),
    deleted: false,
    skipped: true,
    reason,
  };
}

export function getStorageProvider() {
  return normalizeProvider(
    process.env.STORAGE_PROVIDER || process.env.IMAGE_STORAGE_PROVIDER || "pending"
  );
}

export function getStorageCleanupReadiness(options = {}) {
  const provider = getStorageProvider();

  return {
    provider,
    supportedProviders: SUPPORTED_STORAGE_PROVIDERS,
    deleteEnabled: isStorageDeletionEnabled(options),
    destructiveByDefault: false,
  };
}

export async function deleteMediaObject(mediaItem, options = {}) {
  const provider = normalizeProvider(options.provider || getStorageProvider());

  if (!getSafeMediaUrl(mediaItem)) {
    return buildSkippedStorageResult({
      mediaItem,
      provider,
      reason: "Media URL is missing, so storage cleanup was skipped.",
    });
  }

  if (provider === "pending") {
    return buildSkippedStorageResult({
      mediaItem,
      provider,
      reason: "Storage provider is not configured.",
    });
  }

  if (!SUPPORTED_STORAGE_PROVIDERS.includes(provider)) {
    return buildSkippedStorageResult({
      mediaItem,
      provider: "pending",
      reason: "Storage provider is not supported by the cleanup adapter.",
    });
  }

  if (!isStorageDeletionEnabled(options)) {
    return buildSkippedStorageResult({
      mediaItem,
      provider,
      reason: "Storage deletion is disabled. Run in explicit execute mode with CLEANUP_STORAGE_DELETE_ENABLED=true after provider approval.",
    });
  }

  return buildSkippedStorageResult({
    mediaItem,
    provider,
    reason: "Real storage deletion remains intentionally disabled until the storage provider and deletion policy are approved.",
  });
}

export async function deleteMediaBatch(mediaItems = [], options = {}) {
  const items = Array.isArray(mediaItems) ? mediaItems : [];
  const results = [];

  for (const mediaItem of items) {
    results.push(await deleteMediaObject(mediaItem, options));
  }

  const deletedCount = results.filter((result) => result.deleted).length;
  const skippedCount = results.filter((result) => result.skipped).length;

  return {
    provider: normalizeProvider(options.provider || getStorageProvider()),
    requestedCount: items.length,
    deletedCount,
    skippedCount,
    destructive: false,
    results,
  };
}
