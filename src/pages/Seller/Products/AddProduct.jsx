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

import calculateSellingPrice
    from "@/utils/pricing/calculateSellingPrice";

import { incrementProducts } from "@/utils/subscription/SubscriptionUsageTracker";


export default function AddProduct() {

    const {
        canCreateProduct,
        remainingProducts,
        productValidation,
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

            color: "",

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
        const updated = {
            ...formData,
            [e.target.name]: e.target.value,
        };

        updated.productName = [
            updated.brand,
            updated.category,
            updated.subCategory,
            updated.color,
        ]
            .filter(Boolean)
            .join(" ");

        setFormData(updated);
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

                    marginPercent: 0,

                    gstPercent: 0,

                    extraCosts: {

                        packaging: 0,

                        labeling: 0,

                        rto: 0,

                        return: 0,

                        advertisement: 0,

                        delivery: 0,

                        others: 0,
                    },

                    totalExtraCost: 0,

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

        const existingVariant =
            formData.variants[size];

        const updatedVariant = {

            ...existingVariant,
        };

        // ====================================
        // EXTRA COST FIELDS
        // ====================================

        const extraCostFields = [

            "packaging",

            "labeling",

            "rto",

            "return",

            "advertisement",

            "delivery",

            "others",
        ];

        // ====================================
        // UPDATE EXTRA COSTS
        // ====================================

        if (
            extraCostFields.includes(field)
        ) {

            updatedVariant.extraCosts = {

                ...updatedVariant.extraCosts,

                [field]:
                    Number(value),
            };
        }

        // ====================================
        // NORMAL FIELDS
        // ====================================

        else {

            updatedVariant[field] =
                value;
        }

        // ====================================
        // AUTO CALCULATE
        // ====================================

        const pricing =
            calculateSellingPrice(
                updatedVariant
            );

        updatedVariant.totalExtraCost =
            pricing.totalExtraCost;

        updatedVariant.marginAmount =
            pricing.marginAmount;

        updatedVariant.gstAmount =
            pricing.gstAmount;

        updatedVariant.basePrice =
            pricing.basePrice;

        updatedVariant.estimatedProfit =
            pricing.estimatedProfit;

        updatedVariant.sellingPrice =
            pricing.sellingPrice;

        // ====================================
        // UPDATE STATE
        // ====================================

        setFormData({

            ...formData,

            variants: {

                ...formData.variants,

                [size]:
                    updatedVariant,
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

                if (!canCreateProduct) {

                    toast.error(
                        productValidation?.reason ||
                        `Product limit reached`
                    );

                    navigate("/upgrade-plan");

                    return;
                }

                setLoading(true);

                // ========================================
                // Activity Log
                // ========================================

                const productRef = collection(
                    db,
                    "products"
                );

                const variantTypes = Object.keys(formData.variants).length;

                const totalQty = Object.values(formData.variants).reduce(
                    (total, variant) => total + Number(variant.qty || 0),
                    0
                );

                const docRef = await addDoc(productRef, {
                    sellerId: user.uid,
                    category: formData.category,
                    subCategory: formData.subCategory,
                    productName: formData.productName,
                    brand: formData.brand,
                    color: formData.color,
                    parentSKU: formData.parentSKU,
                    variants: formData.variants,
                    status: "active",
                    createdAt: serverTimestamp(),
                });

                await logActivity({
                    uid: user.uid,
                    type: "product_upload",
                    title: "Product Upload",
                    description: `Shop Name:- ${userData?.organizationName || "N/A"
                        } imported ${totalQty} units across ${variantTypes} variants into SellerOS successfully. DB Ref:- ${docRef.id}`,
                    meta: {
                        role: userData?.access?.role,
                        fullName: userData?.fullName,
                        organizationName: userData?.organizationName || null,
                        subscriptionPlan:
                            userData?.subscription?.planName || null,
                    },
                });

                await incrementProducts(
                    user.uid,
                    totalQty,
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

                <div
                    className="
    mt-3
    inline-flex
    items-center
    gap-2
    px-3
    py-2
    rounded-lg
    bg-zinc-800
    text-sm
"
                >

                    <span className="text-zinc-400">
                        Remaining Products:
                    </span>

                    <span
                        className={
                            remainingProducts <= 10
                                ? "text-red-400 font-semibold"
                                : "text-green-400 font-semibold"
                        }
                    >
                        {remainingProducts}
                    </span>

                </div>

                <div className="flex flex-wrap gap-3 mt-4">

                    <Button
                        variant="outline"
                        onClick={() => {

                            if (!canCreateProduct) {

                                toast.error(
                                    productValidation?.reason ||
                                    "Product limit reached"
                                );

                                navigate("/upgrade-plan");

                                return;
                            }

                            navigate(
                                "/seller/products/import-marketplace"
                            );
                        }}
                    >
                        Marketplace CSV Upload
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => {

                            if (!canCreateProduct) {

                                toast.error(
                                    productValidation?.reason ||
                                    "Product limit reached"
                                );

                                navigate("/upgrade-plan");

                                return;
                            }

                            navigate(
                                "/seller/products/import-internal"
                            );
                        }}
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
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <label className="text-sm text-zinc-100">
                                Category
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
                            </label>
                            <label className="text-sm text-zinc-100">
                                Sub Catagory
                                <select
                                    name="subCategory"
                                    value={
                                        formData.subCategory
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-white"
                                    disabled={!formData.category}
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
                            </label>
                            <label className="text-sm text-zinc-100">
                                Brand
                                <Input
                                    name="brand"
                                    placeholder="Brand"
                                    value={
                                        formData.brand
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    disabled={!formData.subCategory}
                                />
                            </label>
                            <label className="text-sm text-zinc-100">
                                Color
                                <select
                                    name="color"
                                    value={
                                        formData.color
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-white"
                                    disabled={!formData.brand}

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
                            </label>
                        </div>

                        {/* Brand + Color */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="text-sm text-zinc-100">
                                Product Name
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
                                    readOnly
                                />
                            </label>
                        </div>

                        {/* SKU */}
                        <div className="flex gap-2">
                            <label className="text-sm text-zinc-100">
                                SKU No
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
                            </label>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={
                                    generateParentSKU
                                }
                                disabled={!formData.color}
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
                                                <label className="text-sm text-zinc-100">
                                                    Variant SKU No
                                                    <Input
                                                        value={
                                                            variant.sku
                                                        }
                                                        disabled
                                                    />
                                                </label>
                                                <label className="text-sm text-zinc-100">
                                                    Batch No
                                                    <Input
                                                        value={
                                                            variant.batchNo
                                                        }
                                                        disabled
                                                    />
                                                </label>
                                                <label className="text-sm text-zinc-100">
                                                    Qty
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
                                                </label>
                                                <label className="text-sm text-zinc-100">
                                                    Buying Price
                                                    <Input
                                                        type="number"
                                                        placeholder="Buying Price"
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
                                                </label>

                                                <label className="text-sm text-zinc-100">
                                                    Margin %
                                                    <Input
                                                        type="number"
                                                        placeholder="Margin %"
                                                        value={
                                                            variant.marginPercent || 0
                                                        }
                                                        onChange={(e) =>
                                                            handleVariantChange(
                                                                size,
                                                                "marginPercent",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </label>

                                                <label className="text-sm text-zinc-100">
                                                    Packaging
                                                    <Input
                                                        type="number"
                                                        placeholder="Packaging"
                                                        value={
                                                            variant.extraCosts
                                                                ?.packaging || 0
                                                        }
                                                        onChange={(e) =>
                                                            handleVariantChange(
                                                                size,
                                                                "packaging",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </label>

                                                <label className="text-sm text-zinc-100">
                                                    Labeling
                                                    <Input
                                                        type="number"
                                                        placeholder="Labeling"
                                                        value={
                                                            variant.extraCosts
                                                                ?.labeling || 0
                                                        }
                                                        onChange={(e) =>
                                                            handleVariantChange(
                                                                size,
                                                                "labeling",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </label>

                                                <label className="text-sm text-zinc-100">
                                                    RTO
                                                    <Input
                                                        type="number"
                                                        placeholder="RTO"
                                                        value={
                                                            variant.extraCosts
                                                                ?.rto || 0
                                                        }
                                                        onChange={(e) =>
                                                            handleVariantChange(
                                                                size,
                                                                "rto",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </label>

                                                <label className="text-sm text-zinc-100">
                                                    Return
                                                    <Input
                                                        type="number"
                                                        placeholder="Return"
                                                        value={
                                                            variant.extraCosts
                                                                ?.return || 0
                                                        }
                                                        onChange={(e) =>
                                                            handleVariantChange(
                                                                size,
                                                                "return",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </label>

                                                <label className="text-sm text-zinc-100">
                                                    Advertisement
                                                    <Input
                                                        type="number"
                                                        placeholder="Advertisement"
                                                        value={
                                                            variant.extraCosts
                                                                ?.advertisement || 0
                                                        }
                                                        onChange={(e) =>
                                                            handleVariantChange(
                                                                size,
                                                                "advertisement",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </label>

                                                <label className="text-sm text-zinc-100">
                                                    Delivery
                                                    <Input
                                                        type="number"
                                                        placeholder="Delivery"
                                                        value={
                                                            variant.extraCosts
                                                                ?.delivery || 0
                                                        }
                                                        onChange={(e) =>
                                                            handleVariantChange(
                                                                size,
                                                                "delivery",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </label>

                                                <label className="text-sm text-zinc-100">
                                                    Others
                                                    <Input
                                                        type="number"
                                                        placeholder="Others"
                                                        value={
                                                            variant.extraCosts
                                                                ?.others || 0
                                                        }
                                                        onChange={(e) =>
                                                            handleVariantChange(
                                                                size,
                                                                "others",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </label>

                                                <label className="text-sm text-zinc-100">
                                                    Total Extra Cost
                                                    <Input
                                                        type="number"
                                                        placeholder="Total Extra Cost"
                                                        value={
                                                            variant.totalExtraCost || 0
                                                        }
                                                        readOnly
                                                    />
                                                </label>

                                                <label className="text-sm text-zinc-100">
                                                    GST %
                                                    <Input
                                                        type="number"
                                                        placeholder="GST %"
                                                        value={
                                                            variant.gstPercent || 0
                                                        }
                                                        onChange={(e) =>
                                                            handleVariantChange(
                                                                size,
                                                                "gstPercent",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </label>

                                                <label className="text-sm text-zinc-100">
                                                    Selling Price
                                                    <Input
                                                        type="number"
                                                        placeholder="Selling Price"
                                                        value={
                                                            variant.sellingPrice
                                                        }
                                                        readOnly
                                                    />
                                                </label>

                                            </div>

                                            <div className="
    mt-6
    grid
    grid-cols-2
    md:grid-cols-6
    gap-4
">

                                                <div className="
        rounded-xl
        bg-zinc-800
        p-4
    ">

                                                    <p className="text-xs text-zinc-400">

                                                        Buying Price

                                                    </p>

                                                    <h3 className="text-lg font-bold text-white mt-1">

                                                        ₹{
                                                            Number(
                                                                variant.buyingPrice || 0
                                                            ).toFixed(2)
                                                        }

                                                    </h3>

                                                </div>

                                                <div className="
        rounded-xl
        bg-zinc-800
        p-4
    ">

                                                    <p className="text-xs text-zinc-400">

                                                        Margin Amount

                                                    </p>

                                                    <h3 className="text-lg font-bold text-cyan-400 mt-1">

                                                        ₹{
                                                            Number(
                                                                variant.marginAmount || 0
                                                            ).toFixed(2)
                                                        }

                                                    </h3>

                                                </div>

                                                <div className="
        rounded-xl
        bg-zinc-800
        p-4
    ">

                                                    <p className="text-xs text-zinc-400">

                                                        Extra Cost

                                                    </p>

                                                    <h3 className="text-lg font-bold text-orange-400 mt-1">

                                                        ₹{
                                                            Number(
                                                                variant.totalExtraCost || 0
                                                            ).toFixed(2)
                                                        }

                                                    </h3>

                                                </div>

                                                <div className="
        rounded-xl
        bg-zinc-800
        p-4
    ">

                                                    <p className="text-xs text-zinc-400">

                                                        GST Amount

                                                    </p>

                                                    <h3 className="text-lg font-bold text-yellow-400 mt-1">

                                                        ₹{
                                                            Number(
                                                                variant.gstAmount || 0
                                                            ).toFixed(2)
                                                        }

                                                    </h3>

                                                </div>

                                                <div className="
        rounded-xl
        bg-zinc-800
        p-4
    ">

                                                    <p className="text-xs text-zinc-400">

                                                        Estimated Profit

                                                    </p>

                                                    <h3 className="text-lg font-bold text-green-400 mt-1">

                                                        ₹{
                                                            Number(
                                                                variant.estimatedProfit || 0
                                                            ).toFixed(2)
                                                        }

                                                    </h3>

                                                </div>

                                                <div className="
        rounded-xl
        bg-gradient-to-r
        from-indigo-500
        to-cyan-500
        p-4
    ">

                                                    <p className="text-xs text-white/80">

                                                        Final Selling Price

                                                    </p>

                                                    <h3 className="text-2xl font-bold text-white mt-1">

                                                        ₹{
                                                            Number(
                                                                variant.sellingPrice || 0
                                                            ).toFixed(2)
                                                        }

                                                    </h3>

                                                </div>

                                            </div>

                                        </div>

                                    )
                                )}

                            </div>

                        </div>

                        <Button
                            variant="outline"
                            type="submit"
                            disabled={
                                loading ||
                                !canCreateProduct
                            }
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