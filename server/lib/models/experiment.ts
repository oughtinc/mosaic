import { UUIDV4 } from "sequelize";
import {
  AfterCreate,
  AllowNull,
  BeforeUpdate,
  BeforeValidate,
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  Table
} from "sequelize-typescript";
import EventModel from "./event";
import Tree from "./tree";
import ExperimentTreeRelation from "./experimentTreeRelation";
import {
  defaultHonestOracleInstructions,
  defaultLazyPointerUnlockInstructions,
  defaultMaliciousOracleInstructions,
  defaultReturningHonestOracleInstructions,
  defaultReturningMaliciousOracleInstructions,
  defaultReturningRootInstructions,
  defaultRootInstructions
} from "./helpers/defaultInstructions";
import Instructions from "./instructions";

@Table({ tableName: "Experiments" })
export default class Experiment extends Model<Experiment> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
    allowNull: false
  })
  public id: string;

  @Column(DataType.STRING)
  public name: string;

  @AllowNull
  @Default(null)
  @Column(DataType.INTEGER)
  public eligibilityRank: number;

  @Column(DataType.JSON)
  public description: Object;

  @Column(DataType.JSON)
  public metadata: Object;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  public areNewWorkspacesOracleOnlyByDefault: boolean;

  @BelongsToMany(() => Tree, () => ExperimentTreeRelation)
  public trees: Tree[];

  @BelongsToMany(
    () => Experiment,
    "FallbackRelation",
    "primaryExperimentId",
    "fallbackExperimentId"
  )
  public fallbacks: Experiment[];

  @HasMany(() => Instructions, "experimentId")
  public instructions: Instructions[];

  @ForeignKey(() => EventModel)
  @Column(DataType.INTEGER)
  public createdAtEventId: number;

  @BelongsTo(() => EventModel, "createdAtEventId")
  public createdAtEvent: Event;

  @ForeignKey(() => EventModel)
  @Column(DataType.INTEGER)
  public updatedAtEventId: number;

  @BelongsTo(() => EventModel, "updatedAtEventId")
  public updatedAtEvent: Event;

  @BeforeValidate
  public static updateEvent(item: Experiment, options: { event?: EventModel }) {
    const event = options.event;
    if (event) {
      if (!item.createdAtEventId) {
        item.createdAtEventId = event.dataValues.id;
      }
      item.updatedAtEventId = event.dataValues.id;
    }
  }

  @BeforeUpdate
  public static workaroundOnEventUpdate(
    item: Experiment,
    options: { fields: string[] | boolean }
  ) {
    // This is a workaround of a sequlize bug where the updatedAtEventId wouldn't update for Updates.
    // See: https://github.com/sequelize/sequelize/issues/3534
    options.fields = item.changed();
  }

  @AfterCreate
  public static async createDefaultInstructions(experiment: Experiment) {
    await Instructions.bulkCreate([
      { experimentId: experiment.id, type: "root", value: defaultRootInstructions },
      { experimentId: experiment.id, type: "honestOracle", value: defaultHonestOracleInstructions },
      { experimentId: experiment.id, type: "maliciousOracle", value: defaultMaliciousOracleInstructions },
      { experimentId: experiment.id, type: "returningRoot", value: defaultReturningRootInstructions },
      { experimentId: experiment.id, type: "returningHonestOracle", value: defaultReturningHonestOracleInstructions },
      { experimentId: experiment.id, type: "returningMaliciousOracle", value: defaultReturningMaliciousOracleInstructions },
      { experimentId: experiment.id, type: "lazyPointerUnlock", value: defaultLazyPointerUnlockInstructions },
    ]);
  }

  public isActive() {
    return this.eligibilityRank === 1;
  }
}
