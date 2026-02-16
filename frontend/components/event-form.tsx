'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Upload, Minus, Plus, CalendarIcon, MapPin } from 'lucide-react';
import { useRef, useState } from 'react';

import {
    eventFormSchema,
    type EventFormValues,
    EVENT_CATEGORIES,
} from '@/lib/validations/event';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCreateEvent, useUpdateEvent } from '@/lib/hooks/useEventQueries';
import { Event } from '@/types';

interface EventFormProps {
    event?: Event;
    mode: 'create' | 'edit';
}

export function EventForm({ event, mode }: EventFormProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(
        event?.coverImage || null
    );
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);

    const createMutation = useCreateEvent();
    const updateMutation = useUpdateEvent();

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    const form = useForm<EventFormValues>({
        resolver: zodResolver(eventFormSchema),
        defaultValues: {
            title: event?.title || '',
            description: event?.description || '',
            category: event?.category || '',
            city: event?.location?.city || '',
            lat: event?.location?.lat || 0,
            lng: event?.location?.lng || 0,
            startDate: event?.startDate
                ? new Date(event.startDate).toISOString().slice(0, 16)
                : '',
            endDate: event?.endDate
                ? new Date(event.endDate).toISOString().slice(0, 16)
                : '',
            price: event?.price || 0,
            capacity: event?.capacity || 100,
        },
        mode: 'onBlur',
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const buildFormData = (values: EventFormValues, publish: boolean) => {
        const formData = new FormData();
        formData.append('title', values.title);
        formData.append('description', values.description);
        formData.append('category', values.category);
        formData.append('location[city]', values.city);
        formData.append('location[lat]', String(values.lat));
        formData.append('location[lng]', String(values.lng));
        formData.append('startDate', new Date(values.startDate).toISOString());
        formData.append('endDate', new Date(values.endDate).toISOString());
        formData.append('price', String(values.price));
        formData.append('capacity', String(values.capacity));
        formData.append('isPublished', String(publish));
        if (imageFile) {
            formData.append('coverImage', imageFile);
        }
        return formData;
    };

    const onSubmit = async (values: EventFormValues, publish: boolean) => {
        setServerError(null);
        const formData = buildFormData(values, publish);

        try {
            if (mode === 'create') {
                if (!imageFile) {
                    setServerError('Please upload a cover image.');
                    return;
                }
                await createMutation.mutateAsync(formData);
            } else if (event) {
                await updateMutation.mutateAsync({ id: event._id, formData });
            }
            router.push('/organizer/events');
        } catch (err: any) {
            setServerError(err?.message || 'Something went wrong.');
        }
    };

    return (
        <Form {...form}>
            <form className="space-y-8">
                {/* Server Error */}
                {serverError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {serverError}
                    </div>
                )}

                {/* Event Banner Upload */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold">Event Banner</label>
                    <p className="text-xs text-foreground/50">
                        Upload a high-quality cover image. Recommended size 1920×480px.
                    </p>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="relative border-2 border-dashed border-border rounded-xl h-48 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all group overflow-hidden"
                    >
                        {imagePreview ? (
                            <>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                    <p className="text-white text-sm font-medium">
                                        Click to change
                                    </p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                                    <Upload className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-sm font-medium text-foreground/70">
                                    Drag and drop or click to upload
                                </p>
                                <p className="text-xs text-foreground/40 mt-1">
                                    PNG, JPG or WebP. Max 5MB
                                </p>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Event Title */}
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">Event Title</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="e.g. Summer Tech Conference 2024"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Category + Capacity Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold">Category</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select Category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {EVENT_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat} value={cat}>
                                                {cat}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="capacity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold">Capacity</FormLabel>
                                <div className="flex items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            field.onChange(Math.max(1, Number(field.value) - 10))
                                        }
                                        className="h-9 w-9 p-0"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </Button>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={1}
                                            className="text-center"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            field.onChange(Number(field.value) + 10)
                                        }
                                        className="h-9 w-9 p-0"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Description */}
                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">Event Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe your event in detail..."
                                    rows={6}
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Date & Time Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold">
                                    Start Date & Time
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                        <Input
                                            type="datetime-local"
                                            className="pl-10"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-semibold">
                                    End Date & Time
                                </FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                        <Input
                                            type="datetime-local"
                                            className="pl-10"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Location */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold">Venue Location</h3>
                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
                                        <Input
                                            placeholder="Enter full address or venue name"
                                            className="pl-10"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="lat"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-foreground/50">
                                        Latitude
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="any"
                                            placeholder="e.g. 40.7128"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="lng"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-xs text-foreground/50">
                                        Longitude
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            step="any"
                                            placeholder="e.g. -74.0060"
                                            {...field}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                {/* Price */}
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="font-semibold">Ticket Price ($)</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    placeholder="0.00"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <p className="text-xs text-foreground/40 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        Changes are autosaved
                    </p>
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isSubmitting}
                            onClick={form.handleSubmit((values) => onSubmit(values, false))}
                        >
                            Save as Draft
                        </Button>
                        <Button
                            type="button"
                            disabled={isSubmitting}
                            onClick={form.handleSubmit((values) => onSubmit(values, true))}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {isSubmitting
                                ? 'Saving...'
                                : mode === 'create'
                                    ? 'Create Event ✓'
                                    : 'Update Event ✓'}
                        </Button>
                    </div>
                </div>
            </form>
        </Form>
    );
}
