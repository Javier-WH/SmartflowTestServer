type AlertType = 'error' | 'success';

export default function AlertMessage(props: { text: string; type?: AlertType }) {
    return (
        <span className={`${props.type === 'success' ? 'text-green-500' : 'text-red-500'} text-sm text-center my-1`}>
            {props.text}
        </span>
    );
}
