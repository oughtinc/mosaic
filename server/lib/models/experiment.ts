import { UUIDV4 } from "sequelize";
import {
  AfterCreate,
  AllowNull,
  BelongsToMany,
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  Table
} from "sequelize-typescript";
import Tree from "./tree";
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

@Table
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

  @BelongsToMany(() => Tree, "ExperimentTreeRelation", "ExperimentId", "TreeId")
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

  @AfterCreate
  public static async createDefaultInstructions(experiment: Experiment) {
    await Instructions.bulkCreate([
      {
        experimentId: experiment.id,
        type: "root",
        value: defaultRootInstructions
      },
      {
        experimentId: experiment.id,
        type: "honestOracle",
        value: defaultHonestOracleInstructions
      },
      {
        experimentId: experiment.id,
        type: "maliciousOracle",
        value: defaultMaliciousOracleInstructions
      },
      {
        experimentId: experiment.id,
        type: "returningRoot",
        value: defaultReturningRootInstructions
      },
      {
        experimentId: experiment.id,
        type: "returningHonestOracle",
        value: defaultReturningHonestOracleInstructions
      },
      {
        experimentId: experiment.id,
        type: "returningMaliciousOracle",
        value: defaultReturningMaliciousOracleInstructions
      },
      {
        experimentId: experiment.id,
        type: "lazyPointerUnlock",
        value: defaultLazyPointerUnlockInstructions
      }
    ]);
  }

  public isActive() {
    return this.eligibilityRank === 1;
  }
}
