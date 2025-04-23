import { Button as ButtonComponent, type ButtonProps } from '@heroui/react';

export default function Button(props: ButtonProps) {
    return (
        <ButtonComponent {...props} color="primary" radius="sm">
            {props.children}
        </ButtonComponent>
    );
}
