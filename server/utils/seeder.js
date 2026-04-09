// utils/seeder.js - Seed sample data into MongoDB
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');
const Book = require('../models/Book');
const SwapRequest = require('../models/SwapRequest');

const seedData = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  // Clear existing data
  await User.deleteMany({});
  await Book.deleteMany({});
  await SwapRequest.deleteMany({});
  console.log('Cleared existing data');

  // Create users
  const users = await User.create([
    {
      name: 'Arjun Sharma',
      email: 'arjun@bookswap.com',
      password: 'password123',
      bio: 'Avid reader of sci-fi and philosophy. Love discovering hidden gems.',
      location: 'Mumbai, India',
      interests: ['Science Fiction', 'Philosophy', 'Technology'],
      avatar: '',
    },
    {
      name: 'Priya Patel',
      email: 'priya@bookswap.com',
      password: 'password123',
      bio: 'Fantasy and mystery lover. Always on the lookout for my next favorite book.',
      location: 'Pune, India',
      interests: ['Fantasy', 'Mystery', 'Romance'],
      avatar: '',
    },
    {
      name: 'Rohan Mehta',
      email: 'rohan@bookswap.com',
      password: 'password123',
      bio: 'Non-fiction enthusiast. History and biographies are my jam.',
      location: 'Delhi, India',
      interests: ['History', 'Biography', 'Self-Help'],
      avatar: '',
    },
    {
      name: 'Sneha Kulkarni',
      email: 'sneha@bookswap.com',
      password: 'password123',
      bio: 'Literature graduate. I read everything from poetry to thrillers.',
      location: 'Bangalore, India',
      interests: ['Fiction', 'Poetry', 'Thriller'],
      avatar: '',
    },
  ]);

  console.log(`Created ${users.length} users`);

  // Create books
  const books = await Book.create([
    {
      title: 'Dune',
      author: 'Frank Herbert',
      description: 'Set in the distant future amidst a feudal interstellar society, Dune tells the story of young Paul Atreides on the desert planet Arrakis.',
      category: 'Science Fiction',
      condition: 'Good',
      language: 'English',
      publishedYear: 1965,
      tags: ['epic', 'space', 'desert', 'politics'],
      owner: users[0]._id,
      viewCount: 45,
    },
    {
      title: 'The Name of the Wind',
      author: 'Patrick Rothfuss',
      description: 'The tale of a magically gifted young man who grows to be the most notorious wizard his world has ever seen.',
      category: 'Fantasy',
      condition: 'Like New',
      language: 'English',
      publishedYear: 2007,
      tags: ['magic', 'adventure', 'coming-of-age'],
      owner: users[1]._id,
      viewCount: 62,
    },
    {
      title: 'Sapiens: A Brief History of Humankind',
      author: 'Yuval Noah Harari',
      description: 'A sweeping narrative of human history, from the Stone Age to the twenty-first century.',
      category: 'History',
      condition: 'Good',
      language: 'English',
      publishedYear: 2011,
      tags: ['history', 'humanity', 'evolution', 'culture'],
      owner: users[2]._id,
      viewCount: 88,
    },
    {
      title: 'The Girl with the Dragon Tattoo',
      author: 'Stieg Larsson',
      description: 'A mystery novel combining financial crime, family saga, love story, and psychological thriller.',
      category: 'Mystery',
      condition: 'Fair',
      language: 'English',
      publishedYear: 2005,
      tags: ['crime', 'thriller', 'sweden', 'detective'],
      owner: users[3]._id,
      viewCount: 71,
    },
    {
      title: 'Atomic Habits',
      author: 'James Clear',
      description: 'A practical guide to building good habits and breaking bad ones through small, incremental changes.',
      category: 'Self-Help',
      condition: 'Like New',
      language: 'English',
      publishedYear: 2018,
      tags: ['habits', 'productivity', 'psychology', 'self-improvement'],
      owner: users[2]._id,
      viewCount: 120,
    },
    {
      title: 'The Hitchhiker\'s Guide to the Galaxy',
      author: 'Douglas Adams',
      description: 'A comedic science fiction series following the hapless Arthur Dent through space after Earth is destroyed.',
      category: 'Science Fiction',
      condition: 'Good',
      language: 'English',
      publishedYear: 1979,
      tags: ['comedy', 'space', 'adventure', 'classic'],
      owner: users[0]._id,
      viewCount: 55,
    },
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      description: 'A romantic novel of manners, following Elizabeth Bennet as she deals with issues of marriage and morality in 19th-century England.',
      category: 'Romance',
      condition: 'Good',
      language: 'English',
      publishedYear: 1813,
      tags: ['classic', 'romance', 'society', 'england'],
      owner: users[1]._id,
      viewCount: 38,
    },
    {
      title: 'Educated',
      author: 'Tara Westover',
      description: 'A memoir about a young girl raised in a survivalist family in Idaho who goes on to earn a PhD from Cambridge University.',
      category: 'Biography',
      condition: 'New',
      language: 'English',
      publishedYear: 2018,
      tags: ['memoir', 'education', 'family', 'survival'],
      owner: users[3]._id,
      viewCount: 93,
    },
    {
      title: 'The Alchemist',
      author: 'Paulo Coelho',
      description: 'A philosophical novel about a young Andalusian shepherd on a journey to find his Personal Legend.',
      category: 'Fiction',
      condition: 'Like New',
      language: 'English',
      publishedYear: 1988,
      tags: ['philosophy', 'journey', 'destiny', 'inspirational'],
      owner: users[2]._id,
      viewCount: 105,
    },
    {
      title: 'Gone Girl',
      author: 'Gillian Flynn',
      description: 'A psychological thriller about a marriage gone terribly wrong, told from alternating perspectives.',
      category: 'Thriller',
      condition: 'Good',
      language: 'English',
      publishedYear: 2012,
      tags: ['psychological', 'marriage', 'crime', 'suspense'],
      owner: users[0]._id,
      viewCount: 78,
    },
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      description: 'A classic American novel set in the Jazz Age, exploring themes of wealth, class, love, and the American Dream.',
      category: 'Fiction',
      condition: 'Fair',
      language: 'English',
      publishedYear: 1925,
      tags: ['classic', 'american', 'wealth', 'dreams'],
      owner: users[1]._id,
      viewCount: 42,
    },
    {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      description: 'A handbook of agile software craftsmanship, teaching developers how to write clean, readable, and maintainable code.',
      category: 'Technology',
      condition: 'Good',
      language: 'English',
      publishedYear: 2008,
      tags: ['programming', 'software', 'coding', 'best-practices'],
      owner: users[3]._id,
      viewCount: 67,
    },
  ]);

  // Update users' booksOwned arrays
  await User.findByIdAndUpdate(users[0]._id, { booksOwned: [books[0]._id, books[5]._id, books[9]._id] });
  await User.findByIdAndUpdate(users[1]._id, { booksOwned: [books[1]._id, books[6]._id, books[10]._id] });
  await User.findByIdAndUpdate(users[2]._id, { booksOwned: [books[2]._id, books[4]._id, books[8]._id] });
  await User.findByIdAndUpdate(users[3]._id, { booksOwned: [books[3]._id, books[7]._id, books[11]._id] });

  console.log(`Created ${books.length} books`);

  // Create a sample swap request
  await SwapRequest.create({
    requester: users[0]._id,
    owner: users[1]._id,
    requestedBook: books[1]._id,
    offeredBook: books[0]._id,
    message: "Hi! I'd love to swap Dune for The Name of the Wind. Both are epic fantasy/sci-fi reads!",
    status: 'pending',
  });

  console.log('Created sample swap request');

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📧 Test Accounts:');
  console.log('   arjun@bookswap.com / password123');
  console.log('   priya@bookswap.com / password123');
  console.log('   rohan@bookswap.com / password123');
  console.log('   sneha@bookswap.com / password123');

  await mongoose.disconnect();
  process.exit(0);
};

seedData().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
