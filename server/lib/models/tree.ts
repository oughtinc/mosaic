import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import { UUIDV4 } from "sequelize";
import Experiment from "./experiment";
import Workspace from "./workspace";
import UserTreeOracleRelation from "./userTreeOracleRelation";
import User from "./user";

@Table
export default class Tree extends Model<Tree> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    defaultValue: UUIDV4,
    allowNull: false,
  })
  public id: string;

  @ForeignKey(() => Workspace)
  @Column(DataType.UUID)
  public rootWorkspaceId: string;

  @Column(DataType.BOOLEAN)
  public doesAllowOracleBypass: boolean;

  @BelongsTo(() => Workspace)
  public rootWorkspace: Workspace;

  @BelongsToMany(
    () => Experiment,
    "ExperimentTreeRelation",
    "TreeId",
    "ExperimentId",
  )
  public experiments: Experiment[];

  @HasMany(() => UserTreeOracleRelation)
  public oracleRelations: UserTreeOracleRelation[];

  @BelongsToMany(() => User, () => UserTreeOracleRelation)
  public oracles: User[];
}
