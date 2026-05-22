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

                                        <Input
                                            type="number"
                                            placeholder="Selling Price"
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

                                </div>

                            )
                        )}

                    </div>

                </CardContent>

            </Card>

        </div>
    );
}