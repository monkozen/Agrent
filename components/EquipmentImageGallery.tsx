
"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Package, X } from "lucide-react";

type GalleryImage = {
    id?: string;
    url: string;
};

type Props = {
    images: GalleryImage[];
    alt: string;
};

export default function EquipmentImageGallery({ images, alt }: Props) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    const hasImages = images.length > 0;

    function showPrevious() {
        setActiveIndex((current) =>
            current === 0 ? images.length - 1 : current - 1
        );
    }

    function showNext() {
        setActiveIndex((current) =>
            current === images.length - 1 ? 0 : current + 1
        );
    }

    useEffect(() => {
        if (!isViewerOpen) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsViewerOpen(false);
            } else if (event.key === "ArrowLeft") {
                setActiveIndex((current) =>
                    current === 0 ? images.length - 1 : current - 1
                );
            } else if (event.key === "ArrowRight") {
                setActiveIndex((current) =>
                    current === images.length - 1 ? 0 : current + 1
                );
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isViewerOpen, images.length]);

    if (!hasImages) {
        return (
            <div className="flex h-80 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
                <Package size={56} />
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3">
                {/* Main image */}
                <button
                    type="button"
                    onClick={() => setIsViewerOpen(true)}
                    className="block w-full cursor-zoom-in overflow-hidden rounded-xl bg-gray-100"
                    aria-label="View full-size image"
                >
                    <img
                        src={images[activeIndex].url}
                        alt={alt}
                        className="h-80 w-full object-cover transition hover:opacity-90"
                    />
                </button>

                {/* Thumbnails */}
                {images.length > 1 && (
                    <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
                        {images.map((image, index) => (
                            <button
                                key={image.id ?? `${image.url}-${index}`}
                                type="button"
                                onClick={() => setActiveIndex(index)}
                                className={`overflow-hidden rounded-lg border-2 ${activeIndex === index
                                        ? "border-green-600"
                                        : "border-transparent"
                                    }`}
                                aria-label={`Show image ${index + 1}`}
                            >
                                <img
                                    src={image.url}
                                    alt={`${alt} ${index + 1}`}
                                    className="h-20 w-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Full-size image viewer */}
            {isViewerOpen && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
                    onClick={() => setIsViewerOpen(false)}
                >
                    {/* Close button */}
                    <button
                        type="button"
                        onClick={() => setIsViewerOpen(false)}
                        className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                        aria-label="Close image viewer"
                    >
                        <X size={26} />
                    </button>

                    {/* Previous image */}
                    {images.length > 1 && (
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                showPrevious();
                            }}
                            className="absolute left-3 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:left-6"
                            aria-label="Previous image"
                        >
                            <ChevronLeft size={32} />
                        </button>
                    )}

                    {/* Full-size image */}
                    <img
                        src={images[activeIndex].url}
                        alt={alt}
                        onClick={(event) => event.stopPropagation()}
                        className="max-h-[85vh] max-w-[85vw] object-contain"
                    />

                    {/* Next image */}
                    {images.length > 1 && (
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                showNext();
                            }}
                            className="absolute right-3 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:right-6"
                            aria-label="Next image"
                        >
                            <ChevronRight size={32} />
                        </button>
                    )}

                    {/* Image counter */}
                    <p className="absolute bottom-5 text-sm text-white">
                        {activeIndex + 1} / {images.length}
                    </p>
                </div>
            )}
        </>
    );
}
