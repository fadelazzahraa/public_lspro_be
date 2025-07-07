module.exports = (sequelize, DataTypes) => {
    return sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('admin', 'reviewer'),
            allowNull: false
        }
    });
};
