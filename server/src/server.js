import express from "express";

const app = express();
const PORT = 5000
app.use(express.json());
app.get("/", (req, res) => {
    res.status(200).json({ Message: `Server running on port ${PORT}` })
})
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
