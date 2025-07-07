const express = require('express');
const cors = require("cors");
const { sequelize } = require('./app/models');
const path = require('path');

require('dotenv').config();

// ! Saat awal memulai aplikasi, gunakan sync({force: true}) agar data terhapus seluruhnya
// ! Setelahnya, gunakan sync() 
// ! Konfigurasi port dan konfigurasi database lainnya ada di file .env

sequelize.sync();
// force: true will drop the table if it already exists
// sequelize.sync({ force: true }).then(() => {
//     console.log("Drop and Resync Database with { force: true }");
// });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/uploads', express.static(path.join(__dirname, 'app/uploads')));
app.use('/api/review-report', express.static(path.join(__dirname, 'app/reviewreports')));
app.use('/api/temp', express.static(path.join(__dirname, 'app/temp')));

app.use('/api/auth', require('./app/routes/auth_routes'));
app.use('/api/user', require('./app/routes/user_routes'));
app.use('/api/reviewer', require('./app/routes/reviewer_routes'));
app.use('/api/toe', require('./app/routes/toe_routes'));
app.use('/api/toe-reviewer', require('./app/routes/toe_reviewer_routes'));
app.use('/api/eor', require('./app/routes/eor_routes'));
app.use('/api/eor-issue', require('./app/routes/eor_issue_routes'));
app.use('/api/eor-issue-reviewer', require('./app/routes/eor_issue_reviewer_routes'));
app.use('/api/eor-issue-review', require('./app/routes/eor_issue_review_routes'));
app.use('/api/eor-schedule', require('./app/routes/eor_schedule_routes'));
app.use('/api/eor-schedule-review', require('./app/routes/eor_schedule_review_routes'));
app.use('/api/eor-analysis', require('./app/routes/eor_analysis_routes'));


app.get("/api/", (req, res) => {
    res.status(200).json({ message: "!" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
});

