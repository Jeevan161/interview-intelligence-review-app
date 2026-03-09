const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const URI =
  "mongodb+srv://root:root@cluster0.sy2sv0c.mongodb.net/?appName=Cluster0";
const DB = "interview_intelligence";
let db;

MongoClient.connect(URI).then((client) => {
  db = client.db(DB);
  console.log("Connected to MongoDB");
});

// GET all questions (with filters)
app.get("/api/questions", async (req, res) => {
  const { status, is_covered, how_covered, language, search, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter["gpt_analysis.coverage_status"] = status;
  if (is_covered) filter["gpt_analysis.is_covered"] = is_covered;
  if (how_covered) filter["gpt_analysis.how_covered"] = how_covered;
  if (language) filter["gpt_analysis.language"] = language;
  if (search) {
    const regex = { $regex: search, $options: "i" };
    filter.$or = [
      { Question: regex },
      { "Company Name": regex },
      { "gpt_analysis.justification": regex },
      { "gpt_analysis.matched_topics": regex },
    ];
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const [questions, total] = await Promise.all([
    db
      .collection("questions")
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .toArray(),
    db.collection("questions").countDocuments(filter),
  ]);

  res.json({ questions, total, page: parseInt(page), limit: parseInt(limit) });
});

// GET single question
app.get("/api/questions/:id", async (req, res) => {
  const question = await db
    .collection("questions")
    .findOne({ _id: new ObjectId(req.params.id) });
  if (!question) return res.status(404).json({ error: "Not found" });
  res.json(question);
});

// GET summary stats (all three dimensions)
app.get("/api/stats", async (req, res) => {
  const [isCovered, howCovered, coverageStatus, languages] = await Promise.all([
    db.collection("questions").aggregate([
      { $group: { _id: "$gpt_analysis.is_covered", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray(),
    db.collection("questions").aggregate([
      { $group: { _id: "$gpt_analysis.how_covered", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray(),
    db.collection("questions").aggregate([
      { $group: { _id: "$gpt_analysis.coverage_status", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray(),
    db.collection("questions").aggregate([
      { $group: { _id: "$gpt_analysis.language", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]).toArray(),
  ]);

  const pythonNotCovered = await db.collection("questions").countDocuments({
    "gpt_analysis.is_covered": "NOT_COVERED",
    "gpt_analysis.language": "Python",
  });

  const total = isCovered.reduce((s, x) => s + x.count, 0);
  const pythonTotal = await db.collection("questions").countDocuments({ "gpt_analysis.language": "Python" });
  res.json({ is_covered: isCovered, how_covered: howCovered, coverage_status: coverageStatus, languages, total, python_not_covered: pythonNotCovered, python_total: pythonTotal });
});

// POST remark for a question
app.post("/api/questions/:id/remarks", async (req, res) => {
  const { name, remark } = req.body;
  if (!name || !remark)
    return res.status(400).json({ error: "name and remark required" });

  const doc = {
    question_id: new ObjectId(req.params.id),
    name,
    remark,
    created_at: new Date(),
  };
  await db.collection("remarks").insertOne(doc);

  res.json({ success: true, remark: doc });
});

// GET remarks for a question
app.get("/api/questions/:id/remarks", async (req, res) => {
  const remarks = await db
    .collection("remarks")
    .find({ question_id: new ObjectId(req.params.id) })
    .sort({ created_at: -1 })
    .toArray();
  res.json(remarks);
});

// GET all remarks (for remarks page)
app.get("/api/remarks", async (req, res) => {
  const pipeline = [
    { $sort: { created_at: -1 } },
    {
      $lookup: {
        from: "questions",
        localField: "question_id",
        foreignField: "_id",
        as: "question",
      },
    },
    { $unwind: { path: "$question", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        name: 1,
        remark: 1,
        created_at: 1,
        "question.Question": 1,
        "question.Company Name": 1,
        "question.gpt_analysis.coverage_status": 1,
        "question.gpt_analysis.is_covered": 1,
      },
    },
  ];
  const remarks = await db
    .collection("remarks")
    .aggregate(pipeline)
    .toArray();
  res.json(remarks);
});

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
