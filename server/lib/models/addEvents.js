function addEvents(model, models) {
    model.CreatedAtEvent = model.belongsTo(models.Event, { as: 'createdAtEvent', foreignKey: 'createdAtEventId' });
    model.UpdatedAtEvent = model.belongsTo(models.Event, { as: 'updatedAtEvent', foreignKey: 'updatedAtEventId' });
};

const eventRelationshipColumns = (DataTypes) => ({
    createdAtEventId: {
        type: DataTypes.INTEGER(),
        allowNull: false,
    },
    updatedAtEventId: {
        type: DataTypes.INTEGER(),
        allowNull: false,
    }
})

const beforeValidate = {
    beforeValidate: async (item, { event }) => {
        if (event && event.dataValues) {
            item.createdAtEventId = event.dataValues.id,
                item.updatedAtEventId = event.dataValues.id
        }
        return item
    }
}

module.exports = function (model, models) {
    return { run: addEvents, eventRelationshipColumns, beforeValidate }
} 