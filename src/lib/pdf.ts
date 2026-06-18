import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { logIntegrity } from './integrity';

/**
 * Render an HTML string to a PDF file and return its local uri.
 * expo-print handles pagination from the HTML/CSS.
 */
export async function htmlToPdf(html: string): Promise<string> {
  const { uri } = await Print.printToFileAsync({ html, base64: false });
  return uri;
}

/** Render + open the system share sheet so the user can save / send the PDF. */
export async function exportPdf(html: string): Promise<void> {
  const uri = await htmlToPdf(html);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  }
}

/**
 * Export a report and write an `exported` integrity event for each entity it
 * covers, so the chain-of-custody records that a copy left the device.
 */
export async function exportPdfWithAudit(
  html: string,
  audit: { entityType: 'incident' | 'evidence' | 'report' | 'witness'; entityId: string }[],
): Promise<void> {
  await exportPdf(html);
  await Promise.all(
    audit.map((a) =>
      logIntegrity({ entityType: a.entityType, entityId: a.entityId, action: 'exported' }),
    ),
  );
}
