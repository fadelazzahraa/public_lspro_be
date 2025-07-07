module.exports = (sequelize, DataTypes) => {
    return sequelize.define('test_plan_report_review_summary', {
        summary: {
            type: DataTypes.JSON,
            allowNull: false,
        }
    });
};
