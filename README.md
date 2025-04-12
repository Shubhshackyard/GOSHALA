# GOSHALA - Cow Shelter Management System

![GOSHALA Logo](https://github.com/Shubhshackyard/GOSHALA/blob/main/client/src/assets/images/goshala-logo.png)

GOSHALA (Generating Organic Sustainable Help for Agriculture and Local Advancement) is a platform that connects conscious consumers with authentic gaushala products. The project aims to support traditional cow shelters across India by creating a transparent marketplace and knowledge-sharing community.

## 🌟 Features

- **Authenticated Marketplace** - Direct connection between consumers and verified gaushalas
- **Community Forum** - Knowledge sharing between farmers, gaushala operators, and consumers
- **User Profiles** - Specialized interfaces for producers, consumers, and administrators
- **Product Management** - Tools for gaushalas to manage and track their product offerings
- **Transparent Supply Chain** - Visibility into product sourcing and production methods
- **Multi-language Support** - Interface available in multiple languages to serve diverse audiences

## 🛠️ Technology Stack

### Frontend
- React.js with TypeScript
- Material UI for component library
- React Router for navigation
- i18next for internationalization
- Framer Motion for animations

### Backend
- Node.js with Express
- MongoDB for database
- JWT for authentication
- Multer for file uploads
- Mongoose for MongoDB object modeling

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Shubhshackyard/GOSHALA.git
   cd GOSHALA
   ```

2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```

3. Set up environment variables:
   Create a .env file in the server directory with:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/goshaladb
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   ```

4. Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```

5. Start development servers:
   ```bash
   # In server directory
   npm run dev
   
   # In client directory (different terminal)
   npm run dev
   ```

6. The application should now be running at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
CowShedMgmt/
│
├── client/                 # Frontend React application
│   ├── public/             # Public assets
│   └── src/
│       ├── assets/         # Static assets (images, etc.)
│       ├── components/     # Reusable components
│       ├── contexts/       # React contexts (auth, etc.)
│       ├── pages/          # Page components
│       ├── services/       # API services
│       └── utils/          # Utility functions
│
└── server/                 # Backend Node.js application
    ├── controllers/        # API controllers
    ├── models/             # Mongoose models
    ├── routes/             # API routes
    ├── middlewares/        # Custom middleware
    └── utils/              # Utility functions
```

## 📝 Usage

### User Types

1. **Consumers**
   - Browse marketplace products
   - Participate in the community forum
   - Purchase products from verified gaushalas

2. **Producers (Gaushalas)**
   - Create and manage product listings
   - Engage with consumers
   - Access order management

3. **Administrators**
   - Verify producers
   - Moderate the forum
   - Manage user accounts

## 🤝 Contributing

We welcome contributions to GOSHALA! Please check out our Contributing Guidelines for details.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- [Shubhi Satvik](https://github.com/Shubhshackyard)
- [Rakesh Mishra] (https://www.linkedin.com/in/rakeshmishra3)

## 🙏 Acknowledgments

- All the traditional gaushalas providing valuable inputs
- Our beta testers and community members

---

For questions or support, please [open an issue](https://github.com/Shubhshackyard/GOSHALA/issues) on GitHub.