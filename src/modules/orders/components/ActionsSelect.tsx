import { Button, Select, SelectItem } from '@nextui-org/react';
import { ChevronRight } from 'react-feather';
import { OrderAction } from '../types/types';

const select_items: Array<{ label: string; value: OrderAction }> = [
    {
        label: 'Aceptar',
        value: OrderAction.Accept,
    },
    {
        label: 'Rechazar',
        value: OrderAction.Reject,
    },
    {
        label: 'Escanear',
        value: OrderAction.Scan,
    },
    {
        label: 'Despachar',
        value: OrderAction.ReadyToShip,
    },
];

export default function ActionsSelect({
    onChange,
    buttonDisabled,
    onButtonClick,
}: { onChange: (value: OrderAction | null) => void; buttonDisabled: boolean; onButtonClick: () => void }) {
    return (
        <div className="flex items-center gap-4">
            <Select
                className="w-32 m-0"
                classNames={{
                    trigger: 'shadow-lg',
                }}
                label="Acciones"
                size="sm"
                radius="full"
                selectionMode="single"
                onSelectionChange={keys => {
                    const action = Array.from(keys)[0] as OrderAction;

                    onChange(action ?? null);
                }}
            >
                {select_items.map(item => (
                    <SelectItem key={item.value} className="capitalize">
                        {item.label}
                    </SelectItem>
                ))}
            </Select>
            <Button color="primary" isIconOnly isDisabled={buttonDisabled} onPress={onButtonClick}>
                <ChevronRight />
            </Button>
        </div>
    );
}
