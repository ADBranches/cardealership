// backend/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import winston from "winston";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import optimizedRoutes from "./routes/optimizedRoutes.js";
import adminMetricsRoutes from "./routes/adminMetricsRoutes.js";

import { performanceMiddleware } from "./middleware/performanceMiddleware.js";
import db from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

/*
|--------------------------------------------------------------------------
| PUBLIC WEBSITE URL
|--------------------------------------------------------------------------
|
| Used when generating sitemap and RSS URLs.
|
| Later, when deployed:
|
| SITE_URL=https://yourdomain.com
|
*/

const SITE_URL = process.env.SITE_URL || "http://localhost:5173";

/*
|--------------------------------------------------------------------------
| WINSTON LOGGING
|--------------------------------------------------------------------------
*/

const logsDirectory = path.join(__dirname, "logs");

if (!fs.existsSync(logsDirectory)) {
  fs.mkdirSync(logsDirectory, {
    recursive: true,
  });
}

const logger = winston.createLogger({
  level: "info",

  format: winston.format.combine(
    winston.format.timestamp(),

    winston.format.errors({
      stack: true,
    }),

    winston.format.json(),
  ),

  transports: [
    new winston.transports.File({
      filename: path.join(logsDirectory, "error.log"),

      level: "error",
    }),

    new winston.transports.File({
      filename: path.join(logsDirectory, "combined.log"),
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),

        winston.format.colorize(),

        winston.format.printf(
          ({ timestamp, level, message, stack }) =>
            `${timestamp} ${level}: ${stack || message}`,
        ),
      ),
    }),
  );
}

/*
|--------------------------------------------------------------------------
| BASIC MIDDLEWARE
|--------------------------------------------------------------------------
*/

app.use(cors());

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(performanceMiddleware);

/*
|--------------------------------------------------------------------------
| 500 RESPONSE LOGGER
|--------------------------------------------------------------------------
*/

app.use((req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
    if (res.statusCode >= 500) {
      logger.error("HTTP request returned server error", {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,

        durationMs: Date.now() - startedAt,

        ip: req.ip,

        userAgent: req.get("user-agent"),
      });
    }
  });

  next();
});

/*
|--------------------------------------------------------------------------
| EXISTING ROUTES
|--------------------------------------------------------------------------
*/

app.use("/api/bookings", bookingRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/optimized", optimizedRoutes);

app.use("/api/admin/metrics", adminMetricsRoutes);

/*
|--------------------------------------------------------------------------
| XML HELPER
|--------------------------------------------------------------------------
|
| Protect XML output when database text contains characters such as:
|
| &
| <
| >
| "
| '
|
*/

function escapeXml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/*
|--------------------------------------------------------------------------
| TASK 1A
| DYNAMIC XML SITEMAP
|--------------------------------------------------------------------------
|
| GET /sitemap.xml
|
| This queries PostgreSQL EVERY TIME the sitemap is requested.
|
| Therefore:
|
| New car inserted + is_available = true
|       ↓
| Automatically appears
|
| Car sold + is_available = false
|       ↓
| Automatically disappears
|
*/

app.get("/sitemap.xml", async (req, res, next) => {
  try {
    const result = await db.query(`
        SELECT
          id,
          name,
          brand,
          created_at,
          updated_at
        FROM cars
        WHERE COALESCE(is_available, TRUE) = TRUE
        ORDER BY
          COALESCE(updated_at, created_at) DESC,
          id DESC;
      `);

    const vehicleUrls = result.rows
      .map((car) => {
        const lastModified = car.updated_at || car.created_at;

        const lastmod = lastModified
          ? new Date(lastModified).toISOString().split("T")[0]
          : null;

        return `
  <url>
    <loc>${escapeXml(`${SITE_URL}/cars/${car.id}`)}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
      })
      .join("");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <url>
    <loc>${escapeXml(SITE_URL)}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>${escapeXml(`${SITE_URL}/cars`)}</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

${vehicleUrls}

</urlset>`;

    res.set("Content-Type", "application/xml; charset=utf-8");

    /*
      Sitemap stays dynamic.
      Search engines may cache it briefly.
      */

    res.set("Cache-Control", "public, max-age=300");

    return res.status(200).send(sitemap);
  } catch (error) {
    next(error);
  }
});

/*
|--------------------------------------------------------------------------
| TASK 1B
| DYNAMIC RSS FEED
|--------------------------------------------------------------------------
|
| GET /rss.xml
|
| Uses the same live PostgreSQL inventory.
|
*/

app.get("/rss.xml", async (req, res, next) => {
  try {
    const result = await db.query(`
        SELECT
          id,
          name,
          brand,
          year,
          price,
          description,
          created_at,
          updated_at
        FROM cars
        WHERE COALESCE(is_available, TRUE) = TRUE
        ORDER BY
          COALESCE(created_at, updated_at) DESC,
          id DESC
        LIMIT 50;
      `);

    const items = result.rows
      .map((car) => {
        const date = car.created_at || car.updated_at || new Date();

        const title = `${car.year || ""} ${car.brand || ""} ${
          car.name || ""
        }`.trim();

        const description =
          car.description ||
          `${title} available at Panda Motors for UGX ${Number(
            car.price || 0,
          ).toLocaleString()}.`;

        const vehicleUrl = `${SITE_URL}/cars/${car.id}`;

        return `
    <item>
      <title>${escapeXml(title)}</title>

      <link>${escapeXml(vehicleUrl)}</link>

      <guid isPermaLink="true">${escapeXml(vehicleUrl)}</guid>

      <description>${escapeXml(description)}</description>

      <pubDate>${new Date(date).toUTCString()}</pubDate>
    </item>`;
      })
      .join("");

    const rss = `<?xml version="1.0" encoding="UTF-8"?>

<rss version="2.0">

  <channel>

    <title>Panda Motors Vehicle Inventory</title>

    <link>${escapeXml(SITE_URL)}</link>

    <description>
      Latest vehicles currently available at Panda Motors.
    </description>

    <language>en</language>

    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>

${items}

  </channel>

</rss>`;

    res.set("Content-Type", "application/rss+xml; charset=utf-8");

    res.set("Cache-Control", "public, max-age=300");

    return res.status(200).send(rss);
  } catch (error) {
    next(error);
  }
});

/*
|--------------------------------------------------------------------------
| TASK 2A
| SAVE CHAT MESSAGE
|--------------------------------------------------------------------------
|
| POST /api/chat/messages
|
| BODY:
|
| {
|   "conversationId": "customer-1-admin",
|   "sender": "customer",
|   "message": "Is the Land Cruiser still available?"
| }
|
| Timestamp is generated by PostgreSQL automatically.
|
*/

app.post("/api/chat/messages", async (req, res, next) => {
  try {
    const { conversationId, sender, message } = req.body;

    if (!conversationId || typeof conversationId !== "string") {
      return res.status(400).json({
        success: false,

        message: "conversationId is required.",
      });
    }

    if (!sender || typeof sender !== "string") {
      return res.status(400).json({
        success: false,

        message: "sender is required.",
      });
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        success: false,

        message: "message is required.",
      });
    }

    const result = await db.query(
      `
            INSERT INTO chat_messages (
              conversation_id,
              sender,
              message
            )

            VALUES (
              $1,
              $2,
              $3
            )

            RETURNING
              id,
              conversation_id,
              sender,
              message,
              created_at;
          `,

      [conversationId.trim(), sender.trim(), message.trim()],
    );

    return res.status(201).json({
      success: true,

      message: "Chat message saved successfully.",

      chatMessage: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

/*
|--------------------------------------------------------------------------
| TASK 2B
| FETCH PREVIOUS CHAT HISTORY
|--------------------------------------------------------------------------
|
| GET /api/chat/conversations/:conversationId/messages
|
| Example:
|
| GET /api/chat/conversations/customer-1-admin/messages
|
| Messages are returned oldest → newest so the frontend can rebuild
| the conversation bubbles in the correct order.
|
*/

app.get(
  "/api/chat/conversations/:conversationId/messages",
  async (req, res, next) => {
    try {
      const { conversationId } = req.params;

      const result = await db.query(
        `
            SELECT
              id,
              conversation_id,
              sender,
              message,
              created_at
            FROM chat_messages
            WHERE conversation_id = $1
            ORDER BY
              created_at ASC,
              id ASC;
          `,

        [conversationId],
      );

      return res.status(200).json({
        success: true,

        conversationId,

        count: result.rows.length,

        messages: result.rows,
      });
    } catch (error) {
      next(error);
    }
  },
);

/*
|--------------------------------------------------------------------------
| FINANCIAL PAYMENT APPROXIMATION
|--------------------------------------------------------------------------
*/

app.post("/api/finance/calculate", (req, res, next) => {
  try {
    const { carPrice, downPayment, interestRate, loanTermMonths } = req.body;

    if (
      carPrice === undefined ||
      downPayment === undefined ||
      interestRate === undefined ||
      loanTermMonths === undefined
    ) {
      return res.status(400).json({
        error: "Missing required fields",

        required: ["carPrice", "downPayment", "interestRate", "loanTermMonths"],
      });
    }

    const price = parseFloat(carPrice);

    const down = parseFloat(downPayment);

    const rate = parseFloat(interestRate);

    const term = parseInt(loanTermMonths, 10);

    if (price < 0) {
      return res.status(400).json({
        error: "Car price cannot be negative",
      });
    }

    if (down < 0) {
      return res.status(400).json({
        error: "Down payment cannot be negative",
      });
    }

    if (rate < 0) {
      return res.status(400).json({
        error: "Interest rate cannot be negative",
      });
    }

    if (term <= 0) {
      return res.status(400).json({
        error: "Loan term must be greater than 0 months",
      });
    }

    const loanAmount = price - down;

    if (loanAmount <= 0) {
      return res.status(400).json({
        error: "Down payment must be less than car price",

        message: "Your down payment already covers the full price!",
      });
    }

    const monthlyRate = rate / 100 / 12;

    let monthlyPayment;
    let totalPayment;
    let totalInterest;

    if (monthlyRate === 0) {
      monthlyPayment = loanAmount / term;

      totalPayment = loanAmount;

      totalInterest = 0;
    } else {
      const compoundFactor = Math.pow(1 + monthlyRate, term);

      monthlyPayment =
        (loanAmount * (monthlyRate * compoundFactor)) / (compoundFactor - 1);

      totalPayment = monthlyPayment * term;

      totalInterest = totalPayment - loanAmount;
    }

    const paymentSchedule = [];

    let remainingBalance = loanAmount;

    for (let month = 1; month <= Math.min(6, term); month += 1) {
      const interestPayment = remainingBalance * monthlyRate;

      const principalPayment = monthlyPayment - interestPayment;

      remainingBalance -= principalPayment;

      paymentSchedule.push({
        month,

        payment: Math.round(monthlyPayment),

        principal: Math.round(principalPayment),

        interest: Math.round(interestPayment),

        remainingBalance: Math.max(0, Math.round(remainingBalance)),
      });
    }

    return res.json({
      success: true,

      inputs: {
        carPrice: price,
        downPayment: down,
        loanAmount,
        interestRate: rate,
        loanTermMonths: term,
      },

      results: {
        monthlyPayment: Math.round(monthlyPayment),

        totalPayment: Math.round(totalPayment),

        totalInterest: Math.round(totalInterest),

        paymentSchedule,

        currency: "UGX",
      },
    });
  } catch (error) {
    next(error);
  }
});

/*
|--------------------------------------------------------------------------
| DEALERSHIP LOCATION
|--------------------------------------------------------------------------
*/

app.get("/api/dealership/location", (req, res, next) => {
  try {
    const dealershipInfo = {
      success: true,

      dealership: {
        name: "Panda Motors Ltd",

        description: "Uganda's trusted luxury vehicle importer",

        address: {
          street: "Banda, Jinja Road",

          city: "Kampala",

          district: "Kampala District",

          country: "Uganda",

          fullAddress: "Banda, Jinja Road, Kampala, Uganda",
        },

        location: {
          latitude: 0.3488,

          longitude: 32.616,

          zoom: 15,
        },

        operatingHours: {
          monday: {
            open: "08:00",
            close: "18:00",
            isOpen: true,
          },

          tuesday: {
            open: "08:00",
            close: "18:00",
            isOpen: true,
          },

          wednesday: {
            open: "08:00",
            close: "18:00",
            isOpen: true,
          },

          thursday: {
            open: "08:00",
            close: "18:00",
            isOpen: true,
          },

          friday: {
            open: "08:00",
            close: "18:00",
            isOpen: true,
          },

          saturday: {
            open: "09:00",
            close: "17:00",
            isOpen: true,
          },

          sunday: {
            open: "00:00",
            close: "00:00",
            isOpen: false,

            note: "Closed",
          },
        },

        contact: {
          phone: ["+256 770 826 951", "+256 756 053 475"],

          whatsapp: "+256 770 826 951",

          email: "sales@pandamotors.co.ug",
        },

        services: [
          "URA Duty Clearance",
          "Import Documentation",
          "Certified Workshop",
          "Flexible Financing",
        ],

        googleMapsUrl:
          "https://maps.google.com/?q=Banda,+Jinja+Road,+Kampala,+Uganda",

        directionsUrl:
          "https://maps.google.com/dir//Banda,+Jinja+Road,+Kampala,+Uganda",

        embedMapUrl:
          "https://maps.google.com/maps?q=Banda+Kampala+Uganda&z=15&output=embed",
      },
    };

    return res.json(dealershipInfo);
  } catch (error) {
    next(error);
  }
});

/*
|--------------------------------------------------------------------------
| DEALERSHIP STATUS
|--------------------------------------------------------------------------
*/

app.get("/api/dealership/status", (req, res, next) => {
  try {
    const now = new Date();

    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];

    const currentDay = dayNames[now.getDay()];

    const currentTime = now.toLocaleTimeString("en-US", {
      hour12: false,

      hour: "2-digit",

      minute: "2-digit",
    });

    const hours = {
      monday: {
        open: "08:00",
        close: "18:00",
      },

      tuesday: {
        open: "08:00",
        close: "18:00",
      },

      wednesday: {
        open: "08:00",
        close: "18:00",
      },

      thursday: {
        open: "08:00",
        close: "18:00",
      },

      friday: {
        open: "08:00",
        close: "18:00",
      },

      saturday: {
        open: "09:00",
        close: "17:00",
      },

      sunday: {
        open: "00:00",
        close: "00:00",
      },
    };

    const todayHours = hours[currentDay];

    const isOpen =
      currentDay !== "sunday" &&
      currentTime >= todayHours.open &&
      currentTime <= todayHours.close;

    return res.json({
      success: true,

      currentTime,

      currentDay,

      isOpen,

      operatingHours: todayHours,

      message: isOpen
        ? "We are currently open! Visit us today."
        : "We are closed. Please visit during business hours.",
    });
  } catch (error) {
    next(error);
  }
});

/*
|--------------------------------------------------------------------------
| HEALTH CHECK
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
  return res.json({
    status: "OK",

    timestamp: new Date().toISOString(),

    message: "Panda Motors API is running!",

    version: "2.1.0",

    newEndpoints: [
      "GET /sitemap.xml",
      "GET /rss.xml",
      "POST /api/chat/messages",
      "GET /api/chat/conversations/:conversationId/messages",
    ],
  });
});

/*
|--------------------------------------------------------------------------
| WINSTON TEST ROUTE
|--------------------------------------------------------------------------
*/

if (process.env.NODE_ENV !== "production") {
  app.get("/api/test-error", (req, res, next) => {
    next(new Error("Winston test error - intentional 500 error"));
  });
}

/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
  return res.status(404).json({
    success: false,

    message: "Endpoint not found",
  });
});

/*
|--------------------------------------------------------------------------
| GLOBAL ERROR HANDLER
|--------------------------------------------------------------------------
*/

app.use((error, req, res, next) => {
  const statusCode = error.status || error.statusCode || 500;

  if (statusCode >= 500) {
    logger.error(error.message || "Internal Server Error", {
      statusCode,

      method: req.method,

      url: req.originalUrl,

      ip: req.ip,

      stack: error.stack,

      errorName: error.name,

      errorCode: error.code || null,
    });
  }

  if (res.headersSent) {
    return next(error);
  }

  return res.status(statusCode).json({
    success: false,

    message: statusCode >= 500 ? "Internal server error" : error.message,

    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

/*
|--------------------------------------------------------------------------
| DATABASE INITIALIZATION
|--------------------------------------------------------------------------
|
| Creates chat storage automatically.
|
*/

async function initializeDatabase() {
  /*
  |--------------------------------------------------------------------------
  | CHAT TRANSCRIPTS TABLE
  |--------------------------------------------------------------------------
  */

  await db.query(`
    CREATE TABLE IF NOT EXISTS chat_messages (

      id BIGSERIAL PRIMARY KEY,

      conversation_id VARCHAR(120)
        NOT NULL,

      sender VARCHAR(50)
        NOT NULL,

      message TEXT
        NOT NULL,

      created_at TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW()

    );
  `);

  /*
  |--------------------------------------------------------------------------
  | CHAT HISTORY LOOKUP INDEX
  |--------------------------------------------------------------------------
  |
  | Makes reopening long conversations faster.
  |
  */

  await db.query(`
    CREATE INDEX IF NOT EXISTS
      idx_chat_messages_conversation

    ON chat_messages (
      conversation_id,
      created_at
    );
  `);

  logger.info("Database initialization complete");

  logger.info("Chat transcript storage ready");
}

/*
|--------------------------------------------------------------------------
| UNHANDLED ERROR LOGGING
|--------------------------------------------------------------------------
*/

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Promise Rejection", {
    reason: reason instanceof Error ? reason.message : reason,

    stack: reason instanceof Error ? reason.stack : null,
  });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception", {
    message: error.message,

    stack: error.stack,
  });
});

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

app.listen(PORT, async () => {
  console.log("\n========================================");

  console.log("🚀 Panda Motors API Server");

  console.log("========================================");

  console.log(`🚀 Server: http://localhost:${PORT}`);

  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);

  try {
    await initializeDatabase();

    console.log("✅ PostgreSQL initialization complete");

    console.log("💬 Chat transcript storage ready");
  } catch (error) {
    logger.error("Database initialization failed", {
      message: error.message,

      stack: error.stack,
    });

    console.error("❌ Database initialization failed:", error.message);
  }

  console.log("\n🔎 Search Engine Feeds:");

  console.log(`   GET http://localhost:${PORT}/sitemap.xml`);

  console.log(`   GET http://localhost:${PORT}/rss.xml`);

  console.log("\n💬 Chat History:");

  console.log(`   POST http://localhost:${PORT}/api/chat/messages`);

  console.log(
    `   GET  http://localhost:${PORT}/api/chat/conversations/:conversationId/messages`,
  );

  console.log("\n📝 Winston:");

  console.log(`   ${path.join(logsDirectory, "error.log")}`);

  console.log("========================================\n");
});
