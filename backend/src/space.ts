import { Db, ObjectId } from "mongodb";
import { Express } from "express";
import { randomBytes } from "crypto";

interface Space {
  name: string;
  description: string;
  createdOnTimestampMs: number;
  lastModifiedOnTimestampMs: number;
  deleteOnTimestampMs: number; // timestamp; ms since epoch
  cretedBy: string;
  adminUrlToken: string; // admin url token, used to access admin page
  sharableAccessToken: string; // sharable access token, used to share the space with others
  ownerContactMail: string; // owner contact mail
}

function spaceRoutes(app: Express, db: Db) {
  app.get("/api/space/:spaceId", async (req, res) => {
    const spaceId = req.params.spaceId;
    const accessToken = req.query.token;
    if (!accessToken || typeof accessToken !== "string") {
      res.status(400).send("Bad Request");
      return;
    }

    if (!ObjectId.isValid(spaceId)) {
      res.status(400).send("Bad Request");
      return;
    }

    const space = await db
      .collection<Space>("spaces")
      .findOne({
        _id: new ObjectId(spaceId),
        $or: [
          { adminUrlToken: accessToken },
          { sharableAccessToken: accessToken },
        ],
      })
      .catch(() => {
        res.status(500).send("Internal Server Error");
        return;
      });

    if (!space) {
      res.status(404).send("Not Found");
      return;
    }

    res.json({
      name: space.name,
      description: space.description,
      createdOnTimestampMs: space.createdOnTimestampMs,
      lastModifiedOnTimestampMs: space.lastModifiedOnTimestampMs,
      createdBy: space.cretedBy,
      deleteOnTimestampMs: space.deleteOnTimestampMs,
      ownerContactMail: space.ownerContactMail,
      ...(accessToken === space.adminUrlToken // include tokens only if the request is made with the admin token
        ? {
            tokenType: "admin",
            adminUrlToken: space.adminUrlToken,
            sharableAccessToken: space.sharableAccessToken,
          }
        : {
            tokenType: "shareable"
        }),
    });
  });

  app.post("/api/space", async (req, res) => {
    // needs to contain a name, description and createdBy
    const { name, description, createdBy, ownerContactMail } = req.body;
    if (
      typeof name !== "string" ||
      typeof description !== "string" ||
      typeof createdBy !== "string" ||
      typeof ownerContactMail !== "string"
    ) {
      res.status(400).send("Bad Request");
      return;
    }

    const adminAccessToken = randomBytes(32).toString("base64url");
    const sharableAccessToken = randomBytes(32).toString("base64url");

    const deletionDate = // default to 30 days from now, except if the user specifies a date that is less than 60 days from now on
      req.body.deletionDate &&
      typeof req.body.deletionDate === "number" &&
      req.body.deletionDate <
        Date.now() +
          1000 *
            60 *
            60 *
            24 *
            62 /* 60 days, 62 days to improve UX in case there is a small time zone problem or similar */
        ? req.body.deletionDate
        : Date.now() + 1000 * 60 * 60 * 24 * 30; // 30 days

    const space: Space = {
      name,
      description,
      createdOnTimestampMs: Date.now(),
      lastModifiedOnTimestampMs: Date.now(),
      deleteOnTimestampMs: deletionDate, // up to 60 days from now
      cretedBy: createdBy,
      adminUrlToken: adminAccessToken,
      sharableAccessToken,
      ownerContactMail,
    };

    const result = await db
      .collection<Space>("spaces")
      .insertOne(space)
      .catch(() => {
        res.json(500).send("Internal Server Error");
      });

    if (!result) {
      res.status(500).send("Internal Server Error");
      return;
    }

    const spaceSharableUrl = `${req.protocol}://${req.hostname}/space?spaceId=${result.insertedId.toHexString()}?token=${sharableAccessToken}`;
    const spaceAdminUrl = `${req.protocol}://${req.hostname}/space?spaceId=${result.insertedId.toHexString()}?token=${adminAccessToken}`;

    res.json({
      spaceId: result.insertedId.toHexString(),
      spaceSharableUrl,
      spaceAdminUrl,
    });
  });
}

export { Space, spaceRoutes };
