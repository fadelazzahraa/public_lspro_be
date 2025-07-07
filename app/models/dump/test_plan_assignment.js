module.exports = (sequelize, DataTypes) => {
    return sequelize.define('test_plan_assignment', {
        reviewer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        test_plan_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['reviewer_id', 'test_plan_id'],
            },
        ],
    });
};
