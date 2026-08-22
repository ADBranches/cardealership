// backend/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import winston from "winston";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import carsRoutes from "./routes/carsRoutes.js";

import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import optimizedRoutes from "./routes/optimizedRoutes.js";
import adminMetricsRoutes from "./routes/adminMetricsRoutes.js";

import { protect, adminOnly } from "./middleware/authMiddleware.js";

import { performanceMiddleware } from "./middleware/performanceMiddleware.js";

import db from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5500;

const SITE_URL = process.env.SITE_URL || "http://localhost:5173";

/*
|--------------------------------------------------------------------------
| CHAT CONFIGURATION
|--------------------------------------------------------------------------
*/

const CHAT_RETENTION_DAYS = Number(process.env.CHAT_RETENTION_DAYS || 365);

const CHAT_DEFAULT_PAGE_SIZE = 30;

const CHAT_MAX_PAGE_SIZE = 100;

const ADMIN_CONVERSATION_DEFAULT_PAGE_SIZE = 20;

const ADMIN_CONVERSATION_MAX_PAGE_SIZE = 100;

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
| STANDARD CHAT ERROR RESPONSE
|--------------------------------------------------------------------------
*/

function sendChatError(res, status, code, message, details = null) {
  return res.status(status).json({
    success: false,

    error: {
      code,
      message,
      status,
      details,
    },
  });
}

/*
|--------------------------------------------------------------------------
| PAGINATION HELPER
|--------------------------------------------------------------------------
*/

function parsePagination(query, { defaultLimit, maxLimit }) {
  const requestedPage = Number(query.page);

  const requestedLimit = Number(query.limit);

  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const limit =
    Number.isInteger(requestedLimit) && requestedLimit > 0
      ? Math.min(requestedLimit, maxLimit)
      : defaultLimit;

  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
}

/*
|--------------------------------------------------------------------------
| CONVERSATION ACCESS HELPER
|--------------------------------------------------------------------------
*/

async function ensureConversationAccess(req, res, conversationId) {
  if (req.user?.role === "admin") {
    return true;
  }

  const result = await db.query(
    `
        SELECT customer_id
        FROM chat_messages
        WHERE
          conversation_id = $1
          AND customer_id IS NOT NULL
        LIMIT 1;
      `,
    [conversationId],
  );

  if (result.rows.length === 0) {
    sendChatError(
      res,
      404,
      "CONVERSATION_NOT_FOUND",
      "Conversation was not found.",
    );

    return false;
  }

  const customerId = Number(result.rows[0].customer_id);

  if (customerId !== Number(req.user?.id)) {
    sendChatError(
      res,
      403,
      "CHAT_ACCESS_DENIED",
      "You do not have permission to access this conversation.",
    );

    return false;
  }

  return true;
}

/*
|--------------------------------------------------------------------------
| XML HELPER
|--------------------------------------------------------------------------
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
| DYNAMIC XML SITEMAP
|--------------------------------------------------------------------------
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
          WHERE
            COALESCE(
              is_available,
              TRUE
            ) = TRUE
          ORDER BY
            COALESCE(
              updated_at,
              created_at
            ) DESC,
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

    res.set("Cache-Control", "public, max-age=300");

    return res.status(200).send(sitemap);
  } catch (error) {
    next(error);
  }
});

/*
|--------------------------------------------------------------------------
| DYNAMIC RSS FEED
|--------------------------------------------------------------------------
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
          WHERE
            COALESCE(
              is_available,
              TRUE
            ) = TRUE
          ORDER BY
            COALESCE(
              created_at,
              updated_at
            ) DESC,
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
| CHAT — SAVE MESSAGE
|--------------------------------------------------------------------------
*/

app.post(
  "/api/chat/messages",

  protect,

  async (req, res, next) => {
    try {
      const {
        conversationId,
        clientMessageId,
        customerId,
        carId,
        sender,
        message,
      } = req.body;

      if (!conversationId || typeof conversationId !== "string") {
        return sendChatError(
          res,
          400,
          "INVALID_CONVERSATION_ID",
          "conversationId is required.",
        );
      }

      if (!clientMessageId || typeof clientMessageId !== "string") {
        return sendChatError(
          res,
          400,
          "CLIENT_MESSAGE_ID_REQUIRED",
          "clientMessageId is required.",
        );
      }

      if (!message || typeof message !== "string" || !message.trim()) {
        return sendChatError(
          res,
          400,
          "INVALID_MESSAGE",
          "message is required.",
        );
      }

      const parsedCustomerId = Number(customerId);

      const parsedCarId = Number(carId);

      if (!Number.isInteger(parsedCustomerId) || parsedCustomerId <= 0) {
        return sendChatError(
          res,
          400,
          "INVALID_CUSTOMER_ID",
          "A valid customerId is required.",
        );
      }

      if (!Number.isInteger(parsedCarId) || parsedCarId <= 0) {
        return sendChatError(
          res,
          400,
          "INVALID_CAR_ID",
          "A valid carId is required.",
        );
      }

      const authenticatedIsAdmin = req.user?.role === "admin";

      const expectedSender = authenticatedIsAdmin ? "admin" : "customer";

      if (sender !== expectedSender) {
        return sendChatError(
          res,
          403,
          "INVALID_CHAT_SENDER",
          `Authenticated user must send messages as '${expectedSender}'.`,
        );
      }

      if (!authenticatedIsAdmin && Number(req.user?.id) !== parsedCustomerId) {
        return sendChatError(
          res,
          403,
          "CHAT_ACCESS_DENIED",
          "You cannot send messages for another customer.",
        );
      }

      const carResult = await db.query(
        `
            SELECT id
            FROM cars
            WHERE id = $1
            LIMIT 1;
          `,
        [parsedCarId],
      );

      if (carResult.rows.length === 0) {
        return sendChatError(
          res,
          404,
          "CAR_NOT_FOUND",
          "Vehicle was not found.",
        );
      }

      const insertResult = await db.query(
        `
            INSERT INTO chat_messages (
              conversation_id,
              client_message_id,
              customer_id,
              car_id,
              sender,
              message,
              is_read,
              read_at,
              retention_expires_at
            )

            VALUES (
              $1,
              $2,
              $3,
              $4,
              $5,
              $6,
              $7,
              $8,
              NOW() + ($9::int * INTERVAL '1 day')
            )

            ON CONFLICT (
              conversation_id,
              client_message_id
            )
            DO NOTHING

            RETURNING
              id,
              conversation_id,
              client_message_id,
              customer_id,
              car_id,
              sender,
              message,
              is_read,
              read_at,
              created_at,
              retention_expires_at;
          `,

        [
          conversationId.trim(),

          clientMessageId.trim(),

          parsedCustomerId,

          parsedCarId,

          sender,

          message.trim(),

          sender === "admin",

          sender === "admin" ? new Date() : null,

          CHAT_RETENTION_DAYS,
        ],
      );

      if (insertResult.rows.length > 0) {
        return res.status(201).json({
          success: true,

          duplicate: false,

          message: insertResult.rows[0],
        });
      }

      const duplicateResult = await db.query(
        `
            SELECT
              id,
              conversation_id,
              client_message_id,
              customer_id,
              car_id,
              sender,
              message,
              is_read,
              read_at,
              created_at,
              retention_expires_at
            FROM chat_messages
            WHERE
              conversation_id = $1
              AND client_message_id = $2
            LIMIT 1;
          `,

        [conversationId.trim(), clientMessageId.trim()],
      );

      if (duplicateResult.rows.length === 0) {
        return sendChatError(
          res,
          409,
          "MESSAGE_ID_CONFLICT",
          "Unable to reconcile duplicate message.",
        );
      }

      return res.status(200).json({
        success: true,

        duplicate: true,

        message: duplicateResult.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },
);

/*
|--------------------------------------------------------------------------
| CHAT — PAGINATED HISTORY
|--------------------------------------------------------------------------
*/

app.get(
  "/api/chat/conversations/:conversationId/messages",

  protect,

  async (req, res, next) => {
    try {
      const { conversationId } = req.params;

      const accessAllowed = await ensureConversationAccess(
        req,
        res,
        conversationId,
      );

      if (!accessAllowed) {
        return;
      }

      const { page, limit, offset } = parsePagination(req.query, {
        defaultLimit: CHAT_DEFAULT_PAGE_SIZE,

        maxLimit: CHAT_MAX_PAGE_SIZE,
      });

      const countResult = await db.query(
        `
            SELECT
              COUNT(*)::int AS total
            FROM chat_messages
            WHERE
              conversation_id = $1;
          `,

        [conversationId],
      );

      const total = countResult.rows[0]?.total || 0;

      const historyResult = await db.query(
        `
            SELECT
              id,
              conversation_id,
              client_message_id,
              customer_id,
              car_id,
              sender,
              message,
              is_read,
              read_at,
              created_at,
              retention_expires_at

            FROM chat_messages

            WHERE
              conversation_id = $1

            ORDER BY
              created_at DESC,
              id DESC

            LIMIT $2
            OFFSET $3;
          `,

        [conversationId, limit, offset],
      );

      const messages = historyResult.rows.reverse();

      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        success: true,

        conversationId,

        pagination: {
          page,
          limit,
          total,
          totalPages,

          hasNextPage: page < totalPages,

          hasPreviousPage: page > 1,
        },

        messages,
      });
    } catch (error) {
      next(error);
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN CHAT — CONVERSATION LIST
|--------------------------------------------------------------------------
*/

app.get(
  "/api/admin/chat/conversations",

  protect,
  adminOnly,

  async (req, res, next) => {
    try {
      const { page, limit, offset } = parsePagination(req.query, {
        defaultLimit: ADMIN_CONVERSATION_DEFAULT_PAGE_SIZE,

        maxLimit: ADMIN_CONVERSATION_MAX_PAGE_SIZE,
      });

      const countResult = await db.query(`
          SELECT
            COUNT(
              DISTINCT conversation_id
            )::int AS total
          FROM chat_messages;
        `);

      const total = countResult.rows[0]?.total || 0;

      const result = await db.query(
        `
            WITH conversation_summary AS (
              SELECT
                conversation_id,

                MAX(customer_id)
                  AS customer_id,

                MAX(car_id)
                  AS car_id,

                COUNT(*)::int
                  AS message_count,

                COUNT(*) FILTER (
                  WHERE
                    sender = 'customer'
                    AND is_read = FALSE
                )::int
                  AS unread_count,

                MIN(created_at)
                  AS first_message_at,

                MAX(created_at)
                  AS last_message_at

              FROM chat_messages

              GROUP BY
                conversation_id
            )

            SELECT
              summary.conversation_id,
              summary.message_count,
              summary.unread_count,
              summary.first_message_at,
              summary.last_message_at,

              customer.id
                AS customer_id,

              customer.name
                AS customer_name,

              customer.email
                AS customer_email,

              car.id
                AS car_id,

              car.name
                AS car_name,

              car.brand
                AS car_brand,

              car.year
                AS car_year,

              car.price
                AS car_price,

              latest.id
                AS last_message_id,

              latest.sender
                AS last_sender,

              latest.message
                AS last_message,

              latest.created_at
                AS last_message_created_at

            FROM conversation_summary summary

            LEFT JOIN users customer
              ON customer.id =
                summary.customer_id

            LEFT JOIN cars car
              ON car.id =
                summary.car_id

            JOIN LATERAL (
              SELECT
                id,
                sender,
                message,
                created_at

              FROM chat_messages

              WHERE
                conversation_id =
                  summary.conversation_id

              ORDER BY
                created_at DESC,
                id DESC

              LIMIT 1
            ) latest
              ON TRUE

            ORDER BY
              summary.last_message_at DESC

            LIMIT $1
            OFFSET $2;
          `,

        [limit, offset],
      );

      const conversations = result.rows.map((row) => ({
        conversationId: row.conversation_id,

        messageCount: row.message_count,

        unreadCount: row.unread_count,

        firstMessageAt: row.first_message_at,

        lastMessageAt: row.last_message_at,

        customer: row.customer_id
          ? {
              id: row.customer_id,

              name: row.customer_name,

              email: row.customer_email,
            }
          : null,

        vehicle: row.car_id
          ? {
              id: row.car_id,

              name: row.car_name,

              brand: row.car_brand,

              year: row.car_year,

              price: row.car_price,
            }
          : null,

        lastMessage: {
          id: row.last_message_id,

          sender: row.last_sender,

          message: row.last_message,

          createdAt: row.last_message_created_at,
        },
      }));

      const totalPages = Math.ceil(total / limit);

      return res.status(200).json({
        success: true,

        pagination: {
          page,
          limit,
          total,
          totalPages,

          hasNextPage: page < totalPages,

          hasPreviousPage: page > 1,
        },

        conversations,
      });
    } catch (error) {
      next(error);
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN CHAT — MARK AS READ
|--------------------------------------------------------------------------
*/

app.patch(
  "/api/admin/chat/conversations/:conversationId/read",

  protect,
  adminOnly,

  async (req, res, next) => {
    try {
      const { conversationId } = req.params;

      const conversationResult = await db.query(
        `
            SELECT 1
            FROM chat_messages
            WHERE
              conversation_id = $1
            LIMIT 1;
          `,

        [conversationId],
      );

      if (conversationResult.rows.length === 0) {
        return sendChatError(
          res,
          404,
          "CONVERSATION_NOT_FOUND",
          "Conversation was not found.",
        );
      }

      const updateResult = await db.query(
        `
            UPDATE chat_messages

            SET
              is_read = TRUE,

              read_at =
                COALESCE(
                  read_at,
                  NOW()
                )

            WHERE
              conversation_id = $1

              AND sender = 'customer'

              AND is_read = FALSE

            RETURNING id;
          `,

        [conversationId],
      );

      const unreadResult = await db.query(
        `
            SELECT
              COUNT(*)::int
                AS unread_count

            FROM chat_messages

            WHERE
              conversation_id = $1

              AND sender =
                'customer'

              AND is_read =
                FALSE;
          `,

        [conversationId],
      );

      return res.status(200).json({
        success: true,

        conversationId,

        updatedCount: updateResult.rowCount,

        unreadCount: unreadResult.rows[0]?.unread_count || 0,
      });
    } catch (error) {
      next(error);
    }
  },
);

/*
|--------------------------------------------------------------------------
| ADMIN CHAT — RETENTION POLICY
|--------------------------------------------------------------------------
*/

app.get(
  "/api/admin/chat/retention-policy",

  protect,
  adminOnly,

  (req, res) => {
    return res.status(200).json({
      success: true,

      retentionPolicy: {
        retentionDays: CHAT_RETENTION_DAYS,

        basis: "message_created_at",

        actionAfterExpiry: "eligible_for_archival_or_deletion",

        automaticDeletion: false,

        description: `Chat messages are retained for ${CHAT_RETENTION_DAYS} days from creation. Expired records are marked by retention_expires_at and become eligible for archival or deletion.`,
      },
    });
  },
);

/*
|--------------------------------------------------------------------------
| EXISTING APPLICATION ROUTES
|--------------------------------------------------------------------------
|
| Restored:
|
| /api/auth
| /api/cars
|
| Existing team routes remain mounted.
|
*/

/*
|--------------------------------------------------------------------------
| AUTH
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

/*
|--------------------------------------------------------------------------
| CARS
|--------------------------------------------------------------------------
*/

app.use("/api/cars", carsRoutes);

/*
|--------------------------------------------------------------------------
| BOOKINGS
|--------------------------------------------------------------------------
*/

app.use("/api/bookings", bookingRoutes);

/*
|--------------------------------------------------------------------------
| ADMIN METRICS
|--------------------------------------------------------------------------
*/

app.use("/api/admin/metrics", adminMetricsRoutes);

/*
|--------------------------------------------------------------------------
| OPTIMIZED QUERIES
|--------------------------------------------------------------------------
*/

app.use("/api/optimized", optimizedRoutes);

/*
|--------------------------------------------------------------------------
| GENERAL ADMIN ROUTER
|--------------------------------------------------------------------------
|
| Keep this after the dedicated /api/admin/chat routes.
|
*/

app.use("/api/admin", adminRoutes);

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

    version: "2.3.1",

    routes: {
      auth: "/api/auth",

      cars: "/api/cars",

      chat: "/api/chat",

      adminChat: "/api/admin/chat",
    },

    chatEndpoints: [
      "POST /api/chat/messages",

      "GET /api/chat/conversations/:conversationId/messages?page=1&limit=30",

      "GET /api/admin/chat/conversations?page=1&limit=20",

      "PATCH /api/admin/chat/conversations/:conversationId/read",

      "GET /api/admin/chat/retention-policy",
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

  return sendChatError(
    res,

    statusCode,

    error.code || "INTERNAL_SERVER_ERROR",

    statusCode >= 500 ? "Internal server error." : error.message,

    process.env.NODE_ENV === "development"
      ? {
          reason: error.message,
        }
      : null,
  );
});

/*
|--------------------------------------------------------------------------
| DATABASE INITIALIZATION
|--------------------------------------------------------------------------
*/

async function initializeDatabase() {
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

  await db.query(`
    ALTER TABLE chat_messages

    ADD COLUMN IF NOT EXISTS
      client_message_id VARCHAR(160),

    ADD COLUMN IF NOT EXISTS
      customer_id INTEGER,

    ADD COLUMN IF NOT EXISTS
      car_id INTEGER,

    ADD COLUMN IF NOT EXISTS
      is_read BOOLEAN
      NOT NULL
      DEFAULT FALSE,

    ADD COLUMN IF NOT EXISTS
      read_at TIMESTAMPTZ,

    ADD COLUMN IF NOT EXISTS
      retention_expires_at TIMESTAMPTZ;
  `);

  await db.query(`
    UPDATE chat_messages

    SET
      is_read = TRUE,

      read_at =
        COALESCE(
          read_at,
          created_at
        )

    WHERE
      sender = 'admin'
      AND is_read = FALSE;
  `);

  await db.query(
    `
      UPDATE chat_messages

      SET
        retention_expires_at =
          created_at +
          ($1::int * INTERVAL '1 day')

      WHERE
        retention_expires_at
          IS NULL;
    `,

    [CHAT_RETENTION_DAYS],
  );

  await db.query(`
    DO $$
    BEGIN

      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE
          conname =
            'fk_chat_messages_customer'
      ) THEN

        ALTER TABLE chat_messages

        ADD CONSTRAINT
          fk_chat_messages_customer

        FOREIGN KEY (
          customer_id
        )

        REFERENCES users(id)

        ON DELETE SET NULL;

      END IF;

    END
    $$;
  `);

  await db.query(`
    DO $$
    BEGIN

      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE
          conname =
            'fk_chat_messages_car'
      ) THEN

        ALTER TABLE chat_messages

        ADD CONSTRAINT
          fk_chat_messages_car

        FOREIGN KEY (
          car_id
        )

        REFERENCES cars(id)

        ON DELETE SET NULL;

      END IF;

    END
    $$;
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS
      idx_chat_messages_conversation

    ON chat_messages (
      conversation_id,
      created_at
    );
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS
      idx_chat_messages_unread

    ON chat_messages (
      conversation_id,
      is_read
    );
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS
      idx_chat_messages_customer

    ON chat_messages (
      customer_id
    );
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS
      idx_chat_messages_car

    ON chat_messages (
      car_id
    );
  `);

  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS
      idx_chat_messages_client_message_unique

    ON chat_messages (
      conversation_id,
      client_message_id
    );
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS
      idx_chat_messages_retention

    ON chat_messages (
      retention_expires_at
    );
  `);

  logger.info("Database initialization complete");

  logger.info("Chat admin module storage ready");
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

    console.log("💬 Chat admin storage ready");
  } catch (error) {
    logger.error("Database initialization failed", {
      message: error.message,

      stack: error.stack,
    });

    console.error("❌ Database initialization failed:", error.message);
  }

  console.log("\n🔐 Authentication:");

  console.log(`   POST http://localhost:${PORT}/api/auth/register`);

  console.log(`   POST http://localhost:${PORT}/api/auth/login`);

  console.log("\n🚗 Cars:");

  console.log(`   GET  http://localhost:${PORT}/api/cars`);

  console.log("\n🔎 Search Engine Feeds:");

  console.log(`   GET  http://localhost:${PORT}/sitemap.xml`);

  console.log(`   GET  http://localhost:${PORT}/rss.xml`);

  console.log("\n💬 Chat:");

  console.log(`   POST http://localhost:${PORT}/api/chat/messages`);

  console.log(
    `   GET  http://localhost:${PORT}/api/chat/conversations/:conversationId/messages?page=1&limit=30`,
  );

  console.log("\n🛠️ Admin Chat:");

  console.log(
    `   GET   http://localhost:${PORT}/api/admin/chat/conversations?page=1&limit=20`,
  );

  console.log(
    `   PATCH http://localhost:${PORT}/api/admin/chat/conversations/:conversationId/read`,
  );

  console.log(
    `   GET   http://localhost:${PORT}/api/admin/chat/retention-policy`,
  );

  console.log("\n📝 Winston:");

  console.log(`   ${path.join(logsDirectory, "error.log")}`);

  console.log("========================================\n");
});
