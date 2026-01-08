# PitPass Project Roadmap

The goal of PitPass is to be the one-stop place for a racing team or owner to consolidate all of their racing events, expenses, and data to get a big-picture understanding of their racing operations.

## Milestone 1: Core Data Model & API Foundation (Complete)

This milestone focuses on establishing a strong, relational database schema and a clean API structure that can support future growth.

-   [x] **Design Relational Schema:**
    -   [x] Define core models in `schema.prisma`: `Team`, `User`, `TeamMembership`, `Role`, `Car`, `Track`, `Trip`, `TripStop`, `Expense`, `Note`, `RaceResult`.
    -   [x] Establish relationships:
        -   `User` can be in many `Teams` through `TeamMembership`.
        -   `TeamMembership` has one or more `Roles`. One role should be primary.
        -   `Team` has a one-to-many relationship with `Cars`.
        -   `Trip` is composed of one or more `TripStops`. Each `TripStop` points to a `Track`, allowing for multi-leg journeys.
        -   `Trip` has many `Expenses` and `Notes`.
        -   `Car` has related maintenance and setup models.
        -   `RaceResult` is linked to a `TripStop` and a `Car`.
-   [x] **API Refactoring:**
    -   [x] Restructure all Express routes to be RESTful and nested logically (e.g., `/api/trips/:tripId/stops/:stopId/expenses`).
    -   [x] Implement robust input validation (e.g., using `zod`) on all API endpoints.
    -   [x] Create a centralized error-handling middleware.
-   [x] **Configuration Management:**
    -   [x] Externalize all secrets and configuration (database URL, API keys, JWT secret) using environment variables (`.env` file).

## Milestone 2: Team and User Management

-   [ ] **Authentication:**
    -   [ ] Implement JWT-based authentication (`login`, `register`, `logout`).
    -   [ ] Track the `User` making each data entry.
-   [ ] **Team Functionality:**
    -   [ ] API endpoints for creating and managing a `Team`.
    -   [ ] Implement a system for inviting new `Users` to a `Team`.
-   [ ] **Roles and Rosters:**
    -   [ ] Define a default set of `Roles` ("owner", "driver", "pit boss", etc.).
    -   [ ] API and UI for assigning multiple roles to `TeamMembers`, including a "primary" role.
    -   [ ] API and UI to view the `Team` roster.

## Milestone 3: Car, Maintenance, and Performance Tracking

-   [ ] **Car Management:**
    -   [ ] API and UI to add/edit/remove `Cars` associated with a `Team`.
-   [ ] **Maintenance Tracking:**
    -   [ ] Create models for `MaintenanceEvent` (e.g., oil change, valve spring change, motor refresh).
    -   [ ] API and UI to log maintenance events with date and notes.
    -   [ ] Track "laps completed under power" for each `RaceResult`.
    -   [ ] Develop logic to calculate and display laps on motor/components since the last maintenance event.
-   [ ] **Car Setup Metrics:**
    -   [ ] Create a `CarSetup` model linked to a `Car` and a `RaceResult`/`TripStop`.
    -   [ ] API and UI to record setup details: tire compound/sizes, offset, spring rates, ride heights, shock rates, gear ratio.
-   [ ] **Race Results:**
    -   [ ] API and UI to log detailed race results:
        -   Hot Laps: laps, time, notes on changes.
        -   Qualifying: laps, time, position, notes on changes.
        -   Heat Race(s): start/end position, laps (support for multiple heats).
        -   Feature Race: laps, best lap, position, notes on damage/behavior.

## Milestone 4: Trip & Event Logistics

-   [ ] **Track Management:**
    -   [ ] API and UI for creating and managing a list of `Tracks` including their location.
    -   [ ] Store a "home shop" location for each `Team`.
-   [ ] **Trip Management:**
    -   [ ] Full CRUD API and UI for `Trips`, which are containers for one or more `TripStops`.
    -   [ ] Associate a roster of `TeamMembers` who were on a specific `Trip`.
    -   [ ] Implement logic to calculate trip distance from "home shop" to `Track` (requires maps integration).
-   [ ] **Expense Management:**
    -   [ ] CRUD API and UI for expenses.
    -   [ ] Ability to upload photos of receipts when creating an expense entry.
-   [ ] **Notes and Lists:**
    -   [ ] Use the `Note` model for trip-specific "Repairs Made".
    -   [ ] Create a separate `ShoppingListItem` model and associate it with a `Team` for a persistent shopping list.

## Milestone 5: Advanced Integrations & Reporting

-   [ ] **External API Integrations:**
    -   [ ] Integrate with the **MyRacePass API** to automate fetching race results.
    -   [ ] Integrate with a weather service (e.g., OpenWeatherMap) to fetch and store weather conditions for a `Track` on race day.
    -   [ ] Integrate with a mapping service (e.g., Google Maps API) for distance calculations.
-   [ ] **Reporting Engine:**
    -   [ ] Develop dedicated backend endpoints for data aggregation.
    -   [ ] Simple reports: What tracks has the team been to? When?
    -   [ ] Advanced reports: Correlate car setup, weather, and results.
    -   [ ] Expense reporting by trip, by month, by category.

## Milestone 6: Frontend Implementation

-   [ ] **Mobile App Scaffolding:**
    -   [ ] Create the initial mobile app project (e.g., using React Native or Flutter).
    -   [ ] Establish design system/framework and boilerplate structure.
-   [ ] **Mobile-First Data Entry:**
    -   [ ] Design and build simple, fast UI for entering data on a mobile device (expenses, maintenance, setups, results).
-   [ ] **Web-Based Reporting Dashboard:**
    -   [ ] Design and build a comprehensive dashboard for desktop viewing, focusing on rich data visualization for reports.
    -   [ ] Provide web views for managing team rosters, cars, and the master schedule.

## Milestone 7: Business & Product Strategy

-   [ ] **Go-to-Market Research:**
    -   [ ] Research and document Google Play Store & Apple App Store publishing requirements.
-   [ ] **Financial Planning:**
    -   [ ] Estimate monthly operational costs (GCE, Vercel, API fees, data storage, etc.).
    -   [ ] Develop a subscription-based pricing scheme to ensure profitability.

## Cross-Cutting Concerns

-   [x] **Testing:**
    -   [x] Set up testing frameworks for frontend (Vitest) and backend (Jest).
    -   [x] Integrated into CI/CD pipeline.
    -   [ ] Write unit and integration tests for all new features.
-   [ ] **CI/CD:**
    -   [x] Enhance `deploy.yml` to run tests and linting on every commit.
    -   [ ] Automate database migrations in the deployment process.
-   [ ] **Pagination:**
    -   [ ] Implement pagination on all API endpoints that return lists.
-   [ ] **Date Input Enhancement:** Implement a "today" button or a calendar picker for date input fields to improve user experience and reduce manual typing.