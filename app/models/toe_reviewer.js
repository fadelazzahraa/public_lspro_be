module.exports = (sequelize, DataTypes) => {
    return sequelize.define('toe_reviewer', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        reviewer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        toe_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        is_lead_reviewer: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
    }, {
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['reviewer_id', 'toe_id'],
            },
        ],
    });
};
