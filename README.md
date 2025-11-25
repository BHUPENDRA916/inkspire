# CampusEats - Canteen Pre-Order MVP (v1)

Welcome to **CampusEats**, a production-ready MVP for a campus food pre-ordering system.  
Built using the **MERN stack** with a seamless real-time experience through **short polling**.

---

## 🚀 Tech Stack

### **Frontend**
- React 18  
- React Router  
- Redux Toolkit (RTK)  
- Tailwind CSS  
- Axios  
- Vite

### **Backend**
- Node.js  
- Express  
- MongoDB (Mongoose)  
- JSON Web Tokens (JWT)

### **Database**
- MongoDB (Local or Atlas)

### **Payments**
- UPI Intent Links  
- (No payment gateway integration)

---

## 📌 Features

### **Role-Based Access**
- **STUDENT**
- **MANAGER**
- **ADMIN**

---

### 🎓 **Student Features**
- Browse all canteens  
- View menus  
- Add items to cart (RTK + localStorage persistence)  
- Checkout (UPI or Cash)  
- Track order status (polling every 5 seconds)  

---

### 👨‍🍳 **Manager Features**
- View analytics dashboard:  
  - Total Orders  
  - Total Revenue  
- Live incoming order feed (5s polling)  
- Update order status (Pending → Completed)  
- Manage menu (CRUD)  
- Update canteen settings  

---

### 🛠️ **Admin Features**
- Platform-wide analytics:  
  - Total canteens  
  - Total students  
  - Total orders  
  - Total revenue  
- Create new canteens  
- Add manager accounts  

---

## ⚡ "Real-Time" Updates

The app uses **short-polling (every 5 seconds)** for:
- Student order tracking  
- Manager dashboard stats  
- Manager incoming order list  

---

## 📁 Project Structure

```
campuseats-mvp/
├── client/ # React Frontend (Vite)
│ ├── public/
│ ├── src/
│ │ ├── api/ # API client
│ │ ├── components/ # Reusable components
│ │ ├── pages/ # Page components (by role)
│ │ ├── store/ # Redux Toolkit store + slices
│ │ │ ├── authSlice.js
│ │ │ ├── cartSlice.js
│ │ │ └── store.js
│ │ ├── App.jsx
│ │ ├── index.css
│ │ └── main.jsx
│ ├── .env.development
│ ├── index.html
│ ├── package.json
│ └── tailwind.config.js
│
├── server/ # Node.js/Express Backend
│ ├── config/
│ ├── controllers/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ ├── seed-local.js
│ ├── .env.example
│ ├── package.json
│ └── server.js
│
└── .gitignore
```

---

## ⚙️ Setup & Installation

### **1. Prerequisites**
- Node.js (v18+)
- npm / yarn  
- MongoDB (Local or Atlas)

---

### **2. Backend Setup (`server/`)**

Navigate to server folder:

```sh
cd server
```
Install dependencies:

```sh
npm install
```
Create `.env` file:

```ini
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_strong_jwt_secret
CORS_ORIGIN=http://localhost:5173
```
Note: `CORS_ORIGIN` must match your frontend URL.

Start backend server:
```sh
npm run dev
```
Your backend runs at: `http://localhost:5000`

---

### **3. Frontend Setup (`client/`)**
Navigate into client:

```sh
cd client
```
Install dependencies:

```sh
npm install
```
Create `.env`:

```ini
VITE_API_URL=http://localhost:5000
```
Start frontend:

```sh
npm run dev
```
Your frontend runs at: `http://localhost:5173`

---

### **4. (Optional) Run Seed Script**
The seed script populates the database with initial data (canteens, menus, users).

From the **root folder** of the project, run:
```sh
node server/seed-local.js
```
This will connect to your MongoDB instance and insert the sample data.

---

### 🔐 JWT & State Management
**Auth State**: stored in Redux Toolkit + localStorage

**JWT Token**: stored in localStorage (for MVP simplicity)

**Cart State**: RTK slice + localStorage persistence

For production → prefer httpOnly cookies to avoid XSS risks.

---

### 📡 API Endpoints Summary
**Auth**
- `POST /auth/register`
- `POST /auth/login`

**Public (Student/All)**
- `GET /student/canteens`
- `GET /student/canteens/:id`
- `GET /student/canteens/:id/menu`

**Student (Protected)**
- `POST /student/orders`
- `GET /student/orders`
- `GET /student/orders/:id`

**Manager (Protected)**
- `GET /manager/stats`
- `GET /manager/orders`
- `PATCH /manager/orders/:id/status`
- `GET /manager/menu`
- `POST /manager/menu`
- `PUT /manager/menu/:id`
- `DELETE /manager/menu/:id`
- `GET /manager/canteen`
- `PUT /manager/canteen`

**Admin (Protected)**
- `GET /admin/stats`
- `POST /admin/canteens`
- `POST /admin/users/manager`
