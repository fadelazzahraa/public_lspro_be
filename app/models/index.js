const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Import semua model
const User = require('./user')(sequelize, DataTypes);
const Reviewer = require('./reviewer')(sequelize, DataTypes);
const TOE = require('./toe')(sequelize, DataTypes);
const TOEReviewer = require('./toe_reviewer')(sequelize, DataTypes);
const EOR = require('./eor')(sequelize, DataTypes);
const EORIssue = require('./eor_issue')(sequelize, DataTypes);
const EORIssueAttachment = require('./eor_issue_attachment')(sequelize, DataTypes);
const EORIssueReviewer = require('./eor_issue_reviewer')(sequelize, DataTypes);
const EORIssueReview = require('./eor_issue_review')(sequelize, DataTypes);
const EORIssueReviewAttachment = require('./eor_issue_review_attachment')(sequelize, DataTypes);
const EORSchedule = require('./eor_schedule')(sequelize, DataTypes);
const EORScheduleReview = require('./eor_schedule_review')(sequelize, DataTypes);
const EORAnalysis = require('./eor_analysis')(sequelize, DataTypes);
const EORReviewReport = require('./eor_reviewreport')(sequelize, DataTypes);
// const TestPlanReport = require('./test_plan_report')(sequelize, DataTypes);
// const TestPlan = require('./test_plan')(sequelize, DataTypes);
// const TestPlanAttachment = require('./test_plan_attachment')(sequelize, DataTypes);
// const TestPlanAssignment = require('./test_plan_assignment')(sequelize, DataTypes);
// const TestPlanReview = require('./test_plan_review')(sequelize, DataTypes);
// const TestPlanReviewAttachment = require('./test_plan_review_attachment')(sequelize, DataTypes);
// const TestPlanReportReviewSummary = require('./test_plan_report_review_summary')(sequelize, DataTypes);

// * USER AND REVIEWER
User.hasOne(Reviewer, { foreignKey: 'user_id', onDelete: 'RESTRICT' });
Reviewer.belongsTo(User, { foreignKey: 'user_id', onDelete: 'RESTRICT' });

// * TOE
TOE.hasMany(EOR, { foreignKey: 'toe_id', onDelete: 'RESTRICT' });
EOR.belongsTo(TOE, { foreignKey: 'toe_id', onDelete: 'RESTRICT' });

// TOE.hasMany(TestPlanReport, { foreignKey: 'toe_id' });
// TestPlanReport.belongsTo(TOE, { foreignKey: 'toe_id' });

// * Reviewer Assignment
Reviewer.hasMany(TOEReviewer, { foreignKey: 'reviewer_id', onDelete: 'RESTRICT' });
TOEReviewer.belongsTo(Reviewer, { foreignKey: 'reviewer_id', onDelete: 'RESTRICT' });

// * Reviewer
TOE.hasMany(TOEReviewer, { foreignKey: 'toe_id', onDelete: 'CASCADE' });
TOEReviewer.belongsTo(TOE, { foreignKey: 'toe_id', onDelete: 'CASCADE' });

TOE.belongsToMany(Reviewer, {
    through: TOEReviewer,
    foreignKey: 'toe_id',
    otherKey: 'reviewer_id',
});

Reviewer.belongsToMany(TOE, {
    through: TOEReviewer,
    foreignKey: 'reviewer_id',
    otherKey: 'toe_id',
});

TOEReviewer.hasMany(EORIssueReviewer, { foreignKey: 'toe_reviewer_id', onDelete: 'RESTRICT' });
EORIssueReviewer.belongsTo(TOEReviewer, { foreignKey: 'toe_reviewer_id', onDelete: 'RESTRICT' });

EORIssue.hasOne(EORIssueReviewer, { foreignKey: 'eor_issue_id', onDelete: 'CASCADE' });
EORIssueReviewer.belongsTo(EORIssue, { foreignKey: 'eor_issue_id', onDelete: 'CASCADE' });

// * EOR Components
EOR.hasMany(EORIssue, { foreignKey: 'eor_id', onDelete: 'RESTRICT' });
EORIssue.belongsTo(EOR, { foreignKey: 'eor_id', onDelete: 'RESTRICT' });

EOR.hasOne(EORSchedule, { foreignKey: 'eor_id', onDelete: 'CASCADE' });
EORSchedule.belongsTo(EOR, { foreignKey: 'eor_id', onDelete: 'CASCADE' });

EOR.hasOne(EORAnalysis, { foreignKey: 'eor_id', onDelete: 'CASCADE' });
EORAnalysis.belongsTo(EOR, { foreignKey: 'eor_id', onDelete: 'CASCADE' });

EORIssue.hasMany(EORIssueAttachment, { foreignKey: 'eor_issue_id', onDelete: 'RESTRICT' });
EORIssueAttachment.belongsTo(EORIssue, { foreignKey: 'eor_issue_id', onDelete: 'RESTRICT' });

EORIssueReviewer.hasOne(EORIssueReview, { foreignKey: 'eor_issue_reviewer_id', onDelete: 'CASCADE' });
EORIssueReview.belongsTo(EORIssueReviewer, { foreignKey: 'eor_issue_reviewer_id', onDelete: 'CASCADE' });

EORIssueReview.hasMany(EORIssueReviewAttachment, { foreignKey: 'eor_issue_review_id', onDelete: 'RESTRICT' });
EORIssueReviewAttachment.belongsTo(EORIssueReview, { foreignKey: 'eor_issue_review_id', onDelete: 'RESTRICT' });

EORSchedule.hasOne(EORScheduleReview, { foreignKey: 'eor_schedule_id', onDelete: 'CASCADE' });
EORScheduleReview.belongsTo(EORSchedule, { foreignKey: 'eor_schedule_id', onDelete: 'CASCADE' });

EOR.hasOne(EORReviewReport, { foreignKey: 'eor_id', onDelete: 'RESTRICT' });
EORReviewReport.belongsTo(EOR, { foreignKey: 'eor_id', onDelete: 'RESTRICT' });


// EOR Review - Attachment

// // Test Plan Report - Test Plan
// TestPlanReport.hasMany(TestPlan, { foreignKey: 'test_plan_report_id' });
// TestPlan.belongsTo(TestPlanReport, { foreignKey: 'test_plan_report_id' });

// TestPlanReport.hasOne(TestPlanReportReviewSummary, { foreignKey: 'test_plan_report_id' });
// TestPlanReportReviewSummary.belongsTo(TestPlanReport, { foreignKey: 'test_plan_report_id' });

// // Test Plan - Attachment
// TestPlan.hasMany(TestPlanAttachment, { foreignKey: 'test_plan_id' });
// TestPlanAttachment.belongsTo(TestPlan, { foreignKey: 'test_plan_id' });

// // Test Plan - Assignment
// TestPlan.hasMany(TestPlanAssignment, { foreignKey: 'test_plan_id' });
// TestPlanAssignment.belongsTo(TestPlan, { foreignKey: 'test_plan_id' });

// Reviewer.hasMany(TestPlanAssignment, { foreignKey: 'reviewer_id' });
// TestPlanAssignment.belongsTo(Reviewer, { foreignKey: 'reviewer_id' });

// // Test Plan Assignment - Review
// TestPlanAssignment.hasMany(TestPlanReview, { foreignKey: 'test_plan_assignment_id' });
// TestPlanReview.belongsTo(TestPlanAssignment, { foreignKey: 'test_plan_assignment_id' });

// // Test Plan Review - Attachment
// TestPlanReview.hasMany(TestPlanReviewAttachment, { foreignKey: 'test_plan_review_id' });
// TestPlanReviewAttachment.belongsTo(TestPlanReview, { foreignKey: 'test_plan_review_id' });

module.exports = {
    sequelize,
    User,
    Reviewer,
    TOE,
    EOR,
    TOEReviewer,
    EORIssue,
    EORIssueAttachment,
    EORIssueReview,
    EORIssueReviewer,
    EORIssueReviewAttachment,
    EORSchedule,
    EORScheduleReview,
    EORAnalysis,
    EORReviewReport
    // TestPlanReport,
    // TestPlan,
    // TestPlanAttachment,
    // TestPlanAssignment,
    // TestPlanReview,
    // TestPlanReviewAttachment,
    // TestPlanReportReviewSummary,
};
