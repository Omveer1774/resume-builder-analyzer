import express from "express";
import cors from "cors";
import mongoose from "mongoose";

const app = express();

app.use(cors());
app.use(express.json());

// 1. Connect to MongoDB
const MONGO_URI = "mongodb://127.0.0.1:27017/resumeBuilder";

// 2. Resume Schema
const resumeSchema = new mongoose.Schema(
  {
    resume: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    jobDescription: {
      type: String,
      default: ""
    },
    analysis: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    template: { type: String, default: "Modern" }
  },
  { timestamps: true }
);

const Resume = mongoose.model("Resume", resumeSchema);

// 3. Home route
app.get("/", (req, res) => {
  res.json({ message: "Resume Builder API is running" });
});

// 4. Existing ATS analysis route
app.post("/api/analyze", (req, res) => {
  const { resume = {}, jobDescription = "" } = req.body;

  const text = Object.values(resume)
    .join(" ")
    .toLowerCase();

  const jd = jobDescription.toLowerCase();

  const keywords = [
    "javascript", "react", "react.js", "node.js", "node",
    "express", "express.js", "mongodb", "sql", "python",
    "git", "rest api", "html", "css", "api",
    "machine learning", "data analysis"
  ];

  const matched = [];
  const missing = [];

  keywords.forEach((keyword) => {
    if (jd.includes(keyword)) {
      if (text.includes(keyword)) {
        matched.push(keyword);
      } else {
        missing.push(keyword);
      }
    }
  });

  const keywordScore =
    matched.length + missing.length > 0
      ? (matched.length / (matched.length + missing.length)) * 100
      : 0;

  const skillScore = resume.skills ? 100 : 0;
  const projectScore = resume.projects ? 100 : 0;
  const experienceScore = resume.experience ? 100 : 0;
  const educationScore = resume.education ? 100 : 0;

  let structureScore = 0;

  if (resume.name) structureScore += 20;
  if (resume.email) structureScore += 20;
  if (resume.phone) structureScore += 20;
  if (resume.summary) structureScore += 20;
  if (resume.location) structureScore += 20;

  const score = Math.round(
    skillScore * 0.40 +
    keywordScore * 0.20 +
    projectScore * 0.15 +
    experienceScore * 0.10 +
    educationScore * 0.10 +
    structureScore * 0.05
  );

  const suggestions = [];

  if (missing.length > 0) {
    suggestions.push(
      "Consider adding relevant missing keywords: " +
      missing.slice(0, 8).join(", ")
    );
  }

  if (!resume.experience) {
    suggestions.push(
      "Add internship or project experience with measurable achievements."
    );
  }

  if (!resume.projects) {
    suggestions.push(
      "Add 2-3 relevant projects with technologies and project outcomes."
    );
  }

  if (!resume.skills) {
    suggestions.push(
      "Add a dedicated technical skills section."
    );
  }

  suggestions.push(
    "Keep the resume clear, concise, and tailored to the job description."
  );

  res.json({
    score,
    matched,
    missing,
    suggestions,
    breakdown: {
      skills: skillScore,
      keywords: Math.round(keywordScore),
      projects: projectScore,
      experience: experienceScore,
      education: educationScore,
      structure: structureScore
    }
  });
});

// 5. Save resume and analysis to MongoDB
app.post("/api/resumes", async (req, res) => {
  try {
    const {
      resume,
      jobDescription = "",
      analysis = {}
    } = req.body;

    if (!resume || typeof resume !== "object" || Array.isArray(resume)) {
      return res.status(400).json({
        message: "Please provide valid resume data."
      });
    }

    const savedResume = await Resume.create({
      resume,
      jobDescription,
      analysis,
      template: req.body.template || "Modern"
    });

    res.status(201).json({
      message: "Resume saved successfully",
      id: savedResume._id
    });
  } catch (error) {
    console.error("Error saving resume:", error);
    res.status(500).json({
      message: "Could not save resume"
    });
  }
});

// 6. Get all saved resumes
app.get("/api/resumes", async (req, res) => {
  try {
    const resumes = await Resume.find().sort({ createdAt: -1 });
    res.json(resumes);
  } catch (error) {
    console.error("Error fetching resumes:", error);
    res.status(500).json({
      message: "Could not fetch resumes"
    });
  }
});

// Update an existing resume
app.put("/api/resumes/:id", async (req, res) => {
  try {
    const { resume, jobDescription = "", analysis = {}, template = "Modern" } = req.body;
    if (!resume || typeof resume !== "object" || Array.isArray(resume)) {
      return res.status(400).json({ message: "Please provide valid resume data." });
    }
    const updated = await Resume.findByIdAndUpdate(
      req.params.id,
      { resume, jobDescription, analysis, template },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: "Resume not found." });
    res.json({ message: "Resume updated successfully", resume: updated });
  } catch (error) {
    console.error("Error updating resume:", error);
    res.status(500).json({ message: "Could not update resume." });
  }
});

// Delete a saved resume
app.delete("/api/resumes/:id", async (req, res) => {
  try {
    const deleted = await Resume.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Resume not found." });
    res.json({ message: "Resume deleted successfully." });
  } catch (error) {
    console.error("Error deleting resume:", error);
    res.status(500).json({ message: "Could not delete resume." });
  }
});

// 7. Start server after MongoDB connects
async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected successfully");

    app.listen(5000, () => {
      console.log("Server running on http://localhost:5000");
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();