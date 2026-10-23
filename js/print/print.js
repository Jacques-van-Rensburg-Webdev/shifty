// Opens the browser's print dialog with only the given summary visible
// (print CSS hides the app). The page title is used as the suggested PDF file name.

let pendingCleanup = null; // set while a summary is waiting for its print dialog to close

export function printSummary(summary, fileName) {
  // Pressed again before the last dialog closed (or it never opened): tidy that one up first.
  pendingCleanup?.();

  const previousTitle = document.title;
  const cleanup = () => {
    window.removeEventListener('afterprint', cleanup);
    summary.remove();
    document.title = previousTitle;
    pendingCleanup = null;
  };

  document.body.append(summary);
  document.title = fileName;
  pendingCleanup = cleanup;
  window.addEventListener('afterprint', cleanup);
  window.print();
}
