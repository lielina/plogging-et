#!/usr/bin/env node

/**
 * Script to generate certificates for all volunteers
 * This demonstrates the batch certificate generation process
 */

import fs from 'fs';
import path from 'path';

// Mock data for demonstration
const volunteers = [
  {
    volunteer_id: 1,
    first_name: 'Abebe',
    last_name: 'Kebede',
    email: 'abebe.kebede@example.com',
    total_hours_contributed: 150,
    phone_number: '+251911234567'
  },
  {
    volunteer_id: 2,
    first_name: 'Fatima',
    last_name: 'Ahmed',
    email: 'fatima.ahmed@example.com',
    total_hours_contributed: 75,
    phone_number: '+251922345678'
  },
  {
    volunteer_id: 3,
    first_name: 'Tadesse',
    last_name: 'Mengistu',
    email: 'tadesse.mengistu@example.com',
    total_hours_contributed: 45,
    phone_number: '+251933456789'
  },
  {
    volunteer_id: 4,
    first_name: 'Amina',
    last_name: 'Hassan',
    email: 'amina.hassan@example.com',
    total_hours_contributed: 25,
    phone_number: '+251944567890'
  },
  {
    volunteer_id: 5,
    first_name: 'Yohannes',
    last_name: 'Tesfaye',
    email: 'yohannes.tesfaye@example.com',
    total_hours_contributed: 200,
    phone_number: '+251955678901'
  }
];

const events = [
  {
    event_id: 1,
    event_name: 'Addis Ababa Cleanup Drive',
    event_date: '2024-01-15',
    location_name: 'Addis Ababa, Ethiopia',
    estimated_duration_hours: 4
  },
  {
    event_id: 2,
    event_name: 'Tree Planting Initiative',
    event_date: '2024-02-20',
    location_name: 'Addis Ababa, Ethiopia',
    estimated_duration_hours: 6
  }
];

// Certificate types and their configurations
const certificateTypes = {
  participation: {
    name: 'Participation Certificate',
    description: 'For event participation',
    template: 'standard-participation',
    requiresEvent: true
  },
  achievement: {
    name: 'Achievement Certificate',
    description: 'For reaching milestones',
    template: 'achievement-badge',
    requiresEvent: false
  },
  leadership: {
    name: 'Leadership Certificate',
    description: 'For leadership roles',
    template: 'leadership-recognition',
    requiresEvent: false
  },
  milestone: {
    name: 'Milestone Certificate',
    description: 'For specific hour milestones',
    template: 'milestone-celebration',
    requiresEvent: false
  }
};

// Badge levels based on hours
function getBadgeLevel(hours) {
  if (hours >= 100) return 'Environmental Champion';
  if (hours >= 50) return 'Green Warrior';
  if (hours >= 25) return 'Eco Hero';
  return 'Community Helper';
}

// Generate certificate data for a volunteer
function generateCertificateData(volunteer, certificateType, event = null) {
  const certificateId = `PE-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`.toUpperCase();
  const issueDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return {
    volunteerName: `${volunteer.first_name} ${volunteer.last_name}`,
    eventName: event ? event.event_name : 'Community Service',
    eventDate: event ? event.event_date : issueDate,
    hoursContributed: event ? event.estimated_duration_hours : volunteer.total_hours_contributed,
    location: event ? event.location_name : 'Addis Ababa, Ethiopia',
    organizerName: 'Plogging Ethiopia Team',
    certificateId: certificateId,
    issueDate: issueDate,
    badgeType: getBadgeLevel(volunteer.total_hours_contributed),
    totalHours: volunteer.total_hours_contributed,
    rank: 1
  };
}

// Simulate certificate generation process
async function generateCertificatesForAllVolunteers() {
  console.log('🚀 Starting batch certificate generation for all volunteers...\n');

  const results = {
    total: volunteers.length,
    completed: 0,
    failed: 0,
    certificates: []
  };

  for (let i = 0; i < volunteers.length; i++) {
    const volunteer = volunteers[i];
    console.log(`📋 Processing volunteer ${i + 1}/${volunteers.length}: ${volunteer.first_name} ${volunteer.last_name}`);

    try {
      // Generate different types of certificates based on volunteer's hours
      const certificates = [];

      // Always generate an achievement certificate
      const achievementData = generateCertificateData(volunteer, 'achievement');
      certificates.push({
        type: 'achievement',
        data: achievementData,
        filename: `certificate-${volunteer.first_name}-${volunteer.last_name}-achievement.pdf`
      });

      // Generate milestone certificate if they have significant hours
      if (volunteer.total_hours_contributed >= 25) {
        const milestoneData = generateCertificateData(volunteer, 'milestone');
        certificates.push({
          type: 'milestone',
          data: milestoneData,
          filename: `certificate-${volunteer.first_name}-${volunteer.last_name}-milestone.pdf`
        });
      }

      // Generate leadership certificate for high contributors
      if (volunteer.total_hours_contributed >= 50) {
        const leadershipData = generateCertificateData(volunteer, 'leadership');
        certificates.push({
          type: 'leadership',
          data: leadershipData,
          filename: `certificate-${volunteer.first_name}-${volunteer.last_name}-leadership.pdf`
        });
      }

      // Generate participation certificates for recent events
      events.forEach(event => {
        const participationData = generateCertificateData(volunteer, 'participation', event);
        certificates.push({
          type: 'participation',
          data: participationData,
          filename: `certificate-${volunteer.first_name}-${volunteer.last_name}-participation-${event.event_id}.pdf`
        });
      });

      results.certificates.push({
        volunteer: volunteer,
        certificates: certificates
      });

      results.completed++;
      console.log(`✅ Generated ${certificates.length} certificates for ${volunteer.first_name} ${volunteer.last_name}`);
      console.log(`   - Badge Level: ${getBadgeLevel(volunteer.total_hours_contributed)}`);
      console.log(`   - Total Hours: ${volunteer.total_hours_contributed}`);
      console.log(`   - Certificate Types: ${certificates.map(c => c.type).join(', ')}\n`);

    } catch (error) {
      results.failed++;
      console.log(`❌ Failed to generate certificates for ${volunteer.first_name} ${volunteer.last_name}: ${error.message}\n`);
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  return results;
}

// Generate summary report
function generateSummaryReport(results) {
  console.log('📊 BATCH CERTIFICATE GENERATION SUMMARY');
  console.log('=====================================\n');

  console.log(`Total Volunteers Processed: ${results.total}`);
  console.log(`Successfully Completed: ${results.completed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.completed / results.total) * 100).toFixed(1)}%\n`);

  const totalCertificates = results.certificates.reduce((sum, item) => sum + item.certificates.length, 0);
  console.log(`Total Certificates Generated: ${totalCertificates}\n`);

  console.log('📋 CERTIFICATE BREAKDOWN BY TYPE:');
  const typeCounts = {};
  results.certificates.forEach(item => {
    item.certificates.forEach(cert => {
      typeCounts[cert.type] = (typeCounts[cert.type] || 0) + 1;
    });
  });

  Object.entries(typeCounts).forEach(([type, count]) => {
    console.log(`   ${type.charAt(0).toUpperCase() + type.slice(1)}: ${count}`);
  });

  console.log('\n🏆 BADGE LEVEL DISTRIBUTION:');
  const badgeCounts = {};
  results.certificates.forEach(item => {
    const badge = getBadgeLevel(item.volunteer.total_hours_contributed);
    badgeCounts[badge] = (badgeCounts[badge] || 0) + 1;
  });

  Object.entries(badgeCounts).forEach(([badge, count]) => {
    console.log(`   ${badge}: ${count} volunteers`);
  });

  console.log('\n📁 CERTIFICATE FILES TO BE GENERATED:');
  results.certificates.forEach(item => {
    console.log(`\n   ${item.volunteer.first_name} ${item.volunteer.last_name}:`);
    item.certificates.forEach(cert => {
      console.log(`     - ${cert.filename}`);
    });
  });
}

// Main execution
async function main() {
  try {
    console.log('🌿 PLOGGING ETHIOPIA - BATCH CERTIFICATE GENERATOR');
    console.log('================================================\n');

    const results = await generateCertificatesForAllVolunteers();
    generateSummaryReport(results);

    console.log('\n🎉 Batch certificate generation completed!');
    console.log('\nNext steps:');
    console.log('1. Use the web interface to generate actual PDF certificates');
    console.log('2. Download and distribute certificates to volunteers');
    console.log('3. Store certificates securely for future reference');

  } catch (error) {
    console.error('❌ Error during batch certificate generation:', error);
    process.exit(1);
  }
}

// Run the script
main();

export {
  generateCertificatesForAllVolunteers,
  generateCertificateData,
  getBadgeLevel
}; 