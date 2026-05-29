import {
    useEffect,
    useState,
} from "react";

import {
    doc,
    getDoc,
    updateDoc,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    Card,
    CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
    Plus,
    Trash2,
    ArrowLeft,
} from "lucide-react";

import { toast } from "sonner";

import {
    categoryMap,
    sizeCategoryMap,
    productSizeTypeMap,
    colorOptions,
} from "@/utils/categoryMap";

import calculateSellingPrice
    from "@/utils/pricing/calculateSellingPrice";
import { Label } from "recharts";

export default function EditProduct() {

    const { productId } =
        useParams();

    const navigate = useNavigate();

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [availableProducts,
        setAvailableProducts] =
        useState([]);

    const [availableSizes,
        setAvailableSizes] =
        useState([]);

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

    const [globalPricing,
        setGlobalPricing] =
        useState({

            buyingPrice: 0,

            marginPercent: 0,

            gstPercent: 0,

            packaging: 0,

            labeling: 0,

            rto: 0,

            return: 0,

            advertisement: 0,

            delivery: 0,

            others: 0,
        });


    // Fetch Product
    const fetchProduct =
        async () => {

            try {

                const docRef = doc(
                    db,
                    "products",
                    productId
                );

                const snap =
                    await getDoc(docRef);

                if (!snap.exists()) {

                    toast.error(
                        "Product not found"
                    );

                    return;
                }

                setFormData(
                    snap.data()
                );

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);
            }
        };

    useEffect(() => {
        fetchProduct();
    }, []);

    // Product List
    useEffect(() => {

        const products =
            categoryMap[
            formData.category
            ] || [];

        setAvailableProducts(
            products
        );

    }, [formData.category]);

    // Size Logic
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

    // Handle Change
    const handleChange = (
        e
    ) => {

        setFormData({
            ...formData,

            [e.target.name]:
                e.target.value,
        });
    };

    // Add Variant
    const addVariant = (
        size
    ) => {


        if (
            formData.variants[size]
        ) {

            toast.error(
                "Variant already exists"
            );

            return;
        }

        // Copy last variant pricing
        const existingVariants =
            Object.values(
                formData.variants
            );

        const lastVariant =
            existingVariants[
            existingVariants.length - 1
            ];

        const variantSKU =
            `${formData.parentSKU} -${formData.color
                ?.substring(0, 3)
                .toUpperCase()
            } -${size} `;

        // Duplicate SKU protection
        const skuExists =
            existingVariants.some(
                (variant) =>
                    variant.sku ===
                    variantSKU
            );

        if (skuExists) {

            toast.error(
                "SKU already exists"
            );

            return;
        }

        setFormData({
            ...formData,

            variants: {

                ...formData.variants,

                [size]: {

                    size,

                    color:
                        formData.color,

                    sku: variantSKU,

                    skuHistory: [],

                    batchNo:
                        `BATCH - ${Date.now()} `,

                    barcode: "",

                    qty: 0,

                    damagedQty: 0,

                    initialQty: 0,

                    lowStockAlert: 5,

                    buyingPrice:
                        lastVariant?.buyingPrice || 0,

                    marginPercent:
                        lastVariant?.marginPercent || 0,

                    gstPercent:
                        lastVariant?.gstPercent || 0,

                    extraCosts: {

                        packaging:
                            lastVariant?.extraCosts?.packaging || 0,

                        labeling:
                            lastVariant?.extraCosts?.labeling || 0,

                        rto:
                            lastVariant?.extraCosts?.rto || 0,

                        return:
                            lastVariant?.extraCosts?.return || 0,

                        advertisement:
                            lastVariant?.extraCosts?.advertisement || 0,

                        delivery:
                            lastVariant?.extraCosts?.delivery || 0,

                        others:
                            lastVariant?.extraCosts?.others || 0,
                    },

                    totalExtraCost:
                        lastVariant?.totalExtraCost || 0,

                    sellingPrice:
                        lastVariant?.sellingPrice || 0,

                    inventoryHistory: [],

                    qrEnabled: true,

                    qrGenerated: false,

                    qrPrinted: false,

                    marketplaces: {

                        meesho: {
                            sellingPrice:
                                lastVariant
                                    ?.marketplaces
                                    ?.meesho
                                    ?.sellingPrice || 0,

                            mrp:
                                lastVariant
                                    ?.marketplaces
                                    ?.meesho
                                    ?.mrp || 0,

                            shipping:
                                lastVariant
                                    ?.marketplaces
                                    ?.meesho
                                    ?.shipping || 0,

                            commission:
                                lastVariant
                                    ?.marketplaces
                                    ?.meesho
                                    ?.commission || 0,

                            adsCost:
                                lastVariant
                                    ?.marketplaces
                                    ?.meesho
                                    ?.adsCost || 0,
                        },

                        amazon: {
                            sellingPrice: 0,
                            mrp: 0,
                            shipping: 0,
                            commission: 0,
                            adsCost: 0,
                        },

                        flipkart: {
                            sellingPrice: 0,
                            mrp: 0,
                            shipping: 0,
                            commission: 0,
                            adsCost: 0,
                        },
                    },
                },
            },
        });

        toast.success(
            `${size} variant added`
        );


    };



    const regenerateSKU = (
        size
    ) => {

        const oldSKU =
            formData.variants[
                size
            ].sku;

        const newSKU =
            `${formData.parentSKU}-${formData.color
                ?.substring(0, 3)
                .toUpperCase()}-${size}-${Math.floor(
                    100 +
                    Math.random() * 900
                )}`;

        setFormData({
            ...formData,


            variants: {

                ...formData.variants,

                [size]: {

                    ...formData.variants[
                    size
                    ],

                    sku: newSKU,

                    skuHistory: [

                        ...(
                            formData.variants[
                                size
                            ].skuHistory || []
                        ),

                        {
                            oldSKU,

                            changedAt:
                                new Date(),

                            reason:
                                "SKU Regenerated",
                        },
                    ],
                },
            },


        });

        toast.success(
            "SKU regenerated"
        );
    };


    // Variant Change
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

    // Remove Variant
    const removeVariant = (
        size
    ) => {

        const updatedVariants =
        {
            ...formData.variants,
        };

        delete updatedVariants[
            size
        ];

        setFormData({
            ...formData,

            variants:
                updatedVariants,
        });
    };

    // Save
    const handleSave =
        async () => {

            try {

                setSaving(true);

                await updateDoc(
                    doc(
                        db,
                        "products",
                        productId
                    ),
                    {
                        ...formData,
                    }
                );

                toast.success(
                    "Product updated"
                );

                navigate(
                    "/seller/products"
                );

            } catch (error) {

                toast.error(
                    error.message
                );

            } finally {

                setSaving(false);
            }
        };


    const handleGlobalPricingChange = (
        field,
        value
    ) => {

        setGlobalPricing(
            prev => ({

                ...prev,

                [field]:
                    Number(value),
            })
        );
    };

    const applyGlobalPricingToAllVariants =
        () => {

            const updatedVariants =
                {};

            Object.entries(
                formData.variants || {}
            ).forEach(

                ([
                    size,
                    variant,
                ]) => {

                    const updatedVariant = {

                        ...variant,

                        buyingPrice:
                            Number(
                                globalPricing.buyingPrice
                            ),

                        marginPercent:
                            Number(
                                globalPricing.marginPercent
                            ),

                        gstPercent:
                            Number(
                                globalPricing.gstPercent
                            ),

                        extraCosts: {

                            packaging:
                                Number(
                                    globalPricing.packaging
                                ),

                            labeling:
                                Number(
                                    globalPricing.labeling
                                ),

                            rto:
                                Number(
                                    globalPricing.rto
                                ),

                            return:
                                Number(
                                    globalPricing.return
                                ),

                            advertisement:
                                Number(
                                    globalPricing.advertisement
                                ),

                            delivery:
                                Number(
                                    globalPricing.delivery
                                ),

                            others:
                                Number(
                                    globalPricing.others
                                ),
                        },
                    };

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

                    updatedVariants[size] =
                        updatedVariant;
                }
            );

            setFormData({

                ...formData,

                variants:
                    updatedVariants,
            });

            toast.success(
                "Global pricing applied to all variants"
            );
        };

    if (loading) {

        return (
            <div className="text-white">

                Loading...

            </div>
        );
    }

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

            {/* Header */}
            <div className="flex items-center justify-between mb-6">

                <div>

                    <h1 className="text-3xl font-bold text-white">

                        Edit Product

                    </h1>

                    <p className="text-zinc-400 mt-2">

                        Manage catalog inventory

                    </p>

                </div>

                <Button
                    variant="outline"
                    onClick={
                        handleSave
                    }
                    disabled={saving}
                >

                    {saving
                        ? "Saving..."
                        : "Save Product"}

                </Button>

            </div>

            {/* Product Info */}
            <Card className="bg-zinc-900 border-zinc-800 mb-6">

                <CardContent className="p-6">

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                        {/* Category */}
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

                        {/* Product */}
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

                        {/* Name */}
                        <Input
                            name="productName"
                            placeholder="Product Name"
                            value={
                                formData.productName
                            }
                            onChange={
                                handleChange
                            }
                        />

                        {/* Brand */}
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

                        {/* Color */}
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

                        {/* Parent SKU */}
                        <Input
                            name="parentSKU"
                            placeholder="Parent SKU"
                            value={
                                formData.parentSKU
                            }
                            // onChange={
                            //     handleChange
                            // }
                            readOnly
                        />

                    </div>

                </CardContent>

            </Card>

            <Card className="bg-zinc-900 border-zinc-800 mb-6">

                <CardContent className="p-6">

                    <div className="flex items-center justify-between mb-6">

                        <div>

                            <h2 className="text-xl font-semibold text-white">

                                Global Variant Pricing

                            </h2>

                            <p className="text-zinc-400 text-sm mt-1">

                                Apply pricing to all sizes instantly

                            </p>

                        </div>

                        <Button
                            variant="outline"
                            onClick={
                                applyGlobalPricingToAllVariants
                            }
                        >

                            Apply To All Variants

                        </Button>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

                        <label className="text-sm text-zinc-100">
                            Buying Price
                            <Input
                                type="number"
                                placeholder="Buying Price"
                                value={
                                    globalPricing.buyingPrice
                                }
                                onChange={(e) =>
                                    handleGlobalPricingChange(
                                        "buyingPrice",
                                        e.target.value
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
                                    globalPricing.marginPercent
                                }
                                onChange={(e) =>
                                    handleGlobalPricingChange(
                                        "marginPercent",
                                        e.target.value
                                    )
                                }
                            />
                        </label>

                        <label className="text-sm text-zinc-100">
                            GST %
                            <Input
                                type="number"
                                placeholder="GST %"
                                value={
                                    globalPricing.gstPercent
                                }
                                onChange={(e) =>
                                    handleGlobalPricingChange(
                                        "gstPercent",
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
                                    globalPricing.packaging
                                }
                                onChange={(e) =>
                                    handleGlobalPricingChange(
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
                                    globalPricing.labeling
                                }
                                onChange={(e) =>
                                    handleGlobalPricingChange(
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
                                    globalPricing.rto
                                }
                                onChange={(e) =>
                                    handleGlobalPricingChange(
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
                                    globalPricing.return
                                }
                                onChange={(e) =>
                                    handleGlobalPricingChange(
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
                                    globalPricing.advertisement
                                }
                                onChange={(e) =>
                                    handleGlobalPricingChange(
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
                                    globalPricing.delivery
                                }
                                onChange={(e) =>
                                    handleGlobalPricingChange(
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
                                    globalPricing.others
                                }
                                onChange={(e) =>
                                    handleGlobalPricingChange(
                                        "others",
                                        e.target.value
                                    )
                                }
                            />
                        </label>

                    </div>

                </CardContent>

            </Card>

            {/* Variants */}
            <Card className="bg-zinc-900 border-zinc-800">

                <CardContent className="p-6">

                    <div className="flex items-center justify-between mb-6">

                        <h2 className="text-xl font-semibold text-white">

                            Variants

                        </h2>

                        <div className="flex flex-wrap gap-2">

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

                    </div>

                    <div className="space-y-4">

                        {Object.entries(
                            formData.variants ||
                            {}
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

                                        <div>

                                            <h3 className="text-lg font-semibold text-white">

                                                {size}

                                            </h3>

                                            <p className="text-zinc-400 text-sm">

                                                {
                                                    variant.sku
                                                }

                                            </p>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="mt-2"
                                                onClick={() =>
                                                    regenerateSKU(size)
                                                }

                                            >

                                                Regenerate SKU

                                            </Button>


                                        </div>

                                        <Button
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
                                            Qty
                                            <Input
                                                type="number"
                                                placeholder="Qty"
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
                                            Damage Qty
                                            <Input
                                                type="number"
                                                placeholder="Damaged Qty"
                                                value={
                                                    variant.damagedQty
                                                }
                                                onChange={(e) =>
                                                    handleVariantChange(
                                                        size,
                                                        "damagedQty",
                                                        e.target.value
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

                                        <Input
                                            placeholder="Barcode"
                                            value={
                                                variant.barcode
                                            }
                                            onChange={(e) =>
                                                handleVariantChange(
                                                    size,
                                                    "barcode",
                                                    e.target
                                                        .value
                                                )
                                            }
                                        />

                                        <Input
                                            placeholder="Batch No"
                                            value={
                                                variant.batchNo
                                            }
                                            onChange={(e) =>
                                                handleVariantChange(
                                                    size,
                                                    "batchNo",
                                                    e.target.value
                                                )
                                            }
                                        />


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

                </CardContent>

            </Card>

        </div>
    );
}