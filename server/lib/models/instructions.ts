import {
  AllowNull,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import Experiment from "./experiment";

export const InstructionTypes = [
  "root",
  "honestOracle",
  "maliciousOracle",
  "returningRoot",
  "returningHonestOracle",
  "returningMaliciousOracle",
  "lazyPointerUnlock",
];

@Table
export default class Instructions extends Model<Instructions> {
  @AllowNull(false)
  @Column(DataType.ENUM(InstructionTypes))
  public type: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  public value: string;

  @ForeignKey(() => Experiment)
  @Column(DataType.UUID)
  public experimentId: string;

  @BelongsTo(() => Experiment)
  public experiment: Experiment;
}
