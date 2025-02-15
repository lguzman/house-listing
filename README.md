Project Title
House-Listing


Description
The House-Listing is a simple web application that allows users to browse, list, and manage property listings. It includes user authentication and role-based access control. Admins and agents can create, edit, and delete listings, while regular users can view and like properties.


This project is managed using GitHub for version control:  https://github.com/lguzman/house-listing

The project is deployed on Heroku for hosting: https://house-listing-c089d8e3de6d.herokuapp.com/        


Features
User Authentication – Secure login, registration, and role-based access control (user, agent, admin).
Property Listings Management – Users can list properties, and agents/admins can manage them.
Image Uploads – Agents and admins can upload property images.
Dynamic Navigation – Navbar updates based on user login status and role.
Secure Sessions – Express sessions for authentication persistence.


Usage
Home Page – View the main dashboard and navigate to property listings.
Sign Up & Login – Create an account and log in to access features.
Browse Listings – View available properties for sale or rent.
List a Property – Users can create a listing (admins/agents can edit/delete listings).
Manage Listings – Agents and admins have full CRUD capabilities.
Logout – Securely log out from the session.



Tech Stack
Backend: Node.js, Express
Database: MySQL
Frontend: EJS (Embedded JavaScript Templates)
Authentication: Express Sessions, bcrypt
Other: Multer (for image uploads), dotenv (for environment variables)






