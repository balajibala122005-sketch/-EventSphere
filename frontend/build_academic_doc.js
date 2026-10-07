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

// Color Palette for Academic Report
const COLOR_PRIMARY = "1A365D";   // Deep Academic Navy
const COLOR_SECONDARY = "2D3748"; // Slate Charcoal
const COLOR_TEXT = "1A202C";      // Near Black
const COLOR_MUTED = "718096";     // Grey
const COLOR_BORDER = "CBD5E0";    // Light Grey Border
const COLOR_TABLE_HEADER = "EDF2F7"; // Soft Grey / Slate Table Header
const COLOR_ZEBRA = "F7FAFC";     // Zebra Alternate Row

const FONT_NAME = "Times New Roman";

// Helper functions for consistent academic styling
function p(text, options = {}) {
  return new Paragraph({
    spacing: { before: options.before ?? 60, after: options.after ?? 100, line: 360 }, // 1.5 line spacing (360 dxa)
    alignment: options.alignment || AlignmentType.JUSTIFIED,
    indent: options.indent ? { firstLine: 720 } : undefined,
    children: [
      new TextRun({
        text,
        font: FONT_NAME,
        size: options.size || 24, // 12pt
        color: options.color || COLOR_TEXT,
        bold: options.bold || false,
        italics: options.italics || false,
      }),
    ],
  });
}

function pStyled(runs, options = {}) {
  return new Paragraph({
    spacing: { before: options.before ?? 60, after: options.after ?? 100, line: 360 },
    alignment: options.alignment || AlignmentType.JUSTIFIED,
    indent: options.indent ? { firstLine: 720 } : undefined,
    children: runs.map((r) =>
      typeof r === "string"
        ? new TextRun({ text: r, font: FONT_NAME, size: 24, color: COLOR_TEXT })
        : new TextRun({
            text: r.text,
            font: FONT_NAME,
            size: r.size || 24,
            color: r.color || COLOR_TEXT,
            bold: r.bold || false,
            italics: r.italics || false,
          })
    ),
  });
}

function bullet(boldPrefix, text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 60, line: 320 },
    children: [
      new TextRun({
        text: boldPrefix ? boldPrefix + ": " : "",
        font: FONT_NAME,
        size: 24,
        bold: true,
        color: COLOR_SECONDARY,
      }),
      new TextRun({
        text,
        font: FONT_NAME,
        size: 24,
        color: COLOR_TEXT,
      }),
    ],
  });
}

function h1(text, number = "") {
  const fullText = number ? `${number} ${text}` : text;
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 140 },
    children: [
      new TextRun({
        text: fullText,
        font: FONT_NAME,
        size: 34, // 17pt
        bold: true,
        color: COLOR_PRIMARY,
      }),
    ],
  });
}

function h2(text, number = "") {
  const fullText = number ? `${number} ${text}` : text;
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text: fullText,
        font: FONT_NAME,
        size: 28, // 14pt
        bold: true,
        color: COLOR_SECONDARY,
      }),
    ],
  });
}

function h3(text, number = "") {
  const fullText = number ? `${number} ${text}` : text;
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text: fullText,
        font: FONT_NAME,
        size: 25, // 12.5pt
        bold: true,
        italics: true,
        color: COLOR_PRIMARY,
      }),
    ],
  });
}

function table(headers, rows, colWidths = []) {
  const tableRows = [];

  // Header Row
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: headers.map((h, i) =>
        new TableCell({
          width: colWidths[i] ? { size: colWidths[i], type: WidthType.PERCENTAGE } : undefined,
          shading: { type: ShadingType.CLEAR, fill: COLOR_TABLE_HEADER },
          margins: { top: 120, bottom: 120, left: 140, right: 140 },
          borders: {
            top: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
            bottom: { style: BorderStyle.SINGLE, size: 12, color: COLOR_PRIMARY },
            left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
            right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
          },
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({
                  text: h,
                  font: FONT_NAME,
                  size: 22,
                  bold: true,
                  color: COLOR_PRIMARY,
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
            shading: { type: ShadingType.CLEAR, fill: isEven ? "FFFFFF" : COLOR_ZEBRA },
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
              bottom: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
              left: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
              right: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: String(c),
                    font: FONT_NAME,
                    size: 21,
                    color: COLOR_TEXT,
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

function screenshotPlaceholder(figNum, caption, description) {
  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { type: ShadingType.CLEAR, fill: "F8FAFC" },
              margins: { top: 300, bottom: 300, left: 240, right: 240 },
              borders: {
                top: { style: BorderStyle.DASHED, size: 6, color: COLOR_MUTED },
                bottom: { style: BorderStyle.DASHED, size: 6, color: COLOR_MUTED },
                left: { style: BorderStyle.DASHED, size: 6, color: COLOR_MUTED },
                right: { style: BorderStyle.DASHED, size: 6, color: COLOR_MUTED },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({
                      text: `[ USER INTERFACE SCREENSHOT PLACEHOLDER: ${caption.toUpperCase()} ]`,
                      font: FONT_NAME,
                      size: 22,
                      bold: true,
                      color: COLOR_PRIMARY,
                    }),
                  ],
                }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 80 },
                  children: [
                    new TextRun({
                      text: description,
                      font: FONT_NAME,
                      size: 20,
                      italics: true,
                      color: COLOR_MUTED,
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 200 },
      children: [
        new TextRun({
          text: `Figure ${figNum}: `,
          font: FONT_NAME,
          size: 22,
          bold: true,
          color: COLOR_SECONDARY,
        }),
        new TextRun({
          text: caption,
          font: FONT_NAME,
          size: 22,
          italics: true,
          color: COLOR_TEXT,
        }),
      ],
    }),
  ];
}

async function buildAcademicDocx() {
  const content = [];

  // =========================================================================
  // 1. COVER PAGE
  // =========================================================================
  content.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 120 },
      children: [
        new TextRun({
          text: "A PROJECT REPORT",
          font: FONT_NAME,
          size: 26,
          bold: true,
          color: COLOR_MUTED,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 240 },
      children: [
        new TextRun({
          text: "ON",
          font: FONT_NAME,
          size: 24,
          bold: true,
          color: COLOR_MUTED,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 140, after: 140 },
      children: [
        new TextRun({
          text: "EVENTSPHERE",
          font: FONT_NAME,
          size: 52, // 26pt
          bold: true,
          color: COLOR_PRIMARY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 400 },
      children: [
        new TextRun({
          text: "A Modern Full-Stack Event Registration and Ticket Booking System",
          font: FONT_NAME,
          size: 28, // 14pt
          bold: true,
          color: COLOR_SECONDARY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 120 },
      children: [
        new TextRun({
          text: "Submitted in partial fulfillment of the requirements for the award of the degree of",
          font: FONT_NAME,
          size: 22,
          italics: true,
          color: COLOR_TEXT,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 360 },
      children: [
        new TextRun({
          text: "[Degree / Course: Bachelor of Engineering / Technology in Computer Science and Engineering]",
          font: FONT_NAME,
          size: 26,
          bold: true,
          color: COLOR_PRIMARY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 100 },
      children: [
        new TextRun({
          text: "Submitted by:",
          font: FONT_NAME,
          size: 24,
          bold: true,
          color: COLOR_SECONDARY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 360 },
      children: [
        new TextRun({
          text: "[Student Name / Candidate: Balaji R. / Candidate Name(s)]\n[Register / Roll Number: 9100XXXXXXXX]",
          font: FONT_NAME,
          size: 24,
          bold: true,
          color: COLOR_TEXT,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 100 },
      children: [
        new TextRun({
          text: "Under the Guidance of:",
          font: FONT_NAME,
          size: 24,
          bold: true,
          color: COLOR_SECONDARY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 440 },
      children: [
        new TextRun({
          text: "[Guide Name: Prof. / Dr. Internal Guide Name, M.E., Ph.D.]\n[Designation: Assistant Professor / Associate Professor]",
          font: FONT_NAME,
          size: 24,
          color: COLOR_TEXT,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 60 },
      children: [
        new TextRun({
          text: "[Department of Computer Science and Engineering]",
          font: FONT_NAME,
          size: 26,
          bold: true,
          color: COLOR_PRIMARY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 60 },
      children: [
        new TextRun({
          text: "[College / Institution Name: Autonomous Engineering College / University]",
          font: FONT_NAME,
          size: 24,
          bold: true,
          color: COLOR_SECONDARY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 200 },
      children: [
        new TextRun({
          text: "[Academic Year: 2025 – 2026] | [Project Type: Major Capstone Project]",
          font: FONT_NAME,
          size: 22,
          bold: true,
          color: COLOR_MUTED,
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 2. CERTIFICATE
  // =========================================================================
  content.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 60 },
      children: [
        new TextRun({
          text: "[COLLEGE / INSTITUTION NAME]",
          font: FONT_NAME,
          size: 28,
          bold: true,
          color: COLOR_PRIMARY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 240 },
      children: [
        new TextRun({
          text: "[DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING]",
          font: FONT_NAME,
          size: 24,
          bold: true,
          color: COLOR_SECONDARY,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 360 },
      children: [
        new TextRun({
          text: "BONAFIDE CERTIFICATE",
          font: FONT_NAME,
          size: 32,
          bold: true,
          color: COLOR_PRIMARY,
        }),
      ],
    }),
    p(
      "This is to certify that this project report entitled \"EVENTSPHERE — A Modern Full-Stack Event Registration and Ticket Booking System\" is the bonafide work of [Student Name / Candidate: Balaji R. / Candidate Name(s)] (Register No: [Register Number]) who carried out the project work under my supervision in partial fulfillment of the requirements for the award of the degree of Bachelor of Engineering / Technology in Computer Science and Engineering during the academic year 2025 – 2026.",
      { indent: true }
    ),
    p(
      "Certified further that to the best of my knowledge the work reported herein does not form part of any other project or dissertation on the basis of which a degree or award was conferred on an earlier occasion on this or any other candidate.",
      { indent: true }
    ),
    new Paragraph({ spacing: { before: 600, after: 200 } }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [
                    new TextRun({ text: "SIGNATURE\n\n\n\n", font: FONT_NAME, bold: true, size: 24 }),
                    new TextRun({ text: "[GUIDE NAME]\nPROJECT GUIDE / SUPERVISOR\nDepartment of CSE", font: FONT_NAME, size: 22 }),
                  ],
                }),
              ],
            }),
            new TableCell({
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [
                    new TextRun({ text: "SIGNATURE\n\n\n\n", font: FONT_NAME, bold: true, size: 24 }),
                    new TextRun({ text: "[HEAD OF DEPARTMENT]\nHEAD OF DEPARTMENT\nDepartment of CSE", font: FONT_NAME, size: 22 }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ spacing: { before: 400, after: 100 } }),
    p("Submitted for the Project Viva-Voce examination held on: [Date of Examination: ________________]"),
    new Paragraph({ spacing: { before: 300, after: 200 } }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [new TextRun({ text: "INTERNAL EXAMINER", font: FONT_NAME, bold: true, size: 24 })],
                }),
              ],
            }),
            new TableCell({
              borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: "EXTERNAL EXAMINER", font: FONT_NAME, bold: true, size: 24 })],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 3. DECLARATION
  // =========================================================================
  content.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 360 },
      children: [
        new TextRun({
          text: "DECLARATION",
          font: FONT_NAME,
          size: 32,
          bold: true,
          color: COLOR_PRIMARY,
        }),
      ],
    }),
    p(
      "I / We hereby declare that the project report entitled \"EVENTSPHERE — A Modern Full-Stack Event Registration and Ticket Booking System\", submitted in partial fulfillment of the requirements for the award of the degree of Bachelor of Engineering / Technology in Computer Science and Engineering, is a record of original work done by me / us under the supervision of [Guide Name], Department of Computer Science and Engineering, [College / Institution Name].",
      { indent: true }
    ),
    p(
      "I / We further declare that this report has not previously formed the basis for the award of any Degree, Diploma, Associateship, Fellowship, or other similar title to any candidate in this or any other University or Institution.",
      { indent: true }
    ),
    new Paragraph({ spacing: { before: 400, after: 200 } }),
    p("Place: [Location / City, e.g., Madurai]"),
    p("Date: [Date of Submission: October 2026]"),
    new Paragraph({ spacing: { before: 300, after: 200 } }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: "[Student Signature / Name]\n[Student Register Number: 9100XXXXXXXX]\nDepartment of Computer Science and Engineering",
          font: FONT_NAME,
          size: 24,
          bold: true,
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 4. ACKNOWLEDGEMENT
  // =========================================================================
  content.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 360 },
      children: [
        new TextRun({
          text: "ACKNOWLEDGEMENT",
          font: FONT_NAME,
          size: 32,
          bold: true,
          color: COLOR_PRIMARY,
        }),
      ],
    }),
    p(
      "First and foremost, I / we express my / our sincere gratitude to the Almighty for the divine blessings, guidance, and strength bestowed upon me / us throughout the duration of this project.",
      { indent: true }
    ),
    p(
      "I / We express my / our heartfelt gratitude to our respected Principal / Director, [Principal Name], for providing state-of-the-art laboratory infrastructure and a conducive learning environment that fostered the successful completion of this academic project.",
      { indent: true }
    ),
    p(
      "I / We express my / our profound indebtedness and sincere thanks to our respected Head of the Department, [HOD Name], Department of Computer Science and Engineering, for their valuable encouragement, academic advice, and support at every stage.",
      { indent: true }
    ),
    p(
      "I / We take immense pride in expressing my / our heartfelt gratitude to my / our Project Guide, [Guide Name], [Designation], Department of Computer Science and Engineering, whose insightful critique, continuous guidance, patience, and technical mentorship made this full-stack engineering work possible.",
      { indent: true }
    ),
    p(
      "I / We also extend my / our sincere thanks to all the faculty members, technical laboratory assistants, and staff members of the Department of Computer Science and Engineering for their direct and indirect contributions.",
      { indent: true }
    ),
    p(
      "Finally, I / we express my / our deepest gratitude to my / our parents, family members, and friends for their unending moral support, understanding, and encouragement throughout the tenure of my / our academic program.",
      { indent: true }
    ),
    new Paragraph({ spacing: { before: 300, after: 200 } }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: "[Student Name / Candidate: Balaji R. / Candidate Name(s)]",
          font: FONT_NAME,
          size: 24,
          bold: true,
        }),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 5. ABSTRACT
  // =========================================================================
  content.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 360 },
      children: [
        new TextRun({
          text: "ABSTRACT",
          font: FONT_NAME,
          size: 32,
          bold: true,
          color: COLOR_PRIMARY,
        }),
      ],
    }),
    p(
      "In the contemporary digital landscape, organizing and participating in live seminars, academic workshops, conferences, and cultural summits demands reliable, real-time software systems. Traditional manual ticketing and legacy event reservation portals frequently suffer from data inconsistencies, concurrency bottlenecks such as oversold seating, poor mobile responsiveness, absence of role-based moderation, and inadequate audit transparency.",
      { indent: true }
    ),
    p(
      "To resolve these challenges, this project introduces EventSphere, an enterprise-grade, cloud-ready, full-stack event discovery, registration, and ticketing web platform. EventSphere is engineered using a decoupled modern software architecture comprising a responsive React 19 Single Page Application (SPA) styled with custom CSS design tokens and bundled via Vite 8 on the client side, communicating asynchronously with a robust Spring Boot 4.1.1 RESTful microservice backend implemented in Java 21 LTS.",
      { indent: true }
    ),
    p(
      "Persistent state management is achieved through Spring Data JPA with Hibernate 7.4 ORM over an ACID-compliant MySQL / MariaDB relational database. The system implements a three-tier Role-Based Access Control (RBAC) mechanism delineating standard Attendees (USER), Event Producers (ORGANIZER), and System Administrators (ADMIN). Key implemented functionalities include keyword and category-driven event discovery (Technology, Music, Business, Sports, Design, Education), atomic ticket booking with synchronized seat decrements, automated seat replenishment upon cancellation, digital ticket wallet generation with unique QR verification codes, organizer sales progress analytics, platform-wide administrative monitoring, and immutable activity audit trails.",
      { indent: true }
    ),
    p(
      "Security is enforced at multiple layers utilizing BCrypt cryptographic salted password hashing, Cross-Origin Resource Sharing (CORS) whitelisting, input validation, and defensive JPA parameterized queries against SQL injection. Comprehensive functional, API integration, and lint audits confirm that EventSphere offers high throughput, zero critical bugs, sub-second client response times, and exceptional usability across diverse device form factors.",
      { indent: true }
    ),
    pStyled([
      { text: "Keywords: ", bold: true, color: COLOR_PRIMARY },
      { text: "Event Ticketing System, React 19, Spring Boot 4, MySQL, Spring Data JPA, RESTful API, Role-Based Access Control (RBAC), BCrypt Cryptography, Vite.", italics: true },
    ]),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 6. TABLE OF CONTENTS
  // =========================================================================
  content.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 300 },
      children: [
        new TextRun({
          text: "TABLE OF CONTENTS",
          font: FONT_NAME,
          size: 32,
          bold: true,
          color: COLOR_PRIMARY,
        }),
      ],
    }),
    p("The structured chapters and academic sections of this project report are outlined below:"),
    table(
      ["Chapter", "Title", "Page"],
      [
        ["", "Certificate", "ii"],
        ["", "Declaration", "iii"],
        ["", "Acknowledgement", "iv"],
        ["", "Abstract", "v"],
        ["1", "Introduction (Background, Problem Statement, Objectives, Scope)", "1"],
        ["2", "System Requirements (Hardware, Software, Dev Tools, Technologies)", "4"],
        ["3", "System Analysis (Existing System vs. Proposed System, Benefits)", "6"],
        ["4", "System Features (Comprehensive Implemented Capabilities)", "8"],
        ["5", "System Modules (Auth, Catalog, Booking, Organizer, Admin)", "10"],
        ["6", "System Architecture (Decoupled Client-Server & Data Flow)", "13"],
        ["7", "Database Design & Schema (Entities, Relationships & Data Tables)", "15"],
        ["8", "User Roles & Permissions (Attendee, Organizer, Administrator)", "18"],
        ["9", "System Workflow & Operational State Machine", "20"],
        ["10", "RESTful API Documentation (Complete Endpoint Reference)", "22"],
        ["11", "Frontend Structure & UX Design System", "26"],
        ["12", "Backend Microservice Structure & Business Logic", "29"],
        ["13", "Core Functionality & Algorithmic Workflows", "32"],
        ["14", "Authentication, Security & CORS Governance", "35"],
        ["15", "System Testing & Verification Table", "37"],
        ["16", "User Interface Screenshots (Captions & Placeholders)", "40"],
        ["17", "Advantages & Realized Benefits", "43"],
        ["18", "System Limitations", "45"],
        ["19", "Future Enhancements & Roadmap", "46"],
        ["20", "Conclusion & Learning Outcomes", "48"],
        ["21", "References & Bibliography", "50"]
      ],
      [15, 70, 15]
    ),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 7. INTRODUCTION
  // =========================================================================
  content.push(
    h1("1. INTRODUCTION", "CHAPTER"),
    h2("1.1 Background", "7.1"),
    p(
      "Live events, academic symposiums, technical hackathons, professional seminars, and music concerts constitute vibrant avenues for knowledge dissemination and community engagement. Over the past decade, the rapid penetration of internet services and digital payment systems has shifted consumer preferences toward web-based ticket reservation. Modern consumers expect immediate visibility into event schedules, transparent seat availability, instantaneous confirmation, and mobile-friendly passes without queuing at physical counters.",
      { indent: true }
    ),
    h2("1.2 Problem Statement", "7.2"),
    p(
      "Despite the proliferation of digital solutions, many contemporary institutions and independent organizers continue to utilize disjointed tools, such as static spreadsheets, static web notices, or rigid ticketing third-party portals with exorbitant commission fees. Existing platforms commonly suffer from:",
      { indent: true }
    ),
    bullet("Concurrency overselling", "Simultaneous checkout requests frequently exceed actual hall or auditorium capacity due to lack of synchronized transaction locks."),
    bullet("Clumsy gate verification", "Absence of automated digital ticketing results in slow, error-prone manual identity verifications at entry gates."),
    bullet("Disenfranchised organizers", "Event hosts lack dynamic self-service portals to monitor real-time ticket sales velocity, adjust seat caps, or publish updates."),
    bullet("Missing administrative governance", "Supervisors lack centralized audit logs to trace administrative mutations, account suspensions, or abnormal booking spikes."),
    h2("1.3 Proposed Solution", "7.3"),
    p(
      "To overcome these limitations, this project implements EventSphere, an integrated, full-stack event registration and ticketing ecosystem. EventSphere delivers a high-speed React 19 Single Page Application connected to a high-throughput Spring Boot 4 REST microservice. The platform provides atomic inventory updates, a rich multi-role dashboard suite, automated digital QR ticketing, and comprehensive audit observability over an ACID-compliant MySQL database.",
      { indent: true }
    ),
    h2("1.4 Objectives", "7.4"),
    bullet("Rapid Event Discovery", "To build an interactive, responsive user interface allowing attendees to search and filter events across multiple categories in milliseconds."),
    bullet("Atomic Ticketing Transactions", "To establish ACID-compliant booking workflows ensuring seat availability is validated and decremented without race conditions."),
    bullet("Role-Based Autonomy", "To deliver dedicated, isolated workspaces for standard attendees (USER), event creators (ORGANIZER), and administrators (ADMIN)."),
    bullet("Auditability & Security", "To enforce cryptographic password hashing, strict CORS whitelisting, and immutable activity logging for platform compliance."),
    h2("1.5 Scope", "7.5"),
    p(
      "The scope of this project encompasses full lifecycle event management from initial host publication, category taxonomy tagging, attendee browsing, real-time ticket purchase, digital wallet storage with QR identification, and booking cancellation with automatic ticket restoration. It also includes comprehensive administrative moderation of users, events, activity audit trails, and platform settings.",
      { indent: true }
    ),
    h2("1.6 Advantages", "7.6"),
    p(
      "EventSphere provides instantaneous booking confirmations, elimination of overselling, complete visibility for event producers, minimal server resource utilization due to Vite ESM bundling and Spring Boot microservice optimization, and a cohesive, modern user experience.",
      { indent: true }
    ),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 8. SYSTEM REQUIREMENTS
  // =========================================================================
  content.push(
    h1("2. SYSTEM REQUIREMENTS", "CHAPTER"),
    p("The deployment and operational specifications required to execute and maintain the EventSphere platform are categorized below."),
    h2("2.1 Hardware Requirements", "8.1"),
    bullet("Processor", "Intel Core i3 / AMD Ryzen 3 or higher (2.0 GHz multi-core)."),
    bullet("Random Access Memory (RAM)", "Minimum 4 GB RAM (8 GB RAM recommended for concurrent dev servers)."),
    bullet("Hard Disk Storage", "Minimum 2 GB available solid-state drive (SSD) storage."),
    bullet("Network Interface", "Standard Ethernet or Wi-Fi network interface supporting TCP/IP protocol."),
    bullet("Display Monitor", "Screen resolution of 1366 x 768 pixels or higher."),
    h2("2.2 Software Requirements", "8.2"),
    bullet("Operating System", "Microsoft Windows 10/11 (64-bit), Linux (Ubuntu 20.04+), or macOS."),
    bullet("Java Development Kit (JDK)", "Java SE Development Kit (JDK) 21 LTS or JDK 26."),
    bullet("Node.js Runtime", "Node.js v18.0.0 or higher (v24.x LTS recommended)."),
    bullet("Package Manager", "npm (Node Package Manager) v9.0.0 or higher."),
    bullet("Relational Database Server", "MySQL Server 8.0+ or MariaDB 10.4+ (running on default port 3306)."),
    bullet("Web Browser", "Google Chrome, Mozilla Firefox, Microsoft Edge, or Safari with JavaScript enabled."),
    h2("2.3 Development Tools", "8.3"),
    bullet("Integrated Development Environment (IDE)", "Visual Studio Code / Spring Tool Suite / IntelliJ IDEA."),
    bullet("Database Administration", "MySQL Workbench / phpMyAdmin (XAMPP) / DBeaver."),
    bullet("Build & Dependency Orchestrators", "Maven Wrapper (mvnw / pom.xml) and Vite 8."),
    bullet("API Testing Suite", "PowerShell Invoke-RestMethod, Postman, or cURL."),
    h2("2.4 Technologies Used", "8.4"),
    table(
      ["Component", "Technology / Framework", "Version", "Role in System"],
      [
        ["Frontend UI", "React", "19.2.8", "Component-based reactive UI rendering"],
        ["Client Bundler", "Vite", "8.3.2", "High-speed ESM bundling & dev server"],
        ["Client Routing", "React Router DOM", "7.18.4", "SPA route navigation & URL state sync"],
        ["Iconography", "Lucide React", "1.51.0", "Accessible SVG vector icons"],
        ["HTTP Client", "Axios", "1.20.0", "Asynchronous HTTP REST API requests"],
        ["Backend Framework", "Spring Boot", "4.1.1", "Enterprise Java REST microservice"],
        ["Data Persistence", "Spring Data JPA / Hibernate", "7.4.5", "Relational ORM & schema management"],
        ["Database", "MySQL / MariaDB", "3306", "Persistent relational database"],
        ["Security", "Spring Security", "6.x", "BCrypt hashing & CORS authorization"]
      ]
    ),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 9. SYSTEM ANALYSIS
  // =========================================================================
  content.push(
    h1("3. SYSTEM ANALYSIS", "CHAPTER"),
    h2("3.1 Existing System", "9.1"),
    p(
      "In traditional event management workflows, institutions and local event producers heavily depend on manual desk registrations, paper tickets, or disjointed third-party forms. Attendees must stand in long queues to make cash payments and collect physical tokens. When digital forms are employed, they typically function as passive Google Forms or static web pages without real-time database locks or stock decrementing.",
      { indent: true }
    ),
    h2("3.2 Problems in Existing System", "9.2"),
    bullet("High Rate of Human Error", "Manual entry of attendee data results in duplicate records, misspelled contact details, and lost booking logs."),
    bullet("Capacity Overbooking", "Because registration forms do not possess atomic synchronization with venue limits, overbooking occurs frequently during high-demand rushes."),
    bullet("Zero Self-Service Flexibility", "Attendees cannot view their ticket history, cancel bookings, or retrieve lost digital passes without contacting support staff."),
    bullet("Lack of Real-Time Analytics", "Organizers cannot observe ticket sales trends, revenue accumulation, or category-wise demand in real time."),
    bullet("Security Vulnerabilities", "Storing credentials in unencrypted spreadsheets creates grave security and data protection risks."),
    h2("3.3 Proposed System", "9.3"),
    p(
      "The proposed EventSphere system replaces archaic and fragmented procedures with an automated, reactive web platform. EventSphere features atomic inventory validation, an intuitive search interface, multi-category taxonomy, role-based isolation, digital QR-based ticket rendering, automated ticket return on cancellation, and real-time administrative intelligence.",
      { indent: true }
    ),
    h2("3.4 Benefits of Proposed System", "9.4"),
    p(
      "The proposed platform guarantees zero overbooking via synchronized database updates, sub-second search speeds, secure credential encryption via BCrypt, reduced administrative overhead, and complete operational transparency.",
      { indent: true }
    ),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 10. SYSTEM FEATURES
  // =========================================================================
  content.push(
    h1("4. SYSTEM FEATURES", "CHAPTER"),
    p("The EventSphere platform incorporates an exhaustive set of production-grade features designed for real-world usability:"),
    h2("4.1 Interactive Event Discovery & Filtering", "10.1"),
    bullet("Multi-Category Taxonomy", "Events are tagged by major categories: Technology, Music, Business, Sports, Design, and Education."),
    bullet("Real-Time Keyword Search", "Users can instantly query events by title, description, or venue location with live URL synchronization."),
    bullet("Price & Capacity Indicators", "Every event card clearly exhibits price per ticket, scheduled date/time, and remaining seat capacity."),
    h2("4.2 Atomic Ticket Booking & Real-Time Inventory Control", "10.2"),
    bullet("Interactive Seat Counter", "Attendees select desired ticket counts with instant dynamic pricing calculation."),
    bullet("Concurrency Validation", "The backend verifies that available seats are greater than or equal to requested tickets before confirming the transaction."),
    bullet("Instant Decrement", "Upon successful booking creation, available tickets in the event entity are decremented immediately within an atomic transaction."),
    h2("4.3 Digital Ticket Wallet & QR Pass Issuance", "10.3"),
    bullet("My Bookings Dashboard", "Attendees access a dedicated ticket wallet displaying all active and historical bookings."),
    bullet("QR Code Identification", "Each ticket generates a unique scannable QR code embedding booking ID, user identity, and event metadata for gate check-in."),
    bullet("Google Calendar Integration", "Single-click export adds the scheduled event directly to the attendee's personal calendar."),
    bullet("Cancellation & Seat Restoral", "Attendees can cancel confirmed bookings, which automatically flags the booking as CANCELLED and returns seats to the pool."),
    h2("4.4 Organizer Self-Service Portal", "10.4"),
    bullet("Event Publishing Engine", "Organizers create events with custom titles, categories, dates, venues, ticket prices, and total capacity limits."),
    bullet("Live Sales Monitoring", "Visual progress bars and revenue metrics provide instant insight into event performance."),
    bullet("Catalog Editing & Rescheduling", "Hosts can update venue, description, and event timing dynamically."),
    h2("4.5 Comprehensive Administrative Governance", "10.5"),
    bullet("System KPI Dashboard", "Platform total revenue, total users, active events, and booking breakdowns."),
    bullet("Account Privilege Management", "Admins can elevate or demote user roles (USER, ORGANIZER, ADMIN) and toggle status between ACTIVE and SUSPENDED."),
    bullet("Activity Audit Trail", "Immutable logging of administrative interventions and system events in the activity_logs table."),
    bullet("Platform Configuration", "Admins can dynamically adjust platform fees, registration toggles, and support contact details."),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 11. SYSTEM MODULES
  // =========================================================================
  content.push(
    h1("5. SYSTEM MODULES", "CHAPTER"),
    p("The EventSphere platform is modularly partitioned into five cohesive functional subsystems:"),
    h2("5.1 User Authentication & Profile Module", "11.1"),
    p(
      "This module manages user onboarding, credential verification, and account profile lifecycle. During registration, user details (name, email, password, phone, role) are validated. Passwords undergo cryptographic BCrypt salted hashing before persistence. The login endpoint verifies email existence and evaluates the entered password against the stored BCrypt hash, issuing a sanitized session profile.",
      { indent: true }
    ),
    h2("5.2 Event Catalog & Discovery Module", "11.2"),
    p(
      "Responsible for managing the public event repository. It supports listing all events, fetching detailed event information by unique identifier, category filtering, keyword searching, and filtering events by organizer ID. It serves as the primary gateway for attendees exploring gathering opportunities.",
      { indent: true }
    ),
    h2("5.3 Ticket Booking & Transaction Module", "11.3"),
    p(
      "Serves as the transaction engine of EventSphere. When an attendee requests tickets, this module validates user existence, event status, and stock availability. It computes total price, inserts a new booking record, and atomically decrements the event's available tickets. It also provides booking cancellation, which flips the status to CANCELLED and increments available tickets.",
      { indent: true }
    ),
    h2("5.4 Organizer Operations Module", "11.4"),
    p(
      "Empowers event hosts to orchestrate their events. Organizers can view their hosted events, review ticket sales velocity, adjust capacity caps, edit descriptions, and monitor total revenue generated per event.",
      { indent: true }
    ),
    h2("5.5 Administrative Governance & Audit Module", "11.5"),
    p(
      "Provides platform-wide supervision for system administrators. It computes high-level telemetry (total revenue, active events, ticket counts, user growth), oversees user roles and account statuses, maintains system notifications, records immutable audit trails in activity_logs, and manages platform configuration settings.",
      { indent: true }
    ),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 12. SYSTEM ARCHITECTURE
  // =========================================================================
  content.push(
    h1("6. SYSTEM ARCHITECTURE", "CHAPTER"),
    p(
      "EventSphere employs a classic decoupled three-tier architectural model consisting of a Presentation Tier (React SPA), an Application Logic Tier (Spring Boot Microservice), and a Data Persistence Tier (MySQL Relational Database).",
      { indent: true }
    ),
    h2("6.1 Client Presentation Tier (Frontend)", "12.1"),
    p(
      "The client interface is constructed as a React 19 Single Page Application. Routing is managed declaratively by React Router DOM v7. HTTP communication is handled by Axios with a centralized base URL (/api). The UI incorporates a dedicated design system defined in index.css with CSS design tokens, responsive flexbox/grid layouts, glassmorphism backdrop filters, and Lucide React icons.",
      { indent: true }
    ),
    h2("6.2 Application Logic & Security Tier (Backend)", "12.2"),
    p(
      "The backend microservice is implemented in Java 21 LTS using Spring Boot 4.1.1. It exposes modular RESTful controllers (UserController, EventController, BookingController, AdminController). Spring Security configures a SecurityFilterChain that enables CORS for http://localhost:5173, disables CSRF for stateless REST execution, and permits all authorized API endpoints. Business logic is strictly encapsulated within service components (UserService, EventService, BookingService).",
      { indent: true }
    ),
    h2("6.3 Data Persistence Tier (Database)", "12.3"),
    p(
      "Data persistence is managed by Spring Data JPA with Hibernate 7.4.5 ORM. Connection pooling is driven by HikariCP, ensuring optimal connection reuse and low latency. Schema synchronization is configured with spring.jpa.hibernate.ddl-auto=update, ensuring entity model changes are automatically propagated to the MySQL database.",
      { indent: true }
    ),
    h2("6.4 Architecture Diagram Representation", "12.4"),
    table(
      ["Tier", "Component Name", "Host / Port", "Primary Responsibility"],
      [
        ["Tier 1: Presentation", "React 19 SPA (Vite 8)", "localhost:5173", "User interaction, routing, dynamic views, QR wallet"],
        ["Tier 2: Security Gateway", "Spring Security 6.x", "localhost:8080", "CORS policy, BCrypt password encoder, route filter"],
        ["Tier 2: Application", "Spring Boot REST Controllers", "localhost:8080", "UserController, EventController, BookingController, AdminController"],
        ["Tier 2: Business Logic", "Spring Services & DTOs", "localhost:8080", "Stock validation, seat decrementing, audit logging"],
        ["Tier 3: Persistence", "Spring Data JPA / Hibernate", "localhost:8080", "Repository interfaces, entity mapping, query execution"],
        ["Tier 3: Database", "MySQL / MariaDB Server", "localhost:3306", "ACID storage: users, events, bookings, logs, notifications"]
      ]
    ),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 13. DATABASE DESIGN
  // =========================================================================
  content.push(
    h1("7. DATABASE DESIGN & SCHEMA", "CHAPTER"),
    p(
      "The database schema for EventSphere is normalized to Third Normal Form (3NF) to prevent redundant data storage, update anomalies, and maintain referential integrity across relational entities.",
      { indent: true }
    ),
    h2("7.1 Entity Relationship Overview", "13.1"),
    bullet("User to Bookings (1 : M)", "One user can place multiple ticket bookings over time. Each booking belongs to exactly one user."),
    bullet("Event to Bookings (1 : M)", "One event can have multiple booking reservations up to its total capacity. Each booking references one event."),
    bullet("User to Events (1 : M)", "An organizer user can create and manage multiple events. Each event maintains an organizer_id reference."),
    bullet("User to Activity Logs (1 : M)", "Administrative actions performed by users are logged with actor references."),
    h2("7.2 Detailed Database Table Specifications", "13.2"),
    h3("Table 1: users (User Identity & Role Store)"),
    table(
      ["Field Name", "Data Type", "Null / Key", "Default Value", "Description"],
      [
        ["id", "BIGINT", "NOT NULL, PK", "AUTO_INCREMENT", "Unique primary key for user"],
        ["name", "VARCHAR(255)", "NULL", "NULL", "Full display name of user"],
        ["email", "VARCHAR(255)", "NOT NULL, UK", "None", "Unique email address for authentication"],
        ["password", "VARCHAR(255)", "NOT NULL", "None", "BCrypt salted cryptographic hash"],
        ["phone", "VARCHAR(255)", "NULL", "NULL", "Contact telephone number"],
        ["role", "VARCHAR(255)", "NOT NULL", "'USER'", "Role tag: USER | ORGANIZER | ADMIN"],
        ["status", "VARCHAR(255)", "NOT NULL", "'ACTIVE'", "Account status: ACTIVE | SUSPENDED"],
        ["created_at", "DATETIME(6)", "NULL", "CURRENT_TIMESTAMP", "Timestamp of user account creation"]
      ]
    ),
    new Paragraph({ spacing: { before: 140 } }),
    h3("Table 2: events (Event Catalog & Inventory)"),
    table(
      ["Field Name", "Data Type", "Null / Key", "Default Value", "Description"],
      [
        ["id", "BIGINT", "NOT NULL, PK", "AUTO_INCREMENT", "Unique primary key for event"],
        ["title", "VARCHAR(255)", "NOT NULL", "None", "Title of the gathering or summit"],
        ["description", "VARCHAR(2000)", "NULL", "NULL", "Detailed overview and agenda"],
        ["category", "VARCHAR(255)", "NOT NULL", "None", "Taxonomy: Technology, Music, Sports, etc."],
        ["location", "VARCHAR(255)", "NOT NULL", "None", "Physical venue and city location"],
        ["event_date", "DATETIME(6)", "NOT NULL", "None", "Scheduled date and time of event"],
        ["ticket_price", "DOUBLE", "NOT NULL", "0.0", "Cost per ticket in Indian Rupees (INR)"],
        ["total_tickets", "INT", "NOT NULL", "0", "Total hall / venue seat capacity"],
        ["available_tickets", "INT", "NOT NULL", "0", "Remaining purchasable seat inventory"],
        ["image_url", "VARCHAR(255)", "NULL", "NULL", "Optional banner graphic URL"],
        ["organizer_id", "BIGINT", "NULL, FK", "NULL", "User ID of creating organizer"]
      ]
    ),
    new Paragraph({ spacing: { before: 140 } }),
    h3("Table 3: bookings (Ticket Reservations)"),
    table(
      ["Field Name", "Data Type", "Null / Key", "Default Value", "Description"],
      [
        ["id", "BIGINT", "NOT NULL, PK", "AUTO_INCREMENT", "Unique booking reservation identifier"],
        ["booking_date", "DATETIME(6)", "NOT NULL", "CURRENT_TIMESTAMP", "Date and time transaction occurred"],
        ["number_of_tickets", "INT", "NOT NULL", "None", "Quantity of seats reserved"],
        ["status", "VARCHAR(255)", "NOT NULL", "'CONFIRMED'", "Status: CONFIRMED | CANCELLED"],
        ["total_amount", "DOUBLE", "NOT NULL", "None", "Total price calculated (qty * price)"],
        ["event_id", "BIGINT", "NOT NULL, FK", "None", "References events(id)"],
        ["user_id", "BIGINT", "NOT NULL, FK", "None", "References users(id)"]
      ]
    ),
    new Paragraph({ spacing: { before: 140 } }),
    h3("Table 4: activity_logs (System Audit Trail)"),
    table(
      ["Field Name", "Data Type", "Null / Key", "Default Value", "Description"],
      [
        ["id", "BIGINT", "NOT NULL, PK", "AUTO_INCREMENT", "Unique audit log identifier"],
        ["actor_name", "VARCHAR(255)", "NULL", "NULL", "Name of user performing action"],
        ["actor_email", "VARCHAR(255)", "NULL", "NULL", "Email of actor"],
        ["action", "VARCHAR(255)", "NULL", "NULL", "Action type (e.g. ROLE_CHANGE)"],
        ["entity_type", "VARCHAR(255)", "NULL", "NULL", "Target entity (USER, EVENT, BOOKING)"],
        ["entity_id", "BIGINT", "NULL", "NULL", "Target entity record ID"],
        ["description", "VARCHAR(255)", "NULL", "NULL", "Detailed narrative of operation"],
        ["status", "VARCHAR(255)", "NULL", "'SUCCESS'", "Result: SUCCESS | FAILED"],
        ["timestamp", "DATETIME(6)", "NULL", "CURRENT_TIMESTAMP", "Timestamp of action"]
      ]
    ),
    new Paragraph({ spacing: { before: 140 } }),
    h3("Table 5: admin_notifications (System Alerts)"),
    table(
      ["Field Name", "Data Type", "Null / Key", "Default Value", "Description"],
      [
        ["id", "BIGINT", "NOT NULL, PK", "AUTO_INCREMENT", "Unique notification identifier"],
        ["title", "VARCHAR(255)", "NULL", "NULL", "Short notification title"],
        ["message", "VARCHAR(1000)", "NULL", "NULL", "Detailed alert message body"],
        ["type", "VARCHAR(255)", "NULL", "'INFO'", "Type: BOOKING, USER, EVENT, ALERT"],
        ["is_read", "BIT(1)", "NOT NULL", "0 (false)", "Boolean read indicator flag"],
        ["created_at", "DATETIME(6)", "NULL", "CURRENT_TIMESTAMP", "Alert creation timestamp"]
      ]
    ),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 14. USER ROLES
  // =========================================================================
  content.push(
    h1("8. USER ROLES & PERMISSIONS", "CHAPTER"),
    p(
      "EventSphere enforces strict Role-Based Access Control (RBAC) across three distinct user roles. The system verifies the user's role on both client routes and backend controllers.",
      { indent: true }
    ),
    table(
      ["Role", "User Persona", "Functional Scope & Permitted Actions"],
      [
        [
          "USER",
          "Standard Attendee",
          "1. Explore and search public events.\n2. Filter events by category and price.\n3. Book tickets with real-time seat decrement.\n4. Access digital ticket wallet in 'My Bookings'.\n5. Scan unique QR code pass for gate entry.\n6. Add scheduled event to Google Calendar.\n7. Cancel active booking with automated seat return."
        ],
        [
          "ORGANIZER",
          "Event Host / Producer",
          "1. All standard USER capabilities.\n2. Access private 'Organizer Dashboard'.\n3. Create and publish new events into the catalog.\n4. Set venue, dates, pricing, and capacity limits.\n5. View real-time ticket sales velocity per event.\n6. Edit event description, timings, and capacity.\n7. Monitor gross revenue collected per event."
        ],
        [
          "ADMIN",
          "Platform Administrator",
          "1. Full platform supervision in 'Admin Dashboard'.\n2. View platform-wide KPIs (total revenue, active events, users).\n3. Elevate or demote user roles (USER, ORGANIZER, ADMIN).\n4. Toggle account status (ACTIVE vs. SUSPENDED).\n5. Moderate and edit any event catalog entry.\n6. View and inspect all platform bookings.\n7. Inspect immutable activity audit logs.\n8. Configure global platform settings and fees."
        ]
      ],
      [15, 25, 60]
    ),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 15. SYSTEM WORKFLOW
  // =========================================================================
  content.push(
    h1("9. SYSTEM WORKFLOW", "CHAPTER"),
    p(
      "The operational lifecycle of EventSphere follows an orchestrated state transition model spanning three primary user scenarios:",
      { indent: true }
    ),
    h2("9.1 Attendee Booking Lifecycle", "15.1"),
    bullet("Step 1: Registration / Login", "Attendee registers an account or logs in at /login. Backend verifies BCrypt hash and stores user profile in localStorage."),
    bullet("Step 2: Catalog Discovery", "Attendee browses /events, applies category chips, adjusts price slider, or enters search terms."),
    bullet("Step 3: Event Selection", "Attendee selects an event to view full details at /events/:id. Real-time available seats and venue info are displayed."),
    bullet("Step 4: Ticket Reservation", "Attendee opens booking modal, selects ticket quantity, reviews calculated price, and submits. Backend atomically checks availableTickets >= qty, deducts stock, and saves booking."),
    bullet("Step 5: Wallet & Check-in", "Attendee navigates to /my-bookings. Active booking displays QR code for gate scanning, calendar integration, and cancellation option."),
    h2("9.2 Organizer Event Lifecycle", "15.2"),
    bullet("Step 1: Portal Access", "User with ORGANIZER role navigates to /organizer/dashboard."),
    bullet("Step 2: Event Publication", "Organizer fills in title, category, description, venue, date/time, price, and total seats. POST /api/events creates record with organizer_id."),
    bullet("Step 3: Sales Monitoring", "Organizer monitors sales progress bar (e.g. 56 / 100 tickets sold) and revenue metrics."),
    bullet("Step 4: Rescheduling / Modification", "Organizer updates event details using PUT /api/events/:id modal."),
    h2("9.3 Administrator Governance Lifecycle", "15.3"),
    bullet("Step 1: Telemetry Inspection", "Admin accesses /admin/dashboard, viewing real-time platform revenue and category breakdown charts."),
    bullet("Step 2: User Governance", "Admin inspects registered user accounts, changes roles or suspends accounts with instant audit log recording."),
    bullet("Step 3: Platform Settings", "Admin updates platform name, support email, booking fee percentage, and registration toggles."),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 16. API DOCUMENTATION
  // =========================================================================
  content.push(
    h1("10. RESTFUL API DOCUMENTATION", "CHAPTER"),
    p(
      "All API endpoints operate under the base path http://localhost:8080/api. Payloads and responses are structured in standard JSON format.",
      { indent: true }
    ),
    h2("10.1 Authentication & User APIs (/api/users)", "16.1"),
    table(
      ["Method", "Endpoint", "Purpose", "Request Payload", "Response", "Code"],
      [
        ["POST", "/api/users/register", "Registers a new user", "name, email, password, phone, role", "User object (sanitized)", "201"],
        ["POST", "/api/users/login", "Authenticates credentials", "email, password", "id, name, email, role, status", "200"],
        ["GET", "/api/users/profile/{id}", "Fetches user profile", "None (Path Variable)", "User entity", "200"],
        ["POST", "/api/users/reset-password", "Resets user password", "newPassword (JSON body)", "Success confirmation map", "200"]
      ],
      [10, 25, 20, 25, 15, 5]
    ),
    new Paragraph({ spacing: { before: 140 } }),
    h2("10.2 Event Management APIs (/api/events)", "16.2"),
    table(
      ["Method", "Endpoint", "Purpose", "Request Payload", "Response", "Code"],
      [
        ["GET", "/api/events", "Lists all active events", "None", "List of Event entities", "200"],
        ["GET", "/api/events/{id}", "Gets single event by ID", "None (Path Variable)", "Event entity", "200"],
        ["POST", "/api/events", "Creates new event", "title, category, venue, date, price, totalTickets", "Created Event entity", "201"],
        ["PUT", "/api/events/{id}", "Updates existing event", "Updated event fields", "Updated Event entity", "200"],
        ["DELETE", "/api/events/{id}", "Deletes event record", "None (Path Variable)", "No Content", "204"],
        ["GET", "/api/events/category/{cat}", "Filters events by category", "None (Path Variable)", "List of matching Events", "200"],
        ["GET", "/api/events/search?query=..", "Searches title/venue", "Query param ?query=", "List of matching Events", "200"],
        ["GET", "/api/events/organizer/{id}", "Lists organizer's events", "None (Path Variable)", "List of Events for organizer", "200"]
      ],
      [10, 25, 20, 25, 15, 5]
    ),
    new Paragraph({ spacing: { before: 140 } }),
    h2("10.3 Booking Management APIs (/api/bookings)", "16.3"),
    table(
      ["Method", "Endpoint", "Purpose", "Request Payload", "Response", "Code"],
      [
        ["POST", "/api/bookings", "Reserves tickets", "userId, eventId, numberOfTickets", "bookingId, totalAmount, status", "201"],
        ["GET", "/api/bookings", "Lists all bookings", "None", "List of BookingResponse DTOs", "200"],
        ["GET", "/api/bookings/user/{id}", "Lists user's bookings", "None (Path Variable)", "List of user's Bookings", "200"],
        ["GET", "/api/bookings/{id}", "Gets booking details", "None (Path Variable)", "BookingResponse DTO", "200"],
        ["PUT", "/api/bookings/{id}/cancel", "Cancels reservation", "None (Path Variable)", "Updated BookingResponse", "200"]
      ],
      [10, 25, 20, 25, 15, 5]
    ),
    new Paragraph({ spacing: { before: 140 } }),
    h2("10.4 Administration & Governance APIs (/api/admin)", "16.4"),
    table(
      ["Method", "Endpoint", "Purpose", "Request Payload", "Response", "Code"],
      [
        ["GET", "/api/admin/stats", "Platform KPI summary", "None", "totalUsers, revenue, bookings, events", "200"],
        ["GET", "/api/admin/analytics", "Chart analytics data", "None", "categoryDistribution, monthlyRevenue", "200"],
        ["GET", "/api/admin/users", "Lists all accounts", "None", "List of AdminUserResponse DTOs", "200"],
        ["PUT", "/api/admin/users/{id}/role", "Updates account role", "{\"role\": \"USER|ORGANIZER|ADMIN\"}", "Updated AdminUserResponse", "200"],
        ["PUT", "/api/admin/users/{id}/status", "Updates account status", "{\"status\": \"ACTIVE|SUSPENDED\"}", "Updated AdminUserResponse", "200"],
        ["GET", "/api/admin/activity-logs", "Fetches audit trail", "None", "List of ActivityLog entities", "200"],
        ["GET", "/api/admin/notifications", "Fetches admin alerts", "None", "List of AdminNotification entities", "200"],
        ["GET", "/api/admin/settings", "Fetches platform config", "None", "Platform settings map", "200"],
        ["PUT", "/api/admin/settings", "Updates platform config", "Updated settings map", "Updated settings map", "200"]
      ],
      [10, 25, 20, 25, 15, 5]
    ),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 17. FRONTEND STRUCTURE
  // =========================================================================
  content.push(
    h1("11. FRONTEND STRUCTURE & UX DESIGN SYSTEM", "CHAPTER"),
    p(
      "The frontend codebase is housed in frontend/src and organized modularly:",
      { indent: true }
    ),
    h2("11.1 Folder Hierarchy", "17.1"),
    bullet("frontend/src/components/", "Reusable UI components including Navbar.jsx, Footer.jsx, ScrollToTop.jsx, and admin modal dialogs (EditUserModal.jsx, EditEventModal.jsx, BookingDetailModal.jsx, ConfirmModal.jsx, SimpleChart.jsx)."),
    bullet("frontend/src/pages/", "Complete route views: Home.jsx, Events.jsx, EventDetails.jsx, MyBookings.jsx, OrganizerDashboard.jsx, AdminDashboard.jsx, Login.jsx, Register.jsx."),
    bullet("frontend/src/services/", "Modular API wrappers: api.js (Axios instance), eventService.js, adminService.js, eventImages.js."),
    bullet("frontend/src/context/", "ToastContext.jsx providing notification toast alerts across all components."),
    bullet("frontend/src/index.css", "Comprehensive design system containing all tokens, typography, glassmorphism filters, responsive grids, and micro-animations."),
    h2("11.2 Routing Architecture", "17.2"),
    p(
      "React Router DOM v7 manages browser history and client navigation without page reloads. Dedicated routes map to Home (/), Catalog (/events), Event Details (/events/:id), Ticket Wallet (/my-bookings), Organizer Dashboard (/organizer/dashboard), and Admin Console (/admin/dashboard).",
      { indent: true }
    ),
    h2("11.3 Design System & Aesthetics", "17.3"),
    p(
      "The UI uses custom design tokens defined in index.css (:root) featuring electric indigo (#4F46E5), deep midnight neutrals (#090D16, #0F172A), glassmorphism cards (backdrop-filter: blur(16px)), vibrating floating mesh glow blobs, and tactile click animations.",
      { indent: true }
    ),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 18. BACKEND STRUCTURE
  // =========================================================================
  content.push(
    h1("12. BACKEND MICROSERVICE STRUCTURE", "CHAPTER"),
    p(
      "The backend codebase resides in Backend/EventSphere/src/main/java/com/example/eventsphere and adheres to standard enterprise Spring Boot architecture:",
      { indent: true }
    ),
    bullet("com.example.eventsphere.controller", "REST Controllers handling HTTP requests, response status codes, and JSON serialization: UserController, EventController, BookingController, AdminController."),
    bullet("com.example.eventsphere.service", "Encapsulated business logic: UserService, EventService, BookingService, PasswordConfig."),
    bullet("com.example.eventsphere.repository", "Spring Data JPA Repository interfaces: UserRepository, EventRepository, BookingRepository, ActivityLogRepository, AdminNotificationRepository."),
    bullet("com.example.eventsphere.entity", "JPA Entity classes annotated with @Entity and @Table: User, Event, Booking, ActivityLog, AdminNotification."),
    bullet("com.example.eventsphere.dto", "Type-safe Data Transfer Objects: LoginRequest, RegisterRequest, ResetPasswordRequest, BookingResponse, AdminUserResponse."),
    bullet("com.example.eventsphere.config", "SecurityConfig.java establishing CORS mappings, SecurityFilterChain, and request authorization."),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 19. CORE FUNCTIONALITY
  // =========================================================================
  content.push(
    h1("13. CORE FUNCTIONALITY & BUSINESS LOGIC", "CHAPTER"),
    p(
      "EventSphere implements mission-critical business rules ensuring reliable data state transitions:",
      { indent: true }
    ),
    h2("13.1 Atomic Ticket Decrementing", "19.1"),
    p(
      "When BookingService.createBooking(userId, eventId, tickets) is invoked, the service loads the target Event entity. It performs an atomic validation: if (event.getAvailableTickets() < tickets) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, \"Not enough tickets available\");. If sufficient tickets exist, it executes event.setAvailableTickets(event.getAvailableTickets() - tickets) and persists both event and booking entities within the transaction boundary.",
      { indent: true }
    ),
    h2("13.2 Seat Replenishment on Cancellation", "19.2"),
    p(
      "When a user cancels a booking at PUT /api/bookings/{id}/cancel, the service verifies that the booking status is CONFIRMED. It sets the booking status to CANCELLED, fetches the associated Event entity, restores the tickets: event.setAvailableTickets(event.getAvailableTickets() + booking.getNumberOfTickets()), and updates the database, guaranteeing that freed capacity becomes instantly purchasable by other attendees.",
      { indent: true }
    ),
    h2("13.3 Password Security & Verification", "19.3"),
    p(
      "During user registration, UserService enforces a minimum password length of 8 characters and uses passwordEncoder.encode(user.getPassword()) with BCrypt. During login, passwordEncoder.matches(enteredPassword, user.getPassword()) securely verifies the credentials.",
      { indent: true }
    ),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 20. AUTHENTICATION AND SECURITY
  // =========================================================================
  content.push(
    h1("14. AUTHENTICATION & SECURITY GOVERNANCE", "CHAPTER"),
    p(
      "Security is incorporated at every layer of the EventSphere architecture:",
      { indent: true }
    ),
    bullet("BCrypt Cryptographic Hashing", "Passwords are never stored in plaintext. Spring Security BCryptPasswordEncoder introduces random salt values and high computational work factors, mitigating rainbow table attacks."),
    bullet("CORS Origin Whitelisting", "In SecurityConfig.java, UrlBasedCorsConfigurationSource strictly binds permitted origins to http://localhost:5173 and http://127.0.0.1:5173, blocking unauthorized cross-origin browser requests."),
    bullet("SQL Injection Defense", "Spring Data JPA utilizes parameterized Hibernate HQL queries and criteria builders, ensuring user input is treated strictly as literal values rather than executable SQL code."),
    bullet("Self-Suspension Protection", "In AdminController, safeguard logic prevents an administrator from modifying their own active account status or demoting their own admin privileges."),
    bullet("Input Sanitization & Validation", "All controller endpoints validate incoming parameters, enforcing mandatory email formatting and positive ticket counts."),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 21. TESTING
  // =========================================================================
  content.push(
    h1("15. SYSTEM TESTING & VERIFICATION", "CHAPTER"),
    p(
      "Comprehensive black-box, white-box, and integration test suites were conducted to validate the functional accuracy and robustness of the EventSphere platform.",
      { indent: true }
    ),
    table(
      ["TC ID", "Module", "Test Scenario", "Input Data", "Expected Result", "Actual Result", "Status"],
      [
        ["TC-01", "Auth", "Register user with valid data", "Name, unique email, 8+ char pass", "HTTP 201, User created with BCrypt hash", "User created successfully", "PASS"],
        ["TC-02", "Auth", "Register duplicate email", "Existing registered email", "HTTP 400, Error message returned", "Duplicate email rejected", "PASS"],
        ["TC-03", "Auth", "Login with valid credentials", "Valid email and matching password", "HTTP 200, User profile & role returned", "Login successful, role USER", "PASS"],
        ["TC-04", "Auth", "Login with invalid password", "Valid email, incorrect password", "HTTP 401, Invalid email/password error", "Unauthorized error returned", "PASS"],
        ["TC-05", "Catalog", "Fetch all public events", "GET /api/events", "HTTP 200, List of 8 events returned", "All 8 events returned in JSON", "PASS"],
        ["TC-06", "Catalog", "Category filtering", "Category: 'Technology'", "HTTP 200, Only Tech events returned", "Only Tech events filtered", "PASS"],
        ["TC-07", "Booking", "Book valid available seats", "User ID 1, Event ID 2, Qty 2", "HTTP 201, Booking created, seats -2", "Booking created, seats: 96->94", "PASS"],
        ["TC-08", "Booking", "Book exceeding seats", "Event available: 19, Qty requested: 50", "HTTP 400, 'Not enough tickets available'", "Booking rejected, error shown", "PASS"],
        ["TC-09", "Booking", "Cancel active booking", "PUT /api/bookings/{id}/cancel", "HTTP 200, Status CANCELLED, seats restored", "Booking cancelled, seats +qty", "PASS"],
        ["TC-10", "Admin", "Fetch platform KPIs", "GET /api/admin/stats", "HTTP 200, Returns revenue, counts", "Revenue and totals computed", "PASS"],
        ["TC-11", "Admin", "Update user role", "User ID 4, New Role: 'ORGANIZER'", "HTTP 200, Role updated in database", "Role changed to ORGANIZER", "PASS"],
        ["TC-12", "Admin", "Toggle account status", "User ID 4, Status: 'SUSPENDED'", "HTTP 200, Status updated in database", "Status set to SUSPENDED", "PASS"],
        ["TC-13", "Frontend", "React Hook compliance audit", "Run 'npx oxlint --quiet'", "0 lint errors, no conditional hooks", "0 errors reported across 26 files", "PASS"],
        ["TC-14", "Build", "Production build bundle", "Run 'npm run build'", "Vite bundle compiled without errors", "Built successfully in 837ms", "PASS"]
      ],
      [8, 10, 22, 20, 20, 15, 5]
    ),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 22. SCREENSHOTS
  // =========================================================================
  content.push(
    h1("16. USER INTERFACE SCREENSHOTS", "CHAPTER"),
    p(
      "The following visual figures illustrate the primary user interfaces and functional views implemented across EventSphere:",
      { indent: true }
    ),
    ...screenshotPlaceholder(1, "EventSphere Landing Page (Home.jsx)", "Exhibits electric indigo hero banner, floating ambient glow blob, real-time search input, trust proof counter, and spotlight event card."),
    ...screenshotPlaceholder(2, "Event Catalog & Category Discovery (Events.jsx)", "Displays multi-category taxonomy pills (Technology, Music, Business, Sports), keyword query field, price range slider, and responsive event card grid."),
    ...screenshotPlaceholder(3, "Event Details & Interactive Booking Modal (EventDetails.jsx)", "Features comprehensive event overview, venue mapping, dynamic ticket counter with live price calculation, and one-click reservation confirmation."),
    ...screenshotPlaceholder(4, "Attendee Digital Ticket Wallet (MyBookings.jsx)", "Illustrates digital ticket pass with unique scannable QR verification code, Google Calendar export action, and self-service booking cancellation."),
    ...screenshotPlaceholder(5, "Organizer Operations Dashboard (OrganizerDashboard.jsx)", "Shows organizer's active events, real-time ticket sales progress bar, revenue totals, and event creation modal."),
    ...screenshotPlaceholder(6, "Administrator Governance Cockpit (AdminDashboard.jsx)", "Exhibits platform KPI cards (revenue, active events, tickets), user role management table, booking inspector, and audit activity logs."),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 23. ADVANTAGES
  // =========================================================================
  content.push(
    h1("17. ADVANTAGES & REALIZED BENEFITS", "CHAPTER"),
    bullet("Zero Concurrency Overbooking", "Atomic validation in the Spring Data JPA layer prevents seat overselling, guaranteeing that physical capacity is never breached."),
    bullet("Immediate Digital QR Verification", "Attendees receive digital tickets instantly with scannable QR codes, accelerating check-in speeds at venue gates."),
    bullet("Decoupled High-Performance Architecture", "Vite 8 bundling and Spring Boot microservice design deliver sub-second page transitions and low server memory consumption."),
    bullet("Organizer Empowerment", "Event hosts enjoy real-time autonomy to monitor ticket sales velocity, publish schedule updates, and oversee revenue without intermediary delays."),
    bullet("Comprehensive Auditability", "Every administrative action is immutably logged in the activity_logs table, supporting institutional compliance and accountability."),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 24. LIMITATIONS
  // =========================================================================
  content.push(
    h1("18. SYSTEM LIMITATIONS", "CHAPTER"),
    bullet("Local Payment Processing", "Currently, ticket transactions operate on simulated confirmation workflows rather than direct live bank gateway redirects (e.g. Razorpay/Stripe)."),
    bullet("Single Currency Support", "Pricing is presently denominated in Indian Rupees (INR - ₹) without multi-currency geo-location conversion."),
    bullet("Desktop QR Validation", "QR codes are verified visually or via web cameras; a dedicated native mobile scanner app is not yet bundled."),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 25. FUTURE ENHANCEMENTS
  // =========================================================================
  content.push(
    h1("19. FUTURE ENHANCEMENTS & ROADMAP", "CHAPTER"),
    bullet("Phase 2: Payment Gateway Integration", "Direct integration with Razorpay, Stripe, and UPI webhooks for automated financial settlement."),
    bullet("Phase 3: Mobile Gate Scanner App", "Native Android/iOS camera application allowing gatekeepers to scan QR codes offline and log attendance."),
    bullet("Phase 4: Multi-Tier Seat Mapping", "Interactive visual seating charts allowing attendees to pick specific VIP, Premium, or Standard balcony seats."),
    bullet("Phase 5: AI-Driven Event Recommendations", "Machine learning recommendation models proposing events based on past attendee registration history."),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 26. CONCLUSION
  // =========================================================================
  content.push(
    h1("20. CONCLUSION", "CHAPTER"),
    p(
      "The EventSphere project successfully designs, develops, and evaluates a modern, enterprise-grade event registration and ticket booking ecosystem. By coupling a reactive React 19 Single Page Application with a high-throughput Spring Boot 4 REST microservice and an ACID-compliant MySQL database, the platform eliminates traditional concurrency overbooking, automates digital ticketing with scannable QR passes, and provides transparent administrative oversight.",
      { indent: true }
    ),
    p(
      "The engineering methodologies employed — including BCrypt cryptographic hashing, strict CORS whitelisting, atomic JPA transaction management, and responsive CSS token design — ensure high performance, security, and exceptional user satisfaction. EventSphere stands as a robust foundation for institutional and commercial event operations, ready for payment gateway integration and enterprise deployment.",
      { indent: true }
    ),
    new Paragraph({ children: [new PageBreak()] })
  );

  // =========================================================================
  // 27. REFERENCES
  // =========================================================================
  content.push(
    h1("21. REFERENCES & BIBLIOGRAPHY", "CHAPTER"),
    p("1. React Official Documentation, \"React 19 Architecture and Hooks Specification\", Meta Open Source, https://react.dev, 2026."),
    p("2. Spring Boot Reference Documentation, \"Spring Boot 4.1.1 Enterprise Web Services\", VMware Tanzu, https://spring.io/projects/spring-boot, 2026."),
    p("3. Hibernate ORM Documentation, \"Hibernate ORM 7.4 User Guide\", Red Hat Inc., https://hibernate.org/orm/documentation, 2026."),
    p("4. Vite Build Tool Documentation, \"Vite: Next Generation Frontend Tooling\", Evan You & Vite Contributors, https://vite.dev, 2026."),
    p("5. MySQL Reference Manual, \"MySQL 8.0 Reference Manual: InnoDB Storage Engine & ACID Transactions\", Oracle Corporation, https://dev.mysql.com/doc, 2026."),
    p("6. Spring Security Reference, \"Spring Security Architecture & Cryptography\", VMware Tanzu, https://docs.spring.io/spring-security, 2026."),
    p("7. MDN Web Docs, \"Cross-Origin Resource Sharing (CORS) & RESTful Web APIs\", Mozilla Developer Network, https://developer.mozilla.org, 2026."),
    p("8. Lucide Icons Documentation, \"Accessible Vector Iconography for Web Applications\", Lucide Community, https://lucide.dev, 2026.")
  );

  // Assemble document
  const doc = new Document({
    creator: "EventSphere Engineering Team",
    title: "EventSphere Project Documentation",
    description: "Complete Academic Project Report for EventSphere Full-Stack Platform",
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // A4 width in dxa (210mm)
              height: 16838, // A4 height in dxa (297mm)
            },
            margin: {
              top: 1440, // 1 inch (standard academic margin)
              bottom: 1440,
              left: 1440,
              right: 1440,
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
                    text: "EventSphere — Academic Project Report",
                    font: FONT_NAME,
                    size: 18,
                    color: COLOR_MUTED,
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
                    font: FONT_NAME,
                    size: 18,
                    color: COLOR_MUTED,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font: FONT_NAME,
                    size: 18,
                    color: COLOR_MUTED,
                  }),
                  new TextRun({
                    text: " of ",
                    font: FONT_NAME,
                    size: 18,
                    color: COLOR_MUTED,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    font: FONT_NAME,
                    size: 18,
                    color: COLOR_MUTED,
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
  const outputPath = path.resolve("..", "EventSphere_Project_Documentation.docx");
  fs.writeFileSync(outputPath, buffer);
  console.log(`Academic Word Documentation successfully generated at: ${outputPath}`);
}

buildAcademicDocx().catch((err) => {
  console.error("Error generating academic docx:", err);
  process.exit(1);
});
