const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CodingQuestion = require('./models/CodingQuestion');

dotenv.config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sdp-project';

const questions = [
    // 1. Array / Hash Table
    {
        title: "Two Sum",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        difficulty: "Easy",
        tags: ["Array", "Hash Table"],
        inputFormat: "First line: comma-separated integers (nums)\nSecond line: integer (target)",
        outputFormat: "Comma-separated indices (e.g., 0,1)",
        constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
        examples: [
            { input: "2,7,11,15\n9", output: "[0, 1]", explanation: "nums[0] + nums[1] == 9, so we return [0, 1]." },
            { input: "3,2,4\n6", output: "[1, 2]", explanation: "nums[1] + nums[2] == 6." }
        ],
        testCases: [
            { input: "2,7,11,15\n9", expectedOutput: "[0, 1]", isPublic: true },
            { input: "3,2,4\n6", expectedOutput: "[1, 2]", isPublic: true }
        ],
        starterCode: {
            javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nconst nums = input[0].split(',').map(Number);\nconst target = Number(input[1]);\n\nfunction twoSum(nums, target) {\n    // Write your code here\n}\n\nconsole.log(twoSum(nums, target));`
        }
    },
    // 2. Math
    {
        title: "Palindrome Number",
        description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.",
        difficulty: "Easy",
        tags: ["Math"],
        inputFormat: "A single integer x",
        outputFormat: "true or false",
        constraints: "-2^31 <= x <= 2^31 - 1",
        examples: [
            { input: "121", output: "true", explanation: "121 reads as 121 from left to right and from right to left." },
            { input: "-121", output: "false", explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome." }
        ],
        testCases: [
            { input: "121", expectedOutput: "true", isPublic: true },
            { input: "-121", expectedOutput: "false", isPublic: true }
        ],
        starterCode: {
            javascript: `const fs = require('fs');\nconst x = Number(fs.readFileSync(0, 'utf-8').trim());\n\nfunction isPalindrome(x) {\n    // Write your code here\n}\n\nconsole.log(isPalindrome(x));`
        }
    },
    // 3. String
    {
        title: "Reverse String",
        description: "Write a function that reverses a string. The input string is given as an array of characters.",
        difficulty: "Easy",
        tags: ["String"],
        inputFormat: "A single string s",
        outputFormat: "Reversed string",
        constraints: "1 <= s.length <= 100",
        examples: [
            { input: "hello", output: "olleh" }
        ],
        testCases: [
            { input: "hello", expectedOutput: "olleh", isPublic: true }
        ],
        starterCode: {
            javascript: `const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf-8').trim();\n\nfunction reverseString(s) {\n    return s.split('').reverse().join('');\n}\n\nconsole.log(reverseString(s));`
        }
    },
    // 4. Graph / Tree
    {
        title: "Find Center of Star Graph",
        description: "There is an undirected star graph consisting of `n` nodes labeled from `1` to `n`. A star graph is a graph where there is one center node and exactly `n - 1` edges that connect the center node with every other node.\n\nYou are given a 2D integer array `edges` where each `edges[i] = [ui, vi]` indicates that there is an edge between the nodes `ui` and `vi`. Return the center of the given star graph.",
        difficulty: "Easy",
        tags: ["Graph"],
        inputFormat: "JSON string representing 2D array of edges (e.g., [[1,2],[2,3],[4,2]])",
        outputFormat: "An integer representing the center node",
        constraints: "3 <= n <= 10^5",
        examples: [
            { input: "[[1,2],[2,3],[4,2]]", output: "2", explanation: "Node 2 is connected to 1, 3, and 4." }
        ],
        testCases: [
            { input: "[[1,2],[2,3],[4,2]]", expectedOutput: "2", isPublic: true }
        ],
        starterCode: {
            javascript: `const fs = require('fs');\nconst edges = JSON.parse(fs.readFileSync(0, 'utf-8').trim());\n\nfunction findCenter(edges) {\n    // Write your code here\n}\n\nconsole.log(findCenter(edges));`
        }
    },
    // 5. Stack
    {
        title: "Valid Parentheses",
        description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.",
        difficulty: "Easy",
        tags: ["Stack", "String"],
        inputFormat: "A single string s",
        outputFormat: "true or false",
        constraints: "1 <= s.length <= 10^4",
        examples: [
            { input: "()", output: "true" },
            { input: "()[]{}", output: "true" },
            { input: "(]", output: "false" }
        ],
        testCases: [
            { input: "()", expectedOutput: "true", isPublic: true },
            { input: "(]", expectedOutput: "false", isPublic: true }
        ],
        starterCode: {
            javascript: `const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf-8').trim();\n\nfunction isValid(s) {\n    // Write your code here\n}\n\nconsole.log(isValid(s));`
        }
    },
    // 6. DP
    {
        title: "Climbing Stairs",
        description: "You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        difficulty: "Easy",
        tags: ["DP", "Memoization"],
        inputFormat: "Integer n",
        outputFormat: "Integer (count of ways)",
        constraints: "1 <= n <= 45",
        examples: [
            { input: "2", output: "2", explanation: "1 step + 1 step OR 2 steps" },
            { input: "3", output: "3", explanation: "1+1+1 OR 1+2 OR 2+1" }
        ],
        testCases: [
            { input: "2", expectedOutput: "2", isPublic: true },
            { input: "3", expectedOutput: "3", isPublic: true }
        ],
        starterCode: {
            javascript: `const fs = require('fs');\nconst n = Number(fs.readFileSync(0, 'utf-8').trim());\n\nfunction climbStairs(n) {\n    // Write your code here\n}\n\nconsole.log(climbStairs(n));`
        }
    },
    // 7. Graph
    {
        title: "Find the Town Judge",
        description: "In a town, there are `n` people labeled from `1` to `n`. There is a rumor that one of these people is secretly the town judge.\n\nIf the town judge exists, then:\n1. The town judge trusts nobody.\n2. Everybody (except the town judge) trusts the town judge.\n3. There is exactly one person that satisfies properties 1 and 2.\n\nYou are given an array `trust` where `trust[i] = [a, b]` representing that the person labeled `a` trusts the person labeled `b`.",
        difficulty: "Easy",
        tags: ["Graph"],
        inputFormat: "First line: n\nSecond line: JSON string of trust array",
        outputFormat: "ID of the judge or -1",
        constraints: "1 <= n <= 1000",
        examples: [
            { input: "2\n[[1,2]]", output: "2" },
            { input: "3\n[[1,3],[2,3]]", output: "3" }
        ],
        testCases: [
            { input: "2\n[[1,2]]", expectedOutput: "2", isPublic: true },
            { input: "3\n[[1,3],[2,3]]", expectedOutput: "3", isPublic: true }
        ],
        starterCode: {
            javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nconst n = Number(input[0]);\nconst trust = JSON.parse(input[1]);\n\nfunction findJudge(n, trust) {\n    // Write your code here\n}\n\nconsole.log(findJudge(n, trust));`
        }
    },
    // 8. Sorting / Array
    {
        title: "Merge Sorted Array",
        description: "You are given two integer arrays `nums1` and `nums2`, sorted in non-decreasing order. Merge `nums2` into `nums1` as one sorted array.",
        difficulty: "Easy",
        tags: ["Array", "Sorting"],
        inputFormat: "Line 1: nums1 (comma separated)\nLine 2: nums2 (comma separated)",
        outputFormat: "Merged sorted array (comma separated)",
        constraints: "nums1.length, nums2.length >= 0",
        examples: [
            { input: "1,2,3\n2,5,6", output: "1,2,2,3,5,6" }
        ],
        testCases: [
            { input: "1,2,3\n2,5,6", expectedOutput: "1,2,2,3,5,6", isPublic: true }
        ],
        starterCode: {
            javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nconst nums1 = input[0] ? input[0].split(',').map(Number) : [];\nconst nums2 = input[1] ? input[1].split(',').map(Number) : [];\n\nfunction merge(nums1, nums2) {\n    return [...nums1, ...nums2].sort((a,b) => a-b);\n}\n\nconsole.log(merge(nums1, nums2).join(','));`
        }
    },
    // 9. Matrix / Graph
    {
        title: "Flood Fill",
        description: "An image is represented by an `m x n` integer grid `image` where `image[i][j]` represents the pixel value of the image.\n\nYou are also given three integers `sr`, `sc`, and `newColor`. You should perform a flood fill on the image starting from the pixel `image[sr][sc]`.\n\nTo perform a flood fill, consider the starting pixel, plus any pixels connected 4-directionally to the starting pixel of the same color as the starting pixel, plus any pixels connected 4-directionally to those pixels (also with the same color), and so on. Replace the color of all of the aforementioned pixels with `newColor`.",
        difficulty: "Easy",
        tags: ["Graph", "Matrix", "DFS/BFS"],
        inputFormat: "Line 1: JSON grid (image)\nLine 2: sr\nLine 3: sc\nLine 4: newColor",
        outputFormat: "JSON grid",
        constraints: "m == image.length, n == image[i].length",
        examples: [
            { input: "[[1,1,1],[1,1,0],[1,0,1]]\n1\n1\n2", output: "[[2,2,2],[2,2,0],[2,0,1]]", explanation: "From the center of the image with position (1, 1), all pixels connected by a path of the same color as the starting pixel (i.e., the blue pixels) are colored with the new color." }
        ],
        testCases: [
            { input: "[[1,1,1],[1,1,0],[1,0,1]]\n1\n1\n2", expectedOutput: "[[2,2,2],[2,2,0],[2,0,1]]", isPublic: true }
        ],
        starterCode: {
            javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nconst image = JSON.parse(input[0]);\nconst sr = Number(input[1]);\nconst sc = Number(input[2]);\nconst color = Number(input[3]);\n\nfunction floodFill(image, sr, sc, newColor) {\n    // Write code\n}\n\nconsole.log(JSON.stringify(floodFill(image, sr, sc, color)));`
        }
    },
    // 10. Bits
    {
        title: "Single Number",
        description: "Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one.\n\nYou must implement a solution with a linear runtime complexity and use only constant extra space.",
        difficulty: "Easy",
        tags: ["Bit Manipulation"],
        inputFormat: "Comma separated nums",
        outputFormat: "Single integer",
        constraints: "1 <= nums.length <= 3 * 10^4",
        examples: [
            { input: "2,2,1", output: "1" },
            { input: "4,1,2,1,2", output: "4" }
        ],
        testCases: [
            { input: "2,2,1", expectedOutput: "1", isPublic: true },
            { input: "4,1,2,1,2", expectedOutput: "4", isPublic: true }
        ],
        starterCode: {
            javascript: `const fs = require('fs');\nconst nums = fs.readFileSync(0, 'utf-8').trim().split(',').map(Number);\n\nfunction singleNumber(nums) {\n    // Write code\n}\n\nconsole.log(singleNumber(nums));`
        }
    },
    // 11. Array
    {
        title: "Maximum Subarray",
        description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
        difficulty: "Medium",
        tags: ["Array", "DP"],
        inputFormat: "Comma separated nums",
        outputFormat: "Integer sum",
        constraints: "-10^4 <= nums[i] <= 10^4",
        examples: [
            { input: "-2,1,-3,4,-1,2,1,-5,4", output: "6", explanation: "[4,-1,2,1] has the largest sum = 6." }
        ],
        testCases: [
            { input: "-2,1,-3,4,-1,2,1,-5,4", expectedOutput: "6", isPublic: true }
        ],
        starterCode: {
            javascript: `const fs = require('fs');\nconst nums = fs.readFileSync(0, 'utf-8').trim().split(',').map(Number);\n\nfunction maxSubArray(nums) {\n    // Write your code here\n}\n\nconsole.log(maxSubArray(nums));`
        }
    },
    // 12. String
    {
        title: "Valid Anagram",
        description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
        difficulty: "Easy",
        tags: ["String", "Hash Table"],
        inputFormat: "Line 1: s\nLine 2: t",
        outputFormat: "true or false",
        constraints: "1 <= s.length, t.length <= 5 * 10^4",
        examples: [
            { input: "anagram\nnagaram", output: "true" },
            { input: "rat\ncar", output: "false" }
        ],
        testCases: [
            { input: "anagram\nnagaram", expectedOutput: "true", isPublic: true },
            { input: "rat\ncar", expectedOutput: "false", isPublic: true }
        ],
        starterCode: {
            javascript: `const fs = require('fs');\nconst [s, t] = fs.readFileSync(0, 'utf-8').trim().split('\\n');\n\nfunction isAnagram(s, t) {\n    // Write code\n}\n\nconsole.log(isAnagram(s, t));`
        }
    },
    // 13. Math
    {
        title: "Fizz Buzz",
        description: "Given an integer `n`, return a string array `answer` (1-indexed) where `answer[i] == \"FizzBuzz\"` if i is divisible by 3 and 5, `\"Fizz\"` if by 3, `\"Buzz\"` if by 5, and `i` otherwise.",
        difficulty: "Easy",
        tags: ["Math"],
        inputFormat: "Integer n",
        outputFormat: "Comma separated strings",
        constraints: "1 <= n <= 10^4",
        examples: [
            { input: "3", output: "1,2,Fizz" },
            { input: "5", output: "1,2,Fizz,4,Buzz" }
        ],
        testCases: [
            { input: "3", expectedOutput: "1,2,Fizz", isPublic: true },
            { input: "5", expectedOutput: "1,2,Fizz,4,Buzz", isPublic: true }
        ],
        starterCode: { javascript: `const fs = require('fs');\nconst n = Number(fs.readFileSync(0, 'utf-8').trim());\n\nfunction fizzBuzz(n) {\n    // Write code\n}\n\nconsole.log(fizzBuzz(n).join(','));` }
    },
    // 14. Binary Search
    {
        title: "Binary Search",
        description: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.",
        difficulty: "Easy",
        tags: ["Binary Search"],
        inputFormat: "Line 1: comma separated nums\nLine 2: target",
        outputFormat: "Target index or -1",
        constraints: "1 <= nums.length <= 10^4",
        examples: [
            { input: "-1,0,3,5,9,12\n9", output: "4", explanation: "9 exists in nums and its index is 4" }
        ],
        testCases: [
            { input: "-1,0,3,5,9,12\n9", expectedOutput: "4", isPublic: true }
        ],
        starterCode: { javascript: `const fs = require('fs');\nconst lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nconst nums = lines[0].split(',').map(Number);\nconst target = Number(lines[1]);\n// Write code` }
    },
    // 15. Array
    {
        title: "Missing Number",
        description: "Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.",
        difficulty: "Easy",
        tags: ["Array", "Math"],
        inputFormat: "Comma separated nums",
        outputFormat: "Missing Number",
        constraints: "n == nums.length, 1 <= n <= 10^4",
        examples: [
            { input: "3,0,1", output: "2", explanation: "n = 3 since there are 3 numbers, so all numbers are in the range [0,3]. 2 is the missing number in the range since it does not appear in nums." },
            { input: "0,1", output: "2", explanation: "n = 2 since there are 2 numbers, so all numbers are in the range [0,2]. 2 is the missing number." }
        ],
        testCases: [
            { input: "3,0,1", expectedOutput: "2", isPublic: true },
            { input: "0,1", expectedOutput: "2", isPublic: true }
        ],
        starterCode: { javascript: `const fs = require('fs');\nconst nums = fs.readFileSync(0, 'utf-8').trim().split(',').map(Number);\n// Write code` }
    },
    // New 10 Questions
    {
        title: "Valid Perfect Square",
        description: "Given a positive integer `num`, return `true` if `num` is a perfect square or `false` otherwise.\n\nA perfect square is an integer that is the square of an integer. In other words, it is the product of some integer with itself.",
        difficulty: "Easy",
        tags: ["Math"],
        inputFormat: "Single Integer num",
        outputFormat: "true or false",
        constraints: "1 <= num <= 2^31 - 1",
        examples: [
            { input: "16", output: "true", explanation: "4 * 4 = 16" },
            { input: "14", output: "false", explanation: "No integer squares to 14" }
        ],
        testCases: [{ input: "16", expectedOutput: "true", isPublic: true }, { input: "14", expectedOutput: "false", isPublic: true }],
        starterCode: { javascript: `const fs = require('fs');\nconst num = Number(fs.readFileSync(0, 'utf-8'));\n// Write code` }
    },
    {
        title: "Move Zeroes",
        description: "Given an integer array `nums`, move all `0`'s to the end of it while maintaining the relative order of the non-zero elements.\n\nNote that you must do this in-place without making a copy of the array.",
        difficulty: "Easy",
        tags: ["Array"],
        inputFormat: "Comma separated nums",
        outputFormat: "Comma separated nums (modified)",
        constraints: "1 <= nums.length <= 10^4",
        examples: [
            { input: "0,1,0,3,12", output: "1,3,12,0,0" }
        ],
        testCases: [{ input: "0,1,0,3,12", expectedOutput: "1,3,12,0,0", isPublic: true }],
        starterCode: { javascript: `const fs = require('fs');\nconst nums = fs.readFileSync(0, 'utf-8').trim().split(',').map(Number);\n// Write code\nconsole.log(nums.join(','));` }
    },
    {
        title: "Intersection of Two Arrays",
        description: "Given two integer arrays `nums1` and `nums2`, return an array of their intersection. Each element in the result must be unique and you may return the result in any order.",
        difficulty: "Easy",
        tags: ["Array", "Hash Table"],
        inputFormat: "Line 1: nums1\nLine 2: nums2",
        outputFormat: "Intersection array",
        constraints: "1 <= nums1.length, nums2.length <= 1000",
        examples: [
            { input: "1,2,2,1\n2,2", output: "2" },
            { input: "4,9,5\n9,4,9,8,4", output: "4,9" }
        ],
        testCases: [{ input: "1,2,2,1\n2,2", expectedOutput: "2", isPublic: true }],
        starterCode: { javascript: `const fs = require('fs');\nconst inp = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nconst nums1 = inp[0].split(',').map(Number);\nconst nums2 = inp[1].split(',').map(Number);\n// Write code` }
    },
    {
        title: "Defanging an IP Address",
        description: "Given a valid (IPv4) IP `address`, return a defanged version of that IP address.\n\nA defanged IP address replaces every period \".\" with \"[.]\".",
        difficulty: "Easy",
        tags: ["String", "WebDev"],
        inputFormat: "String address",
        outputFormat: "Defanged String",
        constraints: "address is a valid IPv4 address",
        examples: [
            { input: "1.1.1.1", output: "1[.]1[.]1[.]1" },
            { input: "255.100.50.0", output: "255[.]100[.]50[.]0" }
        ],
        testCases: [{ input: "1.1.1.1", expectedOutput: "1[.]1[.]1[.]1", isPublic: true }],
        starterCode: { javascript: `const fs = require('fs');\nconst addr = fs.readFileSync(0, 'utf-8').trim();\n// Write code` }
    },
    {
        title: "Search Insert Position",
        description: "Given a sorted array of distinct integers and a target value, return the index if the target is found. If not, return the index where it would be if it were inserted in order.\n\nYou must write an algorithm with O(log n) runtime complexity.",
        difficulty: "Easy",
        tags: ["Binary Search"],
        inputFormat: "Line 1: nums\nLine 2: target",
        outputFormat: "Index integer",
        constraints: "1 <= nums.length <= 10^4",
        examples: [
            { input: "1,3,5,6\n5", output: "2" },
            { input: "1,3,5,6\n2", output: "1" }
        ],
        testCases: [{ input: "1,3,5,6\n5", expectedOutput: "2", isPublic: true }, { input: "1,3,5,6\n2", expectedOutput: "1", isPublic: true }],
        starterCode: { javascript: `const fs = require('fs');\nconst l = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nconst nums = l[0].split(',').map(Number);\nconst t = Number(l[1]);\n// Write code` }
    },
    {
        title: "Majority Element",
        description: "Given an array `nums` of size `n`, return the majority element.\n\nThe majority element is the element that appears more than `⌊n / 2⌋` times. You may assume that the majority element always exists in the array.",
        difficulty: "Easy",
        tags: ["Array"],
        inputFormat: "Comma separated nums",
        outputFormat: "Majority element",
        constraints: "n == nums.length",
        examples: [
            { input: "3,2,3", output: "3" },
            { input: "2,2,1,1,1,2,2", output: "2" }
        ],
        testCases: [{ input: "3,2,3", expectedOutput: "3", isPublic: true }],
        starterCode: { javascript: `const fs = require('fs');\nconst n = fs.readFileSync(0, 'utf-8').trim().split(',').map(Number);\n// Write code` }
    },
    {
        title: "Reverse Linked List Array",
        description: "Given a an array representing a linked list, return the reversed list (as an array output).",
        difficulty: "Easy",
        tags: ["Linked List"],
        inputFormat: "Comma separated numbers",
        outputFormat: "Comma separated numbers",
        constraints: "0 <= nodes <= 5000",
        examples: [
            { input: "1,2,3,4,5", output: "5,4,3,2,1" },
            { input: "1,2", output: "2,1" }
        ],
        testCases: [{ input: "1,2,3,4,5", expectedOutput: "5,4,3,2,1", isPublic: true }],
        starterCode: { javascript: `const fs = require('fs');\nconst inp = fs.readFileSync(0, 'utf-8').trim().split(',');\n// Write code reversing` }
    },
    {
        title: "First Unique Character in a String",
        description: "Given a string `s`, find the first non-repeating character in it and return its index. If it does not exist, return -1.",
        difficulty: "Easy",
        tags: ["String"],
        inputFormat: "String s",
        outputFormat: "Index",
        constraints: "1 <= s.length <= 10^5",
        examples: [
            { input: "leetcode", output: "0" },
            { input: "loveleetcode", output: "2" },
            { input: "aabb", output: "-1" }
        ],
        testCases: [{ input: "leetcode", expectedOutput: "0", isPublic: true }],
        starterCode: { javascript: `const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf-8').trim();\n// Write code` }
    },
    {
        title: "Longest Common Prefix",
        description: "Write a function to find the longest common prefix string amongst an array of strings.\n\nIf there is no common prefix, return an empty string \"\".",
        difficulty: "Easy",
        tags: ["String"],
        inputFormat: "Comma separated strings",
        outputFormat: "Prefix string",
        constraints: "1 <= strs.length <= 200",
        examples: [
            { input: "flower,flow,flight", output: "fl" },
            { input: "dog,racecar,car", output: "" }
        ],
        testCases: [{ input: "flower,flow,flight", expectedOutput: "fl", isPublic: true }],
        starterCode: { javascript: `const fs = require('fs');\nconst strs = fs.readFileSync(0, 'utf-8').trim().split(',');\n// Write code` }
    },
    {
        title: "Power of Three",
        description: "Given an integer `n`, return `true` if it is a power of three. Otherwise, return `false`.\n\nAn integer `n` is a power of three, if there exists an integer `x` such that `n == 3^x`.",
        difficulty: "Easy",
        tags: ["Math", "Recursion"],
        inputFormat: "Integer n",
        outputFormat: "true or false",
        constraints: "-2^31 <= n <= 2^31 - 1",
        examples: [
            { input: "27", output: "true", explanation: "27 = 3^3" },
            { input: "0", output: "false" },
            { input: "45", output: "false" }
        ],
        testCases: [
            { input: "27", expectedOutput: "true", isPublic: true },
            { input: "45", expectedOutput: "false", isPublic: true }
        ],
        starterCode: { javascript: `const fs = require('fs');\nconst n = Number(fs.readFileSync(0, 'utf-8').trim());\n// Write code` }
    }
];

mongoose.connect(MONGO_URI)
    .then(async () => {
        try {
            await CodingQuestion.deleteMany({});
            await CodingQuestion.insertMany(questions);
            console.log("Seeded 25 FULLY detailed questions!");
        } catch (err) {
            console.error(err);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => console.error(err));
