'use strict';
const Sequelize = require('sequelize')
const Op = Sequelize.Op;

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

    //todo: this hasn't really been tested yet.
    CachedWorkspaceMutation.findCacheHit = async function (hash, remainingBudget) {
        const hits = await sequelize.models.CachedWorkspaceMutation.findAll({
            order: [
                "beginningRemainingBudget", "DESC"
            ],
            where: {
                beginningHash: hash,
                beginningRemainingBudget: {
                    [Op.lte]: remainingBudget
                }
            }
        })
        return hits[0]
    }

    CachedWorkspaceMutation.registerNewEntry = async function ({beginningHash, beginningRemainingBudget, endingHash, mutation}) {
        const cacheHit = await this.findCacheHit(beginningHash, beginningRemainingBudget);
        if (!!cacheHit) {
            let params = {usageCount: cacheHit.usageCount + 1}
            if (beginningRemainingBudget < cacheHit.beginningRemainingBudget){
                params[beginningRemainingBudget] = beginningRemainingBudget
            }
            await cacheHit.update(params)
        } else {
            await this.create({
                beginningHash,
                beginningRemainingBudget,
                endingHash,
                mutation
            })
        }
    }

    CachedWorkspaceMutation.prototype.following = async function () {
        return await CachedWorkspaceMutation.findCacheHit(this.endingHash, this.beginningRemainingBudget)
    }

    //TODO: Make sure this keeps order.
    CachedWorkspaceMutation.prototype.allFollowing = async function () {
        if (this.beginningHash === this.endingHash){
            return [this]
        }
        let following = await this.following();
        if (!following) {
            return [this]
        } else {
            console.log("RUNNING FOLLOWING!", following.length)
            let allFollowing = await following.allFollowing();
            return [this, ...allFollowing]
        }
    }

    return CachedWorkspaceMutation
}

export default CachedWorkspaceMutationModel;