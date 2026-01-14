# Report: Milestone 2 Implementation Plan

**Objective:** Implement Team and User Management features as outlined in Milestone 2 of the `TODO.md` file.

**1. Authentication (JWT)**

*   **1.1. Add Authentication Dependencies:** Install `jsonwebtoken` for creating and verifying JSON Web Tokens, and `bcrypt` for securely hashing user passwords.
*   **1.2. Create Authentication Routes:**
    *   `POST /api/auth/register`: Create a new user, hash their password, and save them to the database. Return a JWT.
    *   `POST /api/auth/login`: Validate user credentials, and if successful, return a JWT.
    *   `POST /api/auth/logout`: This will be handled on the client-side by deleting the JWT, but we can have a placeholder endpoint for completeness.
*   **1.3. Create Authentication Middleware:**
    *   Create a middleware function that checks for a valid JWT in the `Authorization` header.
    *   If the token is valid, it will decode the payload (which will contain the user ID) and attach the user object to the `request` object for use in subsequent route handlers.
    *   If the token is missing or invalid, it will return a `401 Unauthorized` error.
*   **1.4. Secure Existing Routes:**
    *   Apply the authentication middleware to all existing data-related routes (trips, expenses, notes, etc.).
    *   Modify the route handlers to use the `userId` from the authenticated `req.user` object instead of accepting it from the request body. This is a critical security fix.

**2. Team Management**

*   **2.1. Create Team Management Routes:**
    *   `POST /api/teams`: Create a new team. The creator will be assigned the 'Owner' role.
    *   `GET /api/teams`: Get all teams for the authenticated user.
    *   `GET /api/teams/:teamId`: Get details for a specific team.
    *   `PUT /api/teams/:teamId`: Update a team's details. (Requires 'Owner' or 'Admin' role).
    *   `DELETE /api/teams/:teamId`: Delete a team. (Requires 'Owner' role).
*   **2.2. Implement Team Invitations:**
    *   This will be a future enhancement and is not in the immediate scope of Milestone 2 API work. For now, users can be manually added to teams.

**3. Roles and Rosters**

*   **3.1. Seed Default Roles:**
    *   Update the `prisma/seed.cjs` script to create a default set of roles: "Owner", "Driver", "Pit Boss", "Mechanic".
*   **3.2. Create Role/Roster Management Routes:**
    *   `GET /api/teams/:teamId/roster`: View the team roster with member roles.
    *   `POST /api/teams/:teamId/members`: Add a user to a team with a specific role. (Requires 'Owner' or 'Admin' role).
    *   `PUT /api/teams/:teamId/members/:userId`: Update a team member's role. (Requires 'Owner' or 'Admin' role).
    *   `DELETE /api/teams/:teamId/members/:userId`: Remove a user from a team. (Requires 'Owner' or 'Admin' role).
*   **3.3. Implement Authorization Middleware (RBAC):**
    *   Create a role-based access control (RBAC) middleware.
    *   This middleware will check if the authenticated user has the required role (e.g., 'Owner') to perform a specific action.
    *   It will be applied to routes that require specific permissions, like deleting a team or managing team members.

**4. Mobile Compatibility and Future Features**

*   **4.1. Mobile App Compatibility:** The proposed JWT-based authentication is a standard, token-based approach that is well-suited for mobile applications. The mobile app will be responsible for storing the JWT securely and including it in the `Authorization` header of all API requests.
*   **4.2. Single Sign-On (SSO):** Implementing SSO (e.g., with Google or Apple) adds significant complexity and should be deferred to a future milestone. The current JWT authentication system is a necessary foundation for any future SSO integration.
