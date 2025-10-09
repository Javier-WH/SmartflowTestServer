import { useState } from 'react';
import { KanbanBoard, KanbanCard, KanbanCards, KanbanHeader, KanbanProvider } from '@/components/ui/shadcn-io/kanban';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});
const shortDateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
});

const exampleTasks = [
    {
        id: '1',
        name: 'Design Homepage',
        column: 'column-1',
        startAt: new Date('2023-10-01'),
        endAt: new Date('2023-10-05'),
        owner: { name: 'Alice' },
        status: 'To Do',
    },
    {
        id: '2',
        name: 'Develop API',
        column: 'column-2',
        startAt: new Date('2023-10-03'),
        endAt: new Date('2023-10-10'),
        owner: { name: 'Bob' },
        status: 'In Progress',
    },
    {
        id: '3',
        name: 'Testing',
        column: 'column-3',
        startAt: new Date('2023-10-11'),
        endAt: new Date('2023-10-15'),
        owner: { name: 'Charlie' },
        status: 'Backlog',
    },
];

export default function TaskManager() {
    const [tasks, setTasks] = useState(exampleTasks);

    const columns = [
        { id: 'column-1', name: 'Backlog', color: '#FFAAA' },
        { id: 'column-2', name: 'To Do', color: '#FFDEDE' },
        { id: 'column-3', name: 'In Progress', color: '#DEFFDE' },
        { id: 'column-4', name: 'Done', color: '#DEDEFF' },
    ];

    return (
        <div className="p-4">
            <KanbanProvider columns={columns} data={tasks} onDataChange={setTasks}>
                {column => (
                    <KanbanBoard id={column.id} key={column.id}>
                        <KanbanHeader>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: column.color }} />
                                <span>{column.name}</span>
                            </div>
                        </KanbanHeader>
                        <KanbanCards id={column.id}>
                            {(task: (typeof tasks)[number]) => (
                                <KanbanCard column={column.id} id={task.id} key={task.id} name={task.name}>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex flex-col gap-1">
                                            <p className="m-0 flex-1 font-medium text-sm">{task.name}</p>
                                        </div>
                                        {task.owner && <div>{task.owner.name?.slice(0, 2)}</div>}
                                    </div>
                                    <p className="m-0 text-muted-foreground text-xs">
                                        {shortDateFormatter.format(task.startAt)} - {dateFormatter.format(task.endAt)}
                                    </p>
                                </KanbanCard>
                            )}
                        </KanbanCards>
                    </KanbanBoard>
                )}
            </KanbanProvider>
        </div>
    );
}
