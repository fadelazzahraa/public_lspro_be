module.exports = (sequelize, DataTypes) => {
    return sequelize.define('eor', {
        project_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        workbook_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        work_package: {
            type: DataTypes.ENUM('ASE', 'AGD', 'ALC', 'ADV', 'ATE', 'AVA'),
            allowNull: false,
        },
        deliverables_reference: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        cc_components: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        workbook_released_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },

        toe_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });
};
