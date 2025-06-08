Setup Instructions
Follow these steps to set up and run the Inventory Management project locally:

Clone the Repository
    git clone https://github.com/Sanath-Sekhige/Inventory-Management.git
    cd inventory-app

Install Dependencies
    npm install

Configure Environment Variables
Create a .env.local file in the root directory of the project and add the following content:
    DB_HOST=<your_database_host>         # e.g., 127.0.0.1
    DB_USER=<your_database_username>     # e.g., root
    DB_PASSWORD=<your_database_password> # e.g., 1470plmnko
    DB_NAME=<your_database_name>         # e.g., inventory_db

Start the Development Server
    npm run dev