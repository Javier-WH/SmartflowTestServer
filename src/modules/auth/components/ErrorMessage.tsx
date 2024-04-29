type AlertType = 'error' | 'success';

export default function AlertMessage(props: { text: string; type?: AlertType }) {
    let color = 'red';

    if (props.type === 'success') color = 'green';

    return <p className={`text-${color}-500 text-sm text-center`}>{props.text}</p>;
}
