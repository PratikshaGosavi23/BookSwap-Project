const axios = require("axios");

const API_KEY = "AIzaSyDYXtPzWqMG-fdtNPoengCJYDzGKKcrx7E";

async function test() {
  try {
    const res = await axios.get(
      `https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`
    );

    console.log("SUCCESS:", res.data);
  } catch (err) {
    console.log("ERROR:", err.response?.data || err.message);
  }
}

test();