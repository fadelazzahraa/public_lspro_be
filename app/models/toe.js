module.exports = (sequelize, DataTypes) => {
    return sequelize.define('toe', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        version: {
            type: DataTypes.STRING,
            allowNull: false
        },
        eal: {
            type: DataTypes.ENUM('2', '3', '4'),
            allowNull: false
        },
    });
};