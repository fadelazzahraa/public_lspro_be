module.exports = (sequelize, DataTypes) => {
    return sequelize.define('reviewer', {
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            defaultValue: 'user',
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        speciment_file_uuid: {
            type: DataTypes.STRING,
            allowNull: true,
        },

        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        }
    });
};
