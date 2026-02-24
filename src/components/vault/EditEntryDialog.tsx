import { useState } from 'react';
import { Pencil } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AddPasswordForm } from '@/components/forms/AddPasswordForm';
import { AddNoteForm } from '@/components/forms/AddNoteForm';
import { AddLinkForm } from '@/components/forms/AddLinkForm';
import { AddImageForm } from '@/components/forms/AddImageForm';
import { useUpdateVaultEntry } from '@/services/useVault';
import type { DecryptedVaultEntry, VaultEntryData } from '@/types/vault';

interface EditEntryDialogProps {
    entry: DecryptedVaultEntry;
}

export const EditEntryDialog = ({ entry }: EditEntryDialogProps) => {
    const [open, setOpen] = useState(false);
    const { mutate: updateEntry, isPending } = useUpdateVaultEntry();

    const handleSubmit = (updatedData: {
        title: string;
        type: string;
        data: any;
        tags?: string[];
        file?: File;
    }) => {
        updateEntry(
            {
                userId: entry.user_id,
                input: {
                    id: entry.id,
                    title: updatedData.title,
                    data: updatedData.data as VaultEntryData,
                    tags: updatedData.tags,
                    file: updatedData.file,
                    oldStoragePath: entry.storage_path || undefined,
                },
            },
            {
                onSuccess: () => {
                    setOpen(false);
                },
            }
        );
    };

    const renderForm = () => {
        switch (entry.type) {
            case 'password':
                return (
                    <AddPasswordForm
                        onSubmit={handleSubmit}
                        isLoading={isPending}
                        initialData={entry}
                    />
                );
            case 'note':
                return (
                    <AddNoteForm
                        onSubmit={handleSubmit}
                        isLoading={isPending}
                        initialData={entry}
                    />
                );
            case 'link':
                return (
                    <AddLinkForm
                        onSubmit={handleSubmit}
                        isLoading={isPending}
                        initialData={entry}
                    />
                );
            case 'image':
            case 'transaction_screenshot':
            case 'password_screenshot':
                return (
                    <AddImageForm
                        onSubmit={handleSubmit}
                        isLoading={isPending}
                        initialData={entry}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                >
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Entry</DialogTitle>
                    <DialogDescription>
                        Update your encrypted entry. Changes are saved securely.
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4">
                    {renderForm()}
                </div>
            </DialogContent>
        </Dialog>
    );
};
