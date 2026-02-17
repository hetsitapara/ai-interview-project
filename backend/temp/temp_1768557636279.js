// Read input from stdin
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split('\n');

const nums = input[0].split(',').map(Number);
const target = Number(input[1]);

function twoSum(nums, target) {
    // Write your code here
    
}

// Print output to stdout
console.log(twoSum(nums, target));