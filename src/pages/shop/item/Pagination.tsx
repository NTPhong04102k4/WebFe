import { useCallback } from "react";
import { MdOutlineNavigateBefore, MdOutlineNavigateNext } from "react-icons/md";


interface PaginationProps {
    totalRes: number;
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    maxVisiblePages?: number;
}
export const Pagination: React.FC<PaginationProps> = ({
    totalRes,
    currentPage,
    itemsPerPage,
    onPageChange,
    maxVisiblePages = 5,
}) => {
    const totalPages = Math.ceil(totalRes / itemsPerPage);

    const getPageNumbers = useCallback(() => {
        const pages: (number | string)[] = [];

        if (totalPages <= maxVisiblePages) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        pages.push(1);
        let start = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
        let end = Math.min(totalPages - 1, start + maxVisiblePages - 3);

        if (end === totalPages - 1) {
            start = Math.max(2, end - (maxVisiblePages - 3));
        }

        if (start > 2) {
            pages.push("...");
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (end < totalPages - 1) {
            pages.push("...");
        }

        pages.push(totalPages);
        return pages;
    }, [currentPage, totalPages, maxVisiblePages]);

    if (totalPages <= 1) return null;

    const handlePageClick = (page: number | string) => {
        if (typeof page === "number") {
            onPageChange(page);
        }
    };

    return (
        <div className="flex items-center justify-center gap-2 py-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous page"
            >
                <MdOutlineNavigateBefore size={24} className="text-gray-600" />
            </button>

            <div className="flex gap-2">
                {getPageNumbers().map((page, index) => (
                    <button
        
                        onClick={() => handlePageClick(page)}
                        disabled={page === "..."}
                        className={`w-10 h-10 rounded-lg font-medium ${
                            page === currentPage
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : page === "..."
                                ? "cursor-default"
                                : "bg-gray-100 hover:bg-gray-200"
                        }`}
                        aria-current={page === currentPage ? "page" : undefined}
                    >
                        {page}
                    </button>
                ))}
            </div>

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next page"
            >
                <MdOutlineNavigateNext size={24} className="text-gray-600" />
            </button>
        </div>
    );
};
