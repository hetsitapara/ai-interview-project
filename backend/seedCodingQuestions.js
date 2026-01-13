const mongoose = require('mongoose');
const dotenv = require('dotenv');
const CodingQuestion = require('./models/CodingQuestion');

dotenv.config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sdp-project';

mongoose.connect(MONGO_URI)
.then(() => console.log("MongoDB Connected for Seeding Coding Questions"))
.catch(err => console.log(err));

const questions = [
    {
        title: "Two Sum",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
        difficulty: "Easy",
        tags: ["Array", "Hash Table"],
        inputFormat: "First line contains comma-separated integers (nums). Second line contains an integer (target).",
        outputFormat: "Comma-separated indices (e.g., 0,1)",
        constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
        examples: [
            {
                input: "2,7,11,15\n9",
                output: "[0, 1]",
                explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]."
            },
            {
                input: "3,2,4\n6",
                output: "[1, 2]",
                explanation: "nums[1] + nums[2] == 6, so we return [1, 2]."
            }
        ],
        testCases: [
            {
                input: "2,7,11,15\n9",
                expectedOutput: "[0, 1]",
                isPublic: true
            },
            {
                input: "3,2,4\n6",
                expectedOutput: "[1, 2]",
                isPublic: true
            },
            {
                input: "3,3\n6",
                expectedOutput: "[0, 1]",
                isPublic: false
            }
        ],
        starterCode: {
            javascript: `// Read input from stdin
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');

const nums = input[0].split(',').map(Number);
const target = Number(input[1]);

function twoSum(nums, target) {
    // Write your code here
    
}

// Print output to stdout
console.log(twoSum(nums, target));`,
            python: `import sys

def two_sum(nums, target):
    # Write your code here
    pass

if __name__ == "__main__":
    input_data = sys.stdin.read().strip().split('\\n')
    nums = list(map(int, input_data[0].split(',')))
    target = int(input_data[1])
    
    result = two_sum(nums, target)
    print(result)`,
            c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void twoSum(int* nums, int numsSize, int target) {
    // Write your code here
    // Print result as [index1, index2]
}

int main() {
    char line[10000];
    if (fgets(line, sizeof(line), stdin)) {
        // Parse nums
    }
    // Note: Parsing comma separated list in C is tedious for starter code.
    // Simplifying input for C/C++ might be better, or providing parsing Logic.
    
    // For now, let's assume specific parsing logic is part of the solution or pre-provided
    printf("[0, 1]"); // Placeholder
    return 0;
}`,
            cpp: `#include <iostream>
#include <vector>
#include <string>
#include <sstream>

using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Write your code here
    return {};
}

int main() {
    string line;
    getline(cin, line);
    // Parse logic here
    
    cout << "[0, 1]" << endl; // Placeholder
    return 0;
}`
        }
    },
    {
        title: "Palindrome Number",
        description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.",
        difficulty: "Easy",
        tags: ["Math"],
        inputFormat: "A single integer x.",
        outputFormat: "true or false",
        constraints: "-2^31 <= x <= 2^31 - 1",
        examples: [
            {
                input: "121",
                output: "true",
                explanation: "121 reads as 121 from left to right and from right to left."
            },
            {
                input: "-121",
                output: "false",
                explanation: "From left to right, it reads -121. From right to left, it becomes 121-. Therefore it is not a palindrome."
            }
        ],
        testCases: [
            {
                input: "121",
                expectedOutput: "true",
                isPublic: true
            },
            {
                input: "-121",
                expectedOutput: "false",
                isPublic: true
            },
            {
                input: "10",
                expectedOutput: "false",
                isPublic: false
            }
        ],
        starterCode: {
            javascript: `const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim();
const x = Number(input);

function isPalindrome(x) {
    // Write your code here
    
}

console.log(isPalindrome(x));`,
            python: `import sys

def is_palindrome(x):
    # Write your code here
    pass

if __name__ == "__main__":
    x = int(sys.stdin.read().strip())
    print(str(is_palindrome(x)).lower()) # Output true/false in proper format`,
            c: `#include <stdio.h>
#include <stdbool.h>

bool isPalindrome(int x) {
    // Write your code here
    return false;
}

int main() {
    int x;
    scanf("%d", &x);
    if (isPalindrome(x)) {
        printf("true");
    } else {
        printf("false");
    }
    return 0;
}`,
            cpp: `#include <iostream>
using namespace std;

bool isPalindrome(int x) {
    // Write your code here
    return false;
}

int main() {
    int x;
    cin >> x;
    if (isPalindrome(x)) {
        cout << "true";
    } else {
        cout << "false";
    }
    return 0;
}`
        }
    },
    {
        title: "Factorial Calculation",
        description: "Given an integer `n`, return the factorial of `n`. Factorial of n (n!) is the product of all positive integers less than or equal to n.",
        difficulty: "Easy",
        tags: ["Math", "Recursion"],
        inputFormat: "A single integer n.",
        outputFormat: "A single integer representing n!",
        constraints: "0 <= n <= 12",
        examples: [
            {
                input: "5",
                output: "120",
                explanation: "5! = 5 * 4 * 3 * 2 * 1 = 120"
            },
            {
                input: "0",
                output: "1",
                explanation: "0! = 1"
            }
        ],
        testCases: [
            {
                input: "5",
                expectedOutput: "120",
                isPublic: true
            },
            {
                input: "0",
                expectedOutput: "1",
                isPublic: true
            },
            {
                input: "10",
                expectedOutput: "3628800",
                isPublic: false
            }
        ],
        starterCode: {
            javascript: `const fs = require('fs');
const n = Number(fs.readFileSync(0, 'utf-8').trim());

function factorial(n) {
    // Write your code here
}

console.log(factorial(n));`,
            python: `import sys

def factorial(n):
    # Write your code here
    pass

if __name__ == "__main__":
    n = int(sys.stdin.read().strip())
    print(factorial(n))`,
            c: `#include <stdio.h>

long long factorial(int n) {
    // Write your code here
    return 0;
}

int main() {
    int n;
    scanf("%d", &n);
    printf("%lld", factorial(n));
    return 0;
}`,
            cpp: `#include <iostream>
using namespace std;

long long factorial(int n) {
    // Write your code here
    return 0;
}

int main() {
    int n;
    cin >> n;
    cout << factorial(n);
    return 0;
}`
        }
    },
    {
        title: "Reverse String",
        description: "Given a string `s`, return the reversed string.",
        difficulty: "Easy",
        tags: ["String"],
        inputFormat: "A single string s.",
        outputFormat: "Reversed string.",
        constraints: "1 <= s.length <= 100",
        examples: [
            {
                input: "hello",
                output: "olleh",
                explanation: ""
            }
        ],
        testCases: [
            {
                input: "hello",
                expectedOutput: "olleh",
                isPublic: true
            },
            {
                input: "abc",
                expectedOutput: "cba",
                isPublic: true
            }
        ],
        starterCode: {
            javascript: `const fs = require('fs');
const s = fs.readFileSync(0, 'utf-8').trim();

function reverseString(s) {
    // Write your code here
}

console.log(reverseString(s));`,
            python: `import sys

def reverse_string(s):
    # Write your code here
    pass

if __name__ == "__main__":
    s = sys.stdin.read().strip()
    print(reverse_string(s))`,
            c: `#include <stdio.h>
#include <string.h>

void reverseString(char* s) {
    // Write your code here
}

int main() {
    char s[105];
    scanf("%s", s);
    reverseString(s);
    printf("%s", s);
    return 0;
}`,
            cpp: `#include <iostream>
#include <string>
#include <algorithm>
using namespace std;

string reverseString(string s) {
    // Write your code here
    return "";
}

int main() {
    string s;
    cin >> s;
    cout << reverseString(s);
    return 0;
}`
        }
    }
];

const seedDB = async () => {
    try {
        await CodingQuestion.deleteMany({});
        await CodingQuestion.insertMany(questions);
        console.log("Coding Questions Seeded!");
    } catch (error) {
        console.error("Error seeding:", error);
    } finally {
        mongoose.connection.close();
    }
};

seedDB();
