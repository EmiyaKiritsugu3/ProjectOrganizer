import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const extractGistId = (gistUrlOrId: string): string | null => {
  if (!gistUrlOrId || !gistUrlOrId.trim()) {
    return null;
  }
  try {
    // Attempt to parse as a full URL
    const url = new URL(gistUrlOrId);
    if (url.hostname === 'gist.github.com') {
      const pathParts = url.pathname.split('/');
      // Gist ID is usually the last part: /username/gist_id or just /gist_id
      const potentialId = pathParts.pop();
      if (potentialId && (potentialId.match(/^[0-9a-f]{20,}$/i))) { // Gist IDs are hex and can be 20 or 32 chars
        return potentialId;
      }
    }
  } catch (error) {
    // If not a valid URL, it might be just the ID itself
  }

  // If it's not a full URL or parsing failed, check if the input string itself is a valid Gist ID
  const trimmedInput = gistUrlOrId.trim();
  if (trimmedInput.match(/^[0-9a-f]{20,}$/i)) {
    return trimmedInput;
  }
  
  // Check if it's a dartpad.dev URL and extract from there
  try {
    const dartpadUrl = new URL(gistUrlOrId);
    if (dartpadUrl.hostname === 'dartpad.dev') {
      const pathParts = dartpadUrl.pathname.split('/'); // e.g. /<gist_id>
      if (pathParts.length > 1 && pathParts[1] && pathParts[1].match(/^[0-9a-f]{20,}$/i)) {
        return pathParts[1];
      }
      // Check query parameters as a fallback, though direct path is preferred
      const idFromQuery = dartpadUrl.searchParams.get('id') || dartpadUrl.searchParams.get('sample') || dartpadUrl.searchParams.get('sample_id');
      if (idFromQuery && idFromQuery.match(/^[0-9a-f]{20,}$/i)) {
        return idFromQuery;
      }
    }
  } catch (error) {
    // Not a dartpad.dev URL or parsing failed
  }

  return null; // Return null if no valid ID can be extracted
};
