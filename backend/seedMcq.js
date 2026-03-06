const mongoose = require('mongoose');
const dotenv = require('dotenv');
const McqQuestion = require('./models/McqQuestion');

dotenv.config({ path: './backend/.env' });

const questions = [
    // --- HR (10) ---
    {
        question: "What is your greatest strength?",
        options: ["Technical Skills", "Communication", "Problem Solving", "All of the above"],
        correctOptions: [3],
        type: 'MCQ',
        category: 'HR'
    },
    {
        question: "Where do you see yourself in 5 years?",
        options: ["In a senior role", "Running my own company", "Learning new technologies", "Retired"],
        correctOptions: [0], // Subjective, but for quiz sake
        type: 'MCQ',
        category: 'HR'
    },
    {
        question: "Why should we hire you?",
        options: ["I need money", "I am a perfect fit for this role", "I live nearby", "None of the above"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'HR'
    },
    {
        question: "How do you handle stress?",
        options: ["Panic", "Ignore it", "Prioritize and Plan", "Take a sick leave"],
        correctOptions: [2],
        type: 'MCQ',
        category: 'HR'
    },
    {
        question: "Describe a difficult work situation you overcame.",
        options: ["Blame others", "Communication and Action", "Quit the job", "Cried"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'HR'
    },
    {
        question: "What motivates you?",
        options: ["Money", "Growth", "Impact", "Challenge"],
        correctOptions: [1], // Often Growth/Impact
        type: 'MCQ',
        category: 'HR'
    },
    {
        question: "Are you a team player?",
        options: ["Yes", "No", "Depends", "Only when winning"],
        correctOptions: [0],
        type: 'MCQ',
        category: 'HR'
    },
    {
        question: "What is your biggest weakness?",
        options: ["I work too hard", "Perfectionism (managed)", "Lazy", "Late riser"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'HR'
    },
    {
        question: "Do you have any questions for us?",
        options: ["No", "When do I get paid?", "What is the team culture like?", "Can I leave early?"],
        correctOptions: [2],
        type: 'MCQ',
        category: 'HR'
    },
    {
        question: "What are your salary expectations?",
        options: ["As per market standards", "1 Million Dollars", "Whatever you give", "No expectation"],
        correctOptions: [0],
        type: 'MCQ',
        category: 'HR'
    },

    // --- DBMS (10) ---
    {
        question: "What does SQL stand for?",
        options: ["Structured Query Language", "Strong Question Language", "Structured Question List", "None"],
        correctOptions: [0],
        type: 'MCQ',
        category: 'DBMS'
    },
    {
        question: "Which of these is a NoSQL database?",
        options: ["MySQL", "PostgreSQL", "MongoDB", "Oracle"],
        correctOptions: [2],
        type: 'MCQ',
        category: 'DBMS'
    },
    {
        question: "What is a Primary Key?",
        options: ["A key to unlock the door", "Unique identifier for a record", "A random number", "The first column"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'DBMS'
    },
    {
        question: "What is Normalization?",
        options: ["Increasing redundancy", "Reducing redundancy", "Deleting data", "Sorting data"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'DBMS'
    },
    {
        question: "Which command is used to remove a table?",
        options: ["DELETE", "REMOVE", "DROP", "CLEAR"],
        correctOptions: [2],
        type: 'MCQ',
        category: 'DBMS'
    },
     {
        question: "What is ACID properties?",
        options: ["Atomicity, Consistency, Isolation, Durability", "Atomicity, Consistency, Integrity, Durability", "Accuracy, Consistency, Isolation, Durability", "None"],
        correctOptions: [0],
        type: 'MCQ',
        category: 'DBMS'
    },
    {
        question: "What is a Foreign Key?",
        options: ["Key in the same table", "Key linking two tables", "Key for foreign data", "None"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'DBMS'
    },
    {
        question: "Select the DDL commands (MSQ)",
        options: ["CREATE", "INSERT", "ALTER", "UPDATE"],
        correctOptions: [0, 2],
        type: 'MSQ',
        category: 'DBMS'
    },
    {
        question: "What is 'Index' used for?",
        options: ["Slowing down query", "Appalling data", "Speeding up retrieval", "Hiding data"],
        correctOptions: [2],
        type: 'MCQ',
        category: 'DBMS'
    },
    {
        question: "Which is not a type of Join?",
        options: ["Inner Join", "Outer Join", "Left Join", "Lower Join"],
        correctOptions: [3],
        type: 'MCQ',
        category: 'DBMS'
    },

    // --- React (10) ---
    {
        question: "What is React?",
        options: ["A Backend Framework", "A Database", "A JavaScript Library for UI", "An OS"],
        correctOptions: [2],
        type: 'MCQ',
        category: 'React'
    },
    {
        question: "What is JSX?",
        options: ["Java Syntax Extension", "JavaScript XML", "JSON XML", "Java System X"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'React'
    },
    {
        question: "Which hook is used for side effects?",
        options: ["useState", "useEffect", "useContext", "useReducer"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'React'
    },
    {
        question: "How do you pass data to components?",
        options: ["State", "Props", "Render", "All of above"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'React'
    },
    {
        question: "What prevents default behavior in React forms?",
        options: ["event.stop()", "event.halt()", "event.preventDefault()", "return false"],
        correctOptions: [2],
        type: 'MCQ',
        category: 'React'
    },
    {
        question: "What is Virtual DOM?",
        options: ["A direct copy of DOM", "A lightweight copy of DOM", "A heavy database", "None"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'React'
    },
    {
        question: "Which hook is used to access DOM elements?",
        options: ["useRef", "useState", "useEffect", "useMemo"],
        correctOptions: [0],
        type: 'MCQ',
        category: 'React'
    },
    {
        question: "Is React a framework or library?",
        options: ["Framework", "Library", "Language", "Database"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'React'
    },
    {
        question: "Select valid React Hooks (MSQ)",
        options: ["useFetch", "useState", "useData", "useEffect"],
        correctOptions: [1, 3],
        type: 'MSQ',
        category: 'React'
    },
    {
        question: "What is used to handle global state?",
        options: ["Props", "Context API / Redux", "State", "Hooks"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'React'
    },

    // --- DSA (10) ---
    {
        question: "Time complexity of Binary Search?",
        options: ["O(n)", "O(n^2)", "O(log n)", "O(1)"],
        correctOptions: [2],
        type: 'MCQ',
        category: 'DSA'
    },
    {
        question: "Which is LIFO data structure?",
        options: ["Queue", "Stack", "Array", "Linked List"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'DSA'
    },
    {
        question: "Which sorting algorithm is fastest on average?",
        options: ["Bubble Sort", "Quick Sort", "Selection Sort", "Insertion Sort"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'DSA'
    },
    {
        question: "What is a Graph?",
        options: ["Linear data structure", "Create by nodes and edges", "A chart", "None"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'DSA'
    },
    {
        question: "Worst case of Bubble Sort?",
        options: ["O(n)", "O(n log n)", "O(n^2)", "O(1)"],
        correctOptions: [2],
        type: 'MCQ',
        category: 'DSA'
    },
    {
        question: "Which is FIFO?",
        options: ["Stack", "Queue", "Tree", "Graph"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'DSA'
    },
    {
        question: "Height of a balanced binary tree?",
        options: ["n", "log n", "n^2", "1"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'DSA'
    },
    {
        question: "BFS uses which data structure?",
        options: ["Stack", "Queue", "Array", "Tree"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'DSA'
    },
    {
        question: "DFS uses which data structure?",
        options: ["Queue", "Stack", "Heap", "Hash Map"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'DSA'
    },
    {
        question: "Select linear data structures (MSQ)",
        options: ["Array", "Graph", "Linked List", "Tree"],
        correctOptions: [0, 2],
        type: 'MSQ',
        category: 'DSA'
    },
    
    // --- JavaScript (10) ---
    {
        question: "Which variable cannot be reassigned?",
        options: ["var", "let", "const", "None"],
        correctOptions: [2],
        type: 'MCQ',
        category: 'JavaScript'
    },
    {
        question: "What is 'this' keyword?",
        options: ["Current function", "Current object", "Global object", "Depends on call context"],
        correctOptions: [3],
        type: 'MCQ',
        category: 'JavaScript'
    },
    {
        question: "Which is not a primitive type?",
        options: ["String", "Number", "Object", "Boolean"],
        correctOptions: [2],
        type: 'MCQ',
        category: 'JavaScript'
    },
    {
        question: "Method to convert JSON to string?",
        options: ["JSON.parse()", "JSON.toString()", "JSON.stringify()", "JSON.convert()"],
        correctOptions: [2],
        type: 'MCQ',
        category: 'JavaScript'
    },
    {
        question: "What is closure?",
        options: ["Function inside function", "Function accessing outer scope", "Closing a variable", "None"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'JavaScript'
    },
    {
        question: "Output of 2 + '2'?",
        options: ["4", "22", "NaN", "Error"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'JavaScript'
    },
    {
        question: "Which is asynchronous?",
        options: ["callback", "promise", "async/await", "All of above"],
        correctOptions: [3],
        type: 'MCQ',
        category: 'JavaScript'
    },
    {
        question: "Select falsy values (MSQ)",
        options: ["0", "false", "'false'", "undefined"],
        correctOptions: [0, 1, 3],
        type: 'MSQ',
        category: 'JavaScript'
    },
    {
        question: "Methods to add an event listener?",
        options: ["element.onClick", "element.addEventListener", "element.listen", "None"],
        correctOptions: [1],
        type: 'MCQ',
        category: 'JavaScript',
        topic: 'DOM'
    },
    {
        question: "What is the use of map()?",
        options: ["Modify array elements", "Filter elements", "Find element", "Loop only"],
        correctOptions: [0],
        type: 'MCQ',
        category: 'JavaScript',
        topic: 'Arrays'
    }
];

const seedMCQs = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sdp-project');
        console.log('MongoDB Connected for Seeding MCQs');

        await McqQuestion.deleteMany({});
        console.log('Cleared existing MCQs');

        await McqQuestion.insertMany(questions);
        console.log('Seeded 50+ MCQs Successfully!');

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedMCQs();
