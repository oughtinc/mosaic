## Scheduler v1

This is the first version of the automated scheduler. Currently, all scheduling information is just stored in memory, so it won't persist across a server restart. Persistence would be a future improvement.

Conceptually, right now scheduling is handled by four classes: Scheduler, Schedule, UserSchedule, and Assignment.

#### Assignment

An assignment says that a certain user started working on a certain workspace at a certain time.

#### UserSchedule

A userScheduler is all of a certain user's assignments.

#### Schedule

The schedule (there's only one) is the collection of all userSchedules.

#### Scheduler

The scheduler is the only exposed API. It only has two public methods: `getIdOfCurrentWorkspace` and `assignNextWorkspace`. The scheduler looks at all of the scheduling information (via the schedule) and decides which workspace to assign to a user next.

## Implementation

There is quite a bit of reasoning about trees. Trees are identified with their root workspaces.
