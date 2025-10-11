// Test script to debug profile image upload issue
import { apiClient } from './lib/api';

async function testImageUpload() {
    try {
        console.log('Starting image upload test...');

        // Create a simple test file
        const testFile = new File(['test content'], 'test-image.png', { type: 'image/png' });

        console.log('Uploading test image...');
        const uploadResponse = await apiClient.uploadProfileImage(testFile);
        console.log('Upload response:', uploadResponse);

        console.log('Fetching profile after upload...');
        const profileResponse = await apiClient.getVolunteerProfile();
        console.log('Profile response after upload:', profileResponse);

        console.log('Test completed.');
    } catch (error) {
        console.error('Test failed:', error);
    }
}

// Run the test
testImageUpload();