import { example as sampleExample } from "./sample";
import { example as oughtActivitiesExample } from "./oughtActivities";
import { example as officeExample } from "./office";

// It's suggested to use this tool to transform graphql responses into examples:
// https://json-to-js.com/

export const examples = [
    {
        url: "sample",
        name: "Sample",
        rootWorkspaceId: "77e83b98-c228-43c2-9b96-16c48dbd1a85",
        data: sampleExample.data,
    },
    {
        url: "office",
        name: "Office",
        rootWorkspaceId: "aa74a007-945c-4040-9223-cc50d668f22f",
        data: officeExample.data,
    },
    {
        url: "activities",
        name: "Activities",
        rootWorkspaceId: "9f166969-4204-4eb2-900a-6353556fc7f3",
        data: oughtActivitiesExample.data,
    },
];