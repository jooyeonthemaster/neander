// Updated from the actual sites' response headers during portfolio verification.
// Keep external sites' framing policies intact; always offer a direct visit.
export const EXTERNAL_ONLY_PROJECTS: readonly string[] = [
  'stamp-tour', // X-Frame-Options: SAMEORIGIN
  'kwave-dance', // X-Frame-Options: SAMEORIGIN; frame-ancestors 'self'
  'middle-grammar', // Content-Security-Policy: frame-ancestors 'none'
];
