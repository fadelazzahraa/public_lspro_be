module.exports = (sequelize, DataTypes) => {
    return sequelize.define('test_plan', {
        security_functional_requirement: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        scenario_description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        scenario_aim: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        scenario_pretest_step: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        scenario_test_step: {
            type: DataTypes.JSON,
            allowNull: false,
        },
        scenario_expected_test_result: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        scenario_result: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    });
};