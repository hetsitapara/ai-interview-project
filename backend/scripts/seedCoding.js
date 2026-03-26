const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CodingQuestion = require('../models/CodingQuestion');

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sdp-project');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const questions = [
    {
        title: "Two Sum",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have **exactly one solution**, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        difficulty: "Easy",
        inputFormat: "First line contains n (size of array). Second line contains n integers. Third line contains target.",
        outputFormat: "Print the two indices separated by space.",
        constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
        examples: [
            {
                input: "nums = [2,7,11,15], target = 9",
                output: "0 1",
                explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
            }
        ],
        testCases: [
            { input: "2 7 11 15\n9", expectedOutput: "0 1", isPublic: true },
            { input: "3 2 4\n6", expectedOutput: "1 2", isPublic: true },
            { input: "3 3\n6", expectedOutput: "0 1", isPublic: false },
        ],
        starterCode: {
            javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your code here
  // Note: For this platform, read input from global 'input' variable string if needed, 
  // or simply implement the function.
  // WAIT: We will standardize on Function-based or Stdin-based?
  // Let's go with Function-based wrapper for easier testing, 
  // BUT executing via child_process usually easiest with Stdin/Stdout.
  // Let's assume STDIN/STDOUT for universality across languages.
  
  // Implementation for reading stdin in Node.js:
  const fs = require('fs');
  const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
  const nums = input[0].trim().split(' ').map(Number);
  const target = parseInt(input[1]);

  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
      const complement = target - nums[i];
      if (map.has(complement)) {
          console.log(map.get(complement), i);
          return;
      }
      map.set(nums[i], i);
  }
}`,
            python: `import sys

def solve():
    # Read all input from stdin
    input_data = sys.stdin.read().split()
    if not input_data:
        return
        
    # Parse input based on the problem format
    # Example for Two Sum where input is "2 7 11 15\n9"
    # This parsing is tricky if not strictly defined.
    # Let's simplify: All inputs will be passed as arguments or simple lines.
    
    # Let's assume the input is just the numbers flatly
    # For robust parsing, we need strict specific formats.
    
    # For this Two Sum seed, let's stick to the specific format defined:
    # Line 1: nums array elements space separated
    # Line 2: target
    
    lines = sys.stdin.read().strip().split('\\n')
    nums = list(map(int, lines[0].split()))
    target = int(lines[1])
    
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            print(f"{seen[complement]} {i}")
            return
        seen[num] = i

if __name__ == "__main__":
    solve()`
        }
    },
    {
        title: "Palindrome Number",
        description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.",
        difficulty: "Easy",
        inputFormat: "A single integer x.",
        outputFormat: "true or false",
        constraints: "-2^31 <= x <= 2^31 - 1",
        examples: [
            {
                input: "x = 121",
                output: "true",
                explanation: "121 reads as 121 from left to right and from right to left."
            },
            {
                input: "x = -121",
                output: "false",
                explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome."
            }
        ],
        testCases: [
            { input: "121", expectedOutput: "true", isPublic: true },
            { input: "-121", expectedOutput: "false", isPublic: true },
            { input: "10", expectedOutput: "false", isPublic: false },
            { input: "12321", expectedOutput: "true", isPublic: false }
        ],
        starterCode: {
            javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
const x = input;

function isPalindrome(str) {
    const reversed = str.split('').reverse().join('');
    return str === reversed ? "true" : "false";
}

console.log(isPalindrome(x));`,
            python: `import sys

def solve():
    x = sys.stdin.read().strip()
    if x == x[::-1]:
        print("true")
    else:
        print("false")

if __name__ == "__main__":
    solve()`
        }
    }
];

const seedDB = async () => {
    await connectDB();
    await CodingQuestion.deleteMany({});
    await CodingQuestion.insertMany(questions);
    console.log("Coding Questions Seeded!");
    process.exit();
};

seedDB();
