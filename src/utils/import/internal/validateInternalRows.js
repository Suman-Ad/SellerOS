export const validateInternalRows = (
    rows
) => {

    const errors = [];

    rows.forEach(
        (
            row,
            index
        ) => {

            const requiredFields =
                [
                    "category",
                    "subCategory",
                    "productName",
                    "color",
                    "size",
                    "qty",
                    "buyingPrice",
                    "sellingPrice",
                ];

            requiredFields.forEach(
                (
                    field
                ) => {

                    if (
                        row[
                        field
                        ] ===
                        undefined ||
                        row[
                        field
                        ] === ""
                    ) {

                        errors.push({
                            row:
                                index + 1,

                            field,

                            message:
                                `${field} is required`,
                        });
                    }
                }
            );
        }
    );

    return errors;
};