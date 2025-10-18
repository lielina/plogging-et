/**
 * Test script for certificate download functionality
 * This script demonstrates how to use the downloadCertificate method
 */

import { apiClient } from './lib/api';

async function testCertificateDownload() {
  try {
    // Example usage of the downloadCertificate method
    const certificateId = 1; // Replace with actual certificate ID
    
    console.log('Attempting to download certificate with ID:', certificateId);
    
    // Download the certificate
    const blob = await apiClient.downloadCertificate(certificateId);
    
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${certificateId}.pdf`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('Certificate downloaded successfully');
  } catch (error) {
    console.error('Error downloading certificate:', error);
  }
}

// Example usage in a React component (this would be in a .tsx file in practice)
function CertificateDownloadButton(certificateId: number) {
  const handleDownload = async () => {
    try {
      const blob = await apiClient.downloadCertificate(certificateId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificate-${certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Handle error (show notification, etc.)
    }
  };

  // In a real React component, you would return JSX like:
  // return (
  //   <button onClick={handleDownload}>
  //     Download Certificate
  //   </button>
  // );
  
  // For this .ts file, we'll just return the function that would be called
  return handleDownload;
}

export { testCertificateDownload, CertificateDownloadButton };