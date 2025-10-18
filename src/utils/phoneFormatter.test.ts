import { formatEthiopianPhoneNumber, removeEthiopianPrefix } from './phoneFormatter';

// Test cases for formatEthiopianPhoneNumber
console.log('Testing formatEthiopianPhoneNumber function:');

// Test case 1: Already formatted +251 number
const test1 = formatEthiopianPhoneNumber('+251911647424');
console.log('Test 1 - Input: +251911647424, Output:', test1, 'Expected: +251911647424', 'Result:', test1 === '+251911647424' ? 'PASS' : 'FAIL');

// Test case 2: Number starting with 251
const test2 = formatEthiopianPhoneNumber('251911647424');
console.log('Test 2 - Input: 251911647424, Output:', test2, 'Expected: +251911647424', 'Result:', test2 === '+251911647424' ? 'PASS' : 'FAIL');

// Test case 3: Number starting with 0
const test3 = formatEthiopianPhoneNumber('0911647424');
console.log('Test 3 - Input: 0911647424, Output:', test3, 'Expected: +251911647424', 'Result:', test3 === '+251911647424' ? 'PASS' : 'FAIL');

// Test case 4: 9-digit number starting with 9
const test4 = formatEthiopianPhoneNumber('911647424');
console.log('Test 4 - Input: 911647424, Output:', test4, 'Expected: +251911647424', 'Result:', test4 === '+251911647424' ? 'PASS' : 'FAIL');

// Test case 5: Number with spaces and dashes
const test5 = formatEthiopianPhoneNumber('091 164 7424');
console.log('Test 5 - Input: 091 164 7424, Output:', test5, 'Expected: +251911647424', 'Result:', test5 === '+251911647424' ? 'PASS' : 'FAIL');

// Test cases for removeEthiopianPrefix
console.log('\nTesting removeEthiopianPrefix function:');

// Test case 1: Number with +251 prefix
const test6 = removeEthiopianPrefix('+251911647424');
console.log('Test 6 - Input: +251911647424, Output:', test6, 'Expected: 911647424', 'Result:', test6 === '911647424' ? 'PASS' : 'FAIL');

// Test case 2: Number with 251 prefix
const test7 = removeEthiopianPrefix('251911647424');
console.log('Test 7 - Input: 251911647424, Output:', test7, 'Expected: 911647424', 'Result:', test7 === '911647424' ? 'PASS' : 'FAIL');

// Test case 3: Number without prefix
const test8 = removeEthiopianPrefix('911647424');
console.log('Test 8 - Input: 911647424, Output:', test8, 'Expected: 911647424', 'Result:', test8 === '911647424' ? 'PASS' : 'FAIL');