# 📝 WriteAway

**WriteAway** is a full-stack blog application built using the **MERN stack (MongoDB, Express, React, Node.js)**. It allows users to write, edit, and manage blog posts seamlessly with a responsive UI and RESTful API. The app features secure user authentication, file uploads, and image storage integration with Cloudinary.

---

## 🚀 Features

- ✍️ Create, edit, and delete blog posts
- 🔐 User authentication & authorization with **Passport.js** and **bcryptjs**
- 🖼️ File and image uploads using **Multer** and **Cloudinary**
- 🗃️ MongoDB-backed storage
- 📱 Responsive front-end using React
- ⚙️ RESTful API built with Express
- 🎯 Clean and scalable code structure

---

## 🛠️ Tech Stack

| Technology  | Description |
|-------------|-------------|
| MongoDB     | NoSQL database for storing users and posts |
| Express     | Web framework for Node.js API |
| React       | Front-end library for building UI |
| Node.js     | Backend JavaScript runtime |
| Mongoose    | ODM for MongoDB |
| Axios       | HTTP client for API communication |
| Passport.js | Middleware for handling authentication |
| bcryptjs    | Library for hashing passwords securely |
| Multer      | Middleware for handling file uploads |
| Cloudinary  | Cloud-based service for media management |

---

## 🧑‍💻 Getting Started

### Clone the repository

```bash
git clone https://github.com/your-username/WriteAway.git
cd WriteAway

# Clone the repository
git clone https://github.com/your-username/WriteAway.git

# Navigate into the project folder
cd WriteAway

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Start the server
cd ../server
node app.js

# Alternatively, use nodemon for auto-reloading
nodemon app.js

# Start the client (in a separate terminal window)
cd ../client
npm start

