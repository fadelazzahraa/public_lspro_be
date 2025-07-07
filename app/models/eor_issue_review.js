module.exports = (sequelize, DataTypes) => {
    return sequelize.define('eor_issue_review', {
        review_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        reviewer_review: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },

        eor_issue_reviewer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        }
    });
};