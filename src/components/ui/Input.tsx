import { Input as InputComponent, type InputProps } from '@heroui/react';

export default function Input(props: InputProps) {
    const variant = props.variant ?? 'bordered';
    return (
        <InputComponent
            {...props}
            variant={variant}
            size="md"
            radius="full"
            color="primary"
            classNames={{
                ...props.classNames,
                inputWrapper: 'focus-within:!border-gray-300',
            }}
        />
    );
}
