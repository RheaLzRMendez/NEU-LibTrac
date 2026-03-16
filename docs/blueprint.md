# **App Name**: NEU LibTrac

## Core Features:

- Institutional Authentication: Secure login exclusively for users with '@neu.edu.ph' Google accounts. Users marked as blocked in Firestore are denied access.
- Visitor Check-in: Users can log their visit by selecting their purpose (e.g., Study, Research) and department/college. Data is recorded in Firestore.
- Welcome Notification: Display an immediate and prominent 'Welcome to NEU Library!' message upon successful check-in.
- Admin Dashboard: Centralized view for library staff displaying key visitor statistics and trends sourced from Firestore.
- Visitor Analytics & Filtering: Admins can filter visitor data by day, week, month, and view breakdowns by college/program using Firestore queries.
- User Management: Admin search for specific user logs and toggle 'isBlocked' status directly within Firestore.
- AI-Powered Trend Summaries: An admin tool that analyzes visitor data from Firestore to generate brief, actionable insights about library usage patterns.

## Style Guidelines:

- Primary color: A deep, authoritative blue (#2258C3) representing trust and academia, providing a strong brand identity.
- Background color: A very light, subtle blue-grey (#F0F4FA), creating a clean and unobtrusive canvas for content.
- Accent color: A vibrant aqua (#70EAFF) used sparingly for highlights, interactive elements, and success indicators, ensuring good contrast and visibility.
- Body and headline font: 'Inter', a neutral and objective sans-serif, ensuring optimal readability and a modern, functional aesthetic for all text elements.
- Use a set of clean, modern line icons for clear and intuitive navigation and status indicators, aligning with the system's professional character.
- Implement a structured and highly responsive layout, prioritizing data clarity for administrators and ease-of-use for mobile-first user check-ins.
- Subtle and purposeful animations to provide immediate user feedback on actions, such as successful check-ins, without being distracting.