// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useQueryClient } from "@tanstack/react-query";
// import {
//   useListProducts,
//   getListProductsQueryKey,
//   useCreateProduct,
//   useUpdateProduct,
//   useDeleteProduct,
//   getGetFeaturedProductsQueryKey
// } from "@/hooks/api";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";
// import { Edit, Plus, Trash2 } from "lucide-react";
// import { Product } from "@/hooks/api";
// import { AdminLayout } from "@/components/admin/AdminLayout";
// import { formatPKR } from "@/lib/pkr";

// const productSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   description: z.string().optional(),
//   price: z.coerce.number().min(0, "Price must be positive"),
//   originalPrice: z.coerce.number().optional().nullable(),
//   category: z.string().min(1, "Category is required"),
//   imageUrl: z.string().url("Must be a valid URL"),
//   sizes: z.string().min(1, "Sizes required (comma separated)"),
//   colors: z.string().min(1, "Colors required (comma separated)"),
//   stockCount: z.coerce.number().int().min(0).optional(),
//   featured: z.boolean().default(false),
//   inStock: z.boolean().default(true),
// });

// export default function AdminProducts() {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);

//   const { data: products, isLoading } = useListProducts();

//   const invalidate = () => {
//     queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
//     queryClient.invalidateQueries({ queryKey: getGetFeaturedProductsQueryKey() });
//   };

//   const { mutate: createProduct, isPending: isCreating } = useCreateProduct({
//     onSuccess: () => { invalidate(); setIsDialogOpen(false); toast({ title: "Product created" }); },
//     onError: () => toast({ title: "Failed to create product", variant: "destructive" }),
//   });

//   const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct({
//     onSuccess: () => { invalidate(); setIsDialogOpen(false); setEditingProduct(null); toast({ title: "Product updated" }); },
//     onError: () => toast({ title: "Failed to update product", variant: "destructive" }),
//   });

//   const { mutate: deleteProduct } = useDeleteProduct({
//     onSuccess: () => { invalidate(); toast({ title: "Product deleted" }); },
//     onError: () => toast({ title: "Failed to delete product", variant: "destructive" }),
//   });

//   const form = useForm<z.infer<typeof productSchema>>({
//     resolver: zodResolver(productSchema) as any,
//     defaultValues: {
//       name: "", description: "", price: 0, originalPrice: null,
//       category: "", imageUrl: "", sizes: "7,8,9,10,11",
//       colors: "Black,Brown", stockCount: 100, featured: false, inStock: true,
//     },
//   });

//   const openEditDialog = (product: Product) => {
//     setEditingProduct(product);
//     form.reset({
//       name: product.name,
//       description: product.description || "",
//       price: product.price,
//       originalPrice: product.originalPrice,
//       category: product.category,
//       imageUrl: product.imageUrl,
//       sizes: product.sizes.join(","),
//       colors: product.colors.join(","),
//       stockCount: product.stockCount,
//       featured: product.featured || false,
//       inStock: product.inStock,
//     });
//     setIsDialogOpen(true);
//   };

//   const openCreateDialog = () => {
//     setEditingProduct(null);
//     form.reset({
//       name: "", description: "", price: 0, originalPrice: null,
//       category: "", imageUrl: "", sizes: "7,8,9,10,11",
//       colors: "Black,Brown", stockCount: 100, featured: false, inStock: true,
//     });
//     setIsDialogOpen(true);
//   };

//   const onSubmit = (values: z.infer<typeof productSchema>) => {
//     const formattedData = {
//       ...values,
//       sizes: values.sizes.split(",").map(s => s.trim()),
//       colors: values.colors.split(",").map(c => c.trim()),
//     };
//     if (editingProduct) {
//       updateProduct({ id: editingProduct.id, data: formattedData as any });
//     } else {
//       createProduct(formattedData as any);
//     }

//     return (
//       <AdminLayout>
//         <div className="max-w-7xl mx-auto">
//           <div className="flex justify-between items-center mb-8">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Products</h1>
//               <p className="text-sm text-gray-500 mt-1">
//                 {products?.length ?? 0} products · visible to all customers
//               </p>
//             </div>
//             <Button onClick={openCreateDialog} className="gap-2">
//               <Plus className="h-4 w-4" /> Add Product
//             </Button>
//           </div>

//           <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//             <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//               <DialogHeader>
//                 <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
//               </DialogHeader>
//               <Form {...form}>
//                 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4">
//                     <FormField control={form.control} name="name" render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Name</FormLabel>
//                         <FormControl><Input {...field} /></FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )} />
//                     <FormField control={form.control} name="category" render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Category</FormLabel>
//                         <FormControl><Input placeholder="boots, sneakers, loafers" {...field} /></FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )} />
//                   </div>

//                   <div className="grid grid-cols-2 gap-4">
//                     <FormField control={form.control} name="price" render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Price (PKR)</FormLabel>
//                         <FormControl><Input type="number" step="1" placeholder="e.g. 14999" {...field} /></FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )} />
//                     <FormField control={form.control} name="originalPrice" render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Original Price (Optional PKR)</FormLabel>
//                         <FormControl><Input type="number" step="1" {...field} value={field.value || ""} /></FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )} />
//                   </div>

//                   <FormField control={form.control} name="imageUrl" render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Image URL</FormLabel>
//                       <FormControl><Input placeholder="https://..." {...field} /></FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )} />

//                   <div className="grid grid-cols-2 gap-4">
//                     <FormField control={form.control} name="sizes" render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Sizes (comma separated)</FormLabel>
//                         <FormControl><Input placeholder="7,8,9,10,11" {...field} /></FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )} />
//                     <FormField control={form.control} name="colors" render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Colors (comma separated)</FormLabel>
//                         <FormControl><Input placeholder="Black,Brown,White" {...field} /></FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )} />
//                   </div>

//                   <FormField control={form.control} name="stockCount" render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Stock Count</FormLabel>
//                       <FormControl><Input type="number" {...field} /></FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )} />

//                   <FormField control={form.control} name="description" render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Description (Optional)</FormLabel>
//                       <FormControl><Input {...field} /></FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )} />

//                   <div className="flex gap-4">
//                     <FormField control={form.control} name="featured" render={({ field }) => (
//                       <FormItem className="flex items-center gap-3 rounded-lg border p-4">
//                         <FormControl>
//                           <Checkbox checked={field.value} onCheckedChange={field.onChange} />
//                         </FormControl>
//                         <FormLabel className="cursor-pointer">Featured</FormLabel>
//                       </FormItem>
//                     )} />
//                     <FormField control={form.control} name="inStock" render={({ field }) => (
//                       <FormItem className="flex items-center gap-3 rounded-lg border p-4">
//                         <FormControl>
//                           <Checkbox checked={field.value} onCheckedChange={field.onChange} />
//                         </FormControl>
//                         <FormLabel className="cursor-pointer">In Stock</FormLabel>
//                       </FormItem>
//                     )} />
//                   </div>

//                   <div className="pt-4 flex justify-end">
//                     <Button type="submit" disabled={isCreating || isUpdating}>
//                       {isCreating || isUpdating ? "Saving..." : "Save Product"}
//                     </Button>
//                   </div>
//                 </form>
//               </Form>
//             </DialogContent>
//           </Dialog>

//           {isLoading ? (
//             <div className="h-64 bg-gray-50 animate-pulse rounded-xl" />
//           ) : (
//             <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
//               <Table>
//                 <TableHeader>
//                   <TableRow className="bg-gray-50 border-b border-gray-200">
//                     <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500 w-[72px]">Image</TableHead>
//                     <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500">Name</TableHead>
//                     <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500">Category</TableHead>
//                     <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500">Price (PKR)</TableHead>
//                     <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500">Stock</TableHead>
//                     <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500">Status</TableHead>
//                     <TableHead className="text-xs uppercase tracking-wider font-semibold text-gray-500 text-right">Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {products?.map((product) => (
//                     <TableRow key={product.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
//                       <TableCell>
//                         <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
//                           <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
//                         </div>
//                       </TableCell>
//                       <TableCell>
//                         <div>
//                           <span className="font-semibold text-gray-900 text-sm">{product.name}</span>
//                           {product.featured && (
//                             <span className="ml-2 text-[10px] font-semibold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">FEATURED</span>
//                           )}
//                         </div>
//                       </TableCell>
//                       <TableCell className="capitalize text-sm text-gray-600">{product.category}</TableCell>
//                       <TableCell>
//                         <div>
//                           <span className="font-semibold text-gray-900 text-sm">{formatPKR(product.price)}</span>
//                           {product.originalPrice && (
//                             <span className="ml-2 text-xs text-gray-400 line-through">{formatPKR(product.originalPrice)}</span>
//                           )}
//                         </div>
//                       </TableCell>
//                       <TableCell className="text-sm text-gray-600">{product.stockCount ?? "—"}</TableCell>
//                       <TableCell>
//                         <Badge variant="outline" className={`text-xs ${product.inStock
//                             ? "bg-green-50 text-green-700 border-green-200"
//                             : "bg-red-50 text-red-700 border-red-200"
//                           }`}>
//                           {product.inStock ? "In Stock" : "Out of Stock"}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="text-right">
//                         <div className="flex justify-end gap-2">
//                           <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditDialog(product)}>
//                             <Edit className="h-3.5 w-3.5" />
//                           </Button>
//                           <Button
//                             variant="outline"
//                             size="icon"
//                             className="h-8 w-8 text-red-500 hover:bg-red-50 border-red-200 hover:text-red-600"
//                             onClick={() => {
//                               if (confirm(`Delete "${product.name}"?`)) deleteProduct(product.id);
//                             }}
//                           >
//                             <Trash2 className="h-3.5 w-3.5" />
//                           </Button>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                   {(!products || products.length === 0) && (
//                     <TableRow>
//                       <TableCell colSpan={7} className="text-center py-12 text-gray-400">
//                         No products found. Click "Add Product" to get started.
//                       </TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//           )}
//         </div>
//       </AdminLayout>
//     );
//   }
// }












// import { useState, useCallback, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import { useQueryClient } from "@tanstack/react-query";
// import { useDropzone } from "react-dropzone";
// import {
//   useListProducts,
//   getListProductsQueryKey,
//   useCreateProduct,
//   useUpdateProduct,
//   useDeleteProduct,
//   getGetFeaturedProductsQueryKey,
//   type Product
// } from "@/hooks/api";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
// } from "@/components/ui/dialog";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Checkbox } from "@/components/ui/checkbox";
// import { Badge } from "@/components/ui/badge";
// import { useToast } from "@/hooks/use-toast";
// import { Edit, Plus, Trash2, Upload, X, Image as ImageIcon } from "lucide-react";
// import { AdminLayout } from "@/components/admin/AdminLayout";
// import { formatPKR } from "@/lib/pkr";

// // ── Schema Definition ──────────────────────────────────────
// export const productSchema = z.object({
//   name: z.string().min(1, "Name is required"),
//   description: z.string().optional().nullable(),
//   price: z.coerce.number().min(0, "Price must be positive"),
//   originalPrice: z.coerce.number().min(0).optional().nullable(),
//   category: z.string().min(1, "Category is required"),
//   imageUrl: z.string().url("Must be a valid URL").optional().nullable(),
//   sizes: z.string().min(1, "Sizes required (comma separated)"),
//   colors: z.string().min(1, "Colors required (comma separated)"),
//   stockCount: z.coerce.number().int().min(0).optional().nullable(),
//   featured: z.boolean().default(false),
//   inStock: z.boolean().default(true),
//   additionalImages: z.array(z.string().url()).optional().default([]),
// });

// export type ProductFormValues = z.infer<typeof productSchema>;

// // ── Cloudinary Upload Helper ───────────────────────────────
// // Ye function file ko /api/upload pe bhejta hai
// // Backend Cloudinary pe upload karta hai aur URL return karta hai
// async function uploadToCloudinary(file: File): Promise<string> {
//   const formData = new FormData();
//   formData.append("file", file);

//   const response = await fetch("/api/upload", {
//     method: "POST",
//     body: formData,
//   });

//   if (!response.ok) {
//     const errData = await response.json().catch(() => ({}));
//     throw new Error(errData.error || "Upload failed");
//   }

//   const data = await response.json();
//   return data.url; // Cloudinary ka permanent URL
// }

// // ── Image Upload Helper Component ───────────────────────────
// interface ImageUploadProps {
//   value: string | null | undefined;
//   onChange: (value: string | null) => void;
//   label: string;
// }

// function ImageUpload({ value, onChange, label }: ImageUploadProps) {
//   const [preview, setPreview] = useState<string | null>(null);
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState<string>("");

//   useEffect(() => {
//     if (value && value.startsWith("http")) {
//       setPreview(value);
//     } else if (!value) {
//       setPreview(null);
//     }
//   }, [value]);

//   useEffect(() => {
//     return () => {
//       if (preview && preview.startsWith("blob:")) {
//         URL.revokeObjectURL(preview);
//       }
//     };
//   }, [preview]);

//   const onDrop = useCallback(async (acceptedFiles: File[]) => {
//     setError("");
//     if (acceptedFiles.length === 0) return;

//     const file = acceptedFiles[0];
//     const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

//     if (!validTypes.includes(file.type)) {
//       setError("Only JPG, PNG, WebP, or GIF images allowed");
//       return;
//     }

//     if (file.size > 5 * 1024 * 1024) {
//       setError("Image size must be less than 5MB");
//       return;
//     }

//     // Pehle blob preview dikhao (fast feedback)
//     const objectUrl = URL.createObjectURL(file);
//     setPreview(objectUrl);
//     setUploading(true);

//     try {
//       // Real Cloudinary upload
//       const cloudinaryUrl = await uploadToCloudinary(file);
//       onChange(cloudinaryUrl); // Form mein permanent URL save
//       // Blob preview hatao, Cloudinary URL use karo
//       URL.revokeObjectURL(objectUrl);
//       setPreview(cloudinaryUrl);
//     } catch (err: any) {
//       setError(err.message || "Failed to upload image. Please try again.");
//       console.error("Upload error:", err);
//       URL.revokeObjectURL(objectUrl);
//       setPreview(value || null);
//     } finally {
//       setUploading(false);
//     }
//   }, [onChange, value]);

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"] },
//     maxSize: 5 * 1024 * 1024,
//     multiple: false,
//     disabled: uploading,
//   });

//   const removeImage = () => {
//     if (preview && preview.startsWith("blob:")) {
//       URL.revokeObjectURL(preview);
//     }
//     setPreview(null);
//     onChange(null);
//     setError("");
//   };

//   const displayUrl = preview || value;

//   return (
//     <div className="space-y-3">
//       <FormLabel>{label}</FormLabel>
//       <div
//         {...getRootProps()}
//         className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
//           ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
//           ${uploading ? "opacity-50 cursor-not-allowed" : ""}
//         `}
//       >
//         <input {...getInputProps()} />
//         {uploading ? (
//           <div className="flex flex-col items-center gap-2">
//             <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//             <p className="text-sm text-gray-600">Cloudinary pe upload ho raha hai...</p>
//           </div>
//         ) : isDragActive ? (
//           <div className="flex flex-col items-center gap-2 text-blue-600">
//             <Upload className="w-8 h-8" />
//             <p className="text-sm font-medium">Drop image here...</p>
//           </div>
//         ) : (
//           <div className="flex flex-col items-center gap-2">
//             <Upload className="w-8 h-8 text-gray-400" />
//             <div>
//               <p className="text-sm font-medium text-gray-700">Drag & drop image here</p>
//               <p className="text-xs text-gray-500 mt-1">or click to browse • Max 5MB • JPG, PNG, WebP</p>
//             </div>
//           </div>
//         )}
//       </div>
//       {error && <p className="text-sm text-red-500">{error}</p>}
//       {displayUrl && (
//         <div className="relative inline-block group">
//           <img
//             src={displayUrl}
//             alt="Preview"
//             className="w-32 h-32 object-cover rounded-lg border"
//             onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
//           />
//           <button
//             type="button"
//             onClick={(e) => { e.stopPropagation(); removeImage(); }}
//             className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
//             aria-label="Remove image"
//           >
//             <X className="w-3 h-3" />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Multiple Image Upload Component ─────────────────────────
// interface MultipleImageUploadProps {
//   value: string[];
//   onChange: (value: string[]) => void;
//   label: string;
// }

// function MultipleImageUpload({ value = [], onChange, label }: MultipleImageUploadProps) {
//   const [previews, setPreviews] = useState<Record<string, string>>({});
//   const [uploading, setUploading] = useState(false);
//   const [error, setError] = useState<string>("");

//   useEffect(() => {
//     setPreviews(prev => {
//       const newPreviews = { ...prev };
//       // Existing HTTP URLs ko preview mein add karo
//       value.forEach(url => {
//         if (!newPreviews[url] && url.startsWith("http")) {
//           newPreviews[url] = url;
//         }
//       });
//       // Jo URLs value mein nahi, unke blob revoke karo
//       Object.keys(newPreviews).forEach(key => {
//         if (!value.includes(key) && newPreviews[key]?.startsWith("blob:")) {
//           URL.revokeObjectURL(newPreviews[key]);
//           delete newPreviews[key];
//         }
//       });
//       return newPreviews;
//     });
//   }, [value]);

//   useEffect(() => {
//     return () => {
//       Object.values(previews).forEach(preview => {
//         if (preview.startsWith("blob:")) {
//           URL.revokeObjectURL(preview);
//         }
//       });
//     };
//   }, []);

//   const onDrop = useCallback(async (acceptedFiles: File[]) => {
//     setError("");
//     if (acceptedFiles.length === 0) return;

//     const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
//     const invalidFile = acceptedFiles.find(f => !validTypes.includes(f.type));
//     if (invalidFile) {
//       setError("Only JPG, PNG, WebP, or GIF images allowed");
//       return;
//     }

//     const oversized = acceptedFiles.find(f => f.size > 5 * 1024 * 1024);
//     if (oversized) {
//       setError("Image size must be less than 5MB");
//       return;
//     }

//     setUploading(true);
//     try {
//       const newCloudinaryUrls: string[] = [];

//       for (const file of acceptedFiles) {
//         // Blob preview dikhao
//         const objectUrl = URL.createObjectURL(file);
//         const tempKey = `temp_${file.name}_${Date.now()}`;
//         setPreviews(prev => ({ ...prev, [tempKey]: objectUrl }));

//         // Cloudinary pe upload
//         const cloudinaryUrl = await uploadToCloudinary(file);
//         newCloudinaryUrls.push(cloudinaryUrl);

//         // Blob hatao, permanent URL add karo
//         URL.revokeObjectURL(objectUrl);
//         setPreviews(prev => {
//           const updated = { ...prev };
//           delete updated[tempKey];
//           updated[cloudinaryUrl] = cloudinaryUrl;
//           return updated;
//         });
//       }

//       onChange([...value, ...newCloudinaryUrls]);
//     } catch (err: any) {
//       setError(err.message || "Failed to upload images. Please try again.");
//       console.error("Upload error:", err);
//     } finally {
//       setUploading(false);
//     }
//   }, [onChange, value]);

//   const { getRootProps, getInputProps, isDragActive } = useDropzone({
//     onDrop,
//     accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"] },
//     maxSize: 5 * 1024 * 1024,
//     multiple: true,
//     disabled: uploading,
//   });

//   const removeImage = (index: number) => {
//     const urlToRemove = value[index];
//     if (urlToRemove && previews[urlToRemove]?.startsWith("blob:")) {
//       URL.revokeObjectURL(previews[urlToRemove]);
//     }
//     const newPreviews = { ...previews };
//     delete newPreviews[urlToRemove];
//     setPreviews(newPreviews);
//     onChange(value.filter((_, i) => i !== index));
//   };

//   return (
//     <div className="space-y-3">
//       <FormLabel>{label}</FormLabel>
//       <div
//         {...getRootProps()}
//         className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
//           ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
//           ${uploading ? "opacity-50 cursor-not-allowed" : ""}
//         `}
//       >
//         <input {...getInputProps()} />
//         {uploading ? (
//           <div className="flex flex-col items-center gap-2">
//             <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
//             <p className="text-sm text-gray-600">Cloudinary pe upload ho raha hai...</p>
//           </div>
//         ) : isDragActive ? (
//           <div className="flex flex-col items-center gap-2 text-blue-600">
//             <Upload className="w-8 h-8" />
//             <p className="text-sm font-medium">Drop images here...</p>
//           </div>
//         ) : (
//           <div className="flex flex-col items-center gap-2">
//             <Upload className="w-8 h-8 text-gray-400" />
//             <div>
//               <p className="text-sm font-medium text-gray-700">Drag & drop images here</p>
//               <p className="text-xs text-gray-500 mt-1">or click to browse • Max 5MB each • JPG, PNG, WebP</p>
//             </div>
//           </div>
//         )}
//       </div>
//       {error && <p className="text-sm text-red-500">{error}</p>}
//       {value.length > 0 && (
//         <div className="grid grid-cols-4 gap-2">
//           {value.map((url, index) => {
//             const displayUrl = previews[url] || url;
//             return (
//               <div key={index} className="relative group">
//                 <img
//                   src={displayUrl}
//                   alt={`Preview ${index + 1}`}
//                   className="w-full h-20 object-cover rounded-lg border"
//                   onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
//                 />
//                 <button
//                   type="button"
//                   onClick={(e) => { e.stopPropagation(); removeImage(index); }}
//                   className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
//                   aria-label="Remove image"
//                 >
//                   <X className="w-3 h-3" />
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Main Component ──────────────────────────────────────────
// export default function AdminProducts() {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editingProduct, setEditingProduct] = useState<Product | null>(null);

//   const { data: products, isLoading } = useListProducts();

//   const invalidate = () => {
//     queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
//     queryClient.invalidateQueries({ queryKey: getGetFeaturedProductsQueryKey() });
//   };

//   const { mutate: createProduct, isPending: isCreating } = useCreateProduct({
//     onSuccess: () => { invalidate(); setIsDialogOpen(false); toast({ title: "✅ Product created" }); },
//     onError: () => toast({ title: "❌ Failed to create product", variant: "destructive" }),
//   });

//   const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct({
//     onSuccess: () => { invalidate(); setIsDialogOpen(false); setEditingProduct(null); toast({ title: "✅ Product updated" }); },
//     onError: () => toast({ title: "❌ Failed to update product", variant: "destructive" }),
//   });

//   const { mutate: deleteProduct } = useDeleteProduct({
//     onSuccess: () => { invalidate(); toast({ title: "🗑️ Product deleted" }); },
//     onError: () => toast({ title: "❌ Failed to delete product", variant: "destructive" }),
//   });

//   const form = useForm<ProductFormValues>({
//     resolver: zodResolver(productSchema) as any,
//     defaultValues: {
//       name: "",
//       description: null,
//       price: 0,
//       originalPrice: null,
//       category: "",
//       imageUrl: null,
//       sizes: "7,8,9,10,11",
//       colors: "Black,Brown",
//       stockCount: null,
//       featured: false,
//       inStock: true,
//       additionalImages: [],
//     },
//     mode: "onBlur",
//   });

//   const openEditDialog = (product: Product) => {
//     setEditingProduct(product);
//     form.reset({
//       name: product.name,
//       description: product.description ?? null,
//       price: product.price,
//       originalPrice: product.originalPrice ?? null,
//       category: product.category,
//       imageUrl: product.imageUrl ?? null,
//       sizes: product.sizes?.join(",") || "7,8,9,10,11",
//       colors: product.colors?.join(",") || "Black,Brown",
//       stockCount: product.stockCount ?? null,
//       featured: product.featured ?? false,
//       inStock: product.inStock ?? true,
//       additionalImages: product.additionalImages || [],
//     });
//     setIsDialogOpen(true);
//   };

//   const openCreateDialog = () => {
//     setEditingProduct(null);
//     form.reset({
//       name: "",
//       description: null,
//       price: 0,
//       originalPrice: null,
//       category: "",
//       imageUrl: null,
//       sizes: "7,8,9,10,11",
//       colors: "Black,Brown",
//       stockCount: null,
//       featured: false,
//       inStock: true,
//       additionalImages: [],
//     });
//     setIsDialogOpen(true);
//   };

//   const onSubmit = (values: ProductFormValues) => {
//     if (!editingProduct && !values.imageUrl) {
//       toast({ title: "⚠️ Please upload a product image", variant: "destructive" });
//       return;
//     }

//     const formattedData = {
//       ...values,
//       sizes: values.sizes.split(",").map(s => s.trim()).filter(Boolean),
//       colors: values.colors.split(",").map(c => c.trim()).filter(Boolean),
//       additionalImages: values.additionalImages?.filter(url => url && url.trim()) || [],
//       price: Number(values.price),
//       originalPrice: values.originalPrice ? Number(values.originalPrice) : null,
//       stockCount: values.stockCount ? Number(values.stockCount) : null,
//       imageUrl: values.imageUrl?.trim() ? values.imageUrl : null,
//     };

//     if (editingProduct) {
//       updateProduct({ id: editingProduct.id, data: formattedData as any });
//     } else {
//       createProduct(formattedData as any);
//     }
//   };

//   return (
//     <AdminLayout>
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Products</h1>
//             <p className="text-sm text-gray-500 mt-1">
//               {products?.length ?? 0} products · visible to all customers
//             </p>
//           </div>
//           <Button onClick={openCreateDialog} className="gap-2">
//             <Plus className="h-4 w-4" /> Add Product
//           </Button>
//         </div>

//         {/* Dialog: Create/Edit Product */}
//         <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
//           <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
//             <DialogHeader>
//               <DialogTitle>{editingProduct ? "✏️ Edit Product" : "➕ Add New Product"}</DialogTitle>
//               <DialogDescription>
//                 Fill in the product details below. Drag & drop images to upload.
//               </DialogDescription>
//             </DialogHeader>

//             <Form {...form}>
//               <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

//                 {/* Image Upload Section */}
//                 <div className="p-4 bg-gray-50 rounded-lg border">
//                   <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
//                     <ImageIcon className="w-4 h-4" /> Product Images
//                   </h3>

//                   <FormField
//                     control={form.control}
//                     name="imageUrl"
//                     render={({ field }) => (
//                       <FormItem className="mb-4">
//                         <ImageUpload
//                           label="Main Product Image *"
//                           value={field.value ?? undefined}
//                           onChange={(url) => field.onChange(url)}
//                         />
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />

//                   <FormField
//                     control={form.control}
//                     name="additionalImages"
//                     render={({ field }) => (
//                       <FormItem>
//                         <MultipleImageUpload
//                           label="Additional Images (Optional)"
//                           value={field.value || []}
//                           onChange={(urls) => field.onChange(urls)}
//                         />
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>

//                 {/* Basic Info */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <FormField control={form.control} name="name" render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Product Name *</FormLabel>
//                       <FormControl><Input placeholder="e.g. Classic Leather Boots" {...field} /></FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )} />
//                   <FormField control={form.control} name="category" render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Category *</FormLabel>
//                       <FormControl><Input placeholder="boots, sneakers, loafers" {...field} /></FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )} />
//                 </div>

//                 {/* Pricing */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <FormField control={form.control} name="price" render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Price (PKR) *</FormLabel>
//                       <FormControl>
//                         <Input type="number" step="1" placeholder="e.g. 14999" {...field}
//                           onChange={(e) => { const val = e.target.value; field.onChange(val === "" ? 0 : Number(val)); }}
//                           value={field.value ?? ""} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )} />
//                   <FormField control={form.control} name="originalPrice" render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Original Price (Optional)</FormLabel>
//                       <FormControl>
//                         <Input type="number" step="1" placeholder="For discount display" {...field}
//                           onChange={(e) => { const val = e.target.value; field.onChange(val === "" ? null : Number(val)); }}
//                           value={field.value ?? ""} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )} />
//                 </div>

//                 {/* Variants */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <FormField control={form.control} name="sizes" render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Sizes *</FormLabel>
//                       <FormControl><Input placeholder="7,8,9,10,11" {...field} /></FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )} />
//                   <FormField control={form.control} name="colors" render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Colors *</FormLabel>
//                       <FormControl><Input placeholder="Black,Brown,White" {...field} /></FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )} />
//                 </div>

//                 {/* Stock & Description */}
//                 <div className="grid grid-cols-2 gap-4">
//                   <FormField control={form.control} name="stockCount" render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Stock Count</FormLabel>
//                       <FormControl>
//                         <Input type="number" {...field}
//                           onChange={(e) => { const val = e.target.value; field.onChange(val === "" ? null : Number(val)); }}
//                           value={field.value ?? ""} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )} />
//                   <FormField control={form.control} name="description" render={({ field }) => (
//                     <FormItem>
//                       <FormLabel>Description (Optional)</FormLabel>
//                       <FormControl>
//                         <Input placeholder="Product details..." {...field}
//                           value={field.value ?? ""}
//                           onChange={(e) => field.onChange(e.target.value || null)} />
//                       </FormControl>
//                       <FormMessage />
//                     </FormItem>
//                   )} />
//                 </div>

//                 {/* Toggles */}
//                 <div className="flex gap-4">
//                   <FormField control={form.control} name="featured" render={({ field }) => (
//                     <FormItem className="flex items-center gap-3 rounded-lg border p-4">
//                       <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
//                       <FormLabel className="cursor-pointer font-medium">⭐ Featured Product</FormLabel>
//                     </FormItem>
//                   )} />
//                   <FormField control={form.control} name="inStock" render={({ field }) => (
//                     <FormItem className="flex items-center gap-3 rounded-lg border p-4">
//                       <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
//                       <FormLabel className="cursor-pointer font-medium">✅ In Stock</FormLabel>
//                     </FormItem>
//                   )} />
//                 </div>

//                 {/* Submit */}
//                 <div className="pt-4 flex justify-end gap-3">
//                   <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
//                   <Button type="submit" disabled={isCreating || isUpdating} className="min-w-[120px]">
//                     {isCreating || isUpdating ? (
//                       <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Saving...</>
//                     ) : "💾 Save Product"}
//                   </Button>
//                 </div>

//               </form>
//             </Form>
//           </DialogContent>
//         </Dialog>

//         {/* Products Table */}
//         {isLoading ? (
//           <div className="h-64 bg-gray-50 animate-pulse rounded-xl" />
//         ) : (
//           <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
//             <Table>
//               <TableHeader>
//                 <TableRow className="bg-gray-50 border-b border-gray-200">
//                   <TableHead className="w-[72px]">Image</TableHead>
//                   <TableHead>Name</TableHead>
//                   <TableHead>Category</TableHead>
//                   <TableHead>Price</TableHead>
//                   <TableHead>Stock</TableHead>
//                   <TableHead>Status</TableHead>
//                   <TableHead className="text-right">Actions</TableHead>
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {products?.map((product) => (
//                   <TableRow key={product.id} className="hover:bg-gray-50">
//                     <TableCell>
//                       <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden border">
//                         {product.imageUrl ? (
//                           <img
//                             src={product.imageUrl}
//                             alt={product.name}
//                             className="h-full w-full object-cover"
//                             onError={(e) => {
//                               // Image load na ho to placeholder dikhao
//                               (e.target as HTMLImageElement).src =
//                                 "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23d1d5db' stroke-width='1'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='M21 15l-5-5L5 21'/%3E%3C/svg%3E";
//                             }}
//                           />
//                         ) : (
//                           <div className="h-full w-full flex items-center justify-center">
//                             <ImageIcon className="h-5 w-5 text-gray-300" />
//                           </div>
//                         )}
//                       </div>
//                     </TableCell>
//                     <TableCell>
//                       <div>
//                         <span className="font-semibold text-sm">{product.name}</span>
//                         {product.featured && <Badge variant="secondary" className="ml-2 text-[10px]">FEATURED</Badge>}
//                       </div>
//                     </TableCell>
//                     <TableCell className="capitalize text-sm text-gray-600">{product.category}</TableCell>
//                     <TableCell>
//                       <div>
//                         <span className="font-semibold text-sm">{formatPKR(product.price)}</span>
//                         {product.originalPrice && (
//                           <span className="ml-2 text-xs text-gray-400 line-through">{formatPKR(product.originalPrice)}</span>
//                         )}
//                       </div>
//                     </TableCell>
//                     <TableCell className="text-sm">{product.stockCount ?? "—"}</TableCell>
//                     <TableCell>
//                       <Badge variant="outline" className={product.inStock
//                         ? "bg-green-50 text-green-700 border-green-200"
//                         : "bg-red-50 text-red-700 border-red-200"}>
//                         {product.inStock ? "In Stock" : "Out of Stock"}
//                       </Badge>
//                     </TableCell>
//                     <TableCell className="text-right">
//                       <div className="flex justify-end gap-2">
//                         <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditDialog(product)}>
//                           <Edit className="h-3.5 w-3.5" />
//                         </Button>
//                         <Button
//                           variant="outline" size="icon"
//                           className="h-8 w-8 text-red-500 hover:bg-red-50 border-red-200"
//                           onClick={() => { if (confirm(`Delete "${product.name}"?`)) deleteProduct(product.id); }}
//                         >
//                           <Trash2 className="h-3.5 w-3.5" />
//                         </Button>
//                       </div>
//                     </TableCell>
//                   </TableRow>
//                 ))}
//                 {(!products || products.length === 0) && (
//                   <TableRow>
//                     <TableCell colSpan={7} className="text-center py-12 text-gray-400">
//                       <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
//                       <p>No products found.</p>
//                       <Button variant="link" onClick={openCreateDialog} className="mt-2">+ Add your first product</Button>
//                     </TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </div>
//         )}
//       </div>
//     </AdminLayout>
//   );
// }




import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import { useDropzone } from "react-dropzone";
import {
  useListProducts,
  getListProductsQueryKey,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  getGetFeaturedProductsQueryKey,
  type Product
} from "@/hooks/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Edit, Plus, Trash2, Upload, X, Image as ImageIcon } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { formatPKR } from "@/lib/pkr";

// ── Schema ─────────────────────────────────────────────────
export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "Price must be positive"),
  originalPrice: z.coerce.number().min(0).optional().nullable(),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Must be a valid URL").optional().nullable(),
  sizes: z.string().min(1, "Sizes required (comma separated)"),
  colors: z.string().min(1, "Colors required (comma separated)"),
  stockCount: z.coerce.number().int().min(0).optional().nullable(),
  featured: z.boolean().default(false),
  inStock: z.boolean().default(true),
  additionalImages: z.array(z.string().url()).optional().default([]),
});

export type ProductFormValues = z.infer<typeof productSchema>;

// ── Cloudinary Upload ───────────────────────────────────────
async function uploadToCloudinary(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/upload", { method: "POST", body: formData });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Upload failed");
  }
  const data = await response.json();
  return data.url;
}

// ── Cloudinary Delete ───────────────────────────────────────
async function deleteFromCloudinary(url: string): Promise<void> {
  // Sirf Cloudinary URLs delete karo (blob: ya placeholder nahi)
  if (!url || !url.includes("cloudinary.com")) return;
  try {
    await fetch("/api/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
  } catch (err) {
    console.error("Cloudinary delete error:", err);
  }
}

// ── Single Image Upload Component ──────────────────────────
interface ImageUploadProps {
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  label: string;
}

function ImageUpload({ value, onChange, label }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (value && value.startsWith("http")) setPreview(value);
    else if (!value) setPreview(null);
  }, [value]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError("");
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) { setError("Only JPG, PNG, WebP, or GIF allowed"); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image size must be less than 5MB"); return; }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);
    try {
      const cloudinaryUrl = await uploadToCloudinary(file);
      onChange(cloudinaryUrl);
      URL.revokeObjectURL(objectUrl);
      setPreview(cloudinaryUrl);
    } catch (err: any) {
      setError(err.message || "Failed to upload image. Please try again.");
      URL.revokeObjectURL(objectUrl);
      setPreview(value || null);
    } finally {
      setUploading(false);
    }
  }, [onChange, value]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"] },
    maxSize: 5 * 1024 * 1024,
    multiple: false,
    disabled: uploading,
  });

  const removeImage = async () => {
    if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
    // Cloudinary se bhi delete karo
    if (value) await deleteFromCloudinary(value);
    setPreview(null);
    onChange(null);
    setError("");
  };

  const displayUrl = preview || value;

  return (
    <div className="space-y-3">
      <FormLabel>{label}</FormLabel>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
          ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600">Cloudinary pe upload ho raha hai...</p>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center gap-2 text-blue-600">
            <Upload className="w-8 h-8" />
            <p className="text-sm font-medium">Drop image here...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Drag & drop image here</p>
              <p className="text-xs text-gray-500 mt-1">or click to browse • Max 5MB • JPG, PNG, WebP</p>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {displayUrl && (
        <div className="relative inline-block group">
          <img src={displayUrl} alt="Preview" className="w-32 h-32 object-cover rounded-lg border"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(); }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            aria-label="Remove image">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Multiple Image Upload Component ────────────────────────
interface MultipleImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  label: string;
}

function MultipleImageUpload({ value = [], onChange, label }: MultipleImageUploadProps) {
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setPreviews(prev => {
      const newPreviews = { ...prev };
      value.forEach(url => {
        if (!newPreviews[url] && url.startsWith("http")) newPreviews[url] = url;
      });
      Object.keys(newPreviews).forEach(key => {
        if (!value.includes(key) && newPreviews[key]?.startsWith("blob:")) {
          URL.revokeObjectURL(newPreviews[key]);
          delete newPreviews[key];
        }
      });
      return newPreviews;
    });
  }, [value]);

  useEffect(() => {
    return () => {
      Object.values(previews).forEach(p => { if (p.startsWith("blob:")) URL.revokeObjectURL(p); });
    };
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setError("");
    if (acceptedFiles.length === 0) return;
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (acceptedFiles.find(f => !validTypes.includes(f.type))) { setError("Only JPG, PNG, WebP, or GIF allowed"); return; }
    if (acceptedFiles.find(f => f.size > 5 * 1024 * 1024)) { setError("Image size must be less than 5MB"); return; }

    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of acceptedFiles) {
        const objectUrl = URL.createObjectURL(file);
        const tempKey = `temp_${file.name}_${Date.now()}`;
        setPreviews(prev => ({ ...prev, [tempKey]: objectUrl }));
        const cloudinaryUrl = await uploadToCloudinary(file);
        newUrls.push(cloudinaryUrl);
        URL.revokeObjectURL(objectUrl);
        setPreviews(prev => {
          const updated = { ...prev };
          delete updated[tempKey];
          updated[cloudinaryUrl] = cloudinaryUrl;
          return updated;
        });
      }
      onChange([...value, ...newUrls]);
    } catch (err: any) {
      setError(err.message || "Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [onChange, value]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"] },
    maxSize: 5 * 1024 * 1024,
    multiple: true,
    disabled: uploading,
  });

  const removeImage = async (index: number) => {
    const urlToRemove = value[index];
    if (urlToRemove && previews[urlToRemove]?.startsWith("blob:")) URL.revokeObjectURL(previews[urlToRemove]);
    // Cloudinary se bhi delete karo
    if (urlToRemove) await deleteFromCloudinary(urlToRemove);
    const newPreviews = { ...previews };
    delete newPreviews[urlToRemove];
    setPreviews(newPreviews);
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <FormLabel>{label}</FormLabel>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
          ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600">Cloudinary pe upload ho raha hai...</p>
          </div>
        ) : isDragActive ? (
          <div className="flex flex-col items-center gap-2 text-blue-600">
            <Upload className="w-8 h-8" />
            <p className="text-sm font-medium">Drop images here...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">Drag & drop images here</p>
              <p className="text-xs text-gray-500 mt-1">or click to browse • Max 5MB each • JPG, PNG, WebP</p>
            </div>
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {value.map((url, index) => {
            const displayUrl = previews[url] || url;
            return (
              <div key={index} className="relative group">
                <img src={displayUrl} alt={`Preview ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg border"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  aria-label="Remove image">
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────
export default function AdminProducts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useListProducts();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetFeaturedProductsQueryKey() });
  };

  const { mutate: createProduct, isPending: isCreating } = useCreateProduct({
    onSuccess: () => { invalidate(); setIsDialogOpen(false); toast({ title: "✅ Product created" }); },
    onError: () => toast({ title: "❌ Failed to create product", variant: "destructive" }),
  });

  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct({
    onSuccess: () => { invalidate(); setIsDialogOpen(false); setEditingProduct(null); toast({ title: "✅ Product updated" }); },
    onError: () => toast({ title: "❌ Failed to update product", variant: "destructive" }),
  });

  const { mutate: deleteProduct } = useDeleteProduct({
    onSuccess: () => { invalidate(); toast({ title: "🗑️ Product deleted" }); },
    onError: () => toast({ title: "❌ Failed to delete product", variant: "destructive" }),
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "", description: null, price: 0, originalPrice: null,
      category: "", imageUrl: null, sizes: "7,8,9,10,11",
      colors: "Black,Brown", stockCount: null, featured: false,
      inStock: true, additionalImages: [],
    },
    mode: "onBlur",
  });

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description ?? null,
      price: product.price,
      originalPrice: product.originalPrice ?? null,
      category: product.category,
      imageUrl: product.imageUrl ?? null,
      sizes: product.sizes?.join(",") || "7,8,9,10,11",
      colors: product.colors?.join(",") || "Black,Brown",
      stockCount: product.stockCount ?? null,
      featured: product.featured ?? false,
      inStock: product.inStock ?? true,
      additionalImages: product.additionalImages || [],
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    form.reset({
      name: "", description: null, price: 0, originalPrice: null,
      category: "", imageUrl: null, sizes: "7,8,9,10,11",
      colors: "Black,Brown", stockCount: null, featured: false,
      inStock: true, additionalImages: [],
    });
    setIsDialogOpen(true);
  };

  // Product delete karne pe uski saari images bhi Cloudinary se hatao
  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"?`)) return;
    // Pehle images delete karo Cloudinary se
    if (product.imageUrl) await deleteFromCloudinary(product.imageUrl);
    for (const imgUrl of product.additionalImages || []) {
      await deleteFromCloudinary(imgUrl);
    }
    deleteProduct(product.id);
  };

  const onSubmit = (values: ProductFormValues) => {
    if (!editingProduct && !values.imageUrl) {
      toast({ title: "⚠️ Please upload a product image", variant: "destructive" });
      return;
    }
    const formattedData = {
      ...values,
      sizes: values.sizes.split(",").map(s => s.trim()).filter(Boolean),
      colors: values.colors.split(",").map(c => c.trim()).filter(Boolean),
      additionalImages: values.additionalImages?.filter(url => url && url.trim()) || [],
      price: Number(values.price),
      originalPrice: values.originalPrice ? Number(values.originalPrice) : null,
      stockCount: values.stockCount ? Number(values.stockCount) : null,
      imageUrl: values.imageUrl?.trim() ? values.imageUrl : null,
    };
    if (editingProduct) {
      updateProduct({ id: editingProduct.id, data: formattedData as any });
    } else {
      createProduct(formattedData as any);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-500 mt-1">
              {products?.length ?? 0} products · visible to all customers
            </p>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" /> Add Product
          </Button>
        </div>

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "✏️ Edit Product" : "➕ Add New Product"}</DialogTitle>
              <DialogDescription>Fill in the product details below. Drag & drop images to upload.</DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                <div className="p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> Product Images
                  </h3>
                  <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem className="mb-4">
                      <ImageUpload label="Main Product Image *" value={field.value ?? undefined}
                        onChange={(url) => field.onChange(url)} />
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="additionalImages" render={({ field }) => (
                    <FormItem>
                      <MultipleImageUpload label="Additional Images (Optional)"
                        value={field.value || []} onChange={(urls) => field.onChange(urls)} />
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl><Input placeholder="e.g. Classic Leather Boots" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <FormControl><Input placeholder="boots, sneakers, loafers" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="price" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (PKR) *</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="e.g. 14999" {...field}
                          onChange={(e) => { const val = e.target.value; field.onChange(val === "" ? 0 : Number(val)); }}
                          value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="originalPrice" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Orignal Price</FormLabel>
                      <FormControl>
                        <Input type="number" step="1" placeholder="For discount display" {...field}
                          onChange={(e) => { const val = e.target.value; field.onChange(val === "" ? null : Number(val)); }}
                          value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="sizes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sizes *</FormLabel>
                      <FormControl><Input placeholder="7,8,9,10,11" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="colors" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Colors *</FormLabel>
                      <FormControl><Input placeholder="Black,Brown,White" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="stockCount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Count</FormLabel>
                      <FormControl>
                        <Input type="number" {...field}
                          onChange={(e) => { const val = e.target.value; field.onChange(val === "" ? null : Number(val)); }}
                          value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Product details..." {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value || null)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="flex gap-4">
                  <FormField control={form.control} name="featured" render={({ field }) => (
                    <FormItem className="flex items-center gap-3 rounded-lg border p-4">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="cursor-pointer font-medium">⭐ Featured Product</FormLabel>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="inStock" render={({ field }) => (
                    <FormItem className="flex items-center gap-3 rounded-lg border p-4">
                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <FormLabel className="cursor-pointer font-medium">✅ In Stock</FormLabel>
                    </FormItem>
                  )} />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isCreating || isUpdating} className="min-w-[120px]">
                    {isCreating || isUpdating ? (
                      <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Saving...</>
                    ) : "💾 Save Product"}
                  </Button>
                </div>

              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Products Table */}
        {isLoading ? (
          <div className="h-64 bg-gray-50 animate-pulse rounded-xl" />
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b border-gray-200">
                  <TableHead className="w-[72px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product) => (
                  <TableRow key={product.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden border">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%23d1d5db' stroke-width='1'%3E%3Crect x='3' y='3' width='18' height='18' rx='2'/%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'/%3E%3Cpath d='M21 15l-5-5L5 21'/%3E%3C/svg%3E";
                            }} />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-gray-300" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className="font-semibold text-sm">{product.name}</span>
                        {product.featured && <Badge variant="secondary" className="ml-2 text-[10px]">FEATURED</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize text-sm text-gray-600">{product.category}</TableCell>
                    <TableCell>
                      <div>
                        <span className="font-semibold text-sm">{formatPKR(product.price)}</span>
                        {product.originalPrice && (
                          <span className="ml-2 text-xs text-gray-400 line-through">{formatPKR(product.originalPrice)}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{product.stockCount ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={product.inStock
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-red-50 text-red-700 border-red-200"}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => openEditDialog(product)}>
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="outline" size="icon"
                          className="h-8 w-8 text-red-500 hover:bg-red-50 border-red-200"
                          onClick={() => handleDeleteProduct(product)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!products || products.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-gray-400">
                      <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No products found.</p>
                      <Button variant="link" onClick={openCreateDialog} className="mt-2">+ Add your first product</Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}