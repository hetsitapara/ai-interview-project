const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CodingQuestion = require('../models/CodingQuestion');

dotenv.config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sdp-project';

const questions = [
    // 1. Array / Hash Table (No Image)
    {
        title: "Two Sum",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        imageUrl: "",
        difficulty: "Easy",
        tags: ["Array", "Hash Table"],
        inputFormat: "First line: comma-separated integers (nums)\nSecond line: integer (target)",
        outputFormat: "Comma-separated indices (e.g., 0,1)",
        constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
        examples: [
            { input: "2,7,11,15\n9", output: "[0, 1]", explanation: "nums[0] + nums[1] == 9, so we return [0, 1]." }
        ],
        testCases: [
            { input: "2,7,11,15\n9", expectedOutput: "[0, 1]", isPublic: true },
            { input: "3,2,4\n6", expectedOutput: "[1, 2]", isPublic: true },
            { input: "3,3\n6", expectedOutput: "[0, 1]", isPublic: false }
        ],
        starterCode: { javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nconst nums = input[0].split(',').map(Number);\nconst target = Number(input[1]);\n\nfunction twoSum(nums, target) {\n    // Write your code here\n}\n\nconsole.log(twoSum(nums, target));` }
    },
    // 2. Graph with Image
    {
        title: "Number of Islands",
        description: "Given an `m x n` 2D binary grid `grid` which represents a map of '1's (land) and '0's (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are all surrounded by water.",
        imageUrl: "/images/coding-test/number_of_islands.png",
        difficulty: "Medium",
        tags: ["Graph", "DFS", "BFS", "Matrix"],
        inputFormat: "JSON string representing 2D array grid",
        outputFormat: "Integer (number of islands)",
        constraints: "1 <= m, n <= 300\ngrid[i][j] is '0' or '1'.",
        examples: [
            { input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: "3", explanation: "Three distinct islands." }
        ],
        testCases: [
            { input: '[["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', expectedOutput: "3", isPublic: true },
            { input: '[["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expectedOutput: "1", isPublic: false }
        ],
        starterCode: { javascript: `const fs = require('fs');\nconst grid = JSON.parse(fs.readFileSync(0, 'utf-8').trim());\n\nfunction numIslands(grid) {\n    // Write your code here\n}\n\nconsole.log(numIslands(grid));` }
    },
    // 3. Tree with Image
    {
        title: "Binary Tree Level Order Traversal",
        description: "Given an adjacency list representing a binary tree where index 0 is root, return the level order traversal of its nodes' values. (i.e., from left to right, level by level).",
        imageUrl: "/images/coding-test/binary_tree_level.png",
        difficulty: "Medium",
        tags: ["Tree", "BFS", "Binary Tree"],
        inputFormat: "JSON array representation of a tree (e.g. [3,9,20,null,null,15,7])",
        outputFormat: "JSON 2D Array of integers",
        constraints: "0 <= number of nodes <= 2000",
        examples: [
            { input: "[3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]", explanation: "Level 1: [3], Level 2: [9,20], Level 3: [15,7]" }
        ],
        testCases: [
            { input: "[3,9,20,null,null,15,7]", expectedOutput: "[[3],[9,20],[15,7]]", isPublic: true },
            { input: "[1]", expectedOutput: "[[1]]", isPublic: false }
        ],
        starterCode: { javascript: `const fs = require('fs');\nconst input = JSON.parse(fs.readFileSync(0, 'utf-8').trim());\n\nfunction levelOrder(arr) {\n    // Parse array into tree if needed, or compute directly\n    // Write code\n}\n\nconsole.log(JSON.stringify(levelOrder(input)));` }
    },
    // 4. Matrix with Image
    {
        title: "Rotate Image",
        description: "You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise).\n\nYou have to rotate the image in-place, which means you have to modify the input 2D matrix directly. DO NOT allocate another 2D matrix and do the rotation.",
        imageUrl: "/images/coding-test/rotate_image.png",
        difficulty: "Medium",
        tags: ["Array", "Math", "Matrix"],
        inputFormat: "JSON string representing 2D array grid",
        outputFormat: "JSON string of rotated grid",
        constraints: "1 <= n <= 20\nmatrix[i][j] is an integer",
        examples: [
            { input: "[[1,2,3],[4,5,6],[7,8,9]]", output: "[[7,4,1],[8,5,2],[9,6,3]]", explanation: "The array is rotated 90 degrees clockwise." }
        ],
        testCases: [
            { input: "[[1,2,3],[4,5,6],[7,8,9]]", expectedOutput: "[[7,4,1],[8,5,2],[9,6,3]]", isPublic: true },
            { input: "[[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]", expectedOutput: "[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]", isPublic: false }
        ],
        starterCode: { javascript: `const fs = require('fs');\nconst matrix = JSON.parse(fs.readFileSync(0, 'utf-8').trim());\n\nfunction rotate(matrix) {\n    // Write your code here\n    return matrix;\n}\n\nconsole.log(JSON.stringify(rotate(matrix)));` }
    },
    // 5. Grid/Backtracking with Image
    {
        title: "Word Search",
        description: "Given an `m x n` grid of characters `board` and a string `word`, return `true` if `word` exists in the grid.\n\nThe word can be constructed from letters of sequentially adjacent cells, where adjacent cells are horizontally or vertically neighboring. The same letter cell may not be used more than once.",
        imageUrl: "/images/coding-test/word_search.png",
        difficulty: "Medium",
        tags: ["Array", "Backtracking", "Matrix"],
        inputFormat: "Line 1: JSON grid of characters\nLine 2: string (word)",
        outputFormat: "true or false",
        constraints: "1 <= m, n <= 6\n1 <= word.length <= 15",
        examples: [
            { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\nABCCED', output: "true", explanation: "The word 'ABCCED' can be found in the grid." }
        ],
        testCases: [
            { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\nABCCED', expectedOutput: "true", isPublic: true },
            { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\nSEE', expectedOutput: "true", isPublic: true },
            { input: '[["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]]\nABCB', expectedOutput: "false", isPublic: false }
        ],
        starterCode: { javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nconst board = JSON.parse(input[0]);\nconst word = input[1];\n\nfunction exist(board, word) {\n    // Write your code here\n}\n\nconsole.log(exist(board, word));` }
    },
    // 6. N-Queens with Image
    {
        title: "N-Queens",
        description: "The n-queens puzzle is the problem of placing `n` queens on an `n x n` chessboard such that no two queens attack each other.\n\nGiven an integer `n`, return the number of distinct solutions to the n-queens puzzle.",
        imageUrl: "/images/coding-test/n_queens.png",
        difficulty: "Hard",
        tags: ["Backtracking", "Array"],
        inputFormat: "Integer n",
        outputFormat: "Integer (number of distinct solutions)",
        constraints: "1 <= n <= 9",
        examples: [
            { input: "4", output: "2", explanation: "There are two distinct solutions to the 4-queens puzzle." }
        ],
        testCases: [
            { input: "4", expectedOutput: "2", isPublic: true },
            { input: "1", expectedOutput: "1", isPublic: true },
            { input: "8", expectedOutput: "92", isPublic: false }
        ],
        starterCode: { javascript: `const fs = require('fs');\nconst n = Number(fs.readFileSync(0, 'utf-8').trim());\n\nfunction totalNQueens(n) {\n    // Write your code here\n}\n\nconsole.log(totalNQueens(n));` }
    },
    // 7. Course Schedule with Image
    {
        title: "Course Schedule",
        description: "There are a total of `numCourses` courses you have to take, labeled from `0` to `numCourses - 1`. You are given an array `prerequisites` where `prerequisites[i] = [a, b]` indicates that you must take course `b` first if you want to take course `a`.\n\nReturn `true` if you can finish all courses. Otherwise, return `false`.",
        imageUrl: "/images/coding-test/course_schedule.png",
        difficulty: "Medium",
        tags: ["Graph", "Topological Sort", "BFS", "DFS"],
        inputFormat: "Line 1: numCourses\nLine 2: JSON representing prerequisites",
        outputFormat: "true or false",
        constraints: "1 <= numCourses <= 2000\n0 <= prerequisites.length <= 5000",
        examples: [
            { input: "2\n[[1,0]]", output: "true", explanation: "Take course 0, then course 1." },
            { input: "2\n[[1,0],[0,1]]", output: "false", explanation: "Cyclic dependency." }
        ],
        testCases: [
            { input: "2\n[[1,0]]", expectedOutput: "true", isPublic: true },
            { input: "2\n[[1,0],[0,1]]", expectedOutput: "false", isPublic: true },
            { input: "4\n[[1,0],[2,1],[3,2]]", expectedOutput: "true", isPublic: false }
        ],
        starterCode: { javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nconst numCourses = Number(input[0]);\nconst prerequisites = JSON.parse(input[1]);\n\nfunction canFinish(numCourses, prerequisites) {\n    // Write your code here\n}\n\nconsole.log(canFinish(numCourses, prerequisites));` }
    },
    // 8. Unique Paths with Image
    {
        title: "Unique Paths",
        description: "There is a robot on an `m x n` grid. The robot is initially located at the top-left corner (i.e., `grid[0][0]`). The robot tries to move to the bottom-right corner (i.e., `grid[m - 1][n - 1]`). The robot can only move either down or right at any point in time.\n\nGiven the two integers `m` and `n`, return the number of possible unique paths that the robot can take to reach the bottom-right corner.",
        imageUrl: "/images/coding-test/unique_paths.png",
        difficulty: "Medium",
        tags: ["Math", "Dynamic Programming", "Combinatorics"],
        inputFormat: "Line 1: m\nLine 2: n",
        outputFormat: "Integer (number of ways)",
        constraints: "1 <= m, n <= 100",
        examples: [
            { input: "3\n7", output: "28", explanation: "From a 3x7 grid there are 28 unique paths." },
            { input: "3\n2", output: "3", explanation: "From the top-left corner, there are a total of 3 ways to reach the bottom-right corner." }
        ],
        testCases: [
            { input: "3\n7", expectedOutput: "28", isPublic: true },
            { input: "3\n2", expectedOutput: "3", isPublic: true },
            { input: "10\n10", expectedOutput: "48620", isPublic: false }
        ],
        starterCode: { javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nconst m = Number(input[0]);\nconst n = Number(input[1]);\n\nfunction uniquePaths(m, n) {\n    // Write your code here\n}\n\nconsole.log(uniquePaths(m, n));` }
    },
    // 9. LCA of a Binary Tree with Image
    {
        title: "Lowest Common Ancestor",
        description: "Given a binary tree, find the lowest common ancestor (LCA) of two given nodes in the tree.\n\nAccording to the definition of LCA on Wikipedia: “The lowest common ancestor is defined between two nodes `p` and `q` as the lowest node in `T` that has both `p` and `q` as descendants (where we allow a node to be a descendant of itself).”",
        imageUrl: "/images/coding-test/lowest_common_ancestor.png",
        difficulty: "Medium",
        tags: ["Tree", "DFS", "Binary Tree"],
        inputFormat: "Line 1: Array representation of tree\nLine 2: p\nLine 3: q",
        outputFormat: "Integer (Value of the LCA node)",
        constraints: "The number of nodes in the tree is in the range [2, 10^5].\nAll Node.val are unique.",
        examples: [
            { input: "[3,5,1,6,2,0,8,null,null,7,4]\n5\n1", output: "3", explanation: "The LCA of nodes 5 and 1 is 3." }
        ],
        testCases: [
            { input: "[3,5,1,6,2,0,8,null,null,7,4]\n5\n1", expectedOutput: "3", isPublic: true },
            { input: "[3,5,1,6,2,0,8,null,null,7,4]\n5\n4", expectedOutput: "5", isPublic: false }
        ],
        starterCode: { javascript: `const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nconst treeArr = JSON.parse(input[0]);\nconst p = Number(input[1]);\nconst q = Number(input[2]);\n\nfunction lowestCommonAncestor(root, p, q) {\n    // Parse array into tree if needed\n    // Write code\n}\n\nconsole.log(lowestCommonAncestor(treeArr, p, q));` }
    },
    // 10. Linked List (No Image)
    {
        title: "Reverse Linked List Array",
        description: "Given a an array representing a linked list, return the reversed list (as an array output).",
        imageUrl: "",
        difficulty: "Easy",
        tags: ["Linked List"],
        inputFormat: "Comma separated numbers",
        outputFormat: "Comma separated numbers",
        constraints: "0 <= nodes <= 5000",
        examples: [
            { input: "1,2,3,4,5", output: "5,4,3,2,1" },
            { input: "1,2", output: "2,1" }
        ],
        testCases: [
            { input: "1,2,3,4,5", expectedOutput: "5,4,3,2,1", isPublic: true },
            { input: "10,20,30", expectedOutput: "30,20,10", isPublic: false }
        ],
        starterCode: { javascript: `const fs = require('fs');\nconst inp = fs.readFileSync(0, 'utf-8').trim().split(',');\n// Write code reversing array\nconsole.log(inp.reverse().join(','));` }
    },
    // 11. Math (No Image)
    {
        title: "Palindrome Number",
        description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.",
        imageUrl: "",
        difficulty: "Easy",
        tags: ["Math"],
        inputFormat: "A single integer x",
        outputFormat: "true or false",
        constraints: "-2^31 <= x <= 2^31 - 1",
        examples: [
            { input: "121", output: "true" },
            { input: "-121", output: "false" }
        ],
        testCases: [
            { input: "121", expectedOutput: "true", isPublic: true },
            { input: "-121", expectedOutput: "false", isPublic: true },
            { input: "10", expectedOutput: "false", isPublic: false }
        ],
        starterCode: { javascript: `const fs = require('fs');\nconst x = Number(fs.readFileSync(0, 'utf-8').trim());\n\nfunction isPalindrome(x) {\n    // Write your code here\n}\n\nconsole.log(isPalindrome(x));` }
    },
    // 12. Dynamic Programming
    {
        title: "Climbing Stairs",
        description: "You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
        imageUrl: "",
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
            { input: "3", expectedOutput: "3", isPublic: true },
            { input: "5", expectedOutput: "8", isPublic: false }
        ],
        starterCode: { javascript: `const fs = require('fs');\nconst n = Number(fs.readFileSync(0, 'utf-8').trim());\n\nfunction climbStairs(n) {\n    // Write your code here\n}\n\nconsole.log(climbStairs(n));` }
    },
    // 13. Sliding Window
    {
        title: "Best Time to Buy and Sell Stock",
        description: "You are given an array `prices` where `prices[i]` is the price of a given stock on the `ith` day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve. If you cannot achieve any profit, return 0.",
        imageUrl: "",
        difficulty: "Easy",
        tags: ["Array", "Dynamic Programming", "Sliding Window"],
        inputFormat: "Comma separated nums",
        outputFormat: "Integer (maximum profit)",
        constraints: "1 <= prices.length <= 10^5\n0 <= prices[i] <= 10^4",
        examples: [
            { input: "7,1,5,3,6,4", output: "5", explanation: "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5." },
            { input: "7,6,4,3,1", output: "0", explanation: "In this case, no transactions are done and the max profit = 0." }
        ],
        testCases: [
            { input: "7,1,5,3,6,4", expectedOutput: "5", isPublic: true },
            { input: "7,6,4,3,1", expectedOutput: "0", isPublic: true },
            { input: "2,4,1,2", expectedOutput: "2", isPublic: false }
        ],
        starterCode: { javascript: `const fs = require('fs');\nconst prices = fs.readFileSync(0, 'utf-8').trim().split(',').map(Number);\n\nfunction maxProfit(prices) {\n    // Write your code here\n}\n\nconsole.log(maxProfit(prices));` }
    },
    // 14. Stack
    {
        title: "Valid Parentheses",
        description: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.",
        imageUrl: "",
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
            { input: "(]", expectedOutput: "false", isPublic: true },
            { input: "([)]", expectedOutput: "false", isPublic: false }
        ],
        starterCode: { javascript: `const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf-8').trim();\n\nfunction isValid(s) {\n    // Write your code here\n}\n\nconsole.log(isValid(s));` }
    },
    // 15. Single Number (Bit Manipulation)
    {
        title: "Single Number",
        description: "Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one.\n\nYou must implement a solution with a linear runtime complexity and use only constant extra space.",
        imageUrl: "",
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
            { input: "4,1,2,1,2", expectedOutput: "4", isPublic: true },
            { input: "1,1,3,3,5", expectedOutput: "5", isPublic: false }
        ],
        starterCode: { javascript: `const fs = require('fs');\nconst nums = fs.readFileSync(0, 'utf-8').trim().split(',').map(Number);\n\nfunction singleNumber(nums) {\n    // Write code\n}\n\nconsole.log(singleNumber(nums));` }
    }
];

mongoose.connect(MONGO_URI)
    .then(async () => {
        try {
            await CodingQuestion.deleteMany({});
            await CodingQuestion.insertMany(questions);
            console.log("Seeded 15 FULLY detailed questions, 8 of which have beautiful visual placehold diagrams!");
        } catch (err) {
            console.error(err);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => console.error(err));
