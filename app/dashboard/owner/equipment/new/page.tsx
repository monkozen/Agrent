
"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";

type Category = {
  id: number;
  name: string;
};

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png"];

const input =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20";

const Field = ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) => (
  <div>
    <label className="mb-1 block text-sm font-medium text-gray-700">
      {label}
    </label>
    {children}
  </div>
);

export default function AddEquipmentPage() {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoryError, setCategoryError] = useState("");

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [horsepower, setHorsepower] = useState("");
  const [capacity, setCapacity] = useState("");
  const [activities, setActivities] = useState("");
  const [crops, setCrops] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = selectedImages.map((file) => URL.createObjectURL(file));

    setPreviewUrls(urls);

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedImages]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [uploadWarning, setUploadWarning] = useState("");

  useEffect(() => {
    async function loadCategories() {
      const { data, error } = await supabase
        .from("equipment_categories")
        .select("id, name")
        .order("name");

      if (error) {
        setCategoryError(error.message);
      } else {
        setCategories(data ?? []);
      }

      setCategoriesLoading(false);
    }

    loadCategories();
  }, [supabase]);

  function handleImageSelection(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    setError("");
    setUploadWarning("");
    setSaved(false);

    const files = Array.from(e.target.files ?? []);

    const invalidFile = files.find(
      (file) =>
        !ALLOWED_TYPES.includes(file.type) ||
        file.size > MAX_FILE_SIZE
    );

    if (invalidFile) {
      setError(
        "Only JPEG and PNG images are allowed. Each image must be 5 MB or smaller."
      );
      e.target.value = "";
      return;
    }

    const newFiles = files.filter(
      (file) =>
        !selectedImages.some(
          (existing) =>
            existing.name === file.name &&
            existing.size === file.size &&
            existing.lastModified === file.lastModified
        )
    );

    if (selectedImages.length + newFiles.length > MAX_IMAGES) {
      setError(`You can select a maximum of ${MAX_IMAGES} images.`);
      e.target.value = "";
      return;
    }

    setSelectedImages((previous) => [...previous, ...newFiles]);

    e.target.value = "";
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSaved(false);

    // Require at least one equipment image
    if (selectedImages.length === 0) {
      setError("Please upload at least one equipment image.");
      return;
    }

    if (selectedImages.length > MAX_IMAGES) {
      setError(`You can select a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("You must be logged in to add equipment.");
      }

      const activityList = activities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const cropList = crops
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      // Save the equipment first so we can get its ID.
      const { data: equipment, error: insertError } = await supabase
        .from("equipment")
        .insert({
          owner_id: user.id,
          category_id: Number(categoryId),
          name: name.trim(),
          brand: brand.trim() || null,
          model: model.trim() || null,
          horsepower: horsepower ? Number(horsepower) : null,
          capacity: capacity.trim() || null,
          supported_activity: activityList,
          supported_crop: cropList,
          rental_price: Number(price),
          pricing_unit: "day",
          location: location.trim(),
          equipment_condition: condition || null,
          description: description.trim() || null,
          status: "pending",
        })
        .select("id")
        .single();

      if (insertError) {
        throw insertError;
      }

      // Upload selected images and save their storage paths.
      if (selectedImages.length > 0) {
        try {
          for (let index = 0; index < selectedImages.length; index++) {
            const file = selectedImages[index];

            const safeFileName = file.name.replace(
              /[^a-zA-Z0-9._-]/g,
              "_"
            );

            const filePath = `${user.id}/${equipment.id}/${crypto.randomUUID()}-${safeFileName}`;

            const { error: uploadError } = await supabase.storage
              .from("equipment-images")
              .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
                contentType: file.type,
              });

              if (uploadError) {
                throw new Error(`Storage upload failed: ${uploadError.message}`);
              }

            const { error: imageRecordError } = await supabase
              .from("equipment_images")
              .insert({
                equipment_id: equipment.id,
                image_url: filePath,
                is_primary: index === 0,
              });

            if (imageRecordError) {
              throw new Error(
                `Saving image record failed: ${imageRecordError.message}`
              );
            }
          }
        } catch (imageError) {
          setUploadWarning(
            imageError instanceof Error
              ? `Your equipment was saved, but an image could not be uploaded: ${imageError.message}`
              : "Your equipment was saved, but an image could not be uploaded."
          );
        }
      }

      setSaved(true);

      // Clear the form after the equipment record is saved.
      setName("");
      setCategoryId("");
      setBrand("");
      setModel("");
      setHorsepower("");
      setCapacity("");
      setActivities("");
      setCrops("");
      setPrice("");
      setLocation("");
      setCondition("");
      setDescription("");
      setSelectedImages([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving equipment."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardLayout role="owner" userName="Maria Santos">
      <h1 className="text-2xl font-semibold text-gray-900">
        Add New Equipment
      </h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-6 lg:grid-cols-[1fr_2fr]"
      >
        <section className="h-fit rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-gray-900">
            Equipment Images *
          </h2>

          <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
            <p className="mb-3 text-sm text-gray-600">
              Select images of your equipment.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              multiple
              onChange={handleImageSelection}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-green-50 file:px-4 file:py-2 file:font-medium file:text-green-700 hover:file:bg-green-100"
            />

            <p className="mt-3 text-xs text-gray-500">
                At least 1 image is required. 
                You can upload up to 5 JPEG or PNG images.
                Maximum file size: 5 MB each.
            </p>
          </div>

          {selectedImages.length > 0 && (
            <div className="mt-4">
              <p className="mb-3 text-sm font-medium text-gray-700">
                Selected images ({selectedImages.length}/{MAX_IMAGES})
              </p>

              <div className="grid grid-cols-2 gap-3">
                {selectedImages.map((file, index) => (
                  <div
                    key={`${file.name}-${file.lastModified}-${index}`}
                    className="overflow-hidden rounded-lg border border-gray-200"
                  >
                    <div className="aspect-square bg-gray-100">
                      {previewUrls[index] && (
                        <img
                          src={previewUrls[index]}
                          alt={`Equipment preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>

                    <div className="p-2">
                      <p className="truncate text-xs text-gray-700">
                        {file.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>

                      {index === 0 && (
                        <p className="mt-1 text-xs font-medium text-green-700">
                          Primary image
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedImages((previous) =>
                            previous.filter((_, i) => i !== index)
                          )
                        }
                        className="mt-2 text-xs font-medium text-red-600 hover:text-red-800"
                      >
                        Remove image
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="font-semibold text-gray-900">
            Equipment Information
          </h2>
          <p className="text-xs text-gray-500">
            Fields marked with * are required.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name *">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={input}
                placeholder="Kubota M7040"
              />
            </Field>

            <Field label="Category *">
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className={input}
                disabled={categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? "Loading categories..." : "Select category"}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {categoryError && (
                <p className="mt-1 text-xs text-red-600">
                  {categoryError}
                </p>
              )}
            </Field>

            <Field label="Brand">
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className={input}
                placeholder="Kubota"
              />
            </Field>

            <Field label="Model">
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className={input}
                placeholder="M7040"
              />
            </Field>

            <Field label="Horsepower">
              <input
                type="number"
                min="0"
                value={horsepower}
                onChange={(e) => setHorsepower(e.target.value)}
                className={input}
              />
            </Field>

            <Field label="Capacity">
              <input
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className={input}
                placeholder="e.g. 2 tons"
              />
            </Field>

            <Field label="Rental Price (₱ per day) *">
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={input}
              />
            </Field>

            <Field label="Equipment Condition *">
              <select
              required
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className={input}
              >
                <option value="">Select condition</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </Field>
          </div>

          <Field label="Supported Activities">
            <input
              value={activities}
              onChange={(e) => setActivities(e.target.value)}
              className={input}
              placeholder="Land Preparation, Planting, Harvesting"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate multiple activities with commas.
            </p>
          </Field>

          <Field label="Supported Crops">
            <input
              value={crops}
              onChange={(e) => setCrops(e.target.value)}
              className={input}
              placeholder="Rice, Corn, Vegetables"
            />
            <p className="mt-1 text-xs text-gray-500">
              Separate multiple crops with commas.
            </p>
          </Field>

          <Field label="Location *">
            <input
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={input}
              placeholder="Nasugbu, Batangas"
            />
          </Field>

          <Field label="Description *">
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={input}
              placeholder="Describe the equipment, its features, and its condition..."
            />
          </Field>

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          {saved && (
            <p role="status" className="text-sm text-green-700">
              Equipment details saved successfully! Your listing is pending
              admin approval.
            </p>
          )}

          {uploadWarning && (
            <p role="alert" className="text-sm text-amber-700">
              {uploadWarning}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || categoriesLoading || categories.length === 0}
              className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Equipment"}
            </button>
          </div>
        </section>
      </form>
    </DashboardLayout>
  );
}
