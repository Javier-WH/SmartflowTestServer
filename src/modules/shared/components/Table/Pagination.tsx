import ResponsivePagination from 'react-responsive-pagination';

function Pagination({
    rowsPerPage,
    totalPages,
    onPageChange,
    currentPage,
    totalEntries = 0,
    onRowsPerPageChange,
    paginationPerPageOptions,
}: {
    rowsPerPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    currentPage: number;
    totalEntries?: number;
    onRowsPerPageChange: (rowsPerPage: number) => void;
    paginationPerPageOptions: number[];
}) {
    const showing = rowsPerPage * (currentPage - 1) + 1;
    const to = showing + rowsPerPage - 1;

    return (
        <div className="flex items-center justify-between">
            <div className="flex flex-col justify-end items-center">
                {/* <label htmlFor='rows-per-page'>{t('show')}</label> */}
                <label className="flex items-center text-default-400 text-small">
                    Rows per page:
                    <select
                        className="bg-transparent outline-none text-default-400 text-sm"
                        onChange={e => onRowsPerPageChange(Number(e.target.value))}
                        value={rowsPerPage}
                    >
                        {paginationPerPageOptions?.map(rowsPerPage => (
                            <option key={rowsPerPage} value={rowsPerPage}>
                                {rowsPerPage}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <small className="mr-2">{`Mostrando ${showing} a ${to} de ${totalEntries} registros`}</small>
            <ResponsivePagination current={currentPage} total={totalPages} onPageChange={onPageChange} maxWidth={400} />
        </div>
    );
}

export default Pagination;
