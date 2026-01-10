import { useState } from 'react';
import { Key, FileText, Link2, Image, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AddPasswordForm } from '@/components/forms/AddPasswordForm';
import { AddNoteForm } from '@/components/forms/AddNoteForm';
import { AddLinkForm } from '@/components/forms/AddLinkForm';
import { AddImageForm } from '@/components/forms/AddImageForm';
import { useAddVaultEntry } from '@/services/useVault';
import type { CreateVaultEntryInput } from '@/types/vault';

interface AddEntryDialogProps {
  userId: string;
}

export const AddEntryDialog = ({ userId }: AddEntryDialogProps) => {
  const [open, setOpen] = useState(false);
  const { mutate: addEntry, isPending } = useAddVaultEntry();

  const handleSubmit = (input: CreateVaultEntryInput) => {
    addEntry(
      { userId, input },
      {
        onSuccess: () => {
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Entry</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Entry</DialogTitle>
          <DialogDescription>
            All data is encrypted before leaving your device
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="password" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="password" className="gap-2">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">Password</span>
            </TabsTrigger>
            <TabsTrigger value="note" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Note</span>
            </TabsTrigger>
            <TabsTrigger value="link" className="gap-2">
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Link</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="gap-2">
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Image</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="password" className="mt-4">
            <AddPasswordForm onSubmit={handleSubmit} isLoading={isPending} />
          </TabsContent>

          <TabsContent value="note" className="mt-4">
            <AddNoteForm onSubmit={handleSubmit} isLoading={isPending} />
          </TabsContent>

          <TabsContent value="link" className="mt-4">
            <AddLinkForm onSubmit={handleSubmit} isLoading={isPending} />
          </TabsContent>

          <TabsContent value="image" className="mt-4">
            <AddImageForm onSubmit={handleSubmit} isLoading={isPending} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
