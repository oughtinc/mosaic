function addEvents(model, models){
    model.CreatedAtEvent = model.belongsTo(models.Event, {as: 'createdAtEvent', foreignKey: 'createdAtEventId'});
    model.UpdatedAtEvent = model.belongsTo(models.Event, {as: 'updatedAtEvent', foreignKey: 'updatedAtEventId'});
};

module.exports = function(model, models) {
    return {run: addEvents}
} 