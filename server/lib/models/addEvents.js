function addEvents(model, models){
    model.CreatedAtEvent = model.belongsTo(models.Event, {as: 'createdAtEvent', foreignKey: 'createdAtEventId'});
    model.UpdatedAtEvent = model.belongsTo(models.Event, {as: 'updatedAtEvent', foreignKey: 'updatedAtEventId'});
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

module.exports = function(model, models) {
    return {run: addEvents, eventRelationshipColumns}
} 