module.exports = (sequelize, DataTypes) => {
    return sequelize.define('eor_issue_review_attachment', {
        filepath: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        datatype: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    });
};