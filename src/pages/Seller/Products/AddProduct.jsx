import { useState, useEffect } from "react";

import {
    collection,
    addDoc,
    serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { useAuth } from "@/context/AuthContext";

import useSubscription from "@/hooks/useSubscription";

import {
    Card,
    CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { toast } from "sonner";

import {
    Plus,
    Trash2,
    ArrowLeft,
} from "lucide-react";

import {
    categoryMap,
    sizeCategoryMap,
    productSizeTypeMap,
    colorOptions,
} from "@/utils/categoryMap";

import {
    useNavigate,
} from "react-router-dom";

import logActivity
    from "@/utils/activity/logActivity";


export default function AddProduct() {

    const {
        canCreateProduct,
        remainingProducts,
        hasFeature,
    } = useSubscription();

    const navigate = useNavigate();

    const { user, userData } = useAuth();

    const [loading, setLoading] =
        useState(false);

    const [availableProducts,
        setAvailableProducts] =
        useState([]);

    const [availableSizes,
        setAvailableSizes] =
        useState([]);

    const [batchSeries,
        setBatchSeries] =
        useState(1);


    const [formData, setFormData] =
        useState({

            category: "Men",

            subCategory: "",

            productName: "",

            brand: "",

            color: "Black",

            parentSKU: "",

            variants: {},
        });

    useEffect(() => {

        const products =
            categoryMap[
            formData.category
            ] || [];

        setAvailableProducts(products);

    }, [formData.category]);

    useEffect(() => {

        if (!formData.subCategory)
            return;

        const sizeType =
            productSizeTypeMap?.[
            formData.category
            ]?.[
            formData.subCategory
            ] || "clothing";

        const sizes =
            sizeCategoryMap[
            sizeType
            ] || [];

        setAvailableSizes(sizes);

    }, [
        formData.category,
        formData.subCategory,
    ]);

    const handleChange = (e) => {

        setFormData({
            ...formData,
            [e.target.name]:
                e.target.value,
        });
    };

    const generateParentSKU =
        () => {

            const product =
                `${formData.productName
                    ?.substring(0, 3)
                    .toUpperCase()}-${formData.subCategory
                        ?.substring(0, 3)
                        .toUpperCase()
                }-${formData.color
                    ?.substring(0, 2)
                    .toUpperCase()
                }`;

            const random =
                Math.floor(
                    100 +
                    Math.random() * 900000
                );

            const sku =
                `${product}-${random}`;

            setFormData({
                ...formData,
                parentSKU: sku,
            });
        };


    const generateBatchNo = (
        size
    ) => {

        const now =
            new Date();

        const year =
            now
                .getFullYear()
                .toString()
                .slice(-2);

        const month =
            String(
                now.getMonth() + 1
            ).padStart(2, "0");

        const productPrefix =
            formData.subCategory
                ?.substring(0, 3)
                .toUpperCase();

        const batchNo =
            `${productPrefix}-${year}${month}-${String(
                batchSeries
            ).padStart(3, "0")}-${size}`;

        setBatchSeries(
            prev => prev + 1
        );

        return batchNo;
    };


    const addVariant = (
        size
    ) => {

        const variantSKU =
            `${formData.parentSKU}-${formData.color
                ?.substring(0, 3)
                .toUpperCase()}-${size}`;

        setFormData({
            ...formData,

            variants: {

                ...formData.variants,

                [size]: {

                    size,

                    color: formData.color,

                    sku: variantSKU,
                    skuHistory: [],

                    batchNo:
                        generateBatchNo(size),

                    barcode: "",

                    qty: 0,
                    reservedQty: 0,
                    damagedQty: 0,
                    soldQty: 0,

                    initialQty: 0,

                    lowStockAlert: 0,

                    buyingPrice: 0,

                    sellingPrice: 0,

                    inventoryHistory: [],

                    qrEnabled: true,
                    qrGenerated: false,
                    qrPrinted: false,

                    marketplaces: {

                        meesho: {
                            sellingPrice: 0,
                            mrp: 0,
                        },

                        amazon: {
                            sellingPrice: 0,
                            mrp: 0,
                        },

                        flipkart: {
                            sellingPrice: 0,
                            mrp: 0,
                        },
                    },

                },
            },
        });
    };

    const handleVariantChange = (
        size,
        field,
        value
    ) => {

        setFormData({
            ...formData,

            variants: {

                ...formData.variants,

                [size]: {

                    ...formData.variants[
                    size
                    ],

                    [field]: value,
                },
            },
        });
    };

    const removeVariant = (
        size
    ) => {

        const updatedVariants =
        {
            ...formData.variants,
        };

        delete updatedVariants[size];

        setFormData({
            ...formData,

            variants:
                updatedVariants,
        });
    };

    const downloadTemplate = () => {

        const csv =
            `category,subCategory,productName,brand,color,size,qty,buyingPrice,sellingPrice,barcode,lowStockAlert
Men,Tshirt,Oversized Tee,Zara,Black,M,10,250,599,123456789,5
Men,Tshirt,Oversized Tee,Zara,Black,L,8,250,599,123456780,5
Women,Top,Crop Top,H&M,White,S,12,180,499,987654321,3`;

        const blob = new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;",
            }
        );

        const url =
            window.URL.createObjectURL(
                blob
            );

        const link =
            document.createElement(
                "a"
            );

        link.href = url;

        link.setAttribute(
            "download",
            "selleros_internal_product_template.csv"
        );

        document.body.appendChild(
            link
        );

        link.click();

        document.body.removeChild(
            link
        );
    };

    const handleSubmit =
        async (e) => {

            e.preventDefault();

            try {
                // if (!canCreateProduct) {

                //     toast.error(
                //         "Product limit reached"
                //     );

                //     return;
                // }
                setLoading(true);

                // ========================================
                // Activity Log
                // ========================================

                await logActivity({

                    uid: user.uid,

                    type: "product_upload",

                    title:
                        "Product Upload",

                    description:
                        "User uploaded a new product",

                    meta: {
                        role:
                            userData.role,
                        fullName:
                            userData.fullName,
                        businessName:
                            userData.businessName ||
                            null,
                        subscriptionPlan:
                            userData.subscription.planName ||
                            null,
                    },
                });

                await addDoc(
                    collection(
                        db,
                        "products"
                    ),
                    {
                        sellerId:
                            user.uid,

                        category:
                            formData.category,

                        subCategory:
                            formData.subCategory,

                        productName:
                            formData.productName,

                        brand:
                            formData.brand,

                        color:
                            formData.color,

                        parentSKU:
                            formData.parentSKU,

                        // batchSeries:
                        //     formData.batchSeries,

                        variants:
                            formData.variants,

                        status: "active",

                        createdAt:
                            serverTimestamp(),
                    }
                );

                toast.success(
                    "Product created"
                );

                navigate(
                    "/seller/products"
                );

            } catch (error) {

                console.error(error);

                toast.error(
                    error.message
                );

            } finally {

                setLoading(false);
            }
        };

    return (
        <div className="max-w-7xl mx-auto">
            <button
                onClick={() =>
                    navigate(-1)
                }
                className="w-10 h-10 rounded-xl border border-gray-300 bg-zinc-800 flex items-center justify-center"
            >

                <ArrowLeft size={18} />

            </button>

            <div className="mb-6">

                <h1 className="text-3xl font-bold text-white">

                    Add Product

                </h1>

                <p className="text-zinc-400 mt-2">

                    Create marketplace-ready product catalog

                </p>

                <div className="flex flex-wrap gap-3 mt-4">

                    <Button
                        variant="outline"
                        onClick={() =>
                            navigate(
                                "/seller/products/import-marketplace"
                            )
                        }
                    >
                        Marketplace CSV Upload
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() =>
                            navigate(
                                "/seller/products/import-internal"
                            )
                        }
                    >
                        Internal Bulk Upload
                    </Button>

                    <Button
                        variant="outline"
                        onClick={downloadTemplate}
                    >
                        Download Internal Template
                    </Button>

                </div>

            </div>

            <Card className="bg-zinc-900 border-zinc-800">

                <CardContent className="p-6">

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >

                        {/* Product */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                            <select
                                name="category"
                                value={
                                    formData.category
                                }
                                onChange={
                                    handleChange
                                }
                                className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-white"
                            >

                                {Object.keys(
                                    categoryMap
                                ).map((cat) => (

                                    <option
                                        key={cat}
                                        value={cat}
                                    >
                                        {cat}
                                    </option>

                                ))}

                            </select>

                            <select
                                name="subCategory"
                                value={
                                    formData.subCategory
                                }
                                onChange={
                                    handleChange
                                }
                                className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-white"
                            >

                                <option value="">
                                    Select Product
                                </option>

                                {availableProducts.map(
                                    (
                                        product
                                    ) => (

                                        <option
                                            key={product}
                                            value={
                                                product
                                            }
                                        >
                                            {product}
                                        </option>

                                    )
                                )}

                            </select>

                            <Input
                                name="productName"
                                placeholder="Product Name"
                                value={
                                    formData.productName
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                        </div>

                        {/* Brand + Color */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            <Input
                                name="brand"
                                placeholder="Brand"
                                value={
                                    formData.brand
                                }
                                onChange={
                                    handleChange
                                }
                            />

                            <select
                                name="color"
                                value={
                                    formData.color
                                }
                                onChange={
                                    handleChange
                                }
                                className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-white"
                            >

                                {colorOptions.map(
                                    (
                                        color
                                    ) => (

                                        <option
                                            key={color}
                                            value={color}
                                        >
                                            {color}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                        {/* SKU */}
                        <div className="flex gap-2">

                            <Input
                                name="parentSKU"
                                placeholder="Parent SKU"
                                value={
                                    formData.parentSKU
                                }
                                onChange={
                                    handleChange
                                }
                                required
                            />

                            <Button
                                variant="outline"
                                type="button"
                                onClick={
                                    generateParentSKU
                                }
                            >
                                Generate
                            </Button>

                        </div>

                        {/* Add Variants */}
                        <div>

                            <h2 className="text-xl font-semibold text-white mb-4">

                                Variants

                            </h2>

                            <div className="flex flex-wrap gap-2 mb-6">

                                {availableSizes.map(
                                    (size) => (

                                        <Button
                                            key={size}
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                addVariant(
                                                    size
                                                )
                                            }
                                        >

                                            <Plus
                                                size={16}
                                                className="mr-1"
                                            />

                                            {size}

                                        </Button>

                                    )
                                )}

                            </div>

                            <div className="space-y-4">

                                {Object.entries(
                                    formData.variants
                                ).map(
                                    (
                                        [
                                            size,
                                            variant,
                                        ]
                                    ) => (

                                        <div
                                            key={size}
                                            className="border border-zinc-800 rounded-xl p-4"
                                        >

                                            <div className="flex items-center justify-between mb-4">

                                                <h3 className="text-lg font-semibold text-white">

                                                    {size}

                                                </h3>

                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        removeVariant(
                                                            size
                                                        )
                                                    }
                                                >

                                                    <Trash2
                                                        size={16}
                                                    />

                                                </Button>

                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                                                <Input
                                                    value={
                                                        variant.sku
                                                    }
                                                    disabled
                                                />

                                                <Input
                                                    value={
                                                        variant.batchNo
                                                    }
                                                    disabled
                                                />

                                                <Input
                                                    placeholder="Qty"
                                                    type="number"
                                                    value={
                                                        variant.qty
                                                    }
                                                    onChange={(e) =>
                                                        handleVariantChange(
                                                            size,
                                                            "qty",
                                                            e.target
                                                                .value
                                                        )
                                                    }
                                                />

                                                <Input
                                                    placeholder="Buying Price"
                                                    type="number"
                                                    value={
                                                        variant.buyingPrice
                                                    }
                                                    onChange={(e) =>
                                                        handleVariantChange(
                                                            size,
                                                            "buyingPrice",
                                                            e.target
                                                                .value
                                                        )
                                                    }
                                                />

                                                <Input
                                                    placeholder="Selling Price"
                                                    type="number"
                                                    value={
                                                        variant.sellingPrice
                                                    }
                                                    onChange={(e) =>
                                                        handleVariantChange(
                                                            size,
                                                            "sellingPrice",
                                                            e.target
                                                                .value
                                                        )
                                                    }
                                                />

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                        <Button
                        variant="outline"
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >

                            {loading
                                ? "Creating..."
                                : "Create Product"}

                        </Button>

                    </form>

                </CardContent>

            </Card>

        </div>
    );
}