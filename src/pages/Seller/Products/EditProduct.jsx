import { useEffect, useState } from "react";

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

import { toast } from "sonner";

import {
  Plus,
  Trash2,
} from "lucide-react";

export default function EditProduct() {

  const { productId } =
    useParams();

  const navigate = useNavigate();

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [formData, setFormData] =
    useState({
      name: "",
      brand: "",
      category: "",

      variants: [],
    });

  // Fetch product
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

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  // Add Variant
  const addVariant = () => {

    setFormData({
      ...formData,

      variants: [
        ...formData.variants,

        {
          id: Date.now(),

          size: "",
          color: "",

          sku: "",
          barcode: "",

          stock: 0,

          costPrice: 0,
          sellingPrice: 0,
        },
      ],
    });
  };

  // Variant change
  const handleVariantChange = (
    index,
    field,
    value
  ) => {

    const updatedVariants =
      [...formData.variants];

    updatedVariants[index][field] =
      value;

    setFormData({
      ...formData,
      variants:
        updatedVariants,
    });
  };

  // Delete variant
  const removeVariant = (
    index
  ) => {

    const updatedVariants =
      [...formData.variants];

    updatedVariants.splice(
      index,
      1
    );

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

      {/* Header */}
      <div className="flex items-center justify-between mb-6">

        <div>

          <h1 className="text-3xl font-bold text-white">

            Edit Product

          </h1>

          <p className="text-zinc-400 mt-2">

            Manage catalog variants

          </p>

        </div>

        <Button
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

            <Input
              name="name"
              placeholder="Product Name"
              value={
                formData.name
              }
              onChange={
                handleChange
              }
            />

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

            <Input
              name="category"
              placeholder="Category"
              value={
                formData.category
              }
              onChange={
                handleChange
              }
            />

          </div>

        </CardContent>

      </Card>

      {/* Variants */}
      <Card className="bg-zinc-900 border-zinc-800">

        <CardContent className="p-6">

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-xl font-semibold text-white">

              Product Variants

            </h2>

            <Button
              onClick={
                addVariant
              }
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Add Variant
            </Button>

          </div>

          <div className="space-y-4">

            {formData.variants.map(
              (
                variant,
                index
              ) => (

                <div
                  key={variant.id}
                  className="border border-zinc-800 rounded-xl p-4"
                >

                  <div className="grid grid-cols-1 md:grid-cols-7 gap-4">

                    <Input
                      placeholder="Size"
                      value={
                        variant.size
                      }
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "size",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      placeholder="Color"
                      value={
                        variant.color
                      }
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "color",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      placeholder="SKU"
                      value={
                        variant.sku
                      }
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "sku",
                          e.target.value
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
                          index,
                          "barcode",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      type="number"
                      placeholder="Stock"
                      value={
                        variant.stock
                      }
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "stock",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      type="number"
                      placeholder="Price"
                      value={
                        variant.sellingPrice
                      }
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          "sellingPrice",
                          e.target.value
                        )
                      }
                    />

                    <Button
                      variant="destructive"
                      onClick={() =>
                        removeVariant(
                          index
                        )
                      }
                    >
                      <Trash2
                        size={16}
                      />
                    </Button>

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