/**
 * Test script for certificate download functionality
 * This script demonstrates how to use the downloadCertificate method
 */

import { CertificateData } from './lib/api';
import { downloadCertificate } from './lib/certificate-generator';

// Example usage of the downloadCertificate method
export const testCertificateDownload = async () => {
    try {
        // Create sample certificate data
        const certificateData: CertificateData = {
            volunteerName: "John Doe",
            eventName: "Community Cleanup Event",
            eventDate: "2023-06-15",
            hoursContributed: 4,
            location: "Addis Ababa, Ethiopia",
            organizerName: "Plogging Ethiopia",
            certificateId: "PE-12345",
            issueDate: "2023-06-15",
            badgeType: "Environmental Champion",
            totalHours: 12,
            rank: 1
        };

        // Download the certificate
        downloadCertificate(certificateData, "test-certificate.pdf");

        console.log("Certificate download initiated successfully");
    } catch (error) {
        console.error("Error downloading certificate:", error);
    }
};

// Example usage with certificate ID
export const testCertificateDownloadById = async (certificateId: number) => {
    try {
        // In a real application, you would fetch the certificate data from the API
        // For this test, we'll use sample data

        const certificateData: CertificateData = {
            volunteerName: "Jane Smith",
            eventName: "Beach Cleanup",
            eventDate: "2023-07-20",
            hoursContributed: 6,
            location: "Addis Ababa, Ethiopia",
            organizerName: "Plogging Ethiopia",
            certificateId: `PE-${certificateId}`,
            issueDate: "2023-07-20",
            badgeType: "Ocean Guardian",
            totalHours: 18,
            rank: 2
        };

        // Download the certificate
        downloadCertificate(certificateData, `certificate-${certificateId}.pdf`);

        console.log(`Certificate ${certificateId} download initiated successfully`);
    } catch (error) {
        console.error(`Error downloading certificate ${certificateId}:`, error);
    }
};

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
    // Test the download functionality
    testCertificateDownload();

    // Test with a specific certificate ID
    testCertificateDownloadById(12345);
}