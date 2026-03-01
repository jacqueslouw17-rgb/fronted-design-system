// Shared file upload validation constants and helpers

export const FILE_UPLOAD_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const FILE_UPLOAD_MAX_COUNT = 5; // per request
export const FILE_UPLOAD_ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const FILE_UPLOAD_ACCEPT = '.pdf,.jpg,.jpeg,.png';

export const FILE_ERROR_SIZE = 'File exceeds 5MB max. Try a smaller one.';
export const FILE_ERROR_TYPE = 'Sorry, only JPG, PNG, or PDF are accepted.';
export const FILE_UPLOAD_HELPER = 'PDF, JPG, or PNG up to 5MB';
export const FILE_UPLOAD_HELPER_RECEIPT = 'Receipts, invoices, or any proof of purchase — PDF, JPG, PNG (max 5MB)';

/**
 * Validate files for upload. Returns { valid, errors } where valid contains
 * accepted files and errors contains per-file error messages.
 * Also enforces max count relative to existing files.
 */
export function validateFiles(
  newFiles: File[],
  existingCount: number
): { valid: File[]; error: string | null } {
  const valid: File[] = [];
  
  for (const file of newFiles) {
    // Check remaining capacity
    if (existingCount + valid.length >= FILE_UPLOAD_MAX_COUNT) break;

    if (!FILE_UPLOAD_ALLOWED_TYPES.includes(file.type)) {
      return { valid: [], error: FILE_ERROR_TYPE };
    }

    if (file.size > FILE_UPLOAD_MAX_SIZE) {
      return { valid: [], error: FILE_ERROR_SIZE };
    }

    valid.push(file);
  }

  return { valid, error: null };
}

/**
 * Validate a single file (used for single-file upload fields like correction attachment)
 */
export function validateSingleFile(file: File): string | null {
  if (!FILE_UPLOAD_ALLOWED_TYPES.includes(file.type)) {
    return FILE_ERROR_TYPE;
  }
  if (file.size > FILE_UPLOAD_MAX_SIZE) {
    return FILE_ERROR_SIZE;
  }
  return null;
}
