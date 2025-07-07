module.exports = (sequelize, DataTypes) => {
    return sequelize.define("eor_issue_review_attachment", {
        file_uuid: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        mime_type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        att_number: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        eor_issue_review_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    }, {
        indexes: [
            {
                unique: true,
                fields: ['eor_issue_review_id', 'att_number']
            }
        ]
    }
    );
};
