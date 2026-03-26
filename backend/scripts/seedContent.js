const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Blog = require('../models/Blog');
const InterviewExperience = require('../models/InterviewExperience');
const User = require('../models/User');

// Hardcoded URI as backup
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sdp-project';

mongoose.connect(MONGO_URI)
.then(() => console.log("MongoDB Connected for Content Seeding"))
.catch(err => console.log(err));

const seedContent = async () => {
    try {
        // 1. Find a user to assign content to (or create a dummy one if needed, but assuming dev user exists)
        // We will try to find the 'admin' or just the first user.
        let user = await User.findOne({ role: 'admin' });
        if (!user) user = await User.findOne({});
        
        if (!user) {
            console.log("No user found to assign content. Please register a user first.");
            process.exit(1);
        }

        const userId = user._id;
        const authorName = user.name || "PrepAI Team";

        // 2. Seed Blogs
        await Blog.deleteMany({});
        
        const blogs = [
            {
                title: "Mastering the Technical Interview: A Comprehensive Guide",
                content: "Technical interviews can be daunting. From whiteboard coding to system design, the pressure is real. In this guide, we break down the 5 steps to success: 1. Solidify your basics (Arrays, Strings, HashMaps). 2. Practice visualizing the problem. 3. Communicate your thought process clearly. 4. Handle edge cases. 5. Optimize your solution. Remember, it's not just about getting the right answer, but how you get there.",
                tag: "Career Tips",
                user: userId,
                author: "Sarah Jenkins"
            },
            {
                title: "System Design 101: Scalability vs Performance",
                content: "What's the difference between a scalable system and a performant one? Performance is about 'fast for one user', while scalability is 'fast for many users'. We explore load balancing, caching strategies (Redis vs Memcached), database sharding, and consistent hashing. This is a must-read for anyone targeting L4/L5 roles at FAANG companies.",
                tag: "System Design",
                user: userId,
                author: "David Chen"
            },
            {
                title: "Top 10 Dynamic Programming Patterns",
                content: "DP is the nemesis of many candidates. But did you know most DP problems fall into a few buckets? 1. 0/1 Knapsack. 2. Unbounded Knapsack. 3. Shortest Path. 4. Fibonacci style. 5. Longest Common Subsequence. We provide code templates for each pattern in Python and Java.",
                tag: "DSA",
                user: userId,
                author: "Algorithm Wizard"
            },
            {
                title: "Behavioral Interviews: The STAR Method",
                content: "Don't let the 'Tell me about a time you failed' question trip you up. Use the STAR method: Situation, Task, Action, Result. We provide 5 concrete examples of how to frame your stories to highlight your leadership and resilience.",
                tag: "HR",
                user: userId,
                author: "HR Insider"
            },
             {
                title: "Negotiating Your Offer: Do's and Don'ts",
                content: "You got the offer! Now what? Do: Research market rates. Express enthusiasm. Ask for time. Don't: Give an ultimatum (unless prepared to walk). Focus only on base salary (stock and sign-on matter!). We share a script you can use for your negotiation call.",
                tag: "Career Tips",
                user: userId,
                author: "Career Coach Mike"
            },
            {
                title: "Graph Algorithms De-mystified",
                content: "BFS vs DFS. When to use which? Dijkstra vs Bellman-Ford. We visualize these algorithms with interactive diagrams and show you how to detect cycles, find components, and traverse mazes efficiently.",
                tag: "DSA",
                user: userId,
                author: "Tech Explained"
            },
            {
                title: "Microservices vs Monolith: Choosing the Right Architecture",
                content: "Is Microservices always better? No. Monoliths are easier to deploy and debug initially. Microservices introduce network latency and complexity. We discuss the trade-offs and when you should actually migrate.",
                tag: "System Design",
                user: userId,
                author: "System Architect"
            },
             {
                title: "Red Flags to Watch Out For in Interviews",
                content: "Interviews are a two-way street. Watch out for: Disorganized process, rude interviewers, vague answers about company culture, or 'we work hard and play hard' (often code for burnout). Protect your mental health!",
                tag: "Career Tips",
                user: userId,
                author: "Sarah Jenkins"
            },
        ];
        
        await Blog.insertMany(blogs);
        console.log("Blogs seeded successfully!");

        // 3. Seed Interview Experiences
        await InterviewExperience.deleteMany({});

        const experiences = [
            {
                company: "Google",
                role: "Software Engineer L3",
                level: "Hard",
                desc: "The process consisted of a recruiter screen, followed by a phone screen which was a pure DP problem (Rainwater trapping variant). The onsite had 4 rounds: 1. Graph problem (Course Schedule). 2. String manipulation + sliding window. 3. System Design (Design a notification system - surprising for L3 but happened). 4. Googleyness/Behavioral. The interviewers were friendly but very strict on code quality.",
                topics: ["DP", "Graph", "Sliding Window", "System Design"],
                user: userId,
                author: "Ananya Gupta"
            },
            {
                company: "Amazon",
                role: "SDE I",
                level: "Medium",
                desc: "Heavy focus on Leadership Principles. Every round started with 15 mins of LP questions. Coding rounds were: 1. Tree traversal (Zigzag). 2. Object Oriented Design (Design a Parking Lot). 3. Logical/Array problem (Interval merging). Prepare your stories well!",
                topics: ["Trees", "OOD", "Arrays", "Leadership Principles"],
                user: userId,
                author: "James Wilson"
            },
            {
                company: "Microsoft",
                role: "Software Engineer II",
                level: "Medium",
                desc: "3 rounds back-to-back. Round 1: Modify a Linked List (Reverse K-group). Round 2: Design a tiny URL shortener service (High level discussion). Round 3: HM round discussing past projects and 'Why Microsoft?'. Overall a very positive experience.",
                topics: ["Linked List", "System Design", "Behavioral"],
                user: userId,
                author: "Michael Chang"
            },
            {
                company: "Netflix",
                role: "Senior UI Engineer",
                level: "Hard",
                desc: "Very unique process. One round was solely focused on 'Culture Memo'. Technical rounds involved building a complex UI component in React from scratch with virtualization support. They care deeply about performance and clean API design.",
                topics: ["React", "Performance", "Javascript", "Culture"],
                user: userId,
                author: "Emily Chen"
            },
            {
                company: "Meta",
                role: "Front End Engineer",
                level: "Hard",
                desc: "Speed is key. 2 questions in 45 mins. 1. Flatten a nested dictionary. 2. Build a DOM tree walker. You need to code bug-free and fast. The 'Jedi' behavioral round focused on conflict resolution.",
                topics: ["Recursion", "DOM Manipulation", "Javascript"],
                user: userId,
                author: "Rahul Verma"
            },
            {
                company: "TCS",
                role: "System Engineer",
                level: "Easy",
                desc: "One technical round covering basics of C++, Java and SQL. Asked to write a query for joining two tables and explain Polymorphism. HR round was standard relocation and salary questions.",
                topics: ["SQL", "Java", "OOPs"],
                user: userId,
                author: "Sneha Patel"
            },
            {
                company: "Uber",
                role: "Backend Engineer",
                level: "Hard",
                desc: "Machine Coding round: Build a thread-safe Task Scheduler in 90 mins. You have to handle concurrency and edge cases. Followed by a deep dive into database locking mechanisms.",
                topics: ["Concurrency", "Machine Coding", "Databases"],
                user: userId,
                author: "Alex Thompson"
            },
             {
                company: "Salesforce",
                role: "MTS",
                level: "Medium",
                desc: "Standard process. 1. Valid Parentheses variant. 2. Word Search in grid. 3. Past project deep dive. Interviewers were helpful and gave hints when stuck.",
                topics: ["Stack", "Backtracking", "Projects"],
                user: userId,
                author: "Priya Sharma"
            },
        ];

        await InterviewExperience.insertMany(experiences);
        console.log("Interview Experiences seeded successfully!");
        
        process.exit(0);
    } catch (error) {
        console.error("Error seeding content:", error);
        process.exit(1);
    }
};

seedContent();
