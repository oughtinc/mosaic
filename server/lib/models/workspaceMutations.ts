
'use strict';

const WorkspaceMutationModel = (sequelize, DataTypes) => {
    var WorkspaceMutation = sequelize.define('WorkspaceMutation', {
        id: {
            type: DataTypes.UUID(),
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
        },
        beginningHash: {
            type: DataTypes.TEXT,
        },
        endingHash: {
            type: DataTypes.TEXT,
        },
        budget: {
            type: DataTypes.INTEGER,
        },
        usageCount: {
            type: DataTypes.INTEGER,
        },
        mutation: {
            type: DataTypes.JSON,
        }
    })

    return WorkspaceMutation
}

export default WorkspaceMutationModel;