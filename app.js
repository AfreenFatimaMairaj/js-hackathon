// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, query, where, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCaGWO7uKtdb5xAof_bIpzBoRzDW0v2zq4",
  authDomain: "fir-ca6ea.firebaseapp.com",
  projectId: "fir-ca6ea",
  storageBucket: "fir-ca6ea.firebasestorage.app",
  messagingSenderId: "728640167201",
  appId: "1:728640167201:web:17f5d0a6f4c98f7f227260",
  measurementId: "G-FK1W5ZM94D"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Signup function
function signup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const name = document.getElementById("name").value;
  const role = document.querySelector("input[name='role']:checked")?.value;

  if (!email || !password) {
    alert("Please fill out both email and password fields.");
    return;
  }

  if (password.length < 6) {
    alert("Password should be at least 6 characters long.");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      console.log("User signed up:", user);

      // Save user data in Firestore
      await writeData(name, email, role);
      console.log("User stored in database.");

      alert("Sign up successful! Welcome, " + user.email);
      // Redirect after signup
      window.location.pathname = "users.html";
    })
    .catch((error) => {
      console.error("Error signing up:", error.code, error.message);
      alert("Error: " + error.message);
    });
}

// Function to write data to Firestore
async function writeData(name, email, role) {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      name,
      email,
      role,
    });
    console.log("Document written with ID:", docRef.id);
  } catch (error) {
    console.error("Error adding document:", error);
  }
}

// Attach event listener to signup button
document.getElementById("signupButton")?.addEventListener("click", signup);

// Function to fetch all users
async function getAllUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const users = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

// Function to fetch a user by email
async function getUserByEmail(email) {
  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    const user = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))[0];
    console.log("Fetched user:", user);
    return user;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

// Function to show all users in a table
async function showUsers() {
  const users = await getAllUsers();
  console.log("All users:", users);

  // Render users as a table
  const list = document.getElementById("users-list");
  if (list) {
    list.innerHTML = `
      <table border="1" cellspacing="0" cellpadding="5">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          ${users
            .map(
              (user) => `
            <tr>
              <td>${user.id}</td>
              <td>${user.name}</td>
              <td>${user.email}</td>
              <td>${user.role}</td>
            </tr>`
            )
            .join("")}
        </tbody>
      </table>
    `;
  } else {
    console.error("Element with ID 'users-list' not found.");
  }
}

// Call showUsers to fetch and display users
showUsers();

// Login function
async function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please fill out both email and password fields.");
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("Signed in successfully:", user);

    // Fetch additional user data
    const userData = await getUserByEmail(email);
    console.log("Fetched user data:", userData);
    if (userData.role === 'doctor') {
          window.location.pathname = "./doctor.html";
    } else {
          window.location.pathname = "./users.html";
    }

    // Save to session storage and redirect
    sessionStorage.setItem("user", JSON.stringify(userData));
    alert("Logged in successfully!");
    // window.location.pathname = "./welcome.html";
  } catch (error) {
    console.error("Login error:", error.message);
    alert("Error: " + error.message);
  }
}

// Attach event listener to login button
document.getElementById("loginButton")?.addEventListener("click", login);