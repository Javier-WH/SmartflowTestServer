import { Spinner } from '@nextui-org/react';

export default function LoadingOverlay() {
    return (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <Spinner color="primary" size="lg" />
        </div>
    );
}
