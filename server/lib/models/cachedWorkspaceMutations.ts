'use strict';

const CachedWorkspaceMutationModel = (sequelize, DataTypes) => {
    var CachedWorkspaceMutation = sequelize.define('CachedWorkspaceMutation', {
        id: {
            type: DataTypes.UUID(),
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
        },
        beginningHash: {
            type: DataTypes.TEXT,
        },
        beginningRemainingBudget: {
            type: DataTypes.INTEGER,
        },
        endingHash: {
            type: DataTypes.TEXT,
        },
        usageCount: {
            type: DataTypes.INTEGER,
        },
        mutation: {
            type: DataTypes.JSON,
        }
    })

    return CachedWorkspaceMutation
}

export default CachedWorkspaceMutationModel;