module.exports = (sequelize, DataTypes) => {
    return sequelize.define('test_plan_attachment', {
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