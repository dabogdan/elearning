🌐 eLearning Platform 📚
An advanced, full-stack eLearning web application designed to offer an interactive and scalable online learning experience. Built with Django and React, this platform integrates modern web technologies like WebSockets, JWT authentication, and a RESTful API to connect students and teachers in real time.

Key Features 🚀
User Roles & Management: Teachers can create, manage, and update courses, while students can enroll, leave feedback, and interact with course content.
Real-Time Chat: Engaging live chat between students and instructors powered by Django Channels and WebSockets.
REST API: Built with Django REST Framework, enabling smooth and secure data exchange.
JWT Authentication: Secure, stateless authentication for user sessions with role-based access control.
File Uploads: Teachers can upload course materials (PDFs, images) for students to access.
Role-Based Access Control: Fine-tuned permissions for teachers and students to ensure a secure learning environment.
Responsive Frontend: Designed with React and styled using Tailwind CSS for a smooth and modern user experience.
Real-Time Notifications: Stay up to date with course updates and enrollment activities.
Installation Instructions ⚙️
Clone the repository:

bash
Copy code
git clone https://github.com/dabogdan/elearning.git
cd elearning
Backend Setup:

Create a virtual environment:
bash
Copy code
python3 -m venv venv
source venv/bin/activate
Install backend dependencies:
bash
Copy code
pip install -r requirements.txt
Apply migrations:
bash
Copy code
python manage.py makemigrations
python manage.py migrate
Create a superuser:
bash
Copy code
python manage.py createsuperuser
Start the backend server:
bash
Copy code
daphne -p 8000 elearning.asgi:application
Frontend Setup:

Navigate to the frontend directory:
bash
Copy code
cd frontend
Install frontend dependencies:
bash
Copy code
npm install
Start the frontend development server:
bash
Copy code
npm start
Redis Setup (for WebSockets):

Start Redis server:
bash
Copy code
redis-server
Verify Redis is running:
bash
Copy code
redis-cli ping
Access the app:

Frontend: http://localhost:3000
Backend API: http://localhost:8000/api
 
