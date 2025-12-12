/**
 * Copy text to clipboard with fallback for HTTP environments
 * Modern Clipboard API only works on HTTPS or localhost
 * This function falls back to document.execCommand for HTTP
 */
export async function copyToClipboard(text: string): Promise<void> {
  // Try modern Clipboard API first (works on HTTPS/localhost)
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (err) {
      console.warn('Clipboard API failed, falling back to execCommand:', err);
    }
  }

  // Fallback for HTTP or older browsers
  const textarea = document.createElement('textarea');
  textarea.value = text;

  // Make textarea invisible but ensure it's still selectable
  textarea.style.position = 'fixed';
  textarea.style.left = '-999999px';
  textarea.style.top = '-999999px';
  textarea.style.opacity = '0';

  document.body.appendChild(textarea);

  try {
    textarea.focus();
    textarea.select();

    const successful = document.execCommand('copy');
    if (!successful) {
      throw new Error('execCommand failed');
    }
  } finally {
    document.body.removeChild(textarea);
  }
}
