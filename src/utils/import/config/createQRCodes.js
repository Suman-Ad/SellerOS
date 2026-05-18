const createQRCodes = async ({
    batchRef,
    operationRef,
    commitBatch,
    item,
    sizeKey,
    quantity,
    options = {}
}) => {

    const sizeData = item.sizes[sizeKey];

    const currentQty =
        Number(sizeData.qty || 0);

    const start =
        currentQty - quantity;

    for (let i = 1; i <= quantity; i++) {

        if (operationRef.current >= 450) {
            await commitBatch();
        }

        const unitNo = start + i;

        const ref =
            doc(collection(db, "qrcodes"));

        batchRef.current.set(ref, {

            stockId: item.id,

            productName:
                item.productName,

            productId:
                item.productId,

            catalogId:
                item.catalogId,

            category:
                item.category || "",

            subCategory:
                item.subCategory || "",

            productType:
                item.productType || "",

            size: sizeKey,

            color:
                item.color || "",

            unitNo,

            uniqueId:
                `${item.productId}-${sizeKey}-${item.id}-${unitNo}`,

            sellingPrice:
                sizeData.sellingPrice || 0,

            status: "available",

            printed: false,

            isOnlineItem:
                options.isOnlineItem || false,

            inventorySource:
                options.inventorySource || "core",

            platform:
                options.platform || "",

            isMarketplaceQR:
                options.isMarketplaceQR || false,

            createdAt:
                serverTimestamp()
        });

        operationRef.current++;
    }
};