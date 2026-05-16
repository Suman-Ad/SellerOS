import { useState } from "react";

import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/firebase/config";

import { useAuth } from "@/context/AuthContext";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  useNavigate,
} from "react-router-dom";

import { toast } from "sonner";

export default function AddProduct() {

  const navigate = useNavigate();

  const { user } = useAuth();

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      name: "",
      sku: "",
      brand: "",
      category: "",
      description: "",

      costPrice: "",
      sellingPrice: "",

      stock: "",

      barcode: "",

      imageUrl: "",

      status: "active",
    });

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

  const generateSKU = () => {

    const random =
      Math.floor(
        1000 +
          Math.random() * 9000
      );

    const sku =
      `SKU-${random}`;

    setFormData({
      ...formData,
      sku,
    });
  };

  const handleSubmit =
    async (e) => {

      e.preventDefault();

      try {

        setLoading(true);

        await addDoc(
          collection(
            db,
            "products"
          ),
          {
            sellerId: user.uid,

            name: formData.name,

            sku: formData.sku,

            brand: formData.brand,

            category:
              formData.category,

            description:
              formData.description,

            costPrice:
              Number(
                formData.costPrice
              ),

            price: Number(
              formData.sellingPrice
            ),

            stock: Number(
              formData.stock
            ),

            barcode:
              formData.barcode,

            imageUrl:
              formData.imageUrl,

            status:
              formData.status,

            marketplaces: {},

            variants: [],

            createdAt:
              serverTimestamp(),
          }
        );

        toast.success(
          "Product created successfully"
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
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-6">

        <h1 className="text-3xl font-bold text-white">

          Add Product

        </h1>

        <p className="text-zinc-400 mt-2">

          Create a new catalog product

        </p>

      </div>

      <Card className="bg-zinc-900 border-zinc-800">

        <CardContent className="p-6">

          <form
            onSubmit={
              handleSubmit
            }
            className="space-y-6"
          >

            {/* Product Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Input
                name="name"
                placeholder="Product Name"
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                required
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

            </div>

            {/* SKU + Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="flex gap-2">

                <Input
                  name="sku"
                  placeholder="SKU"
                  value={
                    formData.sku
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

                <Button
                  type="button"
                  onClick={
                    generateSKU
                  }
                >
                  Generate
                </Button>

              </div>

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

            {/* Description */}
            <Textarea
              name="description"
              placeholder="Product Description"
              value={
                formData.description
              }
              onChange={
                handleChange
              }
            />

            {/* Pricing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <Input
                name="costPrice"
                type="number"
                placeholder="Cost Price"
                value={
                  formData.costPrice
                }
                onChange={
                  handleChange
                }
              />

              <Input
                name="sellingPrice"
                type="number"
                placeholder="Selling Price"
                value={
                  formData.sellingPrice
                }
                onChange={
                  handleChange
                }
              />

              <Input
                name="stock"
                type="number"
                placeholder="Stock Qty"
                value={
                  formData.stock
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* Barcode + Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <Input
                name="barcode"
                placeholder="Barcode"
                value={
                  formData.barcode
                }
                onChange={
                  handleChange
                }
              />

              <Input
                name="imageUrl"
                placeholder="Image URL"
                value={
                  formData.imageUrl
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* Submit */}
            <div className="flex justify-end">

              <Button
                type="submit"
                disabled={loading}
              >

                {loading
                  ? "Creating..."
                  : "Create Product"}

              </Button>

            </div>

          </form>

        </CardContent>

      </Card>

    </div>
  );
}