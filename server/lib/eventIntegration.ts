function addEventAssociations(model, models) {
    model.CreatedAtEvent = model.belongsTo(models.Event, { as: 'createdAtEvent', foreignKey: 'createdAtEventId' });
    model.UpdatedAtEvent = model.belongsTo(models.Event, { as: 'updatedAtEvent', foreignKey: 'updatedAtEventId' });
};
export { addEventAssociations }

export const eventRelationshipColumns = (DataTypes) => ({
    createdAtEventId: {
        type: DataTypes.INTEGER(),
    },
    updatedAtEventId: {
        type: DataTypes.INTEGER(),
    }
})

export const eventHooks = {
    beforeValidate: (item, options) => {
        const event = options.event
        if (event) {
            if (!item.createdAtEventId) {
                item.createdAtEventId = event.dataValues.id
            }
            item.updatedAtEventId = event.dataValues.id
        }
    },
    beforeUpdate: (item, options) => {
        //This is a workaround of a sequlize bug where the updatedAtEventId wouldn't update for Updates.
        //See: https://github.com/sequelize/sequelize/issues/3534 
        options.fields = item.changed();
    }
}