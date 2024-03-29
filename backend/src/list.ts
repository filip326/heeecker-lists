import { Db, ObjectId } from "mongodb";
import { Express } from "express";

type ListColumn = {
  name: string;
  required: boolean;
  description?: string;
  unique: boolean;
  regexTest?: string;
};

type listAddForm = {
  name: string;
  description: string;
  columns: ListColumn[];
  maxRowCount: number | null;
};

interface List {
  space: ObjectId;
  name: string;
  description: string;
  columns: ListColumn[];
  maxRows?: number;
  rows: (any & { _timestamp: number })[];
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
      id: list._id.toHexString(),
      name: list.name,
      description: list.description,
      columns: list.columns,
      maxRows: list.maxRows,
      rows: list.rows,
    });
  });

  app.post("/api/space/:spaceId/list", async (req, res) => {
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
        adminUrlToken: accessToken,
      })
      .catch(() => {
        res.status(500).send("Internal Server Error");
        return;
      });

    if (!space) {
      res.status(404).send("Not Found");
      return;
    }

    const list: listAddForm = req.body;
    if (
      typeof list.name !== "string" ||
      typeof list.description !== "string" ||
      !Array.isArray(list.columns) ||
      (list.maxRowCount && typeof list.maxRowCount !== "number")
    ) {
      res.status(400).send("Bad Request");
      return;
    }

    const newList: List = {
      name: list.name,
      description: list.description,
      space: new ObjectId(spaceId),
      maxRows: list.maxRowCount || undefined,
      rows: [],
      columns: list.columns,
    };

    const returned = await db.collection<List>("lists").insertOne(newList);
    res.json({ id: returned.insertedId.toHexString() });
  });

  app.post("/api/space/:spaceId/list/:listId/row", async (req, res) => {
    const accessToken = req.query.token;
    const spaceId = req.params.spaceId;
    const listId = req.params.listId;

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

    const { success, row } = await validateRowInsert(
      req.body,
      list.columns,
      (key, value) => {
        for (const r of list.rows) {
          if (r[key] === value) {
            return true;
          }
        }
        return false;
      }
    );
    if (!success || !row) {
      res.status(400).send("Bad Request");
      return;
    }

    const insertData = { ...row, _timestamp: Date.now() };
    list.rows.push(insertData);
    await db
      .collection<List>("lists")
      .updateOne(
        { _id: new ObjectId(listId) },
        { $push: { rows: insertData } }
      );
    res.json({ success: true });
  });
}

function validateRowInsert(
  body: any,
  columns: ListColumn[],
  exists: (key: string, value: string) => boolean
): {
  success: boolean;
  row: any | null;
} {
  let newPayload: any = {};

  for (const c of columns) {
    let value = body[c.name];
    if (!value || value === "" || value.trim() === "") {
        value = "";
    }
    if (c.required && value === "") {
      return { success: false, row: null };
    }
    if (value && typeof value !== "string") {
      return { success: false, row: null };
    }
    if (c.regexTest && value && !new RegExp(c.regexTest).test(value)) {
      return { success: false, row: null };
    }
    if (c.unique && value && exists(c.name, value)) {
      return { success: false, row: null };
    }
    if (value === "") {
        value = "n/a";
    }
    newPayload[c.name] = value;
  }

  return { success: true, row: newPayload };
}

export { listRoutes, List, ListColumn };
