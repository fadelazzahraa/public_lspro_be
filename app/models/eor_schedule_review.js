module.exports = (sequelize, DataTypes) => {
    return sequelize.define('eor_schedule_review', {
        review_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        reviewer_review: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        eor_schedule_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        toe_reviewer_id_list: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        eor_schedule_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
    });
};