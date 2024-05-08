export const calculateOffsetAndLimit = (currentPage) => {
    return {offset: (currentPage - 1) * 20, limit: 20};
}
