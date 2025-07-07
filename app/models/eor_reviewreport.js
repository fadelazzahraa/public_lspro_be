module.exports = (sequelize, DataTypes) => {
    return sequelize.define('eor_reviewreport', {
        file: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        left_signer: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        middle_signer: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        lead_right_signer: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        right_signer: {
            type: DataTypes.JSON,
            allowNull: false,
        },

        eor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
    });
};