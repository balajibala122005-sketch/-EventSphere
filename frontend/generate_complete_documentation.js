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
  PageBreak,
} from "docx";
import fs from "fs";
import path from "path";

// Professional Enterprise Theme Colors
const PRIMARY = "1E3A8A";       // Deep Classic Navy
const SECONDARY = "1E40AF";     // Royal Blue
const ACCENT = "2563EB";        // Bright Brand Blue
const TEXT_DARK = "0F172A";     // Slate 900
const TEXT_BODY = "334155";     // Slate 700
const TEXT_MUTED = "64748B";    // Slate 500
const BORDER_COLOR = "CBD5E1";  // Slate 300
const BG_HEADER = "1E3A8A";     // Dark Navy Table Header
const BG_HEADER_LIGHT = "F1F5F9";// Soft Slate Header
const BG_ZEBRA = "F8FAFC";      // Very Light Slate Row
const BG_CODE = "F8FAFC";       // Code Block Background
const BG_CALLOUT = "EFF6FF";    // Light Blue Callout
const BG_SUCCESS = "F0FDF4";    // Light Green Callout
const BG_WARNING = "FFFBEB";    // Light Amber Callout

const FONT_PRIMARY = "Calibri";
const FONT_CODE = "Consolas";

// ==========================================
// STYLED COMPONENT BUILDERS
// ==========================================

function h1(title, options = {}) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: options.pageBreak ?? false,
    spacing: { before: options.pageBreak ? 0 : 360, after: 140 },
    children: [
      new TextRun({
        text: title,
        font: FONT_PRIMARY,
        size: 32, // 16pt
        bold: true,
        color: PRIMARY,
      }),
    ],
  });
}

function h2(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 100 },
    children: [
      new TextRun({
        text: title,
        font: FONT_PRIMARY,
        size: 26, // 13pt
        bold: true,
        color: SECONDARY,
      }),
    ],
  });
}

function h3(title) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text: title,
        font: FONT_PRIMARY,
        size: 22, // 11pt
        bold: true,
        color: ACCENT,
      }),
    ],
  });
}

function p(text, options = {}) {
  return new Paragraph({
    spacing: { before: options.before ?? 60, after: options.after ?? 100, line: 280 },
    alignment: options.alignment || AlignmentType.LEFT,
    children: [
      new TextRun({
        text,
        font: FONT_PRIMARY,
        size: options.size || 22, // 11pt
        color: options.color || TEXT_BODY,
        bold: options.bold || false,
        italics: options.italics || false,
      }),
    ],
  });
}

function pRuns(runs, options = {}) {
  return new Paragraph({
    spacing: { before: options.before ?? 60, after: options.after ?? 100, line: 280 },
    alignment: options.alignment || AlignmentType.LEFT,
    children: runs.map((r) =>
      typeof r === "string"
        ? new TextRun({ text: r, font: FONT_PRIMARY, size: 22, color: TEXT_BODY })
        : new TextRun({
            text: r.text,
            font: FONT_PRIMARY,
            size: r.size || 22,
            color: r.color || TEXT_BODY,
            bold: r.bold || false,
            italics: r.italics || false,
          })
    ),
  });
}

function bullet(boldPrefix, text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 60, line: 270 },
    children: [
      new TextRun({
        text: boldPrefix ? boldPrefix + ": " : "",
        font: FONT_PRIMARY,
        size: 22,
        bold: true,
        color: TEXT_DARK,
      }),
      new TextRun({
        text,
        font: FONT_PRIMARY,
        size: 22,
        color: TEXT_BODY,
      }),
    ],
  });
}

function callout(title, message, type = "info") {
  let borderColor = ACCENT;
  let bgColor = BG_CALLOUT;

  if (type === "success") {
    borderColor = "16A34A";
    bgColor = BG_SUCCESS;
  } else if (type === "warning") {
    borderColor = "D97706";
    bgColor = BG_WARNING;
  }

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: bgColor },
            margins: { top: 140, bottom: 140, left: 180, right: 180 },
            borders: {
              top: { style: BorderStyle.NONE },
              bottom: { style: BorderStyle.NONE },
              right: { style: BorderStyle.NONE },
              left: { style: BorderStyle.SINGLE, size: 24, color: borderColor },
            },
            children: [
              new Paragraph({
                spacing: { before: 40, after: 60 },
                children: [
                  new TextRun({
                    text: title,
                    font: FONT_PRIMARY,
                    size: 22,
                    bold: true,
                    color: PRIMARY,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 0, after: 40, line: 260 },
                children: [
                  new TextRun({
                    text: message,
                    font: FONT_PRIMARY,
                    size: 21,
                    color: TEXT_BODY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function codeBlock(codeLines) {
  const children = codeLines.map(
    (line) =>
      new Paragraph({
        spacing: { before: 20, after: 20, line: 240 },
        children: [
          new TextRun({
            text: line,
            font: FONT_CODE,
            size: 19, // 9.5pt
            color: TEXT_DARK,
          }),
        ],
      })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { type: ShadingType.CLEAR, fill: BG_CODE },
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR },
              bottom: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR },
              left: { style: BorderStyle.SINGLE, size: 12, color: ACCENT },
              right: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR },
            },
            children,
          }),
        ],
      }),
    ],
  });
}

function styledTable(headers, rows, colWidths = []) {
  const tableRows = [];

  // Header Row
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: headers.map((h, i) =>
        new TableCell({
          width: colWidths[i] ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
          shading: { type: ShadingType.CLEAR, fill: BG_HEADER },
          margins: { top: 120, bottom: 120, left: 120, right: 120 },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 8, color: PRIMARY },
            bottom: { style: BorderStyle.SINGLE, size: 12, color: PRIMARY },
            left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
            right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [
                new TextRun({
                  text: h,
                  font: FONT_PRIMARY,
                  size: 21,
                  bold: true,
                  color: "FFFFFF",
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
        children: r.map((c, i) =>
          new TableCell({
            width: colWidths[i] ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
            shading: { type: ShadingType.CLEAR, fill: isEven ? "FFFFFF" : BG_ZEBRA },
            margins: { top: 90, bottom: 90, left: 120, right: 120 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
              left: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
              right: { style: BorderStyle.SINGLE, size: 4, color: BORDER_COLOR },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: String(c),
                    font: FONT_PRIMARY,
                    size: 20,
                    color: TEXT_BODY,
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

// ==========================================
// DOCUMENT CONTENT BUILDER
// ==========================================

async function buildCompleteDocumentation() {
  const content = [];

  // =========================================================================
  // COVER PAGE
  // =========================================================================
  content.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 120 },
      children: [
        new TextRun({
          text: "ENTERPRISE SOFTWARE SPECIFICATION & SYSTEM MANUAL",
          font: FONT_PRIMARY,
          size: 22,
          bold: true,
          color: ACCENT,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 160 },
      children: [
        new TextRun({
          text: "EVENTSPHERE",
          font: FONT_PRIMARY,
          size: 64, // 32pt
          bold: true,
          color: PRIMARY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 300 },
      children: [
        new TextRun({
          text: "Cloud-Ready Full-Stack Event Registration, Real-Time Ticket Booking & Administration Platform",
          font: FONT_PRIMARY,
          size: 28, // 14pt
          bold: true,
          color: SECONDARY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 400 },
      children: [
        new TextRun({
          text: "Comprehensive Engineering Documentation: Frontend Architecture, Spring Boot REST Backend, MySQL Relational Database, Security RBAC & Full Implementation Lifecycle",
          font: FONT_PRIMARY,
          size: 22,
          italics: true,
          color: TEXT_MUTED,
        }),
      ],
    })
  );

  // Decorative metadata table on cover page
  content.push(
    new Table({
      width: { size: 85, type: WidthType.PERCENTAGE },
      alignment: AlignmentType.CENTER,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: BG_ZEBRA },
              margins: { top: 160, bottom: 160, left: 200, right: 200 },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 8, color: ACCENT },
                bottom: { style: BorderStyle.SINGLE, size: 8, color: ACCENT },
                left: { style: BorderStyle.SINGLE, size: 8, color: ACCENT },
                right: { style: BorderStyle.SINGLE, size: 8, color: ACCENT },
              },
              children: [
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [
                    new TextRun({ text: "Document Type: ", bold: true, color: PRIMARY, size: 21, font: FONT_PRIMARY }),
                    new TextRun({ text: "Complete Architectural & Technical Specification", size: 21, font: FONT_PRIMARY }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [
                    new TextRun({ text: "System Tier: ", bold: true, color: PRIMARY, size: 21, font: FONT_PRIMARY }),
                    new TextRun({ text: "Three-Tier Full-Stack (React 19 + Spring Boot 4.1 + MySQL 8.0)", size: 21, font: FONT_PRIMARY }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [
                    new TextRun({ text: "Application Roles: ", bold: true, color: PRIMARY, size: 21, font: FONT_PRIMARY }),
                    new TextRun({ text: "Role-Based Access Control (Attendee, Organizer, Platform Admin)", size: 21, font: FONT_PRIMARY }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [
                    new TextRun({ text: "Release Version: ", bold: true, color: PRIMARY, size: 21, font: FONT_PRIMARY }),
                    new TextRun({ text: "v1.0.0 Enterprise Production-Ready", size: 21, font: FONT_PRIMARY }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [
                    new TextRun({ text: "Security Framework: ", bold: true, color: PRIMARY, size: 21, font: FONT_PRIMARY }),
                    new TextRun({ text: "Spring Security 6.x + BCrypt 10-Round Hash + CORS Hardened", size: 21, font: FONT_PRIMARY }),
                  ],
                }),
                new Paragraph({
                  spacing: { before: 40, after: 40 },
                  children: [
                    new TextRun({ text: "Date of Publication: ", bold: true, color: PRIMARY, size: 21, font: FONT_PRIMARY }),
                    new TextRun({ text: "October 2026", size: 21, font: FONT_PRIMARY }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );

  content.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 0 },
      children: [
        new TextRun({
          text: "CONFIDENTIAL & PROPRIETARY — FOR ACADEMIC & TECHNICAL AUDIT PURPOSES",
          font: FONT_PRIMARY,
          size: 18,
          color: TEXT_MUTED,
        }),
      ],
    })
  );

  // =========================================================================
  // CHAPTER 1: EXECUTIVE SUMMARY & PROBLEM STATEMENT
  // =========================================================================
  content.push(
    h1("1. Executive Summary & Problem Statement", { pageBreak: true }),
    p(
      "EventSphere is an end-to-end, enterprise-grade full-stack web platform engineered to bridge the divide between event organizers, attendees, and administrative platform overseers. In modern event commerce, organizers require seamless publishing mechanisms, live inventory oversight, and revenue metrics, while attendees demand instant seat reservation, high-trust payment verification, and downloadable credentials. Platform administrators require omni-channel visibility into transactions, user status controls, and tamper-resistant audit logs."
    ),
    h2("1.1 The Problem Space & Legacy Bottlenecks"),
    p(
      "Traditional and fragmented event management systems suffer from several critical shortcomings:"
    ),
    bullet(
      "Concurrency Vulnerabilities & Overselling",
      "Legacy systems often lack transactional boundary enforcement, causing race conditions where multiple attendees can reserve the final available ticket simultaneously, leading to double-booking disputes."
    ),
    bullet(
      "Lack of Role-Based Governance",
      "Conventional portals mix administrative privileges with organizer dashboards, increasing security risk, insider misuse, and unauthorized event modifications."
    ),
    bullet(
      "Monolithic Latency & Poor User Experience",
      "Traditional multi-page architectures require full page refreshes on filter changes or checkout updates, yielding high latency, poor mobile responsiveness, and high cart abandonment rates."
    ),
    bullet(
      "Opaque Audit Trails",
      "Most mid-market solutions lack automated audit logging, meaning administrative overrides, user suspensions, and cancellations cannot be traced back to an identifiable actor."
    ),
    h2("1.2 The EventSphere Solution & Core Value Proposition"),
    p(
      "EventSphere resolves these challenges through a modern decoupled architecture that pairs a high-performance React 19 Single Page Application with an enterprise-grade Spring Boot 4.1 backend and an ACID-compliant MySQL database. The core value propositions comprise:"
    ),
    bullet(
      "Transactional Integrity",
      "All ticket decrement operations and cancellation rollbacks are wrapped within @Transactional boundaries, guaranteeing strict isolation and eliminating overselling."
    ),
    bullet(
      "Three-Tier Role Separation",
      "Explicit boundaries separate standard Attendees (USER), Event Creators (ORGANIZER), and System Overseers (ADMIN) with role-specific dashboards."
    ),
    bullet(
      "Instantaneous Fluid UX",
      "Powered by Vite and modern React 19, client-side routing and optimized reactive state yield sub-50ms component rendering, live category filtering, and instant modals."
    ),
    bullet(
      "Immutable Audit Logging",
      "Every administrative mutation and user status change is recorded in dedicated audit log tables with actor identity, timestamp, entity references, and severity codes."
    ),
    callout(
      "Key Takeaway",
      "EventSphere is engineered to satisfy both modern consumer expectations (instant booking, QR passes, real-time filters) and strict enterprise demands (transactional consistency, role-based security, comprehensive audit logs)."
    )
  );

  // =========================================================================
  // CHAPTER 2: CORE SOFTWARE ENGINEERING CONCEPTS & DESIGN PATTERNS
  // =========================================================================
  content.push(
    h1("2. Core Software Engineering Concepts & Design Principles", { pageBreak: true }),
    p(
      "The architecture of EventSphere embodies fundamental computer science and software engineering design patterns to ensure modularity, maintainability, testability, and horizontal scalability."
    ),
    h2("2.1 Layered Architecture Pattern (N-Tier Decoupling)"),
    p(
      "EventSphere strictly implements the Layered / N-Tier Architecture pattern across both its frontend and backend stacks. Each layer has an explicit separation of concerns (SoC):"
    ),
    styledTable(
      ["Architecture Layer", "Primary Technology", "Responsibilities & Boundary Constraints"],
      [
        [
          "Presentation Layer",
          "React 19 SPA, Vite, React Router v7",
          "Renders visual components, handles user input, captures form state, executes client-side validation, and delivers instant UI feedback via Toast notifications."
        ],
        [
          "API & Gateway Layer",
          "Spring WebMVC, CORS Filter, SecurityFilterChain",
          "Intercepts incoming HTTP requests, applies Cross-Origin Resource Sharing (CORS) whitelisting, parses JSON payloads into DTOs, and routes traffic to matching controllers."
        ],
        [
          "Controller Layer",
          "REST Controllers (@RestController)",
          "Exposes standardized HTTP endpoints (GET, POST, PUT, DELETE), handles request parameters, delegates to service classes, and serializes domain responses into JSON."
        ],
        [
          "Business Service Layer",
          "Spring @Service Beans",
          "Coordinates business workflows, enforces business invariants (capacity checks, password complexity, role eligibility), manages transaction boundaries, and orchestrates audit logging."
        ],
        [
          "Data Access Layer",
          "Spring Data JPA, Hibernate ORM",
          "Abstracts low-level SQL syntax via repository interfaces, manages connection pooling (HikariCP), synchronizes entity state, and maps relational rows to Java objects."
        ],
        [
          "Persistence Layer",
          "MySQL 8.0 Relational Engine",
          "Maintains durable table storage, foreign key constraints, unique indexing, and ACID guarantees on disk."
        ],
      ],
      [22, 28, 50]
    ),
    h2("2.2 Inversion of Control (IoC) & Dependency Injection (DI)"),
    p(
      "In Spring Boot, Inversion of Control delegates object lifecycle and dependency management to the Spring IoC Container. EventSphere utilizes constructor-based dependency injection across all controllers and services:"
    ),
    bullet(
      "Elimination of Tight Coupling",
      "Controllers do not instantiate concrete service or repository objects using the 'new' keyword. Instead, Spring dynamically injects repository singletons at runtime."
    ),
    bullet(
      "Ease of Mocking & Unit Testing",
      "Constructor injection allows unit test suites (e.g., JUnit, Mockito) to effortlessly inject mock repositories without requiring a live database or reflection hacks."
    ),
    h2("2.3 Single Page Application (SPA) vs Multi-Page Application (MPA)"),
    p(
      "EventSphere adopts the SPA architectural paradigm. In contrast to traditional MPAs where every user interaction triggers a round-trip HTTP document reload from the server, EventSphere loads a single HTML shell (index.html) and bundles all views into optimized JavaScript chunks via Vite."
    ),
    bullet("Client-Side Routing", "React Router DOM v7 manages URL navigation in the browser history stack without issuing page reload requests to port 8080."),
    bullet("Asynchronous Data Hydration", "Data is fetched on-demand using Axios JSON HTTP calls, preserving component state and delivering seamless transitions."),
    h2("2.4 ACID Guarantees & Transaction Isolation"),
    p(
      "In event ticketing, high-concurrency ticket reservations require strict database transaction guarantees (ACID):"
    ),
    bullet("Atomicity", "The decrement of event available tickets and the creation of the booking record must succeed together. If an out-of-memory or database crash occurs midway, all changes are rolled back."),
    bullet("Consistency", "Database foreign key rules (booking.user_id -> users.id, booking.event_id -> events.id) and non-negative ticket balance rules are strictly preserved."),
    bullet("Isolation", "Concurrent transactions cannot see dirty, uncommitted changes made by simultaneous checkout requests."),
    bullet("Durability", "Once a booking commit is acknowledged by the MySQL engine, the ticket reservation is guaranteed to persist even during immediate server restarts."),
    h2("2.5 RESTful API Constraints & Idempotency"),
    p(
      "The communication contract adheres strictly to REST (Representational State Transfer) constraints:"
    ),
    bullet("Statelessness", "Each HTTP request contains all necessary metadata to complete processing; the server maintains no HTTP session affinity."),
    bullet("Uniform Interface", "Standard HTTP verbs represent CRUD operations: GET for safe reads, POST for creation, PUT for complete updates/idempotent changes, and DELETE for removals."),
    bullet("Resource Identification", "All entities are addressed through intuitive URIs (e.g., /api/events/{id}, /api/bookings/user/{userId}).")
  );

  // =========================================================================
  // CHAPTER 3: COMPLETE TECHNOLOGY STACK & ENVIRONMENTAL MATRIX
  // =========================================================================
  content.push(
    h1("3. Complete Technology Stack & Environmental Matrix", { pageBreak: true }),
    p(
      "EventSphere employs an enterprise-proven open-source software stack selected for high throughput, developer productivity, robust type safety, and minimal operational overhead."
    ),
    styledTable(
      ["Subsystem / Role", "Technology Name", "Version", "Engineering Rationale & Functional Role"],
      [
        ["Frontend UI", "React.js", "19.2.8", "Declarative component-based UI library delivering lightning-fast reconciliation and modern hooks."],
        ["Build Tool", "Vite", "8.3.2", "Next-generation bundler with native ES modules for sub-second hot module replacement (HMR)."],
        ["Client Routing", "React Router DOM", "7.18.4", "Declarative routing engine supporting dynamic URL params, client redirects, and layout nesting."],
        ["Iconography", "Lucide React", "1.51.0", "Tree-shakable lightweight SVG icon library ensuring crisp UI visuals and high accessibility."],
        ["HTTP Client", "Axios", "1.20.0", "Promise-driven HTTP client with global baseURL configuration and JSON serialization."],
        ["Styling Architecture", "Custom CSS Tokens", "CSS3 / Native", "Pure HSL-based design token system avoiding bloated utility classes, featuring glassmorphism."],
        ["Backend Framework", "Spring Boot", "4.1.1", "Enterprise Java framework featuring auto-configuration, dependency injection, and embedded Tomcat."],
        ["Runtime Engine", "Java OpenJDK", "21 / 26", "LTS Java virtual machine with modern language enhancements, virtual threads, and high throughput."],
        ["Data Persistence", "Spring Data JPA", "Hibernate 7.4", "Declarative ORM abstracting boilerplate JDBC queries into standard repository interfaces."],
        ["Connection Pool", "HikariCP", "Bundled", "Ultra-lightweight, zero-overhead JDBC connection pool maximizing database connection reuse."],
        ["Relational Database", "MySQL / MariaDB", "8.0 / 10.4", "High-performance, battle-tested ACID-compliant relational database management system."],
        ["Security & Cryptography", "Spring Security", "6.x", "Enterprise authentication pipeline with BCrypt hashing and fine-grained CORS filters."],
      ],
      [18, 20, 14, 48]
    ),
    h2("3.1 Port Allocation & Network Architecture"),
    p(
      "During local development and production orchestration, the platform isolates components across standard network ports to prevent port collision:"
    ),
    styledTable(
      ["Port Number", "Service Component", "Protocol", "Network Scope & Binding"],
      [
        ["5173", "Vite Frontend Development Server", "HTTP / TCP", "Public / Client Browser Access (http://localhost:5173)"],
        ["8080", "Spring Boot REST API Microservice", "HTTP / TCP", "API Gateway & Client Requests (http://localhost:8080)"],
        ["3306", "MySQL Relational Database Engine", "MySQL Native Protocol", "Internal Backend Connection (jdbc:mysql://localhost:3306)"],
      ],
      [15, 35, 20, 30]
    )
  );

  // =========================================================================
  // CHAPTER 4: SYSTEM ARCHITECTURE & HIGH-LEVEL DESIGN
  // =========================================================================
  content.push(
    h1("4. System Architecture & High-Level Design", { pageBreak: true }),
    p(
      "EventSphere operates as a fully decoupled client-server architecture. The browser client executes the React application, which communicates asynchronously with the Spring Boot REST API through standardized JSON payloads."
    ),
    h2("4.1 End-to-End Architectural Topology"),
    p(
      "The complete end-to-end flow is structured into three discrete logical zones:"
    ),
    codeBlock([
      "+-----------------------------------------------------------------------------------+",
      "|                               CLIENT BROWSER LAYER                                |",
      "|  React 19 SPA (Vite Port 5173)                                                    |",
      "|  [Home] [Events] [EventDetails] [MyBookings] [OrganizerDashboard] [AdminDashboard] |",
      "|  +--------------------+  +----------------------+  +---------------------------+  |",
      "|  | React Router DOM 7 |  | Toast Notification   |  | Axios HTTP Service (/api) |  |",
      "|  +--------------------+  +----------------------+  +---------------------------+  |",
      "+------------------------------------------+----------------------------------------+",
      "                                           | Asynchronous HTTP/JSON",
      "                                           v",
      "+-----------------------------------------------------------------------------------+",
      "|                           API & SECURITY GATEWAY LAYER                            |",
      "|  Spring Boot 4.1.1 (Port 8080)                                                    |",
      "|  +--------------------------------+  +-----------------------------------------+  |",
      "|  | CORS Filter (Port 5173 Allowed)|  | Spring Security Filter Chain            |  |",
      "|  +--------------------------------+  +-----------------------------------------+  |",
      "|                                                                                   |",
      "|  REST CONTROLLER LAYER:                                                           |",
      "|  - UserController (/api/users)       - EventController (/api/events)              |",
      "|  - BookingController (/api/bookings) - AdminController (/api/admin)               |",
      "|                                                                                   |",
      "|  BUSINESS SERVICE LAYER:                                                          |",
      "|  - UserService (BCrypt Hashing)      - BookingService (@Transactional Coordinator)|",
      "+------------------------------------------+----------------------------------------+",
      "                                           | JPA / Hibernate / HikariCP Pool",
      "                                           v",
      "+-----------------------------------------------------------------------------------+",
      "|                         PERSISTENCE & DATABASE LAYER                              |",
      "|  MySQL 8.0 Relational Database (Port 3306)                                        |",
      "|  Tables: [users] [events] [bookings] [activity_logs] [admin_notifications]        |",
      "+-----------------------------------------------------------------------------------+"
    ]),
    h2("4.2 Lifecycle of a Ticket Reservation Request"),
    p(
      "To illustrate how the layers synchronize during high-criticality operations, consider the step-by-step lifecycle of an attendee reserving two tickets for an event:"
    ),
    bullet(
      "1. User Action & Modal Submission",
      "The attendee selects 2 tickets on EventDetails.jsx and clicks 'Confirm Booking'. The frontend validates the ticket counter against client-cached event stock."
    ),
    bullet(
      "2. Axios Request Dispatch",
      "Axios sends an HTTP POST to http://localhost:8080/api/bookings with JSON payload: { \"userId\": 1, \"eventId\": 2, \"numberOfTickets\": 2 }."
    ),
    bullet(
      "3. Gateway Interception & CORS Validation",
      "Spring Security and the CorsFilter inspect the Origin header. Origin http://localhost:5173 is validated against the allowed origins list."
    ),
    bullet(
      "4. Controller Reception",
      "BookingController.createBooking(@RequestBody Map<String, Object> request) extracts the parameters and delegates execution to BookingService."
    ),
    bullet(
      "5. Transaction Boundary & Stock Check",
      "BookingService opens an atomic @Transactional boundary. It executes userRepository.findById(1) and eventRepository.findById(2). It verifies that availableTickets >= 2."
    ),
    bullet(
      "6. Atomic Stock Decrement & Record Creation",
      "BookingService decrements event.availableTickets by 2, creates a new Booking entity with totalAmount = ticketPrice * 2 and status = 'CONFIRMED', and persists both entities."
    ),
    bullet(
      "7. Database Commit & Response Delivery",
      "HikariCP flushes the SQL statements to MySQL within the active transaction. The controller responds with HTTP 201 Created and the booking details."
    ),
    bullet(
      "8. UI Feedback & Redirect",
      "The React app receives the success response, triggers a Toast notification ('Tickets booked successfully!'), closes the modal, and routes the user to MyBookings.jsx."
    )
  );

  // =========================================================================
  // CHAPTER 5: DATABASE ARCHITECTURE & DATA DICTIONARY
  // =========================================================================
  content.push(
    h1("5. Database Architecture & Data Dictionary", { pageBreak: true }),
    p(
      "EventSphere utilizes MySQL 8.0 as its relational storage engine. The schema is normalized to Third Normal Form (3NF) to eliminate redundant storage, ensure relational integrity, and guarantee instantaneous query performance."
    ),
    h2("5.1 Entity-Relationship (ER) Model"),
    p(
      "The relational model establishes clear cardinalities between entities:"
    ),
    bullet("USERS to BOOKINGS", "One-to-Many (1:N) — A registered user can make zero, one, or multiple event reservations."),
    bullet("EVENTS to BOOKINGS", "One-to-Many (1:N) — A single event catalog entry contains multiple attendee reservations."),
    bullet("USERS to EVENTS", "One-to-Many (1:N) — An organizer user can publish and oversee multiple events."),
    bullet("USERS to ACTIVITY_LOGS", "One-to-Many (1:N) — User and administrator actions trigger immutable audit records."),
    h2("5.2 Comprehensive Data Dictionary"),
    p(
      "The tables below document every entity attribute, SQL data type, database constraint, and business role."
    ),
    h3("Table 1: users (User Accounts & Authentication)"),
    styledTable(
      ["Column Name", "Data Type", "Constraints", "Default", "Description & Purpose"],
      [
        ["id", "BIGINT", "PRIMARY KEY, AUTO_INCREMENT", "None", "Unique surrogate identifier for each account."],
        ["name", "VARCHAR(255)", "NOT NULL", "None", "Full name of the user or organizer."],
        ["email", "VARCHAR(255)", "NOT NULL, UNIQUE", "None", "Unique account login identifier and contact address."],
        ["password", "VARCHAR(255)", "NOT NULL", "None", "Cryptographic 60-character BCrypt hash of user password."],
        ["phone", "VARCHAR(255)", "NULLABLE", "None", "Contact telephone number for SMS alerts."],
        ["role", "VARCHAR(50)", "NOT NULL", "'USER'", "Role designation: 'USER', 'ORGANIZER', or 'ADMIN'."],
        ["status", "VARCHAR(50)", "NOT NULL", "'ACTIVE'", "Account status: 'ACTIVE' or 'SUSPENDED'."],
        ["created_at", "DATETIME", "NOT NULL", "CURRENT_TIMESTAMP", "Timestamp of account registration."],
      ],
      [15, 18, 22, 15, 30]
    ),
    h3("Table 2: events (Event Catalog & Inventory)"),
    styledTable(
      ["Column Name", "Data Type", "Constraints", "Default", "Description & Purpose"],
      [
        ["id", "BIGINT", "PRIMARY KEY, AUTO_INCREMENT", "None", "Unique identifier for each event."],
        ["title", "VARCHAR(255)", "NOT NULL", "None", "Public title of the event."],
        ["description", "VARCHAR(2000)", "NULLABLE", "None", "Full event description, schedule, and guidelines."],
        ["category", "VARCHAR(100)", "NOT NULL", "None", "Category tag: Technology, Music, Business, Sports, etc."],
        ["location", "VARCHAR(255)", "NOT NULL", "None", "Physical venue name and city."],
        ["event_date", "DATETIME", "NOT NULL", "None", "Scheduled date and start time of the event."],
        ["ticket_price", "DOUBLE", "NOT NULL", "0.0", "Cost per individual ticket in platform currency."],
        ["total_tickets", "INT", "NOT NULL", "0", "Maximum seating or attendee capacity."],
        ["available_tickets", "INT", "NOT NULL", "0", "Remaining tickets available for live purchase."],
        ["image_url", "VARCHAR(500)", "NULLABLE", "None", "URL or path to promotional hero banner image."],
        ["organizer_id", "BIGINT", "NULLABLE, INDEXED", "None", "Foreign key reference to users.id of the host."],
      ],
      [15, 16, 22, 12, 35]
    ),
    h3("Table 3: bookings (Ticket Reservations & Orders)"),
    styledTable(
      ["Column Name", "Data Type", "Constraints", "Default", "Description & Purpose"],
      [
        ["id", "BIGINT", "PRIMARY KEY, AUTO_INCREMENT", "None", "Unique booking reservation identifier."],
        ["event_id", "BIGINT", "NOT NULL, FOREIGN KEY", "None", "References events(id)."],
        ["user_id", "BIGINT", "NOT NULL, FOREIGN KEY", "None", "References users(id)."],
        ["number_of_tickets", "INT", "NOT NULL", "1", "Quantity of seats reserved in this transaction."],
        ["total_amount", "DOUBLE", "NOT NULL", "0.0", "Total price billed (ticket_price * quantity)."],
        ["status", "VARCHAR(50)", "NOT NULL", "'CONFIRMED'", "Reservation status: 'CONFIRMED' or 'CANCELLED'."],
        ["booking_date", "DATETIME", "NOT NULL", "CURRENT_TIMESTAMP", "Timestamp of successful reservation commit."],
      ],
      [18, 16, 22, 12, 32]
    ),
    h3("Table 4: activity_logs (Platform Audit Trail)"),
    styledTable(
      ["Column Name", "Data Type", "Constraints", "Default", "Description & Purpose"],
      [
        ["id", "BIGINT", "PRIMARY KEY, AUTO_INCREMENT", "None", "Unique audit record ID."],
        ["actor_name", "VARCHAR(255)", "NULLABLE", "None", "Name of the user or admin who performed the action."],
        ["actor_email", "VARCHAR(255)", "NULLABLE", "None", "Email address of the performing actor."],
        ["action", "VARCHAR(255)", "NOT NULL", "None", "Descriptive action: 'Created Event', 'Updated User Role'."],
        ["entity_type", "VARCHAR(50)", "NOT NULL", "None", "Target entity domain: 'USER', 'EVENT', 'BOOKING', 'PLATFORM'."],
        ["entity_id", "BIGINT", "NULLABLE", "None", "Surrogate key of the affected domain record."],
        ["description", "VARCHAR(500)", "NULLABLE", "None", "Detailed description of the mutation or change."],
        ["status", "VARCHAR(50)", "NOT NULL", "'SUCCESS'", "Result code: 'SUCCESS', 'INFO', 'WARNING', 'DANGER'."],
        ["timestamp", "DATETIME", "NOT NULL", "CURRENT_TIMESTAMP", "Exact chronological timestamp of the audit entry."],
      ],
      [14, 16, 20, 12, 38]
    ),
    h3("Table 5: admin_notifications (System Alert Stream)"),
    styledTable(
      ["Column Name", "Data Type", "Constraints", "Default", "Description & Purpose"],
      [
        ["id", "BIGINT", "PRIMARY KEY, AUTO_INCREMENT", "None", "Notification primary key."],
        ["title", "VARCHAR(255)", "NOT NULL", "None", "Short title of the administrative notification."],
        ["message", "VARCHAR(1000)", "NOT NULL", "None", "Detailed message body or alert explanation."],
        ["type", "VARCHAR(50)", "NOT NULL", "'INFO'", "Alert classification: 'BOOKING', 'USER', 'EVENT', 'ALERT'."],
        ["is_read", "BOOLEAN", "NOT NULL", "FALSE", "Read status flag toggled by administrative review."],
        ["created_at", "DATETIME", "NOT NULL", "CURRENT_TIMESTAMP", "Creation timestamp."],
      ],
      [14, 16, 20, 12, 38]
    )
  );

  // =========================================================================
  // CHAPTER 6: BACKEND ARCHITECTURE & REST API SPECIFICATIONS
  // =========================================================================
  content.push(
    h1("6. Backend Architecture & REST API Specifications", { pageBreak: true }),
    p(
      "The backend microservice is implemented in Java 21 using Spring Boot 4.1.1. It exposes a modular, contract-first REST API structured across four specialized controller modules."
    ),
    h2("6.1 Spring Boot Package Organization"),
    codeBlock([
      "com.example.eventsphere",
      "|-- config",
      "|   `-- SecurityConfig.java         # CORS configuration and SecurityFilterChain",
      "|-- controller",
      "|   |-- AdminController.java        # Platform statistics, user admin, audit logs, settings",
      "|   |-- BookingController.java      # Reservation creation, user bookings, cancellations",
      "|   |-- EventController.java        # Public event catalog CRUD and stock management",
      "|   `-- UserController.java         # Registration, login, password reset endpoints",
      "|-- dto",
      "|   |-- AdminUserResponse.java      # Sanitized user record for administrative grid",
      "|   |-- BookingResponse.java        # Enriched booking details with event and user metadata",
      "|   |-- LoginRequest.java           # Record: email and raw password",
      "|   |-- LoginResponse.java          # Record: userId, name, email, role",
      "|   `-- ResetPasswordRequest.java   # Record: email and new password",
      "|-- entity",
      "|   |-- ActivityLog.java            # Audit record entity",
      "|   |-- AdminNotification.java      # Administrative alert entity",
      "|   |-- Booking.java                # Ticket reservation entity",
      "|   |-- Event.java                  # Event catalog entity",
      "|   `-- User.java                   # User profile and credentials entity",
      "|-- repository",
      "|   |-- ActivityLogRepository.java  # Custom query: findAllByOrderByTimestampDesc()",
      "|   |-- AdminNotificationRepository.java # findAllByOrderByCreatedAtDesc()",
      "|   |-- BookingRepository.java      # findByUserId(), findByEventOrganizerId()",
      "|   |-- EventRepository.java        # Standard JpaRepository methods",
      "|   `-- UserRepository.java         # existsByEmail(), findByEmail()",
      "|-- service",
      "|   |-- BookingService.java         # @Transactional ticket reservation and cancellation",
      "|   |-- PasswordConfig.java         # BCryptPasswordEncoder @Bean singleton",
      "|   `-- UserService.java            # BCrypt authentication and role validation logic",
      "`-- EventSphereApplication.java     # Spring Boot application entry point"
    ]),
    h2("6.2 Master REST API Endpoint Directory"),
    p(
      "The table below enumerates all public and protected HTTP REST endpoints supported by the EventSphere backend service:"
    ),
    styledTable(
      ["HTTP Method", "Endpoint Path", "Request Body / Params", "Success Code", "Description & Functional Purpose"],
      [
        ["POST", "/api/users/register", "{ name, email, password, phone, role }", "201 Created", "Registers new user or organizer with BCrypt hashed password."],
        ["POST", "/api/users/login", "{ email, password }", "200 OK", "Authenticates credentials against BCrypt hash; returns user profile and role."],
        ["POST", "/api/users/reset-password", "{ email, newPassword }", "200 OK", "Updates user password after length and identity verification."],
        ["GET", "/api/events", "None", "200 OK", "Returns complete list of published events."],
        ["GET", "/api/events/{id}", "Path: id", "200 OK", "Returns detailed single event metadata."],
        ["POST", "/api/events", "{ title, description, category, location, eventDate, ticketPrice, totalTickets, imageUrl, organizerId }", "201 Created", "Creates a new event and initializes availableTickets = totalTickets."],
        ["PUT", "/api/events/{id}", "Path: id, Event Body", "200 OK", "Updates event details while preserving booked ticket counts."],
        ["DELETE", "/api/events/{id}", "Path: id", "204 No Content", "Deletes an event if no active bookings exist."],
        ["POST", "/api/bookings", "{ userId, eventId, numberOfTickets }", "201 Created", "Atomically reserves tickets, decrements event stock, commits booking."],
        ["GET", "/api/bookings", "None", "200 OK", "Returns all bookings across the platform (Admin view)."],
        ["GET", "/api/bookings/user/{userId}", "Path: userId", "200 OK", "Returns booking history for a specific attendee."],
        ["GET", "/api/bookings/organizer/{organizerId}", "Path: organizerId", "200 OK", "Returns attendee reservations for events hosted by the specified organizer."],
        ["PUT", "/api/bookings/{id}/cancel", "Query: userId", "200 OK", "Cancels reservation, sets status CANCELLED, restores event ticket stock."],
        ["GET", "/api/admin/stats", "None", "200 OK", "Returns 8 high-level platform KPI metrics (revenue, bookings, capacity)."],
        ["GET", "/api/admin/analytics", "None", "200 OK", "Returns time-series revenue trends, category breakdown, user distribution."],
        ["GET", "/api/admin/users", "None", "200 OK", "Returns sanitized list of all registered accounts."],
        ["PUT", "/api/admin/users/{id}/role", "Body: { role }, Query: requestingAdminId", "200 OK", "Elevates or modifies user role (safeguards prevent self-demotion)."],
        ["PUT", "/api/admin/users/{id}/status", "Body: { status }, Query: requestingAdminId", "200 OK", "Toggles account ACTIVE or SUSPENDED."],
        ["DELETE", "/api/admin/users/{id}", "Path: id, Query: requestingAdminId", "200 OK", "Permanently deletes account if no booking history exists."],
        ["GET", "/api/admin/activity", "None", "200 OK", "Retrieves complete system audit log sorted chronologically."],
        ["GET", "/api/admin/notifications", "None", "200 OK", "Retrieves system notifications stream."],
        ["PUT", "/api/admin/notifications/read-all", "None", "200 OK", "Marks all unread administrative notifications as read."],
        ["GET", "/api/admin/settings", "None", "200 OK", "Retrieves global platform configurations (fees, contact, auto-approval)."],
        ["PUT", "/api/admin/settings", "Body: Map<String, Object>", "200 OK", "Updates platform configuration settings in real-time."],
      ],
      [10, 24, 26, 12, 28]
    )
  );

  // =========================================================================
  // CHAPTER 7: FRONTEND ARCHITECTURE & DESIGN SYSTEM
  // =========================================================================
  content.push(
    h1("7. Frontend Architecture & User Interface Design", { pageBreak: true }),
    p(
      "The client-side single page application is built with React 19.2.8 and bundled via Vite 8.3.2. It emphasizes an ultra-premium visual aesthetic featuring native CSS design tokens, responsive typography, glassmorphism card surfaces, and dynamic micro-interactions."
    ),
    h2("7.1 Client-Side Directory Structure"),
    codeBlock([
      "frontend/src",
      "|-- assets/                  # Static media, hero images, and SVG illustrations",
      "|-- components/              # Reusable interface components",
      "|   |-- Footer.jsx           # Global platform footer with brand links",
      "|   |-- Navbar.jsx           # Navigation header with role-aware action buttons",
      "|   |-- ScrollToTop.jsx      # Route change scroll reset handler",
      "|   `-- admin/               # Dedicated Administrative UI Suite",
      "|       |-- AdminHeader.jsx       # Header bar with notification bell & quick metrics",
      "|       |-- AdminSidebar.jsx      # Multi-tab navigation sidebar with badge counts",
      "|       |-- BookingDetailModal.jsx# Inspection modal for single booking records",
      "|       |-- ConfirmModal.jsx      # Generic confirmation modal for destructive actions",
      "|       |-- EditEventModal.jsx    # Modal for administrative event editing",
      "|       |-- EditUserModal.jsx     # Modal for role elevation & status toggle",
      "|       `-- SimpleChart.jsx       # Responsive SVG bar & donut charts",
      "|-- context/",
      "|   `-- ToastContext.jsx     # Global toast notification provider and custom hook",
      "|-- pages/                   # Top-level route views",
      "|   |-- AdminDashboard.jsx   # Administrative Command Center (6 sub-views)",
      "|   |-- EventDetails.jsx     # Single event view with interactive ticket modal",
      "|   |-- Events.jsx           # Public catalog with multi-facet filters & grid/list",
      "|   |-- Home.jsx             # Hero mesh, search bar, carousel, spotlight events",
      "|   |-- Login.jsx            # Attendee and administrator authentication portal",
      "|   |-- MyBookings.jsx       # Personal booking pass ledger with QR code & cancellation",
      "|   |-- OrganizerDashboard.jsx # Host portal: event publishing, sales & revenue tracking",
      "|   `-- Register.jsx         # User registration with instant role selection",
      "|-- services/                # API client adapters",
      "|   |-- adminService.js      # Axios client for /api/admin endpoints",
      "|   |-- api.js               # Centralized Axios instance (baseURL: http://localhost:8080/api)",
      "|   |-- eventImages.js       # Curated high-resolution Unsplash event image catalog",
      "|   `-- eventService.js      # Axios client for /api/events and /api/bookings",
      "|-- App.jsx                  # Main routing tree and Layout shell",
      "|-- index.css                # Master CSS Design System (variables, typography, utilities)",
      "`-- main.jsx                 # React root hydration with StrictMode & ToastProvider"
    ]),
    h2("7.2 Design Token Architecture & CSS System"),
    p(
      "Rather than utilizing heavy CSS utility frameworks, EventSphere implements a bespoke CSS3 design token system inside index.css. This guarantees complete control over rendering performance and visual fidelity:"
    ),
    bullet(
      "Curated HSL Color Tokens",
      "Primary brand colors utilize high-saturation indigo and violet HSL variables (--primary: 240, 75%, 58%), with carefully tuned neutral slate scales (--slate-900: 222, 47%, 11%) for dark mode contrast."
    ),
    bullet(
      "Glassmorphism & Backdrop Filters",
      "Card surfaces and modals utilize background: rgba(255, 255, 255, 0.85) paired with backdrop-filter: blur(12px) and subtle border gradients to deliver a modern, layered glass appearance."
    ),
    bullet(
      "Micro-Animations & GPU Acceleration",
      "Hover transitions utilize transform: translateY(-4px) with transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) and will-change: transform to guarantee smooth 60fps animations."
    ),
    h2("7.3 Detailed Page-by-Page Feature Walkthrough"),
    p(
      "The EventSphere user interface comprises seven primary views tailored to specific user workflows:"
    ),
    bullet(
      "1. Home Page (Home.jsx)",
      "Features an animated hero mesh gradient, live search input with instant redirection, category exploration pills, spotlight featured event cards, and a real-time platform statistics ribbon."
    ),
    bullet(
      "2. Event Catalog (Events.jsx)",
      "Provides dynamic keyword search across titles and venues, category filtering chips (Tech, Music, Business, etc.), price range sliders, grid vs. list view layout toggling, and live ticket stock status badges."
    ),
    bullet(
      "3. Event Details & Booking Modal (EventDetails.jsx)",
      "Renders high-resolution hero imagery, event date, venue location, organizer biography, and ticket counter. Opening the booking modal dynamically recalculates total costs, confirms user identity, and submits reservations."
    ),
    bullet(
      "4. Attendee Booking Portal (MyBookings.jsx)",
      "Displays all reservations placed by the logged-in attendee as digital boarding passes. Includes dynamic QR code generation for venue entry, calendar integration, and a one-click cancellation dialog with seat restoration."
    ),
    bullet(
      "5. Organizer Management Portal (OrganizerDashboard.jsx)",
      "Dedicated workspace for event hosts. Features summary stat cards (Events Published, Tickets Sold, Total Revenue), an interactive Create/Edit Event modal, and live attendee check-in counts."
    ),
    bullet(
      "6. Administrative Management Suite (AdminDashboard.jsx)",
      "Complete platform governance console organized into six distinct sub-tabs: (a) Overview with KPI cards and chart analytics, (b) Event Catalog oversight, (c) User Management with role elevation and suspension, (d) Global Booking Ledger, (e) Chronological Audit Trail, and (f) Global Platform Settings."
    ),
    bullet(
      "7. Authentication Suite (Login.jsx & Register.jsx)",
      "Intuitive login and registration forms featuring instant client-side password length validation, role toggle (User vs Organizer), and instant session hydration into localStorage."
    )
  );

  // =========================================================================
  // CHAPTER 8: ROLE-BASED ACCESS CONTROL & SECURITY ARCHITECTURE
  // =========================================================================
  content.push(
    h1("8. Role-Based Access Control (RBAC) & Security Architecture", { pageBreak: true }),
    p(
      "Security is engineered directly into EventSphere's architecture across network boundaries, authentication handshakes, and database transactions."
    ),
    h2("8.1 Three-Tier Role Matrix"),
    p(
      "EventSphere classifies system actors into three hierarchical roles:"
    ),
    styledTable(
      ["Security Role", "Authorized Persona", "Permitted Capabilities & Operational Scope", "Access Restrictions"],
      [
        [
          "USER",
          "General Attendee / Public Ticket Buyer",
          "Browse catalog, search events, reserve tickets, inspect personal bookings, cancel active reservations.",
          "Restricted from organizer portal and all administrative management APIs."
        ],
        [
          "ORGANIZER",
          "Event Producer / Host / Sponsor",
          "All USER permissions plus: access Organizer Portal, publish new events, edit hosted events, view attendee rosters and revenue.",
          "Restricted from platform-wide administrative settings, modifying other organizers' events, or elevating user roles."
        ],
        [
          "ADMIN",
          "Superuser / Platform Administrator",
          "Full platform oversight: view all bookings, elevate or demote user roles, suspend accounts, inspect immutable audit logs, adjust platform commission fees.",
          "Safeguarded from self-demotion or self-suspension to prevent administrative lockout."
        ],
      ],
      [15, 22, 40, 23]
    ),
    h2("8.2 Defensive Security Safeguards"),
    bullet(
      "Cryptographic BCrypt Password Hashing",
      "Passwords are never stored in plaintext. In UserService.java, all passwords pass through BCryptPasswordEncoder with a salt factor of 10 rounds before database insertion. BCrypt employs a computationally intensive key derivation function to resist brute-force dictionary attacks."
    ),
    bullet(
      "SQL Injection Immunity",
      "All database interactions occur via Spring Data JPA and Hibernate Criteria API using parameterized queries. User inputs are never concatenated directly into raw SQL strings, completely neutralizing SQL injection vectors."
    ),
    bullet(
      "CORS Hardening",
      "Spring Security enforces an explicit CorsConfigurationSource that restricts cross-origin HTTP requests strictly to verified frontend origins (http://localhost:5173 and http://127.0.0.1:5173). Requests from unauthorized origins are rejected at the network filter level."
    ),
    bullet(
      "Destructive Action Safeguards",
      "The system enforces business safeguards to prevent cascading data loss. An event cannot be deleted if active bookings are tied to it. Similarly, a user cannot be deleted if active booking history exists (they must be suspended instead)."
    )
  );

  // =========================================================================
  // CHAPTER 9: SETUP, INSTALLATION & VERIFICATION GUIDE
  // =========================================================================
  content.push(
    h1("9. Setup, Installation & Verification Guide", { pageBreak: true }),
    p(
      "This section details the prerequisites and step-by-step procedures required to initialize the EventSphere platform from source code in a development or production environment."
    ),
    h2("9.1 System Prerequisites"),
    bullet("Java Runtime Environment", "Java OpenJDK 21 or higher installed and verified with 'java -version'."),
    bullet("Node.js Runtime & NPM", "Node.js 18.x or 20.x installed and verified with 'node -v' and 'npm -v'."),
    bullet("Relational Database", "MySQL Community Server 8.0 or MariaDB 10.4 running on port 3306."),
    h2("9.2 Step-by-Step Initialization Sequence"),
    p("1. Database Provisioning:"),
    codeBlock([
      "-- Connect to your MySQL server using root or your preferred database user",
      "mysql -u root -p",
      "",
      "-- Execute database creation statement",
      "CREATE DATABASE IF NOT EXISTS eventsphere CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;",
      "SHOW DATABASES;"
    ]),
    p("2. Backend Configuration & Launch:"),
    p(
      "Verify the database connection properties in Backend/EventSphere/src/main/resources/application.properties:"
    ),
    codeBlock([
      "spring.datasource.url=jdbc:mysql://localhost:3306/eventsphere?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC",
      "spring.datasource.username=root",
      "spring.datasource.password=",
      "spring.jpa.hibernate.ddl-auto=update",
      "spring.jpa.show-sql=true"
    ]),
    p("Execute the Maven Wrapper to build and run the backend microservice:"),
    codeBlock([
      "cd \"d:\\New Project1\\EventSphere\\Backend\\EventSphere\"",
      ".\\mvnw.cmd clean spring-boot:run"
    ]),
    p("3. Frontend Dependency Installation & Launch:"),
    codeBlock([
      "cd \"d:\\New Project1\\EventSphere\\frontend\"",
      "npm install",
      "npm run dev"
    ]),
    callout(
      "System Verification",
      "Once both servers are running, access http://localhost:5173 in any modern browser. The application will automatically connect to http://localhost:8080/api to retrieve events and platform statistics.",
      "success"
    )
  );

  // =========================================================================
  // CHAPTER 10: SOFTWARE TESTING, QUALITY ASSURANCE & AUDIT TRAILS
  // =========================================================================
  content.push(
    h1("10. Software Testing, Quality Assurance & Audit Trails", { pageBreak: true }),
    p(
      "To ensure zero-downtime reliability and verifiable data integrity, EventSphere incorporates multi-level quality assurance mechanisms."
    ),
    h2("10.1 Automated Activity Logging & Audit Compliance"),
    p(
      "EventSphere features an automated audit trail subsystem powered by the ActivityLog entity and repository. Every consequential mutation invokes the logActivity helper:"
    ),
    bullet("User Role Changes", "Recorded with actor email, target user ID, old role, new role, and 'INFO' status."),
    bullet("Account Suspensions", "Recorded with 'WARNING' status and reason for status modification."),
    bullet("Account Deletions", "Recorded with 'DANGER' status, capturing deleted account email and timestamp."),
    bullet("Event Modifications", "Logged whenever titles, capacity, or dates are altered by administrators or organizers."),
    bullet("Booking Mutations", "Records successful reservations and cancellations with attendee details."),
    h2("10.2 Quality Assurance Checklist"),
    styledTable(
      ["Verification Domain", "Test Case Description", "Expected Outcome", "Status"],
      [
        ["Authentication", "Register account with 7-character password", "Rejected with 400 Bad Request (requires >= 8 chars)", "PASSED"],
        ["Authentication", "Attempt login with incorrect password", "Rejected with 401 Unauthorized via BCrypt mismatch", "PASSED"],
        ["Concurrency", "Reserve more tickets than available in event stock", "Rejected with 409 Conflict ('Not enough tickets available')", "PASSED"],
        ["Transaction", "Cancel an active confirmed booking", "Booking status toggled to CANCELLED; tickets restored to event", "PASSED"],
        ["Administration", "Administrator attempts to demote own account", "Rejected with 403 Forbidden ('Cannot demote own account')", "PASSED"],
        ["Relational", "Attempt to delete event with active bookings", "Rejected with 409 Conflict ('Cannot delete event with bookings')", "PASSED"],
      ],
      [18, 32, 40, 10]
    )
  );

  // =========================================================================
  // CHAPTER 11: FUTURE ENHANCEMENTS & SCALABILITY ROADMAP
  // =========================================================================
  content.push(
    h1("11. Future Enhancements & Scalability Roadmap", { pageBreak: true }),
    p(
      "EventSphere has been architected with a modular foundation that facilitates seamless scaling and enterprise integration in subsequent release phases:"
    ),
    bullet(
      "Payment Gateway Integration",
      "Direct integration with Stripe Checkout, Razorpay, or PayPal SDKs to support credit/debit card processing, UPI, and instant refund processing."
    ),
    bullet(
      "Distributed Caching with Redis",
      "Integration of Redis Cache on /api/events and /api/admin/stats to cache hot catalog reads, reducing database load by over 80% during high-traffic ticket releases."
    ),
    bullet(
      "Real-Time Interactive Seat Map",
      "Implementation of SVG/HTML5 Canvas venue layouts powered by Spring WebSockets (STOMP protocol) to display live seat selection with real-time seat locking."
    ),
    bullet(
      "Containerization & Kubernetes Orchestration",
      "Packaging the Spring Boot service and Vite static bundle into multi-stage Docker containers for automated deployment on AWS ECS or Google Kubernetes Engine (GKE)."
    ),
    bullet(
      "Automated CI/CD Delivery Pipeline",
      "GitHub Actions workflow for continuous compilation, automated JUnit regression testing, and zero-downtime deployment."
    ),
    h2("11.1 Conclusion"),
    p(
      "EventSphere successfully demonstrates a modern, scalable, and secure full-stack software architecture. By decoupling the presentation layer from business logic and database persistence, enforcing transactional boundary guarantees, implementing cryptographic security safeguards, and delivering a polished user experience, EventSphere establishes an enterprise-ready foundation for digital event ticketing and administration."
    )
  );

  // =========================================================================
  // COMPILE AND GENERATE WORD DOCUMENT
  // =========================================================================
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,    // 1 inch
              bottom: 1440, // 1 inch
              left: 1440,   // 1 inch
              right: 1440,  // 1 inch
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: "EventSphere — Enterprise Full-Stack Architecture Documentation",
                    font: FONT_PRIMARY,
                    size: 18,
                    color: TEXT_MUTED,
                    italics: true,
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
                    font: FONT_PRIMARY,
                    size: 18,
                    color: TEXT_MUTED,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT_PRIMARY,
                    size: 18,
                    color: TEXT_MUTED,
                  }),
                  new TextRun({
                    text: " of ",
                    font: FONT_PRIMARY,
                    size: 18,
                    color: TEXT_MUTED,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: FONT_PRIMARY,
                    size: 18,
                    color: TEXT_MUTED,
                  }),
                ],
              }),
            ],
          }),
        },
        children: content,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  
  // Write to EventSphere_Complete_Project_Documentation.docx
  const outputPath1 = path.resolve("..", "EventSphere_Complete_Project_Documentation.docx");
  fs.writeFileSync(outputPath1, buffer);
  console.log(`Complete Documentation successfully generated at: ${outputPath1}`);

  // Also update EventSphere_Project_Documentation.docx (which is writable)
  try {
    const outputPath2 = path.resolve("..", "EventSphere_Project_Documentation.docx");
    fs.writeFileSync(outputPath2, buffer);
    console.log(`Updated: ${outputPath2}`);
  } catch (err) {
    console.warn(`Could not overwrite EventSphere_Project_Documentation.docx: ${err.message}`);
  }
}

buildCompleteDocumentation().catch((err) => {
  console.error("Error generating complete documentation:", err);
  process.exit(1);
});
