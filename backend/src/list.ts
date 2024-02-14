import { Db, ObjectId } from "mongodb";
import { Express } from "express";

type ListColumn = {
  name: string;
  required: boolean;
  description?: string;
  unique: boolean;
  regexTest?: string;
};

interface List {
  space: ObjectId;
  name: string;
  description: string;
  columns: ListColumn[];
  maxRows: number;
  rows: any[];
}

function listRoutes(app: Express, db: Db) {
  app.get("/api/space/:spaceId/lists", async (req, res) => {
    const accessToken = req.query.token;
    const spaceId = req.params.spaceId;
    if (!accessToken || typeof accessToken !== "string") {
      res.status(400).send("Bad Request");
      return;
    }

    if (!ObjectId.isValid(spaceId)) {
      res.status(400).send("Bad Request");
      return;
    }

    const space = await db
      .collection("spaces")
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

    const lists = await db
      .collection<List>("lists")
      .find({ space: new ObjectId(spaceId) })
      .toArray();

    res.json(
      lists.map((list) => ({
        name: list.name,
        id: list._id.toHexString(),
      }))
    );
  });

  app.get("/api/space/:spaceId/list/:listId", async (req, res) => {
    const accessToken = req.query.token;
    const listId = req.params.listId;
    const spaceId = req.params.spaceId;

    if (!accessToken || typeof accessToken !== "string") {
      res.status(400).send("Bad Request");
      return;
    }

    if (!ObjectId.isValid(spaceId) || !ObjectId.isValid(listId)) {
      res.status(400).send("Bad Request");
      return;
    }

    const space = await db
      .collection("spaces")
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

    const list = await db
      .collection<List>("lists")
      .findOne({ _id: new ObjectId(listId) })
      .catch(() => {
        res.status(500).send("Internal Server Error");
        return;
      });

    if (!list) {
      res.status(404).send("Not Found");
      return;
    }

    res.json({
      name: list.name,
      description: list.description,
      columns: list.columns,
      maxRows: list.maxRows,
      rows: list.rows,
    });
  });

  app.post("/api/space/")
}

export { listRoutes, List, ListColumn };
