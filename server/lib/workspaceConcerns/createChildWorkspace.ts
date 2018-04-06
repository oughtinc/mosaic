export class CreateChildWorkspace {
    public static mutationName = "CreateChildWorkspace";
    public question;
    public totalBudget;

    public init({question, totalBudget}) {
        this.question = question;
        this.totalBudget = totalBudget;
    }

    public async run(workspace, event){
        const child = await workspace.createChild({
            event,
            question: JSON.parse(this.question),
            totalBudget: this.totalBudget
        })
        return child
    }

    public toJSON(){
        return {
            mutationName: this.constructor.name,
            question: this.question,
            totalBudget: this.totalBudget
        }
    }
}