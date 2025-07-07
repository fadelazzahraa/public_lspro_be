module.exports = (sequelize, DataTypes) => {
    return sequelize.define('test_plan_report', {
        document_title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        document_version: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        toe_software_identification: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        eal: {
            type: DataTypes.ENUM('2', '3', '4'),
            allowNull: false,
        },
        release_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });
};
