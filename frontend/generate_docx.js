import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  ShadingType,
  Header,
  Footer,
  PageNumber,
} from "docx";
import fs from "fs";
import path from "path";

const PRIMARY = "4F46E5";
const SECONDARY = "0F172A";
const TEXT_MUTED = "64748B";
const BORDER_COLOR = "CBD5E1";
const BG_ALT = "F8FAFC";
const HEADER_BG = "EEF2FF";

function createHeading1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 140 },
    run: {
      color: PRIMARY,
      bold: true,
      size: 32, // 16pt
      font: "Segoe UI",
    },
  });
}

function createHeading2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 100 },
    run: {
      color: SECONDARY,
      bold: true,
      size: 26, // 13pt
      font: "Segoe UI",
    },
  });
}

function createHeading3(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    run: {
      color: PRIMARY,
      bold: true,
      size: 22, // 11pt
      font: "Segoe UI",
    },
  });
}

function createParagraph(text, options = {}) {
  return new Paragraph({
    spacing: { after: 120, line: 280 },
    children: [
      new TextRun({
        text,
        size: 22, // 11pt
        font: "Segoe UI",
        color: options.color || SECONDARY,
        bold: options.bold || false,
        italics: options.italics || false,
      }),
    ],
  });
}

function createBullet(text, boldPrefix = "") {
  const children = [];
  if (boldPrefix) {
    children.push(
      new TextRun({
        text: boldPrefix + ": ",
        bold: true,
        size: 22,
        font: "Segoe UI",
        color: SECONDARY,
      })
    );
  }
  children.push(
    new TextRun({
      text,
      size: 22,
      font: "Segoe UI",
      color: SECONDARY,
    })
  );

  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80, line: 260 },
    children,
  });
}

function createTable(headers, rows) {
  const tableRows = [];

  // Header Row
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: headers.map(
        (h) =>
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: HEADER_BG },
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR },
              bottom: { style: BorderStyle.SINGLE, size: 12, color: PRIMARY },
              left: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR },
              right: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR },
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: h,
                    bold: true,
                    size: 20,
                    font: "Segoe UI",
                    color: PRIMARY,
                  }),
                ],
              }),
            ],
          })
      ),
    })
  );

  // Data Rows
  rows.forEach((r, idx) => {
    const isEven = idx % 2 === 0;
    tableRows.push(
      new TableRow({
        children: r.map(
          (c) =>
            new TableCell({
              shading: isEven ? { type: ShadingType.CLEAR, fill: "FFFFFF" } : { type: ShadingType.CLEAR, fill: BG_ALT },
              margins: { top: 100, bottom: 100, left: 160, right: 160 },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
                left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
                right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: String(c),
                      size: 20,
                      font: "Segoe UI",
                      color: SECONDARY,
                    }),
                  ],
                }),
              ],
            })
        ),
      })
    );
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
  });
}

async function generateDocx() {
  const doc = new Document({
    creator: "EventSphere Engineering Team",
    title: "EventSphere Platform Documentation",
    description: "Enterprise Event Registration & Ticket Booking Platform Specification",
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "EventSphere — Technical Documentation",
                    size: 18,
                    color: TEXT_MUTED,
                    font: "Segoe UI",
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "Page ",
                    size: 18,
                    color: TEXT_MUTED,
                    font: "Segoe UI",
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: TEXT_MUTED,
                    font: "Segoe UI",
                  }),
                  new TextRun({
                    text: " of ",
                    size: 18,
                    color: TEXT_MUTED,
                    font: "Segoe UI",
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 18,
                    color: TEXT_MUTED,
                    font: "Segoe UI",
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Document Header / Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: "EVENTSPHERE",
                bold: true,
                size: 54, // 27pt
                color: PRIMARY,
                font: "Segoe UI",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 360 },
            children: [
              new TextRun({
                text: "Enterprise Event Registration & Ticket Booking Platform",
                bold: true,
                size: 28, // 14pt
                color: SECONDARY,
                font: "Segoe UI",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 480 },
            children: [
              new TextRun({
                text: "Full-Stack System Architecture, Database Design & Operational Manual | Version 1.0",
                italics: true,
                size: 20,
                color: TEXT_MUTED,
                font: "Segoe UI",
              }),
            ],
          }),

          // SECTION 1: EXECUTIVE SUMMARY
          createHeading1("1. Executive Summary"),
          createParagraph(
            "EventSphere is a high-concurrency, enterprise-grade event discovery and ticket management platform engineered to deliver seamless attendee ticketing, organizer event lifecycle management, and platform governance. Built with modern full-stack technologies, it bridges audiences and event producers with instantaneous digital reservations, atomic seat decrements, and transparent audit logging."
          ),
          createBullet("Instant Event Discovery across Tech, Music, Business, Sports, Design, and Education.", "Core Objective"),
          createBullet("Atomic ticket purchase transactions with concurrency control and real-time inventory decrementing.", "Ticketing Engine"),
          createBullet("Dedicated portals for Attendees (User), Event Producers (Organizer), and System Administrators (Admin).", "Role Governance"),
          createBullet("Comprehensive activity audit logging and real-time administrative metrics dashboard.", "Observability"),

          // SECTION 2: TECH STACK
          createHeading1("2. Technology Stack & Specifications"),
          createParagraph(
            "The platform leverages modern, industry-standard frameworks ensuring high performance, sub-second latency, and scalable maintainability."
          ),
          createTable(
            ["Layer", "Framework / Tool", "Version", "Role in System"],
            [
              ["Frontend UI", "React", "19.2.8", "Component-based reactive client interface"],
              ["Build Engine", "Vite", "8.3.2", "Sub-second HMR and rollup production bundle"],
              ["Routing", "React Router DOM", "7.18.4", "Declarative SPA client routing"],
              ["Icons", "Lucide React", "1.51.0", "Accessible SVG vector iconography"],
              ["HTTP Client", "Axios", "1.20.0", "RESTful communication with backend"],
              ["Backend Framework", "Spring Boot", "4.1.1", "Enterprise REST API microservice"],
              ["Runtime", "Java JDK", "21 LTS", "High-throughput Java virtual machine"],
              ["Persistence", "Spring Data JPA", "Hibernate 7.4", "ORM mapping and automated schema sync"],
              ["Database", "MySQL / MariaDB", "3306", "ACID-compliant relational storage"],
              ["Security", "Spring Security", "6.x", "BCrypt hashing, CORS filter, authorization"]
            ]
          ),

          // SECTION 3: SYSTEM ARCHITECTURE
          createHeading1("3. System Architecture & High-Level Design"),
          createParagraph(
            "EventSphere operates on a decoupled client-server architecture. The React SPA communicates asynchronously via JSON REST APIs with the Spring Boot backend on port 8080, backed by a normalized MySQL relational database on port 3306."
          ),
          createBullet("Client Tier (Port 5173): React 19 SPA running on Vite, handling route rendering, state management, and real-time ticket quantity calculations.", "Frontend"),
          createBullet("Gateway & Security Tier: Spring Security filter chain enforcing CORS whitelisting, preventing cross-site scripting, and routing API calls.", "Security Layer"),
          createBullet("Microservice Controllers (Port 8080): RESTful endpoints split by domain (/api/users, /api/events, /api/bookings, /api/admin).", "Application Layer"),
          createBullet("Database Tier (Port 3306): MySQL relational database with HikariCP connection pooling, foreign key integrity, and automated schema synchronization.", "Data Tier"),

          // SECTION 4: DATABASE SCHEMA & ENTITIES
          createHeading1("4. Database Design & Relational Tables"),
          createParagraph(
            "The schema consists of 5 normalized relational tables ensuring referential integrity and zero data anomalies."
          ),
          createHeading2("4.1 Table: users"),
          createTable(
            ["Column Name", "Data Type", "Constraints", "Description"],
            [
              ["id", "BIGINT", "PRIMARY KEY, AUTO_INCREMENT", "Unique user identifier"],
              ["name", "VARCHAR(255)", "NOT NULL", "Full display name"],
              ["email", "VARCHAR(255)", "NOT NULL, UNIQUE", "Login credential email"],
              ["password", "VARCHAR(255)", "NOT NULL", "BCrypt salted password hash"],
              ["phone", "VARCHAR(50)", "OPTIONAL", "Contact phone number"],
              ["role", "VARCHAR(50)", "DEFAULT 'USER'", "USER | ORGANIZER | ADMIN"],
              ["status", "VARCHAR(50)", "DEFAULT 'ACTIVE'", "ACTIVE | SUSPENDED"],
              ["created_at", "DATETIME(6)", "NOT NULL", "Registration timestamp"]
            ]
          ),
          createHeading2("4.2 Table: events"),
          createTable(
            ["Column Name", "Data Type", "Constraints", "Description"],
            [
              ["id", "BIGINT", "PRIMARY KEY, AUTO_INCREMENT", "Unique event identifier"],
              ["title", "VARCHAR(255)", "NOT NULL", "Title of the gathering"],
              ["description", "VARCHAR(2000)", "OPTIONAL", "Comprehensive event agenda"],
              ["category", "VARCHAR(100)", "NOT NULL", "Technology, Music, Sports, etc."],
              ["location", "VARCHAR(255)", "NOT NULL", "Venue and city"],
              ["event_date", "DATETIME(6)", "NOT NULL", "Scheduled date and time"],
              ["ticket_price", "DOUBLE", "NOT NULL", "Price per single ticket (INR)"],
              ["total_tickets", "INT", "NOT NULL", "Maximum venue capacity"],
              ["available_tickets", "INT", "NOT NULL", "Remaining purchasable seats"],
              ["organizer_id", "BIGINT", "FOREIGN KEY", "Links to organizing user ID"]
            ]
          ),
          createHeading2("4.3 Table: bookings"),
          createTable(
            ["Column Name", "Data Type", "Constraints", "Description"],
            [
              ["id", "BIGINT", "PRIMARY KEY, AUTO_INCREMENT", "Unique booking reservation ID"],
              ["user_id", "BIGINT", "NOT NULL, FK to users", "Purchasing attendee"],
              ["event_id", "BIGINT", "NOT NULL, FK to events", "Target event reserved"],
              ["number_of_tickets", "INT", "NOT NULL", "Quantity of tickets booked"],
              ["total_amount", "DOUBLE", "NOT NULL", "Calculated total price (INR)"],
              ["status", "VARCHAR(50)", "DEFAULT 'CONFIRMED'", "CONFIRMED | CANCELLED"],
              ["booking_date", "DATETIME(6)", "NOT NULL", "Timestamp of transaction"]
            ]
          ),

          // SECTION 5: ROLE-BASED ACCESS CONTROL
          createHeading1("5. Role-Based Access Control (RBAC)"),
          createParagraph(
            "EventSphere defines clear operational boundaries between three distinct user personas."
          ),
          createTable(
            ["User Role", "Target Audience", "Authorized Privileges"],
            [
              ["USER", "Event Attendees", "Browse events, book tickets, view tickets in wallet with QR, export PDF pass, cancel booking."],
              ["ORGANIZER", "Event Hosts & Producers", "Access Organizer Portal, create and publish events, update venues and prices, track live ticket sales."],
              ["ADMIN", "System Administrators", "Supervise platform metrics, manage user roles, toggle account status (ACTIVE/SUSPENDED), inspect audit logs, update global platform settings."]
            ]
          ),

          // SECTION 6: API CATALOG
          createHeading1("6. RESTful API Catalog"),
          createParagraph(
            "All endpoints communicate with JSON payloads and standard HTTP response status codes."
          ),
          createTable(
            ["Method", "Endpoint URI", "Description", "Status Code"],
            [
              ["POST", "/api/users/register", "Registers a new user or organizer", "201 Created"],
              ["POST", "/api/users/login", "Authenticates credentials and returns user role", "200 OK"],
              ["POST", "/api/users/reset-password", "Resets user password after verification", "200 OK"],
              ["GET", "/api/events", "Returns list of all active catalog events", "200 OK"],
              ["GET", "/api/events/{id}", "Retrieves specific event detail by ID", "200 OK"],
              ["POST", "/api/events", "Creates new event (Organizer/Admin)", "201 Created"],
              ["PUT", "/api/events/{id}", "Updates existing event details & capacity", "200 OK"],
              ["DELETE", "/api/events/{id}", "Deletes event and associated records", "204 No Content"],
              ["POST", "/api/bookings", "Reserves tickets with atomic inventory check", "201 Created"],
              ["GET", "/api/bookings", "Lists all bookings across platform (Admin)", "200 OK"],
              ["GET", "/api/bookings/user/{id}", "Lists attendee's personal booking history", "200 OK"],
              ["PUT", "/api/bookings/{id}/cancel", "Cancels booking and releases tickets back", "200 OK"],
              ["GET", "/api/admin/stats", "Returns platform totals (Revenue, Users, Events)", "200 OK"],
              ["GET", "/api/admin/users", "Lists all user accounts with roles and statuses", "200 OK"],
              ["PUT", "/api/admin/users/{id}/role", "Updates user account role (USER/ORGANIZER/ADMIN)", "200 OK"],
              ["PUT", "/api/admin/users/{id}/status", "Sets status to ACTIVE or SUSPENDED", "200 OK"],
              ["GET", "/api/admin/activity-logs", "Returns immutable system audit logs", "200 OK"]
            ]
          ),

          // SECTION 7: STEP-BY-STEP EXECUTION
          createHeading1("7. Step-by-Step Execution & Deployment Procedure"),
          createParagraph("To run and test the complete EventSphere platform:"),
          createBullet("Start MySQL service on port 3306 (via XAMPP or Windows Service) and verify database 'eventsphere' exists.", "1. Database"),
          createBullet("Navigate to 'Backend/EventSphere' and run '.\\mvnw.cmd spring-boot:run'. Backend activates on port 8080.", "2. Backend"),
          createBullet("Navigate to 'frontend' and run 'npm install' followed by 'npm run dev'. Vite activates on port 5173.", "3. Frontend"),
          createBullet("Open browser at 'http://localhost:5173' to test browsing, registration, ticket booking, and admin management.", "4. Application"),

          // SECTION 8: VERIFICATION & TESTING
          createHeading1("8. Verification & Test Report"),
          createParagraph(
            "The platform has been rigorously audited and verified across all functional layers."
          ),
          createBullet("Spring Boot Data JPA integration tests completed with BUILD SUCCESS. MySQL connection pool verified via HikariCP.", "Backend Status: PASS"),
          createBullet("All React Hook compliance audits passed (0 errors) and Vite production bundle generated cleanly in under 1 second.", "Frontend Status: PASS"),
          createBullet("End-to-end API test calls on /api/events and /api/bookings returned HTTP 200 OK with live database records.", "API Integration: PASS"),
          createBullet("Pass-to-hash verification via BCryptPasswordEncoder tested and confirmed active.", "Security: PASS")
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.resolve("..", "EventSphere_Documentation.docx");
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document created successfully at: ${outputPath}`);
}

generateDocx().catch((err) => {
  console.error("Error generating docx:", err);
  process.exit(1);
});
