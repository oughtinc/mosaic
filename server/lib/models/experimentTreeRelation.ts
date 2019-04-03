import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table
} from "sequelize-typescript";
import Experiment from "./experiment";
import Tree from "./tree";

@Table
export default class ExperimentTreeRelation extends Model<
  ExperimentTreeRelation
> {
  @ForeignKey(() => Experiment)
  @Column(DataType.UUID)
  public ExperimentId: string;

  @BelongsTo(() => Experiment)
  public Experiment: Experiment;

  @ForeignKey(() => Tree)
  @Column(DataType.UUID)
  public TreeId: string;

  @BelongsTo(() => Tree)
  public Tree: Tree;
}
