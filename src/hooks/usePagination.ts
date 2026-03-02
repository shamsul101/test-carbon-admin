/* eslint-disable prefer-const */
import { useState, useMemo } from "react";

export const usePagination = <T>(initialItemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const paginate = (items: T[]) => {
    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      paginatedItems,
      totalItems,
      totalPages,
      startIndex: startIndex + 1,
      endIndex,
    };
  };

  const goToPage = (page: number) => setCurrentPage(page);
  const goToNextPage = (totalPages: number) =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () =>
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = (totalPages: number) => setCurrentPage(totalPages);
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const getPageNumbers = (totalPages: number, currentPage: number) => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(currentPage - half, 1);
      let end = Math.min(start + maxVisiblePages - 1, totalPages);

      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(end - maxVisiblePages + 1, 1);
      }

      for (let i = start; i <= end; i++) pages.push(i);
    }

    return pages;
  };

  return {
    currentPage,
    itemsPerPage,
    paginate,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    handleItemsPerPageChange,
    getPageNumbers,
    setCurrentPage,
  };
};