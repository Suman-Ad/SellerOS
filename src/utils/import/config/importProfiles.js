const importProfiles = {

    meesho: {

        orders: {

            orderId: [
                "Sub Order No",
                "Order ID"
            ],

            orderDate: [
                "Order Date",
                "Date",
                "date"
            ],

            parentSKU: [
                "SKU",
                "Seller SKU"
            ],

            productName: [
                "Product Name",
                "Style ID",
            ],

            productId: [
                "Catalog ID",
                "Style ID",
                "Product ID"
            ],

            size: [
                "Size"
            ],

            qty: [
                "Qty",
                "Quantity"
            ],

            sellingPrice: [
                "Supplier Listed Price",
                "Price"
            ],

            customerName: [
                "Customer Name",
                "Customer State"
            ],

            phone: [
                "Phone"
            ],

            awb: [
                "AWB",
                "Packet Id"
            ],

            orderStatus: [
                "Reason for Credit Entry",
                "Order Status"
            ]
        },
        inventory: {

            parentSKU: [
                "STYLE ID",
            ],

            productName: [
                "Product Name",
            ],

            productId: [
                "Catalog Id",
            ],

            size: [
                "Variation",
                "Size"
            ],

            qty: [
                "Your Stock Count",
                "System Stock Count",
                "Qty",
                "Quantity",
                "Inventory"
            ],

            buyingPrice: [
                "Buying Price"
            ],

            sellingPrice: [
                "Supplier Listed Price",
                "Selling Price"
            ]
        },

        pricing: {

            sku: [
                "STYLE ID",
                "Style ID"
            ],

            productName: [
                "PRODUCT NAME"
            ],

            size: [
                "VARIANT",
                "Variation",
                "Size"
            ],

            meeshoPrice: [
                "COMPETITIVE MEESHO PRICE",
                "MEESHO PRICE",
                "Meesho Price"
            ],

            bankSettlementPrice: [
                "BANK SETTLEMENT PRICE",
                "Bank Settlement Price",
                "Settlement Price"
            ],

            action: [
                "ACCEPT/REJECT",
                "ACTION"
            ]
        }
    }
};

export default importProfiles;