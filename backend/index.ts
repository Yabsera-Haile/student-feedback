// src/index.ts
import * as express from 'express';
import { Request, Response } from 'express';
import mongoose, { Document, Schema } from 'mongoose';
import * as cors from 'cors';
const app = express();
const PORT = 3000;

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/studentFeedback', {});
    console.log('MongoDB Connected...');
  } catch (err: any) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

connectDB();

// Define Student schema
interface IStudent extends Document {
  fullName: string;
  email: string;
  year: number;
  semester: number;
}

const studentSchema = new Schema<IStudent>({
  fullName: String,
  email: { type: String, unique: true, required: true },
  year: Number,
  semester: Number,
});

const Student = mongoose.model<IStudent>('student', studentSchema);

app.use(cors());
app.use(express.json());

// Create a new student
app.post('/students', async (req: Request, res: Response) => {
  try {
    const newStudent = new Student(req.body);
    const savedStudent = await newStudent.save();
    res.json(savedStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all students
app.get('/students', async (req: Request, res: Response) => {
  try {
    const students = await Student.find();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get student by email
app.get('/students/:email', async (req: Request, res: Response) => {
  try {
    const student = await Student.findOne({ email: req.params.email });
    if (!student) {
      res.status(404).json({ error: 'Student not found' });
    } else {
      res.json(student);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update student by email
app.put('/students/:email', async (req: Request, res: Response) => {
  try {
    const updatedStudent = await Student.findOneAndUpdate(
      { email: req.params.email },
      req.body,
      { new: true }
    );
    if (!updatedStudent) {
      res.status(404).json({ error: 'Student not found' });
    } else {
      res.json(updatedStudent);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete student by email
app.delete('/students/:email', async (req: Request, res: Response) => {
  try {
    const deletedStudent = await Student.findOneAndDelete({ email: req.params.email });
    if (!deletedStudent) {
      res.status(404).json({ error: 'Student not found' });
    } else {
      res.json(deletedStudent);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
