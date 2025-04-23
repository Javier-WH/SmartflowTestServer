import { Input as InputComponent, type InputProps } from '@heroui/react';

export default function Input(props: InputProps) {
    return (
        <InputComponent
            {...props}
            variant="bordered"
            size="lg"
            radius="sm"
            color="primary"
            classNames={{
                inputWrapper: 'border',
            }}
        />
    );
}
