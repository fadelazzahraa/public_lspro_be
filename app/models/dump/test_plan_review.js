module.exports = (sequelize, DataTypes) => {
    return sequelize.define('test_plan_review', {
        review_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        auditor_review: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
    });
};
