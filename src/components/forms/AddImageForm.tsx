import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Upload, X } from 'lucide-react';
import { useState, useCallback } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { VaultType } from '@/types/vault';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  type: z.enum(['image', 'transaction_screenshot', 'password_screenshot']),
  description: z.string().optional(),
  tags: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddImageFormProps {
  onSubmit: (data: {
    title: string;
    type: VaultType;
    data: { description?: string; filename: string };
    tags?: string[];
    file: File;
  }) => void;
  isLoading?: boolean;
}

export const AddImageForm = ({ onSubmit, isLoading }: AddImageFormProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      type: 'image',
      description: '',
      tags: '',
    },
  });

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, []);

  const clearFile = useCallback(() => {
    setFile(null);
    setPreview(null);
  }, []);

  const handleSubmit = (data: FormData) => {
    if (!file) return;

    const tags = data.tags
      ? data.tags.split(',').map((t) => t.trim()).filter(Boolean)
      : undefined;

    onSubmit({
      title: data.title,
      type: data.type,
      data: {
        description: data.description || undefined,
        filename: file.name,
      },
      tags,
      file,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Image title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="image">General Image</SelectItem>
                  <SelectItem value="transaction_screenshot">Transaction Screenshot</SelectItem>
                  <SelectItem value="password_screenshot">Password Screenshot</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>File</FormLabel>
          {preview ? (
            <div className="relative rounded-lg border border-border overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-40 object-cover"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={clearFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-40 rounded-lg border border-dashed border-border cursor-pointer hover:bg-secondary/50 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground">
                Click to upload image
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe this image..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags (comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="receipt, banking" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading || !file}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Upload Encrypted Image
        </Button>
      </form>
    </Form>
  );
};
