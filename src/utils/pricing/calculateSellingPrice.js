const calculateSellingPrice = (
    variant = {}
) => {

    const buyingPrice =
        Number(
            variant.buyingPrice || 0
        );

    const marginPercent =
        Number(
            variant.marginPercent || 0
        );

    const gstPercent =
        Number(
            variant.gstPercent || 0
        );

    const extraCosts =
        variant.extraCosts || {};

    const packaging =
        Number(
            extraCosts.packaging || 0
        );

    const labeling =
        Number(
            extraCosts.labeling || 0
        );

    const rto =
        Number(
            extraCosts.rto || 0
        );

    const returnCost =
        Number(
            extraCosts.return || 0
        );

    const advertisement =
        Number(
            extraCosts.advertisement || 0
        );

    const delivery =
        Number(
            extraCosts.delivery || 0
        );

    const others =
        Number(
            extraCosts.others || 0
        );

    // ====================================
    // TOTAL EXTRA COST
    // ====================================

    const totalExtraCost =
        packaging +
        labeling +
        rto +
        returnCost +
        advertisement +
        delivery +
        others;

    // ====================================
    // MARGIN AMOUNT
    // ====================================

    const marginAmount =
        (
            buyingPrice *
            marginPercent
        ) / 100;

    // ====================================
    // BASE PRICE
    // ====================================

    const basePrice =
        buyingPrice +
        marginAmount +
        totalExtraCost;

    // ====================================
    // GST
    // ====================================

    const gstAmount =
        (
            basePrice *
            gstPercent
        ) / 100;

    // ====================================
    // FINAL SELLING PRICE
    // ====================================

    const sellingPrice =
        basePrice +
        gstAmount;

    return {

        buyingPrice,

        marginPercent,

        marginAmount:
            Number(
                marginAmount.toFixed(2)
            ),

        gstPercent,

        gstAmount:
            Number(
                gstAmount.toFixed(2)
            ),

        totalExtraCost:
            Number(
                totalExtraCost.toFixed(2)
            ),

        basePrice:
            Number(
                basePrice.toFixed(2)
            ),

        estimatedProfit:
            Number(
                (
                    sellingPrice -
                    buyingPrice
                ).toFixed(2)
            ),

        sellingPrice:
            Number(
                sellingPrice.toFixed(2)
            ),
    };
};

export default calculateSellingPrice;