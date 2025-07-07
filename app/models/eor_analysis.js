module.exports = (sequelize, DataTypes) => {
    return sequelize.define('eor_analysis', {
        analysis: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        meeting_type: {
            type: DataTypes.ENUM('RKE', 'RT'),
            allowNull: false,
        },
        meeting_decision: {
            type: DataTypes.ENUM('accepted', 'rejected'),
            allowNull: false,
        },

        eor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            unique: true,
        },
        toe_reviewer_id_list: {
            type: DataTypes.JSON,
            allowNull: false,
        },
    });
};