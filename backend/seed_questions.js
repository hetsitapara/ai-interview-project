const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./models/Question');

dotenv.config();

const questions = [
  // --- DBMS ---
  { category: "DBMS", topic: "Basics", difficulty: "Easy", question: "What is a DBMS?", answer: "A Database Management System (DBMS) is software that manages databases, allowing users to store, retrieve, and manipulate data." },
  { category: "DBMS", topic: "SQL", difficulty: "Easy", question: "What is SQL?", answer: "SQL (Structured Query Language) is a standard language for accessing and manipulating databases." },
  { category: "DBMS", topic: "Keys", difficulty: "Easy", question: "What is a Primary Key?", answer: "A Primary Key is a column or set of columns that uniquely identifies each row in a table." },
  { category: "DBMS", topic: "Keys", difficulty: "Medium", question: "Difference between Primary Key and Unique Key?", answer: "A Primary Key cannot accept NULL values and there can be only one per table, while a Unique Key can accept one NULL value and there can be multiple per table." },
  { category: "DBMS", topic: "Normalization", difficulty: "Medium", question: "What is Normalization?", answer: "Normalization is the process of organizing data in a database to reduce redundancy and improve data integrity." },
  { category: "DBMS", topic: "Normalization", difficulty: "Hard", question: "Explain BCNF.", answer: "Boyce-Codd Normal Form (BCNF) is a stronger version of 3NF where for every functional dependency X -> Y, X must be a superkey." },
  { category: "DBMS", topic: "Transactions", difficulty: "Medium", question: "What are ACID properties?", answer: "ACID stands for Atomicity, Consistency, Isolation, and Durability, ensuring reliable database transactions." },
  { category: "DBMS", topic: "Indexing", difficulty: "Medium", question: "What is an Index?", answer: "An index is a data structure that improves the speed of data retrieval operations on a database table." },
  { category: "DBMS", topic: "Joins", difficulty: "Easy", question: "What is an Inner Join?", answer: "An Inner Join returns records that have matching values in both tables." },
  { category: "DBMS", topic: "Joins", difficulty: "Medium", question: "Difference between DELETE and TRUNCATE?", answer: "DELETE removes rows one by one and can be rolled back (DML), while TRUNCATE removes all rows instantly and cannot be rolled back easily (DDL)." },

  // --- JavaScript ---
  { category: "JavaScript", topic: "Basics", difficulty: "Easy", question: "What are the data types in JavaScript?", answer: "Primitive: String, Number, BigInt, Boolean, Undefined, Null, Symbol. Non-Primitive: Object." },
  { category: "JavaScript", topic: "Basics", difficulty: "Medium", question: "Explain Hoisting.", answer: "Hoisting is JavaScript's behavior of moving declarations to the top of the current scope. Var variables are hoisted and initialized with undefined, let/const are hoisted but stay in the TDZ." },
  { category: "JavaScript", topic: "Functions", difficulty: "Medium", question: "What is a Closure?", answer: "A closure is a function that remembers its outer variables and can access them even when the outer function has finished executing." },
  { category: "JavaScript", topic: "Functions", difficulty: "Easy", question: "Difference between == and ===?", answer: "== checks for value equality with type coercion, while === checks for both value and type equality." },
  { category: "JavaScript", topic: "Async", difficulty: "Medium", question: "What is the Event Loop?", answer: "The Event Loop is a mechanism that allows JavaScript to perform non-blocking I/O operations by offloading operations to the system kernel whenever possible." },
  { category: "JavaScript", topic: "Async", difficulty: "Medium", question: "Difference between Promise and Callback?", answer: "Callbacks are functions passed into other functions to be executed later, often leading to 'callback hell'. Promises are objects representing the eventual completion/failure of an async operation, offering cleaner syntax." },
  { category: "JavaScript", topic: "ES6+", difficulty: "Easy", question: "What is let vs var vs const?", answer: "Var is function-scoped and hoisted. Let and Const are block-scoped. Const cannot be reassigned." },
  { category: "JavaScript", topic: "Prototypes", difficulty: "Hard", question: "What is Prototypal Inheritance?", answer: "In JavaScript, objects inherit properties and methods from a prototype object. This chain matches properties up widely until null." },

  // --- React ---
  { category: "React", topic: "Core", difficulty: "Easy", question: "What is React?", answer: "React is a JavaScript library for building user interfaces, primarily using a component-based architecture." },
  { category: "React", topic: "Core", difficulty: "Medium", question: "What is the Virtual DOM?", answer: "The Virtual DOM is a lightweight copy of the real DOM. React updates the Virtual DOM first, compares it with the previous version (diffing), and efficiently updates the real DOM." },
  { category: "React", topic: "Hooks", difficulty: "Easy", question: "What is useState?", answer: "useState is a Hook that lets you add React state to function components." },
  { category: "React", topic: "Hooks", difficulty: "Medium", question: "Explain useEffect.", answer: "useEffect is a Hook that lets you perform side effects in function components (like fetching data, subscriptions) similar to lifecycle methods." },
  { category: "React", topic: "State Management", difficulty: "Medium", question: "What is Redux?", answer: "Redux is a predictable state container for JavaScript apps, helping managing global state across the application." },
  { category: "React", topic: "Performance", difficulty: "Hard", question: "What is React.memo?", answer: "React.memo is a higher-order component that prevents a functional component from re-rendering if its props strictly haven't changed." },

  // --- DSA ---
  { category: "DSA", topic: "Arrays", difficulty: "Easy", question: "Time complexity of accessing an array element?", answer: "O(1) - Constant time." },
  { category: "DSA", topic: "Arrays", difficulty: "Medium", question: "Explain Binary Search.", answer: "Binary Search is an efficient algorithm for finding an item from a sorted list of items. It works by repeatedly dividing in half the portion of the list that could contain the item." },
  { category: "DSA", topic: "LinkedList", difficulty: "Medium", question: "Difference between Array and Linked List?", answer: "Arrays have fixed size and contiguous memory. Linked Lists have dynamic size and non-contiguous memory using pointers." },
  { category: "DSA", topic: "Stacks/Queues", difficulty: "Easy", question: "What is LIFO?", answer: "Last In First Out - the principle used by Stacks." },
  { category: "DSA", topic: "Trees", difficulty: "Medium", question: "What is a Binary Search Tree (BST)?", answer: "A BST is a binary tree where the left child is always less than the parent, and the right child is always greater." },

  // --- HR ---
  { category: "HR", topic: "Behavioral", difficulty: "Easy", question: "Tell me about yourself.", answer: "Start with your current role, mention key achievements, and explain why you are interested in this position." },
  { category: "HR", topic: "Behavioral", difficulty: "Medium", question: "Describe a challenge you faced and how you overcame it.", answer: "Use the STAR method: Situation, Task, Action, Result." },
  { category: "HR", topic: "Situational", difficulty: "Medium", question: "How do you handle tight deadlines?", answer: "Prioritize tasks, communicate early if there are blockers, and focus on MVP." },
  { category: "HR", topic: "General", difficulty: "Easy", question: "Why should we hire you?", answer: "Align your skills and experience with the company's needs and culture." }
];

const seedQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/sdp-project');
    console.log('MongoDB Connected');

    // Clear existing to avoid duplicates if re-run often or just update logic?
    // Let's clear for clean state as requested "modify every dataset"
    await Question.deleteMany({});
    console.log('Cleared existing questions');

    const formattedQuestions = questions.map(q => ({
      question: q.question,
      topic: q.topic, // This is the SUBTOPIC
      category: q.category, // This is the MAIN SUBJECT
      difficulty: q.difficulty,
      answer: q.answer,
      source_type: "Technical",
      tags: [q.topic, q.category]
    }));

    await Question.insertMany(formattedQuestions);
    console.log(`Seeded ${formattedQuestions.length} questions across multiple categories!`);
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

seedQuestions();
