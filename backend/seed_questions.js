const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Question = require('./models/Question');

dotenv.config();

const questions = [
  {
    "category": "DBMS",
    "difficulty": "Easy",
    "topic": "Basics",
    "question": "What is a DBMS and why is it used?",
    "answer": "A Database Management System (DBMS) is software that allows users to define, create, maintain, and control access to databases. It helps organize data efficiently, ensures data security, reduces redundancy, and allows multiple users to access data concurrently.",
    "source_type": "Technical"
  },
  {
    "category": "DBMS",
    "difficulty": "Easy",
    "topic": "Database",
    "question": "What is a database?",
    "answer": "A database is an organized collection of related data stored electronically. It allows efficient storage, retrieval, and manipulation of data using structured formats.",
    "source_type": "Technical"
  },
  {
    "category": "DBMS",
    "difficulty": "Easy",
    "topic": "SQL",
    "question": "What is SQL?",
    "answer": "SQL (Structured Query Language) is a standard language used to interact with relational databases. It is used to create tables, insert data, retrieve records, update values, and manage database permissions.",
    "source_type": "Technical"
  },
  {
    "category": "DBMS",
    "difficulty": "Easy",
    "topic": "Keys",
    "question": "What is a primary key?",
    "answer": "A primary key is a column or set of columns that uniquely identifies each record in a table. It cannot contain NULL values and ensures entity integrity.",
    "source_type": "Technical"
  },
  {
    "category": "DBMS",
    "difficulty": "Easy",
    "topic": "Keys",
    "question": "What is a foreign key?",
    "answer": "A foreign key is a field in one table that refers to the primary key of another table. It is used to maintain referential integrity between related tables.",
    "source_type": "Technical"
  },
  {
    "category": "DBMS",
    "difficulty": "Medium",
    "topic": "Normalization",
    "question": "What is normalization in DBMS?",
    "answer": "Normalization is the process of organizing data to reduce redundancy and improve data integrity. It involves dividing tables into smaller tables and defining relationships between them.",
    "source_type": "Technical"
  },
  {
    "category": "DBMS",
    "difficulty": "Medium",
    "topic": "Normalization",
    "question": "Explain different normal forms.",
    "answer": "Normal forms are rules used in normalization such as 1NF, 2NF, 3NF, BCNF, 4NF, and 5NF. Each normal form removes specific types of redundancy and dependency.",
    "source_type": "Technical"
  },
  {
    "category": "DBMS",
    "difficulty": "Medium",
    "topic": "Transactions",
    "question": "What is a transaction in DBMS?",
    "answer": "A transaction is a sequence of operations performed as a single logical unit of work. It must satisfy ACID properties to ensure data consistency.",
    "source_type": "Technical"
  },
  {
    "category": "DBMS",
    "difficulty": "Medium",
    "topic": "ACID",
    "question": "Explain ACID properties.",
    "answer": "ACID stands for Atomicity, Consistency, Isolation, and Durability. These properties ensure reliable processing of database transactions.",
    "source_type": "Technical"
  },
  {
    "category": "DBMS",
    "difficulty": "Medium",
    "topic": "Indexing",
    "question": "What is indexing in DBMS?",
    "answer": "Indexing is a technique used to speed up data retrieval operations by creating pointers to data stored in tables.",
    "source_type": "Technical"
  },
  {
    "category": "DBMS",
    "difficulty": "Medium",
    "topic": "Views",
    "question": "What is a view in DBMS?",
    "answer": "A view is a virtual table created using SQL queries. It does not store data physically and provides a simplified representation of data.",
    "source_type": "Technical"
  },
  {
    "category": "DBMS",
    "difficulty": "Medium",
    "topic": "Joins",
    "question": "What is a join?",
    "answer": "A join is used to combine rows from two or more tables based on a related column. It helps retrieve meaningful data from multiple tables.",
    "source_type": "Technical"
  },
  {
    "category": "DBMS",
    "difficulty": "Medium",
    "topic": "Joins",
    "question": "Explain types of joins.",
    "answer": "Common joins include INNER JOIN, LEFT JOIN, RIGHT JOIN, and FULL JOIN, each determining how rows from tables are matched.",
    "source_type": "Technical"
  },
  {
    "category": "DBMS",
    "difficulty": "Medium",
    "topic": "Schema",
    "question": "What is a database schema?",
    "answer": "A schema defines the structure of a database including tables, fields, relationships, and constraints.",
    "source_type": "Technical"
  },
  {
    "category": "DBMS",
    "difficulty": "Medium",
    "topic": "Languages",
    "question": "What is DDL?",
    "answer": "DDL (Data Definition Language) includes SQL commands like CREATE, ALTER, and DROP used to define database structure.",
    "source_type": "Technical"
  },
  {
    "category": "DBMS",
    "difficulty": "Medium",
    "topic": "Languages",
    "question": "What is DML?",
    "answer": "DML (Data Manipulation Language) includes commands like INSERT, UPDATE, DELETE, and SELECT to manipulate data.",
    "source_type": "Technical"
  },
  {
    "category": "DBMS",
    "difficulty": "Medium",
    "topic": "Languages",
    "question": "What is DCL?",
    "answer": "DCL (Data Control Language) includes commands like GRANT and REVOKE used to control access to database objects.",
    "source_type": "Technical"
  },
  {
    "category": "DBMS",
    "difficulty": "Medium",
    "topic": "Languages",
    "question": "What is TCL?",
    "answer": "TCL (Transaction Control Language) includes COMMIT, ROLLBACK, and SAVEPOINT commands to manage transactions.",
    "source_type": "Technical"
  },
  {
    "category": "DBMS",
    "difficulty": "Medium",
    "topic": "Procedures",
    "question": "What is a stored procedure?",
    "answer": "A stored procedure is a precompiled set of SQL statements stored in the database, used to improve performance and reuse code.",
    "source_type": "Technical"
  },
  {
    "category": "DBMS",
    "difficulty": "Medium",
    "topic": "Triggers",
    "question": "What is a trigger in DBMS?",
    "answer": "A trigger is a database object that automatically executes in response to certain events like INSERT, UPDATE, or DELETE.",
    "source_type": "Technical"
  }
];

const seedQuestions = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interview-system');
        console.log('MongoDB Connected');

        // Transform data to match Schema
        const formattedQuestions = questions.map(q => ({
            title: q.question,
            topic: q.category, // Assuming category maps to topic enum
            difficulty: q.difficulty,
            answer: q.answer,
            tags: [q.topic] // Using the specific topic as a tag
        }));

        await Question.insertMany(formattedQuestions);
        console.log('Questions Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedQuestions();
