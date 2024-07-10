import Table from '@/modules/shared/components/Table/Table';
import { Button, useDisclosure } from '@nextui-org/react';

import NewProduct from './NewProduct';

export default function Inventory() {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
        <>
            <Table
                tableId="inventory-table-columns"
                data={[]}
                exportData={[]}
                columns={[]}
                loading={false}
                pagination
                paginationTotalRows={0}
                rowsPerPage={50}
                onRowsPerPageChange={() => {}}
                onPaginationChange={() => {}}
                page={1}
                sortServer
                exportToCsv
                initialVisibleColumns={[]}
                actions={
                    <div className="flex justify-center xl:justify-end items-center gap-4 flex-wrap">
                        <Button radius="full" color="default" onClick={onOpen}>
                            Nuevo Producto
                        </Button>
                    </div>
                }
            />
            <NewProduct isOpen={isOpen} onClose={onClose} />
        </>
    );
}
