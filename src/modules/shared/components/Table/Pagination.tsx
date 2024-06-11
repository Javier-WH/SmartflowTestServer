import ResponsivePagination from 'react-responsive-pagination';

function Pagination({
    rowsPerPage,
    totalPages,
    onPageChange,
    currentPage,
    totalEntries = 0,
}: {
    rowsPerPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    currentPage: number;
    totalEntries?: number;
}) {
    const showing = rowsPerPage * (currentPage - 1) + 1;
    const to = showing + rowsPerPage - 1;

    return (
        <div className="flex items-center justify-between">
            <small className="mr-2">{`Mostrando ${showing} a ${to} de ${totalEntries} registros`}</small>
            <ResponsivePagination current={currentPage} total={totalPages} onPageChange={onPageChange} maxWidth={400} />
        </div>
    );
}

export default Pagination;
