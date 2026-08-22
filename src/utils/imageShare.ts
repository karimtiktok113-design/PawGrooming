import html2canvas from 'html2canvas';

/**
 * Captures an HTML element as a crisp, high-resolution PNG image Blob.
 */
export async function captureElementAsPngBlob(element: HTMLElement, scale: number = 2.5): Promise<Blob | null> {
  try {
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        // Ensure cloned element has pure white background and clean borders
        const target = clonedDoc.getElementById(element.id) || clonedDoc.querySelector('.printable-area');
        if (target) {
          (target as HTMLElement).style.backgroundColor = '#ffffff';
          (target as HTMLElement).style.color = '#240C0B';
          (target as HTMLElement).style.boxShadow = 'none';
          (target as HTMLElement).style.margin = '0 auto';
        }
      }
    });

    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/png', 0.98);
    });
  } catch (err) {
    console.error('Failed to render invoice image canvas:', err);
    return null;
  }
}

/**
 * Directly downloads the rendered PNG image to the user's device.
 */
export async function downloadElementAsPng(element: HTMLElement, filename: string): Promise<boolean> {
  const blob = await captureElementAsPngBlob(element, 2.5);
  if (!blob) return false;

  const cleanFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = cleanFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Copies the rendered PNG image directly to the system clipboard.
 */
export async function copyElementImageToClipboard(element: HTMLElement): Promise<boolean> {
  try {
    const blob = await captureElementAsPngBlob(element, 2.5);
    if (!blob) return false;

    if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Direct image clipboard copy failed or not supported:', err);
    return false;
  }
}

/**
 * Shares the invoice image via the Web Share API (WhatsApp / AirDrop / Messages / Facebook on mobile and modern desktop).
 * Falls back gracefully to copying image to clipboard and triggering a download.
 */
export async function shareElementImage(
  element: HTMLElement,
  options: {
    title: string;
    text: string;
    filename: string;
  }
): Promise<{ success: boolean; method: 'web-share' | 'clipboard' | 'download'; error?: string }> {
  try {
    const blob = await captureElementAsPngBlob(element, 2.5);
    if (!blob) {
      return { success: false, method: 'download', error: 'Could not generate image' };
    }

    const cleanFilename = options.filename.endsWith('.png') ? options.filename : `${options.filename}.png`;
    const imageFile = new File([blob], cleanFilename, { type: 'image/png' });

    // 1. Check if Web Share API supports file sharing
    if (
      typeof navigator.canShare === 'function' &&
      navigator.canShare({ files: [imageFile] }) &&
      typeof navigator.share === 'function'
    ) {
      try {
        await navigator.share({
          files: [imageFile],
          title: options.title,
          text: options.text,
        });
        return { success: true, method: 'web-share' };
      } catch (shareErr: any) {
        if (shareErr.name === 'AbortError') {
          // User cancelled the share dialog
          return { success: true, method: 'web-share' };
        }
        console.warn('Native share threw error, falling back to copy/download:', shareErr);
      }
    }

    // 2. Fallback: Copy to clipboard if available
    let copied = false;
    try {
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        const item = new ClipboardItem({ 'image/png': blob });
        await navigator.clipboard.write([item]);
        copied = true;
      }
    } catch (clipErr) {
      console.warn('Clipboard write fallback error:', clipErr);
    }

    // 3. Fallback: Download file
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = cleanFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (copied) {
      return { success: true, method: 'clipboard' };
    }

    return { success: true, method: 'download' };
  } catch (err: any) {
    console.error('Failed to share element image:', err);
    return { success: false, method: 'download', error: err?.message || 'Share failed' };
  }
}
