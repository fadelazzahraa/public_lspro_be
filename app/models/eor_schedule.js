module.exports = (sequelize, DataTypes) => {
    return sequelize.define('eor_schedule', {
        schedule_on_evaluation_work_plan_start: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        schedule_on_evaluation_work_plan_end: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        execution_time_on_workbook_start: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        execution_time_on_workbook_end: {
            type: DataTypes.DATE,
            allowNull: false,
        },

        eor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
    });
};