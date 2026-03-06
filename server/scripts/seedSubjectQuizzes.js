import dotenv from "dotenv";
import mongoose from "mongoose";
import Quiz from "../models/Quiz.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/quizdb";

const subjectQuizzes = [
  {
    title: "DBMS Fundamentals",
    description: "Core DBMS concepts including normalization, transactions, and SQL.",
    category: "DBMS",
    difficulty: "medium",
    timeLimit: 900,
    questions: [
      {
        question: "Which normal form removes partial dependency?",
        options: ["1NF", "2NF", "3NF", "BCNF"],
        correctAnswer: 1,
      },
      {
        question: "Which SQL command is used to remove a table and its data permanently?",
        options: ["DELETE", "REMOVE", "DROP", "TRUNCATE"],
        correctAnswer: 2,
      },
      {
        question: "ACID property 'I' stands for:",
        options: ["Isolation", "Indexing", "Integrity", "Insertion"],
        correctAnswer: 0,
      },
      {
        question: "Which join returns only matching rows from both tables?",
        options: ["LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "FULL JOIN"],
        correctAnswer: 2,
      },
      {
        question: "A primary key can contain:",
        options: ["NULL values", "Duplicate values", "Unique non-null values", "Only numeric values"],
        correctAnswer: 2,
      },
    ],
  },
  {
    title: "C++ Programming Essentials",
    description: "Test your understanding of C++ syntax, OOP, and memory concepts.",
    category: "C++",
    difficulty: "medium",
    timeLimit: 900,
    questions: [
      {
        question: "Which operator is used for dynamic memory allocation in C++?",
        options: ["malloc", "alloc", "new", "create"],
        correctAnswer: 2,
      },
      {
        question: "Which OOP concept allows the same function name with different parameters?",
        options: ["Encapsulation", "Inheritance", "Polymorphism", "Abstraction"],
        correctAnswer: 2,
      },
      {
        question: "Which of the following is a correct destructor declaration for class Demo?",
        options: ["~Demo();", "destructor Demo();", "Demo~();", "void ~Demo();"],
        correctAnswer: 0,
      },
      {
        question: "What is the default access specifier for class members in C++ classes?",
        options: ["public", "private", "protected", "internal"],
        correctAnswer: 1,
      },
      {
        question: "Which STL container stores unique keys in sorted order?",
        options: ["vector", "unordered_map", "set", "queue"],
        correctAnswer: 2,
      },
    ],
  },
  {
    title: "Computer Networking Basics",
    description: "Covers protocols, OSI model, addressing, and network fundamentals.",
    category: "Computer Networking",
    difficulty: "medium",
    timeLimit: 900,
    questions: [
      {
        question: "Which layer in the OSI model handles routing?",
        options: ["Data Link Layer", "Transport Layer", "Network Layer", "Session Layer"],
        correctAnswer: 2,
      },
      {
        question: "What is the default port number for HTTPS?",
        options: ["21", "80", "443", "8080"],
        correctAnswer: 2,
      },
      {
        question: "Which protocol is connection-oriented?",
        options: ["UDP", "IP", "TCP", "ICMP"],
        correctAnswer: 2,
      },
      {
        question: "A MAC address belongs to which addressing type?",
        options: ["Logical Address", "Physical Address", "Port Address", "Classful Address"],
        correctAnswer: 1,
      },
      {
        question: "DNS is primarily used to:",
        options: ["Encrypt data", "Resolve domain names to IP addresses", "Assign MAC addresses", "Route packets"],
        correctAnswer: 1,
      },
    ],
  },
];

async function seedQuizzes() {
  await mongoose.connect(MONGO_URI);

  for (const quiz of subjectQuizzes) {
    await Quiz.findOneAndUpdate(
      { title: quiz.title },
      { $set: quiz },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`Seeded quiz: ${quiz.title}`);
  }

  await mongoose.disconnect();
  console.log("Subject quiz seeding completed.");
}

seedQuizzes().catch(async (error) => {
  console.error("Failed to seed subject quizzes:", error);
  await mongoose.disconnect();
  process.exit(1);
});
