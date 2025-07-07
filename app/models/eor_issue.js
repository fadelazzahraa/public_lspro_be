module.exports = (sequelize, DataTypes) => {
    return sequelize.define('eor_issue', {
        cc_components: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        evaluation_reference: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        issue_description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        eor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    });
};