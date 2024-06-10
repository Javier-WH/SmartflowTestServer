export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getNestedProperty(obj: Record<string, any>, props: string[]) {
    if (props.length === 1) {
        return obj?.[props[0]];
    }
    const prop = props.shift() as string;

    return getNestedProperty(obj[prop], props);
}
