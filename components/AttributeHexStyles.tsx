import React from 'react';

export const GlobalStyles = () => (
  <style>{`
    /* Print Styles */
    @media print {
      @page {
        margin: 0;
      }
      body {
        background: white;
      }
      /* Hide non-printable elements */
      header, button, .no-print {
        display: none !important;
      }
      /* Ensure card prints well */
      #preview-card {
        box-shadow: none !important;
        border: 2px solid #000 !important;
        page-break-inside: avoid;
      }
    }
  `}</style>
);
