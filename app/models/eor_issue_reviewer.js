module.exports = (sequelize, DataTypes) => {
    return sequelize.define('eor_issue_reviewer', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        toe_reviewer_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        eor_issue_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }

    }, {
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['toe_reviewer_id', 'eor_issue_id'],
            },
        ],
    });
};
